import { Loader2, Plus } from "lucide-react";
import { forwardRef } from "react";
import { parseRepoUrl, fetchAllFiles, type GitHubItem } from "@/lib/github";
import { type StateSetter, type SavedRepo, type Tab } from "@/types";

interface AddLinkButtonProps {
  loading: boolean;
  repoUrl: string;
  savedRepos: SavedRepo[];
  setRepoUrl: StateSetter<string>;
  setInputError: StateSetter<string>;
  setInputSuccess: StateSetter<string>;
  setLoading: StateSetter<boolean>;
  setFiles: StateSetter<GitHubItem[]>;
  setTabs: StateSetter<Tab[]>;
  setActiveTab: StateSetter<string | null>;
  setSelectedFile: StateSetter<GitHubItem | null>;
  setRepoInfo: StateSetter<{ owner: string; repo: string } | null>;
  setLoadingMsg: StateSetter<string>;
  setSavedRepos: StateSetter<SavedRepo[]>;
  setActiveRepoUrl: StateSetter<string | null>;
  setShowInput: StateSetter<boolean>;
}

export const AddLinkButton = forwardRef<HTMLButtonElement, AddLinkButtonProps>(
  (
    {
      loading,
      repoUrl,
      savedRepos,
      setRepoUrl,
      setInputError,
      setInputSuccess,
      setLoading,
      setFiles,
      setTabs,
      setActiveTab,
      setSelectedFile,
      setRepoInfo,
      setLoadingMsg,
      setSavedRepos,
      setActiveRepoUrl,
      setShowInput,
    },
    ref
  ) => {
    const handleAddLink = async () => {
      const parsed = parseRepoUrl(repoUrl);
      if (!parsed) {
        setInputError("URL inválida. Use: https://github.com/usuario/repositorio");
        setInputSuccess("");
        return;
      }

      // Check duplicate
      if (savedRepos.some((r) => r.owner === parsed.owner && r.repo === parsed.repo)) {
        setInputError("Repositório já adicionado");
        setInputSuccess("");
        return;
      }

      setInputError("");
      setInputSuccess("");
      setLoading(true);
      setFiles([]);
      setTabs([]);
      setActiveTab(null);
      setSelectedFile(null);
      setRepoInfo(parsed);

      try {
        const allFiles = await fetchAllFiles(parsed.owner, parsed.repo, "", setLoadingMsg);
        setFiles(allFiles);

        const newRepo: SavedRepo = {
          url: repoUrl,
          name: parsed.repo,
          owner: parsed.owner,
          repo: parsed.repo,
        };
        setSavedRepos((prev) => [...prev, newRepo]);
        setActiveRepoUrl(repoUrl);
        setInputSuccess("Repositório adicionado com sucesso!");
        setRepoUrl("");
        setTimeout(() => {
          setShowInput(false);
          setInputSuccess("");
        }, 1000);
      } catch (err) {
        setInputError(err.message || "Erro ao buscar repositório");
      } finally {
        setLoading(false);
        setLoadingMsg("");
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleAddLink}
        disabled={loading || !repoUrl.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Adicionar
      </button>
    );
  }
);

AddLinkButton.displayName = "AddLinkButton";

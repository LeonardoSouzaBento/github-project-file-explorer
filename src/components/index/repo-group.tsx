import { FolderGit2, X, Plus } from "lucide-react";
import { fetchAllFiles, type GitHubItem } from "@/lib/github";
import { type SavedRepo, type StateSetter, type Tab } from "@/types";

interface RepoGroupProps {
  savedRepos: SavedRepo[];
  activeRepoUrl: string | null;
  setActiveRepoUrl: StateSetter<string | null>;
  setRepoInfo: StateSetter<{ owner: string; repo: string } | null>;
  setLoading: StateSetter<boolean>;
  setFiles: StateSetter<GitHubItem[]>;
  setTabs: StateSetter<Tab[]>;
  setActiveTab: StateSetter<string | null>;
  setSelectedFile: StateSetter<GitHubItem | null>;
  setLoadingMsg: StateSetter<string>;
  setSavedRepos: StateSetter<SavedRepo[]>;
  setInputError: StateSetter<string>;
  setShowInput: StateSetter<boolean>;
  setInputSuccess: StateSetter<string>;
  inputRef: React.RefObject<HTMLInputElement>;
}

const MAX_BUTTON_CHARS = 18;

function truncateName(name: string) {
  return name.length > MAX_BUTTON_CHARS ? name.slice(0, MAX_BUTTON_CHARS) + "..." : name;
}

export const RepoGroup = ({
  savedRepos,
  activeRepoUrl,
  setActiveRepoUrl,
  setRepoInfo,
  setLoading,
  setFiles,
  setTabs,
  setActiveTab,
  setSelectedFile,
  setLoadingMsg,
  setSavedRepos,
  setInputError,
  setShowInput,
  setInputSuccess,
  inputRef,
}: RepoGroupProps) => {
  const handleSelectRepo = async (repo: SavedRepo) => {
    if (activeRepoUrl === repo.url) return;
    setActiveRepoUrl(repo.url);
    setRepoInfo({ owner: repo.owner, repo: repo.repo });
    setLoading(true);
    setFiles([]);
    setTabs([]);
    setActiveTab(null);
    setSelectedFile(null);

    try {
      const allFiles = await fetchAllFiles(repo.owner, repo.repo, "", setLoadingMsg);
      setFiles(allFiles);
    } catch (err) {
      setInputError(err.message || "Erro ao buscar repositório");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleRemoveRepo = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedRepos((prev) => prev.filter((r) => r.url !== url));
    if (activeRepoUrl === url) {
      setActiveRepoUrl(null);
      setRepoInfo(null);
      setFiles([]);
      setTabs([]);
      setActiveTab(null);
      setSelectedFile(null);
    }
  };

  return (
    <>
      {/* Button group with horizontal scroll */}
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-none px-2 gap-1 min-w-0">
        {savedRepos.map((repo) => (
          <button
            key={repo.url}
            onClick={() => handleSelectRepo(repo)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded shrink-0 transition-colors group ${
              activeRepoUrl === repo.url
                ? "bg-primary text-primary-foreground"
                : "bg-vscode-tab-inactive text-muted-foreground hover:bg-vscode-explorer-hover hover:text-foreground"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
            <span>{truncateName(repo.name)}</span>
            <span
              onClick={(e) => handleRemoveRepo(repo.url, e)}
              className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-accent/50 rounded p-0.5 transition-opacity"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>

      {/* Fixed Add button */}
      <div className="shrink-0 px-2 border-l border-border flex items-center h-full">
        <button
          onClick={() => {
            setShowInput(true);
            setInputError("");
            setInputSuccess("");
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-vscode-explorer-hover rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Adicionar link</span>
        </button>
      </div>
    </>
  );
};

import { CodeViewer } from "@/components/index/code-viewer";
import { AddLinkButton } from "@/components/index/add-link-button";
import { CloseInputButton } from "@/components/index/close-input-button";
import { FileExplorer } from "@/components/index/file-explorer";
import { InputArea } from "@/components/index/input-area";
import { RepoGroup } from "@/components/index/repo-group";
import { StatusBar } from "@/components/index/status-bar";
import { TitleBar } from "@/components/index/title-bar";
import {
  fetchInitialFiles,
  parseRepoUrl,
  type GitHubItem,
  fetchDirectoryContents,
} from "@/lib/github";
import { cn } from "@/lib/utils";
import { type SavedRepo, type Tab } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

const MAX_BUTTON_CHARS = 18;

function truncateName(name: string) {
  return name.length > MAX_BUTTON_CHARS
    ? name.slice(0, MAX_BUTTON_CHARS) + "..."
    : name;
}

// const defaultRepos = [
//   "https://github.com/LeonardoSouzaBento/SupermercadoDoBom",
//   "https://github.com/LeonardoSouzaBento/CatalogoDeRoupas",
//   "https://github.com/LeonardoSouzaBento/GeradorDeCSS ",
//   "https://github.com/LeonardoSouzaBento/Pet-ShopLandingPage",
//   "https://github.com/LeonardoSouzaBento/MeusFilmesFavoritos",
//   "https://github.com/LeonardoSouzaBento/Portifolio",
// ];

const Index = ({
  // repoUrls = defaultRepos,
  // cssWrapper,
  // githubToken = defaultToken,
  repoUrls,
  cssWrapper,
  githubToken,
}: {
  repoUrls?: string[];
  cssWrapper?: string;
  githubToken?: string;
}) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState<GitHubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
  } | null>(null);

  const [selectedFile, setSelectedFile] = useState<GitHubItem | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>([]);
  const [activeRepoUrl, setActiveRepoUrl] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputError, setInputError] = useState("");
  const [inputSuccess, setInputSuccess] = useState("");
  const [previewName, setPreviewName] = useState("");

  const [isSearchingFolder, setIsSearchingFolder] = useState(false);
  const [searchingFolderName, setSearchingFolderName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const addLinkBtnRef = useRef<HTMLButtonElement>(null);

  const updateTreeWithChildren = (
    items: GitHubItem[],
    path: string,
    children: GitHubItem[]
  ): GitHubItem[] => {
    return items.map((item) => {
      if (item.path === path) {
        return { ...item, children };
      }
      if (item.children) {
        return {
          ...item,
          children: updateTreeWithChildren(item.children, path, children),
        };
      }
      return item;
    });
  };

  const handleFolderClick = async (folder: GitHubItem) => {
    if (!repoInfo || folder.children) return;

    setSearchingFolderName(folder.name);
    setIsSearchingFolder(true);

    try {
      const children = await fetchDirectoryContents(
        repoInfo.owner,
        repoInfo.repo,
        folder.path,
        githubToken
      );
      setFiles((prevFiles) =>
        updateTreeWithChildren(prevFiles, folder.path, children)
      );
    } catch (err) {
      console.error("Erro ao buscar conteúdo da pasta:", err);
    } finally {
      setIsSearchingFolder(false);
      setSearchingFolderName("");
    }
  };

  const handleAddRepo = async (url: string) => {
    const parsed = parseRepoUrl(url);
    if (!parsed) {
      setInputError(
        "URL inválida. Use: https://github.com/usuario/repositorio"
      );
      setInputSuccess("");
      return;
    }

    if (
      savedRepos.some((r) => r.owner === parsed.owner && r.repo === parsed.repo)
    ) {
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
      const allFiles = await fetchInitialFiles(
        parsed.owner,
        parsed.repo,
        githubToken,
        setLoadingMsg
      );
      setFiles(allFiles);

      const newRepo: SavedRepo = {
        url: url,
        name: parsed.repo,
        owner: parsed.owner,
        repo: parsed.repo,
      };
      setSavedRepos((prev) => [...prev, newRepo]);
      setActiveRepoUrl(url);
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

  useEffect(() => {
    const initialRepos = repoUrls
      .map((url) => {
        const parsed = parseRepoUrl(url);
        if (!parsed) return null;
        return {
          url,
          name: parsed.repo,
          owner: parsed.owner,
          repo: parsed.repo,
        };
      })
      .filter((repo): repo is SavedRepo => repo !== null);

    setSavedRepos(initialRepos);
  }, [repoUrls]);

  // Auto-extract project name from input
  useEffect(() => {
    if (!repoUrl.trim()) {
      setPreviewName("");
      return;
    }
    const parsed = parseRepoUrl(repoUrl);
    if (parsed) {
      setPreviewName(parsed.repo);
    } else {
      setPreviewName("");
    }
  }, [repoUrl]);

  // Show input if no repos saved
  useEffect(() => {
    if (savedRepos.length === 0) {
      setShowInput(true);
    }
  }, [savedRepos]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addLinkBtnRef.current?.click();
  };

  const showingInput = showInput || savedRepos.length === 0;

  return (
    <div className={cn("h-screen flex flex-col overflow-hidden", cssWrapper)}>
      {/* Searching Folder Pop-up */}
      {isSearchingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-vscode-sidebar border border-border p-6 rounded-lg shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <Search className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-1">
                Buscando arquivos...
              </h3>
              <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                Explorando a pasta{" "}
                <span className="text-primary font-mono">
                  {searchingFolderName}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <TitleBar repoInfo={repoInfo} />

      {/* Repo Bar */}
      <div className="flex items-center gap-0 bg-vscode-activitybar border-b border-border h-12 relative">
        {showingInput && !repoUrls ? (
          <div className="flex-1 flex items-center gap-2 px-4 py-2 relative">
            <InputArea
              inputRef={inputRef}
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              setInputError={setInputError}
              setInputSuccess={setInputSuccess}
              handleKeyDown={handleKeyDown}
              loading={loading}
              previewName={previewName}
              truncateName={truncateName}
              inputError={inputError}
              inputSuccess={inputSuccess}
            />

            <AddLinkButton
              ref={addLinkBtnRef}
              onClick={() => handleAddRepo(repoUrl)}
              loading={loading}
              disabled={!repoUrl.trim()}
            />

            {savedRepos.length > 0 && (
              <CloseInputButton
                setShowInput={setShowInput}
                setInputError={setInputError}
                setInputSuccess={setInputSuccess}
                setRepoUrl={setRepoUrl}
              />
            )}
          </div>
        ) : (
          <RepoGroup
            savedRepos={savedRepos}
            activeRepoUrl={activeRepoUrl}
            setActiveRepoUrl={setActiveRepoUrl}
            setRepoInfo={setRepoInfo}
            setLoading={setLoading}
            setFiles={setFiles}
            setTabs={setTabs}
            setActiveTab={setActiveTab}
            setSelectedFile={setSelectedFile}
            setLoadingMsg={setLoadingMsg}
            setSavedRepos={setSavedRepos}
            setInputError={setInputError}
            setShowInput={setShowInput}
            setInputSuccess={setInputSuccess}
            inputRef={inputRef}
            githubToken={githubToken}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FileExplorer
          loading={loading}
          loadingMsg={loadingMsg}
          files={files}
          onFileSelect={setSelectedFile}
          onFolderClick={handleFolderClick}
          activeTab={activeTab}
          activeRepoUrl={activeRepoUrl}
        />

        {/* Editor */}
        <CodeViewer
          selectedFile={selectedFile}
          tabs={tabs}
          setTabs={setTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          githubToken={githubToken}
        />
      </div>

      {/* Status Bar */}
      <StatusBar repoInfo={repoInfo} files={files} />
    </div>
  );
};

export { Index };

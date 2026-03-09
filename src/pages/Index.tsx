import { CodeViewer } from "@/components/index/code-viewer";
import {
  AddLinkButton,
  CloseInputButton,
  FileExplorer,
  InputArea,
  RepoGroup,
  StatusBar,
  TitleBar,
} from "@/components/index/index";
import { fetchAllFiles, parseRepoUrl, type GitHubItem } from "@/lib/github";
import { cn } from "@/lib/utils";
import { type SavedRepo, type Tab } from "@/types";
import { useEffect, useRef, useState } from "react";

const MAX_BUTTON_CHARS = 18;

function truncateName(name: string) {
  return name.length > MAX_BUTTON_CHARS
    ? name.slice(0, MAX_BUTTON_CHARS) + "..."
    : name;
}

const Index = ({
  repoUrls,
  cssWrapper,
}: {
  repoUrls: string[];
  cssWrapper: string;
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

  const inputRef = useRef<HTMLInputElement>(null);
  const addLinkBtnRef = useRef<HTMLButtonElement>(null);

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
      const allFiles = await fetchAllFiles(
        parsed.owner,
        parsed.repo,
        "",
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
    const loadInitialRepos = async () => {
      for (const url of repoUrls) {
        if (url) {
          await handleAddRepo(url);
        }
      }
    };
    loadInitialRepos();
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
      {/* Title Bar */}
      <TitleBar repoInfo={repoInfo} />

      {/* Repo Bar */}
      <div className="flex items-center gap-0 bg-vscode-activitybar border-b border-border h-12 relative">
        {showingInput ? (
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
          activeTab={activeTab}
        />

        {/* Editor */}
        <CodeViewer
          selectedFile={selectedFile}
          tabs={tabs}
          setTabs={setTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Status Bar */}
      <StatusBar repoInfo={repoInfo} files={files} />
    </div>
  );
};

export default Index;

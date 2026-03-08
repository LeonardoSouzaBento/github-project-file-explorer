import { CodeViewer } from "@/components/CodeViewer";
import { FileTree } from "@/components/FileTree";
import { AddLinkButton } from "@/components/index/add-link-button";
import { ApiAlert } from "@/components/index/api-alert";
import { CloseInputButton } from "@/components/index/close-input-button";
import { RepoGroup } from "@/components/index/repo-group";
import { StatusBar } from "@/components/index/status-bar";
import { parseRepoUrl, type GitHubItem } from "@/lib/github";
import { type SavedRepo, type Tab } from "@/types";
import { FolderGit2, Github, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_BUTTON_CHARS = 18;

function truncateName(name: string) {
  return name.length > MAX_BUTTON_CHARS ? name.slice(0, MAX_BUTTON_CHARS) + "..." : name;
}

const Index = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState<GitHubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-vscode-titlebar border-b border-border">
        <Github className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">GitHub File Viewer</span>
        {repoInfo && (
          <span className="text-xs text-muted-foreground ml-2">
            — {repoInfo.owner}/{repoInfo.repo}
          </span>
        )}
      </div>

      {/* Repo Bar */}
      <div className="flex items-center gap-0 bg-vscode-activitybar border-b border-border h-12 relative">
        {showingInput ? (
          <div className="flex-1 flex items-center gap-2 px-4 py-2 relative">
            <div className="flex-1 flex items-center gap-2 bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 relative">
              <FolderGit2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cole o link do repositório público (ex: https://github.com/facebook/react)"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setInputError("");
                  setInputSuccess("");
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
                disabled={loading}
              />
              {previewName && (
                <span className="text-xs text-muted-foreground shrink-0 font-mono">
                  {truncateName(previewName)}
                </span>
              )}

              {/* Error/Success overlay */}
              <ApiAlert inputError={inputError} inputSuccess={inputSuccess} />
            </div>

            <AddLinkButton
              ref={addLinkBtnRef}
              loading={loading}
              repoUrl={repoUrl}
              savedRepos={savedRepos}
              setRepoUrl={setRepoUrl}
              setInputError={setInputError}
              setInputSuccess={setInputSuccess}
              setLoading={setLoading}
              setFiles={setFiles}
              setTabs={setTabs}
              setActiveTab={setActiveTab}
              setSelectedFile={setSelectedFile}
              setRepoInfo={setRepoInfo}
              setLoadingMsg={setLoadingMsg}
              setSavedRepos={setSavedRepos}
              setActiveRepoUrl={setActiveRepoUrl}
              setShowInput={setShowInput}
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
        <div className="w-64 shrink-0 bg-vscode-sidebar border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            Explorer
          </div>
          <div className="flex-1 overflow-auto py-1">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground text-center">{loadingMsg}</p>
                <div className="loading-dots flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
              </div>
            )}
            {!loading && files.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-muted-foreground">
                <FolderGit2 className="w-10 h-10 opacity-30" />
                <p className="text-xs text-center">
                  Adicione um link de repositório público para começar
                </p>
              </div>
            )}
            {!loading && files.length > 0 && (
              <FileTree
                items={files}
                onFileSelect={setSelectedFile}
                selectedPath={activeTab || undefined}
              />
            )}
          </div>
        </div>

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

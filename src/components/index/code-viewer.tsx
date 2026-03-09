import type { GitHubItem } from "@/lib/github";
import { fetchFileContent, getLanguageFromFilename } from "@/lib/github";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Tab {
  item: GitHubItem;
  content?: string;
  loading?: boolean;
  error?: string;
}

interface CodeViewerProps {
  selectedFile: GitHubItem | null;
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  activeTab: string | null;
  setActiveTab: (path: string | null) => void;
}

export function CodeViewer({ selectedFile, tabs, setTabs, activeTab, setActiveTab }: CodeViewerProps) {
  useEffect(() => {
    if (!selectedFile || selectedFile.type === "dir") return;

    const exists = tabs.find((t) => t.item.path === selectedFile.path);
    if (!exists) {
      const newTab: Tab = { item: selectedFile, loading: true };
      setTabs((prev) => [...prev, newTab]);
      setActiveTab(selectedFile.path);

      if (selectedFile.download_url) {
        fetchFileContent(selectedFile.download_url)
          .then((content) => {
            setTabs((prev) =>
              prev.map((t) =>
                t.item.path === selectedFile.path ? { ...t, content, loading: false } : t
              )
            );
          })
          .catch((err) => {
            setTabs((prev) =>
              prev.map((t) =>
                t.item.path === selectedFile.path
                  ? { ...t, error: err.message, loading: false }
                  : t
              )
            );
          });
      }
    } else {
      setActiveTab(selectedFile.path);
    }
  }, [selectedFile]);

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.item.path !== path);
      if (activeTab === path) {
        setActiveTab(filtered.length > 0 ? filtered[filtered.length - 1].item.path : null);
      }
      return filtered;
    });
  };

  const currentTab = tabs.find((t) => t.item.path === activeTab);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-vscode-editor">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-1">Nenhum arquivo aberto</p>
          <p className="text-sm">Selecione um arquivo na árvore à esquerda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-vscode-editor">
      {/* Tabs */}
      <div className="flex bg-vscode-tab-inactive border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.item.path}
            onClick={() => setActiveTab(tab.item.path)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-border min-w-0 shrink-0 transition-colors ${
              activeTab === tab.item.path
                ? "bg-vscode-tab-active text-foreground border-t-2 border-t-primary"
                : "text-muted-foreground hover:bg-vscode-explorer-hover"
            }`}
          >
            <span className="truncate max-w-[150px]">{tab.item.name}</span>
            <span
              onClick={(e) => closeTab(tab.item.path, e)}
              className="hover:bg-accent rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {currentTab?.loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando...</span>
          </div>
        )}
        {currentTab?.error && (
          <div className="flex items-center justify-center h-full text-destructive">
            Erro: {currentTab.error}
          </div>
        )}
        {currentTab?.content !== undefined && !currentTab.loading && (
          <SyntaxHighlighter
            language={getLanguageFromFilename(currentTab.item.name)}
            style={vscDarkPlus}
            showLineNumbers
            lineNumberStyle={{ color: "hsl(0 0% 40%)", minWidth: "3em" }}
            customStyle={{
              margin: 0,
              padding: "16px 0",
              background: "transparent",
              fontSize: "13px",
              lineHeight: "1.6",
              minHeight: "100%",
            }}
            wrapLongLines
          >
            {currentTab.content}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Status info */}
      {currentTab && !currentTab.loading && (
        <div className="flex items-center justify-between px-3 py-1 bg-vscode-activitybar text-xs text-muted-foreground border-t border-border">
          <span>{currentTab.item.path}</span>
          <span className="uppercase">{getLanguageFromFilename(currentTab.item.name)}</span>
        </div>
      )}
    </div>
  );
}

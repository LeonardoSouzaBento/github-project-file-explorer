import { Loader2, FolderGit2 } from "lucide-react";
import { FileTree } from "@/components/index/file-explorer/file-tree";
import { type GitHubItem } from "@/lib/github";
import { type StateSetter } from "@/types";

interface FileExplorerProps {
  loading: boolean;
  loadingMsg: string;
  files: GitHubItem[];
  onFileSelect: StateSetter<GitHubItem | null>;
  activeTab: string | null;
}

export const FileExplorer = ({
  loading,
  loadingMsg,
  files,
  onFileSelect,
  activeTab,
}: FileExplorerProps) => {
  return (
    <div className="w-64 shrink-0 bg-vscode-sidebar border-r border-border flex flex-col overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        Explorer
      </div>
      <div className="flex-1 overflow-auto py-1">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground text-center">
              {loadingMsg}
            </p>
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
            onFileSelect={onFileSelect}
            selectedPath={activeTab || undefined}
          />
        )}
      </div>
    </div>
  );
};

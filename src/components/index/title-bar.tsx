import { Github } from "lucide-react";

interface TitleBarProps {
  repoInfo: { owner: string; repo: string } | null;
}

export const TitleBar = ({ repoInfo }: TitleBarProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-vscode-titlebar border-b border-border">
      <Github className="w-4 h-4 text-foreground" />
      <span className="text-sm font-medium text-foreground">
        GitHub File Viewer
      </span>
      {repoInfo && (
        <span className="text-xs text-muted-foreground ml-2">
          — {repoInfo.owner}/{repoInfo.repo}
        </span>
      )}
    </div>
  );
};

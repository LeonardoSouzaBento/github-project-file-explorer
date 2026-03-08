import { type GitHubItem } from "@/lib/github";

interface StatusBarProps {
  repoInfo: { owner: string; repo: string } | null;
  files: GitHubItem[];
}

function countFiles(items: GitHubItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.type === "file") count++;
    if (item.children) count += countFiles(item.children);
  }
  return count;
}

export const StatusBar = ({ repoInfo, files }: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-1 bg-vscode-statusbar text-xs text-primary-foreground">
      <div className="flex items-center gap-3">
        <span>GitHub File Viewer</span>
        {repoInfo && (
          <span>
            {repoInfo.owner}/{repoInfo.repo}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {files.length > 0 && <span>{countFiles(files)} arquivos</span>}
        <span>UTF-8</span>
      </div>
    </div>
  );
};

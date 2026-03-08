import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import type { GitHubItem } from "@/lib/github";
import { getFileIcon } from "@/lib/github";

interface FileTreeProps {
  items: GitHubItem[];
  onFileSelect: (item: GitHubItem) => void;
  selectedPath?: string;
  depth?: number;
}

export function FileTree({ items, onFileSelect, selectedPath, depth = 0 }: FileTreeProps) {
  return (
    <ul className="select-none">
      {items.map((item) => (
        <FileTreeNode
          key={item.path}
          item={item}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function FileTreeNode({
  item,
  onFileSelect,
  selectedPath,
  depth,
}: {
  item: GitHubItem;
  onFileSelect: (item: GitHubItem) => void;
  selectedPath?: string;
  depth: number;
}) {
  const [open, setOpen] = useState(item.name.toLowerCase() === "src" && depth === 0);
  const isDir = item.type === "dir";
  const isSelected = selectedPath === item.path;

  return (
    <li>
      <div
        className={`flex items-center gap-1 py-[2px] cursor-pointer text-sm hover:bg-vscode-explorer-hover transition-colors ${
          isSelected ? "bg-vscode-selection" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) {
            setOpen(!open);
          } else {
            onFileSelect(item);
          }
        }}
      >
        {isDir ? (
          <>
            {open ? (
              <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
            )}
            {open ? (
              <FolderOpen className="w-4 h-4 shrink-0 text-primary" />
            ) : (
              <Folder className="w-4 h-4 shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-4 shrink-0" />
            <span className="text-xs shrink-0">{getFileIcon(item.name)}</span>
          </>
        )}
        <span className="truncate text-secondary-foreground">{item.name}</span>
      </div>
      {isDir && open && item.children && (
        <FileTree
          items={item.children}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          depth={depth + 1}
        />
      )}
    </li>
  );
}

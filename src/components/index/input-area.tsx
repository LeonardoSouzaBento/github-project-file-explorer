import { FolderGit2 } from "lucide-react";
import { ApiAlert } from "./api-alert";
import { type StateSetter } from "@/types";

interface InputAreaProps {
  inputRef: React.RefObject<HTMLInputElement>;
  repoUrl: string;
  setRepoUrl: StateSetter<string>;
  setInputError: StateSetter<string>;
  setInputSuccess: StateSetter<string>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  loading: boolean;
  previewName: string;
  truncateName: (name: string) => string;
  inputError: string;
  inputSuccess: string;
}

export const InputArea = ({
  inputRef,
  repoUrl,
  setRepoUrl,
  setInputError,
  setInputSuccess,
  handleKeyDown,
  loading,
  previewName,
  truncateName,
  inputError,
  inputSuccess,
}: InputAreaProps) => {
  return (
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
  );
};

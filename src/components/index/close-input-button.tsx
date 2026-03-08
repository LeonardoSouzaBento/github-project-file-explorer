import { X } from "lucide-react";

interface CloseInputButtonProps {
  setShowInput: (show: boolean) => void;
  setInputError: (error: string) => void;
  setInputSuccess: (success: string) => void;
  setRepoUrl: (url: string) => void;
}

export const CloseInputButton = ({
  setShowInput,
  setInputError,
  setInputSuccess,
  setRepoUrl,
}: CloseInputButtonProps) => {
  return (
    <button
      onClick={() => {
        setShowInput(false);
        setInputError("");
        setInputSuccess("");
        setRepoUrl("");
      }}
      className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
    >
      <X className="w-4 h-4" />
    </button>
  );
};

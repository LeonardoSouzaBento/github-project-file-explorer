import { Loader2, Plus } from "lucide-react";
import { forwardRef } from "react";

interface AddLinkButtonProps {
  loading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const AddLinkButton = forwardRef<HTMLButtonElement, AddLinkButtonProps>(
  ({ loading, onClick, disabled }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={loading || disabled}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Adicionar
      </button>
    );
  }
);

AddLinkButton.displayName = "AddLinkButton";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ApiAlertProps {
  inputError: string;
  inputSuccess: string;
}

export const ApiAlert = ({ inputError, inputSuccess }: ApiAlertProps) => {
  if (!inputError && !inputSuccess) return null;

  return (
    <div
      className={`absolute left-0 top-full mt-1 z-50 flex items-center gap-2 px-3 py-2 rounded text-xs shadow-lg ${
        inputError
          ? "bg-destructive/90 text-destructive-foreground"
          : "bg-primary/90 text-primary-foreground"
      }`}
    >
      {inputError ? (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{inputError || inputSuccess}</span>
    </div>
  );
};

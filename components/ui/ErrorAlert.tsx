interface ErrorAlertProps {
  message: string | null | undefined;
  className?: string;
}

// Inline error message announced to screen readers; renders nothing when there is no message
export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium ${className}`}
    >
      {message}
    </div>
  );
}

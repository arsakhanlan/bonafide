import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

/** Sits above dialog overlays so a failed action is never hidden behind the modal. */
export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 print:hidden">
      <div
        role="alert"
        className="animate-toast-in pointer-events-auto flex w-full max-w-md items-start justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-xl shadow-rose-950/15 dark:bg-rose-950 dark:text-rose-100"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-relaxed">{message}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="-m-1 rounded-lg p-1.5 transition-colors hover:bg-rose-500/15 active:scale-95"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

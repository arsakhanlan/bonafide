import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteCaseDialogProps {
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const REMOVED = ['Papers you uploaded', 'Letters and lawyer notes', 'Deadlines and history'];

export function DeleteCaseDialog({ open, busy, onOpenChange, onConfirm }: DeleteCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-md gap-0 overflow-hidden rounded-3xl p-0 sm:w-full">
        <div className="relative overflow-hidden border-b border-rose-200/70 bg-gradient-to-br from-rose-500/12 via-card to-rose-500/5 p-5 dark:border-rose-900/40 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="relative flex items-start gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-600/25">
              <Trash2 className="h-5 w-5" />
              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-lg">Delete this case?</DialogTitle>
              <DialogDescription className="mt-1.5 text-xs leading-relaxed">
                This removes the whole case from Bonafide. It cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            What will be removed
          </p>
          <ul className="space-y-2">
            {REMOVED.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-xs text-foreground/90">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <X className="h-2.5 w-2.5 stroke-[3]" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your bank, police and legal-aid contacts are not changed. Only this case is deleted.
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-border/70 bg-muted/20 px-5 py-3.5 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Keep my case
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={busy}
            className="gap-1.5"
          >
            {busy ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {busy ? 'Deleting…' : 'Delete everything'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, ShieldCheck } from 'lucide-react';

interface RestartDialogProps {
  open: boolean;
  demo: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RestartDialog({ open, demo, onOpenChange, onConfirm }: RestartDialogProps) {
  const scope = demo
    ? ['Walkthrough progress', 'Letters and recorded replies', 'Activity history']
    : ['Case, letters and clocks stay saved', 'The page reconnects to your case', 'Nothing is deleted'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-md gap-0 overflow-hidden rounded-3xl p-0 sm:w-full">
        <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-emerald-500/12 via-card to-teal-500/5 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-start gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/25">
              <RotateCcw className="h-5 w-5" />
              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-lg">
                {demo ? 'Restart the demo?' : 'Reload Bonafide?'}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-xs leading-relaxed">
                {demo
                  ? 'This clears the current walkthrough and returns you to the demo hub.'
                  : 'Reloading refreshes the app and picks your saved case up again.'}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {demo ? 'What resets' : 'What stays'}
          </p>
          <ul className="space-y-2">
            {scope.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-xs text-foreground/90">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            {demo
              ? 'Only this browser session is reset. No account, paper or stored data is touched.'
              : 'This is a refresh, not a delete. Your server-side case is untouched.'}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-border/70 bg-muted/20 px-5 py-3.5 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Keep going
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {demo ? 'Restart demo' : 'Reload app'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

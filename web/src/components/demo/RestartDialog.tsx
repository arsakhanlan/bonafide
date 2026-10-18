import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface RestartDialogProps {
  open: boolean;
  demo: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RestartDialog({ open, demo, onOpenChange, onConfirm }: RestartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-md rounded-3xl sm:w-full">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <RotateCcw className="h-5 w-5" />
          </div>
          <DialogTitle>{demo ? 'Restart the demo?' : 'Reload Bonafide?'}</DialogTitle>
          <DialogDescription>
            {demo
              ? 'This clears the current walkthrough and returns you to the demo hub. The simulated history is not saved.'
              : 'Your case is saved on the server. Reloading only refreshes the app and picks your case up again.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep going
          </Button>
          <Button variant="primary" onClick={onConfirm} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            {demo ? 'Restart demo' : 'Reload app'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

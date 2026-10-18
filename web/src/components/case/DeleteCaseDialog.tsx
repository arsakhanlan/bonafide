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
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteCaseDialogProps {
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteCaseDialog({ open, busy, onOpenChange, onConfirm }: DeleteCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-md rounded-3xl sm:w-full">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogTitle>Delete this case?</DialogTitle>
          <DialogDescription>
            This removes the case, its letters, deadlines and uploaded papers from Bonafide.
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Keep my case
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
            Delete case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

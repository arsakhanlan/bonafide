import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Shield, CheckCircle2 } from 'lucide-react';

export function NewCaseModal() {
  const { activeModal, setModal, createNewCase, isProcessing } = useCase();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  if (activeModal !== 'NEW_CASE') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNewCase(title.trim() || 'New Bank Freeze Defense', language);
  };

  return (
    <Dialog open={activeModal === 'NEW_CASE'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-md rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Start a New Freeze Defense Case
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Initialize a clean legal case file. The AI agent will guide you through evidence extraction, BNSS §106 grounding, and statutory letter preparation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Case Name or Store Name:
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Pune Electronics - HDFC Lien Defense"
                required
                className="text-sm sm:text-xs h-10 sm:h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Preferred Legal Language:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all active:scale-[0.98] ${
                    language === 'en'
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all active:scale-[0.98] ${
                    language === 'hi'
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModal('NONE')}
              className="text-xs h-9 justify-center"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isProcessing}
              className="text-xs h-10 sm:h-9 gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 font-semibold shadow-sm justify-center w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" />
              Create Case File
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


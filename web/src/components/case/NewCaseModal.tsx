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
import { Plus, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export function NewCaseModal() {
  const { activeModal, setModal, createNewCase, isProcessing } = useCase();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showChecklist, setShowChecklist] = useState(false);

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
              <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

            {/* Accordion: Case Initiation Guidance & Statutory Checklist */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowChecklist(!showChecklist)}
                className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors"
                aria-expanded={showChecklist}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-xs">What happens next? (Statutory Process)</span>
                </div>
                {showChecklist ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>

              {showChecklist && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-muted-foreground accordion-animate-open">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Upload your bank lien SMS, freeze memo, or bank statement.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>AI Reader automatically isolates the disputed transaction vs. your innocent surplus balance.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Generates a ready-to-sign statutory unfreeze letter quoting BNSS §106 and MHA SOP.</span>
                  </div>
                </div>
              )}
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


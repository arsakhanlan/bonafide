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
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Sparkles, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { IS_MOCK } from '@/lib/mode';

export function QuestionsModal() {
  const { activeModal, setModal, caseData, submitAnswers, isProcessing } = useCase();

  const questions = caseData?.questions || [];

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isOpen = activeModal === 'ANSWER_QUESTIONS' && questions.length > 0;

  const allAnswered = questions.every(q => (answers[q.id] || '').trim().length > 0);

  const handleFillDemo = () => {
    const demo: Record<string, string> = {
      q1: 'Brand identity, primary vector logo, and social media kit designed for client XYZ Ltd.',
      q2: 'Yes, full project scope and revisions discussed via Gmail thread and final design files delivered on Google Drive with timestamped client approval.',
      q3: 'Discussed and delivered over email; the client confirmed receipt in writing.',
    };
    const filled: Record<string, string> = {};
    questions.forEach(q => {
      filled[q.id] = demo[q.id] || 'Yes — I have written proof of the transaction.';
    });
    setAnswers(filled);
  };

  const pickChoice = (questionId: string, choice: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    const payload = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id].trim(),
    }));
    await submitAnswers(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Clarifications Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              To ground your representation in legitimate consideration, please answer these quick questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-1.5 rounded-xl border border-slate-200 p-3.5 sm:p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  {idx + 1}. {q.text}
                </label>
                {q.why && (
                  <p className="text-[11px] text-muted-foreground italic">
                    Why the AI needs this: {q.why}
                  </p>
                )}
                {q.options && q.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pickChoice(q.id, opt)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                          answers[q.id] === opt
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder || 'Enter your details...'}
                  rows={2}
                  required
                  className="mt-2 text-xs bg-white dark:bg-slate-950"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            {IS_MOCK ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillDemo}
                className="text-xs h-9 gap-1.5 w-full sm:w-auto justify-center text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                1-Click Demo Answers
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModal('NONE')}
                className="text-xs h-9 flex-1 sm:flex-none justify-center"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isProcessing || !allAnswered}
                className="text-xs h-9 gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 font-semibold flex-1 sm:flex-none justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isProcessing ? 'Saving answers…' : 'Submit & Continue'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

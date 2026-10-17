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
import { HelpCircle, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export function QuestionsModal() {
  const { activeModal, setModal, caseData, submitAnswers, isProcessing } = useCase();

  const questions = caseData?.questions || [];

  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '',
    q2: '',
  });

  const isOpen = activeModal === 'ANSWER_QUESTIONS' && questions.length > 0;

  const handleFillDemo = () => {
    setAnswers({
      q1: 'Brand identity, primary vector logo, and social media media kit designed for client XYZ Ltd.',
      q2: 'Yes, full project scope and revisions discussed via Gmail thread and final design files delivered on Google Drive with timestamped client approval.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || 'Confirmed as genuine consideration',
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
                Clarifications Required for Legal Grounding
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              To ground your Section 106 representation in legitimate consideration under the Contract Act, please answer these 2 quick questions.
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
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder || 'Enter your details...'}
                  rows={3}
                  className="mt-2 text-xs bg-white dark:bg-slate-950"
                  required
                />
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
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
                disabled={isProcessing}
                className="text-xs h-9 gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 font-semibold flex-1 sm:flex-none justify-center"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit & Generate
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


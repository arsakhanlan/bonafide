import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Send, Building, Mail, MessageSquare, Package, Clock, ShieldCheck, Loader2 } from 'lucide-react';

export function MarkSentModal() {
  const {
    activeModal,
    setModal,
    selectedLetterId,
    letters,
    markLetterSent,
    currentSimulatedDate,
    isProcessing,
  } = useCase();

  const letter = letters.find(l => l.id === selectedLetterId) || letters[0];

  const [how, setHow] = useState<'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST'>('BRANCH');
  const [sentOn, setSentOn] = useState(currentSimulatedDate);

  const isOpen = activeModal === 'MARK_SENT' && Boolean(letter);

  useEffect(() => {
    if (isOpen) setSentOn(currentSimulatedDate);
  }, [isOpen, currentSimulatedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) return;
    await markLetterSent(letter.id, sentOn, how);
  };

  const deliveryChannels = [
    {
      id: 'BRANCH' as const,
      label: 'At the bank',
      desc: 'Handed in at the branch with a receipt or stamp',
      icon: Building,
    },
    {
      id: 'EMAIL' as const,
      label: 'By email',
      desc: "Sent to the bank's official email address",
      icon: Mail,
    },
    {
      id: 'WHATSAPP' as const,
      label: 'By WhatsApp',
      desc: "Sent to the bank's official grievance number",
      icon: MessageSquare,
    },
    {
      id: 'POST' as const,
      label: 'By post',
      desc: 'Sent by registered or speed post',
      icon: Package,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-lg rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                When did you send it?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Tell us the date and how you sent it. The bank then has 7 days to act, and we will keep track of that deadline for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Date you sent it:
              </label>
              <Input
                type="date"
                value={sentOn}
                onChange={e => setSentOn(e.target.value)}
                required
                className="text-sm sm:text-xs font-mono h-10 sm:h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
                How did you deliver the letter?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deliveryChannels.map(ch => {
                  const Icon = ch.icon;
                  const isSelected = how === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setHow(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-500 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold leading-tight">
                          {ch.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {ch.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Pro-tip:</strong> Keep a signed duplicate copy or postal delivery tracking receipt. This serves as critical evidence if escalation to the Banking Ombudsman is needed.
              </span>
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
              className="text-xs h-10 sm:h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm justify-center w-full sm:w-auto"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {isProcessing ? 'Starting countdown…' : 'Save & start the 7-day countdown'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


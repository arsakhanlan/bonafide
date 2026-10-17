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
import { MessageSquare, Sparkles, Send, ShieldAlert } from 'lucide-react';

export function RecordReplyModal() {
  const { activeModal, setModal, recordReply, isProcessing } = useCase();

  const [replyText, setReplyText] = useState('');

  if (activeModal !== 'RECORD_REPLY') return null;

  const presets = [
    {
      title: 'Bank Refuses Unfreeze (Requires L2 to Police)',
      text: 'Bank responded: "We received your grievance. However, as per Cyber Crime Police Station Patna instructions, total debit hold cannot be altered without police NOC."',
    },
    {
      title: 'Bank Acknowledged Grievance (Clock Advanced)',
      text: 'Bank Branch Manager acknowledged representation and filed formal grievance ticket #G-89104 on 2026-10-21. Stated lien restriction is under internal legal review.',
    },
    {
      title: 'Bank Partially Released Surplus Funds',
      text: 'Bank notified: "Lien restricted to disputed ₹2,000. Balance of ₹1,78,000 released for normal branch and UPI transactions."',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await recordReply(replyText);
  };

  return (
    <Dialog open={activeModal === 'RECORD_REPLY'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Record Bank or Police Response
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste the bank's written reply, grievance ticket number, or email statement. Case Boss will automatically analyze compliance and trigger next statutory escalation steps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Quick Evaluator Presets:
              </span>
              <div className="space-y-1.5">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReplyText(p.text)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      {p.title}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      "{p.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Response Text / Notice Details:
              </label>
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Paste the bank's email, SMS, or written letter text here..."
                rows={4}
                required
                className="text-xs bg-white dark:bg-slate-950 font-sans"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModal('NONE')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isProcessing || !replyText.trim()}
              className="text-xs gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900"
            >
              <Send className="h-4 w-4" />
              Process Response with AI Boss
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


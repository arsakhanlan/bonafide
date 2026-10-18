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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { IS_MOCK } from '@/lib/mode';
import { audienceOf } from '@/lib/letterAudience';

const DEMO_REPLY =
  'Bank notified: "Lien restricted to disputed ₹2,000. Balance of ₹1,78,000 released for normal branch and UPI transactions."';

const POLICE_FAIL_REPLY =
  'The police have not released the surplus balance and have not given a written decision. I need to take the next step.';

export function RecordReplyModal() {
  const { activeModal, setModal, recordReply, isProcessing, letters } = useCase();

  const lastSent = [...letters].reverse().find(l => l.status === 'SENT');
  const waitingOnAuthority = ['police', 'district'].includes(audienceOf(lastSent?.kind));

  const [replyText, setReplyText] = useState(IS_MOCK ? DEMO_REPLY : '');

  const isOpen = activeModal === 'RECORD_REPLY';

  // After a police/district letter, the demo opens on the failure path so the
  // court step can be shown; otherwise it opens on the bank's release reply.
  useEffect(() => {
    if (isOpen && IS_MOCK) setReplyText(waitingOnAuthority ? POLICE_FAIL_REPLY : DEMO_REPLY);
  }, [isOpen, waitingOnAuthority]);

  const presets = [
    ...(waitingOnAuthority
      ? [
          {
            title: 'Police did not release the money',
            text: POLICE_FAIL_REPLY,
          },
        ]
      : []),
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
    <Dialog open={isOpen} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-lg rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Add their reply
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste what the bank or police wrote, or upload their letter. We will read it and tell you what to do next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {IS_MOCK ? 'Choose a sample reply:' : 'Need a starting point?'}
              </span>
              {!IS_MOCK && (
                <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                  These are examples. Replace the text with the real reply before saving.
                </p>
              )}
              <div className="space-y-1.5">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReplyText(p.text)}
                    className="w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-left text-xs transition-colors hover:bg-secondary active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Sparkles className="h-3 w-3 shrink-0 text-amber-500" />
                      {p.title}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      "{p.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                What did they say?
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
              disabled={isProcessing || !replyText.trim()}
              className="text-xs h-10 sm:h-9 gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 font-semibold shadow-sm justify-center w-full sm:w-auto"
            >
              {isProcessing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isProcessing ? 'Reading the reply…' : 'Work out the next step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


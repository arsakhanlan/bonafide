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
import { Input } from '@/components/ui/input';
import { Send, Building, Mail, MessageSquare, Package, Clock, ShieldCheck } from 'lucide-react';
import { audienceOf, LetterAudience } from '@/lib/letterAudience';

type DeliveryHow = 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST';

interface DeliveryChannel {
  id: DeliveryHow;
  label: string;
  desc: string;
  icon: typeof Building;
}

const CHANNELS: Record<LetterAudience, DeliveryChannel[]> = {
  bank: [
    {
      id: 'BRANCH',
      label: 'At the bank',
      desc: 'Handed in at the branch with a receipt or stamp',
      icon: Building,
    },
    {
      id: 'EMAIL',
      label: 'By email',
      desc: "Sent to the bank's official email address",
      icon: Mail,
    },
    {
      id: 'WHATSAPP',
      label: 'By WhatsApp',
      desc: "Sent to the bank's official grievance number",
      icon: MessageSquare,
    },
    {
      id: 'POST',
      label: 'By post',
      desc: 'Sent by registered or speed post',
      icon: Package,
    },
  ],
  police: [
    {
      id: 'POST',
      label: 'By post',
      desc: 'Registered or speed post to the police station',
      icon: Package,
    },
    {
      id: 'EMAIL',
      label: 'By email',
      desc: "Sent to the police station's or officer's official email",
      icon: Mail,
    },
  ],
  district: [
    {
      id: 'EMAIL',
      label: 'By email',
      desc: "Sent to the District Grievance Officer's official email",
      icon: Mail,
    },
    {
      id: 'POST',
      label: 'By post',
      desc: 'Registered or speed post to the district office',
      icon: Package,
    },
  ],
  lawyer: [
    {
      id: 'BRANCH',
      label: 'In person',
      desc: 'Handed to your lawyer or legal aid office',
      icon: Building,
    },
    {
      id: 'EMAIL',
      label: 'By email',
      desc: 'Sent to your lawyer or legal aid office',
      icon: Mail,
    },
  ],
};

const COPY: Record<
  LetterAudience,
  { title: string; description: string; dateLabel: string; submit: string; tip: string }
> = {
  bank: {
    title: 'When did you send it to the bank?',
    description:
      'Tell us the date and how you sent it. We will keep track of the bank deadline for you.',
    dateLabel: 'Date you sent it',
    submit: 'Save & track the bank deadline',
    tip: 'Keep the receipt or email. It proves when the bank received your letter.',
  },
  police: {
    title: 'When did you send it to the police?',
    description:
      'Tell us the date and how it reached the police. We will keep track of their response deadline for you.',
    dateLabel: 'Date the police received it',
    submit: 'Save & track the police deadline',
    tip: 'Keep the postal receipt or email. It proves when the police received your letter.',
  },
  district: {
    title: 'When did you send it to the District Officer?',
    description:
      'Tell us the date and how you sent it. We will track the review deadline for you.',
    dateLabel: 'Date you sent it',
    submit: 'Save & track the review deadline',
    tip: 'Keep the receipt or email. It proves when the District Officer received your letter.',
  },
  lawyer: {
    title: 'When did your lawyer get the notes?',
    description:
      'These are notes for your lawyer, not a court petition. Save the date you handed them over.',
    dateLabel: 'Date you gave the notes',
    submit: 'Save the date',
    tip: 'Your lawyer decides the court step. Bonafide never files a petition itself.',
  },
};

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
  const audience = audienceOf(letter?.kind);
  const channels = CHANNELS[audience];
  const copy = COPY[audience];

  const [how, setHow] = useState<DeliveryHow>(channels[0].id);
  const [sentOn, setSentOn] = useState(currentSimulatedDate);

  const isOpen = activeModal === 'MARK_SENT' && Boolean(letter);

  useEffect(() => {
    if (!isOpen) return;
    setSentOn(currentSimulatedDate);
    setHow(CHANNELS[audience][0].id);
  }, [isOpen, currentSimulatedDate, audience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) return;
    await markLetterSent(letter.id, sentOn, how);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-lg rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {copy.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {copy.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                {copy.dateLabel}:
              </label>
              <Input
                type="date"
                value={sentOn}
                onChange={e => setSentOn(e.target.value)}
                required
                className="h-10 text-sm font-mono sm:h-9 sm:text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
                How did you deliver it?
              </label>
              <div className={`grid grid-cols-1 gap-2 ${channels.length > 2 ? 'sm:grid-cols-2' : ''}`}>
                {channels.map(ch => {
                  const Icon = ch.icon;
                  const isSelected = how === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setHow(ch.id)}
                      className={`rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100'
                          : 'border-border bg-card hover:border-emerald-500/40 dark:bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isSelected
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-sm font-bold leading-tight">{ch.label}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {ch.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{copy.tip}</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse items-stretch justify-between gap-2 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModal('NONE')}
              className="h-10 justify-center text-xs sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isProcessing}
              className="h-11 w-full justify-center gap-1.5 text-xs font-semibold sm:h-9 sm:w-auto"
            >
              {isProcessing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {isProcessing
                ? audience === 'lawyer'
                  ? 'Saving…'
                  : 'Starting the deadline…'
                : copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

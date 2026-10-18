import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSearch,
  HelpCircle,
  Loader2,
  MessageSquare,
  Scale,
  Send,
  ShieldCheck,
  Upload,
  LucideIcon,
} from 'lucide-react';
import { cn, formatDate, formatINR } from '@/lib/utils';
import { NextStepAction } from '@/types/case';

type Tone = 'action' | 'wait' | 'done';

interface ActionView {
  eyebrow: string;
  step?: string;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  icon: LucideIcon;
  tone: Tone;
  trust: string;
  secondary?: { label: string; onClick: () => void };
}

export function NextStepHero() {
  const { caseData, setModal, letters } = useCase();

  if (!caseData || !caseData.nextStep) return null;

  const next = caseData.nextStep;
  const letterId = next.letterId || letters[0]?.id;
  const resolved = caseData.stage === 'RESOLVED';
  const disputed = formatINR(caseData.money?.disputed ?? 0);

  const viewActivity = () =>
    document.getElementById('activity-log')?.scrollIntoView({ behavior: 'smooth' });
  const viewDeadline = () =>
    document.getElementById('statutory-deadlines-section')?.scrollIntoView({ behavior: 'smooth' });

  const actionView = (): ActionView => {
    if (caseData.busy) {
      return {
        eyebrow: 'Please wait',
        title: 'We are reading your papers',
        description:
          'The agents are checking the amounts and the law. This page will update by itself — you can stay right here.',
        buttonText: 'Working…',
        onClick: () => {},
        icon: Loader2,
        tone: 'action',
        trust: 'Nothing is sent anywhere while we work.',
      };
    }

    switch (next.action as NextStepAction) {
      case 'UPLOAD_PAPERS':
        return {
          eyebrow: 'Your next step',
          step: 'Step 1 of 4',
          title: 'Add your papers',
          description:
            'Add a clear photo or PDF of the bank message (SMS or email) and your bank statement. That is all we need to start.',
          buttonText: 'Add my papers',
          onClick: () => setModal('UPLOAD_PAPERS'),
          icon: Upload,
          tone: 'action',
          trust: 'You stay in control — nothing is sent for you.',
        };

      case 'ANSWER_QUESTIONS':
        return {
          eyebrow: 'Your next step',
          step: 'Step 2 of 4',
          title: 'Two quick questions',
          description:
            'The agent needs a couple of details to prove this payment was for genuine work. Your answers are saved with your case.',
          buttonText: 'Answer the questions',
          onClick: () => setModal('ANSWER_QUESTIONS'),
          icon: HelpCircle,
          tone: 'action',
          trust: 'Only the agent uses these answers — nothing is sent.',
        };

      case 'REVIEW_LETTER':
        return {
          eyebrow: 'Your next step',
          step: 'Step 3 of 4',
          title: 'Check your letter',
          description:
            'We have prepared a letter to your bank. Read it, add your details if needed, and approve it so you can send it yourself.',
          buttonText: 'Review my letter',
          onClick: () => setModal('REVIEW_LETTER', letterId),
          icon: FileSearch,
          tone: 'action',
          trust: 'You approve the letter before anything else happens.',
        };

      case 'SEND_LETTER':
        return {
          eyebrow: 'Your next step',
          step: 'Step 3 of 4',
          title: 'Send your letter',
          description:
            'Print or email the approved letter to your bank. Then tell us when you sent it, so we can keep track of their deadline.',
          buttonText: 'I sent it',
          onClick: () => setModal('MARK_SENT', letterId),
          icon: Send,
          tone: 'action',
          trust: 'You deliver it yourself — Bonafide never sends it.',
        };

      case 'WAIT':
        return {
          eyebrow: 'No action needed',
          step: 'Step 4 of 4',
          title: 'Waiting for the bank',
          description: next.dueOn
            ? `Your letter is with the bank. They should reply by ${formatDate(next.dueOn)}. When you hear from them, come back and add their reply.`
            : 'Your letter is with the bank. When you hear from them, come back and add their reply.',
          buttonText: 'See the deadline',
          onClick: viewDeadline,
          icon: Clock,
          tone: 'wait',
          trust: "We'll show the next step here when the bank replies.",
          secondary: { label: 'They replied', onClick: () => setModal('RECORD_REPLY') },
        };

      case 'UPLOAD_REPLY':
        return {
          eyebrow: 'Your next step',
          step: 'Step 4 of 4',
          title: 'Did they reply?',
          description:
            "Add the bank's or police's reply here — paste the text or upload the letter. We'll read it and work out what to do next.",
          buttonText: 'Add their reply',
          onClick: () => setModal('RECORD_REPLY'),
          icon: MessageSquare,
          tone: 'action',
          trust: 'Their reply is only used to work out your next step.',
        };

      case 'SEE_LEGAL_AID':
        return {
          eyebrow: 'Free help available',
          title: 'This case needs a lawyer',
          description:
            'A lawyer should look at this case. Government legal aid is free, and we will not write self-help letters for it.',
          buttonText: 'See free legal aid',
          onClick: () => {
            document.getElementById('referral-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          icon: Scale,
          tone: 'wait',
          trust: 'Self-help letters are stopped for this case.',
        };

      case 'NONE':
        return resolved
          ? {
              eyebrow: 'Case complete',
              title: 'Your money was released',
              description: `The bank released the surplus. Only the disputed ${disputed} remains on hold, as required by the police.`,
              buttonText: 'See what happened',
              onClick: viewActivity,
              icon: CheckCircle2,
              tone: 'done',
              trust: 'Keep this page for your records.',
            }
          : {
              eyebrow: 'No action needed',
              title: "You're all caught up",
              description:
                next.text || 'There is nothing for you to do right now. We will show the next step here.',
              buttonText: 'See what happened',
              onClick: viewActivity,
              icon: CheckCircle2,
              tone: 'wait',
              trust: 'We will update this page when something changes.',
            };

      default:
        return {
          eyebrow: 'Please wait',
          title: 'We are checking your case',
          description:
            next.text || 'There is nothing for you to do right now. We will show the next step here.',
          buttonText: 'See what happened',
          onClick: viewActivity,
          icon: Clock,
          tone: 'wait',
          trust: 'We will update this page when something changes.',
        };
    }
  };

  const action = actionView();
  const Icon = action.icon;

  return (
    <Card
      aria-live="polite"
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-card',
        action.tone === 'action' &&
          'border-emerald-600/30 bg-gradient-to-br from-emerald-50/90 via-card to-card dark:from-emerald-950/40 dark:via-card dark:to-card',
        action.tone === 'wait' &&
          'border-amber-500/30 bg-gradient-to-br from-amber-50/70 via-card to-card dark:from-amber-950/20 dark:via-card dark:to-card',
        action.tone === 'done' &&
          'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b',
          action.tone === 'wait'
            ? 'from-amber-400 via-amber-500 to-orange-500'
            : 'from-emerald-400 via-emerald-500 to-teal-600'
        )}
      />

      <CardContent className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
        <div key={`${next.action}-${caseData.busy}`} className="animate-view-in flex min-w-0 items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md',
              action.tone === 'wait'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-600/20'
                : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20'
            )}
          >
            <Icon className={cn('h-5 w-5', caseData.busy && 'animate-spin')} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                  action.tone === 'wait'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                    : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    action.tone === 'wait' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
                {action.eyebrow}
              </span>
              {action.step && (
                <span className="text-[10px] font-semibold text-muted-foreground">{action.step}</span>
              )}
            </div>

            <h3 className="mt-1 text-base font-bold tracking-tight text-foreground sm:text-lg">
              {action.title}
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {action.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 self-stretch sm:flex-row sm:items-center sm:self-center">
          <Button
            size="default"
            variant={action.tone === 'action' ? 'primary' : 'outline'}
            disabled={caseData.busy}
            onClick={action.onClick}
            className="h-11 w-full justify-center px-5 text-sm font-bold sm:w-auto"
          >
            {caseData.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{action.buttonText}</span>}
            {!caseData.busy && <ArrowRight className="h-4 w-4" />}
          </Button>

          {action.secondary && (
            <Button
              size="default"
              variant="ghost"
              onClick={action.secondary.onClick}
              className="h-10 w-full justify-center gap-1.5 text-xs sm:w-auto"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {action.secondary.label}
            </Button>
          )}
        </div>
      </CardContent>

      <div className="flex items-center gap-1.5 border-t border-border/60 px-4 pb-3 pl-5 text-[11px] text-muted-foreground sm:px-5 sm:pl-6">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        {action.trust}
      </div>
    </Card>
  );
}

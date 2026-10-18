import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NextStepHero() {
  const { caseData, setModal, letters } = useCase();

  if (!caseData || !caseData.nextStep) return null;

  const next = caseData.nextStep;
  const letterId = next.letterId || letters[0]?.id;

  const renderActionDetails = () => {
    switch (next.action) {
      case 'UPLOAD_PAPERS':
        return {
          title: 'Add your papers to start',
          description: next.text || 'Upload your bank freeze notice and account statement. The agents read them and work out what is in dispute.',
          buttonText: 'Upload Papers',
          onClick: () => setModal('UPLOAD_PAPERS'),
        };

      case 'REVIEW_LETTER':
        return {
          title: 'Action Required: Review & Approve Letter',
          description: next.text || 'Review and approve your letter to the bank.',
          buttonText: 'Review & Print',
          onClick: () => setModal('REVIEW_LETTER', letterId),
        };

      case 'SEND_LETTER':
        return {
          title: 'Letter Approved: Deliver It Yourself',
          description: 'Print it or deliver it at your branch, then start the statutory countdown.',
          buttonText: 'Mark Sent & Start Clock',
          onClick: () => setModal('MARK_SENT', letterId),
        };

      case 'ANSWER_QUESTIONS':
        return {
          title: 'A Few Quick Questions',
          description: next.text,
          buttonText: 'Answer Questions',
          onClick: () => setModal('ANSWER_QUESTIONS'),
        };

      case 'WAIT':
        return {
          title: 'Statutory Clock is Running',
          description: next.text + (next.dueOn ? ` Expected by: ${next.dueOn}` : ''),
          buttonText: 'View Clocks',
          onClick: () => {
            const el = document.getElementById('statutory-deadlines-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
        };

      case 'UPLOAD_REPLY':
        return {
          title: 'Got a Reply From the Bank or Police?',
          description: next.text || 'Upload or paste their reply and the agents decide the next step.',
          buttonText: 'Record Reply',
          onClick: () => setModal('RECORD_REPLY'),
        };

      case 'SEE_LEGAL_AID':
        return {
          title: 'Free Legal Aid',
          description: next.text,
          buttonText: 'View Details',
          onClick: () => {
            const el = document.getElementById('referral-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
        };

      case 'NONE':
        return {
          title:
            caseData.stage === 'RESOLVED'
              ? 'Funds released — case resolved'
              : 'No action needed right now',
          description: next.text,
          buttonText: 'View activity',
          onClick: () =>
            document.getElementById('activity-log')?.scrollIntoView({ behavior: 'smooth' }),
        };

      default:
        return {
          title: 'Case Under Active Monitoring',
          description: next.text,
          buttonText: 'Review Details',
          onClick: () => {},
        };
    }
  };

  const action = renderActionDetails();

  return (
    <Card
      className={cn(
        'relative border-border bg-card shadow-card rounded-2xl overflow-hidden',
        caseData.stage === 'RESOLVED' &&
          'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 max-w-xl">
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            {caseData.stage === 'RESOLVED' && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {action.title}
            {caseData.busy && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                agents working
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {action.description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
          <Button
            size="default"
            variant="default"
            disabled={caseData.busy && next.action !== 'UPLOAD_PAPERS'}
            onClick={action.onClick}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-[0.98] transition-all"
          >
            <span>{action.buttonText}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>

          {caseData.stage === 'WAITING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModal('RECORD_REPLY')}
              className="h-9 text-xs border-border bg-secondary/50 text-foreground hover:bg-secondary"
            >
              Record Reply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

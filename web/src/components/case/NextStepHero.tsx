import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function NextStepHero() {
  const { caseData, setModal, letters } = useCase();

  if (!caseData || !caseData.nextStep) return null;

  const next = caseData.nextStep;
  const letterId = next.letterId || letters[0]?.id;

  const renderActionDetails = () => {
    switch (next.action) {
      case 'REVIEW_LETTER':
        return {
          title: 'Action Required: Review & Approve Representation Letter',
          description: next.text || 'Review and approve your Section 106 representation letter to submit to bank branch.',
          buttonText: 'Review & Print',
          onClick: () => setModal('REVIEW_LETTER', letterId),
        };

      case 'SEND_LETTER':
        return {
          title: 'Letter Approved: Deliver to Bank Branch',
          description: 'Print it or deliver it at your branch, then start the statutory 7-day countdown.',
          buttonText: 'Mark Sent & Start Clock',
          onClick: () => setModal('MARK_SENT', letterId),
        };

      case 'ANSWER_QUESTIONS':
        return {
          title: 'Clarification Needed for Legal Grounding',
          description: next.text,
          buttonText: 'Answer 2 Questions',
          onClick: () => setModal('ANSWER_QUESTIONS'),
        };

      case 'WAIT':
        return {
          title: 'Bank Statutory Clock is Running',
          description: next.text + (next.dueOn ? ` Expected resolution by: ${next.dueOn}` : ''),
          buttonText: 'View Clock',
          onClick: () => {
            const el = document.getElementById('statutory-deadlines-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
        };

      case 'SEE_LEGAL_AID':
        return {
          title: 'Safety Protection: Free Legal Aid Referral',
          description: next.text,
          buttonText: 'View Legal Aid',
          onClick: () => {
            const el = document.getElementById('referral-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
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
    <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 max-w-xl">
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {action.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {action.description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
          <Button
            size="default"
            variant="default"
            onClick={action.onClick}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-[0.98] transition-all"
          >
            <span>{action.buttonText}</span>
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

import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Send,
  HelpCircle,
  Clock,
  PhoneCall,
  Upload,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function NextStepHero() {
  const { caseData, setModal, letters } = useCase();

  if (!caseData || !caseData.nextStep) return null;

  const next = caseData.nextStep;
  const letterId = next.letterId || letters[0]?.id;

  const renderActionDetails = () => {
    switch (next.action) {
      case 'REVIEW_LETTER':
        return {
          icon: FileText,
          title: 'Action Required: Review & Approve Representation Letter',
          description: next.text,
          buttonText: 'Review & Print Representation',
          onClick: () => setModal('REVIEW_LETTER', letterId),
        };

      case 'SEND_LETTER':
        return {
          icon: Send,
          title: 'Letter Approved: Deliver to Bank Branch',
          description: 'Print it, email it, or hand it in at your branch. Then click below to start the statutory 7-day clock.',
          buttonText: 'Mark Sent & Start 7-Day Clock',
          onClick: () => setModal('MARK_SENT', letterId),
        };

      case 'ANSWER_QUESTIONS':
        return {
          icon: HelpCircle,
          title: 'Clarification Needed for Legal Grounding',
          description: next.text,
          buttonText: 'Answer 2 Quick Questions',
          onClick: () => setModal('ANSWER_QUESTIONS'),
        };

      case 'WAIT':
        return {
          icon: Clock,
          title: 'Bank Statutory Clock is Running',
          description: next.text + (next.dueOn ? ` Expected resolution by: ${next.dueOn}` : ''),
          buttonText: 'View Statutory Countdown',
          onClick: () => {
            const el = document.getElementById('statutory-deadlines-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
        };

      case 'SEE_LEGAL_AID':
        return {
          icon: PhoneCall,
          title: 'Safety Protection: Free Legal Aid Referral',
          description: next.text,
          buttonText: 'View Legal Aid Instructions & Helpline',
          onClick: () => {
            const el = document.getElementById('referral-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          },
        };

      case 'UPLOAD_PAPERS':
        return {
          icon: Upload,
          title: 'Add Bank Notice & Statement',
          description: next.text,
          buttonText: 'Upload Documents Now',
          onClick: () => setModal('UPLOAD_PAPERS'),
        };

      default:
        return {
          icon: ShieldCheck,
          title: 'Case Under Active Monitoring',
          description: next.text,
          buttonText: 'View Audit Log',
          onClick: () => {},
        };
    }
  };

  const action = renderActionDetails();
  const ActionIcon = action.icon;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
            <ActionIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="uppercase tracking-wider text-[11px] font-mono">
              Immediate Statutory Action
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
            {action.title}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
            {action.description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto pt-1 md:pt-0">
          <Button
            size="lg"
            variant="default"
            onClick={action.onClick}
            className="group w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-bold justify-center bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-[0.98] transition-all"
          >
            <span>{action.buttonText}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          {caseData.stage === 'WAITING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModal('RECORD_REPLY')}
              className="w-full sm:w-auto h-9 text-xs justify-center border-border bg-secondary/50 text-foreground hover:bg-secondary"
            >
              Received Bank Response? Record It
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

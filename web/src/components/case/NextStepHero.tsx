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
  CheckCircle2,
} from 'lucide-react';

export function NextStepHero() {
  const { caseData, setModal, letters, deadlines } = useCase();

  if (!caseData || !caseData.nextStep) return null;

  const next = caseData.nextStep;
  const letterId = next.letterId || letters[0]?.id;

  const renderActionDetails = () => {
    switch (next.action) {
      case 'REVIEW_LETTER':
        return {
          icon: FileText,
          title: 'Step Required: Review & Approve Representation Letter',
          description: next.text,
          buttonText: 'Review Representation Letter',
          buttonVariant: 'hero' as const,
          onClick: () => setModal('REVIEW_LETTER', letterId),
        };

      case 'SEND_LETTER':
        return {
          icon: Send,
          title: 'Letter Approved: Now Deliver It to Your Branch',
          description: 'Print it, email it, WhatsApp it, or hand it in at your branch. Then click below to start the statutory 7-day clock.',
          buttonText: 'Mark as Sent & Start 7-Day Clock',
          buttonVariant: 'hero' as const,
          onClick: () => setModal('MARK_SENT', letterId),
        };

      case 'ANSWER_QUESTIONS':
        return {
          icon: HelpCircle,
          title: 'Clarification Needed for Legal Grounding',
          description: next.text,
          buttonText: 'Answer 2 Quick Questions',
          buttonVariant: 'hero' as const,
          onClick: () => setModal('ANSWER_QUESTIONS'),
        };

      case 'WAIT':
        return {
          icon: Clock,
          title: 'Bank Statutory Clock is Running',
          description: next.text + (next.dueOn ? ` Expected resolution by: ${next.dueOn}` : ''),
          buttonText: 'View Statutory Clocks',
          buttonVariant: 'outline' as const,
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
          buttonVariant: 'destructive' as const,
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
          buttonVariant: 'hero' as const,
          onClick: () => setModal('UPLOAD_PAPERS'),
        };

      default:
        return {
          icon: ShieldCheck,
          title: 'Case Under Active Monitoring',
          description: next.text,
          buttonText: 'View Audit Log',
          buttonVariant: 'outline' as const,
          onClick: () => {},
        };
    }
  };

  const action = renderActionDetails();
  const ActionIcon = action.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-900/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Subtle background glow effect */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">
            <ActionIcon className="h-3.5 w-3.5 text-indigo-300" />
            <span className="uppercase tracking-wider text-[11px] text-indigo-200">
              Immediate Next Action
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {action.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {action.description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <Button
            size="lg"
            variant="default"
            onClick={action.onClick}
            className="group h-12 px-6 rounded-xl text-base font-semibold bg-white text-slate-950 hover:bg-slate-100 shadow-lg active:scale-[0.98] transition-all"
          >
            <span>{action.buttonText}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          {caseData.stage === 'WAITING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModal('RECORD_REPLY')}
              className="h-10 text-xs border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Received Bank Response? Record It
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


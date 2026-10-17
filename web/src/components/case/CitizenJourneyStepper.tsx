import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Check, ShieldCheck } from 'lucide-react';

export function CitizenJourneyStepper() {
  const { caseData, letters, setModal } = useCase();

  if (!caseData) return null;

  const isApproved = letters.some(l => l.status === 'APPROVED');
  const isSent = letters.some(l => l.status === 'SENT');
  const isResolved = caseData.stage === 'RESOLVED' || caseData.stage === 'PARTLY_RELEASED';

  const steps = [
    {
      number: 1,
      title: 'Papers Uploaded',
      desc: 'Bank SMS, statement & receipt received',
      status: 'COMPLETED' as const,
      onClick: () => setModal('UPLOAD_PAPERS'),
    },
    {
      number: 2,
      title: 'AI Statutory Grounding',
      desc: 'Section 106 & MHA SOP checked',
      status: 'COMPLETED' as const,
      onClick: undefined,
    },
    {
      number: 3,
      title: 'Approve Letter',
      desc: isApproved ? 'Approved by you' : 'Needs your approval',
      status: isApproved ? ('COMPLETED' as const) : ('ACTIVE' as const),
      onClick: () => setModal('REVIEW_LETTER', letters[0]?.id),
    },
    {
      number: 4,
      title: 'Bank 7-Day Release',
      desc: isSent ? '7-Day timer running' : 'Starts upon delivery',
      status: isResolved ? ('COMPLETED' as const) : isSent ? ('ACTIVE' as const) : ('UPCOMING' as const),
      onClick: isSent
        ? () => {
            const el = document.getElementById('statutory-deadlines-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        : undefined,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-subtle transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          Statutory Unfreeze Roadmap:
        </span>
        <span className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
          Step {isSent ? '4 of 4' : isApproved ? '3 of 4' : '3 of 4'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 relative">
        {steps.map(s => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';

          return (
            <button
              key={s.number}
              type="button"
              disabled={!s.onClick}
              onClick={s.onClick}
              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between card-hover-micro active:scale-[0.99] ${
                isCurrent
                  ? 'border-emerald-600 bg-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm glow-emerald'
                  : isDone
                  ? 'border-border bg-secondary/30'
                  : 'border-border/60 bg-muted/20 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-foreground text-background'
                        : isCurrent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.number}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-semibold uppercase ${
                      isDone
                        ? 'text-muted-foreground'
                        : isCurrent
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {isDone ? 'Complete' : isCurrent ? 'Next Action' : 'Pending'}
                  </span>
                </div>

                <div className="font-bold text-xs text-foreground">
                  {s.title}
                </div>

                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {s.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


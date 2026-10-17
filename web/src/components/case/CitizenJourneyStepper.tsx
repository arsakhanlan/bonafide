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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 stroke-[1.75]" />
          Statutory Unfreeze Roadmap:
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          Step {isSent ? '4 of 4' : isApproved ? '3 of 4' : '3 of 4'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
        {steps.map(s => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';

          return (
            <button
              key={s.number}
              type="button"
              disabled={!s.onClick}
              onClick={s.onClick}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between card-hover-micro ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20 ring-1 ring-blue-500/20 shadow-subtle'
                  : isDone
                  ? 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60'
                  : 'border-slate-200/60 bg-slate-50/30 dark:border-slate-800/60 dark:bg-slate-900/30 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.number}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-semibold uppercase ${
                      isDone
                        ? 'text-slate-600 dark:text-slate-400'
                        : isCurrent
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {isDone ? 'Complete' : isCurrent ? 'Next Action' : 'Pending'}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
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


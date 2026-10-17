import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Check, ShieldCheck, Clock } from 'lucide-react';

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
      title: 'At Statutory Grounding',
      desc: 'BNSS §106 & SOP checked',
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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          STATUTORY UNFREEZE ROADMAP
        </span>

        {/* Small Timer pill in top right corner matching reference */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/80 text-muted-foreground border border-border/60 text-xs font-mono">
          <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Timer 7:56</span>
        </div>
      </div>

      {/* Clean Stepper: Numbers on a line with descriptions underneath, matching reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
        {steps.map((s, idx) => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';
          const isUpcoming = s.status === 'UPCOMING';

          return (
            <div
              key={s.number}
              onClick={s.onClick}
              className={`flex flex-col relative ${s.onClick ? 'cursor-pointer' : ''}`}
            >
              {/* Stepper Node row with connecting line segments */}
              <div className="flex items-center w-full relative mb-2.5">
                {/* Connecting track line to previous node */}
                <div
                  className={`h-[2.5px] flex-1 ${
                    idx === 0
                      ? 'invisible'
                      : isDone || isCurrent
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                      : 'bg-border/60'
                  }`}
                />

                {/* Node Circle */}
                <div className="relative z-10 shrink-0 mx-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/25 ring-offset-2 ring-offset-card'
                        : 'bg-secondary border border-border/80 text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <span>{s.number}</span>
                    )}
                  </div>
                </div>

                {/* Connecting track line to next node */}
                <div
                  className={`h-[2.5px] flex-1 ${
                    idx === steps.length - 1
                      ? 'invisible'
                      : isDone && steps[idx + 1]?.status === 'COMPLETED'
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                      : isDone && steps[idx + 1]?.status === 'ACTIVE'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-border/60'
                  }`}
                />
              </div>

              {/* Labels below node */}
              <div className="text-center sm:text-left px-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h4
                    className={`font-bold text-xs sm:text-[13px] leading-tight ${
                      isCurrent
                        ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                        : isDone
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {s.title}
                  </h4>
                </div>

                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

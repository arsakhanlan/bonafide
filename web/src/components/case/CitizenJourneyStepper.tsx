import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { audienceOf } from '@/lib/letterAudience';

type StepStatus = 'COMPLETED' | 'ACTIVE' | 'UPCOMING';

/** A hairline that fills with emerald as the journey advances. */
function ProgressLine({ active, hidden = false }: { active: boolean; hidden?: boolean }) {
  if (hidden) return <div className="h-[2.5px] flex-1" />;
  return (
    <div className="relative h-[2.5px] flex-1 overflow-hidden rounded-full bg-border/60">
      <span
        className={cn(
          'absolute inset-y-0 left-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30 transition-[width] duration-700 ease-out',
          active ? 'w-full' : 'w-0'
        )}
      />
    </div>
  );
}

export function CitizenJourneyStepper() {
  const { caseData, letters, documents, setModal } = useCase();

  if (!caseData) return null;

  const stage = caseData.stage;
  const hasPapers = documents.length > 0;
  const hasApproved = letters.some(l => l.status === 'APPROVED' || l.status === 'SENT');
  const hasSent = letters.some(l => l.status === 'SENT');
  const done = stage === 'RESOLVED' || stage === 'PARTLY_RELEASED';
  const ended = stage === 'REFERRED' || stage === 'NEEDS_LAWYER' || stage === 'FAILED';
  const lastSent = [...letters].reverse().find(l => l.status === 'SENT');
  const waitingOn = audienceOf(lastSent?.kind);
  const clockTitle =
    waitingOn === 'police'
      ? 'Police deadline'
      : waitingOn === 'district'
      ? 'District deadline'
      : 'Bank deadline';
  const waitingLabel =
    waitingOn === 'police'
      ? 'Waiting for the police'
      : waitingOn === 'district'
      ? 'Waiting for the district officer'
      : 'Waiting for the bank';

  const stepStatus = (s: StepStatus, alwaysDone = false): StepStatus => (alwaysDone || done ? 'COMPLETED' : s);

  const steps: Array<{
    number: number;
    title: string;
    desc: string;
    status: StepStatus;
    onClick?: () => void;
  }> = ended
    ? [
        { number: 1, title: 'Papers Read', desc: 'The agents checked your papers', status: 'COMPLETED', onClick: () => setModal('UPLOAD_PAPERS') },
        { number: 2, title: 'Safety Check', desc: stage === 'FAILED' ? 'Processing failed' : 'Case needs a lawyer', status: 'COMPLETED' },
        { number: 3, title: 'Next Step', desc: stage === 'FAILED' ? 'Upload clearer papers' : 'See the referral below', status: 'ACTIVE' },
      ]
    : [
        {
          number: 1,
          title: 'Papers Uploaded',
          desc: hasPapers ? `${documents.length} paper(s) received` : 'Add your bank SMS and statement',
          status: stepStatus(hasPapers || stage !== 'NEW' ? 'COMPLETED' : 'ACTIVE'),
          onClick: () => setModal('UPLOAD_PAPERS'),
        },
        {
          number: 2,
          title: 'AI review',
          desc: caseData.busy ? 'Agents are reading your papers' : 'We check the amounts and the law',
          status: stepStatus(caseData.busy ? 'ACTIVE' : stage !== 'NEW' && stage !== 'NEEDS_ANSWERS' ? 'COMPLETED' : 'UPCOMING'),
        },
        {
          number: 3,
          title: 'Approve Letter',
          desc: hasApproved ? 'Approved by you' : 'Review and approve',
          status: stepStatus(hasApproved ? 'COMPLETED' : stage === 'LETTER_READY' ? 'ACTIVE' : 'UPCOMING'),
          onClick: () => letters[0] && setModal('REVIEW_LETTER', letters[0].id),
        },
        {
          number: 4,
          title: clockTitle,
          desc: done ? 'Funds released' : hasSent ? waitingLabel : 'Starts when you deliver',
          status: stepStatus(hasSent || done ? (done ? 'COMPLETED' : 'ACTIVE') : 'UPCOMING'),
          onClick: hasSent
            ? () => {
                const el = document.getElementById('statutory-deadlines-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            : undefined,
        },
      ];

  return (
    <div className="animate-view-in [animation-delay:80ms] rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          <div>
            <span className="block text-xs font-bold tracking-tight text-foreground">Your progress</span>
            <span className="block text-[10px] font-medium text-muted-foreground">
              What happens, step by step
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: a vertical timeline; the whole row is tappable. */}
      <ol className="sm:hidden">
        {steps.map((s, idx) => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';
          const next = steps[idx + 1];
          const lineActive =
            isDone && (next?.status === 'COMPLETED' || next?.status === 'ACTIVE');

          return (
            <li
              key={s.number}
              onClick={s.onClick}
              className={cn(
                'relative flex gap-3 pb-5 last:pb-0',
                s.onClick && 'cursor-pointer'
              )}
            >
              {idx < steps.length - 1 && (
                <span className="absolute bottom-0 left-[13px] top-7 w-0.5 overflow-hidden rounded-full bg-border/60">
                  <span
                    className={cn(
                      'block w-full rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30 transition-[height] duration-700 ease-out',
                      lineActive ? 'h-full' : 'h-0'
                    )}
                  />
                </span>
              )}
              <div
                className={cn(
                  'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isDone
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : isCurrent
                    ? 'roadmap-node-active bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/25'
                    : 'border border-border/80 bg-secondary text-muted-foreground'
                )}
              >
                {isDone ? (
                  <Check className="animate-check-pop h-4 w-4 stroke-[3]" />
                ) : (
                  <span>{s.number}</span>
                )}
              </div>
              <div className="min-w-0 pb-0.5">
                <h4
                  className={cn(
                    'text-[13px] font-bold leading-tight',
                    isCurrent
                      ? 'font-extrabold text-emerald-700 dark:text-emerald-300'
                      : isDone
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {s.title}
                </h4>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: numbers on a line with descriptions underneath */}
      <div className={`hidden sm:grid sm:gap-2 ${steps.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}>
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
                <ProgressLine hidden={idx === 0} active={isDone || isCurrent} />

                <div className="relative z-10 shrink-0 mx-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : isCurrent
                        ? 'roadmap-node-active bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/25 ring-offset-2 ring-offset-card'
                        : 'bg-secondary border border-border/80 text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <Check className="animate-check-pop h-4 w-4 stroke-[3]" />
                    ) : (
                      <span>{s.number}</span>
                    )}
                  </div>
                </div>

                <ProgressLine
                  hidden={idx === steps.length - 1}
                  active={
                    isDone &&
                    (steps[idx + 1]?.status === 'COMPLETED' ||
                      steps[idx + 1]?.status === 'ACTIVE')
                  }
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

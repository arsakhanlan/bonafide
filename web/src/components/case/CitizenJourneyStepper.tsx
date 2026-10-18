import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { audienceOf } from '@/lib/letterAudience';
import { latestLetter, latestSent } from '@/lib/letters';

type StepStatus = 'COMPLETED' | 'ACTIVE' | 'UPCOMING';

interface JourneyStep {
  id: string;
  title: string;
  desc: string;
  status: StepStatus;
  onClick?: () => void;
}

const STAGGER_MS = 80;

const BANK_KINDS = ['L1_BRANCH', 'L1_BANK_GRIEVANCE', 'L4_BACKSTOP', 'REMINDER'];
const ENFORCEMENT_KINDS = ['L2_OFFICER', 'L3_REVIEW', 'L3_DISTRICT'];

/** A hairline that fills from left to right as the journey advances. */
function ProgressLine({
  active,
  hidden = false,
  delay = 0,
}: {
  active: boolean;
  hidden?: boolean;
  delay?: number;
}) {
  if (hidden) return <div className="h-[2.5px] flex-1" />;
  return (
    <div className="relative h-[2.5px] flex-1 overflow-hidden rounded-full bg-border/60">
      <span
        style={{ transitionDelay: `${delay}ms` }}
        className={cn(
          'absolute inset-y-0 left-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30 transition-[width] duration-700 ease-out',
          active ? 'w-full' : 'w-0'
        )}
      />
    </div>
  );
}

export function CitizenJourneyStepper() {
  const { caseData, letters, documents, deadlines, setModal } = useCase();

  if (!caseData) return null;

  const stage = caseData.stage;
  const busy = caseData.busy;
  const hasPapers = documents.length > 0;
  const done = stage === 'RESOLVED' || stage === 'PARTLY_RELEASED';

  const bankLetters = letters.filter(l => BANK_KINDS.includes(l.kind));
  const enforcementLetters = letters.filter(l => ENFORCEMENT_KINDS.includes(l.kind));
  const policeLetters = letters.filter(l => l.kind === 'L2_OFFICER');
  const courtNotes = letters.filter(l => l.kind === 'L5_LAWYER_NOTES');

  const latestBank = latestLetter(bankLetters);
  const latestEnforcement = latestLetter(enforcementLetters);
  const courtStage = stage === 'NEEDS_LAWYER' && (courtNotes.length > 0 || policeLetters.length > 0);
  const safetyEnding =
    stage === 'REFERRED' || stage === 'FAILED' || (stage === 'NEEDS_LAWYER' && !courtStage);

  const lastSent = latestSent(letters);
  const waitingOn = audienceOf(lastSent?.kind);

  const bankClock = deadlines.find(d => d.clock === 'BANK_FILE_GRIEVANCE');
  const enforcementClock = deadlines.find(d =>
    ['OFFICER_DECIDE', 'DISTRICT_OFFICER_DECIDE'].includes(d.clock)
  );
  const met = (d: { status: string } | undefined) =>
    d?.status === 'MET' || d?.status === 'CANCELLED';

  const bankSent = bankLetters.some(l => l.status === 'SENT');
  const enforcementSent = enforcementLetters.some(l => l.status === 'SENT');
  const enforcementIsDistrict = latestEnforcement?.kind !== 'L2_OFFICER';

  const at = (status: StepStatus): StepStatus => (done ? 'COMPLETED' : status);

  const buildJourney = (): JourneyStep[] => {
    if (safetyEnding) {
      return [
        {
          id: 'papers',
          title: 'Papers Read',
          desc: 'The agents checked your papers',
          status: 'COMPLETED',
          onClick: () => setModal('UPLOAD_PAPERS'),
        },
        {
          id: 'safety',
          title: 'Safety Check',
          desc: stage === 'FAILED' ? 'Processing failed' : 'Case needs a lawyer',
          status: 'COMPLETED',
        },
        {
          id: 'next',
          title: stage === 'FAILED' ? 'Upload clearer papers' : 'Free legal aid',
          desc: stage === 'FAILED' ? 'Try once more' : 'See the referral below',
          status: 'ACTIVE',
        },
      ];
    }

    const steps: JourneyStep[] = [
      {
        id: 'papers',
        title: 'Papers',
        desc: hasPapers ? `${documents.length} received` : 'Add your papers',
        status: at(hasPapers || stage !== 'NEW' ? 'COMPLETED' : 'ACTIVE'),
        onClick: () => setModal('UPLOAD_PAPERS'),
      },
      {
        id: 'review',
        title: 'AI review',
        desc: busy ? 'Agents are reading' : 'Amounts and law checked',
        status: at(
          busy
            ? 'ACTIVE'
            : stage !== 'NEW' && stage !== 'NEEDS_ANSWERS'
            ? 'COMPLETED'
            : 'UPCOMING'
        ),
      },
    ];

    const bankLetterReady =
      stage === 'LETTER_READY' && enforcementLetters.length === 0 && !bankSent;
    const bankLetterStatus: StepStatus = bankSent
      ? 'COMPLETED'
      : bankLetterReady
      ? 'ACTIVE'
      : 'UPCOMING';

    steps.push({
      id: 'bank-letter',
      title: 'Bank letter',
      desc: bankSent
        ? 'Sent to the bank'
        : bankLetters.some(l => l.status === 'APPROVED')
        ? 'Approved — send it'
        : bankLetterReady
        ? 'Review and send'
        : 'We write it for you',
      status: at(bankLetterStatus),
      onClick: latestBank
        ? () => setModal('REVIEW_LETTER', latestBank.id)
        : undefined,
    });

    steps.push({
      id: 'bank-deadline',
      title: 'Bank deadline',
      desc: met(bankClock) || enforcementLetters.length > 0
        ? 'Bank replied'
        : stage === 'WAITING' && waitingOn === 'bank'
        ? 'Waiting for the bank'
        : 'Starts when you send it',
      status: at(
        met(bankClock) || enforcementLetters.length > 0
          ? 'COMPLETED'
          : stage === 'WAITING' && waitingOn === 'bank'
          ? 'ACTIVE'
          : 'UPCOMING'
      ),
      onClick: () => {
        document.getElementById('statutory-deadlines-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    });

    if (enforcementLetters.length > 0) {
      const letterTitle = enforcementIsDistrict ? 'District review' : 'Police letter';
      const deadlineTitle = enforcementIsDistrict ? 'District deadline' : 'Police deadline';
      const waitingLabel = enforcementIsDistrict ? 'Waiting for the district officer' : 'Waiting for the police';

      steps.push({
        id: 'enforcement-letter',
        title: letterTitle,
        desc: enforcementSent
          ? `Sent to the ${enforcementIsDistrict ? 'District Officer' : 'police'}`
          : latestEnforcement?.status === 'APPROVED'
          ? 'Approved — send it'
          : 'Review and send',
        status: at(enforcementSent ? 'COMPLETED' : 'ACTIVE'),
        onClick: latestEnforcement
          ? () => setModal('REVIEW_LETTER', latestEnforcement.id)
          : undefined,
      });

      steps.push({
        id: 'enforcement-deadline',
        title: deadlineTitle,
        desc: met(enforcementClock) || courtStage
          ? 'They replied'
          : stage === 'WAITING' && (waitingOn === 'police' || waitingOn === 'district')
          ? waitingLabel
          : 'Starts when you send it',
        status: at(
          met(enforcementClock) || courtStage
            ? 'COMPLETED'
            : stage === 'WAITING' && (waitingOn === 'police' || waitingOn === 'district')
            ? 'ACTIVE'
            : 'UPCOMING'
        ),
        onClick: () => {
          document.getElementById('statutory-deadlines-section')?.scrollIntoView({ behavior: 'smooth' });
        },
      });
    }

    if (courtStage) {
      steps.push({
        id: 'court',
        title: 'Court step',
        desc: 'Free legal aid + lawyer notes',
        status: 'ACTIVE',
        onClick: courtNotes[0]
          ? () => setModal('REVIEW_LETTER', courtNotes[0].id)
          : () => {
              document.getElementById('referral-section')?.scrollIntoView({ behavior: 'smooth' });
            },
      });
    }

    return steps.map((step, index) => ({ ...step, id: step.id || String(index) }));
  };

  const steps = buildJourney();

  const longJourney = steps.length > 5;
  const columnsClass =
    steps.length >= 7
      ? 'lg:grid-cols-7'
      : steps.length === 6
      ? 'lg:grid-cols-6'
      : steps.length === 5
      ? 'sm:grid-cols-5'
      : steps.length === 4
      ? 'sm:grid-cols-4'
      : 'sm:grid-cols-3';

  return (
    <div className="animate-view-in [animation-delay:80ms] rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          <div>
            <span className="block text-xs font-bold tracking-tight text-foreground">
              Your progress
            </span>
            <span className="block text-[10px] font-medium text-muted-foreground">
              What happens, step by step
            </span>
          </div>
        </div>
      </div>

      {/* Vertical timeline on phones, and on tablets for long journeys. */}
      <ol className={longJourney ? 'lg:hidden' : 'sm:hidden'}>
        {steps.map((s, idx) => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';
          const next = steps[idx + 1];
          const lineActive =
            isDone && (next?.status === 'COMPLETED' || next?.status === 'ACTIVE');

          return (
            <li
              key={s.id}
              onClick={s.onClick}
              className={cn('relative flex gap-3 pb-5 last:pb-0', s.onClick && 'cursor-pointer')}
            >
              {idx < steps.length - 1 && (
                <span className="absolute bottom-0 left-[13px] top-7 w-0.5 overflow-hidden rounded-full bg-border/60">
                  <span
                    style={{ transitionDelay: `${idx * STAGGER_MS}ms` }}
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
                  <Check
                    style={{ animationDelay: `${idx * STAGGER_MS}ms` }}
                    className="animate-check-pop h-4 w-4 stroke-[3]"
                  />
                ) : (
                  <span>{idx + 1}</span>
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

      {/* Wide screens: numbers on a line with descriptions underneath. */}
      <div className={`hidden gap-2 ${longJourney ? 'lg:grid' : 'sm:grid'} ${columnsClass}`}>
        {steps.map((s, idx) => {
          const isDone = s.status === 'COMPLETED';
          const isCurrent = s.status === 'ACTIVE';

          return (
            <div
              key={s.id}
              onClick={s.onClick}
              className={`relative flex flex-col ${s.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className="relative mb-2.5 flex w-full items-center">
                <ProgressLine
                  hidden={idx === 0}
                  active={isDone || isCurrent}
                  delay={idx * STAGGER_MS}
                />

                <div className="relative z-10 mx-2 shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-8 sm:w-8 ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : isCurrent
                        ? 'roadmap-node-active bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/25 ring-offset-2 ring-offset-card'
                        : 'border border-border/80 bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <Check
                        style={{ animationDelay: `${idx * STAGGER_MS}ms` }}
                        className="animate-check-pop h-4 w-4 stroke-[3]"
                      />
                    ) : (
                      <span>{idx + 1}</span>
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
                  delay={idx * STAGGER_MS}
                />
              </div>

              <div className="px-1 text-center sm:text-left">
                <h4
                  className={`text-xs font-bold leading-tight sm:text-[13px] ${
                    isCurrent
                      ? 'font-extrabold text-emerald-700 dark:text-emerald-300'
                      : isDone
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </h4>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
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

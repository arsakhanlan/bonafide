import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoStepIndex } from '@/lib/demoFlow';

const STEPS = ['Papers', 'Analysis', 'Letter', 'Clock', 'Outcome'] as const;

const PERSONA_LABEL: Record<string, string> = {
  RAVI: 'Ravi · Shopkeeper',
  MEERA: 'Meera · Freelancer',
  ARJUN: 'Arjun · Crypto P2P',
  SUNIL: 'Sunil · Account lending',
};

export function DemoJourneyBar({ onRestart }: { onRestart: () => void }) {
  const { caseData } = useCase();
  if (!caseData) return null;

  const current = demoStepIndex(caseData);
  const persona = caseData.demo?.persona;
  const label = persona ? PERSONA_LABEL[persona] : 'Guided walkthrough';

  return (
    <div className="animate-view-in flex flex-col gap-2.5 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.08] via-card to-teal-500/[0.06] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Demo
        </span>
        <span className="truncate text-[11px] font-semibold text-foreground">{label}</span>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">
          Step {current + 1} of 5 · {STEPS[current]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <ol className="hidden items-center gap-1 md:flex" aria-label="Demo journey progress">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-1">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold transition-colors',
                  index < current
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : index === current
                    ? 'border-emerald-500 bg-card text-emerald-700 ring-2 ring-emerald-500/20 dark:text-emerald-300'
                    : 'border-border bg-card text-muted-foreground'
                )}
              >
                {index < current ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  index === current ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className={cn(
                    'mx-0.5 h-px w-2 transition-colors duration-500',
                    index < current ? 'bg-emerald-500' : 'bg-border'
                  )}
                />
              )}
            </li>
          ))}
        </ol>

        <span className="text-[10px] font-medium text-muted-foreground md:hidden">
          {current + 1}/5 · {STEPS[current]}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRestart}
          className="h-9 px-2.5 text-[11px] text-muted-foreground hover:text-foreground sm:h-7 sm:px-2"
        >
          <RotateCcw className="h-3 w-3" />
          Restart
        </Button>
      </div>
    </div>
  );
}

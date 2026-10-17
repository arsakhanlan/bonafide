import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { FastForward, Clock, CalendarDays, Loader2 } from 'lucide-react';

export function TimeMachineSkip() {
  const { skipTime, isProcessing, simulatedDays, currentSimulatedDate } = useCase();

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-subtle transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
          <FastForward className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Evaluator Time Machine
            </span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground">
              Date: {currentSimulatedDate}
            </span>
            {simulatedDays > 0 && (
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                (+{simulatedDays}d)
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Advance statutory clocks to test expiry sweeps, reminders, and escalation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-full md:w-auto md:flex md:items-center md:gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(1)}
          className="h-9 px-2 sm:px-3 text-xs justify-center bg-card hover:bg-secondary border-border active:scale-[0.98] transition-all"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 sm:mr-1" /> : <Clock className="h-3.5 w-3.5 shrink-0 sm:mr-1 text-muted-foreground" />}
          <span className="truncate">+1 Day</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(7)}
          className="h-9 px-2 sm:px-3 text-xs justify-center bg-card hover:bg-secondary border-border active:scale-[0.98] transition-all"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 sm:mr-1" /> : <CalendarDays className="h-3.5 w-3.5 shrink-0 sm:mr-1 text-muted-foreground" />}
          <span className="hidden lg:inline">+7 Days (Bank Clock)</span>
          <span className="lg:hidden truncate">+7 Days</span>
        </Button>

        <Button
          size="sm"
          variant="default"
          disabled={isProcessing}
          onClick={() => skipTime(8)}
          className="h-9 px-2 sm:px-3 text-xs justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98] transition-all"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 sm:mr-1" /> : <FastForward className="h-3.5 w-3.5 shrink-0 sm:mr-1" />}
          <span className="hidden lg:inline">+8 Days (Overdue Reminder)</span>
          <span className="lg:hidden truncate">+8 Days</span>
        </Button>
      </div>
    </div>
  );
}

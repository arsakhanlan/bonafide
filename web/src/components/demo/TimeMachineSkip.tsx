import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { FastForward, Clock, CalendarDays, Loader2 } from 'lucide-react';

export function TimeMachineSkip() {
  const { skipTime, isProcessing, simulatedDays, currentSimulatedDate, caseData } = useCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-sky-50/60 p-3.5 shadow-sm dark:border-blue-900/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-sky-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <FastForward className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Evaluator Time Machine
            </span>
            <span className="rounded-md bg-blue-200/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-200">
              Today: {currentSimulatedDate}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Advance statutory clocks to test automated expiry sweeps, reminders, and escalation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(1)}
          className="h-8 text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Clock className="h-3.5 w-3.5 mr-1 text-blue-600" />}
          +1 Day
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(7)}
          className="h-8 text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CalendarDays className="h-3.5 w-3.5 mr-1 text-indigo-600" />}
          +7 Days (Bank Clock)
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(8)}
          className="h-8 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <FastForward className="h-3.5 w-3.5 mr-1" />}
          +8 Days (Overdue Reminder)
        </Button>
      </div>
    </div>
  );
}


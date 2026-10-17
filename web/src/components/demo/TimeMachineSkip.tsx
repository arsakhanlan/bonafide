import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { FastForward, Clock, CalendarDays, Loader2 } from 'lucide-react';

export function TimeMachineSkip() {
  const { skipTime, isProcessing, simulatedDays, currentSimulatedDate } = useCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <FastForward className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Evaluator Time Machine
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Date: {currentSimulatedDate}
            </span>
            {simulatedDays > 0 && (
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                (+{simulatedDays}d)
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Advance statutory clocks to test expiry sweeps, reminders, and escalation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(1)}
          className="h-8 text-xs bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Clock className="h-3.5 w-3.5 mr-1 text-slate-500" />}
          +1 Day
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => skipTime(7)}
          className="h-8 text-xs bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CalendarDays className="h-3.5 w-3.5 mr-1 text-slate-500" />}
          +7 Days (Bank Clock)
        </Button>

        <Button
          size="sm"
          variant="default"
          disabled={isProcessing}
          onClick={() => skipTime(8)}
          className="h-8 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm"
        >
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <FastForward className="h-3.5 w-3.5 mr-1" />}
          +8 Days (Overdue Reminder)
        </Button>
      </div>
    </div>
  );
}

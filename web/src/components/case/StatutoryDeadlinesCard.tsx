import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle, Calendar, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function StatutoryDeadlinesCard() {
  const { deadlines, caseData } = useCase();

  return (
    <Card id="statutory-deadlines-section" className="border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Statutory Clocks & Compliance Deadlines
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            MHA SOP / RBI Redressal
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {deadlines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <Clock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No active statutory clocks running
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Once you deliver your representation letter to the bank and mark it as sent, the bank's strict 7-day compliance timer will start here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map(d => {
              const isExpired = d.status === 'EXPIRED';
              const daysLeft = d.daysRemaining ?? 7;
              const progressPct = isExpired ? 100 : Math.max(10, Math.min(100, ((7 - daysLeft) / 7) * 100));

              return (
                <div
                  key={d.id}
                  className={`rounded-xl border p-4.5 transition-all ${
                    isExpired
                      ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {d.title}
                        </span>
                        <Badge
                          variant={isExpired ? 'destructive' : 'info'}
                          className="text-[10px] py-0 h-4.5 font-medium"
                        >
                          {isExpired ? 'STATUTORY DEADLINE EXPIRED' : `${daysLeft} days remaining`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-muted-foreground">
                        Statutory Due Date
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center sm:justify-end gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(d.dueOn)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Day 0 (Dispatched)</span>
                      <span>Day 7 (Statutory Deadline)</span>
                    </div>
                    <Progress
                      value={progressPct}
                      className={isExpired ? '[&>div]:bg-rose-600' : '[&>div]:bg-blue-600'}
                    />
                  </div>

                  {isExpired && (
                    <div className="mt-3 rounded-lg bg-rose-100/70 p-2.5 text-xs text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 flex items-start gap-2 font-medium">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div>
                        Bank compliance window lapsed without lien resolution. The AI has automatically queued a formal Overdue Reminder Notice and escalation to Banking Ombudsman.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


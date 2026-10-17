import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Scale,
  Building2,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Timer,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function StatutoryDeadlinesCard() {
  const { deadlines, caseData, isProcessing, setModal } = useCase();
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  const primaryDeadline = deadlines.find(d => d.clock === 'BANK_FILE_GRIEVANCE') || deadlines[0];
  const isExpired = primaryDeadline?.status === 'EXPIRED';
  const daysRemaining = primaryDeadline?.daysRemaining ?? (isExpired ? 0 : 7);

  const dayMilestones = [1, 2, 3, 4, 5, 6, 7];
  const elapsedDays = Math.max(0, Math.min(7, 7 - daysRemaining));

  // Circular gauge calculation (stroke dasharray)
  // Circumference for r=42 is 2 * PI * 42 ~= 263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, daysRemaining / 7));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <Card id="statutory-deadlines-section" className="border-border bg-card shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Statutory Compliance Clocks
          </CardTitle>
        </div>

        {isExpired ? (
          <Badge variant="destructive" className="font-mono text-[10px] py-0 h-5">
            OVERDUE
          </Badge>
        ) : (
          <Badge variant="outline" className="font-mono text-[10px] py-0 h-5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            {daysRemaining} DAYS REMAINING
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Circular Gauge and Statutory Phase in side-by-side or stacked container */}
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
          {/* Circular Countdown Dial matching reference */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20 border border-border/60 shrink-0 w-36 h-36 relative">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-muted/40 fill-none"
                strokeWidth="6"
                strokeDasharray="4 2"
              />
              {/* Progress active circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-700 fill-none ${
                  isExpired
                    ? 'stroke-rose-500'
                    : 'stroke-emerald-500'
                }`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono leading-none ${
                isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
              }`}>
                {isExpired ? '00' : String(daysRemaining).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground mt-0.5 leading-tight">
                Days<br />Remaining
              </span>
            </div>
          </div>

          {/* Right Side: Compliance notice box */}
          <div className="flex-1 rounded-xl bg-secondary/30 border border-border/70 p-3.5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Timer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>7-Day Compliance Notice</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Bank is statutory obligated under MHA SOP Cl. 10.1 & BNSS §106 to record formal representation and restrict lien solely to ₹2,000.
              </p>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
              <span>Obligated: {caseData?.money?.bankName || 'Branch'}</span>
              <span>Due: {formatDate(primaryDeadline?.dueOn || '2026-10-24')}</span>
            </div>
          </div>
        </div>

        {/* 7-Day Stepper horizontal track matching screenshot */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-foreground text-[11px] flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              7-Day Compliance Clocks
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {isExpired ? '7 of 7 Days Lapsed' : `${elapsedDays} of 7 Days Passed`}
            </span>
          </div>

          {/* Connected thin segments matching reference */}
          <div className="grid grid-cols-7 gap-1.5">
            {dayMilestones.map(day => {
              const isPassed = elapsedDays >= day || isExpired;
              const isCurrent = elapsedDays + 1 === day && !isExpired;

              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isExpired
                        ? 'bg-rose-500'
                        : isPassed
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono ${
                      isCurrent
                        ? 'font-bold text-emerald-600 dark:text-emerald-400'
                        : isPassed
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                    }`}
                  >
                    D{day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue alert if expired */}
        {isExpired && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 dark:text-rose-200 text-xs">
                  Statutory Default: 7-Day Window Lapsed
                </h4>
                <p className="text-[11px] text-rose-900/90 dark:text-rose-300/90 mt-0.5 leading-relaxed">
                  The bank has exceeded the legal period to log your grievance.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setModal('REVIEW_LETTER', 'REMINDER_L1_BANK')}
              className="h-7 text-xs font-semibold gap-1.5 justify-center w-full sm:w-auto"
            >
              <FileText className="h-3 w-3" />
              Review Overdue Escalation Letter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

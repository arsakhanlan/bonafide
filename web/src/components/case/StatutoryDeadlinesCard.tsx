import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Scale,
  Building2,
  FileText,
  FastForward,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Timer,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function StatutoryDeadlinesCard() {
  const { deadlines, caseData, skipTime, isProcessing, setModal } = useCase();
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  const primaryDeadline = deadlines.find(d => d.clock === 'BANK_FILE_GRIEVANCE') || deadlines[0];
  const isExpired = primaryDeadline?.status === 'EXPIRED';
  const daysRemaining = primaryDeadline?.daysRemaining ?? (isExpired ? 0 : 7);

  const dayMilestones = [1, 2, 3, 4, 5, 6, 7];
  const elapsedDays = Math.max(0, Math.min(7, 7 - daysRemaining));

  const statutoryPhases = [
    {
      step: 1,
      name: 'Bank 7-Day Grievance Window',
      actor: 'Bank Branch / Nodal Desk',
      statute: 'MHA SOP Cl. 10.1(a) & BNSS §106',
      duration: '7 Days',
      desc: 'Bank must record formal grievance and restrict lien solely to disputed amount.',
      status: isExpired ? 'EXPIRED' : primaryDeadline ? 'ACTIVE' : 'READY',
    },
    {
      step: 2,
      name: 'Police IO 15-Day Determination',
      actor: 'Cyber Police IO',
      statute: 'MHA SOP Cl. 10.1(d)-(f)',
      duration: '15 Days',
      desc: 'Investigating Officer reviews tax invoice & proof of consideration to issue partial unfreeze order.',
      status: 'UPCOMING',
    },
    {
      step: 3,
      name: '90-Day Absolute Backstop Release',
      actor: 'Scheduled Commercial Bank',
      statute: 'MHA SOP Cl. 10.1 (90-Day Mandate)',
      duration: '90 Days',
      desc: 'Statutory mandate: Bank must automatically lift hold if police do not produce judicial extension.',
      status: 'UPCOMING',
    },
  ];

  return (
    <Card id="statutory-deadlines-section" className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-slate-800 dark:text-slate-200" />
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Statutory Compliance Clocks
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {isExpired ? (
              <Badge variant="destructive" className="font-mono text-xs">
                STATUTORY DEFAULT (DAY 8+)
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-xs border-slate-300 dark:border-slate-700">
                CLOCK RUNNING: {daysRemaining} DAYS LEFT
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Main Countdown Box */}
        <div
          className={`rounded-xl border p-4 sm:p-5 transition-all ${
            isExpired
              ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
              : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-slate-200/70 dark:border-slate-800">
            {/* Countdown Digits */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                Primary Statutory Window:
              </span>
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-3xl sm:text-5xl font-black font-mono tracking-tight num-tabular ${
                    isExpired
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isExpired ? '00' : String(daysRemaining).padStart(2, '0')}
                </span>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                    {isExpired ? 'Days (Lapsed)' : 'Days Remaining'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Due: {formatDate(primaryDeadline?.dueOn || '2026-10-24')} (5:00 PM IST)
                  </span>
                </div>
              </div>
            </div>

            {/* Target Obligation Note */}
            <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-xs space-y-1 w-full md:max-w-sm">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Building2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                <span>Obligated: {caseData?.money?.bankName || 'Branch Manager'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Must log Section 106 grievance and restrict lien to{' '}
                <strong className="text-slate-900 dark:text-slate-100 font-mono">₹2,000</strong>. Remaining funds must be unlocked.
              </p>
            </div>
          </div>

          {/* 7 Segmented Blocks */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                7-Day Compliance Stepper:
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {isExpired ? '7 of 7 Days Elapsed' : `${elapsedDays} of 7 Days Elapsed`}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {dayMilestones.map(day => {
                const isPassed = elapsedDays >= day || isExpired;
                const isCurrent = elapsedDays + 1 === day && !isExpired;

                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        isExpired
                          ? 'bg-rose-500'
                          : isPassed
                          ? 'bg-slate-900 dark:bg-slate-100'
                          : isCurrent
                          ? 'bg-blue-600 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono ${
                        isCurrent
                          ? 'font-bold text-blue-600 dark:text-blue-400'
                          : isPassed
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      D{day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breach Warning when Expired */}
          {isExpired && (
            <div className="mt-4 rounded-lg border border-rose-300 bg-rose-100/50 dark:border-rose-900/60 dark:bg-rose-950/30 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-100 text-xs">
                    Statutory Default: Bank Exceeded 7 Calendar Days
                  </h4>
                  <p className="text-[11px] text-rose-900/90 dark:text-rose-200/90 mt-0.5 leading-relaxed">
                    Under MHA SOP Cl. 10.1(a), the bank was legally required to log your grievance by{' '}
                    <strong>{formatDate(primaryDeadline?.dueOn)}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-rose-200 dark:border-rose-900/60">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setModal('REVIEW_LETTER', 'REMINDER_L1_BANK')}
                  className="w-full sm:w-auto h-8 text-xs font-semibold gap-1.5 justify-center"
                >
                  <FileText className="h-3 w-3" />
                  Review Overdue Reminder Letter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3-Stage Statutory Defense Pipeline */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              Statutory Defense Pipeline
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              MHA SOP Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {statutoryPhases.map(phase => {
              const isActive = phase.status === 'ACTIVE';
              const isPhaseExpired = phase.status === 'EXPIRED';

              return (
                <div
                  key={phase.step}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    isPhaseExpired
                      ? 'border-rose-300 bg-rose-50/20 dark:border-rose-900/50 dark:bg-rose-950/20'
                      : isActive
                      ? 'border-slate-900 bg-slate-50 text-slate-900 dark:border-slate-100 dark:bg-slate-900 dark:text-slate-100'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                      Phase 0{phase.step}
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 h-4 font-mono">
                      {phase.duration}
                    </Badge>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                    {phase.name}
                  </h5>

                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Statutory Rulebook */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLegalDetails(!showLegalDetails)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span>Statutory Rulebook & Legal Remedies</span>
            </div>
            {showLegalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showLegalDetails && (
            <div className="p-3.5 bg-white dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <strong className="text-slate-900 dark:text-slate-100">1. MHA Cyber SOP Cl. 10.1(a) (Mandatory 7-Day Window):</strong>
                <p className="text-muted-foreground leading-relaxed pl-2.5 border-l-2 border-slate-400">
                  Bank branch must record grievance within 7 calendar days and restrict debit restrictions to contested amount.
                </p>
              </div>

              <div className="space-y-0.5">
                <strong className="text-slate-900 dark:text-slate-100">2. Section 106 BNSS (Proportional Lien Rule):</strong>
                <p className="text-muted-foreground leading-relaxed pl-2.5 border-l-2 border-slate-400">
                  Police seizure requisitions cannot freeze innocent surplus funds.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

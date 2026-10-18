import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapse } from '@/components/ui/collapse';
import {
  Clock,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  Ban,
  FileText,
} from 'lucide-react';
import { formatDate, todayInIndia } from '@/lib/utils';

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + 'T00:00:00Z').getTime();
  const b = new Date(toIso + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

export function StatutoryDeadlinesCard() {
  const { deadlines, caseData, setModal, letters } = useCase();
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  if (deadlines.length === 0) return null;

  // A demo case lives on its pretend date; a real case on the real date.
  const today = caseData?.demo?.today || todayInIndia();

  const enriched = deadlines.map(d => {
    if (d.status !== 'PENDING') return d;
    const left = daysBetween(today, d.dueOn);
    return { ...d, daysRemaining: Math.max(0, left) };
  });

  const pending = enriched.filter(d => d.status === 'PENDING');
  const primary = pending[0];
  const expired = enriched.find(d => d.status === 'EXPIRED');
  const met = enriched.filter(d => d.status === 'MET');
  const cancelled = enriched.filter(d => d.status === 'CANCELLED');

  const daysRemaining = primary?.daysRemaining ?? 0;
  const overdueLetterId =
    (caseData?.nextStep?.action === 'REVIEW_LETTER' && caseData.nextStep.letterId) || letters[0]?.id || null;

  const circumference = 2 * Math.PI * 42;
  const progressRatio = primary ? Math.max(0, Math.min(1, daysRemaining / 7)) : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <Card id="statutory-deadlines-section" className="scroll-mt-24 border-border bg-card shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Deadlines
          </CardTitle>
        </div>

        {expired ? (
          <Badge variant="destructive" className="font-mono text-[10px] py-0 h-5">
            OVERDUE
          </Badge>
        ) : primary ? (
          <Badge variant="outline" className="font-mono text-[10px] py-0 h-5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            {daysRemaining} DAYS REMAINING
          </Badge>
        ) : (
          <Badge variant="outline" className="font-mono text-[10px] py-0 h-5 border-border text-muted-foreground">
            DONE
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Primary countdown gauge */}
        {primary && (
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20 border border-border/60 shrink-0 w-36 h-36 relative">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={42}
                  className="stroke-muted/40 fill-none"
                  strokeWidth="6"
                  strokeDasharray="4 2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={42}
                  className="transition-all duration-700 fill-none stroke-emerald-500"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono leading-none text-foreground">
                  {String(daysRemaining).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5 leading-tight">
                  Days<br />Remaining
                </span>
              </div>
            </div>

            <div className="flex-1 rounded-xl bg-secondary/30 border border-border/70 p-3.5 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{primary.title}</span>
                </div>
                {primary.description && (
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {primary.description}
                  </p>
                )}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
                <span>{caseData?.money?.bankName || 'Bank'}</span>
                <span>Due: {formatDate(primary.dueOn)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Every clock, newest first */}
        <div className="space-y-1.5 pt-1">
          {enriched.map(d => {
            const isPending = d.status === 'PENDING';
            const isExpired = d.status === 'EXPIRED';
            const isMet = d.status === 'MET';
            return (
              <div
                key={d.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 text-xs ${
                  isExpired
                    ? 'border-rose-500/30 bg-rose-500/10'
                    : isMet
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : isPending
                    ? 'border-border bg-secondary/20'
                    : 'border-border bg-secondary/10 opacity-60'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  {isMet ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : isExpired ? (
                    <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
                  ) : d.status === 'CANCELLED' ? (
                    <Ban className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{d.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Due {formatDate(d.dueOn)}
                      {d.statuteRef ? ` · ${d.statuteRef}` : ''}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono py-0 h-4.5 shrink-0 ${
                    isExpired
                      ? 'border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/10'
                      : isMet
                      ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                      : isPending
                      ? 'border-border text-muted-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {isPending ? `${d.daysRemaining ?? '–'}d left` : d.status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Overdue alert */}
        {expired && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 dark:text-rose-200 text-xs">
                  Deadline passed
                </h4>
                <p className="text-[11px] text-rose-900/90 dark:text-rose-300/90 mt-0.5 leading-relaxed">
                  The agents are preparing the next step. Check your letters.
                </p>
              </div>
            </div>
            {overdueLetterId && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setModal('REVIEW_LETTER', overdueLetterId)}
                className="h-10 text-xs font-semibold gap-1.5 justify-center w-full sm:h-7 sm:w-auto"
              >
                <FileText className="h-3 w-3" />
                Review Next Letter
              </Button>
            )}
          </div>
        )}

        {/* Legal basis accordion */}
        <div className="border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={() => setShowLegalDetails(!showLegalDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Why this deadline matters
            </span>
            {showLegalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <Collapse open={showLegalDetails}>
            <p className="pt-2 text-[11px] text-muted-foreground leading-relaxed">
              Once your letter is delivered, official deadlines start in plain code: the bank must
              file your grievance within 7 days, the police or district officer then has 15 days to
              decide, and statutory backstops follow. Bonafide tracks each one and wakes up when one
              passes.
            </p>
          </Collapse>
        </div>

        {met.length > 0 && (
          <div className="text-[10px] text-muted-foreground font-mono">
            Met: {met.map(d => d.title).join(', ')}
          </div>
        )}
        {cancelled.length > 0 && (
          <div className="text-[10px] text-muted-foreground font-mono">
            No longer needed: {cancelled.map(d => d.title).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

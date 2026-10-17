import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';
import { Lock, Unlock, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export function MoneyCard() {
  const { caseData } = useCase();

  if (!caseData || !caseData.money) return null;

  const { frozen, disputed, release, bankName } = caseData.money;

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400 stroke-[1.75]" />
            <CardTitle className="text-sm font-bold tracking-tight text-foreground">
              Statutory Balance Bifurcation
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            BNSS §106 Strict Formula
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Frozen Card */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Balance Frozen
              </span>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground num-tabular">
              {formatINR(frozen)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Restrained by {bankName || 'bank'}
            </p>
          </div>

          {/* Disputed Amount */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Contested / Inquired
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-700 dark:text-amber-400 num-tabular">
              {formatINR(disputed)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Maximum legal lien permitted
            </p>
          </div>

          {/* Release Entitlement */}
          <div className="rounded-xl border-2 border-emerald-600/80 bg-emerald-500/5 p-4 relative shadow-xs">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Must Be Released
              </span>
              <Unlock className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300 num-tabular">
              {formatINR(release)}
            </div>
            <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Immediate statutory unfreeze entitlement
            </p>
          </div>
        </div>

        {/* Legal context notice */}
        <div className="mt-4 rounded-xl bg-secondary/40 p-3.5 text-xs sm:text-[13px] text-muted-foreground flex items-start gap-2.5 border border-border/80 font-legal leading-relaxed">
          <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p>
            <strong className="font-sans font-bold text-foreground">MHA Standard Operating Procedure Cl. 4.2:</strong> "The lien shall be restricted solely to the contested amount. Innocent surplus balances must remain unrestricted to avoid irreparable hardship to citizens."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

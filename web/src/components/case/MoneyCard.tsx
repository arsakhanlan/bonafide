import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';
import { Lock, AlertCircle, Unlock, Scale, CheckCircle2 } from 'lucide-react';

export function MoneyCard() {
  const { caseData } = useCase();

  if (!caseData || !caseData.money) return null;

  const { frozen, disputed, release, bankName } = caseData.money;

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Financial Breakdown & Statutory Entitlement
            </CardTitle>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            BNSS §106 Strict Formula
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Frozen Card */}
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-950/60 dark:bg-rose-950/20">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Balance Frozen
              </span>
              <Lock className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white num-tabular">
              {formatINR(frozen)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Total funds currently restrained by {bankName || 'bank'}
            </p>
          </div>

          {/* Disputed Amount */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-950/60 dark:bg-amber-950/20">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Contested / Alleged
              </span>
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white num-tabular">
              {formatINR(disputed)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Maximum legal lien permitted under police notice
            </p>
          </div>

          {/* Release Entitlement (The core win) */}
          <div className="rounded-xl border-2 border-emerald-500/80 bg-emerald-50/70 p-4 dark:border-emerald-500/50 dark:bg-emerald-950/30 relative shadow-sm">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Must Be Released
              </span>
              <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-200 num-tabular">
              {formatINR(release)}
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              Immediate statutory unfreeze entitlement
            </p>
          </div>
        </div>

        {/* Legal context banner */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-300 flex items-start gap-2 border border-slate-100 dark:border-slate-800">
          <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p>
            <strong>MHA Standard Operating Procedure Cl. 4.2:</strong> "The lien shall be restricted solely to the contested amount. Innocent surplus balances must remain unrestricted to avoid irreparable hardship to citizens."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


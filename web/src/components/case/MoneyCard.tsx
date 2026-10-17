import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { formatINR } from '@/lib/utils';
import { Lock, Unlock, Scale, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function MoneyCard() {
  const { caseData } = useCase();

  if (!caseData || !caseData.money) return null;

  const { frozen, disputed, release, bankName } = caseData.money;

  // Calculate proportional percentages
  const releasePct = frozen > 0 ? Math.min(100, Math.max(0, (release / frozen) * 100)) : 0;
  const disputedPct = frozen > 0 ? Math.min(100, Math.max(0, (disputed / frozen) * 100)) : 0;

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative">
      <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
            <CardTitle className="text-sm font-bold tracking-tight text-foreground">
              Statutory Balance Bifurcation
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
            BNSS §106 Strict Formula
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Frozen Card */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3.5 sm:p-4 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Balance Frozen
              </span>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground num-tabular">
              <AnimatedCounter value={frozen} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Restrained by {bankName || 'bank'}
            </p>
          </div>

          {/* Disputed Amount */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition-all">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Contested / Inquired
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-700 dark:text-amber-400 num-tabular">
              <AnimatedCounter value={disputed} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Maximum legal lien permitted ({disputedPct.toFixed(1)}%)
            </p>
          </div>

          {/* Release Entitlement */}
          <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 p-4 relative shadow-sm glow-emerald transition-all">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Must Be Released
              </span>
              <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-bounce duration-1000" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300 num-tabular">
              <AnimatedCounter value={release} />
            </div>
            <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Immediate statutory unfreeze entitlement ({releasePct.toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Proportional Balance Visualization Ratio Bar */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Proportionality Visualizer:
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Lien ({disputedPct.toFixed(1)}%)
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Unfreeze ({releasePct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex p-0.5 gap-0.5">
            <div
              style={{ width: `${Math.max(4, disputedPct)}%` }}
              className="h-full bg-amber-500 rounded-l-full transition-all duration-700"
              title={`Disputed Lien: ${formatINR(disputed)}`}
            />
            <div
              style={{ width: `${Math.min(96, releasePct)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-r-full transition-all duration-700 shadow-sm"
              title={`Citizen Release Entitlement: ${formatINR(release)}`}
            />
          </div>
        </div>

        {/* Legal context notice */}
        <div className="rounded-xl bg-secondary/40 p-3.5 text-xs sm:text-[13px] text-muted-foreground flex items-start gap-2.5 border border-border/80 font-legal leading-relaxed">
          <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong className="font-sans font-bold text-foreground">MHA Standard Operating Procedure Cl. 4.2:</strong> "The lien shall be restricted solely to the contested amount. Innocent surplus balances must remain unrestricted to avoid irreparable hardship to citizens."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

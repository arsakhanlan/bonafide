import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function MoneyCard() {
  const { caseData } = useCase();

  if (!caseData || !caseData.money) return null;

  const { frozen, disputed, release, bankName } = caseData.money;

  return (
    <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden relative">
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          {/* Total Frozen Card */}
          <div className="pt-2 sm:pt-0 sm:pr-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              TOTAL FROZEN
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground num-tabular">
              <AnimatedCounter value={frozen} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Total Frozen = {bankName || 'bank'}
            </p>
          </div>

          {/* Disputed Amount */}
          <div className="pt-3 sm:pt-0 sm:px-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              CONTESTED
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 num-tabular">
              <AnimatedCounter value={disputed} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Contested amount & soot enter
            </p>
          </div>

          {/* Release Entitlement */}
          <div className="pt-3 sm:pt-0 sm:pl-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              MUST BE RELEASED
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 num-tabular">
              <AnimatedCounter value={release} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Must Be Released
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

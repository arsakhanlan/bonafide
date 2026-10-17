import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Building2, Scale } from 'lucide-react';
import { getStageMetadata } from '@/lib/utils';

export function SimpleHeroStatus() {
  const { caseData } = useCase();

  if (!caseData || !caseData.money) return null;

  const { bankName, accountMasked } = caseData.money;
  const stageMeta = getStageMetadata(caseData.stage);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-subtle transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Case Ref: {caseData.id}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <Badge
              variant="outline"
              className="text-xs font-medium border-border bg-secondary/80 text-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-600" />
              {stageMeta.label}
            </Badge>
          </div>

          <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight break-words">
            {caseData.title}
          </h1>

          <div className="flex items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 stroke-[1.75]" />
              <span>{bankName || 'HDFC Bank'}</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <span className="font-mono">{accountMasked || '•••• 4092'}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
              BNSS §106 Active
            </span>
          </div>
        </div>
      </div>

      {/* Legal Citizen Reassurance Summary */}
      <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3.5 border border-border/80">
        <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 stroke-[1.75]" />
        <div className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-legal">
          <span className="font-bold text-foreground font-sans">
            Statutory Legal Safeguard:
          </span>{' '}
          Under Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 and MHA Cyber SOP Cl. 4.2, banks are
          strictly prohibited from freezing entire accounts. Innocent surplus balances must remain
          unrestricted.
        </div>
      </div>
    </div>
  );
}


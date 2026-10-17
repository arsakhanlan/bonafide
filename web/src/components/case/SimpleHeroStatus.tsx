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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-subtle dark:border-slate-800 dark:bg-slate-900 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Case Ref: {caseData.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Badge
              variant="outline"
              className="text-xs font-medium border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-600" />
              {stageMeta.label}
            </Badge>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight break-words">
            {caseData.title}
          </h1>

          <div className="flex items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0 stroke-[1.75]" />
              <span>{bankName || 'HDFC Bank'}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono">{accountMasked || '•••• 4092'}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">
              BNSS §106 Active
            </span>
          </div>
        </div>
      </div>

      {/* Legal Citizen Reassurance Summary */}
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-200/80 dark:border-slate-800/80">
        <Scale className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5 stroke-[1.75]" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
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


import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Building2, Scale, ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { getStageMetadata } from '@/lib/utils';

export function SimpleHeroStatus() {
  const { caseData } = useCase();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  if (!caseData || !caseData.money) return null;

  const { bankName, accountMasked } = caseData.money;
  const stageMeta = getStageMetadata(caseData.stage);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all space-y-3 relative overflow-hidden">
      {/* Ambient subtle sovereign accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80 relative">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-base sm:text-xl font-bold text-foreground tracking-tight break-words">
              {caseData.title}
            </h1>
            <Badge
              variant="outline"
              className="text-[11px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-0 h-5"
            >
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {stageMeta.label}
            </Badge>
          </div>

          <div className="flex items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-medium flex-wrap">
            <span className="font-mono text-[11px] text-muted-foreground/80">Ref: {caseData.id}</span>
            <span className="text-muted-foreground/30">•</span>
            <div className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 stroke-[1.75]" />
              <span>{bankName || 'HDFC Bank'}</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <span className="font-mono">{accountMasked || '•••• 4092'}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              BNSS §106 Active
            </span>
          </div>
        </div>

        {/* Right side statutory button inspired by attached screenshot */}
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shrink-0 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Scale className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
          <span>Statutory Legal Safeguard</span>
          {isAccordionOpen ? (
            <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Collapsible Statutory Legal Safeguard Details */}
      {isAccordionOpen && (
        <div className="rounded-xl bg-secondary/40 border border-border/80 p-3.5 space-y-2.5 text-xs text-muted-foreground font-legal accordion-animate-open">
          <div className="flex items-center gap-2 text-foreground font-sans font-semibold text-xs pb-1 border-b border-border/60">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
            <span>Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 & MHA SOP Cl. 4.2 Protection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
            <div className="p-2.5 rounded-lg bg-card/90 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-sans font-semibold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                MHA SOP Cl. 4.2 & 10.1 (Strict Proportionality)
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-sans">
                Police requisition numbers apply exclusively to the specific disputed UPI sum. Any blanket debit freeze on surplus balance is strictly prohibited.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-card/90 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-sans font-semibold text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Protection for Innocent Merchants & Citizens
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-sans">
                Valid commercial consideration (tax invoice, repair job receipt, escrow record) legally protects your genuine livelihood savings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


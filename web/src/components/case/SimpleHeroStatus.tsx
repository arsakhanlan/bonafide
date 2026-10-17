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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-subtle transition-all space-y-4 relative overflow-hidden">
      {/* Ambient subtle sovereign accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80 relative">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Case Ref: {caseData.id}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <Badge
              variant="outline"
              className="text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
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
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              BNSS §106 Active
            </span>
          </div>
        </div>
      </div>

      {/* Legal Citizen Reassurance Summary with Interactive Smooth Accordion */}
      <div className="rounded-xl bg-secondary/40 border border-border/80 relative overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex items-start sm:items-center justify-between gap-3 p-3.5 text-left hover:bg-secondary/60 transition-colors group"
          aria-expanded={isAccordionOpen}
        >
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0 stroke-[1.75]" />
            <div className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-legal">
              <span className="font-bold text-foreground font-sans mr-1">
                Statutory Legal Safeguard:
              </span>
              Under Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 and MHA Cyber SOP Cl. 4.2, banks cannot freeze entire accounts. Innocent surplus balances must remain unrestricted.
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 self-center">
            <span className="hidden sm:inline font-sans text-[11px] group-hover:underline">
              {isAccordionOpen ? 'Hide Details' : 'View Rights'}
            </span>
            <span className="p-1 rounded-md bg-secondary text-muted-foreground group-hover:text-foreground transition-transform">
              {isAccordionOpen ? (
                <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
              )}
            </span>
          </div>
        </button>

        {/* Collapsible Content */}
        {isAccordionOpen && (
          <div className="px-3.5 pb-3.5 pt-1 border-t border-border/60 space-y-2.5 text-xs text-muted-foreground font-legal animate-in fade-in-0 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-card/80 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-sans font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  MHA SOP Cl. 4.2 & 10.1 (Strict Proportionality)
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Police requisition numbers CY/2026/... apply exclusively to the specific disputed UPI sum. Any debit block beyond that amount is unlawful.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-card/80 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-sans font-semibold text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Protection for Innocent Merchants & Citizens
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Valid commercial consideration (tax invoice, repair job receipt, escrow record) legally exempts your genuine livelihood savings from blanket freezes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


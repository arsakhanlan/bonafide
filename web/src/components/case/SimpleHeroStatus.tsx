import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Scale,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  FastForward,
  Clock,
  CalendarDays,
  Loader2,
  Users,
} from 'lucide-react';
import { getStageMetadata } from '@/lib/utils';
import { audienceOf } from '@/lib/letterAudience';
import { IS_MOCK, isDemoCase } from '@/lib/mode';

export function SimpleHeroStatus() {
  const { caseData, letters, skipTime, isProcessing, currentSimulatedDate, simulatedDays, selectedPersona, selectPersona } = useCase();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);

  if (!caseData) return null;

  const stageMeta = getStageMetadata(caseData.stage);
  const lastSent = [...letters].reverse().find(l => l.status === 'SENT');
  const waitingOn = audienceOf(lastSent?.kind);
  const stageLabel =
    caseData.stage === 'WAITING' && waitingOn === 'police'
      ? 'Waiting for the police'
      : caseData.stage === 'WAITING' && waitingOn === 'district'
      ? 'Waiting for the district officer'
      : stageMeta.label;
  const showDemo = IS_MOCK || isDemoCase(caseData.demo);

  const personaList = [
    { id: 'RAVI' as const, label: 'Ravi (Shopkeeper)' },
    { id: 'MEERA' as const, label: 'Meera (Freelancer)' },
    { id: 'ARJUN' as const, label: 'Arjun (P2P Crypto)' },
    { id: 'SUNIL' as const, label: 'Sunil (Account Rent)' },
  ];

  return (
    <div className="animate-view-in [animation-delay:40ms] rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all space-y-3 relative overflow-hidden">
      {/* Ambient subtle sovereign accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Row: Case Title, Bank badges, and Statutory Legal Safeguard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80 relative">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground tracking-tight break-words">
              {caseData.title}
            </h1>
            {isDemoCase(caseData.demo) && (
              <Badge variant="outline" className="text-[10px] font-mono py-0 h-4.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                DEMO
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-medium flex-wrap">
            {caseData.money?.bankName && (
              <>
                <div className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 stroke-[1.75]" />
                  <span className="font-semibold text-foreground">{caseData.money.bankName}</span>
                </div>
                <span className="text-muted-foreground/30">•</span>
              </>
            )}
            {caseData.money?.accountMasked && (
              <>
                <span className="font-mono text-muted-foreground/80">{caseData.money.accountMasked}</span>
                <span className="text-muted-foreground/30">•</span>
              </>
            )}
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-0 h-4.5"
            >
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {stageLabel}
            </Badge>
          </div>
        </div>

        {/* Right side statutory button & scenario switcher (demo only) */}
        {showDemo && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowPersonaPicker(!showPersonaPicker)}
              className="inline-flex items-center gap-1 px-2.5 py-2.5 sm:py-1.5 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all"
              title="Switch demo persona scenario"
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Scenario:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                {selectedPersona.toLowerCase()}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all active:scale-[0.98]"
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
        )}
      </div>

      {/* Persona Quick Picker Dropdown (demo only) */}
      {showDemo && showPersonaPicker && (
        <div className="p-3 rounded-2xl bg-secondary/70 border border-border/80 flex flex-wrap items-center gap-2 animate-dropdown-in shadow-md">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            Test Persona:
          </span>
          {personaList.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                selectPersona(p.id);
                setShowPersonaPicker(false);
              }}
              className={`px-3 py-2.5 sm:py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedPersona === p.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-card border border-border text-foreground hover:bg-secondary active:scale-95'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Statutory Legal Safeguard Details */}
      {isAccordionOpen && (
        <div className="rounded-2xl bg-secondary/40 border border-border/80 p-4 space-y-3 text-xs text-muted-foreground font-legal accordion-animate-open">
          <div className="flex items-center gap-2 text-foreground font-sans font-semibold text-xs pb-1.5 border-b border-border/60">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
            <span>Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 & MHA SOP Cl. 4.2 Protection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
            <div className="p-3 rounded-xl bg-card/90 border border-border/60 space-y-1">
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

      {/* Bottom Integrated Row: Evaluator Time Machine (demo only) */}
      {showDemo && (
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-foreground">Evaluator Time Machine</span>
            <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
              {currentSimulatedDate}
            </span>
            {simulatedDays > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                (+{simulatedDays}d)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={() => skipTime(1)}
              className="h-10 px-3 text-xs bg-card hover:bg-secondary border-border sm:h-8 sm:px-2.5"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Clock className="h-3 w-3 mr-1 text-muted-foreground" />}
              <span>+1 Day</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={() => skipTime(7)}
              className="h-10 px-3 text-xs bg-card hover:bg-secondary border-border sm:h-8 sm:px-2.5"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground" />}
              <span>+7 Days (Bank Clock)</span>
            </Button>

            <Button
              size="sm"
              variant="default"
              disabled={isProcessing}
              onClick={() => skipTime(30)}
              className="h-10 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs sm:h-8 sm:px-2.5"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FastForward className="h-3 w-3 mr-1" />}
              <span>+30 Days (Standard)</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

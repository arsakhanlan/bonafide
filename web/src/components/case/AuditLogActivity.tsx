import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Shield,
  Bot,
  User,
  Cpu,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
} from 'lucide-react';

export function AuditLogActivity() {
  const { caseData, steps } = useCase();
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  // Synthesize unified audit activity entries
  // Includes history events, agent trace milestones, and human actions
  const historyEvents = (caseData?.history || []).map((h, idx) => {
    let source: 'SYSTEM' | 'AI READER' | 'HUMAN' = 'SYSTEM';
    const textUpper = h.text.toUpperCase();
    if (textUpper.includes('PARSED') || textUpper.includes('AI') || textUpper.includes('EXTRACTED') || textUpper.includes('ANALYZED')) {
      source = 'AI READER';
    } else if (textUpper.includes('APPROVED') || textUpper.includes('RECORDED') || textUpper.includes('UPLOADED') || textUpper.includes('USER') || textUpper.includes('CITIZEN')) {
      source = 'HUMAN';
    }

    return {
      id: `hist-${idx}`,
      source,
      time: h.on?.split('T')[1]?.slice(0, 5) || '14:20',
      date: h.on?.split('T')[0] || '2026-10-17',
      text: h.text,
      raw: h,
    };
  });

  // Combine with live agent steps if available
  const agentEvents = (steps || []).slice(0, 5).map((s, idx) => {
    let source: 'SYSTEM' | 'AI READER' | 'HUMAN' = 'AI READER';
    if (s.agent === 'CASE_BOSS' || s.agent === 'CLOCK') source = 'SYSTEM';

    return {
      id: `step-${s.id || idx}`,
      source,
      time: s.timestamp || '14:25',
      date: '2026-10-17',
      text: s.message,
      level: s.level,
    };
  });

  // Display list
  const allEvents = [...agentEvents, ...historyEvents];

  const getSourceBadge = (source: 'SYSTEM' | 'AI READER' | 'HUMAN') => {
    switch (source) {
      case 'SYSTEM':
        return {
          bg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'AI READER':
        return {
          bg: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30',
          dot: 'bg-teal-500',
        };
      case 'HUMAN':
        return {
          bg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
        };
    }
  };

  return (
    <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <CardHeader className="py-3.5 px-4 sm:px-5 border-b border-border/80 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" />
            </span>
            <CardTitle className="text-sm font-bold tracking-tight text-foreground">
              Audit Log & Activity
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/60">
            Realtime ADK Mesh
          </span>
        </div>
      </CardHeader>

      {/* Main Activity Feed */}
      <CardContent className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto max-h-[560px]">
        {allEvents.map((ev, idx) => {
          const badge = getSourceBadge(ev.source);

          return (
            <div key={ev.id || idx} className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {ev.source}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {ev.time}
                </span>
              </div>
              <p className="text-xs text-foreground/90 pl-1 leading-relaxed font-sans">
                {ev.text}
              </p>
            </div>
          );
        })}
      </CardContent>

      {/* Autonomous Reasoning Accordion Footer */}
      <div className="border-t border-border/80 bg-muted/30">
        <button
          type="button"
          onClick={() => setIsReasoningOpen(!isReasoningOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Autonomous Reasoning</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-[10px] font-mono">5 Agents Active</span>
            {isReasoningOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {isReasoningOpen && (
          <div className="p-4 space-y-2.5 border-t border-border/60 bg-card/60 text-xs text-muted-foreground accordion-animate-open">
            <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-border/50">
              <span className="text-foreground font-semibold">Active ADK Decision Mesh</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Deterministic Grounding</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-secondary/50 border border-border/60">
                <span className="font-bold text-foreground block mb-0.5">Rule §106 BNSS Compliance:</span>
                Debit freeze legally restricted to ₹2,000. Surplus ₹1,78,000 must be marked for unfreeze.
              </div>
              <div className="p-2 rounded-lg bg-secondary/50 border border-border/60">
                <span className="font-bold text-foreground block mb-0.5">Verification Integrity:</span>
                Tax Invoice & customer repair ticket matched transaction UTR reference without conflict.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


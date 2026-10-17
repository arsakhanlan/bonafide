import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface AgentTraceLiveProps {
  embedded?: boolean;
}

export function AgentTraceLive({ embedded = false }: AgentTraceLiveProps) {
  const { steps } = useCase();

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case 'CASE_BOSS':
        return {
          label: 'Orchestrator',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'READER':
        return {
          label: 'Doc Reader',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      case 'CHECKER':
        return {
          label: 'BNSS Grounding',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      case 'SORTER':
        return {
          label: 'Transaction Sorter',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      case 'CLOCK':
        return {
          label: 'Statutory Timer',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      default:
        return {
          label: agent,
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Autonomous Reasoning Mesh
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active ADK Trace</span>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs pr-1">
        {steps.map(step => {
          const badge = getAgentBadge(step.agent);
          const isWarn = step.level === 'WARN';
          const isError = step.level === 'ERROR';

          return (
            <div
              key={step.id}
              className="py-2 px-1.5 flex items-start gap-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors rounded-lg"
            >
              <div className="pt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                ) : isWarn ? (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold tracking-wider uppercase font-mono ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-xs">
                  {step.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-card">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-800 dark:text-slate-200" />
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Live Multi-Agent Reasoning Trace
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous ADK Mesh</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}


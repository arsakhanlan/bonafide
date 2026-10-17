import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Cpu, CheckCircle2, AlertCircle, Info, Terminal } from 'lucide-react';

export function AgentTraceLive() {
  const { steps } = useCase();

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case 'READER':
        return { label: 'Reader Agent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'SORTER':
        return { label: 'Sorter Agent', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'CHECKER':
        return { label: 'Checker & Grounding', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'CASE_BOSS':
        return { label: 'Case Boss (Orchestrator)', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      case 'CLOCK':
        return { label: 'Deadline Engine', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
      default:
        return { label: agent, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Live Multi-Agent Reasoning Trace
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous ADK Mesh</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 font-mono text-xs">
          {steps.map(step => {
            const badge = getAgentBadge(step.agent);
            const isWarn = step.level === 'WARN';
            const isError = step.level === 'ERROR';

            return (
              <div
                key={step.id}
                className="py-2.5 px-3 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors rounded-lg"
              >
                <div className="pt-0.5 shrink-0">
                  {isError ? (
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  ) : isWarn ? (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${badge.color}`}>
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
      </CardContent>
    </Card>
  );
}


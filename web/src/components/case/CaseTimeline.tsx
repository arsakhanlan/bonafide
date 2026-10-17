import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CaseTimelineProps {
  embedded?: boolean;
}

export function CaseTimeline({ embedded = false }: CaseTimelineProps) {
  const { caseData } = useCase();

  if (!caseData || !caseData.history || caseData.history.length === 0) return null;

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Tamper-Evident Audit Trail
        </span>
        <span className="text-[11px] text-muted-foreground font-mono bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
          {caseData.history.length} Events Logged
        </span>
      </div>

      <div className="relative border-l border-emerald-500/30 dark:border-emerald-500/20 ml-2 space-y-4 max-h-[380px] overflow-y-auto pl-1 pr-1 py-1">
        {caseData.history.map((item, idx) => (
          <div key={idx} className="relative pl-5">
            <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-2 ring-emerald-500/20" />
            <div>
              <span className="text-[10px] font-mono text-muted-foreground block mb-0.5">
                {formatDate(item.on)}
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-card">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-800 dark:text-slate-200" />
          <CardTitle className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Case Audit Trail & Activity Log
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}


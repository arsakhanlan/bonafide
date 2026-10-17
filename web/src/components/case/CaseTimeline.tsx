import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function CaseTimeline() {
  const { caseData } = useCase();

  if (!caseData || !caseData.history || caseData.history.length === 0) return null;

  return (
    <Card className="border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <CardTitle className="text-sm font-semibold tracking-wide">
            Case Audit Trail & Activity Log
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
          {caseData.history.map((item, idx) => (
            <div key={idx} className="relative pl-6">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-900 dark:border-slate-950 dark:bg-slate-100 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-950" />
              </span>
              <div>
                <span className="text-[11px] font-mono text-muted-foreground block mb-0.5">
                  {formatDate(item.on)}
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


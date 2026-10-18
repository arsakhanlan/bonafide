import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { documentVisual } from '@/lib/documentVisual';
import { formatElapsed } from '@/lib/useElapsed';
import { CaseDocument } from '@/types/document';

interface AnalysisProgressProps {
  documents: CaseDocument[];
  elapsed: number;
}

/** A small live view of the papers the Reader is working through. */
export function AnalysisProgress({ documents, elapsed }: AnalysisProgressProps) {
  const shown = documents.slice(0, 4);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
        <span className="flex items-center gap-1.5">
          <Spinner className="h-3.5 w-3.5" />
          Reading your papers…
        </span>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono tabular-nums">
          {formatElapsed(elapsed)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {shown.map(doc => {
          const { Icon, tint } = documentVisual(doc);
          return (
            <span
              key={doc.id}
              className="analysis-scan inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10.5px] font-medium text-foreground/80"
            >
              <Icon className={`h-3 w-3 shrink-0 ${tint}`} />
              <span className="max-w-[150px] truncate">{doc.name}</span>
            </span>
          );
        })}
        {documents.length > shown.length && (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground">
            +{documents.length - shown.length} more
          </span>
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-emerald-500/10">
        <span className="animate-analysis-bar block h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
      </div>
    </div>
  );
}

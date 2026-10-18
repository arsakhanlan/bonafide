import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/** Agent steps arrive as ISO instants; show the same date · time shape as history. */
function eventTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: iso };
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

export function AuditLogActivity() {
  const { caseData, steps } = useCase();

  // Merge agent steps (newest first) with the case history.
  const agentEvents = (steps || [])
    .map((s, idx) => ({
      id: `step-${s.id || idx}`,
      source: s.agent as string,
      ...eventTime(s.timestamp),
      text: s.message,
      level: s.level,
    }))
    .reverse();

  const historyEvents = (caseData?.history || []).map((h, idx) => ({
    id: `hist-${idx}`,
    source: 'YOU',
    time: h.on?.split('T')[1]?.slice(0, 5) || '',
    date: h.on?.split('T')[0] || '',
    text: h.text,
    level: 'INFO',
  }));

  const allEvents = [...agentEvents, ...historyEvents];

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
              Activity Log
            </CardTitle>
          </div>
          {caseData?.busy ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <Loader2 className="h-3 w-3 animate-spin" />
              AGENTS WORKING
            </span>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/60">
              LIVE
            </span>
          )}
        </div>
      </CardHeader>

      {/* Main Activity Feed */}
      <CardContent className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto max-h-[560px]">
        {allEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No activity yet. The agents will log every step here.
          </p>
        ) : (
          allEvents.map((ev) => (
            <div key={ev.id} className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                  {ev.source}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {ev.date && formatDate(ev.date)}
                  {ev.date && ev.time && ' · '}
                  {ev.time}
                </span>
              </div>
              <p className="text-xs text-foreground/90 pl-1 leading-relaxed font-sans">
                {ev.text}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

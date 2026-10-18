import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/** Plain names for the internal agent codes shown in the log. */
const AGENT_LABEL: Record<string, string> = {
  READER: 'Paper reader',
  WRITER: 'Letter writer',
  CHECKER: 'Fact checker',
  RULES: 'Law check',
  MONEY: 'Money check',
  SORTER: 'Safety check',
  CASE_BOSS: 'Case manager',
  CLOCK: 'Deadline tracker',
  SYSTEM: 'Bonafide',
};

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
      source: AGENT_LABEL[s.agent] ?? (s.agent as string),
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
    <Card
      id="activity-log"
      className="scroll-mt-24 border-border bg-card shadow-card rounded-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <CardHeader className="py-3.5 px-4 sm:px-5 border-b border-border/80 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" />
            </span>
            <CardTitle className="text-sm font-bold tracking-tight text-foreground">
              What's happening
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
        {caseData?.busy && (
          <div className="animate-view-in flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="animate-thinking-dot h-1.5 w-1.5 rounded-full bg-emerald-500"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </span>
            Agents are thinking…
          </div>
        )}
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

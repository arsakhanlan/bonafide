import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Send, Printer } from 'lucide-react';

/** Human labels for the backend letter kinds. */
export function letterKindLabel(kind: string): string {
  switch (kind) {
    case 'L1_BRANCH':
      return 'Letter to Bank';
    case 'L2_OFFICER':
      return 'Letter to Officer';
    case 'L3_REVIEW':
      return 'Review Request';
    case 'L3_DISTRICT':
      return 'Letter to District Officer';
    case 'L4_BACKSTOP':
      return 'Backstop Letter';
    case 'L5_LAWYER_NOTES':
      return 'Notes for Your Lawyer';
    case 'REMINDER':
      return 'Overdue Reminder';
    default:
      return kind || 'Letter';
  }
}

export function LettersList() {
  const { letters, setModal } = useCase();

  if (letters.length === 0) return null;

  return (
    <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Your letters
          </CardTitle>
        </div>
        <button
          type="button"
          onClick={() => setModal('REVIEW_LETTER', letters[0]?.id)}
          className="inline-flex h-9 items-center px-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors sm:h-auto sm:px-0 sm:text-[11px]"
        >
          View by date sent
        </button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {letters.map(letter => {
          const isApproved = letter.status === 'APPROVED';
          const isSent = letter.status === 'SENT';

          return (
            <div
              key={letter.id}
              className="animate-view-in space-y-2.5 rounded-xl border border-border bg-secondary/20 p-3.5 text-xs transition-all hover:bg-secondary/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-foreground text-xs sm:text-sm leading-snug">
                      {letter.title}
                    </h4>
                    {letter.reminder && (
                      <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/10">
                        REMINDER
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {letter.recipient || letterKindLabel(letter.kind)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModal('REVIEW_LETTER', letter.id)}
                    className="h-9 px-3 text-xs gap-1 bg-card hover:bg-secondary border-border sm:h-7 sm:px-2.5"
                  >
                    <Printer className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Review</span>
                  </Button>

                  {isApproved && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setModal('MARK_SENT', letter.id)}
                      className="h-9 px-3 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs sm:h-7 sm:px-2.5"
                    >
                      <Send className="h-3 w-3" />
                      <span>Mark Sent</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Status and Citation Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase font-mono py-0 h-4.5 ${
                    isSent
                      ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : isApproved
                      ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                  {letter.status}
                </Badge>

                {letter.citations?.slice(0, 2).map((c, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[9px] font-mono py-0 h-4.5 bg-secondary text-muted-foreground border border-border/60"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

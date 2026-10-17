import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Send, Eye, Scale, Printer } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function LettersList() {
  const { letters, setModal } = useCase();

  if (letters.length === 0) return null;

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-800 dark:text-slate-200 stroke-[1.75]" />
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Statutory Representations & Letters ({letters.length})
            </CardTitle>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Grounding Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-5 space-y-3">
        {letters.map(letter => {
          const isApproved = letter.status === 'APPROVED';
          const isSent = letter.status === 'SENT';

          return (
            <div
              key={letter.id}
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs space-y-3 card-hover-micro"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {letter.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-mono py-0 h-4.5 ${
                        isSent
                          ? 'border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30'
                          : isApproved
                          ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100'
                          : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {letter.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    To: {letter.recipient || 'The Branch Manager / Nodal Officer'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center shrink-0 pt-1 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModal('REVIEW_LETTER', letter.id)}
                    className="h-9 px-3 text-xs gap-1.5 justify-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
                  >
                    <Printer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Review & Print</span>
                  </Button>

                  {isApproved && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setModal('MARK_SENT', letter.id)}
                      className="h-9 px-3 text-xs gap-1.5 justify-center bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold shadow-sm active:scale-[0.98]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Mark as Sent</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Citations badges */}
              {letter.citations && letter.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Scale className="h-3 w-3 text-slate-500" />
                    Citations:
                  </span>
                  {letter.citations.map((c, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] font-mono py-0 h-4 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Sent status line if sent */}
              {isSent && (
                <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-lg flex items-center justify-between font-mono border border-blue-200/50 dark:border-blue-900/40">
                  <span>Delivered via: {letter.sentHow || 'BRANCH'}</span>
                  <span>Sent On: {formatDate(letter.sentOn)}</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}


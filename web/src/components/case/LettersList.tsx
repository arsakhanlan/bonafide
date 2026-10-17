import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, Send, Clock, Eye, Scale } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function LettersList() {
  const { letters, setModal } = useCase();

  if (letters.length === 0) return null;

  return (
    <Card className="border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Statutory Representations & Letters ({letters.length})
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Grounding Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {letters.map(letter => {
          const isDraft = letter.status === 'DRAFT';
          const isApproved = letter.status === 'APPROVED';
          const isSent = letter.status === 'SENT';

          return (
            <div
              key={letter.id}
              className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {letter.title}
                    </span>
                    <Badge
                      variant={isSent ? 'info' : isApproved ? 'success' : 'warning'}
                      className="text-[10px] uppercase font-mono py-0 h-4.5"
                    >
                      {letter.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    To: {letter.recipient || 'The Branch Manager / Nodal Officer'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModal('REVIEW_LETTER', letter.id)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Letter
                  </Button>

                  {isApproved && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setModal('MARK_SENT', letter.id)}
                      className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Mark as Sent
                    </Button>
                  )}
                </div>
              </div>

              {/* Citations badges */}
              {letter.citations && letter.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Scale className="h-3 w-3 text-indigo-500" />
                    Citations:
                  </span>
                  {letter.citations.map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0 h-4">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Sent status line if sent */}
              {isSent && (
                <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg flex items-center justify-between font-mono">
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


import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { getStageMetadata, formatDate } from '@/lib/utils';
import { Building2, CreditCard, ShieldAlert, FileText, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CaseHeader() {
  const { caseData, setModal } = useCase();

  if (!caseData) return null;

  const stageMeta = getStageMetadata(caseData.stage);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-muted-foreground font-semibold">
              {caseData.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 font-medium border ${stageMeta.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stageMeta.dot}`} />
              {stageMeta.label}
            </Badge>
            {caseData.demo && (
              <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                Demo Case
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {caseData.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('UPLOAD_PAPERS')}
            className="text-xs gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            Upload Papers
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('RECORD_REPLY')}
            className="text-xs gap-1.5"
          >
            Record Bank Reply
          </Button>
        </div>
      </div>

      {/* Metadata tags: Bank name, account number, quote */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Bank:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {caseData.money?.bankName || caseData.facts?.bankName || 'Scheduled Commercial Bank'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Account:{' '}
            <strong className="font-mono text-slate-800 dark:text-slate-200">
              {caseData.money?.accountMasked || '•••• •••• 4092'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Registered:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {formatDate(caseData.createdAt)}
            </strong>
          </span>
        </div>
      </div>

      {caseData.personNote && (
        <div className="mt-4 rounded-xl bg-slate-50/80 p-3.5 text-xs text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Citizen Statement:{' '}
            </span>
            <span className="italic">"{caseData.personNote}"</span>
          </div>
        </div>
      )}
    </div>
  );
}


import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR, getStageMetadata } from '@/lib/utils';
import {
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  FileText,
  HelpCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export function SimpleHeroStatus() {
  const { caseData, setModal, letters } = useCase();

  if (!caseData || !caseData.money) return null;

  const { frozen, disputed, release, bankName, accountMasked } = caseData.money;
  const stageMeta = getStageMetadata(caseData.stage);
  const letterId = caseData.nextStep?.letterId || letters[0]?.id;

  const isApproved = letters.some(l => l.status === 'APPROVED');
  const isSent = letters.some(l => l.status === 'SENT');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/60 p-6 sm:p-7 shadow-sm transition-all space-y-6">
      {/* Top Greeting & Citizen Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Case Ref: {caseData.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Badge variant="outline" className={`text-xs px-2.5 py-0.5 border ${stageMeta.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stageMeta.dot}`} />
              {stageMeta.label}
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {caseData.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{bankName || 'HDFC Bank'}</span>
            <span>•</span>
            <span className="font-mono">{accountMasked || '•••• 4092'}</span>
          </div>
        </div>

        {/* Action button based on state */}
        <div className="shrink-0 flex items-center gap-2">
          {caseData.stage === 'LETTER_READY' && (
            <Button
              size="sm"
              variant="hero"
              onClick={() => setModal('REVIEW_LETTER', letterId)}
              className="h-10 px-5 text-xs font-semibold gap-2 rounded-xl shadow-md"
            >
              <FileText className="h-4 w-4" />
              <span>Review Representation Letter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {caseData.stage === 'NEEDS_ANSWERS' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setModal('ANSWER_QUESTIONS')}
              className="h-10 px-5 text-xs font-semibold gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Answer 2 Quick Questions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {caseData.stage === 'WAITING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const el = document.getElementById('statutory-deadlines-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-10 px-4 text-xs font-semibold gap-1.5 rounded-xl border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300"
            >
              <Clock className="h-4 w-4" />
              <span>7-Day Clock Running</span>
            </Button>
          )}
        </div>
      </div>

      {/* The 3-Step Human Visual Formula (Clear, Non-Technical) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Your Statutory Account Protection Formula:
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            BNSS Section 106
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: What the Bank Froze */}
          <div className="p-4 rounded-xl border border-rose-200/90 bg-rose-50/40 dark:border-rose-950/60 dark:bg-rose-950/20 space-y-1">
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-400 text-xs font-semibold">
              <span>Total Money Frozen</span>
              <Lock className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white num-tabular">
              {formatINR(frozen)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Total balance wrongfully locked by the bank branch
            </p>
          </div>

          {/* Card 2: What Police Questioned */}
          <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/40 dark:border-amber-950/60 dark:bg-amber-950/20 space-y-1">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-semibold">
              <span>Questioned Payment</span>
              <span className="font-mono text-[10px]">Max Hold</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white num-tabular">
              {formatINR(disputed)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Maximum lien police can legally investigate
            </p>
          </div>

          {/* Card 3: What You Get Released */}
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/80 dark:border-emerald-500/60 dark:bg-emerald-950/30 space-y-1 relative shadow-sm">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Must Be Unfrozen Now
              </span>
              <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-200 num-tabular">
              {formatINR(release)}
            </div>
            <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              Statutory unfreeze entitlement for immediate release
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

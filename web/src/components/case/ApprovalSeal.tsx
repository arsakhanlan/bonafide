import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { APPROVAL_EVENT } from '@/lib/approvalSeal';

/** A single ink-stamp moment after a letter is approved. Lives above all views. */
export function ApprovalSeal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const onApproved = () => {
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), 1650);
    };
    window.addEventListener(APPROVAL_EVENT, onApproved);
    return () => {
      window.removeEventListener(APPROVAL_EVENT, onApproved);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center print:hidden">
      <div className="relative">
        <span className="animate-seal-ring absolute inset-0 rounded-full border border-emerald-500/50" />
        <div className="animate-seal-in flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-full border-[3px] border-emerald-600 bg-emerald-50 text-emerald-700 shadow-[0_24px_60px_-18px_rgba(5,150,105,0.65)] ring-4 ring-emerald-500/15 ring-offset-2 ring-offset-background dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Approved</span>
        </div>
      </div>
    </div>
  );
}

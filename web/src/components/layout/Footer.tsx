import React from 'react';
import { ShieldCheck, Scale, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/50 py-6 text-xs text-muted-foreground dark:border-slate-800 dark:bg-slate-950/50">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-center md:text-left">
          <Scale className="h-4 w-4 text-slate-500 shrink-0" />
          <p>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">
              Statutory Self-Help Defense:
            </strong>{' '}
            Grounded in Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 and Ministry of Home Affairs SOP.
            Not legal advice. You maintain full control over all transmissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Google Cloud AI Builder Cup 2026</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="tel:15100"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-purple-600" />
            <span>National Legal Aid: <strong>15100</strong></span>
          </a>
        </div>
      </div>
    </footer>
  );
}


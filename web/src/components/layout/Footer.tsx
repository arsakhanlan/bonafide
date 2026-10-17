import React from 'react';
import { ShieldCheck, Scale, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50 py-5 sm:py-6 text-xs text-muted-foreground safe-area-bottom">
      <div className="container px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-center md:text-left">
          <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <p>
            <strong className="font-semibold text-foreground">
              Statutory Self-Help Defense:
            </strong>{' '}
            Grounded in Bharatiya Nagarik Suraksha Sanhita (BNSS) §106 and Ministry of Home Affairs SOP.
            Not legal advice. You maintain full control over all transmissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Google Cloud AI Builder Cup 2026</span>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <a
            href="tel:15100"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>National Legal Aid: <strong>15100</strong></span>
          </a>
        </div>
      </div>
    </footer>
  );
}


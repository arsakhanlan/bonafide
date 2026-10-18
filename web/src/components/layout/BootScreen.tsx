import React from 'react';
import { ShieldCheck } from 'lucide-react';

/** First-paint splash: shown until auth and the first case snapshots have landed. */
export function BootScreen() {
  return (
    <section
      aria-label="Opening Bonafide"
      aria-busy="true"
      className="flex min-h-[60vh] items-center justify-center px-4"
    >
      <div className="w-full max-w-sm text-center animate-view-in">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/25 blur-xl animate-boot-glow" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>
        <p className="text-sm font-bold tracking-tight text-foreground">
          Getting your case ready
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Signing you in securely — this only takes a moment.
        </p>
        <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-boot-sweep" />
        </div>
      </div>
    </section>
  );
}

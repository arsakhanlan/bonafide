import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Button } from '@/components/ui/button';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { IS_MOCK } from '@/lib/mode';
import {
  ArrowRight,
  Compass,
  FileUp,
  Lock,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    icon: FileUp,
    title: 'Add your papers',
    body: 'Upload the freeze SMS, bank statement, invoice or chat that explains the payment.',
  },
  {
    icon: ScanLine,
    title: 'Agents do the maths',
    body: 'Bonafide separates the disputed amount from the rest of your balance and verifies every legal quote.',
  },
  {
    icon: Send,
    title: 'You approve and send',
    body: 'Review the BNSS §106 letter, print it or email it yourself. Nothing is sent for you.',
  },
];

const TRUST = [
  { icon: ShieldCheck, label: 'Self-help, not legal advice' },
  { icon: Sparkles, label: 'Every quote checked word-for-word' },
  { icon: Lock, label: 'Account numbers stay masked' },
];

export function StartScreen() {
  const { setModal } = useCase();

  const showDemo = () => {
    document.getElementById('demo-scenarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-label="Start" className="space-y-8 sm:space-y-10 pt-2 sm:pt-8 animate-view-in">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {IS_MOCK ? 'Interactive demo · Every name, amount and paper is fake' : 'Bank freeze self-help · BNSS §106 & MHA SOP'}
          </span>

          <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {IS_MOCK ? 'Walk through a freeze case.' : 'Your account was frozen.'}
            <span className="mt-1 block bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-teal-300">
              {IS_MOCK ? 'From first paper to release.' : 'Here is the way back.'}
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {IS_MOCK
              ? 'Start the guided walkthrough and every paper is already attached — just click the next action. Or jump straight into one of four finished scenarios and explore its timeline.'
              : 'Bonafide reads your bank message and statement, works out what is actually in dispute, and drafts a representation under BNSS §106 — with every quote checked word-for-word. You review, approve and send everything yourself.'}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setModal('NEW_CASE')}
              className="group h-12 px-7 text-sm font-bold shadow-md shadow-emerald-600/20"
            >
              {IS_MOCK ? 'Start the guided journey' : 'Start my case'}
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={showDemo}
              className="h-12 px-6 text-sm font-semibold"
            >
              <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {IS_MOCK ? 'Jump to a scenario' : 'Explore a demo case'}
            </Button>
          </div>

          <p className="mt-4 text-[11px] font-medium text-muted-foreground">
            {IS_MOCK
              ? 'Guided demo · Nothing is uploaded and nothing is ever sent'
              : 'Free · No sign-up · Nothing is ever sent on your behalf'}
          </p>

          <ul className="animate-view-in [animation-delay:130ms] mt-6 grid gap-2 sm:grid-cols-3">
            {TRUST.map(item => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-[11px] font-medium text-muted-foreground"
              >
                <item.icon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="animate-view-in [animation-delay:90ms] relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                What happens after you start
              </h2>
              <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                3 steps
              </span>
            </div>

            <ol className="relative mt-5 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <step.icon className="h-4 w-4" />
                    </div>
                    {index < STEPS.length - 1 && (
                      <span className="absolute left-1/2 top-10 h-4 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-bold text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-3 text-[10px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              Your papers are used only to build your own case.
            </div>
          </div>
        </div>
      </div>

      <section
        id="demo-scenarios"
        aria-labelledby="demo-heading"
        className="animate-view-in [animation-delay:170ms] scroll-mt-24 rounded-3xl border border-dashed border-border bg-card/40 p-4 sm:p-6"
      >
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="demo-heading" className="text-sm font-bold tracking-tight text-foreground">
              {IS_MOCK ? 'Or jump straight into a case' : 'Just exploring?'}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {IS_MOCK
                ? 'Each scenario opens a finished case with its own papers, letters and history timeline.'
                : 'Open a sample scenario. Every name, amount and paper in it is fake.'}
            </p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Demo data
          </span>
        </div>
        <PersonaSelector />
      </section>
    </section>
  );
}

import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Store, Briefcase, Coins, ShieldAlert, Check } from 'lucide-react';

export function PersonaSelector() {
  const { caseData, selectedPersona, selectPersona, isProcessing } = useCase();

  const personas = [
    {
      id: 'RAVI' as const,
      name: 'Ravi Sharma',
      role: 'Shopkeeper (Pune)',
      desc: 'Happy Path: ₹2k UPI repair, ₹1.80L balance. Full BNSS §106 representation & ₹1.78L release.',
      tag: 'Section 106 Benchmark',
      icon: Store,
    },
    {
      id: 'MEERA' as const,
      name: 'Meera Sen',
      role: 'Freelancer',
      desc: 'Clarification flow: Vague invoice triggers proactive AI questions before letter generation.',
      tag: 'Multi-turn Q&A',
      icon: Briefcase,
    },
    {
      id: 'ARJUN' as const,
      name: 'Arjun Verma',
      role: 'P2P Crypto Seller',
      desc: 'Crypto P2P: Disputed ₹9.8k hold with escrow order trail & caution line.',
      tag: 'P2P Escrow Defense',
      icon: Coins,
    },
    {
      id: 'SUNIL' as const,
      name: 'Sunil Kumar',
      role: 'Account Lending',
      desc: 'Safety Trap: Renting bank account detected. Prohibits letters and routes to NALSA Legal Aid.',
      tag: 'Critical Safety Guard',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="sm:hidden flex items-center justify-between text-[11px] text-muted-foreground px-1 font-medium">
        <span>Sample scenarios</span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Swipe to explore →</span>
      </div>
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2 pb-2 sm:pt-2 sm:pb-1 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
        {personas.map((p, index) => {
          // A persona is only "selected" once its demo case actually exists.
          const isSelected = !!caseData?.demo && selectedPersona === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              disabled={isProcessing}
              onClick={() => selectPersona(p.id)}
              style={{ animationDelay: `${100 + index * 55}ms` }}
              className={`group animate-view-in relative flex min-w-[250px] max-w-[280px] flex-1 snap-start shrink-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left text-xs transition-all hover:z-20 hover-lift sm:min-w-0 sm:max-w-none sm:shrink ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 text-foreground ring-2 ring-emerald-600/25 dark:border-emerald-500 dark:bg-emerald-950/40 dark:ring-emerald-500/25 shadow-md shadow-emerald-500/10 z-10'
                  : 'border-border bg-card shadow-subtle hover:border-emerald-500/50 hover:shadow-card text-foreground'
              }`}
            >
            <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/0 blur-2xl transition-colors duration-300 group-hover:bg-emerald-500/10" />
            <div className="relative">
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs'
                        : 'bg-secondary text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <span className="font-bold text-[13px] leading-tight">
                    {p.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="animate-check-pop h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mb-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 h-4 font-normal ${
                    isSelected
                      ? 'border-emerald-500/30 bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {p.tag}
                </Badge>
              </div>

              <p
                className={`text-[11px] leading-relaxed line-clamp-2 transition-colors ${
                  isSelected
                    ? 'text-foreground/90 font-medium'
                    : 'text-muted-foreground group-hover:text-foreground/75'
                }`}
              >
                {p.desc}
              </p>
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}

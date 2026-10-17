import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Badge } from '@/components/ui/badge';
import { Store, Briefcase, Coins, ShieldAlert, Check } from 'lucide-react';

export function PersonaSelector() {
  const { selectedPersona, selectPersona, isProcessing } = useCase();

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
        <span>Evaluator Personas</span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400">Swipe to test scenarios →</span>
      </div>
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pb-1.5 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
        {personas.map(p => {
          const isSelected = selectedPersona === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              disabled={isProcessing}
              onClick={() => selectPersona(p.id)}
              className={`group text-left p-3.5 rounded-xl border transition-all text-xs relative flex flex-col justify-between card-hover-micro min-w-[250px] max-w-[280px] sm:min-w-0 sm:max-w-none flex-1 snap-start shrink-0 sm:shrink ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 text-foreground ring-2 ring-blue-600/20 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-500/20 shadow-sm'
                  : 'border-border bg-card hover:border-border/80 shadow-subtle text-foreground'
              }`}
            >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <span className="font-semibold text-xs leading-tight">
                    {p.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mb-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 h-4 font-normal ${
                    isSelected
                      ? 'border-blue-500/30 bg-blue-100/60 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {p.tag}
                </Badge>
              </div>

              <p
                className={`text-[11px] leading-relaxed line-clamp-2 ${
                  isSelected
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-muted-foreground'
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

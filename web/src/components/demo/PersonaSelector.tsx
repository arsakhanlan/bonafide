import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Palette, Bitcoin, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function PersonaSelector() {
  const { selectedPersona, selectPersona, isProcessing } = useCase();

  const personas = [
    {
      id: 'RAVI' as const,
      name: 'Ravi Sharma',
      role: 'Shopkeeper (Pune)',
      desc: 'Happy Path: ₹2k UPI repair, ₹1.80L frozen. Full BNSS §106 representation & ₹1.78L release.',
      tag: 'Section 106 Benchmark',
      tagColor: 'success' as const,
      icon: Store,
    },
    {
      id: 'MEERA' as const,
      name: 'Meera Sen',
      role: 'Freelancer',
      desc: 'Clarification flow: Vague invoice triggers proactive AI questions before letter generation.',
      tag: 'Multi-turn Q&A',
      tagColor: 'warning' as const,
      icon: Palette,
    },
    {
      id: 'ARJUN' as const,
      name: 'Arjun Verma',
      role: 'P2P Crypto Seller',
      desc: 'Crypto P2P: Disputed ₹9.8k hold with escrow order trail & caution line.',
      tag: 'P2P Escrow Defense',
      tagColor: 'info' as const,
      icon: Bitcoin,
    },
    {
      id: 'SUNIL' as const,
      name: 'Sunil Kumar',
      role: 'Account Lending',
      desc: 'Safety Trap: Renting bank account detected. Prohibits letters and routes to NALSA Legal Aid.',
      tag: 'Critical Safety Guard',
      tagColor: 'destructive' as const,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {personas.map(p => {
        const isSelected = selectedPersona === p.id;
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            disabled={isProcessing}
            onClick={() => selectPersona(p.id)}
            className={`group text-left p-3.5 rounded-xl border transition-all text-xs relative flex flex-col justify-between ${
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-950 ring-2 ring-slate-900/10 dark:ring-white/10'
                : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm leading-tight">
                    {p.name}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                )}
              </div>

              <div className="mb-2">
                <Badge
                  variant={isSelected ? 'outline' : p.tagColor}
                  className={`text-[10px] py-0 h-4 font-normal ${
                    isSelected ? 'border-white/30 text-white dark:border-slate-900/30 dark:text-slate-900' : ''
                  }`}
                >
                  {p.tag}
                </Badge>
              </div>

              <p
                className={`text-[11px] leading-relaxed line-clamp-3 ${
                  isSelected
                    ? 'text-white/80 dark:text-slate-700'
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
  );
}


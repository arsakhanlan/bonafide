import React from 'react';
import { useCase } from '@/context/CaseContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Moon,
  Sun,
  Plus,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export function Header() {
  const { caseData, setModal, selectedPersona, selectPersona, currentSimulatedDate, simulatedDays } = useCase();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white">
                Bonafide
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono py-0 h-5 border-slate-300 dark:border-slate-700">
                BNSS §106
              </Badge>
            </div>
            <p className="hidden md:block text-xs text-muted-foreground font-medium">
              Autonomous Legal Agent for Innocent Bank Account Freezes
            </p>
          </div>
        </div>

        {/* Persona quick switch + Simulation controls */}
        <div className="flex items-center gap-2">
          {/* Persona quick pills for evaluators / judges */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <span className="px-2 text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Demo:
            </span>
            {(['RAVI', 'MEERA', 'ARJUN', 'SUNIL'] as const).map(p => (
              <button
                key={p}
                onClick={() => selectPersona(p)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPersona === p
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'RAVI' && 'Ravi (Shop)'}
                {p === 'MEERA' && 'Meera (Q&A)'}
                {p === 'ARJUN' && 'Arjun (P2P)'}
                {p === 'SUNIL' && 'Sunil (Referral)'}
              </button>
            ))}
          </div>

          {/* Time simulation indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{currentSimulatedDate}</span>
            {simulatedDays > 0 && (
              <span className="font-semibold text-blue-700 dark:text-blue-200">
                (+{simulatedDays}d)
              </span>
            )}
          </div>

          {/* Swagger / API Docs button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModal('SWAGGER')}
            className="gap-1.5 font-medium text-xs text-slate-700 dark:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Swagger API</span>
          </Button>

          {/* New Case Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('NEW_CASE')}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Case</span>
          </Button>

          {/* Theme switcher */}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}


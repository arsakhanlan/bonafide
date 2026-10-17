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
  Play,
  ExternalLink,
} from 'lucide-react';

export function Header() {
  const { caseData, setModal, selectedPersona, selectPersona, currentSimulatedDate, simulatedDays } = useCase();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container px-3 sm:px-6 flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 shrink-0 animate-float">
            <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-foreground">
                Bonafide
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono py-0 h-4.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold">
                BNSS §106
              </Badge>
            </div>
            <p className="hidden md:block text-[11px] text-muted-foreground font-medium">
              Autonomous Bank Account Freeze Defense
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 2-Min Demo Tour Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('GUIDED_TOUR')}
            className="h-8 px-2.5 sm:px-3 gap-1.5 font-semibold text-xs border-emerald-500/30 bg-card text-foreground hover:bg-secondary shadow-xs transition-all hover:border-emerald-500/60 group"
          >
            <Play className="h-3 w-3 fill-current text-emerald-600 dark:text-emerald-400 animate-back-and-forth" />
            <span className="hidden sm:inline">2-Min Demo Tour</span>
            <span className="sm:hidden">Tour</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono animate-back-and-forth">→</span>
          </Button>

          {/* Swagger / API Docs button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModal('SWAGGER')}
            className="gap-1.5 font-medium text-xs text-slate-700 dark:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">API Spec</span>
          </Button>

          {/* New Case Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('NEW_CASE')}
            className="gap-1.5 font-medium text-xs"
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
            className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Scale,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidedTourModal({ isOpen, onClose }: GuidedTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const { selectPersona } = useCase();

  const tourSteps = [
    {
      title: 'The Common Indian Nightmare',
      badge: 'Real-World Dilemma',
      icon: Store,
      tagline: 'Lien vs Genuine Savings',
      headline: 'A ₹2,000 UPI repair payment froze a shopkeeper\'s entire ₹1,80,000 savings.',
      content:
        'Meet Ravi, an independent mobile phone technician in Pune. A walk-in customer paid him ₹2,000 via UPI for a cracked screen replacement. Days later, cyber police in another state flagged that ₹2,000 in a dispute. In response, his bank slapped a blanket debit freeze on his entire ₹1,80,000 operating balance, preventing him from buying stock, paying rent, or buying groceries.',
      actionText: 'See The Statutory Law',
      highlight: 'Police inquiry was for ₹2,000 — but the bank froze 100% of his livelihood.',
    },
    {
      title: 'The Statutory Law (BNSS §106)',
      badge: 'Statutory Shield',
      icon: Scale,
      tagline: 'Section 106 & MHA SOP',
      headline: 'The law strictly prohibits blanket freezes on innocent balances.',
      content:
        'Under Section 106 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, and Ministry of Home Affairs SOP Cl. 4.2 & 10.1, bank liens must be restricted solely to the contested ₹2,000. Innocent surplus funds must be unfreezed immediately. Blanket debit freezes on genuine merchant receipts violate constitutional statutory protections.',
      actionText: 'How AI Solves It',
      highlight: 'Bank is obligated by statute to release ₹1,78,000 immediately.',
    },
    {
      title: 'Autonomous Legal Representation',
      badge: 'Zero Hallucinations',
      icon: FileText,
      tagline: 'Formal Representation',
      headline: 'AI Reader & Writer craft your formal Section 106 legal representation.',
      content:
        'Bonafide scans your bank notice SMS, tax invoice, and repair job receipt. It matches the payment UTR number, grounds the commercial consideration under the Indian Contract Act, and drafts a formal legal representation directly to the Branch Manager citing exact statutory clauses and judicial precedents.',
      actionText: 'The 7-Day Statutory Clock',
      highlight: 'Complete formal representation ready to print and sign in under 2 minutes.',
    },
    {
      title: 'Statutory 7-Day Compliance Timer',
      badge: 'Strict Accountability',
      icon: Clock,
      tagline: 'MHA SOP Cl. 10.1 Window',
      headline: 'Once delivered, the bank has 7 calendar days to record and act.',
      content:
        'Upon delivery at the branch, Bonafide triggers an automated 7-day statutory compliance timer. If the bank fails to act or ignore the notice, Bonafide immediately prepares an Overdue Escalation Notice and routes the case to the RBI Banking Ombudsman and the High Court.',
      actionText: 'Explore Personas',
      highlight: 'Automated countdown tracks bank manager obligations and escalation triggers.',
    },
    {
      title: 'Explore All 4 Benchmark Personas',
      badge: 'Interactive Scenarios',
      icon: Sparkles,
      tagline: 'One-Click Simulator',
      headline: 'Switch between scenarios with 1 click to test the full system.',
      content:
        'Test Ravi (innocent shopkeeper benchmark), Meera (freelancer requiring AI Q&A clarification), Arjun (crypto P2P seller with escrow proof), and Sunil (account lending trap where the agent stops letters and directs to free legal aid).',
      actionText: 'Get Started with Bonafide',
      highlight: 'Full multi-agent ADK mesh covering valid claims and safety edge-cases.',
    },
  ];

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setSlideDirection('forward');
      setCurrentStep(currentStep + 1);
    } else {
      selectPersona('RAVI');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setSlideDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultClose className="w-[calc(100%-1.5rem)] sm:w-full max-w-2xl p-0 overflow-hidden rounded-3xl border-border bg-card shadow-2xl">
        {/* Top Sovereign Green Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-500" />

        {/* Modal Top Header with Clean Hierarchy */}
        <div className="p-5 sm:p-7 pb-4 bg-muted/20 border-b border-border/70 relative">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                <StepIcon className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider py-0 h-4.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                    {step.badge}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                  {step.tagline}
                </span>
              </div>
            </div>

            {/* Clean Single Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all active:scale-95"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stepper Progress Pill Dots */}
          <div className="grid grid-cols-5 gap-2 pt-1 pb-1">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSlideDirection(i > currentStep ? 'forward' : 'backward');
                  setCurrentStep(i);
                }}
                className={`h-2 rounded-full transition-all focus:outline-none ${
                  i === currentStep
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40 ring-2 ring-emerald-500/25'
                    : i < currentStep
                    ? 'bg-emerald-600/70 dark:bg-emerald-500/50 hover:bg-emerald-500'
                    : 'bg-muted hover:bg-muted-foreground/30'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Main Body */}
        <div
          key={`tour-body-${currentStep}`}
          className={`p-5 sm:p-7 space-y-4 text-foreground ${
            slideDirection === 'forward' ? 'tour-slide-forward' : 'tour-slide-backward'
          }`}
        >
          {/* Main Headline */}
          <h3 className="text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
            {step.headline}
          </h3>

          {/* Description Paragraph */}
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          {/* Highlight Key Takeaway Callout */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 sm:p-4 flex items-start gap-3 text-xs">
            <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider font-mono">
                Statutory Grounding
              </span>
              <p className="text-xs text-foreground/80 mt-0.5 font-medium leading-relaxed">
                {step.highlight}
              </p>
            </div>
          </div>

          {/* Persona selector quick-tiles on the final step */}
          {currentStep === 4 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-foreground block">
                Select a Persona to Test First:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { selectPersona('RAVI'); onClose(); }}
                  className="p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-left text-xs transition-all card-hover-micro flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-foreground block">Ravi Sharma (Shopkeeper)</span>
                    <span className="text-[11px] text-muted-foreground">₹2k hold → ₹1.78L release</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => { selectPersona('MEERA'); onClose(); }}
                  className="p-3 rounded-2xl border border-border hover:border-emerald-500/40 bg-secondary/30 hover:bg-secondary/60 text-left text-xs transition-all card-hover-micro flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-foreground block">Meera Sen (Freelancer)</span>
                    <span className="text-[11px] text-muted-foreground">Multi-turn AI clarifying Q&A</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => { selectPersona('ARJUN'); onClose(); }}
                  className="p-3 rounded-2xl border border-border hover:border-emerald-500/40 bg-secondary/30 hover:bg-secondary/60 text-left text-xs transition-all card-hover-micro flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-foreground block">Arjun Verma (Crypto P2P)</span>
                    <span className="text-[11px] text-muted-foreground">P2P Escrow order trails</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => { selectPersona('SUNIL'); onClose(); }}
                  className="p-3 rounded-2xl border border-border hover:border-emerald-500/40 bg-secondary/30 hover:bg-secondary/60 text-left text-xs transition-all card-hover-micro flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-foreground block">Sunil Kumar (Account Mule)</span>
                    <span className="text-[11px] text-muted-foreground">Safety stop & Free Legal Aid</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 px-5 sm:px-7 bg-muted/20 border-t border-border/70 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="text-xs h-9 px-3 gap-1 rounded-xl text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 px-3.5 rounded-xl border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs h-9 font-semibold gap-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs group active:scale-[0.98] transition-all"
            >
              <span>{step.actionText}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

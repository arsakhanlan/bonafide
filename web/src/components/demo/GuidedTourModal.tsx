import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
  Scale,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidedTourModal({ isOpen, onClose }: GuidedTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const { selectPersona, setModal } = useCase();

  const tourSteps = [
    {
      title: 'The Common Indian Nightmare',
      badge: 'Real-World Context',
      badgeColor: 'destructive' as const,
      icon: Store,
      headline: 'A ₹2,000 UPI payment just froze your entire ₹1,80,000 bank savings.',
      content:
        'Meet Ravi, a phone repair technician in Pune. A customer paid him ₹2,000 via UPI for a screen repair. Later, police in Patna flagged that ₹2,000 in a cyber fraud complaint. Instead of freezing just ₹2,000, his bank slapped a blanket debit freeze on his entire ₹1,80,000 balance! He cannot buy groceries or pay his staff.',
      actionText: 'See How Bonafide Protects Ravi',
    },
    {
      title: 'The Statutory Law (BNSS §106)',
      badge: 'The Legal Superpower',
      badgeColor: 'success' as const,
      icon: Scale,
      headline: 'The law strictly forbids freezing innocent money.',
      content:
        'Under Section 106 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 and the Ministry of Home Affairs Cyber SOP (2 Jan 2026), banks are prohibited from freezing entire accounts. The lien must be restricted strictly to the disputed ₹2,000, and the remaining ₹1,78,000 must be released immediately.',
      actionText: 'How the AI Agent Solves It',
    },
    {
      title: 'Autonomous Legal Representation',
      badge: 'Zero Lawyer Fees',
      badgeColor: 'info' as const,
      icon: FileText,
      headline: 'AI Reader & Writer craft your formal statutory representation.',
      content:
        'Bonafide scans your receipts, verifies your innocent commercial transaction, masks your private data, and generates a formal representation letter addressed to your Bank Branch Manager citing exact statutory clauses word-for-word without hallucination.',
      actionText: 'The 7-Day Bank Clock',
    },
    {
      title: 'Statutory 7-Day Compliance Timer',
      badge: 'Enforceable Accountability',
      badgeColor: 'warning' as const,
      icon: Clock,
      headline: 'Once delivered, the bank has 7 calendar days to comply.',
      content:
        'Under MHA SOP Cl. 10.1(a), the bank must log your grievance within 7 days. If they fail or ignore you, Bonafide automatically prepares an Overdue Reminder Notice and escalates to the RBI Banking Ombudsman and High Court.',
      actionText: 'Explore the 4 Personas',
    },
    {
      title: 'Explore All 4 Benchmark Personas',
      badge: 'Interactive Testing',
      badgeColor: 'purple' as const,
      icon: Sparkles,
      headline: 'Switch between scenarios with 1 click to test the full system.',
      content:
        'Test Ravi (the innocent shopkeeper), Meera (freelancer needing clarifying questions), Arjun (crypto P2P seller), and Sunil (account-lending mule trap, where the AI safely stops letter drafting and redirects to government Free Legal Aid 15100).',
      actionText: 'Start Using Bonafide Now',
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
      <DialogContent hideDefaultClose className="w-[calc(100%-1rem)] sm:w-full max-w-xl p-0 overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
        {/* Subtle Sovereign Accent Top Rim */}
        <div className="h-1 w-full bg-emerald-500" />

        {/* Step Progress Top Bar with unified cohesive dark emerald palette */}
        <div className="bg-gradient-to-br from-emerald-950/90 via-card to-card text-foreground p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border/80 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm border border-emerald-500/20">
                <StepIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider py-0 h-4.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {step.badge}
                  </Badge>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded text-[9px] font-mono font-semibold bg-secondary text-muted-foreground border border-border/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>BNSS §106</span>
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                  Step {currentStep + 1} of {tourSteps.length}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div key={`headline-${currentStep}`} className={slideDirection === 'forward' ? 'tour-slide-forward' : 'tour-slide-backward'}>
            <h3 className="text-base sm:text-xl font-bold text-foreground tracking-tight leading-snug">
              {step.headline}
            </h3>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 mt-3 sm:mt-4">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSlideDirection(i > currentStep ? 'forward' : 'backward');
                  setCurrentStep(i);
                }}
                className={`h-1.5 rounded-full transition-all focus:outline-none ${
                  i === currentStep
                    ? 'w-8 bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : i < currentStep
                    ? 'w-3 bg-emerald-700/60 dark:bg-emerald-600/60 hover:bg-emerald-600'
                    : 'w-3 bg-muted hover:bg-muted-foreground/30'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Story Body with animated transition */}
        <div
          key={`content-${currentStep}`}
          className={`p-4 sm:p-6 space-y-3 sm:space-y-4 text-xs sm:text-sm text-foreground/80 leading-relaxed ${
            slideDirection === 'forward' ? 'tour-slide-forward' : 'tour-slide-backward'
          }`}
        >
          <p>{step.content}</p>

          {currentStep === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 sm:pt-2">
              <button
                onClick={() => { selectPersona('RAVI'); onClose(); }}
                className="p-2.5 rounded-xl border border-border hover:border-emerald-500/50 text-left text-xs bg-secondary/40 hover:bg-secondary transition-colors card-hover-micro active:scale-[0.99]"
              >
                <span className="font-bold text-foreground block">Ravi Sharma</span>
                <span className="text-[11px] text-muted-foreground">Shopkeeper (Benchmark Happy Path)</span>
              </button>

              <button
                onClick={() => { selectPersona('MEERA'); onClose(); }}
                className="p-2.5 rounded-xl border border-border hover:border-emerald-500/50 text-left text-xs bg-secondary/40 hover:bg-secondary transition-colors card-hover-micro active:scale-[0.99]"
              >
                <span className="font-bold text-foreground block">Meera Sen</span>
                <span className="text-[11px] text-muted-foreground">Freelancer (Interactive Q&A)</span>
              </button>

              <button
                onClick={() => { selectPersona('ARJUN'); onClose(); }}
                className="p-2.5 rounded-xl border border-border hover:border-emerald-500/50 text-left text-xs bg-secondary/40 hover:bg-secondary transition-colors card-hover-micro active:scale-[0.99]"
              >
                <span className="font-bold text-foreground block">Arjun Verma</span>
                <span className="text-[11px] text-muted-foreground">Crypto P2P Seller (Escrow Logs)</span>
              </button>

              <button
                onClick={() => { selectPersona('SUNIL'); onClose(); }}
                className="p-2.5 rounded-xl border border-border hover:border-emerald-500/50 text-left text-xs bg-secondary/40 hover:bg-secondary transition-colors card-hover-micro active:scale-[0.99]"
              >
                <span className="font-bold text-foreground block">Sunil Kumar</span>
                <span className="text-[11px] text-muted-foreground">Account Lending (Legal Aid Referral)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="p-3 sm:p-4 px-4 sm:px-6 bg-secondary/30 border-t border-border/80 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="text-xs gap-1 group active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            className="text-xs font-semibold gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm group active:scale-[0.98] transition-all"
          >
            <span>{step.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


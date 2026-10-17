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
      setCurrentStep(currentStep + 1);
    } else {
      selectPersona('RAVI');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Step Progress Top Bar */}
        <div className="bg-slate-900 text-white p-6 pb-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <StepIcon className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <Badge variant={step.badgeColor} className="text-[10px] font-mono uppercase tracking-wider py-0 h-4">
                  {step.badge}
                </Badge>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  Step {currentStep + 1} of {tourSteps.length}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {step.headline}
          </h3>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-8 bg-indigo-400'
                    : i < currentStep
                    ? 'w-3 bg-indigo-600/70'
                    : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Story Body */}
        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>{step.content}</p>

          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => { selectPersona('RAVI'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-left text-xs bg-slate-50 dark:bg-slate-900/60 transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Ravi Sharma</span>
                <span className="text-[11px] text-muted-foreground">Shopkeeper (Benchmark Happy Path)</span>
              </button>

              <button
                onClick={() => { selectPersona('MEERA'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-left text-xs bg-slate-50 dark:bg-slate-900/60 transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Meera Sen</span>
                <span className="text-[11px] text-muted-foreground">Freelancer (Interactive Q&A)</span>
              </button>

              <button
                onClick={() => { selectPersona('ARJUN'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-left text-xs bg-slate-50 dark:bg-slate-900/60 transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Arjun Verma</span>
                <span className="text-[11px] text-muted-foreground">Crypto P2P Seller (Escrow Logs)</span>
              </button>

              <button
                onClick={() => { selectPersona('SUNIL'); onClose(); }}
                className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:border-rose-400 text-left text-xs bg-rose-50/50 dark:bg-rose-950/30 transition-colors"
              >
                <span className="font-bold text-rose-900 dark:text-rose-200 block">Sunil Kumar</span>
                <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80">Account Lending (Legal Aid Referral)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="p-4 px-6 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="text-xs gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </Button>

          <Button
            size="sm"
            variant="hero"
            onClick={handleNext}
            className="text-xs font-semibold gap-1.5 px-4"
          >
            <span>{step.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

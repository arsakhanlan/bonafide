import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SimpleHeroStatus } from '@/components/case/SimpleHeroStatus';
import { CitizenJourneyStepper } from '@/components/case/CitizenJourneyStepper';
import { MoneyCard } from '@/components/case/MoneyCard';
import { NextStepHero } from '@/components/case/NextStepHero';
import { LettersList } from '@/components/case/LettersList';
import { StatutoryDeadlinesCard } from '@/components/case/StatutoryDeadlinesCard';
import { DocumentsList } from '@/components/case/DocumentsList';
import { AuditLogActivity } from '@/components/case/AuditLogActivity';
import { ReferralCard } from '@/components/case/ReferralCard';
import { GuidedTourModal } from '@/components/demo/GuidedTourModal';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { LetterViewerModal } from '@/components/case/LetterViewerModal';
import { QuestionsModal } from '@/components/case/QuestionsModal';
import { MarkSentModal } from '@/components/case/MarkSentModal';
import { RecordReplyModal } from '@/components/case/RecordReplyModal';
import { UploadModal } from '@/components/case/UploadModal';
import { NewCaseModal } from '@/components/case/NewCaseModal';
import { SwaggerModal } from '@/components/case/SwaggerModal';
import { useCase } from '@/context/CaseContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { IS_MOCK, isDemoCase } from '@/lib/mode';
import { Shield, Plus, Loader2, AlertCircle, X } from 'lucide-react';

export function App() {
  const { caseData, activeModal, setModal, loading, error, clearError, deleteCase, isProcessing } = useCase();
  const { authError, signInGuest } = useAuth();

  // Demo-only chrome (mock mode, or a real demo case created for judges).
  const showDemo = IS_MOCK || isDemoCase(caseData?.demo);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-emerald-600 selection:text-white">
      <Header />

      <main className="flex-1 container px-3 sm:px-6 py-4 sm:py-6 space-y-4 max-w-7xl">
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={clearError} aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {authError && !IS_MOCK && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-sm text-muted-foreground">{authError}</p>
            <Button size="sm" onClick={signInGuest} className="text-xs">
              Try again
            </Button>
          </div>
        )}

        {loading && !IS_MOCK ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-xs">Loading your case…</p>
          </div>
        ) : caseData ? (
          <section aria-label="Active Case Command Center" className="space-y-4">
            <SimpleHeroStatus />

            <CitizenJourneyStepper />

            <ReferralCard />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-8 space-y-4">
                <MoneyCard />

                <NextStepHero />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LettersList />
                  <StatutoryDeadlinesCard />
                </div>

                <DocumentsList />

                <div className="flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isProcessing}
                    onClick={deleteCase}
                    className="text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Delete this case and its papers
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4 sticky top-20">
                <AuditLogActivity />
              </div>
            </div>
          </section>
        ) : (
          <section aria-label="Start" className="space-y-6 pt-6 sm:pt-12">
            <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-10 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Your bank account was frozen after a fraud complaint?
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Bonafide reads your bank message and statement, works out what is really in
                dispute, and writes the right letters under BNSS §106 and the MHA SOP — every
                quote checked word-for-word. You approve and send everything yourself.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="default"
                  onClick={() => setModal('NEW_CASE')}
                  className="h-11 px-6 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Start my case
                </Button>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Free. Self-help only — not legal advice, and Bonafide never sends anything for you.
              </p>
            </div>

            {/* Demo scenarios stay available on the start screen (judges one-tap them in prod;
                a new user's primary path is the button above). */}
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Just exploring? Open a demo scenario (fake data)
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <PersonaSelector />
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      {showDemo && (
        <GuidedTourModal isOpen={activeModal === 'GUIDED_TOUR'} onClose={() => setModal('NONE')} />
      )}
      <LetterViewerModal />
      <QuestionsModal />
      <MarkSentModal />
      <RecordReplyModal />
      <UploadModal />
      <NewCaseModal />
      {showDemo && (
        <SwaggerModal isOpen={activeModal === 'SWAGGER'} onClose={() => setModal('NONE')} />
      )}
    </div>
  );
}

export default App;

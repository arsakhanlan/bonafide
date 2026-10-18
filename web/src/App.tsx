import React, { useEffect, useState } from 'react';
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
import { DemoJourneyBar } from '@/components/demo/DemoJourneyBar';
import { RestartDialog } from '@/components/demo/RestartDialog';
import { BootScreen } from '@/components/layout/BootScreen';
import { ErrorToast } from '@/components/layout/ErrorToast';
import { StartScreen } from '@/components/start/StartScreen';
import { DeleteCaseDialog } from '@/components/case/DeleteCaseDialog';
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
import { AlertCircle } from 'lucide-react';

export function App() {
  const { caseData, activeModal, setModal, loading, error, clearError, deleteCase, resetDemo, isProcessing } = useCase();
  const { authError, signInGuest } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  // Demo-only chrome (mock mode, or a real demo case created for judges).
  const showDemo = IS_MOCK || isDemoCase(caseData?.demo);

  // A new case replaces the whole view; start it at the top, not at the old scroll offset.
  const caseId = caseData?.id;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [caseId]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-emerald-600 selection:text-white">
      <Header onBrandClick={() => setConfirmRestart(true)} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <main
        id="main-content"
        className="flex-1 container px-3 sm:px-6 py-4 sm:py-6 space-y-4 max-w-7xl"
      >
        {authError && !IS_MOCK ? (
          <section
            aria-label="Sign-in problem"
            className="animate-view-in mx-auto mt-10 max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-8"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              We could not sign you in
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{authError}</p>
            <Button size="sm" onClick={signInGuest} className="mt-5 text-xs font-semibold">
              Try again
            </Button>
          </section>
        ) : loading && !IS_MOCK ? (
          <BootScreen />
        ) : caseData ? (
          <section aria-label="Active Case Command Center" className="animate-view-in space-y-4">
            {IS_MOCK && <DemoJourneyBar onRestart={() => setConfirmRestart(true)} />}

            <SimpleHeroStatus />

            <CitizenJourneyStepper />

            <ReferralCard />

            <div className="animate-view-in [animation-delay:120ms] grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
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
                    onClick={() => setConfirmDelete(true)}
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
          <StartScreen />
        )}
      </main>

      <Footer />

      {error && <ErrorToast message={error} onDismiss={clearError} />}

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
      <DeleteCaseDialog
        open={confirmDelete}
        busy={isProcessing}
        onOpenChange={setConfirmDelete}
        onConfirm={async () => {
          await deleteCase();
          setConfirmDelete(false);
        }}
      />
      <RestartDialog
        open={confirmRestart}
        demo={IS_MOCK}
        onOpenChange={setConfirmRestart}
        onConfirm={() => {
          setConfirmRestart(false);
          if (IS_MOCK) resetDemo();
          else window.location.reload();
        }}
      />
      {showDemo && (
        <SwaggerModal isOpen={activeModal === 'SWAGGER'} onClose={() => setModal('NONE')} />
      )}
    </div>
  );
}

export default App;

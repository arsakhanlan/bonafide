import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SimpleHeroStatus } from '@/components/case/SimpleHeroStatus';
import { CitizenJourneyStepper } from '@/components/case/CitizenJourneyStepper';
import { MoneyCard } from '@/components/case/MoneyCard';
import { NextStepHero } from '@/components/case/NextStepHero';
import { LettersList } from '@/components/case/LettersList';
import { StatutoryDeadlinesCard } from '@/components/case/StatutoryDeadlinesCard';
import { AuditLogActivity } from '@/components/case/AuditLogActivity';
import { ReferralCard } from '@/components/case/ReferralCard';
import { GuidedTourModal } from '@/components/demo/GuidedTourModal';
import { LetterViewerModal } from '@/components/case/LetterViewerModal';
import { QuestionsModal } from '@/components/case/QuestionsModal';
import { MarkSentModal } from '@/components/case/MarkSentModal';
import { RecordReplyModal } from '@/components/case/RecordReplyModal';
import { UploadModal } from '@/components/case/UploadModal';
import { NewCaseModal } from '@/components/case/NewCaseModal';
import { SwaggerModal } from '@/components/case/SwaggerModal';
import { useCase } from '@/context/CaseContext';

export function App() {
  const { caseData, activeModal, setModal } = useCase();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-emerald-600 selection:text-white">
      <Header />

      <main className="flex-1 container px-3 sm:px-6 py-4 sm:py-6 space-y-4 max-w-7xl">
        {caseData && (
          <section aria-label="Active Case Command Center" className="space-y-4">
            {/* 1. Integrated Case Headline, Safeguard Badge & Evaluator Time Machine */}
            <SimpleHeroStatus />

            {/* 2. Horizontal Connected Statutory Unfreeze Roadmap */}
            <CitizenJourneyStepper />

            {/* Safety Referral if lending account detected */}
            <ReferralCard />

            {/* 3. Main 2-Column Split: 8 cols left (Money + Hero + Letters + Clocks) & 4 cols right (Audit Log) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column (8 cols): Primary Citizen Workflow */}
              <div className="lg:col-span-8 space-y-4">
                {/* 3-Column Balance Grid */}
                <MoneyCard />

                {/* Single Decisive Action Required Hero */}
                <NextStepHero />

                {/* Letters & Statutory Compliance Clocks Side-by-Side or Stacked */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LettersList />
                  <StatutoryDeadlinesCard />
                </div>
              </div>

              {/* Right Column (4 cols): Dedicated Unified Audit Log & Activity with Autonomous Reasoning */}
              <div className="lg:col-span-4 sticky top-20">
                <AuditLogActivity />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      <GuidedTourModal isOpen={activeModal === 'GUIDED_TOUR'} onClose={() => setModal('NONE')} />
      <LetterViewerModal />
      <QuestionsModal />
      <MarkSentModal />
      <RecordReplyModal />
      <UploadModal />
      <NewCaseModal />
      <SwaggerModal isOpen={activeModal === 'SWAGGER'} onClose={() => setModal('NONE')} />
    </div>
  );
}

export default App;

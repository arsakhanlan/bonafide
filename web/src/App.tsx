import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { TimeMachineSkip } from '@/components/demo/TimeMachineSkip';
import { CaseHeader } from '@/components/case/CaseHeader';
import { NextStepHero } from '@/components/case/NextStepHero';
import { MoneyCard } from '@/components/case/MoneyCard';
import { StatutoryDeadlinesCard } from '@/components/case/StatutoryDeadlinesCard';
import { LettersList } from '@/components/case/LettersList';
import { DocumentsList } from '@/components/case/DocumentsList';
import { AgentTraceLive } from '@/components/case/AgentTraceLive';
import { CaseTimeline } from '@/components/case/CaseTimeline';
import { ReferralCard } from '@/components/case/ReferralCard';
import { LetterViewerModal } from '@/components/case/LetterViewerModal';
import { QuestionsModal } from '@/components/case/QuestionsModal';
import { MarkSentModal } from '@/components/case/MarkSentModal';
import { RecordReplyModal } from '@/components/case/RecordReplyModal';
import { UploadModal } from '@/components/case/UploadModal';
import { NewCaseModal } from '@/components/case/NewCaseModal';
import { useCase } from '@/context/CaseContext';

export function App() {
  const { caseData } = useCase();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-foreground transition-colors">
      <Header />

      <main className="flex-1 container py-6 space-y-6">
        {/* Judge & Evaluator quick showcase controls */}
        <section aria-label="Demo Personas & Time Controls" className="space-y-3">
          <PersonaSelector />
          <TimeMachineSkip />
        </section>

        {caseData && (
          <section aria-label="Active Case Details" className="space-y-6">
            <CaseHeader />

            <NextStepHero />

            <ReferralCard />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Legal & Financial Substantive State (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <MoneyCard />
                <StatutoryDeadlinesCard />
                <LettersList />
                <DocumentsList />
              </div>

              {/* Right Column: AI Agent Reasoning Mesh & Audit Trail (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <AgentTraceLive />
                <CaseTimeline />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      <LetterViewerModal />
      <QuestionsModal />
      <MarkSentModal />
      <RecordReplyModal />
      <UploadModal />
      <NewCaseModal />
    </div>
  );
}
export default App;


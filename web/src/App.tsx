import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { TimeMachineSkip } from '@/components/demo/TimeMachineSkip';
import { SimpleHeroStatus } from '@/components/case/SimpleHeroStatus';
import { CitizenJourneyStepper } from '@/components/case/CitizenJourneyStepper';
import { NextStepHero } from '@/components/case/NextStepHero';
import { StatutoryDeadlinesCard } from '@/components/case/StatutoryDeadlinesCard';
import { LettersList } from '@/components/case/LettersList';
import { DocumentsList } from '@/components/case/DocumentsList';
import { AgentTraceLive } from '@/components/case/AgentTraceLive';
import { CaseTimeline } from '@/components/case/CaseTimeline';
import { ReferralCard } from '@/components/case/ReferralCard';
import { GuidedTourModal } from '@/components/demo/GuidedTourModal';
import { LetterViewerModal } from '@/components/case/LetterViewerModal';
import { QuestionsModal } from '@/components/case/QuestionsModal';
import { MarkSentModal } from '@/components/case/MarkSentModal';
import { RecordReplyModal } from '@/components/case/RecordReplyModal';
import { UploadModal } from '@/components/case/UploadModal';
import { NewCaseModal } from '@/components/case/NewCaseModal';
import { SwaggerModal } from '@/components/case/SwaggerModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCase } from '@/context/CaseContext';
import { FileText, Clock, FileCheck, Cpu, History } from 'lucide-react';

export function App() {
  const { caseData, activeModal, setModal, letters } = useCase();
  const [activeTab, setActiveTab] = useState<string>('letter');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 container py-6 space-y-6 max-w-6xl">
        {/* Evaluator Showcase Bar: 4 Benchmark Personas & Time Skip */}
        <section aria-label="Demo Personas & Time Controls" className="space-y-3">
          <PersonaSelector />
          <TimeMachineSkip />
        </section>

        {caseData && (
          <section aria-label="Active Case Details" className="space-y-6">
            {/* 1. Ultra-clean Citizen Reassurance & Financial Entitlement Hero */}
            <SimpleHeroStatus />

            {/* 2. Clear 4-Step Citizen Journey Progress Tracker */}
            <CitizenJourneyStepper />

            {/* 3. The One Big Action Button */}
            <NextStepHero />

            {/* 4. Safety Protection Referral (For Sunil / Mule detection) */}
            <ReferralCard />

            {/* 5. Progressive Tabbed Deep Workspace (Zero Data Loss, Zero Cognitive Clutter) */}
            <div className="space-y-4 pt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                  <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-11 rounded-xl shadow-sm">
                    <TabsTrigger value="letter" className="gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Representation Letter ({letters.length})</span>
                    </TabsTrigger>

                    <TabsTrigger value="clock" className="gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                      <Clock className="h-3.5 w-3.5" />
                      <span>7-Day Bank Clock</span>
                    </TabsTrigger>

                    <TabsTrigger value="evidence" className="gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Evidence Papers</span>
                    </TabsTrigger>

                    <TabsTrigger value="trace" className="gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>AI Agent Trace</span>
                    </TabsTrigger>

                    <TabsTrigger value="audit" className="gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                      <History className="h-3.5 w-3.5" />
                      <span>Audit Trail</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Representation Letter */}
                <TabsContent value="letter" className="mt-4 space-y-4">
                  <LettersList />
                </TabsContent>

                {/* Tab 2: 7-Day Bank Clock */}
                <TabsContent value="clock" className="mt-4 space-y-4">
                  <StatutoryDeadlinesCard />
                </TabsContent>

                {/* Tab 3: Evidence Papers */}
                <TabsContent value="evidence" className="mt-4 space-y-4">
                  <DocumentsList />
                </TabsContent>

                {/* Tab 4: AI Agent Reasoning Mesh (For technical evaluators) */}
                <TabsContent value="trace" className="mt-4 space-y-4">
                  <AgentTraceLive />
                </TabsContent>

                {/* Tab 5: Case Audit History */}
                <TabsContent value="audit" className="mt-4 space-y-4">
                  <CaseTimeline />
                </TabsContent>
              </Tabs>
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

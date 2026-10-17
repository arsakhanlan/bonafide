import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PersonaSelector } from '@/components/demo/PersonaSelector';
import { TimeMachineSkip } from '@/components/demo/TimeMachineSkip';
import { SimpleHeroStatus } from '@/components/case/SimpleHeroStatus';
import { MoneyCard } from '@/components/case/MoneyCard';
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
import { FileCheck, Cpu, History } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function App() {
  const { caseData, activeModal, setModal, documents } = useCase();
  const [activeIntelTab, setActiveIntelTab] = useState<string>('trace');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-emerald-600 selection:text-white">
      <Header />

      <main className="flex-1 container px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-6xl">
        {/* Evaluator Showcase Bar: 4 Benchmark Personas & Time Skip */}
        <section aria-label="Demo Personas & Time Controls" className="space-y-3">
          <PersonaSelector />
          <TimeMachineSkip />
        </section>

        {caseData && (
          <section aria-label="Active Case Command Center" className="space-y-4 sm:space-y-6">
            {/* 1. Case Context & Legal Grounding Banner */}
            <SimpleHeroStatus />

            {/* 2. Statutory Balance Bifurcation (BNSS §106 Strict Formula) */}
            <MoneyCard />

            {/* 3. The 4-Step Citizen Roadmap */}
            <CitizenJourneyStepper />

            {/* 4. The Single Decisive Action Hero */}
            <NextStepHero />

            {/* 5. Safety Referral (Triggered on mule / lending accounts) */}
            <ReferralCard />

            {/* 6. Dual-Pane Command Center: Zero Data Hidden, Zero Visual Clutter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Primary Stage (7 cols / ~58%): Representation Letters & 7-Day Statutory Countdown */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <LettersList />
                <StatutoryDeadlinesCard />
              </div>

              {/* Intelligence Stage (5 cols / ~42%): AI Agent Trace & Verification Evidence */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden">
                  <Tabs value={activeIntelTab} onValueChange={setActiveIntelTab} className="w-full">
                    <div className="px-3 pt-3 pb-2 border-b border-border/60 bg-muted/30">
                      <TabsList className="w-full grid grid-cols-3 bg-secondary/80 p-0.5 h-9 rounded-lg">
                        <TabsTrigger
                          value="trace"
                          className="text-[11px] sm:text-xs font-semibold px-1 sm:px-2.5 py-1 justify-center rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-1 sm:gap-1.5"
                        >
                          <Cpu className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">Agent Mesh</span>
                        </TabsTrigger>

                        <TabsTrigger
                          value="evidence"
                          className="text-[11px] sm:text-xs font-semibold px-1 sm:px-2.5 py-1 justify-center rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-1 sm:gap-1.5"
                        >
                          <FileCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">Evidence ({documents.length})</span>
                        </TabsTrigger>

                        <TabsTrigger
                          value="audit"
                          className="text-[11px] sm:text-xs font-semibold px-1 sm:px-2.5 py-1 justify-center rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-1 sm:gap-1.5"
                        >
                          <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">Audit Log</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-3 sm:p-4 tab-animated-content">
                      <TabsContent value="trace" className="m-0 focus-visible:outline-none">
                        <AgentTraceLive embedded />
                      </TabsContent>
                      <TabsContent value="evidence" className="m-0 focus-visible:outline-none">
                        <DocumentsList embedded />
                      </TabsContent>
                      <TabsContent value="audit" className="m-0 focus-visible:outline-none">
                        <CaseTimeline embedded />
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
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

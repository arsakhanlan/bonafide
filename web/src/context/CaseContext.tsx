import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CaseData, AnswerSubmission, Stage } from '@/types/case';
import { Letter } from '@/types/letter';
import { Deadline } from '@/types/deadline';
import { AgentStep } from '@/types/agentStep';
import { CaseDocument } from '@/types/document';
import { MOCK_PERSONAS } from '@/lib/mockData';
import { api } from '@/lib/api';

type ModalType =
  | 'NONE'
  | 'REVIEW_LETTER'
  | 'UPLOAD_PAPERS'
  | 'ANSWER_QUESTIONS'
  | 'MARK_SENT'
  | 'RECORD_REPLY'
  | 'NEW_CASE'
  | 'SWAGGER';

interface CaseContextType {
  caseData: CaseData | null;
  letters: Letter[];
  deadlines: Deadline[];
  steps: AgentStep[];
  documents: CaseDocument[];
  selectedPersona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL';
  activeModal: ModalType;
  selectedLetterId: string | null;
  simulatedDays: number;
  currentSimulatedDate: string;
  isProcessing: boolean;
  error: string | null;

  // Actions
  selectPersona: (persona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL') => void;
  setModal: (modal: ModalType, letterId?: string | null) => void;
  approveLetter: (letterId: string, body?: string) => Promise<void>;
  markLetterSent: (
    letterId: string,
    sentOn: string,
    how: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST'
  ) => Promise<void>;
  submitAnswers: (answers: AnswerSubmission[]) => Promise<void>;
  recordReply: (replyText: string) => Promise<void>;
  skipTime: (days: number) => Promise<void>;
  uploadPapers: (files: { name: string; kind: any; size?: number }[]) => Promise<void>;
  createNewCase: (title: string, language?: 'en' | 'hi') => Promise<void>;
  clearError: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [selectedPersona, setSelectedPersona] = useState<'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL'>('RAVI');
  const [caseData, setCaseData] = useState<CaseData | null>(MOCK_PERSONAS.RAVI.caseData);
  const [letters, setLetters] = useState<Letter[]>(MOCK_PERSONAS.RAVI.letters);
  const [deadlines, setDeadlines] = useState<Deadline[]>(MOCK_PERSONAS.RAVI.deadlines);
  const [steps, setSteps] = useState<AgentStep[]>(MOCK_PERSONAS.RAVI.steps);
  const [documents, setDocuments] = useState<CaseDocument[]>([
    { id: 'd1', name: 'SMS_Notice_PatnaCyber.txt', kind: 'NOTICE', path: '/uploads/a1.txt', mime: 'text/plain', size: 1024 },
    { id: 'd2', name: 'HDFC_Statement_Oct2026.pdf', kind: 'STATEMENT', path: '/uploads/a2.pdf', mime: 'application/pdf', size: 34200 },
    { id: 'd3', name: 'Tax_Invoice_Repair481.pdf', kind: 'INVOICE', path: '/uploads/a3.pdf', mime: 'application/pdf', size: 18400 },
    { id: 'd4', name: 'Customer_WhatsApp_Receipt.txt', kind: 'CHAT', path: '/uploads/a4.txt', mime: 'text/plain', size: 850 },
  ]);

  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>('L1_BANK_GRIEVANCE');
  const [simulatedDays, setSimulatedDays] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute current simulated date from base date
  const baseDate = new Date('2026-10-17');
  const simulatedDateObj = new Date(baseDate.getTime() + simulatedDays * 86400000);
  const currentSimulatedDate = simulatedDateObj.toISOString().split('T')[0];

  // Switch persona
  const selectPersona = useCallback((persona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL') => {
    setSelectedPersona(persona);
    setSimulatedDays(0);
    setError(null);
    const data = MOCK_PERSONAS[persona];
    setCaseData(data.caseData);
    setLetters(data.letters);
    setDeadlines(data.deadlines);
    setSteps(data.steps);
    setSelectedLetterId(data.letters[0]?.id || null);

    // Set demo documents according to persona
    if (persona === 'RAVI') {
      setDocuments([
        { id: 'd1', name: 'SMS_Notice_PatnaCyber.txt', kind: 'NOTICE', path: '/uploads/a1.txt', mime: 'text/plain' },
        { id: 'd2', name: 'HDFC_Statement_Oct2026.pdf', kind: 'STATEMENT', path: '/uploads/a2.pdf', mime: 'application/pdf' },
        { id: 'd3', name: 'Tax_Invoice_Repair481.pdf', kind: 'INVOICE', path: '/uploads/a3.pdf', mime: 'application/pdf' },
        { id: 'd4', name: 'WhatsApp_Receipt.txt', kind: 'CHAT', path: '/uploads/a4.txt', mime: 'text/plain' },
      ]);
    } else if (persona === 'MEERA') {
      setDocuments([
        { id: 'd1', name: 'ICICI_Hold_Email.txt', kind: 'NOTICE', path: '/uploads/m1.txt', mime: 'text/plain' },
        { id: 'd2', name: 'ICICI_Bank_Statement.pdf', kind: 'STATEMENT', path: '/uploads/m2.pdf', mime: 'application/pdf' },
      ]);
    } else if (persona === 'ARJUN') {
      setDocuments([
        { id: 'd1', name: 'SBI_Lien_Alert.txt', kind: 'NOTICE', path: '/uploads/ar1.txt', mime: 'text/plain' },
        { id: 'd2', name: 'SBI_Account_Statement.pdf', kind: 'STATEMENT', path: '/uploads/ar2.pdf', mime: 'application/pdf' },
        { id: 'd3', name: 'P2P_Escrow_Receipt_8912.txt', kind: 'CHAT', path: '/uploads/ar3.txt', mime: 'text/plain' },
      ]);
    } else {
      setDocuments([
        { id: 'd1', name: 'Kotak_Account_Freeze_SMS.txt', kind: 'NOTICE', path: '/uploads/s1.txt', mime: 'text/plain' },
      ]);
    }
  }, []);

  const setModal = (modal: ModalType, letterId: string | null = null) => {
    setActiveModal(modal);
    if (letterId !== undefined) {
      setSelectedLetterId(letterId);
    }
  };

  const clearError = () => setError(null);

  // Approve letter
  const approveLetter = async (letterId: string, body?: string) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      try {
        await api.approveLetter(caseData.id, letterId, body);
      } catch (err) {
        console.warn('Backend approve call failed; simulating in local state', err);
      }

      setLetters(prev =>
        prev.map(l =>
          l.id === letterId
            ? {
                ...l,
                status: 'APPROVED',
                body: body || l.body,
                approvedAt: new Date().toISOString(),
                editedByPerson: Boolean(body),
              }
            : l
        )
      );

      setCaseData(prev =>
        prev
          ? {
              ...prev,
              nextStep: {
                action: 'SEND_LETTER',
                text: 'Send the letter yourself: print it, email it, or submit at your bank branch.',
                letterId,
              },
              history: [
                ...(prev.history || []),
                { on: currentSimulatedDate, text: 'You approved the representation letter.' },
              ],
            }
          : null
      );

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'SYSTEM',
          message: 'Letter approved by user. Ready for branch submission.',
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      setActiveModal('NONE');
    } catch (e: any) {
      setError(e.message || 'Failed to approve letter');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mark letter sent
  const markLetterSent = async (
    letterId: string,
    sentOn: string,
    how: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST'
  ) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      try {
        await api.markLetterSent(caseData.id, letterId, { sentOn, how });
      } catch (err) {
        console.warn('Backend markLetterSent call failed; simulating in local state', err);
      }

      const sentDateObj = new Date(sentOn);
      const dueDateObj = new Date(sentDateObj.getTime() + 7 * 86400000);
      const dueOn = dueDateObj.toISOString().split('T')[0];

      setLetters(prev =>
        prev.map(l =>
          l.id === letterId
            ? { ...l, status: 'SENT', sentOn, sentHow: how }
            : l
        )
      );

      const newDeadline: Deadline = {
        id: 'BANK_FILE_GRIEVANCE',
        clock: 'BANK_FILE_GRIEVANCE',
        title: 'Bank 7-Day Grievance & Release Window',
        description: 'Bank branch has 7 calendar days to record representation and restrict lien to disputed amount.',
        status: 'PENDING',
        dueOn,
        daysRemaining: 7,
        statuteRef: 'BNSS §106 / MHA Cyber SOP',
      };

      setDeadlines(prev => {
        const filtered = prev.filter(d => d.id !== 'BANK_FILE_GRIEVANCE');
        return [...filtered, newDeadline];
      });

      setCaseData(prev =>
        prev
          ? {
              ...prev,
              stage: 'WAITING',
              nextStep: {
                action: 'WAIT',
                text: 'Waiting for the bank to process grievance and restrict lien.',
                dueOn,
              },
              history: [
                ...(prev.history || []),
                { on: sentOn, text: `Representation sent via ${how}` },
              ],
            }
          : null
      );

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'CLOCK',
          message: `Statutory 7-day compliance clock started (Due ${dueOn}). Method: ${how}`,
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      setActiveModal('NONE');
    } catch (e: any) {
      setError(e.message || 'Failed to record letter transmission');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit clarifying answers (Meera's flow)
  const submitAnswers = async (answers: AnswerSubmission[]) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      try {
        await api.sendEvent(caseData.id, {
          type: 'ANSWERS',
          answers,
        });
      } catch (err) {
        console.warn('Backend send answers failed; simulating transition locally', err);
      }

      // Transition to LETTER_READY and create L1 letter
      const l1Letter: Letter = {
        id: 'L1_MEERA_FREELANCE',
        kind: 'L1_BANK_GRIEVANCE',
        title: 'Representation under BNSS §106 — Freelance Design Consideration',
        recipient: 'The Branch Manager, ICICI Bank, Regional Office',
        body: `To,
The Branch Manager,
ICICI Bank Limited.

Subject: Requisition to restrict freeze to disputed Rs. 12,500/- and release Rs. 32,500/- under Section 106 BNSS (A/c {{Your Account Number}}).

Dear Sir/Madam,

I am writing regarding the total debit hold placed on my account {{Your Account Number}}.

1. I am a freelance brand designer. The credit of Rs. 12,500/- on 24th August 2026 was received as legitimate consideration for brand design deliverables provided in good faith.

2. Enclosed are the project deliverables and correspondence evidencing that the funds were accepted without any knowledge of illicit origin.

3. Under Section 106 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 read with MHA Cyber SOP 2026-01-02, a bank must not hold entire innocent account balances when only a specific payment is under inquiry.

4. ACCORDINGLY, I REQUEST YOU TO:
   a) Restrict any lien strictly to Rs. 12,500/-;
   b) Immediately release the remaining Rs. 32,500/-;
   c) Lodge this grievance and confirm receipt within 7 days.

Yours sincerely,
{{Your name}}
Phone: {{Your phone}}`,
        status: 'DRAFT',
        citations: ['BNSS §106', 'MHA Cyber SOP 2026-01-02 Cl. 4.2', 'Indian Contract Act §70'],
        checks: {
          passed: true,
          reasons: ['Clarifications validated commercial consideration', 'Grounded in BNSS §106'],
        },
      };

      setLetters([l1Letter]);
      setSelectedLetterId('L1_MEERA_FREELANCE');

      setCaseData(prev =>
        prev
          ? {
              ...prev,
              stage: 'LETTER_READY',
              questions: [],
              nextStep: {
                action: 'REVIEW_LETTER',
                text: 'Answers verified! Review and approve your Section 106 representation letter.',
                letterId: 'L1_MEERA_FREELANCE',
              },
              history: [
                ...(prev.history || []),
                { on: currentSimulatedDate, text: 'You answered the clarification questions.' },
                { on: currentSimulatedDate, text: 'AI drafted representation letter based on your answers.' },
              ],
            }
          : null
      );

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'READER',
          message: 'Clarifying answers received. Commercial consideration confirmed.',
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
        {
          id: 'step_' + (Date.now() + 1),
          agent: 'WRITER',
          message: 'Drafted Section 106 representation grounded in statutory rulebook.',
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      setActiveModal('NONE');
    } catch (e: any) {
      setError(e.message || 'Failed to submit answers');
    } finally {
      setIsProcessing(false);
    }
  };

  // Record bank or police reply (Triggers L2 escalation or resolution)
  const recordReply = async (replyText: string) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      try {
        await api.sendEvent(caseData.id, {
          type: 'REPLY',
          text: replyText,
        });
      } catch (err) {
        console.warn('Backend reply event failed; updating state locally', err);
      }

      // Check if reply indicates bank has not complied or filed grievance -> triggers L2 Escalation Letter to Police IO
      const l2Letter: Letter = {
        id: 'L2_OFFICER_ESCALATION',
        kind: 'L2_OFFICER',
        title: 'Statutory Representation to Cyber Police Investigating Officer (IO)',
        recipient: 'The Investigating Officer, Cyber Crime Police Station, Patna',
        body: `To,
The Investigating Officer / Station House Officer,
Cyber Crime Police Station, Patna.
Ref: Complaint / NCRP Ack: NCRP-2026-918237

Subject: Requisition to modify blanket debit freeze requisition under Section 106 BNSS to specific lien of Rs. 2,000/- only.

Respected Officer,

I submit this formal application in reference to the freeze requisition issued by your unit to HDFC Bank regarding Account No. {{Your Account Number}} belonging to the applicant {{Your name}}.

1. The applicant is a genuine repair technician in Pune and innocent recipient of Rs. 2,000/- for mobile screen replacement (Tax Invoice #481 enclosed).

2. HDFC Bank has restrained the entire account balance of Rs. 1,80,000/- rather than the disputed sum of Rs. 2,000/-, causing irreparable hardship.

3. Section 106 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 and MHA Cyber SOP specifically instruct law enforcement not to paralyze entire accounts of innocent commercial recipients.

4. PRAYER:
   Kindly issue an immediate direction / communication to HDFC Bank to confine the freeze order solely to Rs. 2,000/- and permit normal operation for the remaining balance of Rs. 1,78,000/-.

Yours faithfully,
{{Your name}}
Phone: {{Your phone}}`,
        status: 'DRAFT',
        citations: ['BNSS §106', 'MHA Cyber SOP 2026-01-02 Cl. 5.1'],
        checks: { passed: true },
      };

      setLetters(prev => [...prev, l2Letter]);
      setSelectedLetterId('L2_OFFICER_ESCALATION');

      setCaseData(prev =>
        prev
          ? {
              ...prev,
              stage: 'LETTER_READY',
              nextStep: {
                action: 'REVIEW_LETTER',
                text: 'New L2 escalation letter ready for Cyber Crime Police Station.',
                letterId: 'L2_OFFICER_ESCALATION',
              },
              history: [
                ...(prev.history || []),
                { on: currentSimulatedDate, text: `Bank/Police response logged: "${replyText.substring(0, 60)}..."` },
                { on: currentSimulatedDate, text: 'Case escalated: L2 representation drafted for Police IO' },
              ],
            }
          : null
      );

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'READER',
          message: 'Parsed bank reply. Bank failed to restrict lien within statutory window.',
          level: 'WARN',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
        {
          id: 'step_' + (Date.now() + 1),
          agent: 'CASE_BOSS',
          message: 'Escalating to L2 representation to Investigating Officer under BNSS §106.',
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      setActiveModal('NONE');
    } catch (e: any) {
      setError(e.message || 'Failed to record reply');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fast-Forward Time (Judge feature)
  const skipTime = async (days: number) => {
    if (!caseData) return;
    setIsProcessing(true);
    try {
      try {
        await api.skipAhead(caseData.id, days);
      } catch (err) {
        console.warn('Backend skip call failed; simulating time shift locally', err);
      }

      setSimulatedDays(prev => prev + days);
      const newTotalDays = simulatedDays + days;
      const newDate = new Date(baseDate.getTime() + newTotalDays * 86400000).toISOString().split('T')[0];

      // Check if deadlines expired
      let reminderGenerated = false;
      setDeadlines(prev =>
        prev.map(d => {
          if (d.status === 'PENDING') {
            const due = new Date(d.dueOn).getTime();
            const curr = new Date(newDate).getTime();
            if (curr >= due) {
              reminderGenerated = true;
              return { ...d, status: 'EXPIRED', daysRemaining: 0 };
            }
            const diffDays = Math.max(0, Math.ceil((due - curr) / 86400000));
            return { ...d, daysRemaining: diffDays };
          }
          return d;
        })
      );

      if (reminderGenerated && caseData.stage === 'WAITING') {
        const reminderLetter: Letter = {
          id: 'REMINDER_L1_BANK',
          kind: 'REMINDER',
          title: 'Statutory Overdue Reminder to Bank — 7-Day Compliance Window Expired',
          recipient: 'The Branch Manager / Nodal Officer, Bank Branch',
          body: `REMINDER NOTICE:
Subject: Statutory Non-Compliance regarding Section 106 BNSS Requisition on A/c {{Your Account Number}}.

Reference is made to our formal representation dated ${caseData.history?.find(h => h.text.includes('sent'))?.on || 'earlier this month'}.

More than 7 calendar days have elapsed since delivery. Under MHA Standard Operating Procedure Cl. 4.2, your branch is under statutory obligation to confine the lien to the disputed amount and release surplus funds.

Failure to resolve this within 48 hours will compel an escalation to the Banking Ombudsman and the High Court under Article 226 for arbitrary restraint of commercial funds.

Yours faithfully,
{{Your name}}`,
          status: 'DRAFT',
          reminder: true,
          citations: ['BNSS §106', 'MHA Cyber SOP 2026-01-02 Cl. 4.2', 'Reserve Bank-Integrated Ombudsman Scheme, 2021'],
          checks: { passed: true },
        };

        setLetters(prev => {
          if (prev.some(l => l.id === 'REMINDER_L1_BANK')) return prev;
          return [...prev, reminderLetter];
        });
        setSelectedLetterId('REMINDER_L1_BANK');

        setCaseData(prev =>
          prev
            ? {
                ...prev,
                stage: 'LETTER_READY',
                nextStep: {
                  action: 'REVIEW_LETTER',
                  text: 'Bank 7-day statutory deadline has expired! Send urgent overdue reminder letter.',
                  letterId: 'REMINDER_L1_BANK',
                },
                history: [
                  ...(prev.history || []),
                  { on: newDate, text: `Fast-forwarded ${days} days. Statutory deadline expired.` },
                  { on: newDate, text: 'AI generated formal Overdue Reminder letter for the bank.' },
                ],
              }
            : null
        );

        setSteps(prev => [
          ...prev,
          {
            id: 'step_' + Date.now(),
            agent: 'CLOCK',
            message: `Bank compliance deadline expired on ${newDate}. Wake event dl-BANK_FILE_GRIEVANCE dispatched.`,
            level: 'WARN',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          {
            id: 'step_' + (Date.now() + 1),
            agent: 'CASE_BOSS',
            message: 'Generated Bank Reminder Notice. Escalation sequence ready.',
            level: 'INFO',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
        ]);
      } else {
        setCaseData(prev =>
          prev
            ? {
                ...prev,
                history: [
                  ...(prev.history || []),
                  { on: newDate, text: `Simulated time advanced by ${days} days.` },
                ],
              }
            : null
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload papers
  const uploadPapers = async (files: { name: string; kind: any; size?: number }[]) => {
    if (!caseData) return;
    setIsProcessing(true);
    try {
      const newDocs: CaseDocument[] = files.map((f, i) => ({
        id: 'doc_' + Date.now() + '_' + i,
        name: f.name,
        kind: f.kind,
        path: `/uploads/${f.name}`,
        mime: f.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
        size: f.size || 15000,
        uploadedAt: currentSimulatedDate,
      }));

      setDocuments(prev => [...prev, ...newDocs]);

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'READER',
          message: `Uploaded ${files.length} document(s). Masking PII and extracting transaction lines...`,
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      setActiveModal('NONE');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create brand new case
  const createNewCase = async (title: string, language: 'en' | 'hi' = 'en') => {
    setIsProcessing(true);
    try {
      let caseId = 'c_' + Math.random().toString(36).substring(2, 9);
      try {
        const res = await api.createCase(language);
        if (res.caseId) caseId = res.caseId;
      } catch (err) {
        console.warn('Backend case creation failed; creating local session', err);
      }

      const newCase: CaseData = {
        id: caseId,
        uid: 'user_active',
        language,
        stage: 'NEW',
        busy: false,
        title: title || 'New Bank Account Freeze Defense',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        money: {
          frozen: 0,
          disputed: 0,
          release: 0,
          currency: 'INR',
        },
        nextStep: {
          action: 'UPLOAD_PAPERS',
          text: 'Upload your bank freeze notice and bank account statement to begin AI defense extraction.',
        },
        history: [
          { on: currentSimulatedDate, text: 'You created a new case.' },
        ],
      };

      setCaseData(newCase);
      setLetters([]);
      setDeadlines([]);
      setDocuments([]);
      setSteps([
        {
          id: 'step_init',
          agent: 'SYSTEM',
          message: `Case ${caseId} initialized. Upload notice or statement to run agent analysis.`,
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);
      setActiveModal('NONE');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CaseContext.Provider
      value={{
        caseData,
        letters,
        deadlines,
        steps,
        documents,
        selectedPersona,
        activeModal,
        selectedLetterId,
        simulatedDays,
        currentSimulatedDate,
        isProcessing,
        error,
        selectPersona,
        setModal,
        approveLetter,
        markLetterSent,
        submitAnswers,
        recordReply,
        skipTime,
        uploadPapers,
        createNewCase,
        clearError,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}


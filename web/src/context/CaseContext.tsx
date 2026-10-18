import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import * as liveMap from '@/lib/liveMap';
import { createLandedGate } from '@/lib/bootGate';
import { isReleaseReply } from '@/lib/demoFlow';
import { CaseData, AnswerSubmission } from '@/types/case';
import { Letter } from '@/types/letter';
import { Deadline } from '@/types/deadline';
import { AgentStep } from '@/types/agentStep';
import { CaseDocument } from '@/types/document';
import { MOCK_PERSONAS } from '@/lib/mockData';
import { api } from '@/lib/api';
import { IS_MOCK, isDemoCase } from '@/lib/mode';
import { todayInIndia } from '@/lib/utils';

type ModalType =
  | 'NONE'
  | 'REVIEW_LETTER'
  | 'UPLOAD_PAPERS'
  | 'ANSWER_QUESTIONS'
  | 'MARK_SENT'
  | 'RECORD_REPLY'
  | 'NEW_CASE'
  | 'SWAGGER'
  | 'GUIDED_TOUR';

export interface UploadItem {
  id: string;
  name: string;
  kind: string;
  mime: string;
  file?: File;
}

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
  loading: boolean;
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
  uploadPapers: (files: Array<{ name: string; kind: string; mime: string; file?: File }>) => Promise<void>;
  createNewCase: (title: string, language?: 'en' | 'hi') => Promise<void>;
  deleteCase: () => Promise<void>;
  resetDemo: () => void;
  clearError: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL'>('RAVI');
  // Both modes start at the home screen; mock mode opens the demo hub and only
  // creates a case when the visitor starts the walkthrough or picks a scenario.
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);

  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [simulatedDays, setSimulatedDays] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!IS_MOCK);
  const bootedRef = useRef(false);

  // The date the app displays. A demo case lives on a pretend date (case.demo.today);
  // the mock app advances a local counter; a real case shows the real date.
  const baseDate = new Date('2026-10-17');
  const demoToday = caseData?.demo?.today;
  const currentSimulatedDate = demoToday
    ? demoToday
    : IS_MOCK
    ? new Date(baseDate.getTime() + simulatedDays * 86400000).toISOString().split('T')[0]
    : todayInIndia();

  const unsubRef = useRef<null | (() => void)>(null);

  /**
   * Live sync: the server is the source of truth for a backend case.
   * onReady fires once when all five initial snapshots have landed (or errored),
   * so the dashboard never renders half-empty while Firestore is still answering.
   */
  const subscribeLive = useCallback((caseId: string, onReady?: () => void) => {
    unsubRef.current?.();
    const unsubs: Array<() => void> = [];
    const gate = createLandedGate(5, onReady);
    const caseLanded = gate.settle();
    const stepsLanded = gate.settle();
    const lettersLanded = gate.settle();
    const deadlinesLanded = gate.settle();
    const documentsLanded = gate.settle();

    unsubs.push(onSnapshot(doc(firestore, 'cases', caseId), (snap: any) => {
      if (snap.exists()) setCaseData(liveMap.mapCase(snap.id, snap.data() || {}));
      caseLanded();
    }, caseLanded));
    unsubs.push(onSnapshot(collection(firestore, `cases/${caseId}/steps`), (snap: any) => {
      setSteps(snap.docs.map((d: any) => liveMap.mapStep(d.id, d.data() || {})));
      stepsLanded();
    }, stepsLanded));
    unsubs.push(onSnapshot(collection(firestore, `cases/${caseId}/letters`), (snap: any) => {
      const list = snap.docs.map((d: any) => liveMap.mapLetter(d.id, d.data() || {}));
      setLetters(list);
      setSelectedLetterId((prev) => prev ?? list[0]?.id ?? null);
      lettersLanded();
    }, lettersLanded));
    unsubs.push(onSnapshot(collection(firestore, `cases/${caseId}/deadlines`), (snap: any) => {
      setDeadlines(snap.docs.map((d: any) => liveMap.mapDeadline(d.id, d.data() || {})));
      deadlinesLanded();
    }, deadlinesLanded));
    unsubs.push(onSnapshot(collection(firestore, `cases/${caseId}/documents`), (snap: any) => {
      setDocuments(snap.docs.map((d: any) => liveMap.mapDocument(d.id, d.data() || {})));
      documentsLanded();
    }, documentsLanded));
    unsubRef.current = () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => () => unsubRef.current?.(), []);

  // Real mode: once signed in, pick up the person's most recent case (if any).
  useEffect(() => {
    if (IS_MOCK || authLoading || bootedRef.current || !user) return;
    bootedRef.current = true;
    // Covers a retry after a failed sign-in, when loading was already released.
    setLoading(true);
    let cancelled = false;

    const finish = () => {
      if (!cancelled) setLoading(false);
    };

    (async () => {
      try {
        const q = query(collection(firestore, 'cases'), where('uid', '==', user.uid));
        const snap = await getDocs(q);
        if (cancelled) return;
        const newest = snap.docs
          .map((d: any) => ({ id: d.id, createdAt: String(d.data()?.createdAt ?? '') }))
          .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt))[0];
        if (newest) {
          // Hold the splash until the first case + subcollection snapshots are in,
          // otherwise the start screen flashes before the dashboard.
          subscribeLive(newest.id, finish);
        } else {
          finish();
        }
      } catch (e: any) {
        if (!cancelled) setError('Could not load your cases. ' + (e.message || ''));
        finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, subscribeLive]);

  // Auth settled but nobody is signed in (Firebase unreachable): stop waiting.
  useEffect(() => {
    if (!IS_MOCK && !authLoading && !user) setLoading(false);
  }, [authLoading, user]);

  const resetToEmpty = useCallback(() => {
    unsubRef.current?.();
    setCaseData(null);
    setLetters([]);
    setDeadlines([]);
    setSteps([]);
    setDocuments([]);
    setSelectedLetterId(null);
    setSimulatedDays(0);
    setSelectedPersona('RAVI');
  }, []);

  const setModal = (modal: ModalType, letterId: string | null = null) => {
    setActiveModal(modal);
    if (letterId !== undefined) {
      setSelectedLetterId(letterId);
    }
  };

  const clearError = () => setError(null);

  /** Demo only: clear the walkthrough and return to the hub. */
  const resetDemo = useCallback(() => {
    if (!IS_MOCK) return;
    resetToEmpty();
    setActiveModal('NONE');
  }, [resetToEmpty]);

  // ---- Mock-mode local simulations (no backend) -------------------------------

  const applyMockPersona = (persona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL') => {
    const data = MOCK_PERSONAS[persona];
    setCaseData(data.caseData);
    setLetters(data.letters);
    setDeadlines(data.deadlines);
    setSteps(data.steps);
    setSelectedLetterId(data.letters[0]?.id || null);
    setDocuments(MOCK_DOCUMENTS);
  };

  const selectPersona = useCallback(
    async (persona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL') => {
      setSelectedPersona(persona);
      setSimulatedDays(0);
      setError(null);

      if (IS_MOCK) {
        applyMockPersona(persona);
        return;
      }

      setIsProcessing(true);
      try {
        const res = await api.createDemoCase(persona);
        unsubRef.current?.();
        setLetters([]);
        setDeadlines([]);
        setDocuments([]);
        setSteps([]);
        setCaseData({
          id: res.caseId, uid: user?.uid ?? '', language: 'en', stage: 'NEW', busy: true,
          title: 'Starting your case…', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          demo: { persona, today: undefined }, history: [],
        });
        subscribeLive(res.caseId);
      } catch (e: any) {
        setError(e.message || 'Could not create the demo case');
      } finally {
        setIsProcessing(false);
      }
    },
    [subscribeLive, user]
  );

  // ---- Approve letter -----------------------------------------------------------

  const approveLetter = async (letterId: string, body?: string) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        await api.approveLetter(caseData.id, letterId, body);
        // Live sync updates the letter status and next step.
        setActiveModal('NONE');
        return;
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

  // ---- Mark letter sent -----------------------------------------------------------

  const markLetterSent = async (
    letterId: string,
    sentOn: string,
    how: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST'
  ) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        await api.markLetterSent(caseData.id, letterId, { sentOn, how });
        // Live sync updates the letter, the clocks and the stage.
        setActiveModal('NONE');
        return;
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
        title: 'Bank Grievance Lodgement & Lien Restriction',
        description: 'Under MHA SOP, the bank has 7 calendar days from receipt of representation to record the grievance and release undisputed surplus funds.',
        status: 'PENDING',
        dueOn,
        daysRemaining: 7,
        statuteRef: 'MHA SOP Cl. 4.2 & BNSS §106',
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

  // ---- Submit clarifying answers ---------------------------------------------------

  const submitAnswers = async (answers: AnswerSubmission[]) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        await api.sendEvent(caseData.id, { type: 'ANSWERS', answers });
        setActiveModal('NONE');
        return;
      }

      // Mock: create the letter locally (Meera's flow).
      const l1Letter: Letter = {
        id: 'L1_MEERA_FREELANCE',
        kind: 'L1_BRANCH',
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

  // ---- Record bank or police reply ---------------------------------------------------

  const recordReply = async (replyText: string) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        await api.sendEvent(caseData.id, { type: 'REPLY', text: replyText });
        // Live sync: the Case boss writes the milestone, clocks and next letter.
        setActiveModal('NONE');
        return;
      }

      // A release reply ends the journey; anything else escalates.
      if (isReleaseReply(replyText) && caseData.stage !== 'RESOLVED') {
        setDeadlines(prev =>
          prev.map(d => (d.status === 'PENDING' ? { ...d, status: 'MET', daysRemaining: 0 } : d))
        );
        setCaseData(prev =>
          prev
            ? {
                ...prev,
                stage: 'RESOLVED',
                busy: false,
                nextStep: {
                  action: 'NONE',
                  text: 'The bank released ₹1,78,000 and restricted the lien to the ₹2,000 under investigation.',
                },
                history: [
                  ...(prev.history || []),
                  { on: currentSimulatedDate, text: 'Bank reply logged and checked against the statutory clock.' },
                  { on: currentSimulatedDate, text: 'Bank released ₹1,78,000; case resolved.' },
                ],
              }
            : null
        );
        setSteps(prev => [
          ...prev,
          {
            id: 'step_' + Date.now(),
            agent: 'READER',
            message: 'Bank confirmed the lien is restricted to ₹2,000; ₹1,78,000 released.',
            level: 'INFO',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          {
            id: 'step_' + (Date.now() + 1),
            agent: 'CASE_BOSS',
            message: 'Surplus balance restored. Case resolved — no further letters needed.',
            level: 'INFO',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
        ]);
        setActiveModal('NONE');
        return;
      }

      // Mock: escalate locally to an L2 letter.
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

  // ---- Fast-forward time (demo cases only) ---------------------------------------------------

  const skipTime = async (days: number) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        if (!isDemoCase(caseData.demo)) {
          setError('Time skip works only on demo cases.');
          return;
        }
        await api.skipAhead(caseData.id, days);
        // Live sync: demo.today advances and any crossed deadlines wake the agents.
        return;
      }

      setSimulatedDays(prev => prev + days);
      const newTotalDays = simulatedDays + days;
      const newDate = new Date(baseDate.getTime() + newTotalDays * 86400000).toISOString().split('T')[0];

      // Mock: expire pending clocks and draft a reminder.
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
    } catch (e: any) {
      setError(e.message || 'Failed to skip time');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Upload papers -----------------------------------------------------------

  const uploadPapers = async (files: Array<{ name: string; kind: string; mime: string; file?: File }>) => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        if (!user) throw new Error('Not signed in.');
        const refs: Array<{ path: string; kind: string; mime: string }> = [];
        for (const f of files) {
          if (!f.file) continue;
          const path = `uploads/${user.uid}/${caseData.id}/${f.name}`;
          // Explicit metadata: some browsers leave File.type empty, which the storage rules reject.
          await uploadBytes(storageRef(storage, path), f.file, { contentType: f.mime || f.file.type });
          refs.push({ path, kind: f.kind, mime: f.file.type || f.mime });
        }
        if (refs.length === 0) throw new Error('Pick at least one file to upload.');
        await api.sendEvent(caseData.id, { type: 'UPLOAD', files: refs });
        // Live sync: the documents list and agent steps update as the workflow runs.
        setActiveModal('NONE');
        return;
      }

      const shouldAdvance =
        caseData.stage === 'NEW' || caseData.nextStep?.action === 'UPLOAD_PAPERS';

      const newDocs: CaseDocument[] = files.map((f, i) => ({
        id: 'doc_' + Date.now() + '_' + i,
        name: f.name,
        kind: f.kind as CaseDocument['kind'],
        path: `/uploads/${f.name}`,
        mime: f.mime,
        size: f.file?.size ?? 15000,
        uploadedAt: currentSimulatedDate,
      }));

      setDocuments(prev => [...prev, ...newDocs]);
      setCaseData(prev =>
        prev
          ? {
              ...prev,
              busy: shouldAdvance,
              history: [
                ...(prev.history || []),
                { on: currentSimulatedDate, text: `Added ${newDocs.length} paper(s): ${newDocs.map(d => d.name).join(', ')}.` },
              ],
            }
          : prev
      );

      setSteps(prev => [
        ...prev,
        {
          id: 'step_' + Date.now(),
          agent: 'READER',
          message: `Reading ${files.length} paper(s). Masking PII and extracting transaction lines...`,
          level: 'INFO',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        },
      ]);

      if (shouldAdvance) {
        // The guided walkthrough waits for the agents, then lands on the finished analysis.
        await new Promise(resolve => setTimeout(resolve, 1600));
        const ravi = MOCK_PERSONAS.RAVI;
        const letter: Letter = { ...ravi.letters[0], status: 'DRAFT' };
        setLetters([letter]);
        setSelectedLetterId(letter.id);
        setCaseData(prev =>
          prev
            ? {
                ...prev,
                busy: false,
                stage: 'LETTER_READY',
                facts: ravi.caseData.facts,
                money: ravi.caseData.money,
                eligibility: ravi.caseData.eligibility,
                evidence: ravi.caseData.evidence,
                nextStep: {
                  action: 'REVIEW_LETTER',
                  text: 'Your papers are read. Review and approve your BNSS §106 representation letter.',
                  letterId: letter.id,
                },
                history: [...(prev.history || []), ...(ravi.caseData.history?.slice(1) || [])],
              }
            : prev
        );
        setSteps(prev => [...prev, ...ravi.steps.slice(1)]);
      }

      setActiveModal('NONE');
    } catch (e: any) {
      const refused = e?.code === 'storage/unauthorized';
      setError(
        refused
          ? 'Firebase Storage refused the upload. The storage rules may not be deployed yet — run: firebase deploy --only storage'
          : e.message || 'Failed to upload papers'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Create brand new case -----------------------------------------------------------

  const createNewCase = async (title: string, language: 'en' | 'hi' = 'en') => {
    setIsProcessing(true);
    setError(null);
    try {
      if (IS_MOCK) {
        const newCase: CaseData = {
          id: 'c_' + Math.random().toString(36).substring(2, 9),
          uid: 'user_active',
          language,
          stage: 'NEW',
          busy: false,
          title: title || 'New Bank Account Freeze Defense',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nextStep: {
            action: 'UPLOAD_PAPERS',
            text: 'Upload your bank freeze notice and bank account statement to begin AI defense extraction.',
          },
          history: [{ on: currentSimulatedDate, text: 'You created a new case.' }],
        };

        setCaseData(newCase);
        setLetters([]);
        setDeadlines([]);
        setDocuments([]);
        setSteps([
          {
            id: 'step_init',
            agent: 'SYSTEM',
            message: `Case ${newCase.id} initialized. Upload notice or statement to run agent analysis.`,
            level: 'INFO',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
        ]);
        setActiveModal('NONE');
        return;
      }

      const res = await api.createCase(language);
      unsubRef.current?.();
      setLetters([]);
      setDeadlines([]);
      setDocuments([]);
      setSteps([]);
      setCaseData({
        id: res.caseId, uid: user?.uid ?? '', language, stage: 'NEW', busy: false,
        title: title || 'New case',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        history: [],
      });
      subscribeLive(res.caseId);
      setActiveModal('NONE');
    } catch (e: any) {
      setError(e.message || 'Could not create the case');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Delete the case -----------------------------------------------------------

  const deleteCase = async () => {
    if (!caseData) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!IS_MOCK) {
        await api.deleteCase(caseData.id);
      }
      resetToEmpty();
    } catch (e: any) {
      setError(e.message || 'Could not delete the case');
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
        loading,
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
        deleteCase,
        resetDemo,
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

const MOCK_DOCUMENTS: CaseDocument[] = [
  { id: 'd1', name: 'SMS_Notice_PatnaCyber.txt', kind: 'NOTICE', path: '/uploads/a1.txt', mime: 'text/plain', size: 1024 },
  { id: 'd2', name: 'HDFC_Statement_Oct2026.pdf', kind: 'STATEMENT', path: '/uploads/a2.pdf', mime: 'application/pdf', size: 34200 },
  { id: 'd3', name: 'Tax_Invoice_Repair481.pdf', kind: 'INVOICE', path: '/uploads/a3.pdf', mime: 'application/pdf', size: 18400 },
  { id: 'd4', name: 'Customer_WhatsApp_Receipt.txt', kind: 'CHAT', path: '/uploads/a4.txt', mime: 'text/plain', size: 850 },
];

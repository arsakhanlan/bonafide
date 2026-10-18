export type Stage =
  | 'NEW'
  | 'NEEDS_ANSWERS'
  | 'LETTER_READY'
  | 'WAITING'
  | 'PARTLY_RELEASED'
  | 'RESOLVED'
  | 'REFERRED'
  | 'NEEDS_LAWYER'
  | 'FAILED';

export type NextStepAction =
  | 'UPLOAD_PAPERS'
  | 'ANSWER_QUESTIONS'
  | 'REVIEW_LETTER'
  | 'SEND_LETTER'
  | 'WAIT'
  | 'UPLOAD_REPLY'
  | 'SEE_LEGAL_AID'
  | 'NONE';

export interface MoneyBreakdown {
  frozen: number;
  disputed: number;
  release: number;
  currency?: string;
  bankName?: string;
  accountMasked?: string;
  problems?: Array<{ code: string; text: string; ruleRef?: string }>;
}

/** Facts the Reader extracted from the papers (backend contract). */
export interface CaseFacts {
  bank?: string;
  branch?: string;
  accountLast4?: string;
  freezeType?: 'WHOLE_ACCOUNT' | 'AMOUNT_HOLD' | 'DIGITAL_BLOCK' | 'UNKNOWN';
  freezeOn?: string;
  complaintNo?: string;
  policeStation?: string;
  officer?: string;
  state?: string;
  disputedPayments?: Array<{ utr?: string; on?: string; amount?: number; from?: string }>;
  [key: string]: unknown;
}

export interface NextStep {
  action: NextStepAction;
  text: string;
  letterId?: string;
  dueOn?: string;
}

export interface QuestionItem {
  id: string;
  text: string;
  why?: string;
  placeholder?: string;
  options?: string[];
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface HistoryItem {
  on: string;
  text: string;
}

export interface LegalReferral {
  service: string;
  reason: string;
  helpline: string;
  website: string;
  office: string;
  freeLegalAidAct: string;
  guidanceNotes: string[];
  title?: string;
  link?: string;
  to?: string;
  text?: string;
}

export interface CaseData {
  id: string;
  uid: string;
  language: 'en' | 'hi';
  stage: Stage;
  busy: boolean;
  title: string;
  createdAt: string;
  updatedAt: string;
  facts?: Record<string, any>;
  questions?: QuestionItem[];
  eligibility?: {
    eligible: boolean;
    reasons?: string[];
  };
  money?: MoneyBreakdown;
  evidence?: Array<{
    kind: string;
    description: string;
    file?: string;
  }>;
  plan?: Array<{
    step: number;
    title: string;
    description: string;
    status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  }>;
  nextStep?: NextStep;
  referral?: LegalReferral;
  history?: HistoryItem[];
  demo?: {
    persona?: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL';
    today?: string;
  };
  personNote?: string;
  answersAsked?: boolean;
}


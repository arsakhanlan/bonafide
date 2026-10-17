export type LetterStatus = 'DRAFT' | 'APPROVED' | 'SENT';

export interface Letter {
  id: string;
  kind: 'L1_BANK_GRIEVANCE' | 'L2_OFFICER' | 'REMINDER' | string;
  title: string;
  recipient?: string;
  body: string;
  status: LetterStatus;
  citations?: string[];
  checks?: {
    passed: boolean;
    reasons?: string[];
  };
  reminder?: boolean;
  approvedAt?: string;
  sentOn?: string;
  sentHow?: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST';
  editedByPerson?: boolean;
}


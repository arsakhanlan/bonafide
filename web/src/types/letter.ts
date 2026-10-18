export type LetterStatus = 'DRAFT' | 'APPROVED' | 'SENT';

/** Backend letter kinds (LetterKind.java). */
export type LetterKind =
  | 'L1_BRANCH'
  | 'L2_OFFICER'
  | 'L3_REVIEW'
  | 'L3_DISTRICT'
  | 'L4_BACKSTOP'
  | 'L5_LAWYER_NOTES'
  | 'REMINDER'
  | string;

export interface Letter {
  id: string;
  kind: LetterKind;
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
  createdAt?: string;
  approvedAt?: string;
  sentOn?: string;
  sentHow?: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST';
  editedByPerson?: boolean;
}


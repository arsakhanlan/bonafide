export type DocumentKind =
  | 'NOTICE'
  | 'STATEMENT'
  | 'INVOICE'
  | 'CHAT'
  | 'ID'
  | 'OTHER';

export interface CaseDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  path: string;
  mime: string;
  size?: number;
  uploadedAt?: string;
  masked?: boolean;
  /** One-line summary the Reader extracted from this paper (real cases). */
  summary?: string;
  readOk?: boolean;
}


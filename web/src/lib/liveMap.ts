import { CaseData, QuestionItem } from '@/types/case';
import { Letter } from '@/types/letter';
import { Deadline, DeadlineStatus } from '@/types/deadline';
import { AgentStep } from '@/types/agentStep';
import { CaseDocument } from '@/types/document';

/** Maps the server contract shapes (docs/CONTRACT.md) to the app's state types. */

function ts(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as any).toDate === 'function') {
    return (v as any).toDate().toISOString();
  }
  return String(v);
}

export function mapCase(id: string, c: Record<string, any>): CaseData {
  return {
    id,
    uid: c.uid ?? '',
    language: c.language ?? 'en',
    stage: c.stage ?? 'NEW',
    busy: Boolean(c.busy),
    title: c.title ?? '',
    createdAt: ts(c.createdAt),
    updatedAt: ts(c.updatedAt),
    facts: c.facts ?? {},
    questions: (c.questions ?? []).map((q: Record<string, any>) =>
      ({ id: q.id ?? '', text: q.text ?? '', options: q.choices ?? [] } as QuestionItem)),
    eligibility: c.eligibility
      ? { eligible: c.eligibility.status === 'GENUINE', reasons: c.eligibility.reasons ?? [] }
      : undefined,
    money: c.money
      ? { frozen: c.money.frozen ?? 0, disputed: c.money.disputed ?? 0, release: c.money.release ?? 0, currency: 'INR' }
      : undefined,
    evidence: (c.evidence ?? []).map((e: Record<string, any>) =>
      ({ kind: e.label ?? e.key ?? '', description: e.hint ?? '', file: e.docIds?.[0] ?? undefined })),
    plan: (c.plan ?? []).map((p: Record<string, any>, i: number) =>
      ({ step: i + 1, title: p.text ?? '', description: p.who ?? '', status: p.status === 'NOW' ? 'ACTIVE' : 'UPCOMING' })),
    nextStep: c.nextStep
      ? { action: c.nextStep.action, text: c.nextStep.text ?? '', letterId: c.nextStep.letterId, dueOn: c.nextStep.dueOn }
      : undefined,
    referral: c.referral
      ? {
          service: c.referral.to ?? '',
          reason: c.referral.text ?? '',
          helpline: '',
          website: c.referral.link ?? '',
          office: '',
          freeLegalAidAct: '',
          guidanceNotes: [],
        }
      : undefined,
    history: c.history ?? [],
    demo: c.demo ?? undefined,
    personNote: c.personNote,
    answersAsked: Boolean(c.answersAsked),
  };
}

export function mapLetter(id: string, l: Record<string, any>): Letter {
  return {
    id,
    kind: l.kind ?? '',
    title: l.title ?? '',
    recipient: l.to,
    body: l.body ?? '',
    status: l.status ?? 'DRAFT',
    citations: (l.citations ?? []).map((c: Record<string, any>) => c.quote ?? ''),
    checks: l.checks
      ? { passed: Boolean(l.checks.passed), reasons: l.checks.notes ?? [] }
      : undefined,
    reminder: Boolean(l.reminder),
    approvedAt: l.approvedAt ? ts(l.approvedAt) : undefined,
    sentOn: l.sentOn,
    sentHow: l.sentHow,
    editedByPerson: Boolean(l.editedByPerson),
  };
}

export function mapDeadline(id: string, d: Record<string, any>): Deadline {
  const status: DeadlineStatus = d.status === 'MISSED' ? 'EXPIRED' : (d.status ?? 'PENDING');
  return {
    id,
    clock: d.clock ?? id,
    title: d.title ?? d.clock ?? '',
    description: d.ruleRef ?? '',
    status,
    dueOn: d.dueOn ?? '',
    statuteRef: d.ruleRef,
  };
}

export function mapStep(id: string, s: Record<string, any>): AgentStep {
  return {
    id,
    agent: s.agent ?? 'SYSTEM',
    message: s.text ?? '',
    level: s.status === 'FAILED' ? 'ERROR' : 'INFO',
    timestamp: ts(s.at),
  };
}

export function mapDocument(id: string, d: Record<string, any>): CaseDocument {
  return {
    id,
    name: d.fileName ?? id,
    kind: d.kind ?? 'OTHER',
    path: d.path ?? '',
    mime: d.mime ?? 'application/octet-stream',
    size: undefined,
    uploadedAt: ts(d.uploadedAt),
    masked: true,
  };
}

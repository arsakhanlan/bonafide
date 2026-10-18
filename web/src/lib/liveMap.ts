import { CaseData, QuestionItem } from '@/types/case';
import { Letter } from '@/types/letter';
import { Deadline, DeadlineStatus } from '@/types/deadline';
import { AgentStep } from '@/types/agentStep';
import { CaseDocument } from '@/types/document';

/** Maps the server contract shapes (backend FirestoreCaseRepository et al.) to the app's state types. */

function ts(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as any).toDate === 'function') {
    return (v as any).toDate().toISOString();
  }
  return String(v);
}

export function mapCase(id: string, c: Record<string, any>): CaseData {
  const facts = c.facts ?? {};
  const moneyRaw = c.money ?? {};
  const money =
    moneyRaw.frozen !== undefined || moneyRaw.disputed !== undefined
      ? {
          frozen: moneyRaw.frozen ?? 0,
          disputed: moneyRaw.disputed ?? 0,
          release: moneyRaw.release ?? 0,
          currency: 'INR',
          // The backend money map has no bank fields; they live in facts.
          bankName: facts.bank ?? facts.branch ?? undefined,
          accountMasked: facts.accountLast4 ? `•••• ${facts.accountLast4}` : undefined,
          problems: moneyRaw.problems ?? [],
        }
      : undefined;

  return {
    id,
    uid: c.uid ?? '',
    language: c.language ?? 'en',
    stage: c.stage ?? 'NEW',
    busy: Boolean(c.busy),
    title: c.title ?? '',
    createdAt: ts(c.createdAt),
    updatedAt: ts(c.updatedAt),
    facts,
    questions: (c.questions ?? []).map((q: Record<string, any>) =>
      ({ id: q.id ?? '', text: q.text ?? '', why: q.why, options: q.choices ?? [] } as QuestionItem)),
    eligibility: c.eligibility
      ? { eligible: c.eligibility.status === 'GENUINE', reasons: c.eligibility.reasons ?? [] }
      : undefined,
    money,
    evidence: (c.evidence ?? []).map((e: Record<string, any>) =>
      ({ kind: e.label ?? e.key ?? '', description: e.hint ?? '', file: e.docIds?.[0] ?? undefined })),
    plan: (c.plan ?? []).map((p: Record<string, any>, i: number) => ({
      step: i + 1,
      title: p.text ?? '',
      description: p.who ?? '',
      dueOn: p.dueOn,
      status: p.status === 'NOW' ? 'ACTIVE' : p.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
    })),
    nextStep: c.nextStep
      ? { action: c.nextStep.action, text: c.nextStep.text ?? '', letterId: c.nextStep.letterId, dueOn: c.nextStep.dueOn }
      : undefined,
    referral: mapReferral(c.referral),
    history: c.history ?? [],
    demo: c.demo ?? undefined,
    personNote: c.personNote,
    answersAsked: Boolean(c.answersAsked),
  };
}

/** Backend referral is {to, title, text, link}; DLSA vs the 1930 cyber helpline. */
function mapReferral(r: Record<string, any> | null | undefined) {
  if (!r) return undefined;
  return {
    to: r.to ?? '',
    title: r.title ?? '',
    text: r.text ?? '',
    link: r.link ?? '',
    service: r.to === 'CYBER_HELPLINE' ? 'National Cybercrime Helpline' : 'National Legal Services Authority (NALSA) & DLSA',
    reason: r.text ?? '',
    helpline: r.to === 'CYBER_HELPLINE' ? '1930' : '15100',
    website: r.link ?? (r.to === 'CYBER_HELPLINE' ? 'https://cybercrime.gov.in' : 'https://nalsa.gov.in'),
    office: r.to === 'CYBER_HELPLINE' ? 'cybercrime.gov.in' : 'District Legal Services Authority (DLSA), District Court Complex',
    freeLegalAidAct: '',
    guidanceNotes: [],
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
    createdAt: l.createdAt ? ts(l.createdAt) : undefined,
    approvedAt: l.approvedAt ? ts(l.approvedAt) : undefined,
    sentOn: l.sentOn,
    sentHow: l.sentHow,
    editedByPerson: Boolean(l.editedByPerson),
  };
}

export function mapDeadline(id: string, d: Record<string, any>): Deadline {
  const status: DeadlineStatus =
    d.status === 'MISSED' ? 'EXPIRED' : d.status === 'MET' || d.status === 'CANCELLED' ? d.status : 'PENDING';
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
  const level: AgentStep['level'] =
    s.status === 'FAILED' ? 'ERROR' : s.status === 'RUNNING' ? 'WARN' : 'INFO';
  return {
    id,
    agent: s.agent ?? 'SYSTEM',
    message: s.text ?? '',
    level,
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
    summary: d.summary ?? '',
    readOk: d.readOk !== false,
  };
}

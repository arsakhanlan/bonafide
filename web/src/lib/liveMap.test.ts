import { describe, expect, it } from 'vitest';
import { mapCase, mapDeadline, mapDocument, mapLetter, mapStep } from './liveMap';
import { isDemoCase } from './mode';

describe('mapCase', () => {
  it('maps the backend case shape into app state', () => {
    const mapped = mapCase('c_abc', {
      uid: 'u1',
      language: 'hi',
      stage: 'LETTER_READY',
      busy: true,
      title: 'My case',
      createdAt: '2026-10-18T10:00:00Z',
      facts: { bank: 'HDFC Bank', branch: 'FC Road', accountLast4: '4092' },
      questions: [{ id: 'q1', text: 'What was the payment for?', choices: ['A', 'B'] }],
      eligibility: { status: 'GENUINE', reasons: ['r1'] },
      money: {
        frozen: 180000, disputed: 2000, release: 178000,
        problems: [{ code: 'WHOLE_ACCOUNT_FROZEN', text: 't', ruleRef: 'r' }],
      },
      evidence: [{ key: 'identity', label: 'ID', hint: 'h', docIds: ['doc1'] }],
      plan: [{ text: 'Hand letter 1 to your branch', who: 'YOU', dueOn: '', status: 'NOW' }],
      nextStep: { action: 'REVIEW_LETTER', text: 'Check your letter', letterId: 'l1' },
      referral: { to: 'DLSA', title: 'Free legal aid', text: 't', link: 'https://nalsa.gov.in/legal-aid/' },
      history: [{ on: '2026-10-18', text: 'You started your case' }],
      demo: { persona: 'RAVI', today: '2026-10-20' },
      personNote: 'note',
      answersAsked: false,
    });

    expect(mapped.id).toBe('c_abc');
    expect(mapped.uid).toBe('u1');
    expect(mapped.language).toBe('hi');
    expect(mapped.busy).toBe(true);
    expect(mapped.stage).toBe('LETTER_READY');
    expect(mapped.money).toEqual({
      frozen: 180000, disputed: 2000, release: 178000, currency: 'INR',
      bankName: 'HDFC Bank', accountMasked: '•••• 4092',
      problems: [{ code: 'WHOLE_ACCOUNT_FROZEN', text: 't', ruleRef: 'r' }],
    });
    expect(mapped.questions?.[0].options).toEqual(['A', 'B']);
    expect(mapped.eligibility?.eligible).toBe(true);
    expect(mapped.plan?.[0].status).toBe('ACTIVE');
    expect(mapped.referral?.helpline).toBe('15100');
    expect(mapped.referral?.website).toBe('https://nalsa.gov.in/legal-aid/');
    expect(mapped.demo?.today).toBe('2026-10-20');
  });

  it('has no money card until the workflow writes one', () => {
    expect(mapCase('c1', { stage: 'NEW' }).money).toBeUndefined();
    expect(mapCase('c1', { stage: 'NEW' }).nextStep?.action).toBeUndefined();
  });

  it('maps the cyber-helpline referral for victims', () => {
    const mapped = mapCase('c1', {
      stage: 'REFERRED',
      referral: { to: 'CYBER_HELPLINE', title: 'Report the fraud', text: 'Call 1930', link: 'https://cybercrime.gov.in' },
    });
    expect(mapped.referral?.helpline).toBe('1930');
    expect(mapped.referral?.website).toBe('https://cybercrime.gov.in');
  });
});

describe('mapDeadline', () => {
  it('keeps every backend status honest', () => {
    expect(mapDeadline('BANK_FILE_GRIEVANCE', { clock: 'BANK_FILE_GRIEVANCE', status: 'PENDING', dueOn: '2026-10-25' }).status).toBe('PENDING');
    expect(mapDeadline('c1', { status: 'MISSED' }).status).toBe('EXPIRED');
    expect(mapDeadline('c1', { status: 'MET' }).status).toBe('MET');
    expect(mapDeadline('c1', { status: 'CANCELLED' }).status).toBe('CANCELLED');
  });
});

describe('mapLetter', () => {
  it('extracts quotes from citations and the recipient from to', () => {
    const letter = mapLetter('l1', {
      kind: 'L1_BRANCH',
      to: 'The Branch Manager',
      status: 'DRAFT',
      citations: [{ n: 1, ref: 'MHA SOP', quote: 'exact words', status: 'IN_FORCE' }],
      checks: { passed: true, notes: ['ok'], rounds: 2, grounding: 0.9 },
      reminder: false,
    });
    expect(letter.recipient).toBe('The Branch Manager');
    expect(letter.citations).toEqual(['exact words']);
    expect(letter.checks).toEqual({ passed: true, reasons: ['ok'] });
    expect(letter.status).toBe('DRAFT');
  });
});

describe('mapDocument', () => {
  it('uses the backend keys including the Reader summary', () => {
    const doc = mapDocument('doc1', {
      fileName: 'statement.pdf', kind: 'STATEMENT', path: 'uploads/u/c/statement.pdf',
      mime: 'application/pdf', uploadedAt: '2026-10-18T10:00:00Z', summary: 'Shows a hold of Rs 1,80,000', readOk: true,
    });
    expect(doc.name).toBe('statement.pdf');
    expect(doc.summary).toBe('Shows a hold of Rs 1,80,000');
    expect(doc.readOk).toBe(true);
    expect(doc.masked).toBe(true);
  });
});

describe('mapStep', () => {
  it('turns FAILED into ERROR and RUNNING into WARN', () => {
    expect(mapStep('s1', { agent: 'READER', text: 'x', status: 'FAILED' }).level).toBe('ERROR');
    expect(mapStep('s2', { agent: 'READER', text: 'x', status: 'RUNNING' }).level).toBe('WARN');
    expect(mapStep('s3', { agent: 'CLOCK', text: 'x', status: 'INFO' }).level).toBe('INFO');
  });
});

describe('isDemoCase', () => {
  it('detects the backend demo flag', () => {
    expect(isDemoCase({ persona: 'RAVI', today: '2026-10-20' })).toBe(true);
    expect(isDemoCase({ persona: 'RAVI' })).toBe(false);
    expect(isDemoCase(undefined)).toBe(false);
    expect(isDemoCase(null)).toBe(false);
  });
});

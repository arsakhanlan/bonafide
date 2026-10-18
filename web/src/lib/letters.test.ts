import { describe, expect, it } from 'vitest';
import type { Letter } from '@/types/letter';
import { latestLetter, latestSent } from './letters';

function letter(overrides: Partial<Letter>): Letter {
  return {
    id: overrides.id ?? 'l1',
    kind: overrides.kind ?? 'L1_BRANCH',
    title: 'Letter',
    body: 'body',
    status: overrides.status ?? 'SENT',
    ...overrides,
  };
}

describe('latestSent', () => {
  it('picks the newest sent letter when the snapshot order is arbitrary', () => {
    const letters = [
      letter({ id: 'l3', kind: 'L3_REVIEW', sentOn: '2026-10-18', createdAt: '2026-10-18T10:30:00Z' }),
      letter({ id: 'l1', kind: 'L1_BRANCH', sentOn: '2026-10-18', createdAt: '2026-10-18T10:00:00Z' }),
      letter({ id: 'l2', kind: 'L2_OFFICER', sentOn: '2026-10-18', createdAt: '2026-10-18T10:15:00Z' }),
    ];

    expect(latestSent(letters)?.id).toBe('l3');
  });

  it('prefers the later sent date and ignores drafts', () => {
    const letters = [
      letter({ id: 'l3', status: 'DRAFT', sentOn: '2026-11-17', createdAt: '2026-11-17T10:00:00Z' }),
      letter({ id: 'l2', kind: 'L2_OFFICER', sentOn: '2026-10-21', createdAt: '2026-10-21T10:00:00Z' }),
      letter({ id: 'l1', sentOn: '2026-10-18', createdAt: '2026-10-18T10:00:00Z' }),
    ];

    expect(latestSent(letters)?.id).toBe('l2');
  });
});

describe('latestLetter', () => {
  it('picks the newest letter including drafts', () => {
    const letters = [
      letter({ id: 'draft', status: 'DRAFT', createdAt: '2026-10-18T11:00:00Z' }),
      letter({ id: 'sent', createdAt: '2026-10-18T10:00:00Z' }),
    ];

    expect(latestLetter(letters)?.id).toBe('draft');
  });

  it('keeps the array fallback when the mock letters have no dates', () => {
    const letters = [letter({ id: 'a', createdAt: undefined }), letter({ id: 'b', createdAt: undefined })];

    expect(latestLetter(letters)?.id).toBe('b');
  });
});

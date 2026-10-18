import { CaseData } from '@/types/case';

/** Where a demo case sits on the five-step demo bar. */
export function demoStepIndex(c: Pick<CaseData, 'stage' | 'busy'>): number {
  if (['RESOLVED', 'REFERRED', 'NEEDS_LAWYER', 'FAILED'].includes(c.stage)) return 4;
  if (c.stage === 'WAITING' || c.stage === 'PARTLY_RELEASED') return 3;
  if (c.stage === 'LETTER_READY') return 2;
  if (c.stage === 'NEEDS_ANSWERS' || c.busy) return 1;
  return 0;
}

/** A reply that restores the surplus balance ends the guided demo. */
export function isReleaseReply(text: string): boolean {
  // Negations and refusals mention "release" too; they must not end the case.
  if (
    /not\s+(?:been\s+)?released|no\s+releas|refus|denied|rejected|without\s+(?:a\s+)?(?:police\s+)?noc/i.test(
      text
    )
  ) {
    return false;
  }
  return /releas|unfr|restricted to/i.test(text);
}

/** Once the surplus is released, only the disputed sum remains frozen. */
export function settledMoney<T extends { frozen: number; disputed: number; release: number }>(
  money: T
): T {
  return { ...money, frozen: money.disputed, release: 0 };
}

import { describe, expect, it } from 'vitest';
import { demoStepIndex, isReleaseReply, settledMoney } from './demoFlow';

const at = (stage: any, busy = false) => demoStepIndex({ stage, busy });

describe('demoStepIndex', () => {
  it('maps the happy-path stages onto the five demo steps', () => {
    expect(at('NEW')).toBe(0);
    expect(at('NEW', true)).toBe(1);
    expect(at('NEEDS_ANSWERS')).toBe(1);
    expect(at('LETTER_READY')).toBe(2);
    expect(at('WAITING')).toBe(3);
    expect(at('PARTLY_RELEASED')).toBe(3);
    expect(at('RESOLVED')).toBe(4);
  });

  it('treats safety and failure endings as the outcome step', () => {
    expect(at('REFERRED')).toBe(4);
    expect(at('NEEDS_LAWYER')).toBe(4);
    expect(at('FAILED')).toBe(4);
  });
});

describe('isReleaseReply', () => {
  it('recognises the release reply used by the demo', () => {
    expect(
      isReleaseReply(
        'Lien restricted to disputed ₹2,000. Balance of ₹1,78,000 released for normal transactions.'
      )
    ).toBe(true);
    expect(isReleaseReply('The bank unfroze the surplus balance.')).toBe(true);
  });

  it('leaves refusals on the escalation path', () => {
    expect(
      isReleaseReply('Total debit hold cannot be altered without police NOC.')
    ).toBe(false);
    expect(isReleaseReply('Your grievance has been received; internal review is pending.')).toBe(
      false
    );
  });
});

describe('settledMoney', () => {
  it('moves the released surplus out of the frozen and release buckets', () => {
    expect(
      settledMoney({ frozen: 180000, disputed: 2000, release: 178000, bankName: 'HDFC Bank' })
    ).toEqual({ frozen: 2000, disputed: 2000, release: 0, bankName: 'HDFC Bank' });
  });
});

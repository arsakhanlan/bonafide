import { describe, expect, it } from 'vitest';
import { formatElapsed } from './useElapsed';

describe('formatElapsed', () => {
  it('formats short waits as m:ss', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(7)).toBe('0:07');
    expect(formatElapsed(65)).toBe('1:05');
  });

  it('adds hours when needed and clamps negatives', () => {
    expect(formatElapsed(3725)).toBe('1:02:05');
    expect(formatElapsed(-3)).toBe('0:00');
  });
});

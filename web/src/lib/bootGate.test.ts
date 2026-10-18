import { describe, expect, it, vi } from 'vitest';
import { createLandedGate } from './bootGate';

describe('createLandedGate', () => {
  it('waits for every source before reporting ready', () => {
    const onReady = vi.fn();
    const gate = createLandedGate(3, onReady);
    const [a, b, c] = [gate.settle(), gate.settle(), gate.settle()];

    a();
    b();
    expect(onReady).not.toHaveBeenCalled();

    c();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('counts a source only once, even after many snapshots', () => {
    const onReady = vi.fn();
    const gate = createLandedGate(2, onReady);
    const first = gate.settle();
    const second = gate.settle();

    first();
    first();
    first();
    expect(onReady).not.toHaveBeenCalled();

    second();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('reports only once after all sources have settled', () => {
    const onReady = vi.fn();
    const gate = createLandedGate(1, onReady);
    const only = gate.settle();

    only();
    only();
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});

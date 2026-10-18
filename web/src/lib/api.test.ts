import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./firebase', () => ({ getAuthToken: async () => 'test-token' }));

import { api } from './api';

describe('api error handling', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps a non-JSON error body instead of re-reading the stream', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('proxy exploded', { status: 502, statusText: 'Bad Gateway' }))
    );

    await expect(api.createDemoCase('RAVI')).rejects.toThrow('proxy exploded');
  });

  it('extracts the backend error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: 'BUSY', message: 'Case is busy' } }), {
            status: 409,
          })
      )
    );

    await expect(api.createDemoCase('RAVI')).rejects.toThrow('Case is busy');
  });

  it('returns the success payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ caseId: 'c1' }), { status: 201 }))
    );

    await expect(api.createDemoCase('RAVI')).resolves.toEqual({ caseId: 'c1' });
  });
});

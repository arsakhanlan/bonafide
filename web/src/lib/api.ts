import { getAuthToken } from './firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      // Backend errors are {error: {code, message}} (ApiExceptionHandler).
      errorDetail =
        errorJson.error?.message ||
        errorJson.message ||
        errorJson.error ||
        JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `HTTP error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Case operations
  createCase: (language: 'en' | 'hi' = 'en') =>
    request<{ caseId: string }>('/api/cases', {
      method: 'POST',
      body: JSON.stringify({ language }),
    }),

  deleteCase: (caseId: string) =>
    request<void>(`/api/cases/${caseId}`, {
      method: 'DELETE',
    }),

  // Demo operations
  createDemoCase: (persona: 'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL') =>
    request<{ caseId: string }>('/api/demo/cases', {
      method: 'POST',
      body: JSON.stringify({ persona }),
    }),

  skipAhead: (caseId: string, days: number) =>
    request<{ today: string; woken: number }>(`/api/demo/cases/${caseId}/skip`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  // Letter operations
  approveLetter: (caseId: string, letterId: string, body?: string) =>
    request<{ status: string }>(`/api/cases/${caseId}/letters/${letterId}/approve`, {
      method: 'POST',
      body: JSON.stringify(body ? { body } : {}),
    }),

  markLetterSent: (
    caseId: string,
    letterId: string,
    data: { sentOn: string; how: 'BRANCH' | 'EMAIL' | 'WHATSAPP' | 'POST' }
  ) =>
    request<{ status: string }>(`/api/cases/${caseId}/letters/${letterId}/sent`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Events operations
  sendEvent: (
    caseId: string,
    payload: {
      type: 'UPLOAD' | 'ANSWERS' | 'REPLY' | 'DEADLINE_PASSED';
      files?: Array<{ path: string; kind: string; mime: string }>;
      text?: string;
      answers?: Array<{ questionId: string; answer: string }>;
    }
  ) =>
    request<{ eventId: string }>(`/api/cases/${caseId}/events`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};


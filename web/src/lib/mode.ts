/**
 * One compile-time flag decides between the two ways to run the app:
 *
 *  - real mode (default): a new end user's app — Firebase Auth, Firestore live sync,
 *    real uploads and the Cloud Run API. No dummy data, ever.
 *  - mock mode (VITE_MOCK=true, e.g. `npm run demo` or scripts/run-demo.sh):
 *    the showcase with dummy data and no backend at all.
 *
 * Vite inlines import.meta.env at build time, so a production build is always real mode.
 */
export const IS_MOCK = import.meta.env.VITE_MOCK === 'true' || import.meta.env.MODE === 'mock';

/** Demo-only controls (persona picker, time machine) are shown in mock mode,
 *  or for a real demo case the backend created (judges' one-tap scenarios). */
export const isDemoCase = (demo?: unknown): boolean =>
  !!demo && typeof demo === 'object' && (demo as Record<string, unknown>).today != null;

/** Fired after a letter is approved so a global, non-blocking stamp can play. */
export const APPROVAL_EVENT = 'bonafide:letter-approved';

export function announceApproval() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(APPROVAL_EVENT));
}

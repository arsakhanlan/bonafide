import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Stage } from '@/types/case';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Today's date in Asia/Kolkata (the backend's zone), as YYYY-MM-DD. */
export function todayInIndia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/**
 * Format an amount in Indian Rupees (INR) with standard Lakh/Crore grouping.
 * e.g. 180000 -> ₹1,80,000
 */
export function formatINR(amount?: number | null): string {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO or YYYY-MM-DD date into friendly readable date
 * e.g. "2026-10-19" -> "19 Oct 2026"
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get visual styling badges and human-readable metadata for stages
 */
export function getStageMetadata(stage: Stage) {
  switch (stage) {
    case 'NEW':
      return {
        label: 'New Case',
        description: 'Waiting for documentation and evidence',
        color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
    case 'NEEDS_ANSWERS':
      return {
        label: 'Clarification Required',
        description: 'The AI agent needs a few details from you to verify your claim',
        color: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'LETTER_READY':
      return {
        label: 'Legal Representation Ready',
        description: 'Statutory letter drafted and grounded in law. Review and approve.',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
        dot: 'bg-emerald-600',
      };
    case 'WAITING':
      return {
        label: 'Statutory Clock Running',
        description: 'Formal representation sent. Waiting for bank compliance.',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
        dot: 'bg-emerald-600 animate-pulse',
      };
    case 'PARTLY_RELEASED':
      return {
        label: 'Partially Released',
        description: 'Lien limited to disputed amount; surplus balance unlocked.',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
        dot: 'bg-emerald-600',
      };
    case 'RESOLVED':
      return {
        label: 'Case Resolved',
        description: 'Bank freeze successfully lifted and funds fully accessible.',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-600',
      };
    case 'REFERRED':
      return {
        label: 'Referred to Legal Aid',
        description: 'Account-sharing protection policy: directed to NALSA free counsel.',
        color: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
        dot: 'bg-amber-600',
      };
    case 'NEEDS_LAWYER':
      return {
        label: 'High Court / Magistrate Advised',
        description: 'Complex FIR requires formal court petition with counsel.',
        color: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
        dot: 'bg-amber-600',
      };
    case 'FAILED':
      return {
        label: 'Ineligible / Unsuccessful',
        description: 'Case could not be automatically processed under Section 106.',
        color: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
        dot: 'bg-rose-600',
      };
  }
}

/**
 * Extract unfilled placeholders like {{Your name}} from letter body
 */
export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}


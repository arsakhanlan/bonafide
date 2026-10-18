import * as React from 'react';
import { cn } from '@/lib/utils';

/** A small emerald ring that picks up the current text colour. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('brand-spinner inline-block h-4 w-4 shrink-0', className)}
    />
  );
}

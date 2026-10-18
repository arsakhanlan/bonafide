import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapseProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Height/opacity accordion that animates both opening and closing. */
export function Collapse({ open, children, className }: CollapseProps) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

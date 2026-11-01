import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

/** A small grey label: request type, platform, importance. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'flex h-[22px] items-center rounded-full bg-chip px-2 text-[11px] font-semibold whitespace-nowrap text-ink-3',
        className,
      )}
    >
      {children}
    </span>
  );
}

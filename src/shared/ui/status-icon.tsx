import type { TicketStatus } from '../data/database.types';
import { cn } from '../lib/cn';

export interface StatusIconProps {
  status: TicketStatus;
  size?: number;
  /**
   * In a filter chip: drawn in the chip's text colour, with cut-outs in `--status-cutout` (the
   * chip's background). Elsewhere ink on white, and closed in light grey.
   */
  inChip?: boolean;
  className?: string;
}

/** The design's status marks: open ring, planned half, resolved check, closed cross. */
export function StatusIcon({ status, size = 12, inChip = false, className }: StatusIconProps) {
  const cutout = inChip ? 'var(--status-cutout)' : '#ffffff';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden
      className={cn('shrink-0', className)}
      // Closed is always light grey outside chips, whatever colour the caller gives.
      style={status === 'closed' && !inChip ? { color: 'var(--color-closed)' } : undefined}
    >
      {status === 'open' || status === 'planned' ? (
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
      ) : null}
      {status === 'planned' ? <path d="M7 3a4 4 0 0 1 0 8z" fill="currentColor" /> : null}
      {status === 'resolved' ? (
        <>
          <circle cx="7" cy="7" r="6.3" fill="currentColor" />
          <path
            d="M4.3 7.2l1.8 1.8 3.6-3.8"
            stroke={cutout}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}
      {status === 'closed' ? (
        <>
          <circle cx="7" cy="7" r="6.3" fill="currentColor" opacity={inChip ? 0.45 : 1} />
          <path d="M5 5l4 4M9 5L5 9" stroke={cutout} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

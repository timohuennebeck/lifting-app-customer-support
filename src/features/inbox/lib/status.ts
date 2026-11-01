import type { TicketKind, TicketStatus } from '@/shared/data/database.types';

export const STATUSES: readonly TicketStatus[] = ['open', 'planned', 'resolved', 'closed'];

/** A status as the app names it to the user: a resolved bug is "Fixed", a resolved idea "Shipped". */
export type ShownStatus = 'open' | 'planned' | 'fixed' | 'shipped' | 'closed';

export function shownStatus(kind: TicketKind, status: TicketStatus): ShownStatus {
  if (status === 'resolved') return kind === 'idea' ? 'shipped' : 'fixed';
  return status;
}

/** Statuses the app shows a version with: "Coming in update 1.4.3", "Live in update 1.4.3". */
export const takesVersion = (status: TicketStatus) => status === 'planned' || status === 'resolved';

/** Open and planned tickets still need the team; the app says "Live in" for the others. */
export const isActive = (status: TicketStatus) => status === 'open' || status === 'planned';

/** A version is short ("1.4.3"); the field takes at most this many characters. */
export const VERSION_MAX = 20;

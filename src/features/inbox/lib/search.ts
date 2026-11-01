import type { TicketStatus } from '@/shared/data/database.types';

import type { InboxFilter, KindFilter } from './filter';
import { STATUSES } from './status';

/** The inbox's URL: `/inbox?status=planned&kind=idea&q=crash&ticket=1042`, all optional. */
export interface InboxSearch {
  status?: TicketStatus;
  kind?: Exclude<KindFilter, 'all'>;
  q?: string;
  ticket?: number;
}

export function parseInboxSearch(raw: Record<string, unknown>): InboxSearch {
  const search: InboxSearch = {};
  if (STATUSES.includes(raw.status as TicketStatus) && raw.status !== 'open') {
    search.status = raw.status as TicketStatus;
  }
  if (raw.kind === 'bug' || raw.kind === 'idea') search.kind = raw.kind;
  if (typeof raw.q === 'string' && raw.q) search.q = raw.q;
  const ticket = Number(raw.ticket);
  if (Number.isInteger(ticket) && ticket > 0) search.ticket = ticket;
  return search;
}

/** The filter a URL stands for; without one, open tickets of both types. */
export const filterOf = (search: InboxSearch): InboxFilter => ({
  status: search.status ?? 'open',
  kind: search.kind ?? 'all',
  q: search.q ?? '',
});

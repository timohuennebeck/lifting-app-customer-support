import type { CustomerMap } from '@/shared/data/customers';
import type { InboxRow, TicketKind, TicketStatus } from '@/shared/data/database.types';

export type KindFilter = 'all' | TicketKind;

export interface InboxFilter {
  status: TicketStatus;
  kind: KindFilter;
  q: string;
}

/** Whether every word of the search appears in the ticket's number, subject, text or sender. */
export function matchesQuery(ticket: InboxRow, customers: CustomerMap | undefined, q: string) {
  const words = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const customer = customers?.get(ticket.user_id);
  const haystack = [
    `#${ticket.number}`,
    ticket.subject,
    ticket.last_preview,
    customer?.first_name,
    customer?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
  return words.every((word) => haystack.includes(word));
}

const matchesKind = (ticket: InboxRow, kind: KindFilter) => kind === 'all' || ticket.kind === kind;

/** The tickets of one status chip, in the inbox's order. */
export function visibleTickets(
  tickets: readonly InboxRow[],
  customers: CustomerMap | undefined,
  filter: InboxFilter,
) {
  return tickets.filter(
    (t) =>
      t.status === filter.status &&
      matchesKind(t, filter.kind) &&
      matchesQuery(t, customers, filter.q),
  );
}

/** How many tickets each status chip holds with the current type and search. */
export function statusCounts(
  tickets: readonly InboxRow[],
  customers: CustomerMap | undefined,
  kind: KindFilter,
  q: string,
): Record<TicketStatus, number> {
  const counts: Record<TicketStatus, number> = { open: 0, planned: 0, resolved: 0, closed: 0 };
  for (const t of tickets) {
    if (matchesKind(t, kind) && matchesQuery(t, customers, q)) counts[t.status] += 1;
  }
  return counts;
}

/** The ticket `step` places away in the list (J/K), or null at either end. */
export function neighbour(list: readonly InboxRow[], id: string | undefined, step: 1 | -1) {
  const index = list.findIndex((t) => t.id === id);
  if (index < 0) return list[0] ?? null;
  return list[index + step] ?? null;
}

/** Where to go once a ticket leaves the list: the one after it, else the one before. */
export function nextAfterLeaving(list: readonly InboxRow[], id: string) {
  const index = list.findIndex((t) => t.id === id);
  if (index < 0) return list[0] ?? null;
  return list[index + 1] ?? list[index - 1] ?? null;
}

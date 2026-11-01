import type { CustomerMap } from '@/shared/data/customers';
import type { CustomerRow, InboxRow } from '@/shared/data/database.types';

export interface CustomerSummary {
  userId: string;
  customer: CustomerRow | undefined;
  /** Their most recently active ticket, which the row opens. */
  latest: InboxRow;
  count: number;
  hasOpen: boolean;
  /** When they last wrote or reopened (else the latest ticket's activity). */
  lastContact: string;
}

/**
 * One row per person with tickets, most recent contact first. `tickets` comes in the inbox's
 * order (newest activity first), so each person's first ticket is their latest.
 */
export function summarize(
  customers: CustomerMap | undefined,
  tickets: readonly InboxRow[],
): CustomerSummary[] {
  const byUser = new Map<string, InboxRow[]>();
  for (const ticket of tickets) {
    const list = byUser.get(ticket.user_id);
    if (list) list.push(ticket);
    else byUser.set(ticket.user_id, [ticket]);
  }
  const summaries: CustomerSummary[] = [];
  for (const [userId, list] of byUser) {
    const [latest] = list;
    if (!latest) continue;
    const contacts = list.map((t) => t.user_activity_at ?? t.last_activity_at);
    summaries.push({
      userId,
      customer: customers?.get(userId),
      latest,
      count: list.length,
      hasOpen: list.some((t) => t.status === 'open'),
      lastContact: contacts.reduce((a, b) => (b > a ? b : a)),
    });
  }
  return summaries.sort((a, b) => b.lastContact.localeCompare(a.lastContact));
}

/** Whether every word of the search appears in the person's name or email. */
export function matchesCustomer(name: string, email: string | null | undefined, q: string) {
  const words = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${name} ${email ?? ''}`.toLocaleLowerCase();
  return words.every((word) => haystack.includes(word));
}

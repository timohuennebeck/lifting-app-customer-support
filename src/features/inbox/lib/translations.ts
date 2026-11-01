import type { InboxRow, MessageRow } from '@/shared/data/database.types';
import type { Translations } from '@/shared/data/translations';
import { sameLanguage } from '@/shared/lib/language';

/** A ticket as the desk shows it: subject and preview in the desk's language where translated. */
export interface DeskTicket extends InboxRow {
  /** As the user wrote them, for search. */
  original_subject: string;
  original_preview: string | null;
}

/** The longest subject (the app's TICKET_SUBJECT_MAX). */
const SUBJECT_MAX = 120;

/** A message's first line, as the app makes a ticket's subject from its first message. */
export const firstLine = (text: string) =>
  text.trim().split('\n')[0]?.trim().slice(0, SUBJECT_MAX) ?? '';

/** Subject and preview from the translations of the first and last message, where there are. */
export function localizeTickets(
  tickets: readonly InboxRow[],
  translations: Translations | undefined,
): DeskTicket[] {
  return tickets.map((ticket) => {
    const first = ticket.first_message_id ? translations?.get(ticket.first_message_id) : undefined;
    const last = ticket.last_message_id ? translations?.get(ticket.last_message_id) : undefined;
    return {
      ...ticket,
      subject: first ? firstLine(first) || ticket.subject : ticket.subject,
      last_preview: last ? last.slice(0, 200) : ticket.last_preview,
      original_subject: ticket.subject,
      original_preview: ticket.last_preview,
    };
  });
}

/** How long a new message's language may stay unknown before the desk translates it itself. */
const DETECT_GRACE_MS = 30_000;

/**
 * The messages to ask a translation into `language` for: with text, written in another language
 * (or not detected yet after a grace period, in which the server's own translation usually
 * arrives), and without one yet.
 */
export function missingTranslations(
  messages: readonly MessageRow[],
  translations: Translations,
  language: string,
  now: number,
) {
  return messages.filter((m) => {
    if (!m.content.trim() || translations.has(m.id)) return false;
    if (m.language) return !sameLanguage(m.language, language);
    return now - Date.parse(m.created_at) > DETECT_GRACE_MS;
  });
}

// Unsent replies per ticket, kept while the desk is open so switching tickets doesn't lose them.
const drafts = new Map<string, string>();

export const getDraft = (ticketId: string) => drafts.get(ticketId) ?? '';

export function setDraft(ticketId: string, text: string) {
  if (text) drafts.set(ticketId, text);
  else drafts.delete(ticketId);
}

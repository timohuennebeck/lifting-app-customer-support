import { useSyncExternalStore } from 'react';

// Unsent replies per ticket, kept while the desk is open so switching tickets doesn't lose them.
const drafts = new Map<string, string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getDraft = (ticketId: string) => drafts.get(ticketId) ?? '';

export function setDraft(ticketId: string, text: string) {
  if (text) drafts.set(ticketId, text);
  else drafts.delete(ticketId);
  listeners.forEach((listener) => listener());
}

/** Puts a reply that could not be sent back into its ticket's draft, before anything typed since. */
export function restoreDraft(ticketId: string, text: string) {
  const current = getDraft(ticketId);
  setDraft(ticketId, current.trim() ? `${text}\n\n${current}` : text);
}

/** A ticket's draft, also when a failed reply comes back into it. */
export function useDraft(ticketId: string) {
  return useSyncExternalStore(subscribe, () => getDraft(ticketId));
}

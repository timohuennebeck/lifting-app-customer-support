import type { MessageRow } from '@/shared/data/database.types';

/** A reply on its way to the server, shown in the thread until the saved one is there. */
export interface PendingReply {
  key: string;
  content: string;
  /**
   * Team messages with the same text the thread held when it was sent, counting replies with the
   * same text still ahead of it; one more means this reply is saved.
   */
  known: number;
}

/** How many of the team's messages read exactly `content`. */
export const teamMessagesWith = (messages: readonly MessageRow[], content: string) =>
  messages.filter((m) => m.author === 'team' && m.content === content).length;

/** The replies still on their way: those whose saved message the thread doesn't show yet. */
export function unsavedReplies(
  pending: readonly PendingReply[],
  messages: readonly MessageRow[],
): PendingReply[] {
  return pending.filter((reply) => teamMessagesWith(messages, reply.content) <= reply.known);
}

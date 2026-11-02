import type { EventRow, MessageRow } from '@/shared/data/database.types';

import type { PendingReply } from './pending';

export type TimelineItem =
  | { type: 'message'; key: string; at: number; message: MessageRow }
  | { type: 'event'; key: string; at: number; event: EventRow }
  | { type: 'pending'; key: string; reply: PendingReply };

/**
 * Messages and status lines in time order, at the same moment a message first; replies still
 * being sent come last, in the order they were written.
 */
export function buildTimeline(
  messages: readonly MessageRow[],
  events: readonly EventRow[],
  pending: readonly PendingReply[] = [],
): TimelineItem[] {
  const items = [
    ...messages.map((message) => ({
      type: 'message' as const,
      key: message.id,
      at: Date.parse(message.created_at),
      message,
    })),
    ...events.map((event) => ({
      type: 'event' as const,
      key: event.id,
      at: Date.parse(event.created_at),
      event,
    })),
  ];
  const rank = (item: (typeof items)[number]) => (item.type === 'message' ? 0 : 1);
  items.sort((a, b) => a.at - b.at || rank(a) - rank(b));
  return [
    ...items,
    ...pending.map((reply) => ({ type: 'pending' as const, key: reply.key, reply })),
  ];
}

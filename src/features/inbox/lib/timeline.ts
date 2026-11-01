import type { EventRow, MessageRow } from '@/shared/data/database.types';

export type TimelineItem =
  | { type: 'message'; key: string; at: number; message: MessageRow }
  | { type: 'event'; key: string; at: number; event: EventRow };

/** Messages and status lines in time order; at the same moment a message comes first. */
export function buildTimeline(
  messages: readonly MessageRow[],
  events: readonly EventRow[],
): TimelineItem[] {
  const items: TimelineItem[] = [
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
  const rank = (item: TimelineItem) => (item.type === 'message' ? 0 : 1);
  return items.sort((a, b) => a.at - b.at || rank(a) - rank(b));
}

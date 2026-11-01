import { useQuery } from '@tanstack/react-query';

import type { EventRow, MessageRow } from '@/shared/data/database.types';
import { orThrow, supabase } from '@/shared/data/supabase';
import { ticketKeys } from '@/shared/data/tickets';

export interface Thread {
  messages: MessageRow[];
  events: EventRow[];
}

async function fetchThread(ticketId: string): Promise<Thread> {
  const [messages, events] = await Promise.all([
    supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at')
      .then(orThrow),
    supabase
      .from('ticket_events')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at')
      .then(orThrow),
  ]);
  return { messages, events };
}

/** A ticket's messages and status changes. */
export function useThread(ticketId: string) {
  return useQuery({ queryKey: ticketKeys.thread(ticketId), queryFn: () => fetchThread(ticketId) });
}

import { useQuery } from '@tanstack/react-query';

import type { InboxRow } from './database.types';
import { fetchAll, supabase } from './supabase';

export const ticketKeys = {
  inbox: ['inbox'] as const,
  thread: (ticketId: string) => ['thread', ticketId] as const,
  attachments: (paths: readonly string[]) => ['attachments', ...paths] as const,
};

/** Every ticket with its last message and read state, newest activity first. */
async function fetchInbox(): Promise<InboxRow[]> {
  return fetchAll((from, to) =>
    supabase
      .from('support_inbox')
      .select('*')
      .order('last_activity_at', { ascending: false })
      .order('id')
      .range(from, to),
  );
}

export function useInbox() {
  return useQuery({ queryKey: ticketKeys.inbox, queryFn: fetchInbox });
}

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { customerKeys } from '../data/customers';
import { supabase } from '../data/supabase';
import { ticketKeys } from '../data/tickets';

interface TicketChange {
  ticket_id?: string;
}

/**
 * Refreshes the inbox and the open conversation when a ticket, message or status changes
 * anywhere (Supabase Realtime; the database's policies decide what this account hears).
 */
export function useDeskRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshInbox = () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.inbox });
    };
    const refreshThread = ({ new: row }: { new: TicketChange }) => {
      refreshInbox();
      if (row.ticket_id) {
        void queryClient.invalidateQueries({ queryKey: ticketKeys.thread(row.ticket_id) });
      }
    };
    const channel = supabase
      .channel('support-desk')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, () => {
        refreshInbox();
        // A new ticket can come from someone the desk hasn't seen yet.
        void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets' }, refreshInbox)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages' },
        refreshThread,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_events' },
        refreshThread,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

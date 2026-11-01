import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { assertOk, supabase } from '@/shared/data/supabase';
import { ticketKeys } from '@/shared/data/tickets';

/** The most a message may hold (the database's ticket_messages check). */
export const MESSAGE_MAX = 5000;

/** Changes one ticket in the cached inbox right away; returns the previous rows to roll back. */
function patchInbox(
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
  patch: Partial<InboxRow>,
) {
  const previous = queryClient.getQueryData<InboxRow[]>(ticketKeys.inbox);
  queryClient.setQueryData<InboxRow[]>(ticketKeys.inbox, (rows) =>
    rows?.map((row) => (row.id === ticketId ? { ...row, ...patch } : row)),
  );
  return previous;
}

/**
 * A reply from the team. It carries the ticket owner's user_id, so it syncs to their phone,
 * where the app shows it as from the Loqqa team.
 */
export function useSendReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket, content }: { ticket: InboxRow; content: string }) => {
      assertOk(
        await supabase.from('ticket_messages').insert({
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          author: 'team',
          content,
        }),
      );
    },
    onSettled: (_data, _error, { ticket }) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.thread(ticket.id) });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.inbox });
    },
  });
}

interface StatusChange {
  ticket: InboxRow;
  status: TicketStatus;
  /** The app version the change ships in ("1.4.3"); the app words it in the user's language. */
  version?: string;
}

/**
 * Logs a status change; the database mirrors it onto the ticket, and the app shows it as a line
 * in the chat. The inbox moves the ticket at once.
 */
export function useSetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket, status, version }: StatusChange) => {
      assertOk(
        await supabase.from('ticket_events').insert({
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          kind: 'status',
          status,
          version: version?.trim() || null,
        }),
      );
    },
    onMutate: ({ ticket, status }) => ({
      previous: patchInbox(queryClient, ticket.id, { status }),
    }),
    onError: (_error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(ticketKeys.inbox, context.previous);
    },
    onSettled: (_data, _error, { ticket }) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.thread(ticket.id) });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.inbox });
    },
  });
}

/** Marks a ticket read up to the user's last message or reopen. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: InboxRow) => {
      if (!ticket.user_activity_at) return;
      assertOk(
        await supabase
          .from('support_ticket_reads')
          .upsert({ ticket_id: ticket.id, read_at: ticket.user_activity_at }),
      );
    },
    onMutate: (ticket) => ({
      previous: patchInbox(queryClient, ticket.id, {
        unread: false,
        read_at: ticket.user_activity_at,
      }),
    }),
    onError: (_error, _ticket, context) => {
      if (context?.previous) queryClient.setQueryData(ticketKeys.inbox, context.previous);
    },
  });
}

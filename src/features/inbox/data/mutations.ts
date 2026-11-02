import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { assertOk, supabase } from '@/shared/data/supabase';
import { ticketKeys } from '@/shared/data/tickets';
import { translationKeys } from '@/shared/data/translations';
import { toast } from '@/shared/lib/toast';

import { restoreDraft } from '../lib/drafts';
import { type PendingReply, teamMessagesWith } from '../lib/pending';
import type { Thread } from './thread';

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

const sendKey = (ticketId: string) => ['send-reply', ticketId] as const;

interface Reply {
  ticket: InboxRow;
  content: string;
  /** See PendingReply.known. */
  known: number;
}

/**
 * A reply from the team, through the send-team-reply function: it translates the reply into the
 * user's app language (from whatever language it is written in) and saves both together, so the
 * user's app shows it in their language right away, as from the Loqqa team.
 *
 * Translating takes a few seconds, so the thread shows the reply at once (usePendingReplies) and
 * the composer is free for the next one. Replies to a ticket go out one after another, in the
 * order they were written; one that fails goes back into the ticket's draft.
 */
export function useSendReply(ticketId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: sendKey(ticketId),
    scope: { id: `send-reply ${ticketId}` },
    mutationFn: async ({ ticket, content }: Reply) => {
      const { error } = await supabase.functions.invoke('send-team-reply', {
        body: { ticket_id: ticket.id, content },
      });
      if (error) throw error;
    },
    onSuccess: () => toast(t('toast.sent')),
    onError: (_error, { ticket, content }) => {
      restoreDraft(ticket.id, content);
      toast(t('toast.error'));
    },
    // Pending until the thread holds the saved reply, so it never shows twice or goes missing.
    onSettled: async (_data, _error, { ticket }) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.inbox });
      void queryClient.invalidateQueries({ queryKey: translationKeys.all });
      await queryClient.invalidateQueries({ queryKey: ticketKeys.thread(ticket.id) });
    },
  });

  return (ticket: InboxRow, content: string) => {
    const thread = queryClient.getQueryData<Thread>(ticketKeys.thread(ticket.id));
    const ahead = queryClient
      .getMutationCache()
      .findAll({ mutationKey: sendKey(ticket.id), status: 'pending' })
      .filter((m) => (m.state.variables as Reply | undefined)?.content === content).length;
    mutate({ ticket, content, known: teamMessagesWith(thread?.messages ?? [], content) + ahead });
  };
}

/** A ticket's replies still being sent, oldest first. */
export function usePendingReplies(ticketId: string): PendingReply[] {
  return useMutationState({
    filters: { mutationKey: sendKey(ticketId), status: 'pending' },
    select: (mutation) => {
      const { content, known } = mutation.state.variables as Reply;
      return { key: `pending-${mutation.mutationId}`, content, known };
    },
  });
}

interface StatusChange {
  ticket: InboxRow;
  status: TicketStatus;
}

/**
 * Logs a status change; the database mirrors it onto the ticket, and the app shows it as a line
 * in the chat. The inbox moves the ticket at once.
 */
export function useSetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket, status }: StatusChange) => {
      assertOk(
        await supabase.from('ticket_events').insert({
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          kind: 'status',
          status,
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

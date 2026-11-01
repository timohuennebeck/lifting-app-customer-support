import { getRouteApi } from '@tanstack/react-router';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useCustomers } from '@/shared/data/customers';
import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { useInbox } from '@/shared/data/tickets';
import { usePageVisible } from '@/shared/hooks/use-page-visible';
import { displayName, initials } from '@/shared/lib/people';
import { toast } from '@/shared/lib/toast';

import { Conversation, NoConversation } from '../components/conversation';
import { CustomerPanel } from '../components/customer-panel';
import { TicketList } from '../components/ticket-list';
import { useMarkRead, useSetStatus } from '../data/mutations';
import {
  type KindFilter,
  neighbour,
  nextAfterLeaving,
  statusCounts,
  visibleTickets,
} from '../lib/filter';
import { filterOf, type InboxSearch } from '../lib/search';
import { shownStatus } from '../lib/status';

const route = getRouteApi('/_desk/inbox');

/** Typing in a field, or a menu or dialog open: the single-key shortcuts stay off. */
function shortcutsBlocked(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target as HTMLElement | null;
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return !!document.querySelector('[role="menu"], [role="dialog"]');
}

/**
 * The inbox: tickets of one status on the left, the chosen one's conversation in the middle and
 * its sender on the right. Filters and the chosen ticket live in the URL. J/K move through the
 * list, E resolves and moves on, R jumps to the reply box.
 */
export function InboxScreen() {
  const { t } = useTranslation();
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const filter = useMemo(
    () => filterOf({ status: search.status, kind: search.kind, q: search.q }),
    [search.status, search.kind, search.q],
  );
  const inbox = useInbox();
  const { data: customers } = useCustomers();
  const setStatus = useSetStatus();
  const { mutate: markRead } = useMarkRead();
  const visibleNow = usePageVisible();
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const tickets = useMemo(() => inbox.data ?? [], [inbox.data]);
  const visible = useMemo(
    () => visibleTickets(tickets, customers, filter),
    [tickets, customers, filter],
  );
  const counts = useMemo(
    () => statusCounts(tickets, customers, filter.kind, filter.q),
    [tickets, customers, filter],
  );
  const openTotal = useMemo(() => tickets.filter((t) => t.status === 'open').length, [tickets]);

  // The ticket in the URL, also when it has left this view; else the view's first.
  const selected =
    (search.ticket ? tickets.find((ticket) => ticket.number === search.ticket) : undefined) ??
    visible[0];

  const update = (patch: Partial<InboxSearch>, replace = false) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace });

  const select = (ticket: InboxRow | null | undefined) => {
    if (ticket) update({ ticket: ticket.number }, true);
  };

  /** Opens a ticket in its own status view (from the customer's earlier requests). */
  const openElsewhere = (ticket: InboxRow) =>
    void navigate({
      search: {
        status: ticket.status === 'open' ? undefined : ticket.status,
        ticket: ticket.number,
      },
    });

  const resolveAndNext = () => {
    if (!selected || selected.status === 'resolved') return;
    const next = visible.includes(selected) ? nextAfterLeaving(visible, selected.id) : visible[0];
    const status = t(`statusShown.${shownStatus(selected.kind, 'resolved')}`);
    setStatus.mutate(
      { ticket: selected, status: 'resolved' },
      {
        onSuccess: () => toast(t('toast.status', { status })),
        onError: () => toast(t('toast.error')),
      },
    );
    update({ ticket: next?.number }, true);
  };

  // Read once someone actually sees it: selected while this tab is in front. One try per
  // message, so a failing write doesn't repeat.
  const tried = useRef('');
  useEffect(() => {
    if (!selected?.unread || !visibleNow) return;
    const mark = `${selected.id}@${selected.user_activity_at}`;
    if (tried.current === mark) return;
    tried.current = mark;
    markRead(selected);
  }, [selected, visibleNow, markRead]);

  // Shortcuts read the latest list and selection through a ref, so the listener stays put.
  const keys = useRef({ visible, selected, select, resolveAndNext });
  useEffect(() => {
    keys.current = { visible, selected, select, resolveAndNext };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shortcutsBlocked(event)) return;
      const current = keys.current;
      const key = event.key.toLowerCase();
      if (key === 'j') current.select(neighbour(current.visible, current.selected?.id, 1));
      else if (key === 'k') current.select(neighbour(current.visible, current.selected?.id, -1));
      else if (key === 'e') current.resolveAndNext();
      else if (key === 'r' && composerRef.current) {
        event.preventDefault();
        composerRef.current.focus();
      } else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const unknown = t('customer.unknown');
  const customer = selected ? customers?.get(selected.user_id) : undefined;
  const name = displayName(customer, unknown);
  const history = selected
    ? tickets
        .filter((ticket) => ticket.user_id === selected.user_id && ticket.id !== selected.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    : [];

  return (
    <>
      <TicketList
        filter={filter}
        tickets={visible}
        counts={counts}
        openTotal={openTotal}
        customers={customers}
        selectedId={selected?.id}
        state={inbox.status}
        onRetry={() => void inbox.refetch()}
        onSelect={select}
        onStatus={(status: TicketStatus) =>
          update({ status: status === 'open' ? undefined : status, ticket: undefined })
        }
        onKind={(kind: KindFilter) =>
          update({ kind: kind === 'all' ? undefined : kind, ticket: undefined })
        }
        onQuery={(q) => update({ q: q || undefined, ticket: undefined }, true)}
      />
      {selected ? (
        <>
          <Conversation
            ticket={selected}
            name={name}
            initials={initials(name)}
            language={customer?.language ?? null}
            composerRef={composerRef}
          />
          <CustomerPanel
            ticket={selected}
            customer={customer}
            name={name}
            initials={initials(name)}
            history={history}
            onOpen={openElsewhere}
          />
        </>
      ) : (
        <NoConversation />
      )}
    </>
  );
}

import { useTranslation } from 'react-i18next';

import type { CustomerMap } from '@/shared/data/customers';
import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { cn } from '@/shared/lib/cn';
import { displayName } from '@/shared/lib/people';
import { StatusIcon } from '@/shared/ui/status-icon';

import type { InboxFilter, KindFilter } from '../lib/filter';
import { STATUSES } from '../lib/status';
import { TicketRow } from './ticket-row';

const KINDS: readonly KindFilter[] = ['all', 'bug', 'idea'];

export interface TicketListProps {
  filter: InboxFilter;
  tickets: readonly InboxRow[];
  counts: Record<TicketStatus, number>;
  openTotal: number;
  customers: CustomerMap | undefined;
  selectedId: string | undefined;
  state: 'pending' | 'error' | 'success';
  onRetry: () => void;
  onSelect: (ticket: InboxRow) => void;
  onStatus: (status: TicketStatus) => void;
  onKind: (kind: KindFilter) => void;
  onQuery: (q: string) => void;
}

/** The inbox's left column: title, search, status chips, type filter, tickets, shortcuts. */
export function TicketList({
  filter,
  tickets,
  counts,
  openTotal,
  customers,
  selectedId,
  state,
  onRetry,
  onSelect,
  onStatus,
  onKind,
  onQuery,
}: TicketListProps) {
  const { t } = useTranslation();
  const unknown = t('customer.unknown');

  return (
    <section className="flex min-h-0 w-[300px] shrink-0 flex-col overflow-hidden rounded-panel bg-panel">
      <div className="flex flex-col gap-3.5 px-5 pt-[22px] pb-3.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[22px] font-semibold">{t('inbox.title')}</h1>
          <span className="shrink-0 text-[13px] whitespace-nowrap text-muted">
            {t('inbox.openCount', { count: openTotal })}
          </span>
        </div>
        <input
          type="search"
          value={filter.q}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t('inbox.search')}
          aria-label={t('inbox.search')}
          className="h-[38px] rounded-xl bg-field px-3.5 text-[13px] text-ink outline-none placeholder:text-muted focus:shadow-[inset_0_0_0_1.5px_var(--color-ring)]"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('inbox.title')}>
          {STATUSES.map((status) => {
            const active = filter.status === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => onStatus(status)}
                className={cn(
                  'flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold whitespace-nowrap',
                  active
                    ? 'bg-ink text-white [--status-cutout:var(--color-ink)]'
                    : 'bg-field text-ink-3 [--status-cutout:var(--color-field)] hover:bg-chip',
                )}
              >
                <StatusIcon status={status} inChip />
                {t(`status.${status}`)}
                <span className="opacity-60">{counts[status]}</span>
              </button>
            );
          })}
          {/* The type filter takes the chip rows' last line, as tall as a chip. */}
          <div className="flex basis-full gap-1">
            {KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={filter.kind === kind}
                onClick={() => onKind(kind)}
                className={cn(
                  'h-[30px] rounded-full px-2.5 text-[12px] font-semibold',
                  filter.kind === kind ? 'bg-chip text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {t(`inbox.kinds.${kind}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pb-4">
        {state === 'pending' ? (
          <p className="px-5 py-15 text-center text-[13px] text-muted">{t('inbox.loading')}</p>
        ) : null}
        {state === 'error' ? (
          <div className="flex flex-col items-center gap-3 px-5 py-15 text-center text-[13px] text-muted">
            {t('inbox.loadFailed')}
            <button
              type="button"
              onClick={onRetry}
              className="h-[30px] rounded-full bg-chip px-3 text-[12px] font-semibold text-ink hover:bg-chip-hover"
            >
              {t('inbox.retry')}
            </button>
          </div>
        ) : null}
        {state === 'success' && !tickets.length ? (
          <p className="px-5 py-15 text-center text-[13px] text-muted">{t('inbox.empty')}</p>
        ) : null}
        {tickets.map((ticket) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            name={displayName(customers?.get(ticket.user_id), unknown)}
            selected={ticket.id === selectedId}
            onSelect={() => onSelect(ticket)}
          />
        ))}
      </div>
      <div className="flex gap-3.5 px-5 pt-3 pb-4 text-[11px] text-subtle">
        <span>{t('inbox.shortcuts.navigate')}</span>
        <span>{t('inbox.shortcuts.resolve')}</span>
        <span>{t('inbox.shortcuts.reply')}</span>
      </div>
    </section>
  );
}

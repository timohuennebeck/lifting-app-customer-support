import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCustomers } from '@/shared/data/customers';
import { useInbox } from '@/shared/data/tickets';
import { formatListTime } from '@/shared/lib/format';
import { displayName, initials } from '@/shared/lib/people';
import { Avatar } from '@/shared/ui/avatar';

import { matchesCustomer, summarize } from '../lib/summaries';

const route = getRouteApi('/_desk/customers');

const GRID =
  'grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.6fr)_90px_140px] items-center gap-4';

/** Everyone who wrote in, with their device, number of requests and last contact. */
export function CustomersScreen() {
  const { t, i18n } = useTranslation();
  const { q = '' } = route.useSearch();
  const setSearch = route.useNavigate();
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const inbox = useInbox();
  const unknown = t('customer.unknown');

  const all = useMemo(() => summarize(customers, inbox.data ?? []), [customers, inbox.data]);
  const rows = useMemo(
    () =>
      all
        .map((summary) => ({ ...summary, name: displayName(summary.customer, unknown) }))
        .filter((row) => matchesCustomer(row.name, row.customer?.email, q)),
    [all, unknown, q],
  );

  const device = (row: (typeof rows)[number]) => {
    const { device_model: model, platform, os_version: os } = row.latest;
    const system = platform ? [t(`platform.${platform}`), os].filter(Boolean).join(' ') : null;
    return [model, system].filter(Boolean).join(' · ') || '—';
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-panel bg-panel">
      <header className="flex items-center gap-4 px-7 pt-[22px] pb-4">
        <h1 className="text-[22px] font-semibold">{t('customers.title')}</h1>
        <span className="text-[13px] text-muted">
          {t('customers.count', { count: all.length })}
        </span>
        <div className="flex-1" />
        <input
          type="search"
          value={q}
          onChange={(e) =>
            void setSearch({ search: { q: e.target.value || undefined }, replace: true })
          }
          placeholder={t('customers.search')}
          aria-label={t('customers.search')}
          className="h-[38px] w-[280px] rounded-xl bg-field px-3.5 text-[13px] text-ink outline-none placeholder:text-muted focus:shadow-[inset_0_0_0_1.5px_var(--color-ring)]"
        />
      </header>
      <div
        aria-hidden
        className={`${GRID} px-10 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase`}
      >
        <span>{t('customers.columns.name')}</span>
        <span>{t('customers.columns.email')}</span>
        <span>{t('customers.columns.device')}</span>
        <span>{t('customers.columns.requests')}</span>
        <span>{t('customers.columns.lastContact')}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-4 pt-1.5 pb-5">
        {inbox.status === 'pending' ? (
          <p className="px-5 py-15 text-center text-[13px] text-muted">{t('inbox.loading')}</p>
        ) : null}
        {inbox.status === 'success' && !rows.length ? (
          <p className="px-5 py-15 text-center text-[13px] text-muted">{t('customers.empty')}</p>
        ) : null}
        {rows.map((row) => (
          <button
            key={row.userId}
            type="button"
            onClick={() =>
              void navigate({
                to: '/inbox',
                search: {
                  status: row.latest.status === 'open' ? undefined : row.latest.status,
                  ticket: row.latest.number,
                },
              })
            }
            className={`${GRID} rounded-[14px] px-6 py-3 text-left text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ink`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar initials={initials(row.name)} size="sm" />
              <span className="truncate font-semibold">{row.name}</span>
            </span>
            <span className="truncate text-ink-3">{row.customer?.email ?? '—'}</span>
            <span className="truncate text-ink-3">{device(row)}</span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold">{row.count}</span>
              {row.hasOpen ? <span className="size-[7px] rounded-full bg-ink" /> : null}
            </span>
            <span className="text-muted">{formatListTime(row.lastContact, i18n.language)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

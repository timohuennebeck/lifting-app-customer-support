import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { CustomerRow, InboxRow } from '@/shared/data/database.types';
import { formatDate } from '@/shared/lib/format';
import { copyText } from '@/shared/lib/toast';
import { Avatar } from '@/shared/ui/avatar';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[22px] items-center justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right font-semibold [overflow-wrap:anywhere]">{children}</span>
    </div>
  );
}

const PROVIDERS = ['apple', 'google', 'email', 'anonymous'] as const;

export interface CustomerPanelProps {
  ticket: InboxRow;
  customer: CustomerRow | undefined;
  name: string;
  initials: string;
}

/** The right column: who wrote, their account, and the phone the ticket came from. */
export function CustomerPanel({ ticket, customer, name, initials }: CustomerPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const failed = t('toast.error');
  const provider = PROVIDERS.find((p) => p === customer?.provider);
  const system =
    ticket.platform && ticket.os_version
      ? `${t(`platform.${ticket.platform}`)} ${ticket.os_version}`
      : ticket.platform
        ? t(`platform.${ticket.platform}`)
        : null;
  const hasDevice = !!(ticket.device_model || system || ticket.app_version);

  return (
    <aside className="flex w-[324px] shrink-0 flex-col gap-[26px] overflow-y-auto rounded-panel bg-panel px-[22px] py-6">
      <div className="flex flex-col items-start gap-3">
        <Avatar initials={initials} size="lg" />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <div className="text-[17px] font-semibold">{name}</div>
          {customer?.email ? (
            <div className="text-[13px] break-all text-muted">{customer.email}</div>
          ) : null}
        </div>
        {customer?.email ? (
          <button
            type="button"
            onClick={() => void copyText(customer.email ?? '', t('toast.copied'), failed)}
            className="flex h-[30px] items-center rounded-full bg-chip px-3 text-[12px] font-semibold hover:bg-chip-hover"
          >
            {t('customer.copyEmail')}
          </button>
        ) : null}
      </div>

      <Section title={t('customer.account')}>
        <Row label={t('customer.signIn')}>
          {provider ? t(`customer.providers.${provider}`) : (customer?.provider ?? '—')}
        </Row>
        <Row label={t('customer.userId')}>
          <button
            type="button"
            title={ticket.user_id}
            onClick={() => void copyText(ticket.user_id, t('toast.userIdCopied'), failed)}
            className="font-mono font-semibold hover:underline"
          >
            {`${ticket.user_id.slice(0, 8)}…`}
          </button>
        </Row>
        <Row label={t('customer.signedUp')}>
          {customer ? formatDate(customer.signed_up_at, locale) : '—'}
        </Row>
        <Row label={t('customer.lastActive')}>
          {customer?.last_active_at ? formatDate(customer.last_active_at, locale) : '—'}
        </Row>
      </Section>

      <Section title={t('customer.device')}>
        {hasDevice ? (
          <>
            <Row label={t('customer.model')}>{ticket.device_model ?? '—'}</Row>
            <Row label={t('customer.system')}>{system ?? '—'}</Row>
            <Row label={t('customer.appVersion')}>{ticket.app_version ?? '—'}</Row>
          </>
        ) : (
          <p className="text-[13px] text-muted">{t('customer.noDevice')}</p>
        )}
      </Section>
    </aside>
  );
}

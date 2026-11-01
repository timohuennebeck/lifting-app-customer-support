import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { InboxRow } from '@/shared/data/database.types';
import { cn } from '@/shared/lib/cn';
import { formatListTime } from '@/shared/lib/format';
import { Pill } from '@/shared/ui/pill';
import { StatusIcon } from '@/shared/ui/status-icon';

export interface TicketRowProps {
  ticket: InboxRow;
  name: string;
  selected: boolean;
  onSelect: () => void;
}

/** A ticket in the list: sender, time, subject, the last message and its type and platform. */
export function TicketRow({ ticket, name, selected, onSelect }: TicketRowProps) {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  // J/K can select a ticket outside the visible part of the list.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const preview = ticket.last_preview ?? '';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected || undefined}
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-[14px] p-3 text-left outline-none hover:bg-field focus-visible:ring-2 focus-visible:ring-ink',
        selected && 'bg-selected',
      )}
    >
      <span className="flex w-full items-center gap-2">
        <StatusIcon status={ticket.status} className="text-ink" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[14px]',
            ticket.unread ? 'font-bold' : 'font-semibold',
          )}
        >
          {name}
        </span>
        <span className="shrink-0 text-[12px] text-muted">
          {formatListTime(ticket.last_activity_at, i18n.language)}
        </span>
      </span>
      <span className="w-full truncate pl-[15px] text-[13px] font-semibold text-ink-2">
        {ticket.subject}
      </span>
      {preview ? (
        <span className="line-clamp-2 w-full pl-[15px] text-[13px] leading-[1.4] [overflow-wrap:anywhere] text-muted">
          {preview}
        </span>
      ) : null}
      <span className="flex gap-1.5 pt-0.5 pl-[15px]">
        <Pill>
          {ticket.kind === 'idea' && ticket.priority
            ? `${t('kind.idea')} · ${ticket.priority}/5`
            : t(`kind.${ticket.kind}`)}
        </Pill>
        {ticket.platform ? <Pill>{t(`platform.${ticket.platform}`)}</Pill> : null}
      </span>
    </button>
  );
}

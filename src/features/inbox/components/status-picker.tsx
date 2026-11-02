import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/lib/toast';
import { menuSurface } from '@/shared/ui/menu';
import { StatusIcon } from '@/shared/ui/status-icon';

import { useSetStatus } from '../data/mutations';
import { STATUSES } from '../lib/status';

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The ticket's status, and the menu that changes it: open or closed. Anything more the user
 * should know goes into a reply, which reaches them in their language.
 */
export function StatusPicker({ ticket }: { ticket: InboxRow }) {
  const { t } = useTranslation();
  const setStatus = useSetStatus();
  const [open, setOpen] = useState(false);

  const apply = (status: TicketStatus) => {
    setOpen(false);
    // The same status again would only add a repeated line to the chat.
    if (status === ticket.status) return;
    setStatus.mutate(
      { ticket, status },
      {
        onSuccess: () => toast(t('toast.status', { status: t(`status.${status}`) })),
        onError: () => toast(t('toast.error')),
      },
    );
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-field px-3 text-[13px] font-semibold whitespace-nowrap outline-none hover:bg-chip focus-visible:ring-2 focus-visible:ring-ink">
        <StatusIcon status={ticket.status} size={14} className="text-ink" />
        {t(`status.${ticket.status}`)}
        <span className="text-muted">
          <Chevron />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className={cn(menuSurface, 'w-[272px]')}>
          <ul className="flex flex-col gap-0.5">
            {STATUSES.map((status) => (
              <li key={status}>
                <button
                  type="button"
                  onClick={() => apply(status)}
                  aria-current={status === ticket.status || undefined}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-[9px] text-left outline-none hover:bg-field focus-visible:bg-field',
                    status === ticket.status && 'bg-field',
                  )}
                >
                  <span className="flex pt-px">
                    <StatusIcon status={status} size={14} className="text-ink" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold">{t(`status.${status}`)}</span>
                    <span className="text-[12px] leading-[1.35] text-muted">
                      {t(`statusHint.${status}`)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

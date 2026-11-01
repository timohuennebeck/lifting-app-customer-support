import * as Popover from '@radix-ui/react-popover';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InboxRow, TicketStatus } from '@/shared/data/database.types';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/lib/toast';
import { menuSurface } from '@/shared/ui/menu';
import { StatusIcon } from '@/shared/ui/status-icon';

import { useSetStatus } from '../data/mutations';
import { isActive, shownStatus, STATUSES, takesVersion, VERSION_MAX } from '../lib/status';

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
 * The ticket's status as the user sees it, and the menu that changes it. Planned and resolved
 * take an optional version, which the app turns into "Coming in / Live in update 1.4.3".
 */
export function StatusPicker({ ticket }: { ticket: InboxRow }) {
  const { t } = useTranslation();
  const setStatus = useSetStatus();
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<TicketStatus | null>(null);
  const [version, setVersion] = useState('');

  const label = (status: TicketStatus) => t(`statusShown.${shownStatus(ticket.kind, status)}`);

  const reset = (next: boolean) => {
    setOpen(next);
    setChosen(null);
    setVersion('');
  };

  const apply = (status: TicketStatus, withVersion?: string) => {
    reset(false);
    // The same status again without a version would only add a repeated line to the chat.
    if (status === ticket.status && !withVersion?.trim()) return;
    setStatus.mutate(
      { ticket, status, version: withVersion },
      {
        onSuccess: () => toast(t('toast.status', { status: label(status) })),
        onError: () => toast(t('toast.error')),
      },
    );
  };

  const pick = (status: TicketStatus) => {
    if (takesVersion(status)) setChosen(status);
    else apply(status);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (chosen) apply(chosen, version);
  };

  const preview =
    chosen && version.trim()
      ? t(isActive(chosen) ? 'thread.comingIn' : 'thread.liveIn', { version: version.trim() })
      : null;

  return (
    <Popover.Root open={open} onOpenChange={reset}>
      <Popover.Trigger className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-field px-3 text-[13px] font-semibold whitespace-nowrap outline-none hover:bg-chip focus-visible:ring-2 focus-visible:ring-ink">
        <StatusIcon status={ticket.status} size={14} className="text-ink" />
        {label(ticket.status)}
        <span className="text-muted">
          <Chevron />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className={cn(menuSurface, 'w-[280px]')}>
          {chosen ? (
            <form onSubmit={submit} className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <StatusIcon status={chosen} size={14} className="text-ink" />
                {label(chosen)}
              </div>
              <label className="flex flex-col gap-1.5 text-xs text-muted">
                {t('statusPicker.version')}
                <input
                  autoFocus
                  value={version}
                  maxLength={VERSION_MAX}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder={t('statusPicker.versionPlaceholder')}
                  className="h-10 rounded-xl bg-field px-3 font-mono text-[13px] text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_var(--color-ring)]"
                />
              </label>
              {preview ? (
                <p className="text-xs leading-[1.4] text-muted">
                  {t('statusPicker.preview')} <span className="text-ink">{preview}</span>
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChosen(null)}
                  className="h-9 rounded-full bg-field px-4 text-[13px] font-semibold hover:bg-chip"
                >
                  {t('statusPicker.back')}
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-full bg-ink px-4 text-[13px] font-semibold text-white active:scale-[0.97]"
                >
                  {t('statusPicker.apply')}
                </button>
              </div>
            </form>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {STATUSES.map((status) => (
                <li key={status}>
                  <button
                    type="button"
                    onClick={() => pick(status)}
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
                      <span className="text-[13px] font-semibold">{label(status)}</span>
                      <span className="text-xs leading-[1.35] text-muted">
                        {status === 'resolved'
                          ? t('statusHint.resolved', { label: label(status) })
                          : t(`statusHint.${status}`)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import type { InboxRow } from '@/shared/data/database.types';

import { Composer } from './composer';
import { StatusPicker } from './status-picker';
import { ThreadView } from './thread-view';

export interface ConversationProps {
  ticket: InboxRow;
  name: string;
  initials: string;
  /** The customer's app language (en, de, …); replies go out in it. */
  language: string | null;
  composerRef?: Ref<HTMLTextAreaElement>;
}

/** The middle column: subject and status, the conversation, and the reply box. */
export function Conversation({ ticket, name, initials, language, composerRef }: ConversationProps) {
  const { t, i18n } = useTranslation();
  const meta = [
    `#${ticket.number}`,
    ticket.kind === 'idea' && ticket.priority
      ? `${t('kind.idea')} · ${t('importance', { value: ticket.priority })}`
      : t(`kind.${ticket.kind}`),
    ticket.platform ? t(`platform.${ticket.platform}`) : null,
    name,
  ].filter(Boolean);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-panel bg-panel">
      <header className="flex items-start gap-2.5 px-7 pt-5 pb-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-[19px] font-semibold">{ticket.subject}</h2>
          <p className="text-[13px] text-muted">{meta.join(' · ')}</p>
        </div>
        <StatusPicker ticket={ticket} />
      </header>
      <ThreadView key={`thread-${ticket.id}`} ticket={ticket} sender={{ name, initials }} />
      <Composer
        key={`composer-${ticket.id}`}
        ticket={ticket}
        name={i18n.language === 'ko' ? name : (name.split(' ')[0] ?? name)}
        language={language}
        inputRef={composerRef}
      />
    </section>
  );
}

/** The middle column before a ticket is chosen, or when a view is empty. */
export function NoConversation() {
  const { t } = useTranslation();
  return (
    <section className="flex min-w-0 flex-1 items-center justify-center rounded-panel bg-panel text-[13px] text-muted">
      {t('inbox.noTicket')}
    </section>
  );
}

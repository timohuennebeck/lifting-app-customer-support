import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { EventRow, InboxRow, MessageRow } from '@/shared/data/database.types';
import { formatMessageTime } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { StatusIcon } from '@/shared/ui/status-icon';

import { useThread } from '../data/thread';
import { isActive, shownStatus } from '../lib/status';
import { buildTimeline } from '../lib/timeline';
import { Attachments } from './attachments';

interface Sender {
  name: string;
  initials: string;
}

function Message({ message, sender }: { message: MessageRow; sender: Sender }) {
  const { t, i18n } = useTranslation();
  const time = formatMessageTime(message.created_at, i18n.language);
  const fromTeam = message.author === 'team';
  const meta = (
    <div className="text-[12px] text-muted">
      <span className="font-semibold text-ink">{fromTeam ? t('thread.team') : sender.name}</span>
      {` · ${time}`}
    </div>
  );
  const bubble = (
    <div
      className={
        fromTeam
          ? 'rounded-[18px] bg-ink px-4 py-3 text-[14px] leading-normal [overflow-wrap:anywhere] whitespace-pre-wrap text-white'
          : 'rounded-[18px] bg-field px-4 py-3 text-[14px] leading-normal [overflow-wrap:anywhere] whitespace-pre-wrap'
      }
    >
      {message.content}
    </div>
  );
  const attachments = message.attachments.length ? (
    <Attachments paths={message.attachments} align={fromTeam ? 'end' : 'start'} />
  ) : null;

  if (fromTeam) {
    return (
      <div className="flex max-w-[640px] flex-col items-end gap-1.5 self-end">
        {meta}
        {message.content ? bubble : null}
        {attachments}
      </div>
    );
  }
  return (
    <div className="flex max-w-[640px] gap-3">
      <Avatar initials={sender.initials} />
      <div className="flex min-w-0 flex-col gap-1.5">
        {meta}
        {message.content ? bubble : null}
        {attachments}
      </div>
    </div>
  );
}

/** A status change or reopen as a quiet line, worded like the app words it to the user. */
function EventLine({
  event,
  ticket,
  sender,
}: {
  event: EventRow;
  ticket: InboxRow;
  sender: Sender;
}) {
  const { t, i18n } = useTranslation();
  const time = formatMessageTime(event.created_at, i18n.language);
  const status = event.kind === 'reopened' ? 'open' : (event.status ?? 'open');
  let text: string;
  if (event.kind === 'reopened') {
    text = t('thread.reopened', { name: sender.name });
  } else {
    const line = t('thread.statusLine', {
      status: t(`statusShown.${shownStatus(ticket.kind, status)}`),
    });
    const detail = event.version
      ? t(isActive(status) ? 'thread.comingIn' : 'thread.liveIn', { version: event.version })
      : event.note;
    text = detail ? `${line} · ${detail}` : line;
  }
  return (
    <div className="flex items-center justify-center gap-2 text-[12px] text-muted">
      <StatusIcon status={status} className="text-muted" />
      <span>
        <span className="font-semibold text-ink-3">{text}</span>
        {` · ${time}`}
      </span>
    </div>
  );
}

export interface ThreadViewProps {
  ticket: InboxRow;
  sender: Sender;
}

/**
 * The conversation: the user's messages on the left, the team's on the right, status lines in
 * between. Opens at the end and stays there while it is read there (also as screenshots load).
 */
export function ThreadView({ ticket, sender }: ThreadViewProps) {
  const { t } = useTranslation();
  const { data, isError } = useThread(ticket.id);
  const items = useMemo(() => (data ? buildTimeline(data.messages, data.events) : []), [data]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const atEnd = useRef(true);

  useLayoutEffect(() => {
    atEnd.current = true;
  }, [ticket.id]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && atEnd.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const observer = new ResizeObserver(() => {
      if (atEnd.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      }}
      className="min-h-0 flex-1 overflow-y-auto p-7"
    >
      <div ref={contentRef} className="flex flex-col gap-[22px]">
        {isError ? (
          <p className="py-10 text-center text-[13px] text-muted">{t('thread.loadFailed')}</p>
        ) : null}
        {items.map((item) =>
          item.type === 'message' ? (
            <Message key={item.key} message={item.message} sender={sender} />
          ) : (
            <EventLine key={item.key} event={item.event} ticket={ticket} sender={sender} />
          ),
        )}
      </div>
    </div>
  );
}

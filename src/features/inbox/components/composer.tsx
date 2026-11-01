import { type Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InboxRow } from '@/shared/data/database.types';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/lib/toast';

import { MESSAGE_MAX, useSendReply } from '../data/mutations';
import { getDraft, setDraft } from '../lib/drafts';

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent);

export interface ComposerProps {
  ticket: InboxRow;
  /** The customer's name and app language, for the placeholder. */
  name: string;
  language: string | null;
  inputRef?: Ref<HTMLTextAreaElement>;
}

/** The reply box: ⌘↵ (Ctrl+↵) or the button sends; the draft survives switching tickets. */
export function Composer({ ticket, name, language, inputRef }: ComposerProps) {
  const { t } = useTranslation();
  const send = useSendReply();
  const [text, setText] = useState(() => getDraft(ticket.id));
  const content = text.trim();
  const over = text.length - MESSAGE_MAX;
  const canSend = !!content && over <= 0 && !send.isPending;

  const update = (value: string) => {
    setText(value);
    setDraft(ticket.id, value);
  };

  const submit = () => {
    if (!canSend) return;
    send.mutate(
      { ticket, content },
      {
        onSuccess: () => {
          update('');
          toast(t('toast.sent'));
        },
        onError: () => toast(t('toast.error')),
      },
    );
  };

  return (
    <div className="px-7 pb-[22px]">
      <div className="flex flex-col rounded-[18px] bg-hover shadow-[inset_0_0_0_1px_var(--color-line)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-ring)]">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            language
              ? t('composer.placeholder', { name, language })
              : t('composer.placeholderNoLanguage', { name })
          }
          aria-label={t('composer.placeholderNoLanguage', { name })}
          rows={3}
          className="[field-sizing:content] max-h-[40vh] min-h-[84px] resize-none bg-transparent px-4 pt-3.5 pb-2.5 text-sm leading-normal text-ink outline-none placeholder:text-muted"
        />
        <div className="flex items-center gap-1.5 px-3 pb-3">
          {over > 0 ? (
            <span className="pl-1 text-xs font-semibold text-ink">
              {t('composer.tooLong', { count: over })}
            </span>
          ) : null}
          <div className="flex-1" />
          <span className="text-xs whitespace-nowrap text-subtle">{IS_MAC ? '⌘ ↵' : 'Ctrl ↵'}</span>
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            className={cn(
              'ml-1.5 flex h-[34px] shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap text-white active:scale-[0.97]',
              canSend ? 'bg-ink' : 'bg-disabled',
            )}
          >
            {send.isPending ? t('composer.sending') : t('composer.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

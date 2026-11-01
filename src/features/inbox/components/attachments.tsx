import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAttachmentUrls } from '../data/attachments';

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <rect
        x="1.5"
        y="1.5"
        width="11"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="5" cy="5.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

interface LightboxProps {
  urls: readonly string[];
  index: number | null;
  onIndex: (index: number | null) => void;
}

/** A screenshot over the desk; a click or Esc closes it, ← and → go through the message's others. */
function Lightbox({ urls, index, onIndex }: LightboxProps) {
  const { t } = useTranslation();
  const url = index === null ? undefined : urls[index];
  const step = (by: number) => {
    if (index !== null && urls.length > 1) onIndex((index + by + urls.length) % urls.length);
  };

  return (
    <Dialog.Root open={!!url} onOpenChange={(open) => !open && onIndex(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(20,20,20,0.45)]" />
        <Dialog.Content
          aria-describedby={undefined}
          onClick={() => onIndex(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-6 outline-none"
        >
          <Dialog.Title className="sr-only">
            {t('thread.screenshot', { index: (index ?? 0) + 1 })}
          </Dialog.Title>
          {url ? (
            <img
              src={url}
              alt={t('thread.screenshot', { index: (index ?? 0) + 1 })}
              className="max-h-[85vh] max-w-[90vw] rounded-panel bg-hover object-contain"
            />
          ) : null}
          <p className="text-[13px] text-white/85">{t('thread.closeHint')}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A message's screenshots as tiles; the app may still be uploading some. */
export function Attachments({
  paths,
  align,
}: {
  paths: readonly string[];
  align: 'start' | 'end';
}) {
  const { t } = useTranslation();
  const { data: urls, isPending } = useAttachmentUrls(paths);
  const [index, setIndex] = useState<number | null>(null);
  const loaded = paths.map((path) => urls?.get(path) ?? null);
  const ready = loaded.filter((url): url is string => !!url);

  return (
    <div className={align === 'end' ? 'flex flex-wrap justify-end gap-2' : 'flex flex-wrap gap-2'}>
      {paths.map((path, i) => {
        const url = loaded[i];
        const name = t('thread.screenshot', { index: i + 1 });
        if (isPending) {
          return <div key={path} className="h-24 w-16 animate-pulse rounded-xl bg-field" />;
        }
        if (!url) {
          return (
            <div
              key={path}
              className="flex h-[34px] items-center gap-2 rounded-full bg-hover px-3 text-xs font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-avatar)]"
            >
              <ImageIcon />
              {`${name} · ${t('thread.uploading')}`}
            </div>
          );
        }
        return (
          <button
            key={path}
            type="button"
            onClick={() => setIndex(ready.indexOf(url))}
            className="h-24 overflow-hidden rounded-xl bg-field shadow-[inset_0_0_0_1px_var(--color-avatar)] outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ink"
          >
            <img
              src={url}
              alt={name}
              loading="lazy"
              className="h-full w-auto max-w-[180px] object-cover"
            />
          </button>
        );
      })}
      <Lightbox urls={ready} index={index} onIndex={setIndex} />
    </div>
  );
}

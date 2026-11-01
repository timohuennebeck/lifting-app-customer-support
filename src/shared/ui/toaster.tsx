import { useSyncExternalStore } from 'react';

import { currentToast, subscribeToast } from '../lib/toast';

/** Shows the current toast; the live region stays mounted so screen readers announce it. */
export function Toaster() {
  const message = useSyncExternalStore(subscribeToast, currentToast);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none">
      {message ? (
        <div
          key={message.id}
          className="fixed bottom-7 left-1/2 z-60 flex h-10 -translate-x-1/2 items-center rounded-full bg-ink px-[18px] text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        >
          {message.text}
        </div>
      ) : null}
    </div>
  );
}

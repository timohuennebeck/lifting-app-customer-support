import { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
};

/** Whether this tab is in front, so nothing counts as read while nobody looks. */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, () => document.visibilityState === 'visible');
}

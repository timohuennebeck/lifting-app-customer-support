// One short message at a time at the bottom of the screen ("Antwort gesendet").

export interface ToastMessage {
  id: number;
  text: string;
}

const SHOW_MS = 2200;

let current: ToastMessage | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function toast(text: string) {
  current = { id: Date.now(), text };
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, SHOW_MS);
}

export function subscribeToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const currentToast = () => current;

/** Copies text and confirms it with a toast. */
export async function copyText(text: string, confirmation: string, failure: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(confirmation);
  } catch {
    toast(failure);
  }
}

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Calendar days from `then` to `now`: 0 today, 1 yesterday. */
export function calendarDaysBetween(then: Date, now: Date) {
  return Math.round((startOfDay(now).getTime() - startOfDay(then).getTime()) / DAY_MS);
}

const capitalize = (text: string, locale: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

const time = (date: Date, locale: string) =>
  date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

const yesterday = (locale: string) =>
  capitalize(new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day'), locale);

const dayAndMonth = (date: Date, now: Date, locale: string) =>
  date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });

/** A list's time stamp: "14:02" today, "Gestern", a weekday this week, else the date. */
export function formatListTime(iso: string, locale: string, now = new Date()) {
  const date = new Date(iso);
  const days = calendarDaysBetween(date, now);
  if (days <= 0) return time(date, locale);
  if (days === 1) return yesterday(locale);
  if (days < 7) return capitalize(date.toLocaleDateString(locale, { weekday: 'short' }), locale);
  return dayAndMonth(date, now, locale);
}

/** A message's time stamp: "14:02" today, "Gestern, 14:02", else "3. Okt., 14:02". */
export function formatMessageTime(iso: string, locale: string, now = new Date()) {
  const date = new Date(iso);
  const days = calendarDaysBetween(date, now);
  if (days <= 0) return time(date, locale);
  const day = days === 1 ? yesterday(locale) : dayAndMonth(date, now, locale);
  return `${day}, ${time(date, locale)}`;
}

/** A date without time: "14. März 2025", "Mar 14, 2025". */
export function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** A language code's name in the desk's language: "de" → "Deutsch", "Koreanisch", … */
export function languageName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

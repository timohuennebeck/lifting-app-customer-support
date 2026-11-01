import { describe, expect, it } from 'vitest';

import {
  calendarDaysBetween,
  formatListTime,
  formatMessageTime,
  formatRelative,
  languageName,
} from './format';

// Local times, so the tests hold in any time zone.
const now = new Date(2026, 10, 1, 15, 30); // Sun 1 Nov 2026, 15:30
const at = (...args: [number, number, number, number, number]) => new Date(...args).toISOString();

describe('calendarDaysBetween', () => {
  it('counts calendar days, not 24-hour spans', () => {
    expect(calendarDaysBetween(new Date(2026, 9, 31, 23, 59), now)).toBe(1);
    expect(calendarDaysBetween(new Date(2026, 10, 1, 0, 1), now)).toBe(0);
  });
});

describe('formatListTime', () => {
  it('shows the time today, "Gestern" yesterday, a weekday this week, else the date', () => {
    expect(formatListTime(at(2026, 10, 1, 9, 12), 'de', now)).toBe('09:12');
    expect(formatListTime(at(2026, 9, 31, 9, 12), 'de', now)).toBe('Gestern');
    expect(formatListTime(at(2026, 9, 31, 9, 12), 'en', now)).toBe('Yesterday');
    // The weekday's abbreviation depends on the ICU data ("Mi" or "Mi.").
    expect(formatListTime(at(2026, 9, 28, 9, 12), 'de', now)).toMatch(/^Mi\.?$/);
    expect(formatListTime(at(2026, 8, 3, 9, 12), 'de', now)).toBe('3. Sept.');
    expect(formatListTime(at(2025, 8, 3, 9, 12), 'de', now)).toBe('3. Sept. 2025');
  });
});

describe('formatMessageTime', () => {
  it('adds the day before the time once it is not today', () => {
    expect(formatMessageTime(at(2026, 10, 1, 9, 12), 'de', now)).toBe('09:12');
    expect(formatMessageTime(at(2026, 9, 31, 21, 30), 'de', now)).toBe('Gestern, 21:30');
  });
});

describe('formatRelative', () => {
  it('says how long ago, then falls back to a date', () => {
    expect(formatRelative(at(2026, 10, 1, 15, 22), 'en', now)).toBe('8 minutes ago');
    expect(formatRelative(at(2026, 10, 1, 12, 30), 'de', now)).toBe('Vor 3 Stunden');
    expect(formatRelative(at(2026, 9, 29, 12, 0), 'en', now)).toBe('3 days ago');
    expect(formatRelative(at(2026, 5, 1, 12, 0), 'en', now)).toBe('Jun 1, 2026');
  });
});

describe('languageName', () => {
  it('names the app language in the desk language', () => {
    expect(languageName('de', 'de')).toBe('Deutsch');
    expect(languageName('ko', 'en')).toBe('Korean');
    expect(languageName('pt-BR', 'de')).toBe('Portugiesisch (Brasilien)');
  });
});

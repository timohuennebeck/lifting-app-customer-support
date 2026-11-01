import type { CustomerRow } from '../data/database.types';

/** What the desk calls a customer: the first name, else the email's local part. */
export function displayName(customer: CustomerRow | undefined, fallback: string): string {
  const first = customer?.first_name?.trim();
  if (first) return first;
  const local = customer?.email?.split('@')[0]?.trim();
  return local || fallback;
}

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;

/**
 * Up to two letters for an avatar: the first letters of two words ("Emily Carter" → "EC"), one
 * letter of a single word, or the last two syllables of a Korean name ("김하린" → "하린").
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first, second] = words;
  if (!first) return '?';
  if (HANGUL.test(first)) {
    const syllables = Array.from(first);
    return syllables.length > 2 ? syllables.slice(-2).join('') : first;
  }
  const letter = (word: string) => Array.from(word)[0] ?? '';
  return (letter(first) + (second ? letter(second) : '')).toLocaleUpperCase();
}

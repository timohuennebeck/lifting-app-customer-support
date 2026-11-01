/** The app's languages, which the desk speaks too; `short` labels the switcher. */
export const LANGUAGES = [
  { code: 'de', short: 'DE', name: 'Deutsch' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'ko', short: 'KO', name: '한국어' },
  { code: 'pt-PT', short: 'PT', name: 'Português' },
  { code: 'pt-BR', short: 'BR', name: 'Português (Brasil)' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const isLanguage = (value: unknown): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);

/** A browser language tag as one of ours: "pt-BR" stays, other Portuguese is pt-PT. */
export function matchLanguage(tag: string): LanguageCode | null {
  if (isLanguage(tag)) return tag;
  const [base, region] = tag.split('-');
  if (base === 'pt') return region?.toUpperCase() === 'BR' ? 'pt-BR' : 'pt-PT';
  return isLanguage(base) ? base : null;
}

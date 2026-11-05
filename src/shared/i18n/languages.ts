/** The app's languages, which the desk speaks too; `short` labels the switcher. */
export const LANGUAGES = [
  { code: 'ko', short: 'KO', name: '한국어' },
  { code: 'de', short: 'DE', name: 'Deutsch' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'pt-PT', short: 'PT', name: 'Português' },
  { code: 'pt-BR', short: 'BR', name: 'Português (Brasil)' },
  { code: 'es', short: 'ES', name: 'Español' },
  { code: 'fr', short: 'FR', name: 'Français' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

/** The language the desk shows, English when it isn't one of ours. */
export const currentLanguage = (code: string) =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES.find((l) => l.code === 'en')!;

export const isLanguage = (value: unknown): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);

/** A browser language tag as one of ours: "pt-BR" stays, other Portuguese is pt-PT. */
export function matchLanguage(tag: string): LanguageCode | null {
  if (isLanguage(tag)) return tag;
  const [base, region] = tag.split('-');
  if (base === 'pt') return region?.toUpperCase() === 'BR' ? 'pt-BR' : 'pt-PT';
  return isLanguage(base) ? base : null;
}

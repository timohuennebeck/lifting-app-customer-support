import { describe, expect, it } from 'vitest';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ko from './locales/ko.json';
import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import { matchLanguage } from './languages';

describe('matchLanguage', () => {
  it('maps browser tags onto the desk languages', () => {
    expect(matchLanguage('de-AT')).toBe('de');
    expect(matchLanguage('en-US')).toBe('en');
    expect(matchLanguage('ko-KR')).toBe('ko');
    expect(matchLanguage('pt-BR')).toBe('pt-BR');
    expect(matchLanguage('pt-br')).toBe('pt-BR');
    expect(matchLanguage('pt')).toBe('pt-PT');
    expect(matchLanguage('es-MX')).toBe('es');
    expect(matchLanguage('es-419')).toBe('es');
    expect(matchLanguage('es')).toBe('es');
    expect(matchLanguage('fr-FR')).toBe('fr');
    expect(matchLanguage('fr-CA')).toBe('fr');
    expect(matchLanguage('it-IT')).toBeNull();
  });
});

/** Every key path, plural forms counted as one ("count_one" and "count_other" → "count"). */
const keys = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child
      ? keys(child, `${prefix}${key}.`)
      : [`${prefix}${key.replace(/_(zero|one|two|few|many|other)$/, '')}`],
  );

describe('translations', () => {
  it.each([
    ['de', de],
    ['es', es],
    ['fr', fr],
    ['ko', ko],
    ['pt-PT', ptPT],
    ['pt-BR', ptBR],
  ])('%s has exactly the English keys', (_code, locale) => {
    expect([...new Set(keys(locale))].sort()).toEqual([...new Set(keys(en))].sort());
  });
});

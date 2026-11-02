import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import ko from './locales/ko.json';
import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import { isLanguage, type LanguageCode, matchLanguage } from './languages';

export { currentLanguage, LANGUAGES, type LanguageCode } from './languages';

const STORAGE_KEY = 'support.language';

function initialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage blocked: fall back to the browser's languages.
  }
  for (const tag of navigator.languages) {
    const match = matchLanguage(tag);
    if (match) return match;
  }
  return 'en';
}

/** Switches the desk's language and remembers it in this browser. */
export function setLanguage(code: LanguageCode) {
  void i18n.changeLanguage(code);
  document.documentElement.lang = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Not remembered; the switch still applies.
  }
}

const lng = initialLanguage();
document.documentElement.lang = lng;

void i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    ko: { translation: ko },
    'pt-PT': { translation: ptPT },
    'pt-BR': { translation: ptBR },
  },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

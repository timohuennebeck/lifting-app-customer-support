import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';

import { currentLanguage, LANGUAGES, setLanguage } from '../i18n';
import { cn } from '../lib/cn';
import { menuItem, menuSurface } from '../ui/menu';

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M3 7.5l2.5 2.5L11 4.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The sidebar's language switch: the current code in a circle, the languages beside it. */
export function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const current = currentLanguage(i18n.language);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        title={t('language.title')}
        aria-label={`${t('language.title')}: ${current.name}`}
        className="flex size-9 items-center justify-center rounded-full bg-chip-hover text-[11px] font-bold tracking-[0.04em] outline-none hover:bg-line-2 focus-visible:ring-2 focus-visible:ring-ink"
      >
        {current.short}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="right"
          align="end"
          sideOffset={12}
          className={cn(menuSurface, 'w-[232px]')}
        >
          <DropdownMenu.RadioGroup
            value={current.code}
            onValueChange={(code) => {
              const language = LANGUAGES.find((l) => l.code === code);
              if (language) setLanguage(language.code);
            }}
          >
            {LANGUAGES.map((language) => (
              <DropdownMenu.RadioItem
                key={language.code}
                value={language.code}
                lang={language.code}
                className={cn(menuItem, 'data-[state=checked]:bg-field')}
              >
                <span className="w-[26px] text-[11px] font-bold text-muted">{language.short}</span>
                <span className="flex-1">{language.name}</span>
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

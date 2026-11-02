import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import gym from '@/assets/login-gym.webp';
import { safeRedirect, signIn, type SignInResult } from '@/shared/data/session';
import { currentLanguage, LANGUAGES, setLanguage } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { menuSurface } from '@/shared/ui/menu';

const route = getRouteApi('/login');

type Problem = 'fillBoth' | Exclude<SignInResult, 'ok'>;

const field =
  'h-12 rounded-[14px] bg-field px-4 text-[15px] text-ink outline-none placeholder:text-muted focus:shadow-[inset_0_0_0_1.5px_var(--color-ink)]';

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The language switch at the top: the current language in a pill, the others below it. */
function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const current = currentLanguage(i18n.language);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`${t('language.title')}: ${current.name}`}
        className="flex h-[35px] items-center gap-2 rounded-full px-3.5 text-[14px] font-semibold shadow-[inset_0_0_0_1px_var(--color-line)] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ink"
      >
        {current.name}
        <span className="text-muted">
          <Chevron />
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className={cn(menuSurface, 'w-[232px]')}>
          <DropdownMenu.RadioGroup
            value={current.code}
            onValueChange={(code) => setLanguage(currentLanguage(code).code)}
          >
            {LANGUAGES.map((language) => (
              <DropdownMenu.RadioItem
                key={language.code}
                value={language.code}
                lang={language.code}
                className="flex h-10 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] outline-none select-none data-[highlighted]:bg-field data-[state=checked]:bg-field"
              >
                <span className="w-[26px] text-[11px] font-bold text-muted">{language.short}</span>
                {language.name}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0 text-danger">
      <circle cx="9" cy="9" r="9" fill="currentColor" />
      <path d="M9 4.8v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="13" r="1.15" fill="#fff" />
    </svg>
  );
}

/** Why signing in failed, in a soft red box that can be closed. */
function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="mt-6 flex items-start gap-3 rounded-[14px] bg-danger-bg p-4">
      <span className="pt-px">
        <AlertIcon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[15px] font-semibold text-danger-ink">{t('login.errorTitle')}</p>
        <p className="text-[14px] leading-[1.4] text-danger-ink">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('login.dismiss')}
        className="-mt-0.5 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-full text-danger-ink hover:bg-black/5"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M2 2l8 8M10 2L2 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Sign-in for the support account: logo and language at the top, the form in the middle of the
 * left column, a gym photo filling the right (hidden on narrow screens).
 */
export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const search = route.useSearch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(search.denied ? 'denied' : null);
  const filled = !!email.trim() && !!password;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!filled) {
      setProblem('fillBoth');
      return;
    }
    setBusy(true);
    setProblem(null);
    const result = await signIn(email.trim(), password).catch((): SignInResult => 'error');
    setBusy(false);
    if (result !== 'ok') {
      setProblem(result);
      return;
    }
    router.history.push(safeRedirect(search.redirect) ?? '/inbox');
  };

  const message = problem
    ? problem === 'error'
      ? t('login.failed')
      : problem === 'fillBoth'
        ? t('login.fillBoth')
        : t(`login.${problem}`)
    : null;

  return (
    <div className="flex min-h-full bg-panel">
      <div className="flex w-full flex-col px-6 py-[38px] lg:w-[572px] lg:shrink-0 lg:pr-0 lg:pl-[84px]">
        <div className="mx-auto flex w-full max-w-[386px] flex-1 flex-col lg:mx-0">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-[37px] items-center justify-center rounded-[11px] bg-ink text-[17px] font-bold text-white">
                {t('app.logo')}
              </div>
              <span className="text-[17px] font-semibold">{t('app.wordmark')}</span>
            </div>
            <LanguagePicker />
          </header>
          <form onSubmit={(e) => void submit(e)} noValidate className="my-auto flex flex-col py-12">
            <h1 className="text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">
              {t('login.title')}
            </h1>
            <p className="mt-3 text-[16px] leading-[1.4] text-muted">{t('login.subtitle')}</p>
            {message ? <ErrorBanner message={message} onClose={() => setProblem(null)} /> : null}
            <div className={cn('flex flex-col gap-2.5', message ? 'mt-5' : 'mt-8')}>
              <input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.email')}
                aria-label={t('login.email')}
                className={field}
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.password')}
                aria-label={t('login.password')}
                className={field}
              />
              <button
                type="submit"
                disabled={busy}
                className={cn(
                  'flex h-[50px] items-center justify-center rounded-full text-[16px] font-semibold text-white active:scale-[0.98]',
                  filled && !busy ? 'bg-ink' : 'bg-disabled',
                )}
              >
                {busy ? t('login.signingIn') : t('login.submit')}
              </button>
            </div>
            <p className="mt-5 text-[13px] text-subtle">{t('login.note')}</p>
          </form>
        </div>
      </div>
      {/* Placed over its area, so the photo's own size never stretches the page. */}
      <div className="relative hidden min-w-0 flex-1 lg:block">
        <img
          src={gym}
          alt=""
          className="absolute inset-y-3.5 right-3.5 left-0 h-[calc(100%-28px)] w-[calc(100%-14px)] rounded-panel object-cover"
        />
      </div>
    </div>
  );
}

import { getRouteApi, useRouter } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { safeRedirect, signIn, type SignInResult } from '@/shared/data/session';
import { LANGUAGES, setLanguage } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';

const route = getRouteApi('/login');

type Problem = 'fillBoth' | Exclude<SignInResult, 'ok'>;

const field =
  'h-12 rounded-[14px] bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:shadow-[inset_0_0_0_1.5px_var(--color-ink)]';

/** Sign-in for the support account, with the language switch below the card. */
export function LoginScreen() {
  const { t, i18n } = useTranslation();
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
      ? t('toast.error')
      : problem === 'fillBoth'
        ? t('login.fillBoth')
        : t(`login.${problem}`)
    : null;

  return (
    <div className="flex min-h-full flex-col items-center gap-5 overflow-y-auto bg-canvas p-6">
      <div className="mt-auto" />
      <form
        onSubmit={(e) => void submit(e)}
        noValidate
        className="flex w-[400px] max-w-full shrink-0 flex-col items-center gap-[18px] rounded-[28px] bg-panel px-8 pt-8 pb-[26px] text-center"
      >
        <div className="flex size-[52px] items-center justify-center rounded-2xl bg-ink text-2xl font-bold text-white">
          {t('app.logo')}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[26px] font-semibold tracking-[-0.01em]">{t('login.title')}</h1>
          <p className="text-sm leading-[1.45] text-pretty text-muted">{t('login.subtitle')}</p>
        </div>
        <div className="flex w-full flex-col gap-2.5">
          <input
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setProblem(null);
            }}
            placeholder={t('login.email')}
            aria-label={t('login.email')}
            className={field}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setProblem(null);
            }}
            placeholder={t('login.password')}
            aria-label={t('login.password')}
            className={field}
          />
          {message ? (
            <p role="alert" className="pl-1 text-left text-xs font-semibold text-ink">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className={cn(
              'flex h-[50px] items-center justify-center rounded-full text-[15px] font-semibold text-white active:scale-[0.98]',
              filled && !busy ? 'bg-ink' : 'bg-disabled',
            )}
          >
            {busy ? t('login.signingIn') : t('login.submit')}
          </button>
        </div>
        <p className="text-xs text-subtle">{t('login.note')}</p>
      </form>
      <div
        className="flex gap-1 rounded-full bg-chip-hover p-1"
        role="group"
        aria-label={t('language.title')}
      >
        {LANGUAGES.map((language) => {
          const active = i18n.language === language.code;
          return (
            <button
              key={language.code}
              type="button"
              lang={language.code}
              title={language.name}
              aria-pressed={active}
              onClick={() => setLanguage(language.code)}
              className={cn(
                'flex h-[30px] items-center rounded-full px-3 text-[11px] font-bold tracking-[0.04em]',
                active ? 'bg-ink text-white' : 'text-muted hover:text-ink',
              )}
            >
              {language.short}
            </button>
          );
        })}
      </div>
      <div className="mb-auto" />
    </div>
  );
}

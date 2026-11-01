import { createFileRoute, redirect } from '@tanstack/react-router';

import { LoginScreen } from '@/features/auth/screens/login-screen';
import { currentSession, isSupportSession, safeRedirect } from '@/shared/data/session';

interface LoginSearch {
  /** Where to go after signing in (a path of this site). */
  redirect?: string;
  /** Signed out because the account isn't the support account. */
  denied?: boolean;
}

export const Route = createFileRoute('/login')({
  validateSearch: (raw: Record<string, unknown>): LoginSearch => ({
    redirect: safeRedirect(raw.redirect),
    denied: raw.denied === true || raw.denied === 'true' ? true : undefined,
  }),
  // Already signed in as support: straight to the desk.
  beforeLoad: async ({ search }) => {
    if (isSupportSession(await currentSession())) {
      throw redirect({ href: safeRedirect(search.redirect) ?? '/inbox' });
    }
  },
  component: LoginScreen,
});

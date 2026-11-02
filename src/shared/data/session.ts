import type { Session } from '@supabase/supabase-js';

import { queryClient } from './query-client';
import { supabase } from './supabase';

/** The support account: app_metadata.role is 'support' (only the service role can set it). */
export const isSupportSession = (session: Session | null): session is Session =>
  session?.user.app_metadata?.role === 'support';

export async function currentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export type SignInResult = 'ok' | 'invalid' | 'denied' | 'unreachable' | 'error';

/** Signs in with email and password; any account other than the support one is signed out. */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === 'invalid_credentials' || error.status === 400) return 'invalid';
    // No answer (the request timed out) or no connection at all.
    return error.name === 'AuthRetryableFetchError' ? 'unreachable' : 'error';
  }
  if (!isSupportSession(data.session)) {
    await supabase.auth.signOut();
    return 'denied';
  }
  return 'ok';
}

/** Signs out and forgets every loaded ticket. */
export async function signOut() {
  await supabase.auth.signOut();
  queryClient.clear();
}

/** A path to return to after signing in; only this site's own paths. */
export function safeRedirect(value: unknown): string | undefined {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : undefined;
}

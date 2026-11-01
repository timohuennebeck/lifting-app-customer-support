import { createFileRoute, redirect } from '@tanstack/react-router';

import { currentSession, isSupportSession } from '@/shared/data/session';
import { supabase } from '@/shared/data/supabase';
import { DeskLayout } from '@/shared/components/desk-layout';

// Every desk page needs the support account; anyone else goes to the login.
export const Route = createFileRoute('/_desk')({
  beforeLoad: async ({ location }) => {
    const session = await currentSession();
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    if (!isSupportSession(session)) {
      await supabase.auth.signOut();
      throw redirect({ to: '/login', search: { denied: true } });
    }
  },
  component: DeskLayout,
});

import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { queryClient } from '../data/query-client';
import { supabase } from '../data/supabase';
import { useDeskRealtime } from '../hooks/use-desk-realtime';
import { Sidebar } from './sidebar';

/** The signed-in desk: the sidebar and the current page; leaves for the login when signed out. */
export function DeskLayout() {
  const navigate = useNavigate();
  useDeskRealtime();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT') return;
      queryClient.clear();
      void navigate({ to: '/login' });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-full min-w-[1180px] gap-2.5 overflow-hidden p-2.5 pl-0">
      <Sidebar />
      <main className="flex min-w-0 flex-1 gap-2.5">
        <Outlet />
      </main>
    </div>
  );
}

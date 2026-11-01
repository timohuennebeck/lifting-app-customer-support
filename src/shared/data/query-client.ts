import { QueryClient } from '@tanstack/react-query';

// Realtime refreshes what changes; refetching on focus catches anything missed while away.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
    mutations: { retry: 0 },
  },
});

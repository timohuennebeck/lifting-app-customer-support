import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Navigate, Outlet } from '@tanstack/react-router';

import { Toaster } from '@/shared/ui/toaster';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
  notFoundComponent: () => <Navigate to="/inbox" replace />,
});

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_desk/')({
  beforeLoad: () => {
    throw redirect({ to: '/inbox' });
  },
});

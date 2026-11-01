import { createFileRoute } from '@tanstack/react-router';

import { CustomersScreen } from '@/features/customers/screens/customers-screen';

interface CustomersSearch {
  q?: string;
}

export const Route = createFileRoute('/_desk/customers')({
  validateSearch: (raw: Record<string, unknown>): CustomersSearch =>
    typeof raw.q === 'string' && raw.q ? { q: raw.q } : {},
  component: CustomersScreen,
});

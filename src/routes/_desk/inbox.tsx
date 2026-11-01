import { createFileRoute } from '@tanstack/react-router';

import { parseInboxSearch } from '@/features/inbox/lib/search';
import { InboxScreen } from '@/features/inbox/screens/inbox-screen';

export const Route = createFileRoute('/_desk/inbox')({
  validateSearch: parseInboxSearch,
  component: InboxScreen,
});

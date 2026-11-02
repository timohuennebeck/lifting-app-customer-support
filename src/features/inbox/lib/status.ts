import type { TicketStatus } from '@/shared/data/database.types';

/** Open tickets wait for the team; closed ones are done, until the user reopens them. */
export const STATUSES: readonly TicketStatus[] = ['open', 'closed'];

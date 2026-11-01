import { useQuery } from '@tanstack/react-query';

import type { CustomerRow } from './database.types';
import { fetchAll, supabase } from './supabase';

export const customerKeys = { all: ['customers'] as const };

export type CustomerMap = ReadonlyMap<string, CustomerRow>;

/** Everyone who wrote a ticket, with what only auth knows (email, sign-in, activity). */
async function fetchCustomers(): Promise<CustomerRow[]> {
  return fetchAll((from, to) => supabase.rpc('support_customers').order('user_id').range(from, to));
}

const byUserId = (rows: CustomerRow[]): CustomerMap => new Map(rows.map((r) => [r.user_id, r]));

export function useCustomers() {
  return useQuery({ queryKey: customerKeys.all, queryFn: fetchCustomers, select: byUserId });
}

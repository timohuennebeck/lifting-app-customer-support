import { createClient, type PostgrestError } from '@supabase/supabase-js';

import { env } from '../config/env';
import type { Database } from './database.types';

export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

/** Rows the API returns per request at most (`max_rows` in lifting-app/supabase/config.toml). */
const PAGE_SIZE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

/**
 * Every row of a query, fetched page by page: the API cuts a response at PAGE_SIZE rows without
 * an error. `page` builds the query for a range; it needs a stable order.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

/** A query's rows, or its error thrown, so TanStack Query treats it as failed. */
export function orThrow<T>({ data, error }: { data: T | null; error: PostgrestError | null }): T {
  if (error) throw error;
  if (data === null) throw new Error('The query returned no data.');
  return data;
}

/** Throws a write's error; for inserts and updates that return nothing. */
export function assertOk({ error }: { error: PostgrestError | null }) {
  if (error) throw error;
}

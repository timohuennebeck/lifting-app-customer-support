import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/shared/data/supabase';
import { ticketKeys } from '@/shared/data/tickets';

const BUCKET = 'ticket-attachments';
const URL_SECONDS = 3600;

/** Path → signed URL, or null while the app is still uploading the file. */
export type AttachmentUrls = ReadonlyMap<string, string | null>;

async function fetchUrls(paths: readonly string[]): Promise<AttachmentUrls> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls([...paths], URL_SECONDS);
  if (error) throw error;
  const urls = new Map<string, string | null>(paths.map((p) => [p, null]));
  for (const item of data) {
    if (item.path && !item.error) urls.set(item.path, item.signedUrl);
  }
  return urls;
}

const hasMissing = (urls: AttachmentUrls | undefined) =>
  !!urls && [...urls.values()].some((url) => url === null);

/**
 * Signed URLs for a message's screenshots. The app uploads them after the message, so missing
 * ones are asked for again every 15 seconds; URLs are renewed before they expire.
 */
export function useAttachmentUrls(paths: readonly string[]) {
  return useQuery({
    queryKey: ticketKeys.attachments(paths),
    queryFn: () => fetchUrls(paths),
    enabled: paths.length > 0,
    staleTime: (URL_SECONDS - 600) * 1000,
    refetchInterval: (query) => (hasMissing(query.state.data) ? 15_000 : false),
  });
}

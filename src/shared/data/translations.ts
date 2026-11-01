import { useQuery } from '@tanstack/react-query';

import { fetchAll, supabase } from './supabase';

export const translationKeys = {
  all: ['translations'] as const,
  language: (language: string) => ['translations', language] as const,
};

/** Message id → its text in `language`. */
export type Translations = ReadonlyMap<string, string>;

/**
 * Every message translation into `language` (the desk's): the server makes them for new user
 * messages in the team's language and for others when the desk asks (requestTranslations).
 */
async function fetchTranslations(language: string): Promise<Translations> {
  const rows = await fetchAll((from, to) =>
    supabase
      .from('ticket_message_translations')
      .select('message_id, content')
      .eq('language', language)
      .order('id')
      .range(from, to),
  );
  return new Map(rows.map((r) => [r.message_id, r.content]));
}

export function useTranslations(language: string) {
  return useQuery({
    queryKey: translationKeys.language(language),
    queryFn: () => fetchTranslations(language),
  });
}

/** Asks the server to translate messages into `language` (at most 100 at a time). */
export async function requestTranslations(messageIds: string[], language: string) {
  const { error } = await supabase.functions.invoke('translate-ticket-messages', {
    body: { message_ids: messageIds, language },
  });
  if (error) throw error;
}

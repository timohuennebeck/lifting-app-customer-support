/** The language part of a tag: "pt-BR" → "pt". */
const base = (tag: string) => tag.trim().toLowerCase().split(/[-_]/)[0];

/**
 * Same language; Portuguese from Portugal and Brazil count as one, as on the server, which
 * doesn't translate between them.
 */
export const sameLanguage = (a: string, b: string) => base(a) === base(b);

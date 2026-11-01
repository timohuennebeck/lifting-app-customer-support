function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is missing: copy .env.example to .env.local and fill it in.`);
  }
  return value;
}

/** Build-time settings (Vite inlines `VITE_*` variables; Cloudflare Pages sets them per project). */
export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
};

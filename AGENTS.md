# Loqqa Support: notes for AI agents

The support desk for the Loqqa app (repository `lifting-app`): a Vite + React single-page app on
Cloudflare Pages that talks to the app's Supabase project as one support account. `README.md`
covers what it does, setup and deployment.

## Where things go

- `src/routes/**`: TanStack Router file routes only; they set search params and guards and render
  a screen from `src/features/<feature>/screens/`. `src/routeTree.gen.ts` is generated: commit it,
  never edit it.
- `src/features/<feature>/{components,data,lib,screens}`: code one feature uses (`auth`, `inbox`,
  `customers`).
- `src/shared/`: code several features use: `data` (Supabase client, queries, session),
  `components` (app shell), `ui` (presentational pieces), `hooks`, `lib`, `i18n`, `config`.

## Data

- The schema lives in lifting-app's `supabase/migrations`; change it there, with a new migration.
  The support account's rights come from `private.is_support()` (app_metadata.role = 'support').
- `src/shared/data/database.types.ts` mirrors what the desk uses (type aliases, as supabase-js
  needs); update it with every schema change the desk relies on.
- Reads go through TanStack Query with keys from `ticketKeys` / `customerKeys`; long lists through
  `fetchAll` (the API cuts responses at 1000 rows). Realtime only invalidates queries.
- Users read team replies and status lines in the app, in their language: a status version is a
  plain "1.4.3" that the app words itself; replies are written in the customer's app language.

## i18n

`src/shared/i18n/locales/<lang>.json`; `en` is the source and its keys are type-checked. `de`, `en`,
`ko`, `pt-PT` and `pt-BR` keep identical keys (a test checks it). Status names follow the app's
wording (`statusShown`), so the desk shows what the user sees.

## Conventions

Files kebab-case; `interface` for object shapes (ESLint enforces it, except the Supabase types).
Tailwind classes with the palette in `src/global.css` and `cn()`. Comments say what the code does,
without history.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

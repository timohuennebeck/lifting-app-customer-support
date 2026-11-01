# Loqqa Support

The support desk for [Loqqa](https://github.com/timohuennebeck/lifting-app): the team reads the bug
reports and feature requests users send from the app, answers them and sets their status. Replies
appear in the user's app chat as from the Loqqa team; status changes appear there as lines such as
"Geplant · Erscheint mit Update 1.4.3".

- **Inbox:** tickets by status (open, planned, resolved, closed) and type (bug, idea), searchable
  by name, email, ticket number and text. Unread tickets are marked until opened.
- **Conversation:** messages, screenshots (click to enlarge), status lines, and the reply box. The
  placeholder names the customer's app language: reply in it.
- **Customer panel:** email, sign-in method, user ID, sign-up, last activity, app language, the
  phone, OS and app version the ticket came from, and earlier requests.
- **Customers:** everyone who wrote in, with device, number of requests and last contact.
- **Languages:** German, English, Korean, Portuguese (Portugal and Brazil), like the app.
- **Shortcuts:** `J` / `K` next and previous ticket, `E` resolve and move on, `R` reply,
  `⌘↵` / `Ctrl+↵` send.

## How it works

A static single-page app on Cloudflare Pages that talks to the app's Supabase project directly. It
signs in as **one support account** whose `app_metadata.role` is `'support'`; the database grants
that role, and only it, the access the desk needs (migration `20261101090000_support_desk.sql` in
lifting-app):

- read every ticket, message, status change and screenshot (`support_inbox` view,
  `support_customers()` for what only auth knows: email, sign-in method, activity)
- write status changes and what it has read (`support_ticket_reads`); replies go through the
  `send-team-reply` function
- never change or delete what a user wrote

Any other account that signs in here is signed out again, and would see nothing anyway. Changes
arrive live through Supabase Realtime.

**Translations:** every message shows in the desk's language, with "Übersetzt aus: Koreanisch ·
Original anzeigen" to switch to the original. Users' messages arrive translated into the team's
language; for another desk language the desk asks the `translate-ticket-messages` function for
what is missing. Replies go through `send-team-reply`, which translates them into the customer's
app language before saving, whatever language they are written in (the reply box names it). Both
functions and their setup live in lifting-app (its README, "Translations").

**Stack:** Vite, React 19, TypeScript, Tailwind CSS 4, TanStack Router (file routes in
`src/routes`) and TanStack Query, supabase-js, i18next, Radix UI (menus, popover, dialog).

## Setup

Requires Node 24 (`.nvmrc`).

```bash
npm install
cp .env.example .env.local
npm run dev
```

The desk runs at http://localhost:5174. Point `.env.local` at the local Supabase stack from
lifting-app (`npm run supabase:start` there prints the URL and publishable key; its migrations
include the support access).

### The support account

Create it once per Supabase project (locally in Studio, in production in the dashboard):

1. **Authentication → Users → Add user:** email and a strong password, "Auto confirm" on.
2. **SQL editor**, as the project owner:

   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "support"}'
   where email = 'support@useloqqa.com';
   ```

3. Sign in to the desk. A session that started before step 2 needs a fresh sign-in.

Only the service role can change `app_metadata`, so no user can give themselves this role. Leave
sign-ups on in Supabase: the setting covers the whole project, including the app.

## Deploying to Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git:** this repository.
2. **Build settings:** framework preset "None", build command `npm run build`, output directory
   `dist`. Pages reads the Node version from `.nvmrc` (or set `NODE_VERSION=24`).
3. **Environment variables** (production and preview): `VITE_SUPABASE_URL` (e.g.
   `https://<project-ref>.supabase.co`) and `VITE_SUPABASE_PUBLISHABLE_KEY`. Vite builds them into
   the page; both are public values.
4. **Custom domain:** e.g. `support.useloqqa.com`.

Pages serves `index.html` for every path (there is no `404.html`), which is what the router needs.
`public/_headers` sets a strict Content Security Policy that allows Supabase at `*.supabase.co`
only; with a custom Supabase domain, add it there.

**Recommended:** put [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) in
front of the custom domain and the `*.pages.dev` preview URLs (free for small teams), so only the
team's email addresses reach the login page at all.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

`src/shared/data/database.types.ts` describes the tables, view and function the desk uses by hand;
keep it in step with lifting-app's migrations, or replace it with the output of
`supabase gen types typescript`. `src/routeTree.gen.ts` is generated by the router plugin on
`npm run dev` and `npm run build`; commit it with route changes.

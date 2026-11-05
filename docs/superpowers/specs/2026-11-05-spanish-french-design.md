# Spanish and French across Loqqa: design

Date: 2026-11-05. Spans `lifting-app`, `lifting-app-customer-support`, `lifting-app-website`, App
Store Connect and the design artifact "Loqqa App Store Screens".

## Intent

Add Spanish and French as full languages, on the same level as the five Loqqa already has: the app,
its AI and voice features, the exercise catalog, the legal texts, the support desk, the website and
the App Store. Someone using either language should meet English only where the existing languages
do too (Kai's video keeps its English audio, with translated captions). No target market was named,
so both languages are written for all their speakers.

## Decided by the owner

- **One `es` and no regional split.** It serves Spain and Latin America, in neutral wording.
- **Portuguese stays split** into `pt-PT` and `pt-BR`.
- **Spanish and French ship in the first release.** On 5 November 2026 the owner took version 1.0
  out of review (it had been waiting since the day before), so it goes in again with seven
  languages and a new build. It keeps the version number 1.0.
- **Scope:** all three repos and the App Store screenshots.
- **The first release names the coach in the sign-up sentence** (see "lifting-app"). Consent stays
  by signing up, with no notice in the app, as an accepted risk (`docs/legal/OPEN-QUESTIONS.md`
  item 4).
- **The owner walks through the app by hand.** An automated pass covered most flows on a 375 pt
  simulator; the owner does the rest, on a real phone, before submission.

## Calls made by the author

The owner saw these in chat and didn't object, but didn't explicitly decide them.

- **One `fr`, with no Canadian variant.** Store listing for France only (`fr-FR`).
- **Two Spanish store listings**, `es-ES` and `es-MX`, sharing the same text and screenshots.
- **Tone:** informal _tú_ and _tu_, matching the app's _du_, _tu_, _você_ and 해요체.
- **Translation by Claude**, as for the earlier languages, without native-speaker review unless the
  owner names a reviewer. Unreviewed status is recorded in `docs/legal/OPEN-QUESTIONS.md`.
- **Fix these existing gaps in the same pass:** see "Existing gaps".
- **Add a key-parity check to the app.** See "lifting-app".
- **How 1.0 is released** (by hand or on approval) is asked when it's submitted.
- **The website's `/es` and `/fr` go live before 1.0 is submitted,** so the store's links work
  during review. Anyone can reach them for those few days; the language menu shows them too.
- **Text cut-off:** once translation starts, anything merged to `lifting-app` that adds or changes
  text brings its `es` and `fr` in the same merge.
- **The Training tab's day view stays out of this release.** `claude/training-tab-daily-view-26d18f`
  conflicts with `main` in 7 files and needs rework. If it lands first, its text needs translating
  too, and it needs its own screenshot check.

## Non-goals

- Regional variants of Spanish or French.
- Google Play listings: Android hasn't launched. The app's language files cover Android anyway.
- New or redesigned screenshots. Spanish and French get the same seven shots as the others.
- Dubbing Kai's video.
- Changing the team's language (`SUPPORT_LANGUAGE`, default German).

## Anti-goals

- Offering a language in the app or the App Store before its build, texts and legal documents are
  ready for users.
- English showing up silently in the app because a key or catalog entry was missed.
- Changing the version in App Store Connect while it is in review or live.
- Presenting unreviewed translations, above all legal ones, as reviewed.

## Constraints

- `lifting-app`: local `main` is behind `origin/main`. Start from `origin/main`.
- Never edit an applied migration, always add one. Legal rows can't be changed once inserted.
- `ios/` and `android/` are generated. Native changes go through `app.json`, `app.config.ts` and
  `plugins/`, and need a new build.
- Edge Function changes reach the hosted project only with a function deploy.
- Follow each repo's `AGENTS.md`, including its checks. `lifting-app` asks for
  `npx prettier --write` on edited JSON.
- The desk's base branch is `claude/magical-clarke-gwc570`.
- Other branches are in flight in `lifting-app`. Anything merged after this work needs `es` and `fr`
  too, which is why `AGENTS.md` and the parity check matter.

## Order

Each stage depends on the one before it, except that the desk can land any time after stage 1.

1. **Server:** migration and function deploy. It only adds, so it is safe for existing builds.
2. **App:** texts and native strings, TestFlight build at version 1.0.0.
3. **Support desk:** before the desk can show or request `es` and `fr`, the server has to accept
   them. A user language the server doesn't recognise is treated as English.
4. **Legal and website:** the `es` and `fr` texts, then `/es` and `/fr`. The screenshot tool runs on
   a `lifting-app` checkout, so it needs stage 2 merged. The website build fails without screenshots
   for every language in `LOCALES`.
5. **App Store:** the listing links to the new website pages and goes in with the new build.
6. **Release:** after approval, release 1.0, or it goes live by itself if it was set to.

## lifting-app

### App

- `src/shared/i18n/locales/{es,fr}/`: all 17 namespaces, about 5,600 words per language.
- `src/shared/i18n/resources.ts`: imports, `resources`, `LANGUAGE_NAMES`.
- `src/shared/i18n/index.ts`: `detectLanguage`. Any `es-*` becomes `es`, any `fr-*` becomes `fr`.
- `src/shared/ui/language-flag.tsx`: Spain and France, from the same "Round world flags" set. `es`
  shows Spain's flag for all its speakers (author's call).
- `src/features/voice-input/hooks/use-speech-input.ts`: `es-ES` and `fr-FR`. This map becomes a
  `Record<AppLanguage, string>`, so the compiler flags a missing language.
- `locales/{es,fr}.json` and `app.json` `locales`: the four iOS permission texts.
- `app.json`: `es` and `fr` in `expo-localization`'s `supportedLocales`, for iOS and Android.
- `plugins/weight-shortcut/strings.json`: the Siri phrases.
- `AGENTS.md`, `README.md`: the language lists.
- **Sign-up sentence:** `auth.json` in all seven languages ends "…to tailor your training, and to
  Kai sending your training and body data to OpenAI in the USA." This is the clause promised in
  `OPEN-QUESTIONS.md` item 27; close that item and item 4's note on it. The privacy policy needs no
  change for it.
- **Key-parity check:** only `en` keys are type-checked today, and no test compares languages, so a
  missing key silently shows English. Add a check like the desk's `languages.test.ts`, run with the
  repo's other checks. Its form is left to the builder.

Not needing work: minimum ages (`ES` and `FR` are in `minimum-age.ts`), the decimal comma on the
keypad, dates and prices (all `Intl`), the A–Z rail and search (accents are already stripped), and
Kai's captions (translation keys in `paywall.json`).

### Server

One new migration:

- Widen the three language checks: `profiles_language_check`, `legal_documents_locale_check` and the
  check on `ticket_message_translations.language` (see `20261101120000_message_translations.sql`
  for its definition; it was created inline, so confirm the constraint name).
- Catalog: `es` and `fr` names and how-to steps for all exercises (about 260, count them from the
  database) and equipment names, merged into the existing jsonb as `20261016090000_korean.sql` does.
  Installed apps pick these up with the next catalog refresh.

Functions, then deploy:

- `supabase/functions/_shared/plan-events.ts`: `LANGUAGES`.
- `supabase/functions/_shared/translate.ts`: `TARGETS`, with the tone above.
- `supabase/functions/coach-transcribe/index.ts`: `CONTEXT` and `SUPPORT_CONTEXT`.
- `supabase/functions/read-exercises/exercises.ts`: spoken-number examples for both languages,
  including French forms like _quatre-vingts_.
- `supabase/functions/_shared/coach/prompt.ts`: how the coach addresses the user.
- `translate.test.ts`, `support-functions.test.ts`: cover the new languages where they list others.

### Evals

Add Spanish and French cases to `scripts/plan-generate-eval/run.mjs` and
`scripts/plan-import-eval/fixtures/cases.json`, including at least one spoken-list fixture per
language, and run them. How many beyond that is left to the builder.

## Legal

- New `docs/legal/{es,fr}/{terms,privacy}.md`, about 10,000 words per language, translated from the
  current English and German texts. German stays binding.
- `scripts/legal-migration.mjs`: add both to `FILES`.
- The app's fallback (`localesFor`) needs no change.
- `docs/legal/OPEN-QUESTIONS.md`: add a "Spanish and French" section like the Korean one: not read
  by a native speaker or lawyer; whether "German is binding" holds for consumers in France and
  Spain, and whether local rules need anything further, is a question for the lawyer.

**Versions.** Privacy 1.3 and terms 1.2 have been live in five languages since 5 November 2026. Translate
from those. The terms' language clause (`docs/legal/en/terms.md`, "Language", and its counterparts)
names the available languages and needs Spanish and French, so the terms go to 1.3, with that clause
as the only change and without `requires_reacceptance`. All of it goes out together before 1.0 is
submitted: `docs/legal/{es,fr}/` as privacy 1.3 and terms 1.3, the clause in the other five
languages' terms as 1.3, and the website's sync. A pushed migration takes effect at once, and 1.0
has no public users yet.

## Support desk

- `src/shared/i18n/languages.ts`: add both. `matchLanguage` already maps `es-MX` to `es` and `fr-CA`
  to `fr` through its base-language fallback.
- `src/shared/i18n/index.ts`: imports and `resources`.
- `src/shared/i18n/locales/{es,fr}.json`.
- `src/shared/i18n/languages.test.ts`: both to the key test, and new tag cases. The test uses
  `fr-FR` as its example of an unsupported language, so that assertion has to change to a language
  the desk doesn't speak.
- `src/shared/data/database.types.ts`: the `language` comment.
- `AGENTS.md`, `README.md`: the language lists.

Ticket translation works once the server accepts both languages. Language names in the desk come
from the same formatting tests as other languages (`languageName`); confirm `es` and `fr` render
properly in the customer panel and the reply box.

## Website

- `src/i18n/locales.ts`: `es` at `/es`, `fr` at `/fr`, each with its own `legal` entry.
- `src/i18n/strings.ts`: all copy for both.
- `scripts/sync-legal.mjs`: add both, then `src/content/legal/{es,fr}/`. Run it only once the texts
  are published, since it copies whatever is in the app repo. Its default path is local
  `../lifting-app/docs/legal`, so update that checkout first or pass the path.
- `tools/app-screenshots`: `BROWSER_LOCALES` in `shoot.js`, plan names in `shims/seed.ts`, the
  language lists in `harness.js` and `README.md`. Take `training`, `workout` and `exercise-history`
  into `src/assets/app-screens/{es,fr}/`.
- `README.md`: languages.

## App Store

All of it goes on version 1.0, which is editable again since it left review.

**Screenshots.** The source is the design artifact "Loqqa App Store Screens"
(https://claude.ai/artifact/RnqamYKxuRM9TUH3TL2GQ7): one page per language, seven boards per page
(plan, log, history, ranks, compare, import, kai). Read the type's `SKILL.md` before changing it.

- Add 14 boards and two pages (`canvas.json`). The boards are drawn mockups with text in the
  headline and the fake UI, so use the app's real `es` and `fr` wording.
- Headlines are 32 px, uppercase by default. Check that the longer wording fits on every board.
- Upload to `APP_IPHONE_67` for `es-ES`, `es-MX` and `fr-FR`: 21 files, about an hour at last time's
  rate. Use `asc screenshots upload` under `caffeinate -i`, and don't use `--replace`.

**Listing.** Name, subtitle, description, keywords and promotional text. Research keywords per
language rather than translating them. Respect Apple's limits (30 characters for name and subtitle,
100 for keywords). `es-ES` and `es-MX` start with the same text.

**Subscriptions.** Display names and descriptions for both products and the group, in `es` and `fr`.
Use the version-scoped `asc subscriptions versions localizations` commands.

**Links.** Per-language privacy and support URLs: `useloqqa.com/es`, `/es/privacy`, `/fr` and
`/fr/privacy`.

## Existing gaps to fix in the same pass

- **Subscription names** exist only in `en-US` and `de-DE`: add `pt-PT`, `pt-BR` and `ko`.
- **Privacy and support links:** every store language points to `useloqqa.com/privacy` or the root,
  which are the German pages, including `en-US`. Point each to its own language.

## Done looks like

- A phone set to Spanish or French gets that language by itself, and the whole path reads naturally
  in it: onboarding, paywall, a workout, the coach, voice input, plan import, support and legal.
- Every screen in `tools/app-screenshots/spec.json` was looked at in both languages, with nothing
  cut off. French and Spanish run longer, and `pt-BR` already needed one shortened label.
- A Spanish user's support message appears in the desk in German, and a reply reaches them in
  Spanish. The same for French.
- The desk works in both languages. `/es` and `/fr` with terms, privacy and imprint are live.
- 1.0 is submitted with the three new listings, screenshots and subscription names, and terms 1.3
  is live in all seven languages before that.
- Each repo's checks pass.

## Left to the builder

- Order of languages in menus.
- Exact copy, keywords and how to keep headlines fitting.
- How the work splits into branches and PRs per repo.
- Plural forms: `es` and `fr` have a separate form for millions, as Portuguese does. The existing
  languages have no `_many` keys, so follow them unless a count here can really reach a million.

## Separate from this work

What a lawyer should still look at is in `docs/legal/OPEN-QUESTIONS.md`, above all items 4 and 21.

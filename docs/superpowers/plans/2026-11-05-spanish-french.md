# Spanish and French across Loqqa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Spanish (`es`) and French (`fr`) as full languages in the app, its AI and voice features, the catalog, legal texts, support desk, website and App Store, in the first release (version 1.0).

**Architecture:** Six stages in dependency order: the server accepts the languages first, then the app, the desk, legal texts and website, the App Store, and finally release day. Translations are data files beside the existing languages, so most code changes are entries in language lists. Each repo works on its own branch, and irreversible steps stop at an owner gate.

**Tech Stack:** Expo/React Native with i18next, Supabase (Postgres, Deno Edge Functions), Vite/React with Vitest (desk), Astro on Cloudflare Workers Builds (website), `asc` CLI 5.6 (profile `asc-agent`), Design artifact "Loqqa App Store Screens".

**Spec:** `docs/superpowers/specs/2026-11-05-spanish-french-design.md` in the desk worktree.

## Global Constraints

- One `es` and one `fr`, no regional variants. `es` is neutral Spanish for Spain and Latin America: no _vosotros_, no _voseo_.
- Tone: informal _tú_ and _tu_.
- German stays the binding legal version. Translations are by Claude and recorded as unreviewed.
- Applied migrations are never edited. Legal rows can't be changed once inserted, and a pushed migration takes effect at once.
- `ios/` and `android/` are generated: native changes go through `app.json`, `app.config.ts`, `plugins/` and `locales/`.
- Spanish and French ship in the first release: the owner took 1.0 out of review on 5 November 2026. Everything in App Store Connect goes on version 1.0, and the build stays at marketing version 1.0.0.
- Start branches from `origin/main` (`lifting-app`, `lifting-app-website`) or `claude/magical-clarke-gwc570` (desk). Local `main` checkouts are behind: never work in them.
- From Task 5 on, anything merged to `lifting-app` that adds or changes text brings its `es` and `fr` in the same merge.
- The Training tab's day view (`claude/training-tab-daily-view-26d18f`) stays out of this release.
- The shell is zsh: `$VAR` holding a command with arguments doesn't split into words. Spell commands out.
- Commit subjects are conventional (`feat:`, `fix:`, `docs:`…) and bodies end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Comments say what code does, without history.

**Checks per repo**

| Repo                  | Commands                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lifting-app`         | `npx tsc --noEmit -p .`, `npm run lint`, `npm run -s compiler:check`, `npx prettier --check <changed files>`, `npm run functions:test` for function changes |
| Desk                  | `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check`, `npm run build`                                                                    |
| `lifting-app-website` | `npm run format:check`, `npm run build`                                                                                                                     |

**Owner gates: stop and ask in chat, with what will happen, before each of these.** Commits on feature branches need no gate.

1. Pushing a migration to the live project (`gaxahmqzhygnphrjlkgk`).
2. Deploying Edge Functions.
3. Merging or pushing to `main` or the desk's base branch.
4. Uploading a build to TestFlight.
5. Submitting 1.0 for review, and asking whether it releases by hand or on approval.
6. Releasing 1.0, if it was set to release by hand.

**Pushing migrations from a worktree.** Copy `project-ref`, `linked-project.json`, `pooler-url` and `postgres-version` from the main checkout's `supabase/.temp/` into the worktree's, and symlink the main checkout's `supabase/signing_key.json` into the worktree's `supabase/` (never read it; remove the link afterwards). Run `npx --no-install supabase db push --linked --skip-vault --dry-run`, confirm only the expected files are listed, then the same command with `--yes` in place of `--dry-run`.

### Translation brief

Every translation task follows this.

- Source is the English text. Read the German when the English is ambiguous.
- Keep `{{placeholders}}`, `<tags>`, product names and the file's key order. Translate no keys.
- Plural keys: same forms as English, no `_many` keys. In French, 0 takes the `_one` form, so `_one` values use `{{count}}`, never a literal "1".
- Buttons, tabs and table headers should be about as short as the English. `pt-BR` already needed one shortened label.
- Spanish uses _¿ ?_ and _¡ !_. French uses _« »_ and a non-breaking space before `: ; ? !`.
- Avoid words that split the regions: say _teléfono_, not _móvil_ or _celular_.
- Use the glossary. If a recurring term isn't in it, add a row in the plan and use that everywhere.

### Glossary

| English            | Spanish                | French                       |
| ------------------ | ---------------------- | ---------------------------- |
| workout            | entrenamiento          | séance                       |
| training (general) | entrenamiento          | entraînement                 |
| plan               | plan                   | programme                    |
| exercise           | ejercicio              | exercice                     |
| set                | serie                  | série                        |
| rep                | repetición (_rep_)     | répétition (_rép._)          |
| rest               | descanso               | repos                        |
| body weight        | peso corporal          | poids corporel               |
| body check         | control corporal       | bilan corporel               |
| record (PR)        | récord                 | record                       |
| rank               | rango                  | rang                         |
| history            | historial              | historique                   |
| coach              | coach                  | coach                        |
| Kai · AI coach     | Kai · coach de IA      | Kai · coach IA               |
| subscription       | suscripción            | abonnement                   |
| free trial         | prueba gratuita        | essai gratuit                |
| support            | soporte                | assistance                   |
| Privacy Policy     | Política de Privacidad | Politique de confidentialité |
| Terms of Use       | Términos de Uso        | Conditions d'utilisation     |
| Imprint            | Aviso legal            | Mentions légales             |
| consent            | consentimiento         | consentement                 |
| health data        | datos de salud         | données de santé             |
| withdraw (consent) | retirar                | retirer                      |

Unchanged in both: Loqqa, Loqqa Pro, Kai, RIR, 1RM, OpenAI.

## Review Focus

Each has a test or check in the task named.

1. **A count of 0 in French** selects the `_one` form, so a literal "1 série" would show for zero. Expect "0 série". Task 4.
2. **French apostrophes in the catalog migration** (_barre d'haltères_) break single-quoted SQL. Expect the migration to apply cleanly. Task 2.
3. **Regional language tags** such as `es-419`, `es-MX`, `fr-CA` and `fr-BE`, from a phone, a browser or the translator's `source_language`. Expect them to count as `es` or `fr`, and no "translated from" line for the same language. Tasks 1, 9 and 10.
4. **A translation that drops a `{{placeholder}}` or `<terms>` tag** shows a raw or empty value, or a dead legal link at sign-up. Expect the check to fail. Task 4.
5. **Longer wording on the narrowest iPhone** (375 pt, iPhone SE). Expect nothing cut off in the core flows. Task 9.

---

## Stage 1: Server

Branch `claude/spanish-french-server` in `lifting-app`.

### Task 1: The functions know both languages

**Files:**

- Modify: `supabase/functions/_shared/plan-events.ts:7`
- Modify: `supabase/functions/_shared/translate.ts:20-27`
- Modify: `supabase/functions/coach-transcribe/index.ts:32-51`
- Modify: `supabase/functions/read-exercises/exercises.ts:24`
- Modify: `supabase/functions/_shared/coach/prompt.ts:53-54`
- Test: `supabase/functions/_shared/translate.test.ts`, `supabase/functions/_shared/support-functions.test.ts`

**Interfaces:**

- Produces: `LANGUAGES` = `['de', 'en', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr']`, so `AppLanguage` includes both. `Record<AppLanguage, string>` maps then fail to compile until filled.

- [ ] **Step 1: Write the failing tests** in `translate.test.ts`, importing `isAppLanguage` from `./plan-events.ts` and adding `instructions` to the file's dynamic import

```ts
Deno.test('es and fr are app languages', () => {
  assert(isAppLanguage('es'));
  assert(isAppLanguage('fr'));
  assert(!isAppLanguage('it'));
});

Deno.test('a regional tag is the same language', () => {
  assertEquals(sameLanguage('es-419', 'es'), true);
  assertEquals(sameLanguage('fr-CA', 'fr'), true);
  assertEquals(sameLanguage('es', 'fr'), false);
});

Deno.test('the translator is told the tone in Spanish and French', () => {
  assertStringIncludes(instructions('es'), 'Spanish');
  assertStringIncludes(instructions('es'), '"tú"');
  assertStringIncludes(instructions('fr'), 'French');
  assertStringIncludes(instructions('fr'), '"tu"');
});
```

In `support-functions.test.ts`, repeat the existing `ko` reply test with `db.profiles = [{ id: ALICE, language: 'es' }]` and assert `p_translation_language` is `'es'`, then the same for `'fr'`. In the same file, add `es` and `fr` to the fake translator's `{ German: 'de', Korean: 'ko', English: 'en' }` map.

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run functions:test`
Expected: FAIL, because `es` and `fr` aren't in `LANGUAGES`. The regional-tag test already passes: it pins what `sameLanguage` does today.

- [ ] **Step 3: Add both languages**

- `TARGETS.es`: `'Neutral Spanish for Spain and Latin America. When the text addresses its reader, use the informal "tú", as the app does.'`
- `TARGETS.fr`: `'French. When the text addresses its reader, use the informal "tu", as the app does.'`
- `CONTEXT` and `SUPPORT_CONTEXT`: one entry each, written in that language, with the same lists of terms as the other languages.
- `read-exercises` numbers rule: add `"tres series de doce" = 3 sets of 12` and `"trois séries de douze" = 3 sets of 12`, and say French counts in words such as "soixante-dix" and "quatre-vingts" are numbers too.
- `prompt.ts:53`: add the `1RM` wording, `(German: "geschätztes 1RM", Spanish: "1RM estimado", French: "1RM estimé")`.
- `prompt.ts:54`: `(German: "du", Spanish: "tú", French: "tu")`.

- [ ] **Step 4: Run them to verify they pass**

Run: `npm run functions:test`, then `npx tsc --noEmit -p .`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions
git commit -m "feat(functions): support spanish and french"
```

### Task 2: Catalog and language checks migration

**Files:**

- Create: `supabase/migrations/<timestamp>_spanish_french.sql`, with a timestamp later than the newest on `origin/main`

**Interfaces:**

- Produces: the three checks accept `es` and `fr`, and every exercise and equipment row has both languages.

The live project had 242 exercises and 22 equipment rows on 5 November. Read the current ones, as rows may have been added since.

- [ ] **Step 1: Export the source to the scratchpad**

Read-only query on the live project: `select id, name->>'en', instructions->'en' from public.exercises order by id`, and `select id, name->>'en' from public.equipment order by id`. Save as JSON in the scratchpad, not the repo.

- [ ] **Step 2: Translate both languages**

Follow the translation brief. Output `es.json` and `fr.json` in the scratchpad, each shaped `{ "<id>": { "name": "…", "instructions": [{ "title": "…", "text": "…" }] } }`, plus an equipment map `{ "<id>": "…" }`. Use the gym's usual terms, not literal translations: _press de banca_, _développé couché_, _peso muerto_, _soulevé de terre_. Keep names short enough for a list row.

- [ ] **Step 3: Validate the translations with a scratch script**

The script fails unless both files have exactly the source's ids, each exercise has the same number of steps as its English, and no value is empty or equals the English `text`. Names may match English where the gym term does.
Expected: `es ok`, `fr ok`.

- [ ] **Step 4: Generate the migration**

A scratch script writes one file with:

- For `profiles_language_check`, `legal_documents_locale_check` and `ticket_message_translations_language_check`: drop, then add with `('en', 'de', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr')`. Keep each check's column as in `20261025120000_legal_documents_korean.sql` and `20261101120000_message_translations.sql`. The last was created inline, so confirm its name on the local database.
- Equipment and exercises per language, in the shape of `20261016090000_korean.sql:38-41`, with dollar quoting so apostrophes need no escaping:

```sql
update public.exercises e
set name = e.name || jsonb_build_object('es', v.value -> 'name'),
  instructions = e.instructions || jsonb_build_object('es', v.value -> 'instructions')
from jsonb_each($es${…}$es$::jsonb) as v (key, value)
where e.id = v.key;
```

Equipment uses the same `jsonb_each` form rather than Korean's `values` list, so French apostrophes are safe (Review Focus 2).

- [ ] **Step 5: Apply it to a local database**

Run: `npm run supabase:start`, then `npm run supabase:reset`.
Expected: all migrations apply. Then this query returns all zeros:

```sql
select
  (select count(*) from public.exercises where not (name ? 'es' and name ? 'fr' and instructions ? 'es' and instructions ? 'fr')) as exercises,
  (select count(*) from public.equipment where not (name ? 'es' and name ? 'fr')) as equipment;
```

Also: `select name->>'fr' from public.equipment` shows names with apostrophes intact, and setting `profiles.language` to `es` succeeds while `it` fails.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations
git commit -m "feat: spanish and french in the catalog and language checks"
```

### Task 3: Publish the server

**Files:** none changed.

**Owner gates:** 1, 2 and 3.

- [ ] **Step 1: Dry-run** as described under "Pushing migrations from a worktree". Expected: only the new migration is listed.
- [ ] **Step 2: Ask the owner, then push it.**
- [ ] **Step 3: Verify live.** Run Task 2's zero-count query on the live project. Expected: zeros, and `max(updated_at)` of `exercises` is today, so installed apps refresh the catalog.
- [ ] **Step 4: Ask the owner, then deploy.** Run: `npx --no-install supabase functions deploy --project-ref gaxahmqzhygnphrjlkgk`. Expected: every function deployed.
- [ ] **Step 5: Confirm the deploy.** `npx --no-install supabase functions list --project-ref gaxahmqzhygnphrjlkgk` shows today's date for every function, and the function logs show no new errors after a few minutes. The end-to-end check with a test account is Task 18.
- [ ] **Step 6: Ask the owner, then merge to `main`** with a `merge:` commit, and remove the signing key link.

---

## Stage 2: App

Branch `claude/spanish-french-app` in `lifting-app`, from `origin/main` after Task 3.

### Task 4: A check that all languages match

**Files:**

- Create: `scripts/check-i18n.mjs`, `scripts/check-i18n.test.mjs`
- Modify: `package.json`, `AGENTS.md` (Checks)

**Interfaces:**

- Produces: `export function compareLocale(en: object, other: object, lang: string): string[]`, returning one message per problem. `npm run i18n:check`, which is `node --test scripts/check-i18n.test.mjs && node scripts/check-i18n.mjs`.

- [ ] **Step 1: Write the failing tests** in `scripts/check-i18n.test.mjs`, using `node:test` and `node:assert`

```js
test('flags a key the translation lacks', () =>
  assert.equal(compareLocale({ a: 'x', b: 'y' }, { a: 'x' }, 'es').length, 1));
test('flags a key only the translation has', () =>
  assert.equal(compareLocale({ a: 'x' }, { a: 'x', b: 'y' }, 'es').length, 1));
test('treats plural forms as one key', () =>
  assert.deepEqual(
    compareLocale({ n_one: '1', n_other: '{{count}}' }, { n_other: '{{count}}' }, 'ko'),
    [],
  ));
test('flags a lost placeholder', () =>
  assert.equal(compareLocale({ a: 'Hi {{name}}' }, { a: 'Hola' }, 'es').length, 1));
test('flags a lost tag', () =>
  assert.equal(compareLocale({ a: '<terms>T</terms>' }, { a: 'T' }, 'fr').length, 1));
test('requires {{count}} in _one where 0 takes that form', () => {
  const en = { n_one: '1 set', n_other: '{{count}} sets' };
  assert.equal(
    compareLocale(en, { n_one: '1 série', n_other: '{{count}} séries' }, 'fr').length,
    1,
  );
  assert.deepEqual(
    compareLocale(en, { n_one: '{{count}} série', n_other: '{{count}} séries' }, 'fr'),
    [],
  );
  assert.deepEqual(compareLocale(en, { n_one: '1 Satz', n_other: '{{count}} Sätze' }, 'de'), []);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test scripts/check-i18n.test.mjs`
Expected: FAIL, `compareLocale` doesn't exist.

- [ ] **Step 3: Implement it**

Plural suffixes `_zero|_one|_two|_few|_many|_other` count as one key, as in the desk's `languages.test.ts`. Placeholders and tags are compared as the union across a key's plural forms. The zero rule applies when `new Intl.PluralRules(lang).select(0) === 'one'`.

The script compares every namespace in `src/shared/i18n/locales/<lang>/` with `en`. It also fails unless each non-English language in that folder appears in `app.json`'s `locales`, in both `supportedLocales` lists of the `expo-localization` plugin, in `plugins/weight-shortcut/strings.json`, and as `locales/<lang>.json` with the four `NS…UsageDescription` keys.

- [ ] **Step 4: Run it on the existing five languages**

Run: `npm run i18n:check`
Expected: tests pass. If the script finds real gaps in existing languages, including `pt-BR` strings that hit the zero rule, fix those texts in this task and list them in the commit body.

- [ ] **Step 5: Commit**

```bash
git add scripts package.json AGENTS.md src/shared/i18n/locales
git commit -m "feat: check that all app languages have the same texts"
```

### Task 5: App texts in Spanish

**Files:**

- Create: `src/shared/i18n/locales/es/*.json` (all 17: auth, body, coach, common, exercises, muscles, onboarding, paywall, planCreate, planImport, profile, progressCheck, support, training, voice, weight, workout)
- Create: `locales/es.json`
- Modify: `plugins/weight-shortcut/strings.json`

- [ ] **Step 1: Translate the 17 namespaces** (about 5,600 words), per the brief. Translate the `auth.json` consent sentence as it stands: Task 7 adds the coach clause. The ranks, Kai's captions in `paywall.json` and the paywall's claims are marketing voice: write them naturally rather than word for word.
- [ ] **Step 2: Translate `locales/es.json`** (the four iOS permission texts, from `locales/de.json` and English intent) and add the `es` block to `plugins/weight-shortcut/strings.json`, keeping `${applicationName}`.
- [ ] **Step 3: Format.** Run: `npx prettier --write src/shared/i18n/locales/es locales/es.json plugins/weight-shortcut/strings.json`.
- [ ] **Step 4: Compare.** Run `node scripts/check-i18n.mjs`. Expected: no key, placeholder or tag problems under `es`. It will still report `es` missing from `app.json` until Task 7.
- [ ] **Step 5: Check the words.** Grep `es` for glossary drift: `sesión` meaning workout, `vosotros`, `móvil`, `celular`. Expected: none.
- [ ] **Step 6: Commit** with `feat: app texts in spanish`.

### Task 6: App texts in French

Same files and steps as Task 5 with `fr`. Can run in parallel with Task 5. Grep for `entraînement` meaning a single workout, `plan` meaning `programme`, and `vous`. Expected: none outside legal wording. Commit with `feat: app texts in french`.

### Task 7: Wire the languages into the app

**Files:**

- Modify: `src/shared/i18n/resources.ts`, `src/shared/i18n/index.ts:9-15`
- Modify: `src/shared/ui/language-flag.tsx`
- Modify: `src/features/voice-input/hooks/use-speech-input.ts:20-26`
- Modify: `app.json`
- Modify: `src/shared/i18n/locales/*/auth.json` (all seven)
- Modify: `AGENTS.md:47`, `README.md:18,167,285,516`
- Modify: `docs/legal/OPEN-QUESTIONS.md` (items 4 and 27)

- [ ] **Step 1: Make the voice map complete at compile time.** Change `LOCALES` to `Record<AppLanguage, string>`.

Run: `npx tsc --noEmit -p .`. Expected: passes. Adding the languages in Step 2 makes it fail until this map has both.

- [ ] **Step 2: Add the languages**

- `resources.ts`: 34 imports, `resources.es` and `resources.fr`, and `LANGUAGE_NAMES.es = 'Español'`, `LANGUAGE_NAMES.fr = 'Français'`. Order: after `ko`.
- `index.ts`: `if (languageCode === 'es') return 'es';` and the same for `fr`.
- `use-speech-input.ts`: `es: 'es-ES'`, `fr: 'fr-FR'`.
- `app.json`: `locales.es`, `locales.fr`, and `"es", "fr"` in `expo-localization`'s `supportedLocales.ios` and `.android`. The spec didn't list these; without them iOS doesn't offer the languages.

- [ ] **Step 3: Add the flags**

Same geometry as the `de` entry's three paths. `es`: top and bottom `#D80027`, middle `#FFDA44`. `fr`: wrap the three paths in `<G transform="rotate(-90 256 256)">`, with top `#0052B4` (left once rotated), middle `#F0F0F0`, bottom `#D80027`. Update the file's comment listing the flags.

- [ ] **Step 4: Add the sign-up clause in all seven languages**

`auth.json`'s consent sentence ends, in English, "…to tailor your training, and to Kai, the AI coach, sending your training and body data to OpenAI in the USA." Match each language's existing sentence, keeping `<terms>` and `<privacy>`. In `OPEN-QUESTIONS.md`, close item 27 and change item 4 to say that the first release shows the clause.

- [ ] **Step 5: Update the docs.** `AGENTS.md:47` and `README.md:18,167,516`: seven languages. `README.md:285`: the speech rules name French's number words too. Add `npm run i18n:check` to the checks list if Task 4 didn't.

- [ ] **Step 6: Run the checks.** `npm run i18n:check`, `npx tsc --noEmit -p .`, `npm run lint`, `npm run -s compiler:check`, `npx prettier --check` on changed files. Expected: all pass.

- [ ] **Step 7: Commit** with `feat: spanish and french in the app, and the coach in the sign-up sentence`.

### Task 8: Evals in both languages

**Files:**

- Modify: `scripts/plan-generate-eval/run.mjs`
- Modify: `scripts/plan-import-eval/fixtures/cases.json`, `README.md:264`
- Create: `scripts/plan-import-eval/fixtures/20-voice-list-es.txt`, `21-voice-list-fr.txt`

- [ ] **Step 1: Add generate cases,** at least one per language, shaped like the existing rows: `['19', 'es', 'hypertrophy', 'gym', 3, 'full_body', 60, 'beginner', []]` and `['20', 'fr', 'strength', 'gym', 4, 'upper_lower', 75, 'intermediate', []]`. Use the next free ids.
- [ ] **Step 2: Add spoken fixtures** shaped like `18-voice-list-ko`: `as: "voice"`, the language, and `expect.routines[].exercises[]` with `ex`, `sets`, `reps`. Numbers are words. The French list says _quatre-vingts kilos_ in one line and _trois séries de douze_. `README.md:264` becomes 21 test plans.
- [ ] **Step 3: Run them.** Copy `.env.local` from the main checkout (gitignored). Run: `npm run plan:eval` and `npm run plan:generate-eval`. Expected: the new voice cases score all exercises, sets and reps right. Generated plans have Spanish and French names, and exercises from the catalog. Read the report, and don't only trust the score.
- [ ] **Step 4: Fix what they show** in Task 1's prompt rules, and redeploy after asking (gates 2 and 3). If nothing fails, skip this step.
- [ ] **Step 5: Commit** with `test: plan evals in spanish and french`.

### Task 9: Walk through the app and upload a build

**Files:** only fixes to the texts.

- [ ] **Step 1: Run it on a simulator** set to `es-MX`, then `fr-CA`, on an iPhone SE (375 pt) and an iPhone 17 Pro. Use Claude Code's iOS Simulator tool, attached before building. Expected: the app picks the language by itself, and a simulator set to `ca-ES` gets English.
- [ ] **Step 2: Go through every core flow in both languages:** onboarding, paywall with Kai's captions, a workout, the coach (asked in that language, with a voice question), voice input with real Spanish and French speech if available, plan import, support, Settings' language list with both flags. Search the catalog with and without accents (_developpe_, _développé_) and check the A–Z rail places _É_ under E. Expected: reads naturally, nothing cut off (Review Focus 5), no English except Kai's video audio. Fix texts and repeat. Legal screens fall back to English until Task 13.
- [ ] **Step 3: Run the checks again** and commit fixes with `fix: shorter spanish and french labels` or similar.
- [ ] **Step 4: Show the owner the sign-up sentence in all seven languages,** since it is consent wording, and ask to merge (gate 3).
- [ ] **Step 5: Merge to `main`, then ask and upload** (gate 4). Run: `npm run build:ios`, then `npm run upload:ios`. Expected: the build reaches TestFlight as 1.0.0 with a new build number. The owner walks through the app on it, on a real phone.

---

## Stage 3: Support desk

Branch: this worktree's `claude/spanish-french-localization-704917`. It first commits the spec and this plan.

### Task 10: The desk in both languages

**Files:**

- Modify: `src/shared/i18n/languages.ts`, `src/shared/i18n/index.ts`, `src/shared/i18n/languages.test.ts`
- Create: `src/shared/i18n/locales/es.json`, `fr.json`
- Modify: `src/shared/data/database.types.ts:75`, `AGENTS.md:33`, `README.md:17`

- [ ] **Step 1: Write the failing tests** in `languages.test.ts`

```ts
expect(matchLanguage('es-MX')).toBe('es');
expect(matchLanguage('es-419')).toBe('es');
expect(matchLanguage('es')).toBe('es');
expect(matchLanguage('fr-FR')).toBe('fr');
expect(matchLanguage('fr-CA')).toBe('fr');
expect(matchLanguage('it-IT')).toBeNull();
```

Remove `expect(matchLanguage('fr-FR')).toBeNull();`, and add `['es', es]` and `['fr', fr]` to the key test.

- [ ] **Step 2: Run them to verify they fail.** Run: `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.** `languages.ts`: `{ code: 'es', short: 'ES', name: 'Español' }` and `{ code: 'fr', short: 'FR', name: 'Français' }`. Add imports and `resources` in `index.ts`. Translate both JSON files (about 390 words each) per the brief, with status names following the app's wording in `locales/<lang>/support.json`. `database.types.ts:75`: `en, de, pt-PT, pt-BR, ko, es or fr`. Update the language lists in `AGENTS.md` and `README.md`.
- [ ] **Step 4: Run the checks.** Expected: all pass.
- [ ] **Step 5: Look at it in a browser.** Run the dev server, switch the desk to Español and Français, and open a ticket. Expected: the switcher, inbox and customer panel read properly, and `languageName` shows a Spanish or French customer's language by name in the panel and the reply box.
- [ ] **Step 6: Commit** with `feat: the desk in spanish and french`, then ask (gate 3) and merge to `claude/magical-clarke-gwc570`.

---

## Stage 4: Legal and website

### Task 11: Legal texts in Spanish and French

Branch `claude/spanish-french-legal` in `lifting-app`.

**Files:**

- Create: `docs/legal/es/{terms,privacy}.md`, `docs/legal/fr/{terms,privacy}.md`
- Modify: `scripts/legal-migration.mjs` (`FILES`), `README.md:209`, `docs/legal/OPEN-QUESTIONS.md`
- Modify: `docs/legal/{de/nutzungsbedingungen,en/terms,pt-PT/terms,pt-BR/terms,ko/terms}.md` (the language clause and the version line)

- [ ] **Step 1: Translate four documents** from the live `en` and `de` (privacy 7,900 words, terms 2,300, per language). One reviewer-checked task per document is fine. Keep the first three blocks as title, version line and date line, separated by blank lines, because `sync-legal.mjs` parses them. Versions: privacy `1.3`, terms `1.3`. Date: the planned publish date. The terms' language clause reads, in each: German, English, Portuguese, Korean, Spanish and French, with German authoritative.
- [ ] **Step 2: Compare structure with a scratch script.** For each translated document against English, it fails unless these match: the heading count and section numbers; the multiset of numbers, including ages, periods, `Art.` references and limits; every URL and email; every named company and address.
      Expected: no differences, apart from the dates' format and the terms' version.
- [ ] **Step 3: Add to `FILES`** and update `README.md:209`.
- [ ] **Step 4: Name Spanish and French in the five existing terms files,** in the language clause, and set their version line to `1.3`. Nothing else changes: `git diff --stat` shows about 3 lines per file. Task 13 sets the date.
- [ ] **Step 5: Add a "Spanish and French" section to `OPEN-QUESTIONS.md`** after the Korean one: not read by a native speaker or lawyer; whether "German is binding" holds for consumers in France and Spain, and whether local rules need anything further, is for the lawyer. Add `es`, `fr` and terms 1.3 to the top paragraph.
- [ ] **Step 6: Commit** with `docs: legal texts in spanish and french`. Nothing is generated or published yet.

### Task 12: Website in both languages

Branch `claude/spanish-french-website` in `lifting-app-website`. Needs Task 9 merged, as the screenshot tool runs on an app checkout.

**Files:**

- Modify: `src/i18n/locales.ts`, `src/i18n/strings.ts`, `scripts/sync-legal.mjs`, `README.md:48`
- Modify: `tools/app-screenshots/shoot.js:22-28`, `shims/seed.ts:126-135`, `harness.js:109`, `README.md`
- Create: `src/content/legal/{es,fr}/`, `src/assets/app-screens/{es,fr}/{training,workout,exercise-history}.png`

- [ ] **Step 1: Add the languages.** `locales.ts`: `{ code: 'es', path: 'es', short: 'ES', label: 'Español', legal: 'es' }` and `{ code: 'fr', path: 'fr', short: 'FR', label: 'Français', legal: 'fr' }`, and the comment says seven. `sync-legal.mjs`: `es` and `fr` with `terms.md` and `privacy.md`. `strings.ts`: all copy for both, including the `imprint` block, using the app's own words for features.
- [ ] **Step 2: Update the screenshot tool.** `BROWSER_LOCALES`: `es: 'es-ES'`, `fr: 'fr-FR'`. Plan names in `seed.ts`, as the app's plan generation would name them. The language lists in `harness.js` and `README.md`.
- [ ] **Step 3: Take the screenshots.** In `tools/app-screenshots`, run `./setup.sh <app checkout at main>`, start the local Supabase in the app, then `node shoot.js --lang es` and `node shoot.js --lang fr` for all 16 screens in `spec.json`. Look at every image. Expected: nothing cut off; fix texts in the app if needed, under the text cut-off rule. Commit only `training`, `workout` and `exercise-history`, as the other non-English languages do, and delete the rest.
- [ ] **Step 4: Sync the unpublished legal texts for the build.** Run: `node scripts/sync-legal.mjs <Task 11's worktree>/docs/legal`, then `npx prettier --write src/content/legal`. Expected: `git status` shows only `es` and `fr` under `src/content/legal`. If other languages show, the app repo moved: stop and check.
- [ ] **Step 5: Run the checks.** Expected: 0 errors, and `dist/es/privacy.html`, `dist/fr/terms.html` and the rest exist with the right `lang`. Open `/es` and `/fr` locally and check the layout and language menu.
- [ ] **Step 6: Commit** with `feat: the website in spanish and french`. Not pushed yet: Task 13.

### Task 13: Publish the legal texts and website

**Owner gates:** 1 and 3. Do this just before 1.0 goes in for review, after Task 16's Step 1 is ready.

- [ ] **Step 1: Set today's date in all nine files and generate both migrations.** Run:

```bash
node scripts/legal-migration.mjs 1.3 <date> <ts>_privacy_policy_v1_3_es_fr --kind=privacy es fr
```

```bash
node scripts/legal-migration.mjs 1.3 <date> <ts2>_terms_v1_3 --kind=terms de en pt-PT pt-BR ko es fr
```

Expected: 2 privacy documents and 7 terms documents.

- [ ] **Step 2: Dry-run, ask the owner, and push.** Expected: only these two listed.
- [ ] **Step 3: Verify by hash.** `md5(content_md)` of the nine live rows equals the md5 of `file.strip() + '\n'`. The newest terms row is 1.3 in all seven locales, the newest privacy row is 1.3 in all seven, and `requires_reacceptance` is false.
- [ ] **Step 4: Ask, then merge the legal branch and push the website branch to `main`.**
- [ ] **Step 5: Verify live.** After the Cloudflare build, `https://useloqqa.com/es`, `/es/terms`, `/es/privacy`, `/es/imprint` and the `/fr` equivalents return 200 in the right language. In the simulator, the app's legal screens now show Spanish and French.

---

## Stage 5: App Store

Everything here is on version 1.0. It is `DEVELOPER_REJECTED` and editable since it left review on 5 November 2026. Nothing here waits for anything else, apart from the new build.

### Task 14: Screenshot boards

**Artifact:** "Loqqa App Store Screens", slug `c8c1bcc2-2b9d-40ad-beda-6b5f46a86270`.

**Files (in the artifact):**

- Create: `project/{es,fr}-{plan,log,history,ranks,compare,import,kai}.dc.html`
- Modify: `project/canvas.json`

- [ ] **Step 1: Read the type's `SKILL.md`** and `project/canvas.json` in full. Work under `project/` only, keeping every existing key.
- [ ] **Step 2: Create the Spanish boards,** one file at a time, copying each `en-*` board. Replace the headline and all text in the drawn UI with the app's real `es` wording from `src/shared/i18n/locales/es/`. Send each with `publish_files` (`mode: "patch"`, the last `base_version`). The first send also adds to `canvas.json`: page `{ "id": "es", "name": "Español" }`, the seven `boards` entries (430×932, spaced like the existing rows, on a new row below the last), and `order`.
- [ ] **Step 3: Create the French boards** the same way, with page `{ "id": "fr", "name": "Français" }`.
- [ ] **Step 4: Render every new board.** The spec asks for the fit check, so rendering is in scope here. The type documents no export, so fetch the boards and `project/support.js` with `read_file`, serve them locally, and capture each board in Chromium with a 430×932 viewport and `deviceScaleFactor: 3`. Do this first with `en-plan` and compare it with the `en-US` shot in App Store Connect: if it differs, ask the owner how the earlier PNGs were made. Expected: 1290×2796 images, the `APP_IPHONE_67` size, that match the store's look.
- [ ] **Step 5: Check the fit.** Look at every image. Headlines are 32 px and uppercase by default. Expected: every headline fits inside its frame and nothing in the mock UI is cut off. Reword rather than shrink, then render again.
- [ ] **Step 6: Sort the PNGs** into scratchpad folders `store/es-ES`, `store/es-MX` and `store/fr-FR`, each holding only its seven files, named `1-plan.png` to `7-kai.png`, the order the store shows. Confirm the size with `sips -g pixelWidth -g pixelHeight`.

### Task 15: Listing and subscriptions on version 1.0

Version id `c123e513-d85d-42f5-89ac-7e1797b7cb05`. Build 8 is still attached; Task 16 replaces it.

- [ ] **Step 1: Add locales** `es-ES`, `es-MX` and `fr-FR` with `asc localizations create`, then `--type app-info` for name and subtitle.
- [ ] **Step 2: Write the listing** from `en-US`, per the brief. Name and subtitle ≤ 30 characters, keywords ≤ 100, promotional text ≤ 170, description ≤ 4,000. Research keywords per language with web searches for how gym-goers search there; don't repeat words from the name or subtitle. `es-ES` and `es-MX` start with the same text. Apply with `asc localizations update`.
- [ ] **Step 3: Set the links.** Support URL (`--support-url`) and privacy URL (`--type app-info --privacy-policy-url`):

| Locale           | Support                | Privacy          |
| ---------------- | ---------------------- | ---------------- |
| `de-DE`          | `https://useloqqa.com` | `/privacy`       |
| `en-US`          | `/en`                  | `/en/privacy`    |
| `pt-PT`          | `/pt`                  | `/pt/privacy`    |
| `pt-BR`          | `/pt-br`               | `/pt-br/privacy` |
| `ko`             | `/ko`                  | `/ko/privacy`    |
| `es-ES`, `es-MX` | `/es`                  | `/es/privacy`    |
| `fr-FR`          | `/fr`                  | `/fr/privacy`    |

- [ ] **Step 4: Add subscription names.** Group `22509535`, `loqqa_pro_monthly` `6826517381`, `loqqa_pro_yearly` `6826517384`. For `pt-PT`, `pt-BR`, `ko`, `es-ES`, `es-MX` and `fr-FR`: display name and description, with `asc subscriptions groups versions localizations create` and `asc subscriptions versions localizations create`. Use the existing `de-DE` and `en-US` text as the source.
- [ ] **Step 5: Verify.** List every localization and check each field is filled and within its limit.

### Task 16: Upload the screenshots and submit

- [ ] **Step 1: Upload.** First `asc screenshots upload --app 6826156839 --version 1.0 --locale es-ES --path <folder> --device-type IPHONE_67 --dry-run`. Expected: seven files for the `APP_IPHONE_67` set, in name order. Then the same without `--dry-run`, under `caffeinate -i`, for each of the three locales. Never `--replace`. About an hour for 21 files. One run stops after about 10 minutes; resume with `--skip-existing`, but only once no file is in `UPLOAD_COMPLETE`, or files get sent twice. Run it in the background.
- [ ] **Step 2: Verify.** `asc screenshots list --version-id <id>`. Expected: 7 for each new locale, in board order.
- [ ] **Step 3: Run Task 13,** which publishes the legal texts and website the store links point to.
- [ ] **Step 4: Attach the new build** from Task 9: `asc versions attach-build --version-id <id> --build-id <build>`.
- [ ] **Step 5: Ask the owner, then submit 1.0 for review** (gate 5), with the same four items as last time: the version, the subscription group version and both subscription versions. Ask whether it releases by hand or on approval, and set it with `asc versions update --release-type`. Expected: `WAITING_FOR_REVIEW`.

---

## Stage 6: Release

### Task 17: Release

Do this only after Apple approves 1.0, and only if it was set to release by hand (`PENDING_DEVELOPER_RELEASE`). **Owner gate:** 6.

- [ ] **Step 1: Ask, then release.** Run: `asc versions release --version-id <id> --confirm`.

### Task 18: Final check against "Done looks like"

- [ ] **Step 1:** On a TestFlight or App Store build, a phone set to Spanish and one set to French get that language by themselves, and onboarding, paywall, a workout, the coach, voice input, plan import, support and legal read naturally.
- [ ] **Step 2:** With a test account, a Spanish message appears in the desk in German with "translated from" Spanish, and a reply reaches the app in Spanish. The same for French. A voice message in the support chat is written down in that language.
- [ ] **Step 3:** The desk works in both languages. `/es` and `/fr`, with terms, privacy and imprint, are live.
- [ ] **Step 4:** 1.0 is live, with three new listings, screenshots and subscription names, and terms 1.3 live in all seven languages.
- [ ] **Step 5:** Each repo's checks pass on its main branch. Report anything that couldn't be exercised.

# AI Agent Guidelines

Last updated: 2026-10-07

---

## Project

This repo is the documentation site for the **ai-sdk-threads** npm package, deployed at https://ai-sdk-threads.nixrajput.com. It is a Next.js + Fumadocs app.

| Area          | Detail                                                     |
| ------------- | ---------------------------------------------------------- |
| Language      | TypeScript, ESM only, Node `>=20.9`                        |
| Framework     | Next.js 16 (App Router) + Fumadocs                         |
| Lint / format | ESLint + Prettier - double quotes, semicolons, 100 columns |
| Content       | MDX under `content/docs/en/`                               |

### Layout

```
app/[lang]/...        route segments (i18n-aware; [lang] currently resolves to "en")
app/[lang]/playground the PGlite demo route
content/docs/en/      MDX documentation source
lib/source.ts         Fumadocs content source adapter
lib/shared.ts         site constants (URL, tagline, repo and npm links, install command)
lib/layout.shared.tsx nav options shared by the home and docs layouts
lib/i18n.ts           i18n config (locales, default locale)
lib/playground-ddl.ts the demo's CREATE TABLE statements
scripts/              the three checks plus the PGlite asset copy
proxy.ts              i18n routing plus the non-localized route allowlist
```

### Three things that will bite you

1. **`app/[lang]/layout.tsx` is the root layout. There is no `app/layout.tsx`.** That is what makes `<html lang>` dynamic, and it is legal only because nothing outside `[lang]` is a page. Do not add one.
2. **The playground loads PGlite from `/pglite` at runtime, not through the bundler.** Turbopack rewrites its Emscripten glue into something that throws `m.instantiateWasm is not a function`. So `scripts/copy-pglite.mjs` copies the dist into `public/pglite` on `prebuild`/`predev`. `components/Playground.tsx` imports it through a variable specifier that no bundler can statically analyse. Do not "fix" that indirection back into a normal import.
3. **Add every new top-level route to `NON_LOCALIZED_ROUTES` in `proxy.ts`.** Otherwise the i18n proxy rewrites it into `/en/...`, which 404s. The redirect step still reports 200, so nothing looks wrong. This has already cost six debugging sessions across the two sites, most recently on `/pglite`. `npm run check:routes` asserts every such route serves 200 under `redirect: "manual"`, which is the guard that catches it.

### Commands

```bash
npm run dev   # local dev server
```

The gate, run by CI and `.githooks/pre-push`:

```bash
npm run lint && npm run types:check && npm run check:samples && npm run check:spell && npm run format:check && npm run build
```

Plus two checks that need a running server (`npm start`, then `BASE_URL=... npm run check:routes` and `npm run check:vitals`). CI runs both against one server rather than starting `next start` twice.

### Conventions

- Prettier, not Biome (unlike the package repo) - double quotes, semicolons, 100-column lines. Do not hand-format - run `npm run format`.
- Conventional Commits, imperative subject `<=` 50 chars, body wrapped at 72, no trailing period, no `Co-Authored-By` or `Generated with` trailers.
- **Never use em-dashes.** Use a hyphen instead.
- Markdown prose is never hard-wrapped: one line per paragraph and per list item. Do not re-wrap these files to a column.
- The PR title becomes the squash commit message.
- `main` is protected: PR required, squash-only merges.

### Cross-repo coupling

This is the most important thing in this file. This site owns its documentation **content**. The `ai-sdk-threads` package itself lives in a separate repo, [`nixrajput/ai-sdk-threads`](https://github.com/nixrajput/ai-sdk-threads). When the package's public API changes, make the matching documentation change **here**, in a separate PR against this repo. Never bundle it into a PR on the package repo.

`npm run check:samples` keeps that split honest. It extracts every `ts`/`tsx` code fence from `content/docs/**` and typechecks it against `ai-sdk-threads` **installed from npm**. So the docs prove that the shipped package behaves as documented. Mark a fence `notype` only when it illustrates prose rather than usable code. Mark it `fragment` when it assumes the ambient `db`, `store` and `threadId` that the extractor declares.

### Versioning

This site is not versioned and not published. No PR here ever needs to bump a version number, and there is no release workflow to trigger.

---

## Always-Active Instructions

> These apply to EVERY interaction, automatically.

### Writing Style

Never use em-dashes (`—`). Always use a hyphen (`-`) instead - in code comments, commit messages, PR/issue text, chat responses, and any file content.

#### Plain technical English (adapted from ASD-STE100)

Write text that has exactly one reading. The goal is to remove ambiguity, not words. Stop when a sentence cannot be misread, not when it is shortest.

**Everywhere** (chat, commits, PR and issue text, docs, code comments). Aim for about 80% of strict STE. Follow these rules, but treat the word limits as targets and skip the strict-mode extras.

- Active voice. Name who acts: "The job deletes the file", not "The file is deleted". Use passive only when the actor is unknown or irrelevant.
- One idea per sentence. Aim for 20 words or fewer in instructions and 25 or fewer in descriptions.
- No semicolons in prose. Where a semicolon or a dash would join two clauses, prefer two sentences.
- Use a numbered or bulleted list for 3+ steps, conditions or options. Keep one topic and 6 sentences max per paragraph.
- One name per thing. Pick one term (e.g. "user" or "account", not both) and keep it for the whole text. Rotating synonyms makes the reader ask if they are different things.
- One meaning and one part of speech per word. If "store" names a storage layer, do not also use it to mean "save".
- Plain words, not formal ones: use, start, before, about, to, make sure - not utilize, leverage, commence, prior to, approximately, in order to, ensure.
- Verbs, not nominalizations: "analyze the log", not "perform an analysis of the log".
- Plain verbs, not soft phrasal verbs: start, contact, read, begin - not spin up, reach out, dive into, kick off.
- No marketing adjectives (seamless, robust, powerful, blazing-fast, effortless). Delete them or give the number that earns the claim.
- No hedge stacking ("it is worth noting that this may potentially help"). State the claim or cut it.
- Keep subjects, verbs and articles. Do not drop words to save space ("Files not backed up will be lost" - which files?).
- Noun stacks of 3 words max: "the handler that sets task-queue priority", not "the agent task queue priority handler".
- Define a domain term once, on first use, if it is not common English.
- Label a risky step WARNING (irreversible: data loss, money, production, real users) or CAUTION (recoverable). Give the command first, then the risk: "WARNING: Do not run this on production. It deletes all sessions."

**Keep modality. Confidence is content.** "May have failed" never becomes "failed". "Could be caused by X" never becomes "X is the cause". Never upgrade a hedge to a fact, and never add a cause, frequency or mechanism the evidence does not show. Never drop a condition, exception or scope qualifier to shorten a sentence. If a rule would cost precision, keep the longer wording. When you rewrite someone else's text, name any content you added.

**Strict mode** applies to text that an agent or program reads with no human to resolve ambiguity. That includes AGENTS.md, CLAUDE.md, skills, agent and subagent prompts, tool descriptions, hook output, error and log messages, and reports that one agent writes for another.

- The 20/25-word limits are hard caps. One instruction per sentence, unless two actions happen at the same time.
- Write instructions in the imperative. Keep descriptions as descriptions. Do not turn a fact into a command.
- Put the condition first: "If the app is uninstalled, skip the sync." Do not put it at the end.
- Use one verb for one action in the whole file. Do not mix "check", "verify" and "confirm" for the same action. If "check" is already a noun in the file (a CI check), use "verify" for the action.
- Use simple tenses by default: "the job completed", not "the job is completing". Keep a compound form only when it carries meaning: "is running" (still in progress), "has completed" (done and available now), "may have failed" (uncertain). When tense and modality conflict, modality wins.

**Exempt:** creative or persuasive copy, code, and quoted or verbatim text (error strings, the user's words).

**Pick the format before the words.** Some explanations cover a flow, a structure or 3+ interacting parts. For these, draw a diagram (ASCII in chat) or offer an HTML page instead of a long block of text.

These rules fix form, not substance. Leave text that already follows them unchanged. If a paragraph has nothing to say, delete it instead of polishing it.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

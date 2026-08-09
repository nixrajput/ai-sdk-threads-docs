# AI Agent Guidelines

Last updated: 2026-08-10

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
content/docs/en/      MDX documentation source
lib/source.ts         Fumadocs content source adapter
lib/shared.ts         site constants (URL, tagline, repo and npm links, install command)
lib/layout.shared.tsx nav options shared by the home and docs layouts
lib/i18n.ts           i18n config (locales, default locale)
proxy.ts              i18n routing plus the non-localized route allowlist
```

### Two things that will bite you

1. **`app/[lang]/layout.tsx` is the root layout. There is no `app/layout.tsx`.** That is what makes `<html lang>` dynamic, and it is legal only because nothing outside `[lang]` is a page. Do not add one.
2. **A new top-level route must be added to `NON_LOCALIZED_ROUTES` in `proxy.ts`.** Otherwise the i18n proxy rewrites it into `/en/...`, which 404s - and the redirect step still reports 200, so nothing looks wrong. This has already cost five debugging sessions across the two sites. `npm run check:routes` asserts every such route serves 200 under `redirect: "manual"`, which is the guard that catches it.

### Commands

```bash
npm run dev   # local dev server
```

The gate, run by CI and `.githooks/pre-push`:

```bash
npm run lint && npm run types:check && npm run check:samples && npm run format:check && npm run build
```

### Conventions

- Prettier, not Biome (unlike the package repo) - double quotes, semicolons, 100-column lines. Do not hand-format - run `npm run format`.
- Conventional Commits, imperative subject `<=` 50 chars, body wrapped at 72, no trailing period, no `Co-Authored-By` or `Generated with` trailers.
- **Never use em-dashes.** Use a hyphen instead.
- Markdown prose is never hard-wrapped: one line per paragraph and per list item. Do not re-wrap these files to a column.
- The PR title becomes the squash commit message.
- `main` is protected: PR required, squash-only merges.

### Cross-repo coupling

This is the most important thing in this file. This site owns its documentation **content**; the `ai-sdk-threads` package itself lives in a separate repo, [`nixrajput/ai-sdk-threads`](https://github.com/nixrajput/ai-sdk-threads). When the package's public API changes, the matching documentation change happens **here**, in a separate PR against this repo - never bundled into a PR on the package repo.

`npm run check:samples` is what keeps that split honest: it extracts every `ts`/`tsx` code fence from `content/docs/**` and typechecks it against `ai-sdk-threads` **installed from npm**, so the docs prove the shipped package behaves as documented. Mark a fence `notype` only when it illustrates prose rather than usable code, and `fragment` when it assumes the ambient `db`, `store` and `threadId` the extractor declares.

### Versioning

This site is not versioned and not published. No PR here ever needs to bump a version number, and there is no release workflow to trigger.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<div align="center">

<img src="https://raw.githubusercontent.com/nixrajput/ai-sdk-threads/main/assets/logo.svg" width="76" alt="ai-sdk-threads">

# ai-sdk-threads docs

<em>The site behind <a href="https://www.npmjs.com/package/ai-sdk-threads">ai-sdk-threads</a> - including a Postgres that runs in your browser.</em>

<br />

[![CI](https://github.com/nixrajput/ai-sdk-threads-docs/actions/workflows/ci.yml/badge.svg)][ci]
[![Stars](https://img.shields.io/github/stars/nixrajput/ai-sdk-threads-docs?color=159F7C)][repo]
[![Contributors](https://img.shields.io/github/contributors/nixrajput/ai-sdk-threads-docs?color=159F7C)][contributors]
[![License: MIT](https://img.shields.io/github/license/nixrajput/ai-sdk-threads-docs?color=159F7C)][license]
[![Last commit](https://img.shields.io/github/last-commit/nixrajput/ai-sdk-threads-docs?label=last%20commit)][repo]
[![Issues](https://img.shields.io/github/issues/nixrajput/ai-sdk-threads-docs?label=issues)][issues]
[![PRs](https://img.shields.io/github/issues-pr/nixrajput/ai-sdk-threads-docs?label=PRs)][pulls]

<strong>Next.js 16 &middot; Fumadocs &middot; i18n from day one &middot; code samples typechecked against the published package</strong><br>
<sub>Every <code>ts</code> and <code>tsx</code> fence in these docs is extracted and compiled against <code>ai-sdk-threads</code> <strong>installed from npm</strong>, so a sample that stops matching the shipped package fails the build rather than misleading a reader. Three checks gate a PR beyond lint and types: <code>check:samples</code>, <code>check:routes</code>, and <code>check:vitals</code>.</sub>

<br />

**[Live site][site]** &middot; [Getting started][docs-start] &middot; [API reference][docs-api] &middot; [Playground][docs-playground] &middot; [llms.txt][llms]

<sub><b>AI agents / LLMs:</b> this documentation is machine-readable at <a href="https://ai-sdk-threads.nixrajput.com/llms.txt"><code>llms.txt</code></a>, or as one blob at <a href="https://ai-sdk-threads.nixrajput.com/llms-full.txt"><code>llms-full.txt</code></a>.</sub>

</div>

---

## Contents

- [ai-sdk-threads docs](#ai-sdk-threads-docs)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Tech stack](#tech-stack)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Run](#run)
  - [Project structure](#project-structure)
  - [The checks a PR must pass](#the-checks-a-pr-must-pass)
  - [Adding a docs page](#adding-a-docs-page)
  - [Adding a language](#adding-a-language)
  - [Contributing](#contributing)
  - [Contributors](#contributors)
  - [License](#license)
  - [Support the project](#support-the-project)
  - [Connect](#connect)

## Overview

This repo holds the documentation content and the site that serves it, live at [ai-sdk-threads.nixrajput.com](https://ai-sdk-threads.nixrajput.com). It does not hold the `ai-sdk-threads` package itself - that lives at [nixrajput/ai-sdk-threads](https://github.com/nixrajput/ai-sdk-threads) and publishes to [npm](https://www.npmjs.com/package/ai-sdk-threads). Package-behavior changes go there; documentation changes come here, in a separate PR.

## Tech stack

| Area        | Choice                        |
| ----------- | ----------------------------- |
| Framework   | Next.js 16 (App Router)       |
| UI          | React 19                      |
| Docs engine | Fumadocs 16                   |
| Styling     | Tailwind CSS 4                |
| Language    | TypeScript (strict), ESM only |
| Deployment  | Vercel                        |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) `>=20.9` - Next 16's own floor, so `20.0` through `20.8` will not install
- npm

### Install

```bash
git clone https://github.com/nixrajput/ai-sdk-threads-docs.git
cd ai-sdk-threads-docs
npm install
```

### Run

```bash
npm run dev
```

Open http://localhost:3000. The root redirects to `/en`.

## Project structure

```
app/[lang]/...       route segments (i18n-aware; [lang] currently resolves to "en")
app/[lang]/playground  the PGlite demo route
content/docs/en/     MDX documentation source
components/          site chrome and homepage components
lib/source.ts        Fumadocs content source adapter
lib/i18n.ts          i18n config (locales, default locale)
lib/shared.ts        shared site constants (URLs, copy, developer info)
lib/playground-ddl.ts  the demo's CREATE TABLE statements
scripts/             the three checks plus the PGlite asset copy
proxy.ts             i18n routing plus the non-localized route allowlist
```

Three structural details that are easy to trip over:

- **`app/[lang]/layout.tsx` is the root layout, and there is no `app/layout.tsx`.** That is what makes `<html lang>` dynamic, and it works only because nothing outside `[lang]` is a page.
- **A new top-level route must be added to `NON_LOCALIZED_ROUTES` in `proxy.ts`.** Otherwise the i18n proxy rewrites it into `/en/...`, which 404s - and because that happens at the redirect step, the response still reports 200, so nothing looks broken. `npm run check:routes` asserts every such route serves 200 under `redirect: "manual"`, which is the guard that catches it. This has caught out both sites repeatedly, most recently on `/pglite`.
- **The playground loads PGlite from `/pglite` at runtime, not through the bundler.** Turbopack rewrites its Emscripten glue into something that throws `m.instantiateWasm is not a function`, so `scripts/copy-pglite.mjs` copies the dist into `public/pglite` on `prebuild`/`predev` and the component imports it through a variable specifier no bundler can analyse. Those assets are gitignored, so a fresh clone needs one `npm run build` or `npm run dev` before the demo works.

## The checks a PR must pass

CI runs exactly this set, and `.githooks/pre-push` runs the first five locally if you opt in (`git config core.hooksPath .githooks`):

```bash
npm run lint          # eslint
npm run types:check   # next typegen + tsc --noEmit
npm run check:samples # extract + typecheck docs code samples
npm run format:check  # prettier --check
npm run build         # next build (prebuild copies the PGlite assets)
npm run check:routes  # end-to-end route check, against `npm start`
npm run check:vitals  # per-route payload and response-time budgets
```

`npm run format` rewrites formatting if `format:check` complains. No version bump is required - this site is not versioned or published.

`check:samples` is worth understanding before writing a code block: it extracts every `ts` and `tsx` fence from `content/docs/**` and typechecks it against `ai-sdk-threads` **installed from npm**, not a local build, so the docs prove the shipped package behaves as documented. Two fence flags exist - `notype` opts a fence out, for prose illustrations and raw SQL, and `fragment` wraps it in a preamble declaring an ambient `db`, `store`, `threadId` and `messageId` so short snippets need no setup.

## Adding a docs page

1. Create the MDX file under `content/docs/en/`.
2. Add its slug to the relevant `meta.json` in that directory, so it shows up in the sidebar.
3. Run `npm run dev` and check the page renders.

## Adding a language

The i18n wiring supports additional locales already. Adding one takes exactly two steps:

1. Add the language code to `languages` and its display name to `localeNames`, both in `lib/i18n.ts`.
2. Create `content/docs/<code>/` mirroring `content/docs/en/` - the same file and directory names, including each `meta.json`, with translated frontmatter `title`/`description` and body.

No layout, provider, proxy, or route file needs any edit.

A few things worth knowing before you start:

- Untranslated pages fall back to English automatically, so a partial translation is a valid PR - you do not need to translate everything at once.
- Code samples inside MDX should not be translated. They are typechecked against the real package by `npm run check:samples`, and translating identifiers will fail that check. Translate the prose around them instead.
- Every URL carries its locale (`/en/...`, `/<code>/...`), so a new language never changes existing URLs.
- Run [the checks a PR must pass](#the-checks-a-pr-must-pass) before opening the PR.

## Contributing

Contributions are welcome. Fork, branch, and open a PR - see [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow. Bugs and ideas go to [Issues][issues]. Vulnerabilities in the site follow [SECURITY.md](SECURITY.md); vulnerabilities in the package belong in [the package repo's advisories](https://github.com/nixrajput/ai-sdk-threads/security/advisories/new).

## Contributors

Thanks to everyone who has contributed to the ai-sdk-threads docs.

<a href="https://github.com/nixrajput/ai-sdk-threads-docs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nixrajput/ai-sdk-threads-docs" alt="Contributors" />
</a>

## License

Licensed under the **MIT** license - see [LICENSE](LICENSE).

## Support the project

<div align="center">

This site is MIT licensed and free to use, always. If it helps you get more out of ai-sdk-threads, sponsorship is welcome.

<br />

<a href="https://github.com/sponsors/nixrajput">
  <img src="https://img.shields.io/badge/Sponsor_on_GitHub-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="GitHub Sponsors" />
</a>
<a href="https://ko-fi.com/nixrajput">
  <img src="https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white" alt="Ko-fi" />
</a>
<a href="https://www.buymeacoffee.com/nixrajput">
  <img src="https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy Me a Coffee" />
</a>

</div>

## Connect

<div align="center">

**Nikhil Rajput**

<a href="https://github.com/nixrajput"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
<a href="https://linkedin.com/in/nixrajput"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
<a href="https://x.com/nixrajput"><img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
<a href="https://instagram.com/nixrajput"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
<a href="https://telegram.me/nixrajput"><img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" /></a>
<a href="mailto:nkr.nikhil.nkr@gmail.com"><img src="https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>

</div>

[ci]: https://github.com/nixrajput/ai-sdk-threads-docs/actions/workflows/ci.yml
[site]: https://ai-sdk-threads.nixrajput.com
[llms]: https://ai-sdk-threads.nixrajput.com/llms.txt
[docs-start]: https://ai-sdk-threads.nixrajput.com/en/docs/getting-started
[docs-api]: https://ai-sdk-threads.nixrajput.com/en/docs/api/chat-handler
[docs-playground]: https://ai-sdk-threads.nixrajput.com/en/playground
[repo]: https://github.com/nixrajput/ai-sdk-threads-docs
[issues]: https://github.com/nixrajput/ai-sdk-threads-docs/issues
[pulls]: https://github.com/nixrajput/ai-sdk-threads-docs/pulls
[contributors]: https://github.com/nixrajput/ai-sdk-threads-docs/graphs/contributors
[license]: https://github.com/nixrajput/ai-sdk-threads-docs/blob/main/LICENSE

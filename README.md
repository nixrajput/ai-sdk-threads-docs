# ai-sdk-threads docs

[![CI](https://github.com/nixrajput/ai-sdk-threads-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/nixrajput/ai-sdk-threads-docs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Documentation site for [ai-sdk-threads](https://github.com/nixrajput/ai-sdk-threads), chat thread and message persistence for the Vercel AI SDK. Built with Next.js and Fumadocs.

Live at https://ai-sdk-threads.nixrajput.com.

**This repo holds documentation content and the site that serves it, not the package.** The package lives at [nixrajput/ai-sdk-threads](https://github.com/nixrajput/ai-sdk-threads) and is published to [npm](https://www.npmjs.com/package/ai-sdk-threads). A change to the package's behavior belongs there; a change to how it is documented belongs here.

## Running locally

Requires Node.js `>=20.9` (Next 16's own floor) and npm. CI runs Node 22.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root redirects to `/en`.

## Scripts

| Script                  | What it does                                                              |
| ----------------------- | ------------------------------------------------------------------------- |
| `npm run dev`           | Dev server                                                                |
| `npm run build`         | Production build; fails on broken MDX and bad internal links              |
| `npm start`             | Serve the production build, needed by `check:routes`                       |
| `npm run lint`          | ESLint                                                                    |
| `npm run types:check`   | `next typegen` then `tsc --noEmit`                                        |
| `npm run check:samples` | Extracts every docs code fence and typechecks it against the npm package  |
| `npm run check:routes`  | End-to-end route check against a running server                           |
| `npm run format`        | Prettier write                                                            |
| `npm run format:check`  | Prettier check, part of the gate                                          |

The full gate, which CI and `.githooks/pre-push` both run:

```bash
npm run lint && npm run types:check && npm run check:samples && npm run format:check && npm run build
```

## Adding a docs page

1. Create the MDX file under `content/docs/en/`. Content is per-locale by directory, because `lib/i18n.ts` sets `parser: "dir"` and `hideLocale: "never"` - so every URL carries its locale and adding a language later rewrites no indexed URL.
2. Add its slug to the relevant `meta.json` in that directory so it appears in the sidebar.
3. Run `npm run dev` and check it renders.

`en` is currently the only locale. Adding another touches exactly two things: `lib/i18n.ts` and a new `content/docs/<code>/` directory.

## Two things that will bite you

**`app/[lang]/layout.tsx` is the root layout, and there is no `app/layout.tsx`.** That is what makes `<html lang>` dynamic, and it works only because nothing outside `[lang]` is a page. Do not add one.

**A new top-level route must be added to `NON_LOCALIZED_ROUTES` in `proxy.ts`.** Otherwise the i18n proxy rewrites it into `/en/...`, which 404s - and because the failure happens at the redirect step, the response still reports 200, so nothing looks broken. `npm run check:routes` asserts every such route serves 200 under `redirect: "manual"`, which is the guard that catches it.

## Code samples are typechecked

`npm run check:samples` extracts every `ts` and `tsx` fence from `content/docs/**` and typechecks it against `ai-sdk-threads` **installed from npm**, not a local build. A sample that stops compiling fails the build, so the docs prove the *shipped* package behaves as documented. Two fence flags:

- `notype` - opts a fence out, for prose illustrations and raw SQL.
- `fragment` - wraps the fence in a preamble that declares an ambient `db`, `store`, `threadId` and `messageId`, so short snippets need no setup boilerplate.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). This site is not versioned or published, so no PR here ever needs a version bump. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Vulnerabilities in the **site** follow [SECURITY.md](SECURITY.md). Vulnerabilities in the **package** belong in the [package repo](https://github.com/nixrajput/ai-sdk-threads/security/advisories/new). Never a public issue, either way.

## License

MIT. See [LICENSE](LICENSE).

## Support the project

If these docs saved you time, a star on [the package repo](https://github.com/nixrajput/ai-sdk-threads) helps more people find it.

## Connect

- Portfolio: https://nixrajput.com
- GitHub: [@nixrajput](https://github.com/nixrajput)

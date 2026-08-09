# Contributing to mcp-vitest docs

Thanks for your interest in improving the mcp-vitest documentation site. This repo holds the docs content and the Next.js/Fumadocs site that serves it at https://mcp-vitest.nixrajput.com - it does not hold the package itself, which lives at [nixrajput/mcp-vitest](https://github.com/nixrajput/mcp-vitest).

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to be respectful, considerate, and inclusive when interacting with the project and its community.

## Getting set up

Requires Node.js `>=20` and npm.

```bash
git clone https://github.com/nixrajput/mcp-vitest-docs.git
cd mcp-vitest-docs
npm install
git config core.hooksPath .githooks   # optional: runs the checks below before each push
npm run dev
```

Open http://localhost:3000 to see the site.

## The checks

Every one of these must pass before a PR can merge - CI runs exactly the same set:

```bash
npm run lint          # eslint
npm run types:check   # next typegen + tsc --noEmit
npm run check:samples # extract + typecheck docs code samples
npm run format:check  # prettier --check
npm run build         # next build
```

`npm run format` rewrites formatting if `format:check` complains.

**No version bump is required.** Unlike the package repo, this site is not versioned or published, so a PR here never needs to touch a version field.

## Adding a docs page

1. Create the MDX file under `content/docs/en/`.
2. Add its slug to the relevant `meta.json` in that directory, so it shows up in the sidebar.
3. Run `npm run dev` and check the page renders as expected.

`en` is currently the only locale the site serves.

## Workflow

1. **Fork and branch.** Branch off `main` with a descriptive name (`docs/add-matchers-page`, `fix/broken-link`).
2. **Keep the diff surgical.** Every changed line should trace to the change you are making. No drive-by refactors, no speculative abstractions.
3. **Docs belong here, package changes don't.** If the change is about the npm package's behavior rather than its documentation, it belongs in [nixrajput/mcp-vitest](https://github.com/nixrajput/mcp-vitest) instead.
4. **Open the PR.** Fill in the template. The PR title becomes the squash commit message on merge, so write it in Conventional Commit form (`docs: add matchers page`) and keep it under ~50 characters.

## Conventions

- **Commits:** Conventional Commits (`docs:`, `fix:`, `feat:`, `ci:`, `chore:`, `refactor:`), imperative subject, no trailing period.
- **Style:** Prettier, double quotes, semicolons, 100-column lines. Do not hand-format - run `npm run format`.
- **Language:** TypeScript, ESM only, Node `>=20`.
- **Comments:** explain why, not what. Most code needs none.

## Reporting issues

Bugs and feature requests go to [Issues](https://github.com/nixrajput/mcp-vitest-docs/issues). Security issues follow [SECURITY.md](SECURITY.md) instead - never a public issue.

## Thank you

Every issue, fix, and PR makes these docs more useful. Thanks for taking the time.

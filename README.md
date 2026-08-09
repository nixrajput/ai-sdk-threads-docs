# mcp-vitest docs

Documentation site for [mcp-vitest](https://github.com/nixrajput/mcp-vitest), a Vitest-native testing harness for Model Context Protocol servers. Built with Next.js and Fumadocs.

Live at https://mcp-vitest.nixrajput.com.

## Running locally

Requires Node.js `>=20`.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Adding a docs page

Create an MDX file under `content/docs/en/`, then add its slug to the relevant `meta.json` so it appears in the sidebar. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.

## Package repo

This repo holds documentation content and the site that serves it - not the package. The mcp-vitest package itself lives at [nixrajput/mcp-vitest](https://github.com/nixrajput/mcp-vitest).

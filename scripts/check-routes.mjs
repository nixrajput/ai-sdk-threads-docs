// End-to-end route check against a running `next start` server: docs pages, API
// pages, sitemap/robots, and the unprefixed og-image + llms markdown routes
// (see lib/source.ts) that must never gain a locale prefix. Run via `npm run check:routes`.
const base = process.env.BASE_URL ?? "http://localhost:3000";

// Without this, a server that is not running fails as an undici stack trace that says
// nothing about what to do.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  try {
    return await originalFetch(...args);
  } catch {
    console.error(`FAIL: nothing is listening at ${base}`);
    console.error("Start the site first:  npm start   (or BASE_URL=... npm run check:routes)");
    process.exit(1);
  }
};

// Routes whose page does not exist yet. Listed rather than omitted so a shortened
// check is visible in the output instead of reading as full coverage. Empty this
// as the pages land; the run fails once it is empty and a route still 404s.
const PENDING = new Set();

async function expectOk(path) {
  if (PENDING.has(path)) {
    console.log(`SKIP: ${path} not built yet`);
    return;
  }
  const r = await fetch(`${base}${path}`);
  if (!r.ok) {
    console.error(`FAIL: ${path} returned ${r.status}`);
    process.exit(1);
  }
}

const res = await fetch(`${base}/en/docs`, { redirect: "manual" });
if (!res.ok) {
  console.error(`FAIL: /en/docs returned ${res.status}, expected 200`);
  process.exit(1);
}
console.log("PASS: /en/docs serves 200");

const home = await fetch(`${base}/en`);
const html = await home.text();
for (const needle of [
  "ai-sdk-threads",
  "npm i ai-sdk-threads",
  "Chat persistence for the Vercel AI SDK",
]) {
  if (!html.includes(needle)) {
    console.error(`FAIL: home page missing ${JSON.stringify(needle)}`);
    process.exit(1);
  }
}
console.log("PASS: home page renders its positioning copy");

// The proxy rewriting /_next/** kills every stylesheet while the page still returns 200.
// Discovered by reference, not by path: Next 16 emits CSS under static/chunks, so a
// hardcoded static/css path matches nothing and reads as a pass.
const sheets = [...html.matchAll(/href="(\/_next\/[^"]+\.css)"/g)].map((m) => m[1]);
if (sheets.length === 0) {
  console.error("FAIL: home page references no stylesheet");
  process.exit(1);
}
for (const sheet of sheets) {
  const r = await fetch(`${base}${sheet}`, { redirect: "manual" });
  const body = r.ok ? await r.text() : "";
  if (!r.ok || body.length === 0) {
    console.error(`FAIL: stylesheet ${sheet} returned ${r.status} with ${body.length} bytes`);
    process.exit(1);
  }
}
console.log(`PASS: ${sheets.length} stylesheet(s) serve with content`);

// The pill renders nothing when the registry fetch fails, deliberately - so a missing pill
// is reported, not failed: CI cannot tell an outage from a regression. React splits adjacent
// text nodes with comment markers, so strip those before matching.
const pill = html.replace(/<!-- -->/g, "").match(/v(\d+\.\d+\.\d+) on npm/);
if (pill) console.log(`PASS: home page shows the package version (v${pill[1]})`);
else console.log("WARN: home page shows no version pill - registry fetch failed, or a regression");

for (const path of ["/en/docs", "/en/docs/getting-started", "/en/docs/api"]) await expectOk(path);
console.log("PASS: docs skeleton pages render");

const API_PAGES = [
  "chat-handler",
  "resumable-chat",
  "store",
  "branching",
  "convert",
  "sqlite",
  "schema",
];
for (const slug of API_PAGES) await expectOk(`/en/docs/api/${slug}`);
const built = API_PAGES.filter((s) => !PENDING.has(`/en/docs/api/${s}`)).length;
console.log(`PASS: ${built} of ${API_PAGES.length} API pages render`);

for (const path of ["/en/docs/migrating", "/en/docs/importing", "/en/playground"])
  await expectOk(path);

for (const path of ["/sitemap.xml", "/robots.txt"]) await expectOk(path);
console.log("PASS: sitemap and robots served");

// The docs index is used rather than an API page so this assertion holds from the
// first commit; both routes live outside app/[lang] and must stay locale-free.
for (const path of ["/og/docs/image.png", "/llms.mdx/docs/content.md"]) await expectOk(path);
console.log("PASS: og-image and llms markdown routes serve unprefixed");

// Non-localized routes must serve directly, never via a redirect. This is the
// class of bug that has bitten five times: the i18n proxy rewrites a top-level
// route into /en/..., which 404s, and the redirect step still reports 200.
for (const path of [
  "/icon.svg",
  "/apple-icon",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  // The playground fetches these at runtime; a locale redirect here breaks the demo
  // with a WASM error that looks like a bundler problem rather than a routing one.
  "/pglite/pglite.wasm",
  "/pglite/initdb.wasm",
  "/pglite/pglite.data",
]) {
  const r = await fetch(`${base}${path}`, { redirect: "manual" });
  if (r.status !== 200) {
    console.error(
      `FAIL: ${path} returned ${r.status}, expected 200 with no redirect. ` +
        "Add it to NON_LOCALIZED_ROUTES in proxy.ts.",
    );
    process.exit(1);
  }
}
console.log("PASS: non-localized routes serve without a locale redirect");

if (PENDING.size > 0) console.log(`NOTE: ${PENDING.size} route(s) skipped as not yet built`);

// Vercel serves the analytics script only in production, so a local 404 is expected
// and only the redirect can be checked here.
{
  const path = "/_vercel/insights/script.js";
  const r = await fetch(`${base}${path}`, { redirect: "manual" });
  const location = r.headers.get("location") ?? "";
  if (location.includes("/_vercel")) {
    console.error(
      `FAIL: ${path} redirected to ${location}. Vercel's edge serves this path, so a ` +
        "locale prefix 404s it and Web Analytics collects nothing. Keep /_vercel in " +
        "NON_LOCALIZED_ROUTES in proxy.ts.",
    );
    process.exit(1);
  }
}
console.log("PASS: analytics script not locale-redirected");

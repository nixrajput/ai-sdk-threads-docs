// End-to-end route check against a running `next start` server: docs pages, API
// pages, sitemap/robots, and the unprefixed og-image + llms markdown routes
// (see lib/source.ts) that must never gain a locale prefix. Run via `npm run check:routes`.
const base = process.env.BASE_URL ?? "http://localhost:3000";
const res = await fetch(`${base}/en/docs`, { redirect: "manual" });
if (!res.ok) {
  console.error(`FAIL: /en/docs returned ${res.status}, expected 200`);
  process.exit(1);
}
console.log("PASS: /en/docs serves 200");

const home = await fetch(`${base}/en`);
const html = await home.text();
for (const needle of ["mcp-vitest", "npm i -D mcp-vitest", "both MCP SDK majors"]) {
  if (!html.includes(needle)) {
    console.error(`FAIL: home page missing ${JSON.stringify(needle)}`);
    process.exit(1);
  }
}
console.log("PASS: home page renders its positioning copy");

for (const path of ["/en/docs", "/en/docs/getting-started"]) {
  const r = await fetch(`${base}${path}`);
  if (!r.ok) {
    console.error(`FAIL: ${path} returned ${r.status}`);
    process.exit(1);
  }
}
console.log("PASS: docs skeleton pages render");

const API_PAGES = [
  "mcp-test", "harness", "matchers", "doubles",
  "notifications", "snapshots", "external-servers", "lifecycles",
];
for (const slug of API_PAGES) {
  const r = await fetch(`${base}/en/docs/api/${slug}`);
  if (!r.ok) {
    console.error(`FAIL: /en/docs/api/${slug} returned ${r.status}`);
    process.exit(1);
  }
}
console.log(`PASS: all ${API_PAGES.length} API pages render`);

for (const path of ["/sitemap.xml", "/robots.txt"]) {
  const r = await fetch(`${base}${path}`);
  if (!r.ok) {
    console.error(`FAIL: ${path} returned ${r.status}`);
    process.exit(1);
  }
}
console.log("PASS: sitemap and robots served");

for (const path of ["/og/docs/api/harness/image.png", "/llms.mdx/docs/api/harness/content.md"]) {
  const r = await fetch(`${base}${path}`);
  if (!r.ok) {
    console.error(`FAIL: ${path} returned ${r.status}`);
    process.exit(1);
  }
}
console.log("PASS: og-image and llms markdown routes serve unprefixed");

// Non-localized routes must serve directly, never via a redirect. This is the
// class of bug that has bitten five times: the i18n proxy rewrites a top-level
// route into /en/..., which 404s, and the redirect step still reports 200.
for (const path of ["/icon.svg", "/apple-icon", "/sitemap.xml", "/robots.txt", "/llms.txt"]) {
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

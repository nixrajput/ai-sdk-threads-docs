// Measures what the browser actually downloads per route, plus server response time, and
// fails on regression. Deliberately not Lighthouse: this runs against `npm start` with no
// browser dependency, so it is stable enough to gate a PR. Real LCP and CLS need a browser
// and are measured by hand before a release rather than gated here - a flaky perf gate
// teaches people to ignore CI.
//
// Budgets are set from measurement, not aspiration; see the table in the docs-site plan.
const base = process.env.BASE_URL ?? "http://localhost:3100";

const BUDGETS = [
  // The marketing page and the docs are the pages that must stay light.
  { path: "/en", js: 800, ttfb: 800 },
  { path: "/en/docs", js: 850, ttfb: 800 },
  // The playground downloads a database on purpose. Its budget covers the shell only:
  // PGlite is fetched after mount, so it must not appear in the initial payload.
  { path: "/en/playground", js: 700, ttfb: 800 },
];

let failed = false;

for (const { path, js: jsBudget, ttfb: ttfbBudget } of BUDGETS) {
  const started = Date.now();
  const res = await fetch(`${base}${path}`);
  const html = await res.text();
  const ttfb = Date.now() - started;

  if (!res.ok) {
    console.error(`FAIL: ${path} returned ${res.status}`);
    failed = true;
    continue;
  }

  const assets = [
    ...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1])),
  ];
  let bytes = 0;
  for (const asset of assets) {
    const r = await fetch(`${base}${asset}`);
    bytes += (await r.arrayBuffer()).byteLength;
  }
  const kb = bytes / 1024;

  // PGlite is a few megabytes; if it ever lands in an initial payload this catches it
  // long before the size budget would.
  if (html.includes("pglite") && path !== "/en/playground") {
    console.error(`FAIL: ${path} references pglite in its initial HTML`);
    failed = true;
  }

  const over = kb > jsBudget || ttfb > ttfbBudget;
  if (over) failed = true;
  console.log(
    `${over ? "FAIL" : "PASS"}: ${path} js=${kb.toFixed(1)}KB (budget ${jsBudget}) ttfb=${ttfb}ms (budget ${ttfbBudget})`,
  );
}

if (failed) process.exit(1);
console.log("PASS: every route inside its budget");

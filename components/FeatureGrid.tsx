// Every entry restates a shipped feature from the package README. Nothing here is
// aspirational: if a claim leaves the package, it leaves this list.
const FEATURES = [
  {
    title: "One-line chat route",
    body: "chatHandler replaces the load, store, stream, store boilerplate every AI SDK app writes by hand.",
  },
  {
    title: "Branching",
    body: "Edit or regenerate and the old version survives as a sibling, the way ChatGPT does it.",
  },
  {
    title: "Resumable streams",
    body: "resumableChat ships the POST, GET and DELETE trio, so a reload mid-answer picks the stream back up.",
  },
  {
    title: "Postgres or SQLite",
    body: "One ThreadStore contract over either, verified by a parity suite run against both.",
  },
  {
    title: "UIMessage-native",
    body: "Parts and metadata stored verbatim, never flattened to a content string that loses tool calls.",
  },
  {
    title: "Zero runtime dependencies",
    body: "ai, drizzle-orm and resumable-stream are peers, the last two optional. Install only what you use.",
  },
  {
    title: "Keyset pagination",
    body: "listThreads pages by cursor rather than OFFSET: one query per page, and a page 50,000 rows deep measured 1.13x the first.",
  },
  {
    title: "Edge-safe core",
    body: "No Node globals anywhere in src, enforced by a second typecheck that compiles without Node types.",
  },
];

export function FeatureGrid() {
  return (
    /* The one muted band on the page: it separates this block from the sections around it, which is
       what the rules between sections were doing less quietly. */
    <section id="coverage" className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          Coverage
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">What ai-sdk-threads gives you</h2>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-interactive flex flex-col gap-2 p-5">
              <dt className="text-base font-medium">{f.title}</dt>
              <dd className="text-fd-muted-foreground text-sm leading-relaxed">{f.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

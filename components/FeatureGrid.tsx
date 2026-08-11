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
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-(--site-width) border-t border-(--line) px-4 py-12">
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
        Coverage
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">What ai-sdk-threads gives you</h2>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="card hover:bg-fd-accent/40 flex flex-col gap-2 p-4 transition-colors"
          >
            <dt className="text-base font-medium">{f.title}</dt>
            <dd className="text-fd-muted-foreground text-sm">{f.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

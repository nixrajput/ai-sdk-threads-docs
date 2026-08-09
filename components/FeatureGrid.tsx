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
    <section className="mx-auto max-w-3xl px-4 pb-12">
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
        Coverage
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">What ai-sdk-threads gives you</h2>
      <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t border-(--line) pt-3">
            <dt className="font-semibold">{f.title}</dt>
            <dd className="text-fd-muted-foreground mt-1 text-sm">{f.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

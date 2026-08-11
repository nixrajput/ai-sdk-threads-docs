// Both panes are the real samples from /en/docs/api/chat-handler, which
// check:samples typechecks against the published package - so the comparison cannot
// drift into a strawman, and no external line count has to be taken on trust.
const BY_HAND = `const { id, messages } = await req.json();

const existing = await store.loadMessages(id);
const known = new Set(existing.map((m) => m.id));
const fresh = messages.filter((m) => m.role === "user" && !known.has(m.id));
if (fresh.length > 0) await store.appendMessages(id, fresh);

const history = [...existing, ...fresh];
const result = streamText({
  model: openai("gpt-5"),
  messages: await convertToModelMessages(history),
});

let persisted = false;
const persist = async ({ responseMessage }) => {
  if (persisted || responseMessage.parts.length === 0) return;
  persisted = true;
  await store.appendMessages(id, [responseMessage]);
};

return result.toUIMessageStreamResponse({
  generateMessageId: generateId,
  onEnd: persist,
  onFinish: persist,
});`;

const WITH_HANDLER = `export const POST = chatHandler({
  store,
  execute: ({ modelMessages }) =>
    streamText({
      model: openai("gpt-5"),
      messages: modelMessages,
    }),
});`;

function Pane({
  label,
  note,
  code,
  accent,
}: {
  label: string;
  note: string;
  code: string;
  accent: string;
}) {
  return (
    <div className="card flex flex-col sm:row-span-3 sm:grid sm:grid-rows-subgrid">
      <div className="border-fd-border flex items-baseline justify-between gap-2 border-b px-3 py-2">
        <span className="font-mono text-xs" style={{ color: accent }}>
          {label}
        </span>
        <span className="text-fd-muted-foreground font-mono text-[0.65rem]">
          {code.split("\n").length} lines
        </span>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[0.7rem] leading-relaxed">
        <code>{code}</code>
      </pre>
      <p className="text-fd-muted-foreground border-fd-border border-t px-3 py-2 text-xs">{note}</p>
    </div>
  );
}

export function BoilerplateContrast() {
  return (
    <section className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          The route
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Same behaviour, one call</h2>
        <p className="text-fd-muted-foreground mt-2 text-sm">
          Both of these are in the docs and both typecheck against the published package on every
          build. The left one is what the persistence pattern asks you to maintain per app.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:grid-rows-[auto_1fr_auto]">
          <Pane
            label="by hand"
            accent="var(--stale)"
            code={BY_HAND}
            note="Miss generateMessageId and replies store with an empty id. Register only onEnd and nothing persists on ai 6. Forget to filter and every turn duplicates rows."
          />
          <Pane
            label="ai-sdk-threads"
            accent="var(--live)"
            code={WITH_HANDLER}
            note="Plus authorization, branching, and the truncated-reply handling the left pane does not attempt."
          />
        </div>
      </div>
    </section>
  );
}

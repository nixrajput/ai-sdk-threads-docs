import Link from "next/link";

const COLUMNS = [
  { key: "scope", label: "Scope" },
  { key: "where", label: "Where the data lives" },
  { key: "branching", label: "Branching stored" },
  { key: "migration", label: "AI SDK major migration" },
  { key: "ui", label: "Chat UI components" },
  { key: "hosted", label: "Hosted sync and search" },
  { key: "cost", label: "Cost" },
] as const;

type CellKey = (typeof COLUMNS)[number]["key"];

const ROWS: {
  name: string;
  href?: string;
  lead?: boolean;
  /** Columns where THIS tool is ahead of the others. One marker serves both directions, so a
      row we lose reads the same as a row we win rather than being coded as a defeat. */
  leads?: CellKey[];
  cells: Record<CellKey, string>;
}[] = [
  {
    name: "ai-sdk-threads",
    lead: true,
    leads: ["where", "branching", "migration"],
    cells: {
      scope: "Threads, messages, branching, resumable streams",
      where: "Your Postgres or SQLite",
      branching: "Yes - the old answer stays as a sibling",
      migration: "sdk_version on every row, plus a migrate CLI",
      ui: "No - ai-elements and assistant-ui own that layer",
      hosted: "No",
      cost: "MIT, no service",
    },
  },
  {
    name: "The AI SDK persistence guide",
    href: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence",
    cells: {
      scope: "A pattern to copy into each app",
      where: "Yours",
      branching: "No",
      migration: "No",
      ui: "-",
      hosted: "No",
      cost: "Free, hand-maintained",
    },
  },
  {
    name: "assistant-ui cloud",
    href: "https://www.assistant-ui.com",
    // Genuinely ahead of us on both: it ships the component library we deliberately do not, and
    // sells the hosted layer this package deliberately has none of.
    leads: ["ui", "hosted"],
    cells: {
      scope: "UI plus hosted persistence",
      where: "Their infrastructure",
      branching: "No",
      migration: "Their concern rather than yours",
      ui: "A full component library",
      hosted: "Sync, search and analytics",
      cost: "Per active user",
    },
  },
  {
    name: "Convex",
    href: "https://www.convex.dev",
    leads: ["hosted"],
    cells: {
      scope: "A whole reactive backend",
      where: "Their platform",
      branching: "No",
      migration: "Yours to write",
      ui: "No",
      hosted: "Reactive sync, search and functions",
      cost: "Per usage",
    },
  },
  {
    name: "Vercel's ai-chatbot template",
    href: "https://github.com/vercel/ai-chatbot",
    leads: ["ui"],
    cells: {
      scope: "An app to fork",
      where: "Yours",
      branching: "No",
      migration: "A second Message_v2 table, by hand",
      ui: "A whole app, already styled",
      hosted: "No",
      cost: "Free, fork-and-own",
    },
  },
];

// Cells reading "No" or "-" are both absences, but not the same kind: "-" means the
// concept does not apply to a pattern rather than a product, "No" means it was not built.
// Both get the same muted weight here; the wording carries the distinction, not the color.
function isAbsent(cell: string) {
  return cell === "No" || cell === "-";
}

export function Comparison() {
  return (
    <section id="compare" className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          Alternatives
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Compared to the alternatives</h2>
        <p className="text-fd-muted-foreground mt-3 flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-full bg-(--live) align-middle"
          />
          marks the tool ahead on that row, whichever tool it is
        </p>
        {/* One card per tool below md. Five columns on a phone leaves about 60px each, and a
            min-width wide enough to fix that made the page itself scroll sideways. */}
        <div className="mt-6 grid gap-4 md:hidden">
          {ROWS.map((row) => (
            <div key={row.name} className="card p-5">
              <p className={`font-semibold ${row.lead ? "text-(--live)" : "text-(--paper)"}`}>
                {row.href ? (
                  <a href={row.href} className="hover:underline">
                    {row.name}
                  </a>
                ) : (
                  row.name
                )}
              </p>
              <dl className="mt-3 grid gap-2 text-sm">
                {COLUMNS.map((c) => {
                  const leads = row.leads?.includes(c.key) ?? false;
                  // Label over value on the narrowest phones: a 9rem label column leaves 132px for
                  // the value, which breaks identifiers like convertToUIMessages mid-word. Paired
                  // with minmax(0,1fr), since a plain 1fr track cannot shrink below its own
                  // min-content and would hold the row wider than the card.
                  return (
                    <div
                      key={c.key}
                      className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]"
                    >
                      <dt className="text-(--muted)">{c.label}</dt>
                      <dd
                        className={`break-words ${
                          leads
                            ? "text-fd-foreground font-medium"
                            : isAbsent(row.cells[c.key])
                              ? "text-(--muted)"
                              : "text-fd-muted-foreground"
                        }`}
                      >
                        {leads && (
                          <span
                            aria-hidden="true"
                            className="mr-1.5 inline-block size-1.5 rounded-full bg-(--live) align-middle"
                          />
                        )}
                        {row.cells[c.key]}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>

        {/* Capabilities down the side, tools across the top. The other way round meant eight
            columns sharing the width, so every sentence wrapped into a narrow ribbon. */}
        <div className="card mt-6 hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
              <thead className="bg-fd-muted/60">
                <tr className="border-b border-(--line)">
                  <th scope="col" className="w-[13%] px-5 py-4 font-medium text-(--muted)">
                    Capability
                  </th>
                  {ROWS.map((row) => (
                    <th
                      key={row.name}
                      scope="col"
                      className={`px-5 py-4 font-semibold ${
                        row.lead ? "text-(--live)" : "text-(--paper)"
                      }`}
                    >
                      {row.href ? (
                        <a href={row.href} className="hover:underline">
                          {row.name}
                        </a>
                      ) : (
                        row.name
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((c) => (
                  <tr
                    key={c.key}
                    className="hover:bg-fd-muted/40 border-b border-(--line) transition-colors last:border-0"
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 text-left align-top font-medium text-(--paper)"
                    >
                      {c.label}
                    </th>
                    {ROWS.map((row) => {
                      const leads = row.leads?.includes(c.key) ?? false;
                      const cell = row.cells[c.key];
                      return (
                        <td
                          key={row.name}
                          className={`px-5 py-4 align-top leading-relaxed ${
                            leads
                              ? "text-fd-foreground font-medium"
                              : isAbsent(cell)
                                ? "text-(--muted)"
                                : "text-fd-muted-foreground"
                          }`}
                        >
                          {leads && (
                            <span
                              aria-hidden="true"
                              className="mr-1.5 inline-block size-1.5 rounded-full bg-(--live) align-middle"
                            />
                          )}
                          {leads && <span className="sr-only">Leads: </span>}
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-fd-muted-foreground mt-4 text-sm">
          Nothing here is a like-for-like competitor, which is rather the point. If you want the
          managed experience, assistant-ui and Convex are good at it. This exists for the case where
          the conversation has to stay in a database you control, and where regenerate and edit need
          to survive a reload. If you started from the Vercel template, its tables{" "}
          <Link href="/en/docs/importing" className="underline">
            import straight across
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

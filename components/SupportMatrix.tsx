const REQUIREMENTS = [
  { label: "Node.js", value: ">=20" },
  { label: "ai", value: ">=6 <8, gated on both in CI" },
  { label: "Module format", value: "ESM only" },
  { label: "Database", value: "Postgres, or SQLite via ./sqlite" },
  { label: "drizzle-orm", value: "^0.45, optional" },
  { label: "resumable-stream", value: "^2.2, optional" },
] as const;

const EXPORTS = [".", "./drizzle", "./handler", "./resume", "./sqlite", "./cli"];

export function SupportMatrix() {
  return (
    <section id="requirements" className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          Requirements
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">What your project needs</h2>
        <div className="card mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left font-mono text-sm sm:min-w-[420px]">
              <thead className="bg-fd-muted/60">
                <tr className="border-b border-(--line)">
                  <th scope="col" className="w-2/5 px-4 py-3 font-medium text-(--muted)">
                    Requirement
                  </th>
                  <th scope="col" className="w-3/5 px-4 py-3 font-medium text-(--muted)">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {REQUIREMENTS.map((r) => (
                  <tr
                    key={r.label}
                    className="hover:bg-fd-muted/40 border-b border-(--line) transition-colors last:border-0"
                  >
                    {/* The package names are single unbreakable tokens wider than this fixed
                        column, so without this they printed over the value beside them. */}
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-semibold break-words text-(--paper)"
                    >
                      {r.label}
                    </th>
                    <td className="px-4 py-3 text-(--paper)">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-fd-muted-foreground text-sm">
            The core carries <strong>no runtime dependencies</strong> - the two adapter peers are
            optional, so you install only the database you use, and{" "}
            <code className="font-mono">resumable-stream</code> only if you resume streams. Six
            subpath exports, all typed:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
            {EXPORTS.map((exp) => (
              <li key={exp} className="bg-fd-muted text-fd-muted-foreground rounded-md px-2 py-1">
                {exp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

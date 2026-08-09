"use client";

export type RawRow = {
  id: string;
  parent_id: string | null;
  role: string;
  parts: unknown;
  sdk_version: number;
};

export const ROWS_SQL = `select id, parent_id, role, parts, sdk_version
from ai_sdk_messages
where thread_id = $1
order by created_at`;

// The rows themselves, straight out of Postgres rather than through the store: "your database,
// your rows" is the claim, and this is the only place a visitor can check it.
export function RowsPanel({ rows }: { rows: RawRow[] }) {
  return (
    <div>
      <pre className="text-fd-muted-foreground overflow-x-auto font-mono text-xs">
        <code>{ROWS_SQL}</code>
      </pre>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-125 border-collapse font-mono text-xs">
          <thead>
            <tr className="border-fd-border border-b text-left text-(--muted)">
              <th className="py-1 pr-3 font-normal">id</th>
              <th className="py-1 pr-3 font-normal">parent_id</th>
              <th className="py-1 pr-3 font-normal">role</th>
              <th className="py-1 pr-3 font-normal">parts</th>
              <th className="py-1 font-normal">sdk_version</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-fd-border/50 border-b align-top">
                <td className="py-1 pr-3">{row.id}</td>
                <td className="py-1 pr-3 text-(--muted)">{String(row.parent_id)}</td>
                <td className="py-1 pr-3">{row.role}</td>
                <td className="text-fd-muted-foreground max-w-75 truncate py-1 pr-3">
                  {JSON.stringify(row.parts)}
                </td>
                <td className="py-1">{row.sdk_version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-fd-muted-foreground mt-2 text-xs">
        <code className="font-mono">parts</code> is the SDK&apos;s own{" "}
        <code className="font-mono">UIMessage.parts</code>, stored verbatim as jsonb - not flattened
        to a content string.
      </p>
    </div>
  );
}

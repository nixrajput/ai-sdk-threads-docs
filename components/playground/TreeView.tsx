"use client";

export type TreeRow = {
  id: string;
  parentId: string | null;
  role: string;
  parts: unknown;
};

const textOf = (row: TreeRow) => {
  const parts = row.parts as { type: string; text?: string }[];
  return parts.map((p) => (p.type === "text" ? p.text : `[${p.type}]`)).join(" ");
};

function Node({
  row,
  rows,
  live,
  depth,
  onSelect,
  busy,
}: {
  row: TreeRow;
  rows: TreeRow[];
  live: Set<string>;
  depth: number;
  onSelect: (id: string) => void;
  busy: boolean;
}) {
  const children = rows.filter((r) => r.parentId === row.id);
  const onPath = live.has(row.id);

  return (
    <li>
      <button
        type="button"
        disabled={busy}
        onClick={() => onSelect(row.id)}
        title={`setActiveLeaf(threadId, "${row.id}")`}
        className="hover:bg-fd-accent flex w-full items-start gap-2 rounded-md px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) disabled:opacity-50"
        style={{ marginLeft: depth * 14 }}
      >
        <span
          aria-hidden
          className="mt-1 size-2 shrink-0 rounded-full"
          style={{ background: onPath ? "var(--live)" : "var(--stale)" }}
        />
        <span className="min-w-0">
          <span className="font-mono text-xs" style={{ color: onPath ? "var(--live)" : undefined }}>
            {row.id} <span className="text-(--muted)">{row.role}</span>
          </span>
          <span className="text-fd-muted-foreground block truncate text-xs">{textOf(row)}</span>
        </span>
      </button>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <Node
              key={child.id}
              row={child}
              rows={rows}
              live={live}
              depth={depth + 1}
              onSelect={onSelect}
              busy={busy}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Any node is selectable, not just siblings of the leaf: setActiveLeaf accepts any message
// in the thread, and clicking an interior node truncates the live path to it.
export function TreeView({
  rows,
  livePath,
  onSelect,
  busy,
}: {
  rows: TreeRow[];
  livePath: string[];
  onSelect: (id: string) => void;
  busy: boolean;
}) {
  const roots = rows.filter((r) => r.parentId === null);
  const live = new Set(livePath);

  return (
    <div>
      <ul>
        {roots.map((root) => (
          <Node
            key={root.id}
            row={root}
            rows={rows}
            live={live}
            depth={0}
            onSelect={onSelect}
            busy={busy}
          />
        ))}
      </ul>
      <p className="text-fd-muted-foreground mt-2 text-xs">
        Click any message to make it the active leaf. Violet is the live path, amber an abandoned
        sibling.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

// Field names match StoredMessage so the shape on screen is the shape in the table.
// This is an illustration, not a live database - the playground runs the real store.
const TREE = [
  { id: "m1", parentId: null, role: "user", text: "Explain closures, briefly." },
  {
    id: "a1",
    parentId: "m1",
    role: "assistant",
    text: "A closure is a function bundled with the variables it was defined alongside.",
  },
  {
    id: "a2",
    parentId: "m1",
    role: "assistant",
    text: "Think of a backpack: the function carries the variables it grew up with wherever it goes.",
  },
] as const;

const SIBLINGS = ["a1", "a2"] as const;

export function BranchTree() {
  const [leaf, setLeaf] = useState<(typeof SIBLINGS)[number]>("a1");
  const index = SIBLINGS.indexOf(leaf);
  const reply = TREE.find((m) => m.id === leaf);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-12">
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
        Branching
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        Regenerate, and the old answer is still there
      </h2>
      <p className="text-fd-muted-foreground mt-2 text-sm">
        Every message points at its parent, so a regenerated reply is a sibling rather than an
        overwrite. Nothing is ever deleted.
      </p>

      <div className="border-fd-border bg-fd-card mt-6 rounded-lg border p-4">
        <p className="text-fd-muted-foreground font-mono text-xs">ai_sdk_messages</p>

        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-3">
            <span className="w-20 shrink-0 font-mono text-xs text-(--muted)">user</span>
            <p className="text-sm">{TREE[0].text}</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-20 shrink-0 font-mono text-xs text-(--live)">assistant</span>
            <p className="text-sm">{reply?.text}</p>
          </div>
        </div>

        <div className="border-fd-border mt-4 flex items-center gap-3 border-t pt-3">
          <button
            type="button"
            onClick={() => setLeaf(SIBLINGS[index === 0 ? 1 : 0])}
            aria-label="Previous variant"
            className="border-fd-border hover:bg-fd-accent rounded-md border px-2 py-1 font-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
          >
            {"<"}
          </button>
          <span className="font-mono text-xs text-(--muted)">
            {index + 1} / {SIBLINGS.length}
          </span>
          <button
            type="button"
            onClick={() => setLeaf(SIBLINGS[index === 0 ? 1 : 0])}
            aria-label="Next variant"
            className="border-fd-border hover:bg-fd-accent rounded-md border px-2 py-1 font-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
          >
            {">"}
          </button>
          <span className="text-fd-muted-foreground ml-auto font-mono text-xs">
            activeLeafId = {leaf}
          </span>
        </div>
      </div>

      <p className="text-fd-muted-foreground mt-3 text-xs">
        An illustration of the stored shape. The buttons are{" "}
        <code className="font-mono">siblingsOf</code> plus{" "}
        <code className="font-mono">setActiveLeaf</code>; nothing in the ecosystem persists this
        tree.
      </p>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

// Field names match StoredMessage so the shape on screen is the shape in the table. Two turns hang
// off each sibling, because that is the part worth showing: switching a leaf moves the whole
// downstream conversation, not just the one reply.
// This is an illustration, not a live database - the playground runs the real store.
const TREE = [
  { id: "m1", parentId: null, role: "user", text: "Explain closures, briefly." },
  {
    id: "a1",
    parentId: "m1",
    role: "assistant",
    text: "A closure is a function bundled with the variables it was defined alongside.",
  },
  { id: "m2", parentId: "a1", role: "user", text: "Show me one." },
  {
    id: "a3",
    parentId: "m2",
    role: "assistant",
    text: "function counter() { let n = 0; return () => ++n; }",
  },
  {
    id: "a2",
    parentId: "m1",
    role: "assistant",
    text: "Think of a backpack: the function carries the variables it grew up with wherever it goes.",
  },
  { id: "m3", parentId: "a2", role: "user", text: "Why does that matter?" },
  {
    id: "a4",
    parentId: "m3",
    role: "assistant",
    text: "Because the variable outlives the call that created it.",
  },
] as const;

type Row = (typeof TREE)[number];

// The two regenerated answers, and the leaf each branch ends on.
const BRANCHES = [
  { sibling: "a1", leaf: "a3" },
  { sibling: "a2", leaf: "a4" },
] as const;

const byId = (id: string) => TREE.find((row) => row.id === id);

/** What loadMessages returns: walk parentId from the active leaf to the root, oldest first. */
function orderPath(leafId: string): Row[] {
  const path: Row[] = [];
  let cursor: string | null = leafId;
  while (cursor) {
    const row = byId(cursor);
    if (!row) break;
    path.unshift(row);
    cursor = row.parentId;
  }
  return path;
}

function depthOf(row: Row): number {
  let depth = 0;
  let cursor = row.parentId;
  while (cursor) {
    depth += 1;
    cursor = byId(cursor)?.parentId ?? null;
  }
  return depth;
}

export function BranchTree({ lang }: { lang: string }) {
  const [branch, setBranch] = useState<(typeof BRANCHES)[number]>(BRANCHES[1]);
  const path = orderPath(branch.leaf);
  const onPath = new Set(path.map((row) => row.id));

  return (
    <section id="branching" className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          Branching
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Regenerate, and the old answer is still there
        </h2>
        <p className="text-fd-muted-foreground mt-2 text-sm">
          Every message points at its parent, so a regenerated reply is a sibling rather than an
          overwrite - and each sibling keeps the turns that followed it. Switch the active leaf and
          the whole conversation below it comes back. Nothing is ever deleted.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-fd-muted-foreground font-mono text-xs">setActiveLeaf</span>
          {BRANCHES.map((b, i) => {
            const selected = b.sibling === branch.sibling;
            return (
              <button
                key={b.sibling}
                type="button"
                aria-pressed={selected}
                onClick={() => setBranch(b)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) ${
                  selected
                    ? "border-(--live) text-(--live)"
                    : "border-fd-border hover:bg-fd-accent text-fd-muted-foreground"
                }`}
              >
                variant {i + 1} - {b.sibling}
              </button>
            );
          })}
          <span className="text-fd-muted-foreground ml-auto font-mono text-xs">
            activeLeafId = {branch.leaf}
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto]">
          <div className="card flex flex-col lg:row-span-3 lg:grid lg:grid-rows-subgrid">
            <p className="border-fd-border text-fd-muted-foreground border-b px-4 py-2 font-mono text-xs">
              getTree - every row, nothing removed
            </p>
            <ul className="flex flex-col gap-1 px-4 py-3">
              {TREE.map((row) => {
                const live = onPath.has(row.id);
                const isSibling = BRANCHES.some((b) => b.sibling === row.id);
                return (
                  <li
                    key={row.id}
                    style={{ paddingInlineStart: `${depthOf(row) * 0.85}rem` }}
                    className="flex items-baseline gap-2 text-sm"
                  >
                    <span
                      className={`w-6 shrink-0 font-mono text-xs ${live ? "text-(--live)" : "text-(--stale)"}`}
                    >
                      {row.id}
                    </span>
                    <span className="w-16 shrink-0 font-mono text-xs text-(--muted)">
                      {row.role}
                    </span>
                    <span className={live ? "text-(--paper)" : "text-(--muted)"}>{row.text}</span>
                    {isSibling && !live && (
                      <span className="shrink-0 font-mono text-[0.65rem] text-(--stale)">
                        sibling
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="border-fd-border text-fd-muted-foreground mt-auto border-t px-4 py-2 font-mono text-xs">
              {TREE.length} rows stored - 0 deleted
            </p>
          </div>

          <div className="card flex flex-col lg:row-span-3 lg:grid lg:grid-rows-subgrid">
            <p className="border-fd-border text-fd-muted-foreground border-b px-4 py-2 font-mono text-xs">
              loadMessages - the live path only
            </p>
            <ul className="flex flex-col gap-2 px-4 py-3">
              {path.map((row) => (
                <li key={row.id} className="flex items-baseline gap-3 text-sm">
                  <span
                    className={`w-16 shrink-0 font-mono text-xs ${
                      row.role === "assistant" ? "text-(--live)" : "text-(--muted)"
                    }`}
                  >
                    {row.role}
                  </span>
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
            <p className="border-fd-border text-fd-muted-foreground mt-auto border-t px-4 py-2 font-mono text-xs">
              {path.length} of {TREE.length} rows on this path
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              term: "siblingsOf",
              def: "Every variant of one message, oldest first, with the index of the live one.",
            },
            {
              term: "forkAt",
              def: "Edit a question and the old version and its replies stay, on their own branch.",
            },
            {
              term: "sdk_version",
              def: "Stamped per row, so an AI SDK major bump is a migration rather than a guess.",
            },
          ].map((item) => (
            <div key={item.term} className="card p-4">
              <dt className="font-mono text-xs text-(--live)">{item.term}</dt>
              <dd className="text-fd-muted-foreground mt-1 text-sm">{item.def}</dd>
            </div>
          ))}
        </dl>

        <p className="text-fd-muted-foreground mt-4 text-xs">
          An illustration of the stored shape - the buttons are{" "}
          <code className="font-mono">siblingsOf</code> plus{" "}
          <code className="font-mono">setActiveLeaf</code>, and the AI SDK itself still has no
          answer for the tree (
          <a
            href="https://github.com/vercel/ai/issues/2929"
            className="underline hover:text-(--live)"
          >
            vercel/ai#2929
          </a>
          , open since 2024).{" "}
          <Link href={`/${lang}/playground`} className="underline hover:text-(--live)">
            Run it against a real database
          </Link>{" "}
          in your browser.
        </p>
      </div>
    </section>
  );
}

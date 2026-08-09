"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { createThreadStore } from "ai-sdk-threads/drizzle";
import type { UIMessage } from "ai";
import { PLAYGROUND_DDL } from "@/lib/playground-ddl";

type Store = ReturnType<typeof createThreadStore>;
type Row = Awaited<ReturnType<Store["getTree"]>>[number];

const THREAD_ID = "demo";
const DB_NAME = "idb://ai-sdk-threads-demo";

const msg = (id: string, role: "user" | "assistant", text: string): UIMessage =>
  ({ id, role, parts: [{ type: "text", text }] }) as UIMessage;

const textOf = (row: Row) => {
  const parts = row.parts as { type: string; text?: string }[];
  return parts.map((p) => (p.type === "text" ? p.text : `[${p.type}]`)).join(" ");
};

// Loaded from our origin at runtime, not bundled: Turbopack rewrites PGlite's Emscripten
// glue into "m.instantiateWasm is not a function", and prebuilt WebAssembly.Modules do not
// avoid it. Variable specifier so no bundler can claim it. Dist copied to /pglite.
async function loadPGlite(): Promise<typeof PGlite> {
  const entry = "/pglite/index.js";
  const mod = (await import(/* webpackIgnore: true */ entry)) as { PGlite: typeof PGlite };
  return mod.PGlite;
}

async function boot(): Promise<Store> {
  const PGliteCtor = await loadPGlite();
  const client = new PGliteCtor(DB_NAME);
  await client.exec(PLAYGROUND_DDL);
  const store = createThreadStore(drizzle(client));

  // The DDL above duplicates the package's schema, so prove the two still agree before
  // the UI trusts them: a real round trip through the published store, on a throwaway
  // thread. A mismatch throws here instead of rendering a subtly wrong tree.
  const probe = await store.createThread({});
  await store.appendMessages(probe.id, [msg(`${probe.id}-p`, "user", "schema probe")]);
  const loaded = await store.loadMessages(probe.id);
  if (loaded.length !== 1) throw new Error("schema probe returned the wrong row count");
  await store.deleteThread(probe.id);

  return store;
}

async function seed(store: Store) {
  if (await store.getThread(THREAD_ID)) return;
  await store.createThread({ id: THREAD_ID, title: "Playground" });
  await store.appendMessages(THREAD_ID, [msg("m1", "user", "Explain closures, briefly.")]);
  await store.appendMessages(THREAD_ID, [
    msg("a1", "assistant", "A function bundled with the variables it was defined alongside."),
  ]);
}

export function Playground() {
  // State rather than a ref: the store is only ever read inside event handlers, and a
  // ref read from one trips react-hooks/refs.
  const [store, setStore] = useState<Store | null>(null);
  const [state, setState] = useState<"booting" | "ready" | "failed">("booting");
  const [error, setError] = useState<string>("");
  const [path, setPath] = useState<UIMessage[]>([]);
  const [tree, setTree] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (s: Store) => {
    setPath(await s.loadMessages(THREAD_ID));
    setTree(await s.getTree(THREAD_ID));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await boot();
        await seed(s);
        if (cancelled) return;
        await refresh(s);
        setStore(s);
        setState("ready");
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setState("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const run = (fn: (s: Store) => Promise<void>) => async () => {
    if (!store || busy) return;
    setBusy(true);
    try {
      await fn(store);
      await refresh(store);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setState("failed");
    } finally {
      setBusy(false);
    }
  };

  const regenerate = run(async (s) => {
    const live = await s.loadMessages(THREAD_ID);
    const last = live.at(-1);
    if (!last || last.role !== "assistant") return;
    await s.regenerateFrom(THREAD_ID, last.id);
    const variant = (await s.getTree(THREAD_ID)).filter((r) => r.role === "assistant").length + 1;
    await s.appendMessages(THREAD_ID, [
      msg(
        `a${variant}`,
        "assistant",
        `Variant ${variant}: a backpack of variables the function carries wherever it goes.`,
      ),
    ]);
  });

  const editFirst = run(async (s) => {
    await s.replaceMessage(THREAD_ID, "m1", msg("m1", "user", "Explain closures with a metaphor."));
  });

  const switchBranch = run(async (s) => {
    const live = await s.loadMessages(THREAD_ID);
    const last = live.at(-1);
    if (!last) return;
    const { siblings, index } = await s.siblingsOf(THREAD_ID, last.id);
    const next = siblings[(index + 1) % siblings.length];
    if (next) await s.setActiveLeaf(THREAD_ID, next.id);
  });

  const reset = run(async (s) => {
    await s.deleteThread(THREAD_ID);
    await seed(s);
  });

  if (state === "booting") {
    return (
      <p className="text-fd-muted-foreground font-mono text-sm">
        Booting Postgres in your browser. This downloads a few megabytes of WebAssembly the first
        time.
      </p>
    );
  }

  if (state === "failed") {
    return (
      <div className="border-fd-border bg-fd-card rounded-lg border p-4">
        <p className="font-mono text-sm text-(--stale)">The demo could not start.</p>
        <p className="text-fd-muted-foreground mt-2 text-sm">
          It needs WebAssembly and IndexedDB, which a private window or a strict content blocker may
          withhold. Everything it demonstrates is covered in{" "}
          <Link className="underline" href="/en/docs/api/branching">
            the branching docs
          </Link>
          .
        </p>
        <pre className="text-fd-muted-foreground mt-2 overflow-x-auto font-mono text-xs">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Action onClick={regenerate} busy={busy} label="Regenerate" />
        <Action onClick={switchBranch} busy={busy} label="Switch variant" />
        <Action onClick={editFirst} busy={busy} label="Edit the question" />
        <Action onClick={reset} busy={busy} label="Reset" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border-fd-border bg-fd-card rounded-lg border p-3">
          <p className="text-fd-muted-foreground font-mono text-xs">loadMessages - the live path</p>
          <ul className="mt-2 space-y-2">
            {path.map((m) => (
              <li key={m.id} className="flex items-start gap-2 text-sm">
                <span
                  className="w-16 shrink-0 font-mono text-xs"
                  style={{ color: m.role === "assistant" ? "var(--live)" : undefined }}
                >
                  {m.role}
                </span>
                <span>{(m.parts as { text?: string }[]).map((p) => p.text).join(" ")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-fd-border bg-fd-card rounded-lg border p-3">
          <p className="text-fd-muted-foreground font-mono text-xs">
            getTree - every row, {tree.length} total
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {tree.map((r) => {
              const live = path.some((m) => m.id === r.id);
              return (
                <li key={r.id} style={{ color: live ? "var(--live)" : "var(--muted)" }}>
                  {r.id} parent={String(r.parentId)} {live ? "(live)" : "(sibling)"}{" "}
                  {textOf(r).slice(0, 28)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="text-fd-muted-foreground text-xs">
        Real Postgres, compiled to WebAssembly, running in this tab - and the real published{" "}
        <code className="font-mono">createThreadStore</code>, not a reimplementation. Possible
        because the package carries no Node globals. Rows persist in IndexedDB, so a reload keeps
        your tree.
      </p>
    </div>
  );
}

function Action({ onClick, busy, label }: { onClick: () => void; busy: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="border-fd-border bg-fd-card hover:bg-fd-accent rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) disabled:opacity-50"
    >
      {label}
    </button>
  );
}

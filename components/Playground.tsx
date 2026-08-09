"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { createThreadStore } from "ai-sdk-threads/drizzle";
import type { UIMessage } from "ai";
import { PLAYGROUND_DDL } from "@/lib/playground-ddl";
import { CallLog, type Call } from "./playground/CallLog";
import { ConvertPanel } from "./playground/ConvertPanel";
import { RowsPanel, ROWS_SQL, type RawRow } from "./playground/RowsPanel";
import { ThreadsPanel } from "./playground/ThreadsPanel";
import { TreeView, type TreeRow } from "./playground/TreeView";

type Store = ReturnType<typeof createThreadStore>;

const THREAD_ID = "demo";

// Versioned: the DDL runs CREATE TABLE IF NOT EXISTS, so a returning visitor keeps the
// schema from their first visit. Bump this whenever playground-ddl.ts changes, or they get
// a stale database that the boot probe is too shallow to catch.
const DB_NAME = "idb://ai-sdk-threads-demo-v1";

// Module-level and never a parameter: this string is the specifier of a dynamic import, so
// anything caller-supplied reaching it would be script execution on our own origin.
const PGLITE_ENTRY = "/pglite/index.js";

const TABS = ["Branching", "Rows", "Threads", "Convert"] as const;
type Tab = (typeof TABS)[number];

const msg = (id: string, role: "user" | "assistant", text: string): UIMessage =>
  ({ id, role, parts: [{ type: "text", text }] }) as UIMessage;

// Loaded from our origin at runtime, not bundled: Turbopack rewrites PGlite's Emscripten
// glue into "m.instantiateWasm is not a function", and prebuilt WebAssembly.Modules do not
// avoid it. Variable specifier so no bundler can claim it. Dist copied to /pglite.
async function loadPGlite(): Promise<typeof PGlite> {
  const mod = (await import(/* webpackIgnore: true */ PGLITE_ENTRY)) as { PGlite: typeof PGlite };
  return mod.PGlite;
}

async function boot(): Promise<{ store: Store; client: PGlite }> {
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

  return { store, client };
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
  const [store, setStore] = useState<Store | null>(null);
  const [client, setClient] = useState<PGlite | null>(null);
  const [state, setState] = useState<"booting" | "ready" | "failed">("booting");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Branching");
  const [path, setPath] = useState<UIMessage[]>([]);
  const [tree, setTree] = useState<TreeRow[]>([]);
  const [rows, setRows] = useState<RawRow[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [busy, setBusy] = useState(false);

  const record = useCallback((code: string, result: string) => {
    setCalls((prev) => [{ code, result }, ...prev].slice(0, 8));
  }, []);

  const refresh = useCallback(async (s: Store, c: PGlite) => {
    const live = await s.loadMessages(THREAD_ID);
    const all = await s.getTree(THREAD_ID);
    const raw = await c.query<RawRow>(ROWS_SQL, [THREAD_ID]);
    setPath(live);
    setTree(all as TreeRow[]);
    setRows(raw.rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const booted = await boot();
        await seed(booted.store);
        if (cancelled) return;
        await refresh(booted.store, booted.client);
        setStore(booted.store);
        setClient(booted.client);
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
    if (!store || !client || busy) return;
    setBusy(true);
    try {
      await fn(store);
      await refresh(store, client);
    } catch (cause) {
      record("// threw", cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const regenerate = run(async (s) => {
    const live = await s.loadMessages(THREAD_ID);
    const last = live.at(-1);
    if (!last || last.role !== "assistant") {
      record("// nothing to regenerate", "the live path does not end in an assistant message");
      return;
    }
    const { leafId } = await s.regenerateFrom(THREAD_ID, last.id);
    record(`await store.regenerateFrom(threadId, "${last.id}")`, `{ leafId: "${leafId}" }`);

    const variant = (await s.getTree(THREAD_ID)).filter((r) => r.role === "assistant").length + 1;
    const id = `a${variant}`;
    await s.appendMessages(THREAD_ID, [
      msg(
        id,
        "assistant",
        `Variant ${variant}: a backpack of variables it carries wherever it goes.`,
      ),
    ]);
    record(
      `await store.appendMessages(threadId, [{ id: "${id}", role: "assistant", ... }])`,
      `stored 1 message, parentId: "${leafId}"`,
    );
  });

  const editFirst = run(async (s) => {
    const updated = await s.replaceMessage(
      THREAD_ID,
      "m1",
      msg("m1", "user", "Explain closures with a metaphor."),
    );
    record(
      `await store.replaceMessage(threadId, "m1", { ...edited })`,
      `kept id "${updated.id}"; the previous wording is now a sibling under a surrogate id`,
    );
  });

  const select = async (id: string) => {
    if (!store || !client || busy) return;
    setBusy(true);
    try {
      await store.setActiveLeaf(THREAD_ID, id);
      record(`await store.setActiveLeaf(threadId, "${id}")`, "the live path now ends here");
      await refresh(store, client);
    } catch (cause) {
      record("// threw", cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const reset = run(async (s) => {
    await s.deleteThread(THREAD_ID);
    await seed(s);
    record(`await store.deleteThread(threadId)`, "messages cascaded; thread reseeded");
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
    <div className="space-y-6">
      <div className="border-fd-border flex flex-wrap gap-1 border-b">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            aria-current={tab === name}
            className="-mb-px border-b-2 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
            style={{
              borderColor: tab === name ? "var(--live)" : "transparent",
              color: tab === name ? "var(--live)" : undefined,
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === "Branching" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Action onClick={regenerate} busy={busy} label="Regenerate" />
            <Action onClick={editFirst} busy={busy} label="Edit the question" />
            <Action onClick={reset} busy={busy} label="Reset" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Panel title={`getTree - ${tree.length} rows, click to switch`}>
              <TreeView
                rows={tree}
                livePath={path.map((m) => m.id)}
                onSelect={select}
                busy={busy}
              />
            </Panel>

            <Panel title="loadMessages - the live path">
              <ul className="space-y-2">
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
            </Panel>
          </div>
        </div>
      )}

      {tab === "Rows" && (
        <Panel title="ai_sdk_messages, straight from Postgres">
          <RowsPanel rows={rows} />
        </Panel>
      )}

      {tab === "Threads" && (
        <Panel title="listThreads - keyset pagination">
          {store && <ThreadsPanel store={store} onCall={record} />}
        </Panel>
      )}

      {tab === "Convert" && (
        <Panel title="convertToUIMessages">
          <ConvertPanel />
        </Panel>
      )}

      <Panel title="What just ran">
        <CallLog calls={calls} />
      </Panel>

      <p className="text-fd-muted-foreground text-xs">
        Real Postgres, compiled to WebAssembly, running in this tab - and the real published{" "}
        <code className="font-mono">createThreadStore</code>, not a reimplementation. Possible
        because the package carries no Node globals. Rows persist in IndexedDB, so a reload keeps
        your tree.
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-fd-border bg-fd-card rounded-lg border p-3">
      <p className="text-fd-muted-foreground mb-3 font-mono text-xs">{title}</p>
      {children}
    </section>
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

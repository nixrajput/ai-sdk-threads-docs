"use client";

import { useState } from "react";
import type { createThreadStore } from "ai-sdk-threads/drizzle";

type Store = ReturnType<typeof createThreadStore>;
type Thread = Awaited<ReturnType<Store["listThreads"]>>["threads"][number];

const PAGE = 3;

// listThreads pages by keyset cursor rather than OFFSET, so page 400 costs what page 1 does.
// Shown with a small limit so the cursor changes hands visibly.
export function ThreadsPanel({
  store,
  onCall,
}: {
  store: Store;
  onCall: (code: string, result: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  const seed = async () => {
    setBusy(true);
    for (let i = 0; i < 7; i++) {
      await store.createThread({ title: `Thread ${i + 1}` });
    }
    onCall("await store.createThread({ title })  // x7", "7 threads created");
    setThreads([]);
    setCursor(undefined);
    setPage(0);
    setBusy(false);
  };

  const next = async () => {
    setBusy(true);
    const result = await store.listThreads({ limit: PAGE, cursor });
    onCall(
      `await store.listThreads({ limit: ${PAGE}${cursor ? ", cursor" : ""} })`,
      `${result.threads.length} threads, nextCursor: ${result.nextCursor ? `"${result.nextCursor.slice(0, 16)}..."` : "undefined"}`,
    );
    setThreads(result.threads);
    setCursor(result.nextCursor);
    setPage((p) => p + 1);
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-fd-muted-foreground text-sm">
        Newest first, paged by a keyset cursor over{" "}
        <code className="font-mono">(createdAt, id)</code>. Keep pressing until{" "}
        <code className="font-mono">nextCursor</code> comes back undefined.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={seed}
          disabled={busy}
          className="border-fd-border hover:bg-fd-accent rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) disabled:opacity-50"
        >
          Create 7 threads
        </button>
        <button
          type="button"
          onClick={next}
          disabled={busy || (page > 0 && !cursor)}
          className="border-fd-border hover:bg-fd-accent rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) disabled:opacity-50"
        >
          {page === 0 ? "First page" : cursor ? `Next page (${page + 1})` : "No more pages"}
        </button>
      </div>

      {threads.length > 0 && (
        <ul className="border-fd-border bg-fd-card rounded-lg border p-3 font-mono text-xs">
          {threads.map((thread) => (
            <li key={thread.id} className="truncate py-0.5">
              <span className="text-(--live)">{thread.title ?? "(untitled)"}</span>{" "}
              <span className="text-(--muted)">{thread.id.slice(0, 12)}...</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

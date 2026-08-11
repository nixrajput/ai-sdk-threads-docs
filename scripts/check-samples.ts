import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = ".samples";
const FENCE = /```(?<lang>tsx?)(?![a-z])(?<meta>[^\n]*)\n(?<code>[\s\S]*?)```/g;

// Docs samples import `store` from "@/lib/threads" because that is what a reader's own
// code looks like. tsconfig.samples.json maps that specifier at these two stubs, so the
// samples typecheck as written instead of carrying an import path nobody would use.
const DB_STUB = `import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export declare const db: NodePgDatabase;
`;

const THREADS_STUB = `import { createThreadStore } from "ai-sdk-threads/drizzle";
import { db } from "./db";

export const store = createThreadStore(db);
`;

// The page sample checks thread ownership before rendering, so it needs an auth helper to
// resolve. Readers substitute their own.
const AUTH_STUB = `export declare function currentUserId(): Promise<string | null>;
`;

// The getting-started page shows a server page importing its own client component, so
// that sibling module has to exist for the sample to resolve.
const CHAT_STUB = `import type { UIMessage } from "ai";

export declare function Chat(props: { id: string; initialMessages: UIMessage[] }): React.JSX.Element;
`;

// Fragments are snippets that assume a store and a thread rather than repeating that
// setup on every page. They only typecheck inside this wrapper.
const PREAMBLE = `import { store } from "@/lib/threads";

declare const threadId: string;
declare const messageId: string;

export async function _fragment() {
`;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith(".mdx") ? [full] : [];
  });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

writeFileSync(join(OUT, "db.ts"), DB_STUB);
writeFileSync(join(OUT, "threads.ts"), THREADS_STUB);
writeFileSync(join(OUT, "chat.tsx"), CHAT_STUB);
writeFileSync(join(OUT, "auth.ts"), AUTH_STUB);

// Samples use top-level await, which is only valid in a module; without this the
// directory has no package type and the files are treated as scripts.
writeFileSync(join(OUT, "package.json"), `{ "type": "module" }\n`);

let count = 0;
for (const file of walk("content/docs")) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(FENCE)) {
    const meta = match.groups?.meta ?? "";
    // "notype" opts a sample out: it illustrates prose, not usable code.
    if (meta.includes("notype")) continue;
    const code = match.groups?.code ?? "";
    const body = meta.includes("fragment") ? `${PREAMBLE}${code}\n}\n` : code;
    // The fence language decides the extension. Sniffing the body for "</" misses
    // self-closing JSX, which then fails to parse as .ts.
    const ext = match.groups?.lang === "tsx" ? "tsx" : "ts";
    const name = `${file.replace(/[^a-z0-9]/gi, "_")}_${count++}.${ext}`;
    writeFileSync(join(OUT, name), body);
  }
}

// tsc fails with TS18003 when its include matches nothing, so a docs tree with no
// typecheckable fences would fail the gate rather than pass it vacuously.
if (count === 0) writeFileSync(join(OUT, "_none.ts"), "export {};\n");

console.log(`extracted ${count} samples`);

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = ".samples";
const FENCE = /```ts(?![a-z])(?<meta>[^\n]*)\n(?<code>[\s\S]*?)```/g;

// Fragments are short snippets that assume a live db and store rather than
// repeating that setup on every page. They only typecheck inside this preamble.
const PREAMBLE = `import { convertToUIMessages, orderPath } from "ai-sdk-threads";
import { createThreadStore, messages, threads } from "ai-sdk-threads/drizzle";
import { chatHandler } from "ai-sdk-threads/handler";
import { resumableChat } from "ai-sdk-threads/resume";
import { streamText, type ModelMessage, type UIMessage } from "ai";

declare const db: import("drizzle-orm/node-postgres").NodePgDatabase;
declare const store: ReturnType<typeof createThreadStore>;
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

// Samples use top-level await, valid only in ESM; nodenext infers CJS without this.
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
    const name = `${file.replace(/[^a-z0-9]/gi, "_")}_${count++}.ts`;
    writeFileSync(join(OUT, name), body);
  }
}

// tsc fails with TS18003 when its include matches nothing, so a docs tree with no
// typecheckable fences would fail the gate rather than pass it vacuously.
if (count === 0) writeFileSync(join(OUT, "_none.ts"), "export {};\n");

console.log(`extracted ${count} samples`);

"use client";

import { useMemo, useState } from "react";
import { convertToUIMessages } from "ai-sdk-threads";
import type { ModelMessage } from "ai";

const SAMPLES: Record<string, string> = {
  "tool call": JSON.stringify(
    [
      { role: "user", content: "weather?" },
      {
        role: "assistant",
        content: [
          { type: "tool-call", toolCallId: "c1", toolName: "getWeather", input: { city: "x" } },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "c1",
            toolName: "getWeather",
            output: { type: "json", value: { temp: 21 } },
          },
        ],
      },
    ],
    null,
    2,
  ),
  text: JSON.stringify(
    [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ],
    null,
    2,
  ),
  // Refused on purpose: an image part has no UIMessage equivalent this version models, and
  // guessing would put a lossy row in someone's database.
  "unsupported (throws)": JSON.stringify(
    [{ role: "user", content: [{ type: "image", image: "https://example.com/x.png" }] }],
    null,
    2,
  ),
};

export function ConvertPanel() {
  const [input, setInput] = useState(SAMPLES["tool call"] as string);

  const output = useMemo(() => {
    try {
      const parsed = JSON.parse(input) as ModelMessage[];
      return { ok: true as const, text: JSON.stringify(convertToUIMessages(parsed), null, 2) };
    } catch (cause) {
      return { ok: false as const, text: cause instanceof Error ? cause.message : String(cause) };
    }
  }, [input]);

  return (
    <div className="space-y-3">
      <p className="text-fd-muted-foreground text-sm">
        The <code className="font-mono">ModelMessage</code> to{" "}
        <code className="font-mono">UIMessage</code> direction the AI SDK still does not ship. Pure
        function, no database - this panel runs it on whatever you type.
      </p>

      <div className="flex flex-wrap gap-2">
        {Object.keys(SAMPLES).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setInput(SAMPLES[name] as string)}
            className="border-fd-border hover:bg-fd-accent rounded-md border px-2 py-1 font-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-fd-muted-foreground mb-1 font-mono text-xs">ModelMessage[]</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={14}
            aria-label="ModelMessage input"
            className="border-fd-border bg-fd-card w-full rounded-lg border p-2 font-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
          />
        </div>
        <div>
          <p className="text-fd-muted-foreground mb-1 font-mono text-xs">
            {output.ok ? "UIMessage[]" : "threw"}
          </p>
          <pre
            className="border-fd-border bg-fd-card h-full max-h-88 overflow-auto rounded-lg border p-2 font-mono text-xs"
            style={{ color: output.ok ? undefined : "var(--stale)" }}
          >
            <code>{output.text}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

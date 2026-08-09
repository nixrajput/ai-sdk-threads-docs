"use client";

export type Call = { code: string; result: string };

// The point of the log: every button press names the API call it made and what came back, so
// the demo teaches the surface rather than only showing that branching works.
export function CallLog({ calls }: { calls: Call[] }) {
  if (calls.length === 0) {
    return (
      <p className="text-fd-muted-foreground text-xs">
        Press a button above. The call it makes, and what it returns, appear here.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {calls.map((call, i) => (
        <li key={`${call.code}-${i}`} className="border-fd-border border-l-2 pl-3">
          <pre className="overflow-x-auto font-mono text-xs text-(--live)">
            <code>{call.code}</code>
          </pre>
          <pre className="text-fd-muted-foreground mt-1 overflow-x-auto font-mono text-xs">
            <code>{call.result}</code>
          </pre>
        </li>
      ))}
    </ol>
  );
}

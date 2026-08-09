"use client";

import dynamic from "next/dynamic";

// This wrapper exists only because Next forbids `ssr: false` in a Server Component, and
// that flag is what keeps the multi-megabyte PGlite bundle out of every other route's
// graph - only visitors who open this page pay for it.
const Playground = dynamic(() => import("./Playground").then((m) => m.Playground), {
  ssr: false,
  loading: () => <p className="text-fd-muted-foreground font-mono text-sm">Loading the demo...</p>,
});

export function PlaygroundLoader() {
  return <Playground />;
}

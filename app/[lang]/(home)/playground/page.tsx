import type { Metadata } from "next";
import { PlaygroundLoader } from "@/components/PlaygroundLoader";
import { SITE_URL } from "@/lib/shared";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Branching in a real Postgres database running in your browser, driven by the published ai-sdk-threads store.",
  alternates: { canonical: `${SITE_URL}/en/playground` },
};

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Playground</h1>
      <p className="text-fd-muted-foreground mt-3">
        Postgres compiled to WebAssembly, in this tab, driven by the published package. Regenerate
        an answer and the old one stays as a sibling; switch between them and the live path moves.
      </p>

      <div className="mt-8">
        <PlaygroundLoader />
      </div>
    </main>
  );
}

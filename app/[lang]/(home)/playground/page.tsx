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
    <main>
      {/* The same shell every home section uses: full-bleed, content bounded at --content-width,
          eyebrow above the heading, and the section's own vertical rhythm. */}
      <section className="w-full px-4 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-(--content-width)">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
            Playground
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">A real Postgres, in this tab</h1>
          <p className="text-fd-muted-foreground mt-2 text-sm">
            Postgres compiled to WebAssembly, driven by the published package rather than a
            simulation. Regenerate an answer and the old one stays as a sibling; switch between them
            and the live path moves. Every call it makes, and the rows it writes, are shown as they
            happen.
          </p>

          <div className="mt-8">
            <PlaygroundLoader />
          </div>
        </div>
      </section>
    </main>
  );
}

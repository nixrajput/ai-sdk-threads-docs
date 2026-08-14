import Link from "next/link";
import { InstallCommand } from "./InstallCommand";
import { NPM_URL, SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/shared";
import { latestVersion } from "@/lib/version";

export async function Hero({ lang }: { lang: string }) {
  const version = await latestVersion();

  return (
    <section
      id="overview"
      className="mx-auto flex w-full max-w-(--site-width) flex-col items-center gap-6 px-4 py-12 text-center sm:py-14"
    >
      <div className="enter flex max-w-(--site-measure) flex-col items-center gap-4">
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          {SITE_TAGLINE}
        </h1>
        <p className="text-fd-muted-foreground text-lg">{SITE_DESCRIPTION}</p>
      </div>

      <div
        aria-hidden
        className="enter hero-rule"
        style={{ "--enter-delay": "80ms" } as React.CSSProperties}
      />

      <div
        className="enter flex flex-col items-center gap-2"
        style={{ "--enter-delay": "140ms" } as React.CSSProperties}
      >
        <InstallCommand />
        <a
          href={NPM_URL}
          className="text-fd-muted-foreground hover:text-fd-foreground rounded-sm font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
        >
          v{version} on npm
        </a>
      </div>

      <div className="enter flex gap-3" style={{ "--enter-delay": "200ms" } as React.CSSProperties}>
        <Link
          href={`/${lang}/docs`}
          className="bg-fd-primary text-fd-primary-foreground rounded-lg px-6 py-3 font-medium shadow-sm transition-all duration-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) active:scale-[0.97]"
        >
          Get started
        </Link>
        <Link
          href={`/${lang}/docs/api/chat-handler`}
          className="border-fd-border bg-fd-card hover:bg-fd-accent hover:border-fd-ring rounded-lg border px-6 py-3 font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live) active:scale-[0.97]"
        >
          API reference
        </Link>
      </div>
    </section>
  );
}

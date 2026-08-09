import Link from "next/link";
import { Mark } from "./Mark";
import { appName, DEVELOPER, NPM_URL, REPO_URL, SITE_DESCRIPTION } from "@/lib/shared";

const COLUMN_LABEL = "font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase";
const LINK = "text-fd-muted-foreground hover:text-fd-foreground";

export function SiteFooter({ lang }: { lang: string }) {
  // Resolved server-side on each request/build, never baked into a static bundle.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--line)">
      <div className="mx-auto grid max-w-3xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link
            href={`/${lang}`}
            className="font-display inline-flex items-center gap-2 font-bold text-(--paper)"
          >
            <Mark />
            {appName}
          </Link>
          <p className="text-fd-muted-foreground mt-3 max-w-xs text-sm">{SITE_DESCRIPTION}</p>
        </div>

        <div>
          <p className={COLUMN_LABEL}>Docs</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={`/${lang}/docs`} className={LINK}>
                Introduction
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/docs/getting-started`} className={LINK}>
                Getting started
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/docs/api/chat-handler`} className={LINK}>
                API reference
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/docs/api/branching`} className={LINK}>
                Branching
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/docs/migrating`} className={LINK}>
                Migrating
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className={COLUMN_LABEL}>Project</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={REPO_URL} className={LINK}>
                GitHub
              </a>
            </li>
            <li>
              <a href={NPM_URL} className={LINK}>
                npm
              </a>
            </li>
            <li>
              <a href={`${REPO_URL}/issues`} className={LINK}>
                Issues
              </a>
            </li>
            <li>
              <a href={`${REPO_URL}/releases`} className={LINK}>
                Releases
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className={COLUMN_LABEL}>Developer</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={DEVELOPER.portfolio} className={LINK}>
                Portfolio
              </a>
            </li>
            <li>
              <a href={DEVELOPER.github} className={LINK}>
                GitHub (@{DEVELOPER.handle})
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-(--line)">
        <p className="text-fd-muted-foreground mx-auto max-w-3xl px-4 py-6 font-mono text-xs">
          © {year} {DEVELOPER.name}. MIT licensed.
        </p>
      </div>
    </footer>
  );
}

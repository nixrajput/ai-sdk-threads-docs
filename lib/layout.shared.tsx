import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { NavTitle } from "@/components/NavTitle";
import { appName, NPM_URL, REPO_URL } from "./shared";

function NpmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
    </svg>
  );
}

// Takes the locale because every URL carries one: a hardcoded /docs would 404 through the
// proxy, and the playground is otherwise unreachable from anywhere on the site.
export function baseOptions(lang: string): BaseLayoutProps {
  return {
    nav: {
      title: NavTitle,
      url: `/${lang}`,
    },
    // The package repo, not this site's. The footer already sends people there, and someone
    // clicking through from a package's docs wants the package.
    githubUrl: REPO_URL,
    links: [
      { text: "Docs", url: `/${lang}/docs`, active: "nested-url" },
      { text: "API", url: `/${lang}/docs/api`, active: "nested-url" },
      { text: "Playground", url: `/${lang}/playground`, active: "nested-url" },
      {
        type: "icon",
        text: "npm",
        label: `${appName} on npm`,
        url: NPM_URL,
        external: true,
        icon: <NpmIcon />,
      },
    ],
  };
}

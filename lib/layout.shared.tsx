import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Mark } from "@/components/Mark";
import { appName, gitConfig } from "./shared";

// Takes the locale because every URL carries one: a hardcoded /docs would 404 through the
// proxy, and the playground is otherwise unreachable from anywhere on the site.
export function baseOptions(lang: string): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <Mark />
          {appName}
        </span>
      ),
      url: `/${lang}`,
    },
    links: [
      { text: "Docs", url: `/${lang}/docs` },
      { text: "Playground", url: `/${lang}/playground` },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

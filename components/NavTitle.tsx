"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { Mark } from "@/components/Mark";
import { appName } from "@/lib/shared";

/**
 * The logo, as a link that also works when it points at the page you are already on. Next skips
 * a navigation to the current route, so a click from /en#branching left the reader mid-page
 * with the hash still in the address bar.
 */
export function NavTitle(props: ComponentProps<"a">) {
  const { href, onClick: incoming, className, ...rest } = props;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    incoming?.(event);
    if (event.defaultPrevented || typeof href !== "string") return;
    // Let the browser own modifier clicks, or the logo can never be opened in a new tab.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (window.location.pathname !== href) return;

    event.preventDefault();
    window.history.replaceState(null, "", href);
    // An explicit behavior outranks the stylesheet, so reduced motion has to be honoured here
    // rather than left to the html rule.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    // next/link, not a bare anchor: the layout's own title is a Link, and an anchor turned every
    // click from a docs page into a full document reload and dropped prefetching.
    <Link
      {...rest}
      href={href ?? "/"}
      onClick={onClick}
      className={className ?? "inline-flex items-center gap-2"}
    >
      <Mark />
      {appName}
    </Link>
  );
}

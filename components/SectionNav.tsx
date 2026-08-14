"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "route", label: "The route" },
  { id: "branching", label: "Branching" },
  { id: "coverage", label: "Coverage" },
  { id: "requirements", label: "Requirements" },
  { id: "compare", label: "Compare" },
  { id: "project", label: "Stats" },
];

// The header and this bar both stick. --sticky-chrome in global.css is this same number:
// they name one line, for highlighting here and for anchor landings there.
const STICKY_OFFSET = 116;

export function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const found = SECTIONS.map((s) => [s.id, document.getElementById(s.id)] as const).filter(
      (entry): entry is [string, HTMLElement] => entry[1] !== null,
    );
    if (found.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // Whichever section fills most of the reading area, which is what a reader would call the
      // one they are in. Tracking the top edge instead lags badly: these sections carry ~80px of
      // padding, so the next one fills the screen long before its edge reaches the sticky line.
      let current = found[0][0];
      let widest = 0;
      let lastPassed = "";
      for (const [id, el] of found) {
        const box = el.getBoundingClientRect();
        if (box.top <= STICKY_OFFSET) lastPassed = id;
        const visible = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, STICKY_OFFSET);
        if (visible > widest) {
          widest = visible;
          current = id;
        }
      }
      // Down in the footer every section sits above the fold, so none has any visible area and
      // the reader would otherwise be thrown back to the first one.
      if (widest <= 0 && lastPassed) current = lastPassed;
      setActive(current);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="bg-fd-background/80 sticky top-14 z-20 w-full border-b backdrop-blur-lg"
    >
      <ul className="mx-auto flex w-full max-w-(--content-width) [scrollbar-width:none] gap-1 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className="hover:bg-fd-accent text-fd-muted-foreground hover:text-fd-accent-foreground aria-[current]:text-fd-primary aria-[current]:bg-fd-accent block rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

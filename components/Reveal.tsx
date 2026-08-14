"use client";

import { useEffect, useRef, useState } from "react";

// Progressive enhancement: SSR renders children fully visible (no hidden state).
// Only after mount, once JS + IntersectionObserver are confirmed and motion is
// not reduced, do we arm the hidden state and animate it in on scroll.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArmed(true);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        }
      },
      // Fires before the section arrives, not after. Shrinking the box made each full-height
      // section pop in once the reader was already inside it, which reads as a bounce per section.
      { rootMargin: "0px 0px 25% 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${armed ? "reveal" : ""} ${className}`}
      style={delay ? ({ "--rise-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

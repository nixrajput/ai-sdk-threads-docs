// A thread of messages where one reply branches off, the same shape as app/icon.svg.
// Drawn from the palette rather than hex so the nav mark follows the theme, and violet
// stays the live path everywhere. No ground tile here, unlike the favicon: in the nav
// the mark sits on the page background and a filled tile reads as a second surface.
export function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <rect x="6" y="6" width="13" height="5.4" rx="2.7" fill="var(--paper)" />
      <rect x="6" y="13.3" width="10" height="5.4" rx="2.7" fill="var(--muted)" />
      <path
        d="M9 18.7v5.6h4.2"
        stroke="var(--live)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="13" y="21.6" width="13" height="5.4" rx="2.7" fill="var(--live)" />
    </svg>
  );
}

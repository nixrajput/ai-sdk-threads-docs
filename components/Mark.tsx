// A turn that forks into two replies, one live and one abandoned: the shape the whole
// package is about, and the only thing still legible at 16px. Stale and live are the
// same pair global.css assigns those roles, so the two strokes carry meaning.
// No ground square here, unlike app/icon.svg: in the nav the mark sits on the
// page background, and a filled tile would read as a second surface.
export function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path
        d="M7 5 L7 16 Q7 23 14 23 L26 23"
        fill="none"
        stroke="var(--stale)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M7 16 Q7 9 14 9 L26 9"
        fill="none"
        stroke="var(--live)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <defs>
        <linearGradient id="mark-era" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--era-old)" />
          <stop offset="1" stopColor="var(--era-now)" />
        </linearGradient>
      </defs>
      <path
        d="M8 16.5 L13.5 22 L24 10"
        fill="none"
        stroke="url(#mark-era)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

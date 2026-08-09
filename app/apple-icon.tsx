import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icons are composited onto the home screen without the rounded
// corners the SVG favicon draws, so this one fills the square and scales the
// mark up: at 180px the 32px geometry would read as a hairline.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141118",
      }}
    >
      {/* No <title>: satori renders it as visible text rather than metadata. */}
      <svg width="120" height="120" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="era" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#f0a868" />
            <stop offset="1" stopColor="#9b8cff" />
          </linearGradient>
        </defs>
        <path
          d="M8 16.5 L13.5 22 L24 10"
          fill="none"
          stroke="url(#era)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}

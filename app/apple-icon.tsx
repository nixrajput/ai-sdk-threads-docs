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
        <path
          d="M7 5 L7 16 Q7 23 14 23 L26 23"
          fill="none"
          stroke="#f0a868"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M7 16 Q7 9 14 9 L26 9"
          fill="none"
          stroke="#9b8cff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    size,
  );
}

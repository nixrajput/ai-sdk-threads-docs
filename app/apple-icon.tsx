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
        <rect x="6" y="6" width="13" height="5.4" rx="2.7" fill="#e9e6ef" />
        <rect x="6" y="13.3" width="10" height="5.4" rx="2.7" fill="#6b6478" />
        <path
          d="M9 18.7v5.6h4.2"
          stroke="#9b8cff"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="13" y="21.6" width="13" height="5.4" rx="2.7" fill="#9b8cff" />
      </svg>
    </div>,
    size,
  );
}

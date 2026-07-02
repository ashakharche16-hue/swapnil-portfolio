import { ImageResponse } from "next/og";

// Generated PNG favicon (works in every browser, incl. those that skip SVG).
// A rounded accent-blue tile with ink "SK" — matches the brand mark.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#7CC5FF",
        color: "#0B0F1A",
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: -2,
        borderRadius: 14,
      }}
    >
      SK
    </div>,
    { ...size },
  );
}

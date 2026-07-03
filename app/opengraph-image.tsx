import { ImageResponse } from "next/og";

export const alt =
  "Swapnil Kharche — Software Development Manager & Engineering Leader";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card (LinkedIn/Twitter). Brand: ink bg, signal-blue accent.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0B0F1A",
        color: "#E6E9F2",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 4,
          color: "#7CC5FF",
          fontFamily: "monospace",
        }}
      >
        SOFTWARE DEVELOPMENT MANAGER · ENGINEERING LEADER
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700 }}>
          Swapnil Kharche
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#8892B0",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          12+ years modernizing mission-critical platforms. Architecture,
          engineering leadership, and AI-driven engineering.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "#4ADE80",
          }}
        />
        <div style={{ display: "flex", fontSize: 26, fontFamily: "monospace" }}>
          Try the live RAG demo
        </div>
      </div>
    </div>,
    { ...size },
  );
}

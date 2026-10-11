import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Starlight Intelligence — Build as if the kindest future is the realistic one";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060609",
          backgroundImage:
            "radial-gradient(circle at 78% 32%, rgba(167,139,250,.22), transparent 36%), radial-gradient(circle at 24% 80%, rgba(34,211,238,.12), transparent 34%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="48" height="48" viewBox="0 0 64 64">
            <ellipse cx="32" cy="32" rx="25" ry="9.5" transform="rotate(-24 32 32)" fill="none" stroke="#a78bfa" strokeWidth="1.8" />
            <circle cx="11.5" cy="42" r="3" fill="#22d3ee" />
            <path d="M10 32c12-1.3 17.5-2 22-2s10 .7 22 2c-12 1.3-17.5 2-22 2s-10-.7-22-2Z" fill="#c4b5fd" opacity=".9" />
            <path d="M32 3c2 16 3 23 7 29c-4 6-5 13-7 29c-2-16-3-23-7-29c4-6 5-13 7-29Z" fill="#f8fafc" />
            <circle cx="32" cy="32" r="4" fill="#fff" />
          </svg>
          <span style={{ fontSize: 22, fontWeight: 650, letterSpacing: ".18em", textTransform: "uppercase", color: "#c4b5fd" }}>
            Starlight Intelligence
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <span style={{ fontSize: 78, fontWeight: 620, lineHeight: 1.04, letterSpacing: "-.035em" }}>
            Build as if the kindest future
          </span>
          <span style={{ fontSize: 78, fontWeight: 520, lineHeight: 1.04, letterSpacing: "-.035em", color: "#a5f3fc" }}>
            is the realistic one.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20 }}>
          <span style={{ color: "rgba(255,255,255,.55)" }}>Multi-agent architecture · memory · governance · proof</span>
          <span style={{ color: "#c4b5fd", fontFamily: "monospace" }}>starlightintelligence.org</span>
        </div>
      </div>
    ),
    size,
  );
}

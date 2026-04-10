import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Starlight Intelligence — Memory that compounds";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060609",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(167, 139, 250, 0.22) 0%, rgba(167, 139, 250, 0.05) 32%, rgba(6, 6, 9, 0) 60%), radial-gradient(circle at 80% 80%, rgba(34, 211, 238, 0.1) 0%, rgba(6, 6, 9, 0) 50%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: brand mark + label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              background: "#a78bfa",
              boxShadow: "0 0 28px rgba(167, 139, 250, 0.9)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#a78bfa",
            }}
          >
            Starlight Intelligence
          </span>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "1020px",
          }}
        >
          <span
            style={{
              fontSize: "88px",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Memory that compounds.
          </span>
          <span
            style={{
              fontSize: "88px",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "rgba(255, 255, 255, 0.55)",
              marginTop: "8px",
            }}
          >
            Intelligence that grows.
          </span>
        </div>

        {/* Bottom: tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.45)",
            }}
          >
            Public vaults. Open schema. Owned by you.
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "rgba(167, 139, 250, 0.8)",
              fontFamily: "monospace",
            }}
          >
            starlightintelligence.org
          </span>
        </div>
      </div>
    ),
    size
  );
}

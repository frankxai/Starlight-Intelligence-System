import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Benediction Layer — Messages to the future";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060609",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(167, 139, 250, 0.22) 0%, rgba(167, 139, 250, 0.06) 30%, rgba(6, 6, 9, 0) 60%), radial-gradient(circle at 15% 85%, rgba(232, 121, 249, 0.12) 0%, rgba(6, 6, 9, 0) 45%)",
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
        {/* Top: label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: "#a78bfa",
              boxShadow: "0 0 24px rgba(167, 139, 250, 0.8)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#a78bfa",
            }}
          >
            Starlight Intelligence
          </span>
        </div>

        {/* Middle: the Brautigan quote */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "960px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              color: "rgba(255, 255, 255, 0.45)",
              marginBottom: "18px",
              fontStyle: "italic",
            }}
          >
            "...all watched over by
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 1.1,
              color: "white",
              fontFamily: "serif",
            }}
          >
            machines of loving grace."
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.35)",
              marginTop: "24px",
              letterSpacing: "0.05em",
            }}
          >
            — Richard Brautigan, 1967
          </span>
        </div>

        {/* Bottom: page URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "white",
            }}
          >
            The Benediction Layer
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "rgba(167, 139, 250, 0.8)",
              fontFamily: "monospace",
            }}
          >
            starlightintelligence.org/benediction
          </span>
        </div>
      </div>
    ),
    size
  );
}

import {
  getCanonicalSipVersion,
  isValidVersionPin,
  normalizeVersion,
} from "@/lib/sip";

/**
 * Built on SIP — attestation badge.
 *
 * GET /badge/v1.1.0          -> SVG with that pin
 * GET /badge/latest          -> SVG with current canonical version
 * GET /badge/v1.1.0?theme=light  -> light theme
 *
 * The badge is deliberately hand-rolled SVG. No shields.io dependency,
 * no font loading, no rendering libraries. This keeps it fast at the
 * edge and means GitHub READMEs render it instantly.
 */

export const revalidate = 3600;

const FONT_STACK =
  "system-ui,-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif";

// Approx character width at 11px in a typical sans stack. Slightly narrow
// so the right pill never feels cramped around v1.10.0-style versions.
const CHAR_WIDTH = 6.4;
const PADDING_X = 12;
const HEIGHT = 28;
const LEFT_TEXT = "Built on";

type Theme = "dark" | "light";

function buildSvg(version: string, theme: Theme): string {
  const rightText = `SIP ${version}`;

  const leftWidth = Math.ceil(LEFT_TEXT.length * CHAR_WIDTH + PADDING_X * 2);
  const rightWidth = Math.ceil(rightText.length * CHAR_WIDTH + PADDING_X * 2);
  const totalWidth = Math.max(200, leftWidth + rightWidth);

  // If we hit the 200px floor, expand the right side so the gradient
  // covers the leftover space rather than introducing a third zone.
  const adjustedRightWidth = totalWidth - leftWidth;

  const leftBg = theme === "light" ? "#f4f4f7" : "#0c0c12";
  const leftText = theme === "light" ? "#1a1a1f" : "#e2e8f0";
  const leftTextMuted = theme === "light" ? "#52525b" : "#94a3b8";
  const leftStroke = theme === "light" ? "#e2e2e8" : "#1a1a22";

  // Iridescent gradient — violet -> fuchsia -> cyan, matching the site
  // palette (#a78bfa / #f0abfc / #67e8f9).
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${HEIGHT}" viewBox="0 0 ${totalWidth} ${HEIGHT}" role="img" aria-label="${escapeXml(`Built on SIP ${version}`)}">
  <title>${escapeXml(`Built on SIP — Starlight Intelligence Protocol ${version}`)}</title>
  <defs>
    <linearGradient id="sip-iridescent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="50%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <linearGradient id="sip-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
    </linearGradient>
    <clipPath id="sip-clip">
      <rect width="${totalWidth}" height="${HEIGHT}" rx="6"/>
    </clipPath>
  </defs>

  <g clip-path="url(#sip-clip)">
    <!-- Left half: dark plate -->
    <rect width="${leftWidth}" height="${HEIGHT}" fill="${leftBg}"/>
    <!-- Right half: iridescent gradient -->
    <rect x="${leftWidth}" width="${adjustedRightWidth}" height="${HEIGHT}" fill="url(#sip-iridescent)"/>
    <!-- Subtle vertical sheen across the whole badge -->
    <rect width="${totalWidth}" height="${HEIGHT}" fill="url(#sip-sheen)"/>
    <!-- Hairline divider between halves -->
    <rect x="${leftWidth - 0.5}" width="1" height="${HEIGHT}" fill="rgba(0,0,0,0.18)"/>
    <!-- Outer hairline border -->
    <rect width="${totalWidth}" height="${HEIGHT}" rx="6" fill="none" stroke="${leftStroke}" stroke-width="1"/>
  </g>

  <g font-family="${FONT_STACK}" font-size="11" font-weight="600" text-rendering="geometricPrecision">
    <!-- Left label -->
    <text x="${leftWidth / 2}" y="${HEIGHT / 2 + 4}" fill="${leftTextMuted}" text-anchor="middle" letter-spacing="0.3">
      ${LEFT_TEXT}
    </text>
    <!-- Right label, white for contrast over the gradient -->
    <text x="${leftWidth + adjustedRightWidth / 2}" y="${HEIGHT / 2 + 4}" fill="#ffffff" text-anchor="middle" letter-spacing="0.4" style="text-shadow:0 1px 1px rgba(0,0,0,0.25)">
      ${escapeXml(rightText)}
    </text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ version: string }> }
) {
  const { version: rawVersion } = await params;
  const url = new URL(request.url);
  const themeParam = url.searchParams.get("theme");
  const theme: Theme = themeParam === "light" ? "light" : "dark";

  // Hardened input validation per OpenClaw audit (CRITICAL 1).
  // Strict semver allowlist regex: optional 'v', three numeric segments, optional pre-release tag.
  // Anything not matching → render the clearly-labeled "invalid" badge, never echo raw input.
  const STRICT_SEMVER = /^v?\d{1,4}\.\d{1,4}\.\d{1,4}(-[a-z0-9.]{1,32})?$/i;
  let version: string;
  if (rawVersion === "latest") {
    version = await getCanonicalSipVersion();
  } else if (STRICT_SEMVER.test(rawVersion) && isValidVersionPin(rawVersion)) {
    version = normalizeVersion(rawVersion);
  } else {
    // Refuse to interpolate untrusted input. Even with escapeXml, we never let
    // arbitrary strings flow through to the SVG body.
    version = "invalid";
  }

  const svg = buildSvg(version, theme);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      // Allow embedding in any markdown renderer / README host.
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * Raw-markdown citation endpoint at /protocol.md — alias for /sip.md.
 *
 * The protocol page is at /protocol; agents that follow the URL pattern
 * "<page-route>.md" for raw markdown will hit /protocol.md and get the
 * canonical SIP spec text. Same content as /sip.md.
 *
 * Built on SIP — operational tier (AEO endpoint, alias).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-static";
export const revalidate = 3600;

const FALLBACK = `# SIP — Starlight Intelligence Protocol

Source temporarily unavailable. Read on GitHub:
https://github.com/frankxai/Starlight-Intelligence-System/blob/main/SIP.md
`;

function loadSipMarkdown(): string {
  try {
    return readFileSync(join(process.cwd(), "content", "sip.md"), "utf-8");
  } catch {
    return FALLBACK;
  }
}

const SIP_CONTENT = loadSipMarkdown();

export function GET() {
  return new Response(SIP_CONTENT, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Source":
        "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/SIP.md",
      "X-Canonical": "https://starlightintelligence.org/sip.md",
    },
  });
}

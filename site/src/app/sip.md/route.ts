/**
 * Raw-markdown citation endpoint for SIP.md.
 *
 * Returns the canonical Starlight Intelligence Protocol spec as text/markdown
 * — the citation-stable URL that AI crawlers (Perplexity, ChatGPT, Claude,
 * Gemini) can fetch instead of HTML-extracting the /protocol page. Mirrors
 * GitHub's raw markdown but served from the canonical domain.
 *
 * Source: site/content/sip.md (synced from repo-root SIP.md). The site/
 * function root needs the file inside it to survive Vercel's serverless
 * packaging — same pattern as /explainer (site/content/explainer.md).
 *
 * Built on SIP — operational tier (AEO endpoint).
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

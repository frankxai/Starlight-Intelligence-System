// /cockpit/spec-trace — Console of the Sovereign.
//
// Server-component shell. All daemon I/O happens browser-side (CSP scope: localhost),
// so this file is intentionally minimal: metadata, manifest link, then a single
// Client-Component island.
//
// Design contract is in CLAUDE.md + the brief — DO NOT casually restyle.

import type { Metadata, Viewport } from "next";
import SpecTraceClient from "./SpecTraceClient";

// Next.js 16: opt out of static-render caching for this route since the entire
// experience is dynamic and client-driven. Cheap render — just an empty shell.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Spec-Trace",
  description:
    "Console of the Sovereign — list specs, trace commits and PRs, dispatch to agents. Local-daemon-driven. Sharp brutalist UI, ink-black, mono everywhere.",
  alternates: { canonical: "/cockpit/spec-trace" },
  manifest: "/cockpit/spec-trace/manifest.webmanifest",
  // Less aggressive social-card framing — this is a tool, not marketing.
  openGraph: {
    title: "Spec-Trace — Starlight",
    description:
      "Console of the Sovereign. List specs, trace commits/PRs, dispatch to agents.",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Spec-Trace — Starlight",
    description:
      "Console of the Sovereign. List specs, trace commits/PRs, dispatch to agents.",
  },
};

// Per Next.js 16 metadata API: themeColor + viewport live in a separate `viewport`
// export (the codemod moved them out of metadata{} in v14+).
export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function SpecTracePage() {
  return (
    // We override the global body bg via a wrapper — Console runs ink-black,
    // not the site's default #060609. This keeps existing routes untouched.
    <div className="console-shell">
      <SpecTraceClient />
    </div>
  );
}

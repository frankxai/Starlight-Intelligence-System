// /knowledge-tree/explore — Interactive constellation explorer.
//
// Server-component shell. The graph itself is a Client Component island.
// In Next.js 16 / Turbopack, `next/dynamic` with `ssr:false` must live in a
// Client Component — not in a Server Component. So we import a thin client
// wrapper (GraphWrapper) that owns the dynamic import.

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { GraphWrapper } from "./GraphWrapper";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Explore the Knowledge Tree",
  description:
    "Interactive constellation explorer for the Starlight Knowledge Tree — navigate 40+ nodes across AI Architect, Space Builder, Bio/Human Intelligence, and Creator-Founder paths. Click any node to see its kind, summary, and connections.",
  alternates: { canonical: "/knowledge-tree/explore" },
  openGraph: {
    title: "Explore the Knowledge Tree — Starlight",
    description:
      "Interactive constellation explorer. Navigate the open intelligence graph for human capability and contribution paths.",
    type: "article",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Starlight Knowledge Tree — constellation explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore the Knowledge Tree — Starlight",
    description:
      "Interactive constellation explorer. Navigate the open intelligence graph for human capability and contribution paths.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060609",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function KnowledgeTreeExplorePage() {
  return (
    // Full-viewport layout: the global header is sticky at 3.5rem (h-14).
    // This page fills the remaining viewport height via dvh.
    <div className="flex flex-col" style={{ height: "calc(100dvh - 3.5rem)" }}>
      {/* ── Eyebrow bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/knowledge-tree"
            className="text-[12px] text-slate-500 transition-colors hover:text-slate-300 shrink-0"
            aria-label="Back to Knowledge Tree overview"
          >
            &larr; Knowledge Tree
          </Link>
          <span className="text-slate-700 text-[12px]" aria-hidden="true">·</span>
          <p className="text-[11px] font-medium uppercase tracking-widest text-cyan-400 truncate">
            Constellation Explorer &middot; Stage 1
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/knowledge-tree#paths"
            className="hidden sm:inline-flex rounded-full border border-white/[0.1] px-3.5 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-white/[0.2] hover:text-white"
          >
            View Paths
          </Link>
          <a
            href="https://github.com/frankxai/starlight-knowledge-tree/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex rounded-full border border-white/[0.1] px-3.5 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-white/[0.2] hover:text-white"
          >
            Contribute
          </a>
        </div>
      </div>

      {/* Hidden heading for screen-reader document structure */}
      <h1 className="sr-only">Explore the Starlight Knowledge Tree</h1>

      {/* ── Graph (fills remaining space) ── */}
      <div className="relative flex-1 overflow-hidden">
        <GraphWrapper />
      </div>
    </div>
  );
}

"use client";

// GraphWrapper — thin client boundary that owns the next/dynamic import of
// KnowledgeGraph. In Next.js 16 / Turbopack, `next/dynamic` with `ssr:false`
// must live inside a Client Component; it cannot be used in a Server Component.
//
// This file is intentionally minimal — all graph logic lives in
// src/components/knowledge-tree/KnowledgeGraph.tsx.

import dynamic from "next/dynamic";

const KnowledgeGraph = dynamic(
  () => import("@/components/knowledge-tree/KnowledgeGraph"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#060609]">
        <p className="text-sm text-slate-500">Loading constellation…</p>
      </div>
    ),
  }
);

export function GraphWrapper() {
  return <KnowledgeGraph />;
}

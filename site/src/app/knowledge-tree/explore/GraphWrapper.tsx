"use client";

// GraphWrapper — thin client boundary that owns the next/dynamic imports of
// KnowledgeGraph3D (hero) and KnowledgeGraph (2D fallback).
//
// In Next.js 16 / Turbopack, `next/dynamic` with `ssr:false` must live inside
// a Client Component; it cannot be used in a Server Component.
//
// Rendering strategy (evaluated client-side at mount):
//   1. prefers-reduced-motion → render 2D (no auto-orbit, no bloom)
//   2. WebGL unavailable       → render 2D
//   3. Otherwise               → render 3D cosmic hero (KnowledgeGraph3D)

import dynamic from "next/dynamic";
import { useState } from "react";

const KnowledgeGraph3D = dynamic(
  () => import("@/components/knowledge-tree/KnowledgeGraph3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#060609]">
        <p className="text-sm text-slate-500">Loading cosmic map…</p>
      </div>
    ),
  }
);

const KnowledgeGraph2D = dynamic(
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

/** Detect WebGL support. Returns true if a WebGL context can be created. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/** Determine render mode on the client. */
function detectMode(): "3d" | "2d" {
  if (typeof window === "undefined") return "2d";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reducedMotion || !hasWebGL()) return "2d";
  return "3d";
}

export function GraphWrapper() {
  // Lazy initializer — runs only once on the client, never during SSR.
  // This avoids a useEffect + setState pattern that triggers a second render.
  const [mode] = useState<"3d" | "2d">(detectMode);

  if (mode === "2d") {
    return <KnowledgeGraph2D />;
  }

  return <KnowledgeGraph3D />;
}

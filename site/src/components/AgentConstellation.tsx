"use client";

/**
 * AgentConstellation — capability-gated wrapper for the WebGL hero scene.
 *
 * The static Starfield behind it is the baseline experience; this layers the
 * live three.js system on top only when the client can afford it:
 *  - respects prefers-reduced-motion (no canvas at all),
 *  - requires WebGL support,
 *  - loads the three.js bundle lazily so it never blocks first paint.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./AgentConstellationScene"), {
  ssr: false,
  loading: () => null,
});

function clientCanRunScene(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function AgentConstellation({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Deferred a frame so the capability probe never competes with first paint.
    const raf = requestAnimationFrame(() => setEnabled(clientCanRunScene()));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`pointer-events-none animate-fade-up ${className}`}
      aria-hidden="true"
    >
      <Scene />
    </div>
  );
}

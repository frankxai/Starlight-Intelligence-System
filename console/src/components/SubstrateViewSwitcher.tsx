"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import SubstrateGraph2D from "./SubstrateGraph2D";
import SubstrateSceneClient from "./SubstrateSceneClient";

type ViewMode = "2d" | "3d";

/**
 * Client wrapper that owns the view-mode toggle.
 *
 * The mode is driven by `?view=2d` (default) or `?view=3d` in the URL so
 * URLs are shareable. The toggle uses `router.replace` to update the URL
 * without a navigation push; the unmount/mount of the graph vs. scene is
 * what swaps the renderer.
 */
export default function SubstrateViewSwitcher({
  initialView,
}: {
  initialView: ViewMode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefer URL state; fall back to the server-provided initialView.
  const view: ViewMode = useMemo(() => {
    const raw = searchParams.get("view");
    if (raw === "3d") return "3d";
    if (raw === "2d") return "2d";
    return initialView;
  }, [searchParams, initialView]);

  const setView = useCallback(
    (next: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", next);
      router.replace(`/substrate?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* full-viewport renderer */}
      <div className="absolute inset-0">
        {view === "2d" ? <SubstrateGraph2D /> : <SubstrateSceneClient />}
      </div>

      {/* HUD — top-left */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 p-6">
        <div className="pointer-events-auto inline-flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-widest text-violet-400/80">
            starlight console / substrate
          </span>
          <span className="text-[13px] font-semibold text-white">
            6 vaults · 10 verticals · 1 core
          </span>

          {/* View toggle */}
          <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/40 p-1">
            <ToggleButton
              active={view === "2d"}
              onClick={() => setView("2d")}
              label="2D Graph"
              hint="default"
            />
            <ToggleButton
              active={view === "3d"}
              onClick={() => setView("3d")}
              label="3D Scene"
              hint="signature"
            />
          </div>

          <span className="text-[11px] text-slate-500">
            {view === "2d"
              ? "drag nodes · hover for detail · scroll to zoom"
              : "drag to orbit · scroll to zoom · right-drag to pan"}
          </span>
        </div>
      </div>

      {/* HUD — top-right back link */}
      <div className="absolute right-0 top-0 z-10 p-6">
        <Link
          href="/"
          className="rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 text-[12px] font-medium text-slate-300 backdrop-blur-md transition-micro hover:border-white/[0.2] hover:text-white"
        >
          &larr; back
        </Link>
      </div>

      {/* HUD — bottom legend */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="pointer-events-auto mx-auto inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 backdrop-blur-md">
          <Legend color="#a78bfa" label="core" />
          <span className="text-slate-700">·</span>
          <Legend color="#67e8f9" label="vaults" />
          <span className="text-slate-700">·</span>
          <Legend color="#f0abfc" label="verticals" />
          <span className="text-slate-700">·</span>
          <Legend color="#94a3b8" label="private (dimmed)" />
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-micro ${
        active
          ? "bg-white text-[#050509]"
          : "text-slate-400 hover:text-white"
      }`}
    >
      {label}
      {hint && (
        <span
          className={`text-[9px] uppercase tracking-widest ${
            active ? "text-[#050509]/60" : "text-slate-600"
          }`}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-slate-400">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import SubstrateSceneClient from "@/components/SubstrateSceneClient";

export const metadata: Metadata = {
  title: "Substrate",
  description:
    "The Starlight substrate as a navigable 3D space. Six vaults orbit a luminous core; ten verticals trace the outer ring.",
};

export default function SubstratePage() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* full-viewport canvas */}
      <div className="absolute inset-0">
        <SubstrateSceneClient />
      </div>

      {/* HUD — top-left */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 p-6">
        <div className="pointer-events-auto inline-flex flex-col gap-1 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-widest text-violet-400/80">
            starlight console / substrate
          </span>
          <span className="text-[13px] font-semibold text-white">
            6 vaults · 10 verticals
          </span>
          <span className="text-[11px] text-slate-500">
            drag to orbit · scroll to zoom · right-drag to pan
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
        <div className="pointer-events-auto mx-auto inline-flex flex-wrap items-center gap-3 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 backdrop-blur-md">
          <Legend color="#a78bfa" label="vaults" />
          <span className="text-slate-700">·</span>
          <Legend color="#f0abfc" label="verticals" />
          <span className="text-slate-700">·</span>
          <Legend color="#94a3b8" label="private (dimmed)" />
        </div>
      </div>
    </div>
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

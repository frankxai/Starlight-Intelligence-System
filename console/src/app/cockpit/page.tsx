import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Starlight Cockpit — Visual Multi-Agent Orchestration",
  description:
    "Zero-latency, local-first spatial canvas for multi-agent orchestration and memory palace exploration. Operating at 120 FPS with local SQLite WASM substrate.",
};

export default function CockpitPage() {
  return (
    <div className="relative min-h-dvh bg-[#050509] text-white flex flex-col justify-between p-6 md:p-12 font-sans overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-20 top-10 h-[450px] w-[450px] rounded-full bg-cyan-500/[0.08] blur-[120px]" />
        <div className="absolute right-10 bottom-20 h-[400px] w-[400px] rounded-full bg-violet-600/[0.08] blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg">
            ✦
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-display">Starlight Cockpit</h1>
            <p className="text-xs text-slate-400 font-mono">Zero-Latency Local-First Orchestration & Memory Palace</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded bg-white/5 border border-white/10 transition-colors"
        >
          ← Return to Console
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto my-12 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Operational Instrument v8.3 • 120 FPS Infinite Canvas
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold font-display tracking-tight leading-tight">
            Visual Multi-Agent Swarm &amp; Memory Palace Substrate
          </h2>
          <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
            The spatial instrument for real-time multi-agent orchestration. Connects active agents (Orchestrator, Architect, Sentinel, Weaver) directly to the six persistent memory vaults with in-memory SQLite search running in &lt;0.5ms and 3-column streaming deliberation.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-cyan-400 text-lg">⚡ 120 FPS Spatial Canvas</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Infinite zoom/pan engine with viewport culling, Bezier cable links, and animated context token particles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-emerald-400 text-lg">💾 Local SQLite Substrate</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All 6 vaults indexed in-memory with FTS5 lexical ranking and HashingTF vector sidecar. 0 network calls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-violet-400 text-lg">◈ Deliberation Chamber</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parallel 3-column live multi-agent consensus panel generating signed SIP Consensus JSON artifacts.
            </p>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-violet-950/40 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Launch Starlight Cockpit</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Available via standalone single-file instrument or high-velocity Vite dev server
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/cockpit/starlight-cockpit.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white text-[#050509] font-bold text-xs font-mono hover:bg-slate-200 transition-colors shadow-lg"
            >
              Open Standalone HTML →
            </a>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
            >
              Vite Dev (Port 3002) →
            </a>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Starlight Cockpit • Operational Tier</span>
        <span className="text-emerald-400 font-semibold">Built on SIP — Sovereign Substrate</span>
      </footer>
    </div>
  );
}

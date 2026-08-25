import type { Metadata } from "next";
import Link from "next/link";
import { VisualExplorer } from "@/components/visuals/VisualExplorer";
import { Sparkles, Layers, Image as ImageIcon, ArrowRight, ShieldCheck, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Visual Encyclopedia & Media Studio — Starlight Intelligence",
  description:
    "Explore the comprehensive visual encyclopedia of the Starlight Intelligence Protocol: 12 aesthetic batches, 50 agent plates, memory chambers, and technical topologies.",
  alternates: { canonical: "/visuals" },
};

export default function VisualsStudioPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-slate-200">
      {/* Studio Hero Header */}
      <section className="relative overflow-hidden border-b border-white/[0.06] pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="mx-auto max-w-[88rem] px-6">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-violet-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Starlight Visual Intelligence & Brand System
            </div>

            <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Visual Encyclopedia <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                & Media Studio.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
              Explore high-fidelity visual plates across twelve canonical batches: porcelain agent archetypes,
              sacred basalt memory chambers, sovereign authority controls, and multi-agent topologies.
              Fully attested under EU AI Act Article 50.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/constellation"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#060609] transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Inspect 50 Agents <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/visuals/brand-lab"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
              >
                Open Brand Lab Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Studio Explorer */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[88rem] px-6">
          <VisualExplorer />
        </div>
      </section>
    </div>
  );
}

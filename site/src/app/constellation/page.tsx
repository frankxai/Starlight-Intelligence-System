import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AgentAtlas } from "@/components/constellation/AgentAtlas";
import { SwarmBuilder } from "@/components/constellation/SwarmBuilder";
import { SwarmSimulator } from "@/components/constellation/SwarmSimulator";
import { VISUAL_BATCHES } from "@/lib/constellation-data";
import { Sparkles, Shield, Cpu, Database, Network, ArrowRight, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "The Agent Constellation — 50 Governed Specialists & 10 Houses",
  description:
    "Explore the 50 governed Starlight agents across ten canonical houses. Inspect prompt contracts, stop conditions, and visual identity plates.",
  alternates: { canonical: "/constellation" },
};

const principles = [
  {
    num: "01",
    title: "Human Authority",
    desc: "Mission scope, budget, irreversible releases, and the kill switch stay with the human operator.",
  },
  {
    num: "02",
    title: "Bounded Council",
    desc: "Active consensus loops are limited to 3–5 specialists per swarm to prevent token latency and hallucination cascade.",
  },
  {
    num: "03",
    title: "Proof Before Power",
    desc: "No agent gains write capabilities or public deployment access without verified evidence receipts and test runs.",
  },
];

export default function ConstellationPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="mx-auto max-w-[88rem] px-6">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-violet-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Starlight Intelligence Protocol · Constellation 01
            </div>

            <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Ten Houses. Fifty Agents. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                One Sovereign Command.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
              Meet a living intelligence constellation. Every named agent has a prompt contract,
              skill set, stopping point, graph position, and proof obligation. Compose the right council
              and keep the sovereign key.
            </p>
          </div>

          {/* Hero Lineup Banner */}
          <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl">
            <div className="relative aspect-[16/9] w-full max-h-[560px]">
              <Image
                src="/assets/constellation/constellation-lineup.webp"
                alt="Seven porcelain Starlight agents assembled in a sovereign basalt archive"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060609] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <span className="font-mono text-xs text-violet-300">
                    Porcelain & Basalt Visual System
                  </span>
                  <h3 className="text-xl font-bold text-white md:text-2xl drop-shadow-md">
                    The Seven Foundational Archetypes
                  </h3>
                </div>
                <div className="flex gap-2 font-mono text-xs text-slate-400">
                  <span className="rounded-lg bg-black/60 px-3 py-1 border border-white/10">
                    50 Named Agents
                  </span>
                  <span className="rounded-lg bg-black/60 px-3 py-1 border border-white/10">
                    10 Federated Houses
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Principles Rail */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <div
                key={p.num}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md"
              >
                <span className="font-mono text-xs font-bold text-violet-400">{p.num}</span>
                <h3 className="mt-2 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Swarm Council Composer & Real-time Simulator */}
      <section className="border-b border-white/[0.06] py-16 md:py-24">
        <div className="mx-auto max-w-[88rem] px-6 space-y-12">
          <SwarmBuilder />
          <SwarmSimulator />
        </div>
      </section>

      {/* Visual Encyclopedia Batches Showcase */}
      <section className="border-b border-white/[0.06] py-16 md:py-24">
        <div className="mx-auto max-w-[88rem] px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Layers className="h-4 w-4" /> Visual Encyclopedia
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
                The 12 Visual Batches
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                High-resolution plates depicting memory chambers, authority controls, and eval trays.
              </p>
            </div>
            <Link
              href="/visuals/brand-lab"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200"
            >
              Open Full Brand Lab <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {VISUAL_BATCHES.map((batch) => (
              <div
                key={batch.id}
                className="flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#0c0c14] p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-violet-400">
                      Batch {String(batch.id).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {batch.sampleImages.length} Plates
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{batch.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{batch.focus}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {batch.sampleImages.slice(0, 2).map((img) => (
                      <div
                        key={img.title}
                        className="relative aspect-video overflow-hidden rounded-xl bg-black/40 border border-white/[0.06]"
                      >
                        <Image src={img.src} alt={img.title} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete 50-Agent Atlas */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[88rem] px-6">
          <div className="mb-10">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-violet-400">
              <Network className="h-4 w-4" /> Comprehensive Directory
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white md:text-5xl">
              The Agent Atlas
            </h2>
            <p className="mt-3 text-sm text-slate-300 md:text-base">
              Filter by house, role kind, or search across prompt capabilities to find any of the 50 governed agents.
            </p>
          </div>

          <AgentAtlas />
        </div>
      </section>
    </div>
  );
}

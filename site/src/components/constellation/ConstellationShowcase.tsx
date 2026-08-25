import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Database, Cpu } from "lucide-react";
import { VISUAL_BATCHES } from "@/lib/constellation-data";

export function ConstellationShowcase() {
  const coreBatch = VISUAL_BATCHES[0]; // Batch 01

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#060609] py-20 md:py-28">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="mx-auto max-w-[88rem] px-6">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-violet-400">
              <Sparkles className="h-4 w-4" /> Sovereign Constellation 01
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">
              Meet the agent fleet <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                built on verifiable memory.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
              Ten houses. Fifty named specialists. Every agent has a prompt contract, visual plate,
              and immutable stopping conditions. Governed councils where humans keep the irreversible keys.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/constellation"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#060609] transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Explore All 50 Agents <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/vaults"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
            >
              Inspect Memory Vaults
            </Link>
          </div>
        </div>

        {/* Hero Visual Plate: The 7-Agent Lineup */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl">
          <div className="relative aspect-[16/9] w-full max-h-[540px]">
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
                <span className="rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-300 backdrop-blur-md">
                  Canonical Lineup v1.0
                </span>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl drop-shadow-md">
                  Aster · Bastion · Quill · Luma · Veyra · Kite · Mote
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="font-mono text-xs text-slate-300 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                  EU AI Act Art. 50 Provenance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Up Core Agent Spotlight Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreBatch.sampleImages.map((agent) => (
            <div
              key={agent.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#11111c]"
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/40 border border-white/[0.04]">
                  <Image
                    src={agent.src}
                    alt={agent.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="mt-4 text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  {agent.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {agent.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-violet-400">
                  Sovereign Spec
                </span>
                <Link
                  href="/constellation"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Dossier <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

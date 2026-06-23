import type { Metadata } from "next";
import Link from "next/link";
import { QueenSwarm } from "@/components/QueenSwarm";

export const metadata: Metadata = {
  title: "The Starlight Queen & Her Swarms — Queen Swarms Visual Skill",
  description: "Live demo of the Queen Swarms Visual skill (vision/queen-swarms-visual). The canonical L99 motion experience of the Starlight Orchestrator v0.2 closed loop and her parallel subagent swarms — scroll-driven canvas, premium visuals, SIP-attested. Activate the skill to generate variants for ledger, research, or domain surfaces.",
  openGraph: {
    title: "The Starlight Queen & Her Swarms — Queen Swarms Visual Skill",
    description: "The live public surface of the Queen Swarms Visual skill. Scroll the loop. Parallel swarms made felt. Activate to dispatch visual synthesis.",
    images: [{ url: "/queen/queen-hero-wide.jpg", width: 1200, height: 630, alt: "Starlight Queen with coordinated swarms" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Starlight Queen & Her Swarms — Queen Swarms Visual Skill",
    description: "Live demo + activation surface for the canonical Queen + swarms motion skill. Built on SIP.",
  },
};

export default function QueenPage() {
  return (
    <div className="bg-[#0a0a0f] text-zinc-200">
      {/* Hero - l99 cinematic */}
      <header className="relative min-h-[100dvh] flex items-center overflow-hidden border-b border-white/[0.08] queen-constellation">
        <div className="relative z-10 mx-auto max-w-5xl px-8 pt-16 pb-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1 text-xs tracking-[3px] text-cyan-400 mb-6">
              STARLIGHT ORCHESTRATOR • v0.2
            </div>
            <h1 className="font-serif text-[72px] md:text-[92px] leading-[0.9] tracking-[-4.5px] text-white mb-6">
              The Starlight<br />Queen &amp; Her Swarms
            </h1>
            <p className="max-w-2xl text-2xl text-zinc-400 tracking-tight mb-10">
              The living closed loop at the center of everything.<br />Scroll to witness the intelligence move.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#the-loop" className="inline-flex items-center gap-3 rounded-2xl bg-white px-9 py-4 text-lg font-medium tracking-tight text-[#0a0a0f] hover:bg-zinc-200 active:scale-[0.985] transition">
                Begin the Scroll <span>↓</span>
              </a>
              <Link href="https://github.com/frankxai/Starlight-Intelligence-System" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-7 py-4 text-sm tracking-widest hover:bg-white/5">
                View the live system
              </Link>
              <a href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/queen-motion/index.html" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white tracking-widest">Standalone motion HTML (reference) →</a>
            </div>
          </div>
        </div>

        {/* Hero visual — wired premium generated L99 asset */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[58%] opacity-90">
          <img src="/assets/visuals/queen/7.jpg" alt="Starlight Queen conducting swarms" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[4px] text-white/50">SCROLL TO ENTER THE LOOP</div>
      </header>

      {/* Intro */}
      <div className="mx-auto max-w-3xl px-8 py-20 text-center">
        <p className="text-3xl leading-tight tracking-[-0.5px] text-white">
          A continuous, self-advancing intelligence that routes, measures with parallel swarms, learns, ratifies with discipline, and ledgers through beautiful native visuals.
        </p>
        <p className="mt-6 text-zinc-400">This is not documentation. This is the system made visible.</p>
      </div>

      {/* The Loop - full scroll symphony */}
      <section id="the-loop" className="border-t border-white/10 bg-black/30 py-12">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-cyan-400">THE CONTINUOUS CYCLE</div>
              <h2 className="mt-2 font-serif text-6xl tracking-[-2.2px]">The Queen Loop</h2>
            </div>
            <div className="hidden text-right text-sm text-zinc-400 md:block max-w-[280px]">
              ROUTE → MEASURE → LEARN → RATIFY → LEDGER<br />
              <span className="text-xs">Visual artifacts close the loop and compound forever</span>
            </div>
          </div>

          {/* Sticky progress - mirrors the motion HTML */}
          <div className="sticky top-20 z-40 mb-8 rounded-3xl border border-white/10 bg-[#0a0a0f]/90 p-1.5 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-6 py-3 text-xs font-medium tracking-[2px]">
              <div className="relative h-px flex-1 bg-white/10">
                <div id="loop-progress" className="absolute left-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all" style={{width: '0%'}}></div>
              </div>
              <div id="phase-label" className="w-56 text-right font-mono text-[10px] text-cyan-400">SCROLL TO ADVANCE THE LOOP</div>
            </div>
          </div>

          {/* Chapters - using l99 visuals */}
          <div className="space-y-16">
            {/* ROUTE */}
            <div className="phase grid items-center gap-x-10 md:grid-cols-12" data-phase="route">
              <div className="md:col-span-5">
                <div className="text-xs tracking-[3px] text-amber-400">01 — ROUTE</div>
                <h3 className="mt-3 font-serif text-5xl tracking-[-1.5px]">The Queen reads doctrine and table.</h3>
                <p className="mt-5 text-xl text-zinc-400">Every task classified. Evidence, not guesswork. The three new classes (agentic-composer-long, visual-synthesis, parallel-harness-measure) are now first-class citizens.</p>
              </div>
              <div className="md:col-span-7 mt-8 md:mt-0">
                <div className="overflow-hidden rounded-3xl border border-white/10">
                  <img src="/assets/visuals/queen/3.jpg" alt="Queen route phase" className="w-full h-auto" />
                </div>
                <div className="mt-2 text-[10px] text-white/40 tracking-widest">L99 ROUTE — GROK IMAGINE • WIRED</div>
              </div>
            </div>

            {/* MEASURE - tall visual */}
            <div className="phase grid items-center gap-x-10 md:grid-cols-12" data-phase="measure">
              <div className="md:col-span-7 order-2 md:order-1 mt-8 md:mt-0">
                <div className="overflow-hidden rounded-3xl border border-white/10">
                  <img src="/assets/visuals/queen/2.jpg" alt="Measure phase parallel swarms" className="w-full h-auto" />
                </div>
                <div className="mt-2 text-[10px] text-white/40 tracking-widest">PARALLEL MEASURE — LIVE SWARM VISUALS</div>
              </div>
              <div className="md:col-span-5 order-1 md:order-2">
                <div className="text-xs tracking-[3px] text-cyan-400">02 — MEASURE</div>
                <h3 className="mt-3 font-serif text-5xl tracking-[-1.5px]">Parallel subagent swarms execute the proving ground in real time.</h3>
                <p className="mt-5 text-xl text-zinc-400">Grok explore/plan/best-of-n/check-work + gstack + Visual Eval. Every model-lane receipt now ships a native visual artifact. This is the cost/perf + parallelism advantage made visible.</p>
                <div className="mt-6 text-sm text-emerald-400/90">Composer 2.5 integration • Real-time grounding • Excellence gates</div>
              </div>
            </div>

            {/* LEARN + LEDGER combined for flow */}
            <div className="phase grid items-center gap-x-10 md:grid-cols-12" data-phase="learn">
              <div className="md:col-span-5">
                <div className="text-xs tracking-[3px] text-violet-400">03 — LEARN + 04/05 — RATIFY &amp; LEDGER</div>
                <h3 className="mt-3 font-serif text-5xl tracking-[-1.5px]">Synthesis. Gates. Beautiful artifacts that feed back.</h3>
                <p className="mt-5 text-xl text-zinc-400">Subagents re-derive the table. A1/A2 discipline enforced. Visuals (heatmaps, palace cards, motion loops) become first-class atoms in the vault and the public surface.</p>
              </div>
              <div className="md:col-span-7 mt-8 md:mt-0">
                <div className="overflow-hidden rounded-3xl border border-white/10">
                  <img src="/assets/visuals/queen/5.jpg" alt="Learn ratify ledger visual" className="w-full h-auto" />
                </div>
                <div className="mt-2 text-[10px] text-white/40 tracking-widest">SYNTHESIS + LEDGER — ATTESTED VISUAL ATOMS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Swarms + Visual Layer */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-6xl px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="text-xs tracking-[3px] text-amber-400">DISTRIBUTED INTELLIGENCE</div>
              <h2 className="mt-2 font-serif text-5xl tracking-[-1.8px]">Her Swarms</h2>
              <p className="mt-5 text-xl text-zinc-400">The Queen never works alone. Subagent swarms (Grok-native parallelism) execute MEASURE and LEARN concurrently while the Visual Composition Layer turns every tick into a permanent, attested artifact.</p>
            </div>
            <div>
              <QueenSwarm className="w-full aspect-[16/9.6] rounded-3xl border border-white/10" phase="measure" interactive />
              <div className="mt-2 text-[10px] text-white/50 tracking-widest">LIVE INTERACTIVE — QUEEN DIRECTS 92 AGENTS. MOVE CURSOR TO CONDUCT.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Composition + CTA */}
      <section className="border-t border-white/10 bg-zinc-950/60 py-16">
        <div className="mx-auto max-w-5xl px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="text-xs tracking-[3px] text-violet-400">NATIVE SUBSTRATE</div>
            <h2 className="mt-3 font-serif text-5xl tracking-[-1.5px]">Visual Composition Layer</h2>
            <p className="mt-5 text-xl text-zinc-400">Images and motion are no longer side effects. They are the memory, the ledger, the research surface, and the public face of the system.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { title: "QUEEN LEDGER", desc: "Every execution produces or references a permanent visual artifact." },
              { title: "MEMORY PALACE", desc: "Visuals live inside the six vaults as first-class, queryable atoms." },
              { title: "ATTESTATION", desc: "Every frame carries SIP provenance. Forkable. Sovereign." },
            ].map((c, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-left">
                <div className="text-xs tracking-[2px] text-violet-400">{c.title}</div>
                <div className="mt-4 text-2xl tracking-tight text-white">{c.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/research" className="rounded-2xl border border-white/20 px-8 py-3 hover:bg-white/5">Explore the Research</Link>
            <a href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/queen-motion/index.html" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/20 px-8 py-3 hover:bg-white/5">Standalone Motion HTML (reference)</a>
            <Link href="https://github.com/frankxai/Starlight-Intelligence-System" className="rounded-2xl bg-white px-8 py-3 text-[#0a0a0f]">Live system on GitHub</Link>
          </div>

          {/* Activate Queen Visual Skill CTA — /queen is now the live demo surface of the packaged skill */}
          <div className="mt-14 mx-auto max-w-xl">
            <a 
              href="/queen-vision.html" 
              className="group block rounded-3xl border border-white/20 bg-white/[0.015] px-10 py-8 text-center hover:border-cyan-400/50 hover:bg-white/[0.03] active:scale-[0.985] transition-all"
            >
              <div className="text-xs tracking-[3.5px] text-cyan-400 mb-2">VISION / QUEEN-SWARMS-VISUAL • L99 PACKAGED</div>
              <div className="text-3xl tracking-tighter font-semibold text-white group-hover:text-cyan-300 transition-colors">ACTIVATE QUEEN VISUAL SKILL</div>
              <div className="mt-3 text-sm text-white/60 max-w-[42ch] mx-auto">Open the canonical deliverable (self-contained HTML with modular config, robust canvas, full SIP instructions). Scroll to feel the swarms respond. This is the skill in action — fork the CONFIG to produce ledger / palace / vertical variants.</div>
              <div className="mt-5 inline-flex items-center gap-2 text-xs tracking-widest text-amber-300/80 group-hover:text-amber-300">OPEN CANONICAL → /queen-vision.html (or docs/queen-motion/)</div>
            </a>
            <div className="mt-3 text-[10px] text-white/40 text-center">Also: <code className="font-mono text-amber-300/70">/starlight-queen ledger --visual</code> • <Link href="/docs/queen-motion" className="underline hover:text-white/70">deep standalone narrative</Link> • skill definition in <code>skills/vision/queen-swarms-visual.md</code></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-xs text-white/40">
        Built on SIP v1.1.1 · Queen v0.2 self-advancing loop · All visuals generated with Grok Imagine under the l99 visual intelligence push.
      </footer>
    </div>
  );
}

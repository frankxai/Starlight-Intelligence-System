import type { Metadata } from "next";
import Link from "next/link";
import { QueenSwarm } from "@/components/QueenSwarm";
import { STAR_GUARDIAN_TIER, QUEEN_NARRATIVES, EXPANDED_SWARM_FIELDS } from "@/lib/queen-visuals";

export const metadata: Metadata = {
  title: "The Starlight Queen & Her Swarms",
  description: "Live demo of the continuous Queen loop at the heart of Starlight. Scroll-driven, premium visuals, parallel subagent swarms, SIP-attested. The system made visible.",
  openGraph: {
    title: "The Starlight Queen & Her Swarms",
    description: "The living closed loop. ROUTE → MEASURE → LEARN → RATIFY → LEDGER. Premium visuals as first-class artifacts. Built on SIP.",
    images: [{ url: "/assets/visuals/queen/7.jpg", width: 1200, height: 630, alt: "Starlight Queen conducting swarms" }],
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
              The continuous, self-advancing intelligence at the center.<br />One substrate. Coordinated swarms. Visuals that compound.
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
          <img src="/assets/visuals/08-readme-hero.jpg" alt="One substrate — every CLI shares attested memory" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[4px] text-white/50">SCROLL TO ENTER THE LOOP</div>
      </header>

      {/* Intro */}
      <div className="mx-auto max-w-3xl px-8 py-20 text-center">
        <p className="text-3xl leading-tight tracking-[-0.5px] text-white">
          A continuous loop that routes work, measures with parallel swarms and visual eval, learns, ratifies with discipline, and ledgers through native visuals that compound.
        </p>
        <p className="mt-6 text-zinc-400">Scroll the loop. See the intelligence move.</p>
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
                  <img src="/assets/visuals/15-queen-loop.jpg" alt="Queen continuous loop" className="w-full h-auto" />
                </div>
                <div className="mt-2 text-[10px] text-white/40 tracking-widest">L99 ROUTE — GROK IMAGINE • WIRED (special receipt; see queen-premium/ for scalable Sovereign excellence 101+)</div>
              </div>
            </div>

            {/* MEASURE - tall visual */}
            <div className="phase grid items-center gap-x-10 md:grid-cols-12" data-phase="measure">
              <div className="md:col-span-7 order-2 md:order-1 mt-8 md:mt-0">
                <div className="overflow-hidden rounded-3xl border border-white/10">
                  <img src="/assets/visuals/02-starlight-queen-closed-loop-dashboard.jpg" alt="Measure with parallel swarms and visual eval" className="w-full h-auto" />
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
                  <img src="/assets/visuals/06-self-advancing-sis-constellation.jpg" alt="Self-advancing system" className="w-full h-auto" />
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
              {/* Example Sovereign excellence wire (101+ from registry / queen-premium) for additional visual reference in swarms layer */}
              <div className="mt-4 text-[10px] text-white/40">Additional excellence Sovereign example: /assets/visuals/queen-premium/108.jpg (swarm field) — see VISUAL_WIRING_MAP for full targets.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Star Guardian Tier — executed 2026-06-26 */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-6xl px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-violet-400">STAR GUARDIAN × STARLIGHT</div>
              <h2 className="mt-2 font-serif text-5xl tracking-[-1.6px]">Luminous Guardians</h2>
            </div>
            <p className="max-w-md text-right text-sm text-zinc-400 hidden md:block">
              Riot splash polish (four-pointed stars, iridescent ribbons, personality-mapped palettes) blended with Queen conductor + swarm familiars DNA.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STAR_GUARDIAN_TIER.map((id) => (
              <figure key={id} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={`/assets/visuals/queen-premium/${id}.jpg`}
                    alt={`Star Guardian Queen variant ${id}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-[10px] tracking-widest text-white/60">QUEEN-PREMIUM/{id}</div>
                  </div>
                </div>
                <figcaption className="px-3 py-2.5 text-xs text-zinc-400">
                  {id === 109 && "Ahri-like leader — charismatic sovereign"}
                  {id === 110 && "Lux optimistic — hopeful protector"}
                  {id === 111 && "Jinx chaotic — explosive energy"}
                  {id === 112 && "Kai'Sa tactical — precision power"}
                  {id === 113 && "Ezreal playful — youthful explorer"}
                  {id === 114 && "Team composition — Queen + Guardians"}
                  {id === 115 && "Action battle — /queen phases"}
                  {id === 116 && "Prestige luxurious — gold silk drama"}
                  {id === 117 && "Chibi Codex — likeability tier"}
                  {id === 118 && "Dark Prestige — Syndra mystery"}
                  {id === 119 && "Weaver — memory orbs & threads"}
                  {id === 120 && "Ledger refined — proving ground"}
                  {id === 121 && "Resting contemplative"}
                  {id === 122 && "Chibi Orchestrator — leadership"}
                  {id === 123 && "Chibi Genius — excavation"}
                  {id === 124 && "Defensive swarm shield"}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-4 text-[10px] text-white/40 tracking-widest">
            Full research + prompts: brand-assets/prompts/visuals/STAR_GUARDIAN_STARLIGHT_PROMPTS.md • Curated from excellence-next/star-guardian
          </div>
        </div>
      </section>

      {/* Sovereign States — executed 2026-07-04 */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-6xl px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-amber-400">SOVEREIGN STATES</div>
              <h2 className="mt-2 font-serif text-5xl tracking-[-1.6px]">The Queen Narratives</h2>
            </div>
            <p className="max-w-md text-right text-sm text-zinc-400 hidden md:block">
              Sovereign states of the Queen. From conducting swarms to weaving memory and resting in the palace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {QUEEN_NARRATIVES.map((id) => (
              <figure key={id} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={`/assets/visuals/queen-premium/${id}.jpg`}
                    alt={`Queen Narrative ${id}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-[10px] tracking-widest text-white/60">QUEEN-PREMIUM/{id}</div>
                  </div>
                </div>
                <figcaption className="px-3 py-2.5 text-xs text-zinc-400">
                  {id === 166 && "The Queen Conducting"}
                  {id === 167 && "The Queen Weaving"}
                  {id === 168 && "The Queen Resting"}
                  {id === 169 && "The Queen Archiving"}
                  {id === 170 && "The Queen Healing"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Swarm Topology — executed 2026-07-04 */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-6xl px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-cyan-400">SWARM TOPOLOGY</div>
              <h2 className="mt-2 font-serif text-5xl tracking-[-1.6px]">Expanded Swarm Fields</h2>
            </div>
            <p className="max-w-md text-right text-sm text-zinc-400 hidden md:block">
              The intricate formations of the swarms, demonstrating creative, measuring, healing, and resonant configurations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {EXPANDED_SWARM_FIELDS.map((id) => (
              <figure key={id} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={`/assets/visuals/queen-premium/${id}.jpg`}
                    alt={`Swarm Field ${id}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-[10px] tracking-widest text-white/60">QUEEN-PREMIUM/{id}</div>
                  </div>
                </div>
                <figcaption className="px-3 py-2.5 text-xs text-zinc-400">
                  {id === 161 && "Creative Swarm Matrix"}
                  {id === 162 && "Measure Swarm Grid"}
                  {id === 163 && "Healing Swarm Lattice"}
                  {id === 164 && "Resonance Swarm Wave"}
                  {id === 165 && "Ledger Swarm Archive"}
                </figcaption>
              </figure>
            ))}
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, ScanLine } from "lucide-react";
import { BRAND_STUDIES, STAR_GUARDIAN_BRAND_STUDIES, TECHNICAL_ASSETS, CODEX_OMEGA_ASSETS, EXPANSION_ASSETS, CODEX_OMEGA_LEADERSHIP, SYSTEM_INFOGRAPHICS, SOCIAL_KITS, DOMAIN_OMEGA_ASSETS, EXPANDED_SWARM_FIELDS, QUEEN_NARRATIVES, ADVANCED_INFOGRAPHICS } from "@/lib/queen-visuals";

const TECHNICAL_ASSET_METADATA: Record<number, { title: string; note: string }> = {
  125: { title: "Attestation Seal Logo", note: "Geometric seal for code attestation" },
  126: { title: "Memory Palace Schema", note: "Isometric vault mapping" },
  127: { title: "Swarm Routing Flowchart", note: "Parallel agent network" },
  128: { title: "System Architecture Cover", note: "Dual-layer stack cover" },
};

const OMEGA_ASSET_METADATA: Record<number, { title: string; note: string }> = {
  129: { title: "Omega Orchestrator", note: "Master coordinator 3D mascot" },
  130: { title: "Omega Genius", note: "Excavator/explorer 3D mascot" },
  131: { title: "Omega Hermes", note: "High-speed messenger 3D mascot" },
  132: { title: "Omega Sentinel", note: "Heavy-duty guardian 3D mascot" },
  133: { title: "Omega Weaver", note: "Creative synthesis 3D mascot" },
};

const EXPANSION_ASSET_METADATA: Record<number, { title: string; note: string }> = {
  134: { title: "Contemplative Queen", note: "Resting, processing data" },
  135: { title: "Ledger Proving Ground", note: "Immutable data processing" },
  136: { title: "Exploratory Swarm Field", note: "Agent swarms scanning horizon" },
  137: { title: "Defensive Swarm Mesh", note: "Interlocking defensive barrier" },
};

const OMEGA_LEADERSHIP_METADATA: Record<number, { title: string; note: string }> = {
  138: { title: "Omega Prime", note: "Synthesis leader 3D mascot" },
  139: { title: "Omega Architect", note: "System designer 3D mascot" },
  140: { title: "Omega Navigator", note: "Long-horizon planner 3D mascot" },
  141: { title: "Omega Envoy", note: "Front-door creator 3D mascot" },
  142: { title: "Omega Sage", note: "Vault memory keeper 3D mascot" },
  143: { title: "Omega Social Strategist", note: "Audience dynamics auditor 3D mascot" },
};

const SYSTEM_INFOGRAPHICS_METADATA: Record<number, { title: string; note: string }> = {
  144: { title: "Agent Hierarchy Matrix", note: "3D structural tier diagram" },
  145: { title: "SIP Substrate Layers", note: "Abstract protocol layer visualization" },
  146: { title: "Memory Palace Orbs", note: "6 core memory vaults orbiting" },
};

const SOCIAL_KITS_METADATA: Record<number, { title: string; note: string }> = {
  147: { title: "The Queen's Edict", note: "16:9 cinematic negative space" },
  148: { title: "The Swarm Heart", note: "1:1 pulsing geometric heart" },
};

const DOMAIN_OMEGA_METADATA: Record<number, { title: string; note: string }> = {
  149: { title: "Omega Bio-Architect", note: "Health sub-stack leader" },
  150: { title: "Omega Longevity Sage", note: "Health memory keeper" },
  151: { title: "Omega Metabolic Sentinel", note: "Health telemetry guardian" },
  152: { title: "Omega Neural Weaver", note: "Health cognitive synthesis" },
  153: { title: "Omega Sound Composer", note: "Music algorithmic composer" },
  154: { title: "Omega Audio Producer", note: "Music mix & stem synthesis" },
  155: { title: "Omega Sync Strategist", note: "Music distribution planner" },
  156: { title: "Omega Resonance Analyst", note: "Music cymatic vibration" },
  157: { title: "Omega Culture Strategist", note: "People culture dynamicist" },
  158: { title: "Omega Talent Scout", note: "People talent acquisition" },
  159: { title: "Omega Performance Coach", note: "People performance tracking" },
  160: { title: "Omega Org Architect", note: "People structural hierarchy" },
};

const EXPANDED_SWARM_METADATA: Record<number, { title: string; note: string }> = {
  161: { title: "Creative Swarm Matrix", note: "Abstract generative swarm" },
  162: { title: "Measure Swarm Grid", note: "Rigid mapping grid swarm" },
  163: { title: "Healing Swarm Lattice", note: "Restorative code repair" },
  164: { title: "Resonance Swarm Wave", note: "Audio cymatic formations" },
  165: { title: "Ledger Swarm Archive", note: "Data storage operations" },
};

const QUEEN_NARRATIVE_METADATA: Record<number, { title: string; note: string }> = {
  166: { title: "The Queen Conducting", note: "Orchestrating the swarm" },
  167: { title: "The Queen Weaving", note: "Synthesizing data threads" },
  168: { title: "The Queen Resting", note: "Idle mode preservation" },
  169: { title: "The Queen Archiving", note: "Memory classification" },
  170: { title: "The Queen Healing", note: "System restoration" },
};

const ADVANCED_INFOGRAPHICS_METADATA: Record<number, { title: string; note: string }> = {
  171: { title: "Domain Sub-Stack Topology", note: "Multi-domain routing" },
  172: { title: "The Proving Ground Flow", note: "Execution sandbox logic" },
  173: { title: "The Veil Gateway", note: "PII & secret sanitization" },
  174: { title: "144-Agent Blueprint", note: "Total swarm architecture" },
};

export const metadata: Metadata = {
  title: "Visual Brand Lab",
  description:
    "Generated Starlight visual studies kept separate from the operational product homepage for inspection, QA, and brand-system iteration.",
};

const OPERATIONAL_STUDIES = [
  {
    src: "/assets/visuals/08-readme-hero.jpg",
    title: "Readme hero study",
    note: "Public identity frame",
  },
  {
    src: "/assets/visuals/09-six-vaults.jpg",
    title: "Six vaults",
    note: "Memory architecture illustration",
  },
  {
    src: "/assets/visuals/11-mcp-tools.jpg",
    title: "MCP tools",
    note: "Adapter surface study",
  },
  {
    src: "/assets/visuals/16-architecture-flow.jpg",
    title: "Architecture flow",
    note: "System map study",
  },
  {
    src: "/assets/visuals/17-attestation-everywhere.jpg",
    title: "Attestation",
    note: "Proof layer study",
  },
  {
    src: "/assets/visuals/14-recall-screenshot.jpg",
    title: "Recall",
    note: "Memory retrieval study",
  },
];

// Using centralized registry from @/lib/queen-visuals for maintainability and future extension.

export default function BrandLabPage() {
  return (
    <div className="bg-[#060609] text-white">
      <section className="border-b border-white/[0.08] px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">
            <ImageIcon size={15} aria-hidden="true" />
            Visual brand lab
          </div>
          <div className="mt-5 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Generated studies live here, not in the product hero.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                This route preserves the useful Starlight visual exploration as
                an inspectable brand lab. Production pages should use these only
                after crop, artifact, accessibility, and surface-fit checks.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
              <div className="flex items-start gap-3">
                <ScanLine size={20} className="mt-0.5 text-cyan-200" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Asset gate
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Approve generated visuals only when they score 26/30 or
                    better, contain no fake text, and improve the exact surface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Operational studies
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                These frames are retained as visual research. Exact UI, labels,
                diagrams, and proof surfaces should still be coded directly.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              Back to product homepage
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OPERATIONAL_STUDIES.map((study) => (
              <VisualCard
                key={study.src}
                src={study.src}
                title={study.title}
                note={study.note}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">
            Brand character studies
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            These are exploratory and belong to the visual system, not the first
            viewport of the operational product.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_STUDIES.map((id) => (
              <VisualCard
                key={id}
                src={`/assets/visuals/queen-premium/${id}.jpg`}
                title={`Brand study ${id}`}
                note="Generated visual draft"
                square
              />
            ))}
          </div>
        </div>
      </section>

      {/* Star Guardian Tier — new 2026-06-26 */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-violet-400">NEW TIER</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Star Guardian Splash</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              Riot Star Guardian polish (four-pointed stars, iridescent ribbons, personality palettes) fused with Queen + swarm DNA.
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            10 refined variants: Ahri-leader sovereign, Prestige dark (Syndra), Lux optimistic, Jinx chaotic, Kai&apos;Sa tactical, Ezreal playful, group Guardians, action battle, prestige luxurious, and Codex chibi. Use for /queen phases, brand-lab contrast, social kits, and agent personality.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAR_GUARDIAN_BRAND_STUDIES.map((id) => (
              <VisualCard
                key={id}
                src={`/assets/visuals/queen-premium/${id}.jpg`}
                title={`Star Guardian ${id}`}
                note="Riot splash × Starlight Queen"
                square
              />
            ))}
          </div>

          <p className="mt-4 text-[10px] tracking-widest text-white/40">
            Promoted from excellence-next/star-guardian/ • See STAR_GUARDIAN_STARLIGHT_PROMPTS.md for full research + exact prompts
          </p>
        </div>
      </section>

      {/* Technical & Non-Fiction Tier — new 2026-07-04 */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-cyan-400">TECHNICAL CANON</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Technical &amp; Non-Fiction Studies</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              Sacred geometric layouts, glassmorphic panels, and precise data layers mapping memory vaults and routing topologies.
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Fulfilling the local design.md target asset queue (125-128). Wireframes, flowcharts, seals, and architecture covers optimized for high-contrast technical contexts.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNICAL_ASSETS.map((id) => {
              const meta = TECHNICAL_ASSET_METADATA[id] || { title: `Technical Asset ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                  square
                />
              );
            })}
          </div>

          <p className="mt-4 text-[10px] tracking-widest text-white/40">
            Promoted from excellence-next/starlight_*.png • Built on the sovereign substrate of the Starlight Intelligence Protocol
          </p>
        </div>
      </section>

      {/* Omega Codex Tier — Pivot 2026-07-04 */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-fuchsia-400">AGENT CODEX TIER</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">FrankX Omega 3D Mascot Studies</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              Premium sleek mechanical forms for the 144-agent swarm. Chrome, glass, gold chassis with glowing neural cores.
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Showcasing the baseline 3D illustrations for five core specialist and leadership agents (Orchestrator, Genius, Hermes, Sentinel, Weaver). Designed to provide a high-end, professional personality across documentation and UI matrices.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CODEX_OMEGA_ASSETS.map((id) => {
              const meta = OMEGA_ASSET_METADATA[id] || { title: `Omega Agent ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                  square
                />
              );
            })}
          </div>

          <p className="mt-4 text-[10px] tracking-widest text-white/40">
            Promoted from brand-assets/06-illustrations/agents-omega/omega-*.png • FrankX Omega Alignment
          </p>
        </div>
      </section>

      {/* Brand Expansion Tier */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-cyan-400">BRAND EXPANSION</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Advanced Narrative Studies</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              Cinematic scale renders depicting the Queen, Proving Grounds, and active Swarms in their environments.
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Expanding the visual narrative with wider, 16:9 cinematic shots. Perfect for blog headers, deep-dives, and documentation heroes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {EXPANSION_ASSETS.map((id) => {
              const meta = EXPANSION_ASSET_METADATA[id] || { title: `Brand Asset ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                />
              );
            })}
          </div>

          <p className="mt-4 text-[10px] tracking-widest text-white/40">
            Promoted from brand-assets/06-illustrations/excellence-next/ • Cinematic Narrative Alignment
          </p>
        </div>
      </section>

      {/* Omega Leadership Tier */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-yellow-400">LEADERSHIP CODEX</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Omega Leadership &amp; Foundation</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              The strategic and foundational agents that guide the swarm.
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Expanding the FrankX Omega 3D Mascot codex to cover the leadership tier (Prime, Architect, Navigator) and foundation (Envoy, Sage, Social Strategist).
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {CODEX_OMEGA_LEADERSHIP.map((id) => {
              const meta = OMEGA_LEADERSHIP_METADATA[id] || { title: `Omega Leader ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.jpg`}
                  title={meta.title}
                  note={meta.note}
                  square
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Sovereign System Infographics */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-emerald-400">SYSTEM ARCHITECTURE</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Sovereign System Infographics</h2>
            </div>
            <div className="text-right text-xs text-slate-400 max-w-[260px]">
              Premium 3D artistic foundations for technical diagrams.
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SYSTEM_INFOGRAPHICS.map((id) => {
              const meta = SYSTEM_INFOGRAPHICS_METADATA[id] || { title: `Infographic ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.jpg`}
                  title={meta.title}
                  note={meta.note}
                  square
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Media Kits */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-pink-400">DISTRIBUTION</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Social Media Strategy Kits</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SOCIAL_KITS.map((id) => {
              const meta = SOCIAL_KITS_METADATA[id] || { title: `Social Kit ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.jpg`}
                  title={meta.title}
                  note={meta.note}
                  square={id === 148} // 148 is the 1:1 heart
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Domain Sub-Stacks */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-blue-400">DOMAIN SUB-STACKS</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Domain Specialist 3D Mascot Studies</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAIN_OMEGA_ASSETS.map((id) => {
              const meta = DOMAIN_OMEGA_METADATA[id] || { title: `Domain Asset ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                  square
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Expanded Swarm Fields */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-teal-400">SWARM DYNAMICS</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Expanded Swarm Fields</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPANDED_SWARM_FIELDS.map((id) => {
              const meta = EXPANDED_SWARM_METADATA[id] || { title: `Swarm Field ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Queen Narratives */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-purple-400">QUEEN ARCHETYPES</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">The Queen Narratives</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUEEN_NARRATIVES.map((id) => {
              const meta = QUEEN_NARRATIVE_METADATA[id] || { title: `Queen Narrative ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Infographics */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[3px] text-emerald-400">SYSTEM ARCHITECTURE</div>
              <h2 className="mt-1 text-2xl font-semibold text-white">Advanced System Infographics</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ADVANCED_INFOGRAPHICS.map((id) => {
              const meta = ADVANCED_INFOGRAPHICS_METADATA[id] || { title: `Infographic ${id}`, note: "Generated study" };
              return (
                <VisualCard
                  key={id}
                  src={`/assets/visuals/queen-premium/${id}.png`}
                  title={meta.title}
                  note={meta.note}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function VisualCard({
  src,
  title,
  note,
  square = false,
}: {
  src: string;
  title: string;
  note: string;
  square?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035]">
      <div className={`relative ${square ? "aspect-square" : "aspect-[16/10]"}`}>
        <Image
          src={src}
          alt={title}
          fill
          sizes={square ? "(max-width: 1024px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 33vw"}
          className="object-cover"
        />
      </div>
      <figcaption className="border-t border-white/[0.08] p-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </figcaption>
    </figure>
  );
}

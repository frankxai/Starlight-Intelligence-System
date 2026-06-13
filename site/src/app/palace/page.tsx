import { MemoryPalace } from "@/components/MemoryPalace";
import Link from "next/link";

export const metadata = {
  title: "Memory Palace",
  description:
    "The living visualization of Starlight's six-vault memory substrate. Obsidian bridge live now. This is the L99 seed for the full Jarvis-style 3D palace.",
  openGraph: {
    title: "Starlight Memory Palace — Living Intelligence Visualization",
    description:
      "Six vaults. Compound intelligence. Voice-reactive. SIP-attested. The beautiful animated experience layer for the Starlight Intelligence Protocol.",
  },
};

export default function PalacePage() {
  return (
    <div className="min-h-screen bg-[#060609] pb-24 pt-8 text-[#e2e8f0]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[3px] text-white/50">
          <Link href="/" className="hover:text-white/80 transition">Starlight</Link>
          <span>/</span>
          <span>EXPERIENCE LAYER</span>
        </div>

        <div className="mb-10">
          <div className="text-5xl font-semibold tracking-tighter">Memory Palace</div>
          <p className="mt-3 max-w-2xl text-lg text-white/70">
            The visual heart of the substrate. Six permanent vaults. Real excerpts. Animated constellation. 
            Speak or click to focus. This is how intelligence should feel.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="rounded-full border border-white/10 px-3 py-1 text-white/60">Obsidian bridge live now</div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-white/60">SIP v1.1.1 attested</div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-white/60">L99 seed for the 21-person build</div>
          </div>
        </div>

        <MemoryPalace />

        <div className="mx-auto mt-12 max-w-3xl text-sm text-white/60">
          <p>
            <strong className="text-white/80">Obsidian for now.</strong> Open the <code className="font-mono text-white/70">memory/</code> folder as a vault. 
            The new <code className="font-mono text-white/70">starlight-network.base</code> gives you a living dashboard. 
            Curated notes with wikilinks appear in the graph automatically via the mempalace-obsidian-bridge skill and <code>/curate-recall</code>.
          </p>
          <p className="mt-4">
            <strong className="text-white/80">Own visualization long-term.</strong> This palace (pure SVG + CSS + existing BrainHero/Starfield idioms) is the zero-dep seed. 
            The full team brief lives at <Link href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/superpowers/specs/2026-06-12-jarvis-memory-palace-team-brief.md" className="underline hover:text-white">docs/superpowers/specs/2026-06-12-jarvis-memory-palace-team-brief.md</Link>. 
            It specifies r3f + custom shaders + real gateway data + desire-proof loops + swarm topology for the production 3D experience.
          </p>
          <p className="mt-3 text-[10px] text-white/40">
            L99 2026-06-12 • Queen v0.2 visual seed • Built on SIP v1.1.1
          </p>
          <p className="mt-4 text-xs text-white/40">
            Research grounding: the 2026-05 premium 3D memory palace survey (Liquid Glass, Linear glassmorphic, Bruno Simon craft, NASA factuality, Obsidian Canvas spatial cards).
            All patterns respect the Frank DNA: direct, technical, warm, playful, pattern recognition as poetry.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/vaults"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[2px] text-white/60 hover:text-white"
          >
            Explore the raw vaults → 
          </Link>
        </div>
      </div>
    </div>
  );
}

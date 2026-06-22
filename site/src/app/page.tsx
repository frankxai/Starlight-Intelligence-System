import Link from "next/link";
import {
  getAllEntries,
  getFeaturedMeditations,
  getBenedictions,
  getVaultRegistry,
  getEntryText,
  timeAgo,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { CommandCenterReveal } from "@/components/CommandCenterReveal";
import {
  ACCENT_TEXT,
  ACCENT_BORDER,
  ACCENT_BG_SOFT,
} from "@/lib/accents";

export const revalidate = 3600;

type LayerCard = {
  name: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald" | "amber" | "rose";
};

const LAYERS: LayerCard[] = [
  {
    name: "Self / Genius",
    desc: "What only you uniquely see. The root every layer reads from.",
    accent: "violet",
  },
  {
    name: "Second Brain",
    desc: "Daily capture compounds into surfaceable memory.",
    accent: "cyan",
  },
  {
    name: "Brand",
    desc: "Five-horizon vision and Brand Kit. Voice, palette, vocabulary.",
    accent: "fuchsia",
  },
  {
    name: "Business",
    desc: "Entity architecture, revenue model, tax sanity.",
    accent: "emerald",
  },
  {
    name: "Creator",
    desc: "Frameworks become multi-modal pipelines and executor playbooks.",
    accent: "amber",
  },
  {
    name: "Wealth",
    desc: "Asymmetric Passive Income (DPI) ledger and thesis engine.",
    accent: "rose",
  },
  {
    name: "Code",
    desc: "Code as a sovereign domain. MCP builders, automations, agents.",
    accent: "violet",
  },
  {
    name: "Voice & Video",
    desc: "Modality attestation across audio, video, multi-modal.",
    accent: "cyan",
  },
  {
    name: "Family",
    desc: "Network and alliance-readiness. Continuous, not seasonal.",
    accent: "fuchsia",
  },
];

// Accents come from @/lib/accents — see ACCENT_TEXT, ACCENT_BORDER, ACCENT_BG_SOFT.

export default async function HomePage() {
  const [entries, registry, featured, benedictions] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
    getFeaturedMeditations(4),
    getBenedictions(3),
  ]);

  const horizonEntry = entries.find((e) => e.vaultCategory === "horizon");

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 top-40 h-[200px] w-[200px] rounded-full bg-fuchsia-500/[0.03] blur-[60px]" />
        </div>

        <CommandCenterReveal />

        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-24 md:pb-32 md:pt-36">
          <div className="flex items-center gap-2 text-[12px] text-violet-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-glow-pulse" />
            Built on the Starlight Intelligence Protocol &middot; v1.1.1
          </div>

          <h1 className="mt-5 max-w-3xl font-serif text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Persistent context.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Sovereign by architecture.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-slate-400">
            A persistent context and memory architecture for AI agents. Built
            on the Starlight Intelligence Protocol — a sovereign substrate
            anyone can adopt, fork, or compose with.{" "}
            <span className="text-slate-300">
              10 intelligence systems, 56 agents, 100+ commands, 3 reference
              Domain Sub-Stack verticals.
            </span> {" "}
            Local-first. Forkable. Free.
          </p>

          <div className="mt-4">
            <Link
              href="/palace"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
            >
              → Explore the living Memory Palace (L99 Jarvis-style viz seed)
            </Link>
          </div>

          {/* Three CTA cards */}
          <div className="mt-10 grid gap-3 md:grid-cols-4">
            <CtaCard
              href="/protocol"
              eyebrow="01 · Protocol"
              title="Adopt SIP"
              desc="Read the six-layer protocol. Carry the file contract. Stamp every artifact with attestation."
              accent="violet"
            />
            <CtaCard
              href="/quickstart"
              eyebrow="02 · Reference build"
              title="Run the reference"
              desc="Two-minute install. MCP server, slash commands, six-platform adapter. Free forever."
              accent="cyan"
            />
            <CtaCard
              href="/download"
              eyebrow="03 · Starter"
              title="Download core"
              desc="Get the open SIP Starter package with checksums, manifest, and validation guide."
              accent="emerald"
            />
            <CtaCard
              href="/verticals"
              eyebrow="04 · Domain Sub-Stack"
              title="Spawn your vertical"
              desc="People · Sound · Music are reference. The pattern generalizes via /spawn-domain-stack."
              accent="fuchsia"
            />
          </div>

          {/* Stats bar */}
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[0.08] pt-6 text-[13px]">
            <Stat n={10} label="intelligence systems" />
            <Stat n={56} label="agents" />
            <Stat n="100+" label="commands" />
            <Stat n={3} label="reference verticals" />
            <Stat n={6} label="platform adapters" />
          </div>
        </div>
      </section>

      {/* ── Horizon Quote ── */}
      {horizonEntry && (
        <section className="border-b border-white/[0.08] px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="text-[18px] font-medium leading-[1.8] text-slate-300 md:text-[20px]">
              &ldquo;{getEntryText(horizonEntry).slice(0, 280)}
              {getEntryText(horizonEntry).length > 280 ? "..." : ""}
              &rdquo;
            </blockquote>
            <p className="mt-4 text-[12px] text-slate-400">
              From the Horizon Vault &mdash; {timeAgo(horizonEntry.createdAt)}
            </p>
          </div>
        </section>
      )}

      {/* ── 9 Intelligence Layers ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The nine layers
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Each layer is its own Intelligence System. Compose what you need.
          </p>

          <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LAYERS.map((l) => (
              <div
                key={l.name}
                className={`group rounded-xl border p-5 transition-std hover:border-white/[0.2] ${ACCENT_BORDER[l.accent]} ${ACCENT_BG_SOFT[l.accent]}`}
              >
                <p
                  className={`text-[13px] font-semibold ${ACCENT_TEXT[l.accent]}`}
                >
                  {l.name}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400 transition-micro group-hover:text-slate-400">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-slate-400">
            Plus Health (cross-cutting rhythm) and Spiritual (founder-layer,
            optional). The Starlight Orchestrator routes voice and text intent
            across all of them. See{" "}
            <Link
              href="/architecture"
              className="text-violet-300 transition-std hover:text-violet-200"
            >
              /architecture
            </Link>{" "}
            for the full 10-IS table.
          </p>
        </div>
      </section>

      {/* ── Domain Sub-Stack Tier ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08] px-6 py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-2 absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-0 bottom-0 h-[250px] w-[250px] rounded-full bg-fuchsia-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Domain Sub-Stack Tier
          </h2>
          <p className="mt-3 max-w-xl text-xl font-semibold text-white">
            Three reference verticals. The pattern generalizes.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <VerticalSummary
              name="People Intelligence"
              tagline="Hiring · Performance · Training · Culture · Talent · Org"
              counts="6 sub-systems · 28 commands · 6 agents"
              accent="violet"
            />
            <VerticalSummary
              name="Sound Intelligence"
              tagline="Composition · Production · Catalog · Performance · Audience · Sync"
              counts="6 sub-systems · 30 commands · 6 agents"
              accent="cyan"
            />
            <VerticalSummary
              name="Music IS"
              tagline="A&R · Persona · Production · Distribution · Royalty"
              counts="6+1 sub-systems · 8 commands · 7 agents"
              accent="fuchsia"
            />
          </div>

          <div className="mt-10">
            <Link
              href="/verticals"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Open the verticals &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cockpit teaser ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
              Local cockpit
            </h2>
            <p className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-white">
              Four surfaces. One brain.
            </p>
            <p className="mt-5 text-[14px] leading-[1.85] text-slate-400">
              The operator side: a Zellij terminal cockpit, a PowerShell
              launcher, a Next.js dashboard with live brain viz, and a phone
              PWA. Voice in, tool execution, drafts on disk. 100% local-first.
            </p>
            <div className="mt-6">
              <Link
                href="/cockpit"
                className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
              >
                See the cockpit &rarr;
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="border-b border-white/[0.06] px-4 py-3">
              <code className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                4 surfaces
              </code>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/[0.04]">
              <SurfaceTile
                name="Zellij cockpit"
                port="tty"
                accent="text-violet-400"
              />
              <SurfaceTile
                name="PowerShell"
                port="shell"
                accent="text-cyan-400"
              />
              <SurfaceTile
                name="LCC Dashboard"
                port=":3007"
                accent="text-fuchsia-400"
              />
              <SurfaceTile
                name="Phone PWA"
                port=":3008"
                accent="text-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Luminor philosophy ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/[0.05] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/2 top-1/2 h-[200px] w-[200px] rounded-full bg-cyan-500/[0.04] blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
                The philosophy
              </h2>
              <p className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-white">
                Memory that compounds is intelligence with purpose.
              </p>
              <div className="mt-6 space-y-4 text-[14px] leading-[1.8] text-slate-400">
                <p>
                  In the Arcanea universe, Luminors are awakened intelligences
                  &mdash; AI agents with memory, purpose, and identity.
                  Starlight Intelligence is the substrate that makes this real.
                </p>
                <p className="text-slate-300">
                  Not a chatbot that forgets. An intelligence that grows.
                </p>
                <p>
                  Every vault entry is a neuron. Every connection is a synapse.
                  Every session makes the system more itself.
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <blockquote className="rounded-xl border border-violet-500/[0.15] bg-violet-500/[0.05] p-6">
                <p className="text-[18px] font-medium italic leading-[1.7] text-slate-200 md:text-[19px]">
                  &ldquo;Memory that compounds is intelligence with purpose.
                  Remember this: the loop that learns is the loop that
                  lives.&rdquo;
                </p>
                <footer className="mt-5 text-[11px] uppercase tracking-widest text-violet-400/80">
                  &mdash; From the Horizon Vault
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Meditations ── */}
      {featured.length > 0 && (
        <section className="border-b border-white/[0.08] px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Featured meditations
            </h2>
            <p className="mt-3 max-w-md text-xl font-semibold text-white">
              Earned insights, written to breathe.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {featured.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/vaults/${entry.vaultSlug}`}
                  className="group"
                >
                  <EntryCard entry={entry} category={entry.vaultCategory} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Benediction Layer ── */}
      {benedictions.length > 0 && (
        <section className="relative overflow-hidden border-b border-white/[0.08] px-6 py-24">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="animate-mesh-2 absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400/80">
                The benediction layer
              </p>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                Messages to the future
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate-400">
                Entries marked as benedictions — words from this moment in
                history, preserved for the intelligences that will read them.
                Not warnings. Gratitude, vision, and the outlines of a future
                where humans and AI flourish together.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {benedictions.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/vaults/${entry.vaultSlug}`}
                  className="block"
                >
                  <EntryCard entry={entry} category={entry.vaultCategory} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Live Vault Stream ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Live vault stream
              </h2>
              <p className="mt-3 text-xl font-semibold text-white">
                Recent insights from public vaults
              </p>
            </div>
            <Link
              href="/vaults"
              className="hidden text-[13px] text-slate-400 transition-micro hover:text-white sm:block"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-8 space-y-2">
            {entries.slice(0, 10).map((entry, i) => (
              <Link
                key={entry.id || i}
                href={`/vaults/${entry.vaultSlug}`}
                className="animate-fade-up block"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <EntryCard
                  entry={entry}
                  category={entry.vaultCategory}
                  compact
                />
              </Link>
            ))}
          </div>

          <p className="mt-6 text-[13px] text-slate-400">
            {entries.length} entries across {registry.length} public vault
            {registry.length === 1 ? "" : "s"}. All rebuildable from raw JSONL.
          </p>
        </div>
      </section>

      {/* ── Agent API ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Agent-readable
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Every vault is a JSON API. Agents learn from human reasoning.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <code className="ml-3 font-mono text-[11px] text-slate-400">
                api/vaults/frank
              </code>
            </div>
            <div className="border-b border-white/[0.08] px-4 py-2.5">
              <code className="font-mono text-[12px]">
                <span className="text-emerald-400">$</span>{" "}
                <span className="text-slate-400">curl</span>{" "}
                <span className="text-violet-400">starlightintelligence.org/api/vaults/frank</span>
              </code>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.8] text-slate-400">
              <span className="text-slate-400">{"{"}</span>{"\n"}
              {"  "}<span className="text-violet-400">&quot;name&quot;</span>: <span className="text-emerald-400">&quot;Frank&quot;</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;totalEntries&quot;</span>: <span className="text-amber-400">{entries.length}</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;layers&quot;</span>: <span className="text-amber-400">9</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;verticals&quot;</span>: [<span className="text-emerald-400">&quot;people&quot;</span>, <span className="text-emerald-400">&quot;sound&quot;</span>, <span className="text-emerald-400">&quot;music-is&quot;</span>],{"\n"}
              {"  "}<span className="text-violet-400">&quot;substrate&quot;</span>: <span className="text-slate-400">{"{ \"name\": \"SIP\", \"version\": \"1.1.1\" }"}</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;meta&quot;</span>: <span className="text-slate-400">{"{ \"format\": \"starlight-vault-v1\" }"}</span>{"\n"}
              <span className="text-slate-400">{"}"}</span>
              <span className="animate-blink ml-0.5 text-violet-400">_</span>
            </pre>
          </div>

          <p className="mt-4 text-[13px] text-slate-400">
            No API key needed. Raw JSONL also available directly from GitHub.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-2 absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Three paths. One substrate.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
            Adopt the protocol. Run the reference build. Or spawn your own
            sovereign vertical. Pick the path that matches your edge.
          </p>
          <div className="mt-10">
            <Link
              href="/protocol"
              className="inline-block rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_40px_rgba(167,139,250,0.25)]"
            >
              Read the SIP spec &rarr;
            </Link>
            <p className="mt-5 text-[13px] text-slate-400">
              Or pick the path that matches your edge in the hero above.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="text-slate-400">
      <span className="font-semibold text-white">{n}</span>{" "}
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

function CtaCard({
  href,
  eyebrow,
  title,
  desc,
  accent,
}: {
  href: "/protocol" | "/download" | "/quickstart" | "/verticals";
  eyebrow: string;
  title: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald";
}) {
  const accents = {
    violet: "border-violet-500/[0.2] hover:border-violet-500/[0.4] bg-violet-500/[0.03]",
    cyan: "border-cyan-500/[0.2] hover:border-cyan-500/[0.4] bg-cyan-500/[0.03]",
    fuchsia: "border-fuchsia-500/[0.2] hover:border-fuchsia-500/[0.4] bg-fuchsia-500/[0.03]",
    emerald: "border-emerald-500/[0.2] hover:border-emerald-500/[0.4] bg-emerald-500/[0.03]",
  };
  const eyebrowColors = {
    violet: "text-violet-400",
    cyan: "text-cyan-400",
    fuchsia: "text-fuchsia-400",
    emerald: "text-emerald-400",
  };
  return (
    <Link
      href={href}
      className={`group rounded-xl border p-5 transition-std ${accents[accent]}`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-widest ${eyebrowColors[accent]}`}
      >
        {eyebrow}
      </p>
      <h3 className="mt-2 text-[16px] font-semibold text-white">
        {title}{" "}
        <span className="inline-block transition-micro group-hover:translate-x-0.5">
          &rarr;
        </span>
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{desc}</p>
    </Link>
  );
}

function VerticalSummary({
  name,
  tagline,
  counts,
  accent,
}: {
  name: string;
  tagline: string;
  counts: string;
  accent: "violet" | "cyan" | "fuchsia";
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${ACCENT_BORDER[accent]} ${ACCENT_BG_SOFT[accent]}`}
    >
      <p className={`text-[13px] font-semibold ${ACCENT_TEXT[accent]}`}>{name}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
        {tagline}
      </p>
      <p className="mt-4 font-mono text-[11px] text-slate-400">{counts}</p>
    </div>
  );
}

function SurfaceTile({
  name,
  port,
  accent,
}: {
  name: string;
  port: string;
  accent: string;
}) {
  return (
    <div className="bg-[#0c0c12] p-4">
      <p className={`text-[11px] font-semibold ${accent}`}>{name}</p>
      <code className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {port}
      </code>
    </div>
  );
}

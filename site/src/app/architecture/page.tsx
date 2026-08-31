import type { Metadata } from "next";
import Link from "next/link";
import { BrainHero } from "@/components/BrainHero";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "10 Intelligence Systems composed on the Starlight Intelligence Protocol substrate. JSONL as truth. SIP as contract. The Orchestrator routes the rest.",
  openGraph: {
    title: "Architecture — Starlight Intelligence",
    description:
      "10 Intelligence Systems composed on SIP. JSONL as truth, attestation as contract, sovereignty as invariant.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Architecture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architecture — Starlight Intelligence",
    description:
      "10 Intelligence Systems composed on SIP. JSONL as truth, attestation as contract.",
    images: ["/opengraph-image"],
  },
};

type Layer = {
  n: string;
  name: string;
  tier: string;
  purpose: string;
  vault: string;
  status: "core" | "cross-cutting" | "optional" | "master" | "substrate";
};

const LAYERS: Layer[] = [
  {
    n: "0",
    name: "Substrate (SIP)",
    tier: "Protocol",
    purpose: "Load-bearing protocol. Invisible when working.",
    vault: "SIP.md, /memory/intake/",
    status: "substrate",
  },
  {
    n: "1",
    name: "Self / Genius IS",
    tier: "Excavation",
    purpose: "What only you uniquely see. Foundation for the rest.",
    vault: "genius/",
    status: "core",
  },
  {
    n: "2",
    name: "Second Brain IS",
    tier: "Memory",
    purpose: "Daily capture compounds into surfaceable memory.",
    vault: "second-brain/",
    status: "cross-cutting",
  },
  {
    n: "3",
    name: "Brand IS",
    tier: "Vision",
    purpose: "5-horizon vision + Brand Kit (voice, palette, vocabulary).",
    vault: "vision/, brand/",
    status: "core",
  },
  {
    n: "4",
    name: "Business IS",
    tier: "Business",
    purpose: "Entity architecture, revenue model, tax sanity.",
    vault: "business/",
    status: "core",
  },
  {
    n: "5",
    name: "Creator IS",
    tier: "Composition",
    purpose: "Frameworks → multi-modal pipelines + executor playbooks.",
    vault: "creator/",
    status: "core",
  },
  {
    n: "6",
    name: "Wealth IS",
    tier: "Vertical",
    purpose: "Asymmetric Passive Income (DPI) ledger + thesis engine.",
    vault: "wealth/",
    status: "core",
  },
  {
    n: "7",
    name: "Code IS",
    tier: "Product / Automation",
    purpose: "Code as a sovereign domain. MCP builders, automations.",
    vault: "code/",
    status: "core",
  },
  {
    n: "8",
    name: "Voice & Video IS",
    tier: "Narrative Media",
    purpose: "Modality attestation across audio, video, multi-modal.",
    vault: "voice-video/",
    status: "core",
  },
  {
    n: "9",
    name: "Family IS",
    tier: "Relational",
    purpose: "Network + alliance-readiness + relationship rhythms.",
    vault: "family/, relational/",
    status: "cross-cutting",
  },
  {
    n: "—",
    name: "Health IS",
    tier: "Embodiment",
    purpose: "Energy + recovery. Cross-cutting rhythm under everything.",
    vault: "health/",
    status: "cross-cutting",
  },
  {
    n: "—",
    name: "Spiritual IS",
    tier: "Founder · optional",
    purpose: "Founder-layer practice. Never imposed on adopters.",
    vault: "private/spiritual/",
    status: "optional",
  },
  {
    n: "★",
    name: "Starlight Orchestrator",
    tier: "Master · routing",
    purpose: "Routes voice/text intent across the other nine.",
    vault: "core/orchestrator/",
    status: "master",
  },
];

const STATUS_LABEL: Record<Layer["status"], string> = {
  substrate: "substrate",
  core: "core",
  "cross-cutting": "cross-cutting",
  optional: "optional",
  master: "master",
};

const STATUS_CLASS: Record<Layer["status"], string> = {
  substrate:
    "border-violet-500/[0.3] bg-violet-500/[0.08] text-violet-200",
  core: "border-cyan-500/[0.2] bg-cyan-500/[0.05] text-cyan-300",
  "cross-cutting":
    "border-emerald-500/[0.2] bg-emerald-500/[0.05] text-emerald-300",
  optional: "border-white/[0.1] bg-white/[0.02] text-slate-400",
  master: "border-fuchsia-500/[0.3] bg-fuchsia-500/[0.08] text-fuchsia-200",
};

const PLATFORMS = [
  {
    name: "Claude Code",
    color: "text-violet-400",
    border: "border-violet-500/[0.2]",
  },
  { name: "Cursor", color: "text-cyan-400", border: "border-cyan-500/[0.2]" },
  {
    name: "Codex",
    color: "text-fuchsia-400",
    border: "border-fuchsia-500/[0.2]",
  },
  {
    name: "Gemini CLI",
    color: "text-amber-400",
    border: "border-amber-500/[0.2]",
  },
  {
    name: "OpenCode",
    color: "text-emerald-400",
    border: "border-emerald-500/[0.2]",
  },
];

export default function ArchitecturePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <GalaxyField still="nursery" />

        {/* 10-IS topology with labels — visible on lg+, slightly more prominent
            than the home variant since the architecture page IS the topic. */}
        <BrainHero
          labels
          className="pointer-events-none absolute -top-2 right-[-30px] hidden h-[460px] w-[460px] opacity-60 lg:block xl:right-12 xl:opacity-75"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-20">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            10-IS composition
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Ten Intelligence Systems.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Composed, not stacked.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Each layer has its own agent, skills, commands, and vault namespace.
            ISes reinforce each other — Genius is the root, Brand is the
            compass, Second Brain is the memory, Health and Family run
            continuously underneath everything. The Orchestrator routes voice
            or text intent to the right team.
          </p>
        </div>
      </section>

      {/* ── Foundation: JSONL truth ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Foundation
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            JSONL is truth. Everything else is a rebuildable index.
          </p>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-400">
            No database lock-in. No proprietary format. Your intelligence lives
            as plain files you can grep, diff, and version — and every index on
            top can be thrown away and rebuilt in seconds.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <FlowNode
              step="01"
              title="JSONL files"
              desc="One file per vault namespace. Append-only. Git-tracked."
              accent="violet"
            />
            <FlowNode
              step="02"
              title="SQLite index"
              desc="FTS5 full-text + vectors. Rebuildable in seconds."
              accent="cyan"
            />
            <FlowNode
              step="03"
              title="MCP server"
              desc="JSON-RPC 2.0. Tool calls every adapter speaks."
              accent="fuchsia"
            />
            <FlowNode
              step="04"
              title="AI tools"
              desc="Claude · Cursor · Codex · Gemini · OpenCode — same memory."
              accent="emerald"
            />
          </div>
        </div>
      </section>

      {/* ── 10-IS table ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The ten Intelligence Systems
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Each layer is its own IS. You compose what you need.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      Layer
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      Tier
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      Purpose
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      Vault
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">
                      Posture
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LAYERS.map((l, i) => (
                    <tr
                      key={l.name}
                      className={
                        i < LAYERS.length - 1
                          ? "border-b border-white/[0.08]"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 align-top font-mono text-[12px] text-slate-400">
                        {l.n}
                      </td>
                      <td className="px-4 py-3 align-top font-semibold text-white">
                        {l.name}
                      </td>
                      <td className="px-4 py-3 align-top text-[12px] text-slate-400">
                        {l.tier}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {l.purpose}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[12px] text-violet-300">
                        {l.vault}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_CLASS[l.status]}`}
                        >
                          {STATUS_LABEL[l.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-slate-400">
            Canonical reference:{" "}
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/ARCHITECTURE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 transition-std hover:text-violet-200"
            >
              docs/ARCHITECTURE.md
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── Domain Sub-Stack Tier ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Domain Sub-Stack Tier
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Verticals compose the same substrate for a specific domain.
          </p>
          <p className="mt-5 text-[14px] leading-[1.85] text-slate-400">
            Three reference Domain Sub-Stacks ship in this repo: People
            Intelligence (6 sub-systems · 28 commands · 6 agents), Sound
            Intelligence (6 / 30 / 6), and Music IS (6+1 / 8 / 7,
            Frank-operated).
          </p>
          <p className="mt-4 text-[14px] leading-[1.85] text-slate-400">
            Every Domain Sub-Stack carries the same 7-file contract: README ·
            SUB-SYSTEMS · AGENTS · SOUL · STACK · CANON · MEMORY. The
            meta-command{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              /spawn-domain-stack
            </code>{" "}
            generalizes the pattern.
          </p>
          <div className="mt-8">
            <Link
              href="/verticals"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              See the verticals &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Composition rules ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Composition rules
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            The graph is a reinforcement network, not a hierarchy.
          </p>
          <ul className="mt-6 space-y-4 pl-6 text-[14px] leading-[1.85] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-white">Genius is the root.</strong>{" "}
              Every downstream layer references it. Skip the root and the tree
              grows crooked.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-white">Foundation before surface.</strong>{" "}
              Layers 1–3 (Genius, Second Brain, Brand) are foundation. 4–8
              (Business, Creator, Wealth, Code, Voice & Video) are surface.
              Surface without foundation produces noise.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-white">Cross-cutting throughout.</strong>{" "}
              Health, Second Brain, and Family run continuously, not in their
              own sprint blocks (unless burnout / chaos / isolation is the
              primary bottleneck).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-white">Sovereignty per layer.</strong>{" "}
              Layer outputs live in your instance only. Substrate retains no
              copies.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-white">Attestation per layer.</strong>{" "}
              Every output auto-stamps with &ldquo;Built on SIP&rdquo; on real
              composition. Decorative attestation is refused.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Developmental phases ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Developmental phases
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            The substrate evolves like a living system, not a release schedule.
          </p>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-400">
            SIS&apos;s version history mirrors what computational neuroscience
            calls{" "}
            <em>critical periods</em> — experience-dependent windows of
            heightened plasticity that consolidate into durable structure.
            Structural analog to developmental-plasticity research (Hensch
            2005, <em>Nature Rev. Neurosci.</em>; Knudsen 2004,{" "}
            <em>J. Cogn. Neurosci.</em>). Each phase is tied to a concrete
            shipped invariant — not vibes.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            <PhaseCard
              ord="01"
              name="Infant"
              status="shipped"
              invariant="SIP.md ships as the load-bearing protocol."
              accent="violet"
            />
            <PhaseCard
              ord="02"
              name="Toddler"
              status="shipped"
              invariant="10-IS taxonomy locked. Orchestrator named as the master layer."
              accent="cyan"
            />
            <PhaseCard
              ord="03"
              name="Juvenile"
              status="shipped"
              invariant="Board-before-tag invariant + substrate symmetry harness."
              accent="fuchsia"
            />
            <PhaseCard
              ord="04"
              name="Adolescent"
              status="current"
              invariant="Encoded-self forkable. SIP § 5: forks inherit pattern, not person."
              accent="emerald"
            />
            <PhaseCard
              ord="05"
              name="Mature"
              status="planned"
              invariant="Sovereign-fork production runs + comprehensive ecosystem deployment. Not yet shipped — pending."
              accent="amber"
            />
          </div>

          <p className="mt-8 max-w-2xl text-[13px] leading-relaxed text-slate-400">
            SIS is currently completing the{" "}
            <strong className="text-white">analog of the adolescent phase</strong>{" "}
            — the consolidation period where the substrate gains its
            forkable identity. The mature analog remains pending. We
            don&apos;t claim biological literalness; the phase frame is a{" "}
            <em>structural analog</em> for talking about substrate
            evolution.
          </p>
        </div>
      </section>

      {/* ── Cross-tool compounding ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Cross-tool compounding
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            One memory. Every agent. No silos.
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-slate-400">
            The MCP protocol is the universal pipe. Whatever tool you&apos;re
            in today, your intelligence is already there.
          </p>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-3">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-std hover:bg-white/[0.04] ${p.color} ${p.border}`}
                >
                  {p.name}
                </div>
              ))}
            </div>

            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              &darr; all read &darr;
            </div>

            <div className="rounded-xl border border-violet-500/[0.2] bg-violet-500/[0.05] px-6 py-4">
              <code className="font-mono text-[13px] text-violet-300">
                starlight-sis
              </code>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">
                one shared memory
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Extension model ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Extension
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Adding an 11th IS is a named procedure, not a refactor.
          </p>
          <p className="mt-5 text-[14px] leading-[1.85] text-slate-400">
            Every new layer requires: one agent · 1–2 skills · 2–3 commands ·
            knowledge templates · /compose-stack sequencing update ·
            ARCHITECTURE.md entry · /luminor-board pressure-test before merge ·
            /openclaw-audit adversarial pass. Extension is welcome. Sprawl is
            not. If a layer&apos;s use case is already covered by an existing
            layer&apos;s commands, it&apos;s a command, not a layer.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Two minutes to install. A lifetime to compound.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/quickstart"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Start the quickstart &rarr;
            </Link>
            <Link
              href="/protocol"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read the protocol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowNode({
  step,
  title,
  desc,
  accent,
}: {
  step: string;
  title: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald";
}) {
  const accents = {
    violet: "border-violet-500/[0.2] bg-violet-500/[0.05]",
    cyan: "border-cyan-500/[0.2] bg-cyan-500/[0.05]",
    fuchsia: "border-fuchsia-500/[0.2] bg-fuchsia-500/[0.05]",
    emerald: "border-emerald-500/[0.2] bg-emerald-500/[0.05]",
  };
  const stepColors = {
    violet: "text-violet-400",
    cyan: "text-cyan-400",
    fuchsia: "text-fuchsia-400",
    emerald: "text-emerald-400",
  };
  return (
    <div
      className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${accents[accent]}`}
    >
      <span className={`font-mono text-[11px] ${stepColors[accent]}`}>
        {step}
      </span>
      <h3 className="mt-2 text-[14px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

type PhaseAccent = "violet" | "cyan" | "fuchsia" | "emerald" | "amber";
type PhaseStatus = "shipped" | "current" | "planned";

const PHASE_ACCENTS: Record<PhaseAccent, string> = {
  violet: "border-violet-500/[0.2] bg-violet-500/[0.05]",
  cyan: "border-cyan-500/[0.2] bg-cyan-500/[0.05]",
  fuchsia: "border-fuchsia-500/[0.2] bg-fuchsia-500/[0.05]",
  emerald: "border-emerald-500/[0.2] bg-emerald-500/[0.05]",
  amber: "border-amber-500/[0.2] bg-amber-500/[0.05]",
};

const PHASE_STEP_COLORS: Record<PhaseAccent, string> = {
  violet: "text-violet-400",
  cyan: "text-cyan-400",
  fuchsia: "text-fuchsia-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};

const PHASE_STATUS_PILL: Record<PhaseStatus, string> = {
  shipped: "border-emerald-500/[0.2] bg-emerald-500/[0.05] text-emerald-300",
  current: "border-violet-500/[0.3] bg-violet-500/[0.08] text-violet-200",
  planned: "border-white/[0.1] bg-white/[0.02] text-slate-400",
};

function PhaseCard({
  ord,
  name,
  status,
  invariant,
  accent,
}: {
  ord: string;
  name: string;
  status: PhaseStatus;
  invariant: string;
  accent: PhaseAccent;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${PHASE_ACCENTS[accent]}`}
    >
      <span className={`font-mono text-[11px] ${PHASE_STEP_COLORS[accent]}`}>
        {ord}
      </span>
      <h3 className="mt-2 text-[14px] font-semibold text-white">{name}</h3>
      <span
        className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${PHASE_STATUS_PILL[status]}`}
      >
        {status}
      </span>
      <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
        {invariant}
      </p>
    </div>
  );
}

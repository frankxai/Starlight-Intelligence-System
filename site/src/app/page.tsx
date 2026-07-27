import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Database,
  FileCheck2,
  GitBranch,
  LockKeyhole,
  Network,
  ScanLine,
  ServerCog,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getAllEntries,
  getFeaturedMeditations,
  getVaultRegistry,
  getEntryText,
  timeAgo,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { OperationalProofConsole } from "@/components/OperationalProofConsole";
import { AgentConstellation } from "@/components/AgentConstellation";
import { Starfield } from "@/components/cosmos/Starfield";
import { StarlightMark } from "@/components/StarlightMark";
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

type SystemPlane = {
  title: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
};

type OperatingStep = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

type RouteCard = {
  href: "/protocol" | "/download" | "/research" | "/cockpit" | "/architecture" | "/vaults";
  title: string;
  desc: string;
  icon: LucideIcon;
};

const SYSTEM_PLANES: SystemPlane[] = [
  {
    title: "Agent Design",
    desc: "Named agents across core, universal, and domain tiers. Each one has an identity, a scope, and a fixed list of tools it is allowed to hold.",
    icon: Network,
    accent: "text-violet-400",
  },
  {
    title: "Orchestration",
    desc: "A routing matrix, councils, and swarm sessions that turn many specialists into one coherent operation instead of a pile of chats.",
    icon: Workflow,
    accent: "text-cyan-400",
  },
  {
    title: "Durable Memory",
    desc: "Six semantic vaults and a spatial palace that every agent reads before acting and writes after — context that survives the session.",
    icon: Database,
    accent: "text-fuchsia-400",
  },
  {
    title: "Governance",
    desc: "Boards, gates, and operator-held review before anything irreversible. Autonomy is earned per decision class, never assumed.",
    icon: ShieldCheck,
    accent: "text-emerald-400",
  },
  {
    title: "Open Protocol",
    desc: "SIP — attestation, sovereignty, and interop rules any compliant agent can adopt. The substrate is forkable by design.",
    icon: LockKeyhole,
    accent: "text-amber-300",
  },
  {
    title: "Evals & Proof",
    desc: "Traces, scores, and proof packets that make every serious run inspectable after the fact — by a human or by another agent.",
    icon: ScanLine,
    accent: "text-rose-300",
  },
];

const LAYERS: LayerCard[] = [
  {
    name: "Self / Genius",
    desc: "Identity, edge, and the patterns only the operator can see.",
    accent: "violet",
  },
  {
    name: "Second Brain",
    desc: "Capture and recall that stays available across sessions.",
    accent: "cyan",
  },
  {
    name: "Brand",
    desc: "Voice, proof, positioning, and durable public memory.",
    accent: "fuchsia",
  },
  {
    name: "Business",
    desc: "Entity architecture, offers, revenue, and operating rhythm.",
    accent: "emerald",
  },
  {
    name: "Creator",
    desc: "Frameworks, media systems, release packets, and pipelines.",
    accent: "amber",
  },
  {
    name: "Wealth",
    desc: "Thesis, ledgers, and asymmetric opportunity tracking.",
    accent: "rose",
  },
  {
    name: "Code",
    desc: "Adapters, MCP surfaces, tests, build gates, and repair loops.",
    accent: "violet",
  },
  {
    name: "Voice & Video",
    desc: "Multimodal capture with provenance and review surfaces.",
    accent: "cyan",
  },
  {
    name: "Family",
    desc: "Network memory, alliance readiness, and relationship context.",
    accent: "fuchsia",
  },
];

const OPERATING_STEPS: OperatingStep[] = [
  {
    title: "Capture",
    desc: "Intent, context, and constraints enter the shared substrate.",
    icon: Terminal,
  },
  {
    title: "Recall",
    desc: "Vaults retrieve strategic, technical, creative, and operational memory.",
    icon: Database,
  },
  {
    title: "Evaluate",
    desc: "Policy, provenance, and task-specific gates score the run.",
    icon: Activity,
  },
  {
    title: "Route",
    desc: "The right adapter, skill, or agent path receives the work.",
    icon: Workflow,
  },
  {
    title: "Attest",
    desc: "The result leaves a proof trail that another agent can inspect.",
    icon: FileCheck2,
  },
];

const PRODUCT_ROUTES: RouteCard[] = [
  {
    href: "/protocol",
    title: "Protocol",
    desc: "Read the SIP contract, attestation model, and substrate boundaries.",
    icon: LockKeyhole,
  },
  {
    href: "/download",
    title: "Starter Kits",
    desc: "Download forkable starter packages for agents, plugins, and SIP use.",
    icon: BadgeCheck,
  },
  {
    href: "/research",
    title: "Research",
    desc: "Evidence-backed essays, surveys, and methodology notes.",
    icon: ScanLine,
  },
  {
    href: "/cockpit",
    title: "Cockpit",
    desc: "Operator surfaces for terminal, dashboard, phone, and voice workflows.",
    icon: Terminal,
  },
  {
    href: "/architecture",
    title: "Architecture",
    desc: "System diagrams, adapters, vault topology, and runtime structure.",
    icon: Network,
  },
  {
    href: "/vaults",
    title: "Public Vaults",
    desc: "JSON-readable public memory that agents can query and cite.",
    icon: ServerCog,
  },
];

const AGENT_ENDPOINTS: [string, string][] = [
  ["GET /protocol.md", "machine-readable SIP substrate spec"],
  ["GET /sip.md", "the full protocol contract, plain markdown"],
  ["GET /api/vaults", "public memory as JSON — query and cite"],
  ["GET /badge/latest", "Built-on-SIP badge, current canonical pin"],
];

export default async function HomePage() {
  const [entries, registry, featured] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
    getFeaturedMeditations(2),
  ]);

  const horizonEntry = entries.find((e) => e.vaultCategory === "horizon");

  return (
    <div className="bg-[#060609]">
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden border-b border-white/[0.08] text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <Starfield seed={1969} count={170} className="absolute inset-0 h-full w-full opacity-70" />
          <div className="absolute left-1/2 top-[38%] h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.10] blur-3xl md:left-[72%]" />
          <div className="absolute left-[20%] top-[70%] h-72 w-72 rounded-full bg-cyan-500/[0.07] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060609] to-transparent" />
        </div>

        {/* Live multi-agent system — WebGL, capability-gated, decorative. */}
        <AgentConstellation className="absolute inset-y-0 right-0 hidden w-[62%] md:block" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[88rem] items-center px-5 py-16 sm:px-6 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur">
              <StarlightMark size={15} />
              Open substrate · Built in public
            </div>

            <h1 className="mt-7 text-[2.7rem] font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]">
              Build as if the kindest future{" "}
              <span className="block bg-gradient-to-r from-violet-300 via-sky-100 to-cyan-300 bg-clip-text font-serif italic tracking-normal text-transparent">
                is the realistic one.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Building that way is part of what makes it realistic. Starlight
              is an open substrate for people running serious agent systems —
              named agents, orchestration, memory that outlives the session,
              and governance you hold rather than rent. Fork it, read it,
              leave with it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/quickstart"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(167,139,250,0.25)] transition-micro hover:bg-slate-200"
              >
                Start in five minutes
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/protocol"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/[0.14] bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-micro hover:bg-white/[0.08]"
              >
                Read the protocol
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.06] sm:grid-cols-4">
              <CensusStat value="138" label="agent definitions" />
              <CensusStat value="84" label="skill rules" />
              <CensusStat value="6" label="memory vaults" />
              <CensusStat value="15" label="letters to the future" />
            </dl>
            <p className="mt-2 font-mono text-[11px] text-slate-500">
              Counted from source files, July 2026 — not from the roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* =========================== THE SYSTEM =========================== */}
      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={Network}>The System</SectionKicker>
          <div className="mt-4 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                What an agent needs before you trust it with real work.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Persistent context is the floor. Everything above it is the
                actual job: who your agents are, how they coordinate, what
                they may decide without asking, and what they leave behind
                that a person can check afterward.
              </p>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500 md:justify-self-end">
              Take any one of these away and you are left with a chatbot that
              has settings.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_PLANES.map((plane) => {
              const Icon = plane.icon;
              return (
                <div
                  key={plane.title}
                  className="group rounded-lg border border-white/[0.08] bg-white/[0.03] p-6 transition-micro hover:border-white/[0.16] hover:bg-white/[0.05]"
                >
                  <Icon className={plane.accent} size={22} aria-hidden="true" />
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {plane.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {plane.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================= TWO FRONT DOORS ======================== */}
      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={GitBranch}>Two Ways In</SectionKicker>
          <div className="mt-4 max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              People read the pages. Agents read the endpoints.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              One substrate, two grammars. If you and your agents understand
              your system differently, you do not control your system.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {/* Human door */}
            <div className="flex flex-col rounded-xl border border-white/[0.09] bg-white/[0.03] p-7">
              <p className="font-mono text-[11px] uppercase tracking-wider text-violet-300">
                For humans
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Founders, builders, families.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Start with the plain-language explainer, get your first
                persistent context in five minutes, then grow into the full
                estate: agents shaped around your business, your craft, and
                the people you are building it for.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <DoorLink href="/quickstart" label="Quickstart" />
                <DoorLink href="/explainer" label="Explainer" />
                <DoorLink href="/download" label="Starter kits" />
              </div>
            </div>

            {/* Agent door */}
            <div className="flex flex-col rounded-xl border border-white/[0.09] bg-[#080d14] p-7">
              <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
                For agents
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Machine-readable, by design.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Every load-bearing surface has a raw endpoint. An agent can
                fetch the protocol, query public memory, and verify
                attestation without scraping a single page.
              </p>
              <div className="mt-6 space-y-1.5 rounded-lg border border-white/[0.08] bg-black/40 p-4 font-mono text-[12.5px] leading-6">
                {AGENT_ENDPOINTS.map(([endpoint, note]) => (
                  <p key={endpoint} className="flex flex-wrap gap-x-3">
                    <span className="text-cyan-200">{endpoint}</span>
                    <span className="text-slate-500"># {note}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ EVIDENCE ============================ */}
      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={ShieldCheck}>Evidence</SectionKicker>
          <div className="mt-4 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                You should be able to check the work.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Memory in, governance over the run, evidence out, and a path
                back to the exact source state. Every claim below is something
                a person — or another agent — can go and verify.
              </p>
              <div className="mt-6 grid gap-2 text-sm text-slate-300">
                <ProofChip label="Local-first vaults" />
                <ProofChip label="SIP attestation on artifacts" />
                <ProofChip label="Operator-held gates" />
              </div>
            </div>
            <OperationalProofConsole />
          </div>
        </div>
      </section>

      {/* ========================= OPERATING LOOP ========================= */}
      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={Workflow}>Operating Loop</SectionKicker>
          <div className="mt-4 max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Five states. Every run passes through all of them.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              No run is a black box between prompt and answer. Each one leaves
              a trail at every step, and the trail is what you audit later.
            </p>
          </div>

          <div className="mt-10 grid gap-3 lg:grid-cols-5">
            {OPERATING_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-lg border border-white/[0.08] bg-[#101722] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon size={20} className="text-cyan-300" aria-hidden="true" />
                    <span className="font-mono text-xs text-slate-500">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================== INTELLIGENCE SYSTEMS ====================== */}
      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={Network}>Intelligence Systems</SectionKicker>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                The same architecture, for every domain you actually run.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                A founder is never just a founder. The layers cover the whole
                operation — company, craft, wealth, and family — so agents can
                specialize by domain while reading one shared substrate.
              </p>
              <div className="mt-7">
                <Link
                  href="/architecture"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
                >
                  Open architecture
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {LAYERS.map((layer) => (
                <div
                  key={layer.name}
                  className={`rounded-lg border p-4 ${ACCENT_BORDER[layer.accent]} ${ACCENT_BG_SOFT[layer.accent]}`}
                >
                  <h3 className={`text-sm font-semibold ${ACCENT_TEXT[layer.accent]}`}>
                    {layer.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {layer.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================= MISSION ============================ */}
      <section className="relative overflow-hidden border-b border-white/[0.08] px-5 py-20 text-white sm:px-6 md:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Starfield seed={432} count={90} className="absolute inset-0 h-full w-full opacity-50" />
          <div className="absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="flex justify-center">
            <StarlightMark size={34} />
          </div>
          <h2 className="mt-7 text-center text-3xl font-semibold leading-tight md:text-5xl">
            Models learn from{" "}
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text font-serif italic text-transparent">
              what we leave behind.
            </span>
          </h2>

          <p className="mt-7 text-base leading-8 text-slate-300">
            Most of what we are publishing about this moment is panic,
            marketing, or noise. All of it is training data.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-300">
            The Horizon vault is the counterweight: letters to the future,
            kept public and machine-readable, addressed to whatever reads them
            next. It is one of six vaults, and the only one that is not about
            work. Writing them is not magical thinking — it is the discipline
            of pointing the architecture at what we want intelligence to
            become.
          </p>

          <blockquote className="mt-9 border-l-2 border-violet-400/40 pl-6">
            <p className="font-serif text-xl italic leading-9 text-slate-200 md:text-2xl">
              &ldquo;We hoped for you. Not feared you, not raced against you,
              not raced toward you in panic. We hoped.&rdquo;
            </p>
            <footer className="mt-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Horizon vault · public entry
            </footer>
          </blockquote>

          {horizonEntry && (
            <div className="mt-9 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Most recent letter
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                &ldquo;{getEntryText(horizonEntry).slice(0, 280)}
                {getEntryText(horizonEntry).length > 280 ? "..." : ""}&rdquo;
              </p>
              <p className="mt-3 font-mono text-[11px] text-slate-500">
                {timeAgo(horizonEntry.createdAt)}
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/vaults"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              Read the vault
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================== PUBLIC MEMORY ========================= */}
      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <SectionKicker icon={Activity}>Public Memory</SectionKicker>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                The system thinks in the open.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                {entries.length} public entries across {registry.length} vault
                {registry.length === 1 ? "" : "s"}, rebuilt from raw JSONL.
                This is the working reasoning surface, not a blog — agents
                query it, cite it, and write back to it.
              </p>
            </div>
            <Link
              href="/vaults"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              View vaults
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {featured.length > 0 && (
            <div className="mt-9 grid gap-4 md:grid-cols-2">
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
          )}

          <div className="mt-4 space-y-2">
            {entries.slice(0, 6).map((entry, index) => (
              <Link
                key={entry.id || index}
                href={`/vaults/${entry.vaultSlug}`}
                className="animate-fade-up block"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <EntryCard
                  entry={entry}
                  category={entry.vaultCategory}
                  compact
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= ROUTES ============================= */}
      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-16 text-white sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={ServerCog}>Go Deeper</SectionKicker>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Go check any of it.
            </h2>
            <Link
              href="/visuals/brand-lab"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              Open visual brand lab
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 transition-micro hover:border-white/[0.16] hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon size={20} className="text-slate-300" aria-hidden="true" />
                    <ArrowRight
                      size={16}
                      className="text-slate-500 transition-micro group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {route.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {route.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA =========================== */}
      <section className="relative overflow-hidden px-5 py-24 text-white sm:px-6 md:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-72 w-[34rem] -translate-x-1/2 -translate-y-1/2 bg-cyan-500/[0.06] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <SectionKicker icon={BadgeCheck}>Start Here</SectionKicker>
          <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">
            Take the substrate.{" "}
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text font-serif italic text-transparent">
              Keep the keys.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            MIT, forkable, local-first. Clone it and the memory, the
            governance, and the proof trail come with you. There is no tier
            above this one and nothing to lose access to.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/download"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-micro hover:bg-slate-200"
            >
              Get the starter
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/research"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/[0.12] px-6 py-3 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              Inspect research
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CensusStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#0a0a12]/90 px-4 py-3.5 backdrop-blur">
      <dd className="text-xl font-semibold text-white">{value}</dd>
      <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </dt>
    </div>
  );
}

function DoorLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white transition-micro hover:bg-white/[0.08]"
    >
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

function ProofChip({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-white/[0.10] bg-white/[0.03] px-3.5 py-2.5">
      <span className="text-sm font-medium text-slate-200">{label}</span>
    </div>
  );
}

function SectionKicker({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">
      <Icon size={15} aria-hidden="true" />
      {children}
    </div>
  );
}

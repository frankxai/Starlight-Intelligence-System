import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
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

type ProofPillar = {
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

const PROOF_STACK: ProofPillar[] = [
  {
    title: "Persistent Context",
    desc: "Six semantic vaults give every agent the same durable memory surface.",
    icon: Database,
    accent: "text-cyan-400",
  },
  {
    title: "Governance Gates",
    desc: "Human operator control, policy checks, and substrate-aware review points.",
    icon: ShieldCheck,
    accent: "text-emerald-400",
  },
  {
    title: "Traceable Evals",
    desc: "Runs produce inspectable traces, confidence notes, and proof packets.",
    icon: ScanLine,
    accent: "text-amber-300",
  },
  {
    title: "Rebuildable Deploys",
    desc: "Git, build, and Vercel state are tied back to reproducible source.",
    icon: GitBranch,
    accent: "text-rose-300",
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

export default async function HomePage() {
  const [entries, registry, featured] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
    getFeaturedMeditations(4),
  ]);

  const horizonEntry = entries.find((e) => e.vaultCategory === "horizon");

  return (
    <div className="bg-[#060609]">
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_54%,#08111f_100%)] text-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute left-0 top-0 h-80 w-80 bg-cyan-200/50 blur-3xl" />
          <div className="absolute right-0 top-20 h-96 w-96 bg-violet-200/45 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08111f] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[88rem] items-center gap-10 px-5 py-10 sm:px-6 md:grid-cols-[0.86fr_1.14fr] md:py-14 lg:gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
              SIP v1.1.1 production surface
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.02] text-slate-950 sm:text-5xl lg:text-6xl">
              Starlight Intelligence System
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
              Operational memory, governance, traces, evals, logs, and operator
              control for AI agent fleets.
              <span className="hidden sm:inline">
                {" "}Built for agents that need proof, not another forgetful chat
                surface.
              </span>
            </p>

            <div className="mt-6 flex sm:hidden">
              <Link
                href="/download"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,23,42,0.25)] transition-micro hover:bg-slate-800"
              >
                Download starter
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
              <Link
                href="/download"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,23,42,0.25)] transition-micro hover:bg-slate-800"
              >
                Download starter
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/protocol"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-950 transition-micro hover:bg-white"
              >
                Read protocol
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 hidden gap-2 text-sm text-slate-700 sm:grid sm:grid-cols-3">
              <ProofChip label="Local-first vaults" />
              <ProofChip label="SIP attestation" />
              <ProofChip label="Operator-held gates" />
            </div>
          </div>

          <OperationalProofConsole />
        </div>

        <div className="relative mx-auto grid max-w-[88rem] gap-px bg-slate-900/15 px-5 pb-8 sm:px-6 md:grid-cols-4">
          <SignalMetric label="Memory" value="Semantic vault substrate" />
          <SignalMetric label="Proof" value="Trace, eval, and attestation loop" />
          <SignalMetric label="Control" value="Human review before critical moves" />
          <SignalMetric label="Deploy" value="Git and Vercel state reconciled" />
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={ShieldCheck}>Proof Stack</SectionKicker>
          <div className="mt-4 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Trust is the interface.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                The product promise is not a gallery of possible agents. It is a
                working control plane: memory in, governance over the run,
                evidence out, and a path back to the exact source state.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROOF_STACK.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-5"
                  >
                    <Icon className={pillar.accent} size={22} aria-hidden="true" />
                    <h3 className="mt-4 text-base font-semibold text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-16 text-white sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={Workflow}>Operating Loop</SectionKicker>
          <div className="mt-4 max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Every serious run becomes durable intelligence.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Starlight turns agent work into a visible sequence with stable
              states: capture, recall, evaluate, route, attest.
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

      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={Network}>Intelligence Systems</SectionKicker>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                A composable operating layer for real domains.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Each layer is a useful surface, not a decorative persona. Agents
                can read the same substrate and still specialize by domain,
                tool, or decision context.
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

      <section className="border-b border-white/[0.08] bg-[#f6f8fb] px-5 py-16 text-slate-950 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionKicker icon={ServerCog} light>
            Product Routes
          </SectionKicker>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                The site now leads with the system.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Protocol, starter kits, research, cockpit, architecture, and
                vault APIs are the primary public proof surfaces.
              </p>
            </div>
            <Link
              href="/visuals/brand-lab"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-micro hover:border-slate-400"
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
                  className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-micro hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon size={20} className="text-slate-700" aria-hidden="true" />
                    <ArrowRight
                      size={16}
                      className="text-slate-400 transition-micro group-hover:translate-x-0.5 group-hover:text-slate-950"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">
                    {route.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {route.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {horizonEntry && (
        <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6">
          <div className="mx-auto max-w-4xl">
            <SectionKicker icon={FileCheck2}>Latest Horizon Note</SectionKicker>
            <blockquote className="mt-5 text-lg font-medium leading-8 text-slate-200">
              &ldquo;{getEntryText(horizonEntry).slice(0, 280)}
              {getEntryText(horizonEntry).length > 280 ? "..." : ""}&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-slate-500">
              Horizon vault entry, {timeAgo(horizonEntry.createdAt)}
            </p>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionKicker icon={ScanLine}>Selected Notes</SectionKicker>
            <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Public memory with source texture.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                  Vault notes are not marketing filler. They are the public
                  reasoning surface agents can inspect, cite, and extend.
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
          </div>
        </section>
      )}

      <section className="border-b border-white/[0.08] px-5 py-16 text-white sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <SectionKicker icon={Activity}>Live Vault Stream</SectionKicker>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                Recent public memory entries.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              {entries.length} public entries across {registry.length} public
              vault{registry.length === 1 ? "" : "s"}, rebuilt from raw JSONL.
            </p>
          </div>

          <div className="mt-9 space-y-2">
            {entries.slice(0, 8).map((entry, index) => (
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

      <section className="relative overflow-hidden px-5 py-24 text-white sm:px-6 md:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-72 w-[34rem] -translate-x-1/2 -translate-y-1/2 bg-cyan-500/[0.06] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <SectionKicker icon={BadgeCheck}>Production Ready Path</SectionKicker>
          <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">
            Fork the substrate. Keep the proof.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Use the protocol, starter kits, and public vault APIs to give your
            agents a memory and governance layer that can be inspected after
            the run.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/download"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-micro hover:bg-slate-200"
            >
              Get the starter
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/research"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/[0.12] px-5 py-3 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
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

function ProofChip({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white/70 px-3 py-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </div>
  );
}

function SignalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/90 p-4 text-slate-950 backdrop-blur">
      <p className="font-mono text-[11px] uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}

function SectionKicker({
  children,
  icon: Icon,
  light = false,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  light?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${
        light
          ? "border-slate-300 bg-white text-slate-700"
          : "border-white/[0.10] bg-white/[0.04] text-slate-300"
      }`}
    >
      <Icon size={15} aria-hidden="true" />
      {children}
    </div>
  );
}

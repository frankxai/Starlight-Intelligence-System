import type { Metadata } from "next";
import Link from "next/link";
import {
  type Accent,
  ACCENT_TEXT,
  ACCENT_BORDER,
  ACCENT_BG_SOFT,
  ACCENT_CHIP,
  ACCENT_GLOW,
} from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Knowledge Tree",
  description:
    "Starlight Knowledge Tree — an open intelligence graph for human capability, scientific knowledge, and contribution paths. Maps what exists, what matters, what you know, what you can build, and what unlocks next. A vertical built on SIS / SIP.",
  openGraph: {
    title: "Starlight Knowledge Tree",
    description:
      "An open intelligence graph for human capability, scientific knowledge, and contribution paths. A vertical built on the Starlight Intelligence System.",
    type: "article",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Starlight Knowledge Tree",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlight Knowledge Tree",
    description:
      "An open intelligence graph for human capability, scientific knowledge, and contribution paths. A vertical built on the Starlight Intelligence System.",
    images: ["/opengraph-image"],
  },
};

// The public repo exists; these CTAs link to it directly.
// - CONTRIBUTE_URL → Issues, where contribution quests / open tasks live.
// - ONTOLOGY_URL → the canon layer (ontology, laws, research protocol, agent
//   corps, and data/graph.json) currently lives in the SIS repo under
//   verticals/knowledge-tree/. Phase 2 of the KT roadmap mirrors it into the
//   public starlight-knowledge-tree repo; swap this to that repo's ONTOLOGY.md
//   once the mirror lands.
const KNOWLEDGE_TREE_GITHUB_URL =
  "https://github.com/frankxai/starlight-knowledge-tree";
const CONTRIBUTE_URL = `${KNOWLEDGE_TREE_GITHUB_URL}/issues`;
const ONTOLOGY_URL =
  "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/verticals/knowledge-tree/ONTOLOGY.md";

// ─────────────────────────────────────────────────────────────────────────────
// MVP CONTENT — static.
//
// TODO(knowledge-tree-data): this entire surface is hand-authored for the MVP.
// Hydrate these structures from the `frankxai/starlight-knowledge-tree` repo's
// `data/` directory (research maps, skill trees, open problems, contribution
// quests, progression paths) — e.g. a build-time loader that reads the graph
// JSON, or a thin `/api/knowledge-tree` route.
// No auth and no database for the MVP; keep the page a static server component.
// ─────────────────────────────────────────────────────────────────────────────

const PROGRESSION_LOOP = [
  "Concept",
  "Skill",
  "Practice",
  "Artifact",
  "Evidence",
  "Contribution",
  "Identity",
] as const;

const SUBSTRATE_POINTS = [
  "Protocol — the SIP contract for sovereign, attested composition",
  "Memory — persistent vaults and durable state",
  "MCP tools — agent-readable infrastructure",
  "Agents — the council that reasons over the graph",
] as const;

const VERTICAL_POINTS = [
  "Research maps — what exists and what matters",
  "Skill trees — capability, not consumption",
  "Open problems — the frontier, made navigable",
  "Contribution quests — work that compounds",
  "Progression paths — what unlocks next",
] as const;

type Path = {
  accent: Accent;
  title: string;
  tagline: string;
  rootConcepts: string[];
  coreSkills: string[];
  tools: string[];
  artifact: string;
  contribution: string;
};

const PATHS: Path[] = [
  {
    accent: "cyan",
    title: "AI Architect",
    tagline: "Design intelligence systems that compose without losing control.",
    rootConcepts: [
      "Information theory",
      "Distributed systems",
      "Agent orchestration",
      "Context & memory design",
    ],
    coreSkills: [
      "System decomposition",
      "Prompt & tool design",
      "Evaluation & attestation",
      "Retrieval architecture",
    ],
    tools: ["Claude / MCP", "Vector + graph stores", "TypeScript / Python", "Eval harnesses"],
    artifact: "A working multi-agent system with a memory layer and an eval suite.",
    contribution: "Open-source an MCP server or a reusable agent pattern.",
  },
  {
    accent: "amber",
    title: "Space Builder",
    tagline: "Move mass, energy, and information off the surface of a planet.",
    rootConcepts: [
      "Orbital mechanics",
      "Propulsion & thermodynamics",
      "Materials science",
      "Control theory",
    ],
    coreSkills: [
      "Trajectory modeling",
      "Systems engineering",
      "Simulation & telemetry",
      "Hardware-in-the-loop testing",
    ],
    tools: ["Python / GMAT", "CAD & FEA", "KSP / poliastro", "Embedded toolchains"],
    artifact: "A simulated mission profile with a verified delta-v budget.",
    contribution: "Publish a reproducible simulation or an open hardware design.",
  },
  {
    accent: "emerald",
    title: "Bio / Human Intelligence",
    tagline: "Understand and extend the living, thinking substrate.",
    rootConcepts: [
      "Molecular biology",
      "Genetics & the genome",
      "Neuroscience",
      "Systems physiology",
    ],
    coreSkills: [
      "Experimental design",
      "Bioinformatics",
      "Statistical inference",
      "Literature synthesis",
    ],
    tools: ["Python / R", "Biopython", "Notebooks", "Public datasets (open only)"],
    artifact: "A reproducible analysis notebook over an open dataset.",
    contribution: "Share a dataset, a method, or a validated visual explainer.",
  },
  {
    accent: "fuchsia",
    title: "Creator-Founder",
    tagline: "Turn taste and systems into products people pay for.",
    rootConcepts: [
      "Audience & distribution",
      "Product & pricing",
      "Narrative & brand",
      "Unit economics",
    ],
    coreSkills: [
      "Content engineering",
      "Offer design",
      "Funnel & analytics",
      "Shipping cadence",
    ],
    tools: ["Next.js / Vercel", "Suno / generative media", "Analytics", "Payments"],
    artifact: "A shipped product with its first real revenue.",
    contribution: "Open-source a template, a playbook, or a teardown.",
  },
];

type SkillDnaDimension = {
  label: string;
  desc: string;
};

const SKILL_DNA: SkillDnaDimension[] = [
  { label: "Interests", desc: "The branches you're pulled toward." },
  { label: "Current abilities", desc: "What you can already do, honestly assessed." },
  { label: "Proof artifacts", desc: "Evidence — built, shipped, measured." },
  { label: "Desired identity", desc: "Who you're becoming, named." },
  { label: "Active quests", desc: "The contributions you're working on now." },
  { label: "Next unlocks", desc: "High-leverage nodes the graph recommends next." },
];

const CONTRIBUTION_TYPES = [
  "Papers",
  "Tools",
  "Datasets",
  "Simulations",
  "Experiments",
  "Learning paths",
  "Open-source tasks",
  "Visual explainers",
] as const;

const PRIVACY_PUBLIC = [
  "Concepts, skill trees, and ontology",
  "Open problems and research maps",
  "Tools, datasets, and reproducible methods",
  "Contribution quests and learning paths",
] as const;

const PRIVACY_PRIVATE = [
  "Health and biometric signals",
  "Genetic data",
  "Financial records",
  "Identity and personal documents",
] as const;

export default function KnowledgeTreePage() {
  return (
    <div>
      {/* ── 1 · Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[340px] w-[340px] rounded-full bg-cyan-500/[0.05] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-amber-400/[0.04] blur-[90px]" />
        </div>
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <TreeGlyph className="pointer-events-none absolute right-[-60px] top-10 hidden h-[460px] w-[460px] opacity-60 lg:block" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-widest text-cyan-400">
              The vertical · built on SIS
            </p>
            <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              Starlight Knowledge Tree
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
              An open intelligence graph for human capability, scientific
              knowledge, and contribution paths.
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.8] text-slate-500">
              It maps what exists, what matters, what you know, what you can
              build, what you can contribute, and what unlocks next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/knowledge-tree/explore"
                className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
              >
                Explore the Tree &rarr;
              </Link>
              <a
                href="#paths"
                className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                View Paths
              </a>
              <a
                href={CONTRIBUTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                Contribute on GitHub
              </a>
              <a
                href={ONTOLOGY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                Read the Ontology
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · The Thesis ── */}
      <Section eyebrow="The thesis" heading="Track capability, not consumption">
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          Most learning systems track what you&apos;ve <em>consumed</em> — videos
          watched, courses completed, pages read. Starlight Knowledge Tree tracks
          what you can <em>do</em>. The unit is capability, and capability is
          earned along one loop:
        </p>

        <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          {PROGRESSION_LOOP.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium ${ACCENT_CHIP.cyan}`}
              >
                {step}
              </span>
              {i < PROGRESSION_LOOP.length - 1 && (
                <span className="font-mono text-[13px] text-slate-600" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-2xl text-[14px] leading-[1.85] text-slate-400">
          Identity loops back into concepts: who you become reshapes what you
          learn next. The graph is the map of that loop, run at the scale of all
          human knowledge.
        </p>
      </Section>

      {/* ── 3 · Built on SIS / SIP ── */}
      <Section eyebrow="Built on SIS / SIP" heading="Substrate, then vertical">
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          The Knowledge Tree doesn&apos;t replace the Starlight Intelligence
          System — it stands on it. The system is the substrate; the tree is a
          vertical that grows from it.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Substrate · SIS / SIP
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
              Protocol, memory, vaults, MCP tools, and agent-readable
              infrastructure.
            </p>
            <ul className="mt-5 space-y-3">
              {SUBSTRATE_POINTS.map((point) => (
                <li
                  key={point}
                  className="relative pl-5 text-[14px] leading-[1.7] text-slate-300 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-slate-500/50"
                >
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/protocol"
              className="mt-6 inline-flex text-[13px] font-medium text-slate-300 transition-std hover:text-white"
            >
              Read the protocol &rarr;
            </Link>
          </div>

          <div
            className={`rounded-2xl border bg-white/[0.02] p-6 ${ACCENT_BORDER.cyan} ${ACCENT_BG_SOFT.cyan}`}
          >
            <p className={`text-[11px] font-medium uppercase tracking-widest ${ACCENT_TEXT.cyan}`}>
              Vertical · Knowledge Tree
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
              Research maps, skill trees, open problems, contribution quests, and
              progression paths.
            </p>
            <ul className="mt-5 space-y-3">
              {VERTICAL_POINTS.map((point) => (
                <li
                  key={point}
                  className="relative pl-5 text-[14px] leading-[1.7] text-slate-200 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-cyan-400/50"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── 4 · Four Initial Paths ── */}
      <Section
        id="paths"
        eyebrow="Four initial paths"
        heading="Start where the leverage is"
      >
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          Four reference branches, each a route from root concepts to a real
          contribution. Pick one and the graph shows the sequence.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PATHS.map((path) => (
            <PathCard key={path.title} path={path} />
          ))}
        </div>
      </Section>

      {/* ── 5 · Root Node Radar ── */}
      <Section eyebrow="Root node radar" heading="Some concepts unlock entire branches">
        <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="max-w-xl text-[15px] leading-[1.85] text-slate-300">
              Not all knowledge is equal. A few root-node concepts — linear
              algebra, thermodynamics, the cell, the feedback loop — unlock huge
              regions of the graph downstream. The Root Node Radar identifies
              those high-leverage nodes and the shortest learning sequences that
              reach them.
            </p>
            <p className="mt-5 max-w-xl text-[14px] leading-[1.85] text-slate-400">
              Instead of a flat list of topics, you get a prioritized path:
              learn this, and these twelve branches become reachable.
            </p>
          </div>
          <RadarGlyph className="mx-auto h-[260px] w-[260px] opacity-90" />
        </div>
      </Section>

      {/* ── 6 · Personal Progression ── */}
      <Section eyebrow="Personal progression" heading="Map your Skill DNA">
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          The public graph maps what exists. Your Skill DNA maps where you stand
          on it. A forthcoming capability — a personal overlay that situates you
          on the tree across six dimensions.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_DNA.map((dim) => (
            <div
              key={dim.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <p className="text-[13px] font-semibold text-white">{dim.label}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                {dim.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-slate-500">
          Skill DNA is personal by design. It lives in your local / private
          vaults — see the privacy boundary below.
        </p>
      </Section>

      {/* ── 7 · Open Contribution Layer ── */}
      <Section eyebrow="Open contribution layer" heading="Everyone can grow the tree">
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          Researchers, students, builders, and creators extend the graph. Every
          contribution is a node others can build on.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONTRIBUTION_TYPES.map((type) => (
            <div
              key={type}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center text-[13px] font-medium text-slate-200 transition-std hover:border-cyan-500/[0.25] hover:bg-cyan-500/[0.04]"
            >
              {type}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href={CONTRIBUTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
          >
            Open a contribution quest &rarr;
          </a>
        </div>
      </Section>

      {/* ── 8 · Privacy Boundary ── */}
      <Section eyebrow="Privacy boundary" heading="Public knowledge, private self">
        <p className="max-w-2xl text-[15px] leading-[1.85] text-slate-300">
          The line is bright and non-negotiable. Shared knowledge belongs in the
          public repo. Anything personal stays in local / private vaults — never
          in the public Knowledge Tree.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div
            className={`rounded-2xl border bg-white/[0.02] p-6 ${ACCENT_BORDER.cyan} ${ACCENT_BG_SOFT.cyan}`}
          >
            <p className={`text-[11px] font-medium uppercase tracking-widest ${ACCENT_TEXT.cyan}`}>
              Public — belongs in the repo
            </p>
            <ul className="mt-4 space-y-3">
              {PRIVACY_PUBLIC.map((item) => (
                <li
                  key={item}
                  className="relative pl-5 text-[14px] leading-[1.7] text-slate-200 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-cyan-400/50"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`rounded-2xl border bg-white/[0.02] p-6 ${ACCENT_BORDER.amber} ${ACCENT_BG_SOFT.amber}`}
          >
            <p className={`text-[11px] font-medium uppercase tracking-widest ${ACCENT_TEXT.amber}`}>
              Private — local vaults only
            </p>
            <ul className="mt-4 space-y-3">
              {PRIVACY_PRIVATE.map((item) => (
                <li
                  key={item}
                  className="relative pl-5 text-[14px] leading-[1.7] text-slate-200 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-amber-400/50"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed text-slate-400">
              Health, biometric, genetic, financial, and identity data never
              leave your machine.
            </p>
          </div>
        </div>
      </Section>

      {/* ── 9 · Footer CTA ── */}
      <section className="relative overflow-hidden border-t border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-2 absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.05] blur-[90px]" />
          <div className="animate-mesh-3 absolute right-1/4 bottom-0 h-[260px] w-[260px] rounded-full bg-amber-400/[0.04] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-[1.2] tracking-tight text-white">
            The future of learning is not a course library. It is a living map of
            human capability.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={KNOWLEDGE_TREE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
            >
              View GitHub &rarr;
            </a>
            <Link
              href="/protocol"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Open Protocol
            </Link>
            <a
              href="#paths"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Start a Path
            </a>
          </div>
          <p className="mt-10 text-[11px] uppercase tracking-widest text-slate-500">
            Built on SIP · A Starlight Intelligence vertical
          </p>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local helpers — kept in-file (page-specific), mirroring /protocol.
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  id,
  eyebrow,
  heading,
  children,
}: {
  id?: string;
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-b border-white/[0.08] px-6 py-16 scroll-mt-20 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
          {heading}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function PathCard({ path }: { path: Path }) {
  const { accent } = path;
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white/[0.02] p-6 transition-std hover:bg-white/[0.04] ${ACCENT_BORDER[accent]} ${ACCENT_BG_SOFT[accent]} ${ACCENT_GLOW[accent]}`}
    >
      <h3 className={`text-[17px] font-semibold ${ACCENT_TEXT[accent]}`}>
        {path.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
        {path.tagline}
      </p>

      <div className="mt-5 space-y-4">
        <CardField label="Root concepts" items={path.rootConcepts} accent={accent} />
        <CardField label="Core skills" items={path.coreSkills} accent={accent} />
        <CardField label="Tools" items={path.tools} accent={accent} />
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          First build artifact
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-200">
          {path.artifact}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Contribution path
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-200">
          {path.contribution}
        </p>
      </div>
    </article>
  );
}

function CardField({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: Accent;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[accent]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Decorative cosmic-map glyphs. aria-hidden — purely visual, no semantics.
// Modeled on the SVG technique in components/BrainHero.tsx (concentric rings,
// low-opacity strokes, soft glow). Cyan + gold, thin graph/tree lines.

function TreeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="kt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="kt-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* root → branch lines (thin graph edges) */}
      <g stroke="#22d3ee" strokeWidth="0.6" opacity="0.35">
        <path d="M200 300 L200 200" />
        <path d="M200 200 L120 130" />
        <path d="M200 200 L280 130" />
        <path d="M200 200 L200 110" />
        <path d="M120 130 L70 80" />
        <path d="M120 130 L150 70" />
        <path d="M280 130 L330 80" />
        <path d="M280 130 L250 70" />
        <path d="M200 110 L200 50" />
      </g>
      <g stroke="#fbbf24" strokeWidth="0.5" opacity="0.25">
        <path d="M200 300 L130 320" />
        <path d="M200 300 L270 320" />
        <path d="M120 130 L60 150" />
        <path d="M280 130 L340 150" />
      </g>

      {/* node halo */}
      <circle cx="200" cy="300" r="60" fill="url(#kt-core)" opacity="0.5" />

      {/* branch nodes */}
      <g filter="url(#kt-glow)">
        <circle cx="200" cy="300" r="5" fill="#22d3ee" />
        <circle cx="200" cy="200" r="3.5" fill="#22d3ee" opacity="0.85" />
        <circle cx="120" cy="130" r="3" fill="#22d3ee" opacity="0.7" />
        <circle cx="280" cy="130" r="3" fill="#22d3ee" opacity="0.7" />
        <circle cx="200" cy="110" r="2.6" fill="#fbbf24" opacity="0.8" />
        <circle cx="70" cy="80" r="2.2" fill="#fbbf24" opacity="0.7" />
        <circle cx="150" cy="70" r="2.2" fill="#22d3ee" opacity="0.7" />
        <circle cx="330" cy="80" r="2.2" fill="#22d3ee" opacity="0.7" />
        <circle cx="250" cy="70" r="2.2" fill="#fbbf24" opacity="0.7" />
        <circle cx="200" cy="50" r="2.4" fill="#22d3ee" opacity="0.8" />
        <circle cx="130" cy="320" r="2.2" fill="#fbbf24" opacity="0.6" />
        <circle cx="270" cy="320" r="2.2" fill="#fbbf24" opacity="0.6" />
        <circle cx="60" cy="150" r="2" fill="#22d3ee" opacity="0.55" />
        <circle cx="340" cy="150" r="2" fill="#22d3ee" opacity="0.55" />
      </g>
    </svg>
  );
}

function RadarGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="kt-radar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* concentric range rings */}
      <g stroke="#22d3ee" fill="none">
        <circle cx="120" cy="120" r="100" strokeWidth="0.5" opacity="0.18" />
        <circle cx="120" cy="120" r="72" strokeWidth="0.5" opacity="0.24" />
        <circle cx="120" cy="120" r="44" strokeWidth="0.6" opacity="0.32" />
        <circle cx="120" cy="120" r="18" strokeWidth="0.7" opacity="0.4" />
      </g>

      {/* spokes */}
      <g stroke="#22d3ee" strokeWidth="0.4" opacity="0.16">
        <path d="M120 20 L120 220" />
        <path d="M20 120 L220 120" />
        <path d="M49 49 L191 191" />
        <path d="M191 49 L49 191" />
      </g>

      {/* root node (center, gold) + scattered detected nodes */}
      <g filter="url(#kt-radar-glow)">
        <circle cx="120" cy="120" r="5" fill="#fbbf24" />
        <circle cx="120" cy="76" r="3" fill="#22d3ee" opacity="0.9" />
        <circle cx="164" cy="120" r="2.6" fill="#22d3ee" opacity="0.8" />
        <circle cx="88" cy="152" r="2.6" fill="#fbbf24" opacity="0.75" />
        <circle cx="156" cy="84" r="2.2" fill="#22d3ee" opacity="0.7" />
        <circle cx="76" cy="96" r="2.2" fill="#22d3ee" opacity="0.6" />
        <circle cx="150" cy="170" r="2" fill="#fbbf24" opacity="0.6" />
        <circle cx="40" cy="120" r="2" fill="#22d3ee" opacity="0.5" />
        <circle cx="120" cy="208" r="2" fill="#22d3ee" opacity="0.5" />
      </g>
    </svg>
  );
}

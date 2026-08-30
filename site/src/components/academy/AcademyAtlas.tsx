"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  BookOpen,
  Bot,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  Code2,
  Compass,
  ExternalLink,
  FileCode2,
  Filter,
  GitFork,
  Globe2,
  GraduationCap,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Waypoints,
} from "lucide-react";
import type {
  AcademyAtlasModel,
  AcademyHouse,
  AcademyLane,
  AcademyPackStatus,
  AcademyPackView,
} from "@/lib/academy-atlas";

const REPOSITORY_URL = "https://github.com/frankxai/Starlight-Intelligence-System";
const PLUGIN_URL = `${REPOSITORY_URL}/tree/main/plugins/starlight-academy-fabric`;
const REFERENCE_URL = `${REPOSITORY_URL}/blob/main/foundry/examples/academy-portfolio-40.reference.json`;

const HOUSE_STYLES: Record<
  AcademyHouse["accent"],
  { border: string; text: string; wash: string; dot: string; ring: string }
> = {
  cyan: {
    border: "border-cyan-300/25",
    text: "text-cyan-200",
    wash: "bg-cyan-300/[0.055]",
    dot: "bg-cyan-300",
    ring: "focus-visible:ring-cyan-300/70",
  },
  fuchsia: {
    border: "border-fuchsia-300/25",
    text: "text-fuchsia-200",
    wash: "bg-fuchsia-300/[0.055]",
    dot: "bg-fuchsia-300",
    ring: "focus-visible:ring-fuchsia-300/70",
  },
  violet: {
    border: "border-violet-300/25",
    text: "text-violet-200",
    wash: "bg-violet-300/[0.055]",
    dot: "bg-violet-300",
    ring: "focus-visible:ring-violet-300/70",
  },
  amber: {
    border: "border-amber-300/25",
    text: "text-amber-200",
    wash: "bg-amber-300/[0.055]",
    dot: "bg-amber-300",
    ring: "focus-visible:ring-amber-300/70",
  },
  emerald: {
    border: "border-emerald-300/25",
    text: "text-emerald-200",
    wash: "bg-emerald-300/[0.055]",
    dot: "bg-emerald-300",
    ring: "focus-visible:ring-emerald-300/70",
  },
};

const STATUS_STYLES: Record<
  AcademyPackStatus,
  { label: string; className: string; explanation: string }
> = {
  "active-public-reference": {
    label: "Source-backed",
    className: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100",
    explanation: "Public source, contracts, and Observatory exist. Demand is still unproven.",
  },
  "validation-bet": {
    label: "Validation bet",
    className: "border-amber-300/30 bg-amber-300/[0.08] text-amber-100",
    explanation: "The single paid demand hypothesis allowed into active validation.",
  },
  "proposed-next": {
    label: "Next",
    className: "border-violet-300/25 bg-violet-300/[0.07] text-violet-100",
    explanation: "A near-term candidate, not an operating academy or validated offer.",
  },
  "proposed-option": {
    label: "Later",
    className: "border-white/[0.09] bg-white/[0.025] text-slate-400",
    explanation: "A parked portfolio option with no activation claim.",
  },
};

const LANE_LABELS: Record<AcademyLane | "all", string> = {
  all: "All lanes",
  now: "Now",
  next: "Next",
  later: "Later",
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  "compose-domain-pack": "Compile a source-explicit open pack under an existing house.",
  "map-learner-journey": "Map current reality to artifact, community, export, and optional capacity.",
  "design-learning-cell": "Design small artifact-led communities without founder dependence.",
  "govern-managed-capacity": "Price scarce operations while curriculum and assessment remain open.",
  "plan-institutional-adoption": "Add Academy interfaces while preserving local authority and exit.",
};

function humanize(value: string) {
  return value
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function StatusBadge({ status }: { status: AcademyPackStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      title={style.explanation}
      className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function PackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: AcademyPackView;
  selected: boolean;
  onSelect: () => void;
}) {
  const style = HOUSE_STYLES[pack.accent];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group min-h-[210px] rounded-[1.35rem] border p-5 text-left transition-std focus-visible:outline-none focus-visible:ring-2 ${style.ring} ${
        selected
          ? `${style.border} ${style.wash} shadow-[0_18px_70px_rgba(0,0,0,.24)]`
          : "border-white/[0.07] bg-white/[0.018] hover:border-white/[0.16] hover:bg-white/[0.035]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`font-mono text-[9px] uppercase tracking-[0.15em] ${style.text}`}>
          {pack.houseName}
        </span>
        <StatusBadge status={pack.status} />
      </div>
      <h3 className="mt-5 font-serif text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.025em] text-white">
        {pack.name}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{pack.promise}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500">
          {pack.persona.ageBand} · {pack.persona.stage}
        </span>
        <ChevronRight
          className={`h-4 w-4 transition-micro group-hover:translate-x-0.5 ${selected ? style.text : "text-slate-500"}`}
        />
      </div>
    </button>
  );
}

function SelectedPack({ pack, model }: { pack: AcademyPackView; model: AcademyAtlasModel }) {
  const style = HOUSE_STYLES[pack.accent];
  const habitats = pack.habitatIds
    .map((id) => model.habitats.find((habitat) => habitat.id === id))
    .filter((habitat): habitat is AcademyAtlasModel["habitats"][number] => Boolean(habitat));
  const pricing = model.pricingTiers.find((tier) => tier.id === pack.pricingTier);

  return (
    <aside
      className={`rounded-[1.65rem] border ${style.border} ${style.wash} p-5 sm:p-7 xl:sticky xl:top-24`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={pack.status} />
        <span className="rounded-full border border-white/[0.09] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
          {LANE_LABELS[pack.lane]}
        </span>
      </div>

      <p className={`mt-7 font-mono text-[10px] uppercase tracking-[0.18em] ${style.text}`}>
        {pack.brandSurface} / learner identity
      </p>
      <h3 className="mt-3 font-serif text-[clamp(2.35rem,4vw,4.2rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-white">
        {pack.identity}
      </h3>
      <p className="mt-5 text-base leading-7 text-slate-300">{pack.promise}</p>

      <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/20 p-5">
        <div className="flex items-center gap-2 text-slate-200">
          <Compass className={`h-4 w-4 ${style.text}`} />
          <h4 className="text-sm font-semibold">Ideal learner hypothesis</h4>
        </div>
        <dl className="mt-5 grid gap-4 text-sm leading-6">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Stage and age signal</dt>
            <dd className="mt-1 text-slate-300">{pack.persona.ageBand} · {pack.persona.stage}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Already doing</dt>
            <dd className="mt-1 text-slate-300">{pack.persona.currentReality}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Interested in</dt>
            <dd className="mt-1 text-slate-300">{pack.persona.interest}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Current friction</dt>
            <dd className="mt-1 text-slate-300">{pack.persona.friction}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-[11px] leading-5 text-slate-500">
          Age describes a reachable market, never an eligibility rule. No individual learner, enrollment, or partnership is claimed.
        </p>
      </div>

      <div className="mt-7">
        <div className="flex items-center gap-2">
          <BookOpen className={`h-4 w-4 ${style.text}`} />
          <h4 className="text-sm font-semibold text-white">Proposed academic path</h4>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">{pack.academicExperience}</p>
        <ol className="mt-4 grid gap-2">
          {pack.proposedModules.map((module, index) => (
            <li key={module} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 px-3.5 py-3 text-sm text-slate-200">
              <span className={`font-mono text-[10px] ${style.text}`}>0{index + 1}</span>
              {module}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.045] p-4">
          <div className="flex items-center gap-2 text-emerald-200">
            <Check className="h-4 w-4" />
            <h4 className="font-mono text-[9px] uppercase tracking-[0.14em]">Free outcome</h4>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{pack.freeOutcome}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="h-4 w-4" />
            <h4 className="font-mono text-[9px] uppercase tracking-[0.14em]">Community</h4>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">{pack.communityExperience}</p>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center gap-2">
          <GraduationCap className={`h-4 w-4 ${style.text}`} />
          <h4 className="text-sm font-semibold text-white">Reachable learner habitats</h4>
        </div>
        <div className="mt-3 grid gap-2">
          {habitats.map((habitat) => (
            <a
              key={habitat.id}
              href={habitat.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-white/[0.07] bg-black/15 px-3.5 py-3 transition-micro hover:border-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <strong className="block text-xs font-semibold text-slate-200">{habitat.name}</strong>
                  <span className="mt-1 block text-[11px] leading-5 text-slate-500">{habitat.place} · {habitat.signal}</span>
                </span>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300" />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
          Discovery habitat · not an Academy partnership
        </p>
      </div>

      {pricing && (
        <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/[0.045] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-200">
              <BadgeEuro className="h-4 w-4" />
              <h4 className="text-sm font-semibold">Managed-capacity hypothesis</h4>
            </div>
            <span className="rounded-full border border-amber-300/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-amber-100">
              {pricing.label} · {pricing.priceHypothesis}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{pack.managedCapacity}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500"><strong className="text-slate-400">Why payment might occur:</strong> {pack.willingnessHypothesis}</p>
          <p className="mt-3 border-t border-amber-300/10 pt-3 text-[11px] leading-5 text-amber-100/70">
            Proposed price, not observed willingness to pay. The same modules, rubric, export, and credential threshold remain free.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {pack.skills.map((skill) => (
          <span key={skill} className="rounded-md border border-white/[0.07] bg-black/20 px-2 py-1 font-mono text-[9px] text-slate-400">
            {skill}
          </span>
        ))}
      </div>
    </aside>
  );
}

export function AcademyAtlas({ model }: { model: AcademyAtlasModel }) {
  const packs = useMemo<AcademyPackView[]>(
    () =>
      model.houses.flatMap((house) =>
        house.packs.map((pack) => ({
          ...pack,
          houseId: house.id,
          houseName: house.name,
          brandSurface: house.brandSurface,
          accent: house.accent,
          houseThesis: house.thesis,
          houseCommunityFormat: house.communityFormat,
        })),
      ),
    [model.houses],
  );
  const [houseFilter, setHouseFilter] = useState("all");
  const [laneFilter, setLaneFilter] = useState<AcademyLane | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("capability-graph-architect");

  const visiblePacks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return packs.filter((pack) => {
      if (houseFilter !== "all" && pack.houseId !== houseFilter) return false;
      if (laneFilter !== "all" && pack.lane !== laneFilter) return false;
      if (!normalized) return true;
      return [
        pack.name,
        pack.identity,
        pack.promise,
        pack.houseName,
        pack.persona.stage,
        pack.persona.interest,
        pack.persona.currentReality,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [houseFilter, laneFilter, packs, query]);

  const selectedPack =
    visiblePacks.find((pack) => pack.id === selectedId) ??
    visiblePacks[0] ??
    packs.find((pack) => pack.id === selectedId) ??
    packs[0];
  const laneCounts = {
    now: packs.filter((pack) => pack.lane === "now").length,
    next: packs.filter((pack) => pack.lane === "next").length,
    later: packs.filter((pack) => pack.lane === "later").length,
  };
  const candidateSkills = Array.from(
    new Set(
      model.houses.flatMap((house) =>
        house.packs.flatMap((pack) => pack.skills.filter((skill) => skill in SKILL_DESCRIPTIONS)),
      ),
    ),
  );

  const chooseHouse = (houseId: string) => {
    const house = model.houses.find((candidate) => candidate.id === houseId);
    setHouseFilter(houseId);
    setLaneFilter("all");
    setQuery("");
    if (house) setSelectedId(house.packs[0].id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("academy-atlas")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-white/[0.06] px-5 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(34,211,238,.10),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(217,70,239,.075),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(124,92,255,.08),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1560px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200">Open Academy Commons</span>
            <span className="rounded-full border border-white/[0.08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">{model.release.label}</span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.04] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-200">portfolio hypothesis</span>
          </div>

          <div className="mt-10 grid items-end gap-12 xl:grid-cols-[minmax(0,1fr)_470px]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">Academy Atlas / 0.1</p>
              <h1 className="mt-5 max-w-6xl font-serif text-[clamp(3.1rem,8vw,8.6rem)] font-semibold leading-[0.79] tracking-[-0.064em] text-white">
                <span className="block">Forty paths.</span>
                <span className="block bg-gradient-to-r from-cyan-200 via-slate-100 to-fuchsia-200 bg-clip-text italic text-transparent">One open academy.</span>
              </h1>
              <p className="mt-8 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                A portable layer between what people study, what they make, and what they can carry forward. Five houses hold forty proposed identities for students, creators, experts, teams, and institutions—without creating forty disconnected brands.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#academy-atlas" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07070b] transition-micro hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                  Explore all forty paths <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="/academy/graphs" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.025] px-5 py-3 text-sm font-semibold text-slate-200 transition-micro hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70">
                  Inspect the source-backed path <Network className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
              <div className="grid grid-cols-2">
                {[
                  [String(model.portfolio.packCount), "proposed domain packs"],
                  [String(model.portfolio.topLevelBrandLimit), "shared portfolio houses"],
                  [String(model.portfolio.activePublicReferences), "source-backed public path"],
                  [String(model.portfolio.activeRevenueBets), "paid validation bet"],
                ].map(([value, label], index) => (
                  <div key={label} className={`p-5 ${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "border-r" : ""} border-white/[0.06]`}>
                    <strong className="block font-serif text-4xl font-semibold text-white">{value}</strong>
                    <span className="mt-1 block font-mono text-[9px] uppercase leading-4 tracking-[0.13em] text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] p-5">
                <div className="flex items-start gap-3">
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <p className="text-xs leading-5 text-slate-400">
                    The Atlas names real learner habitats in Amsterdam and abroad for discovery. It claims no partnership, enrollment, or observed demand.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid max-w-5xl gap-4 border-l border-violet-300/35 pl-5 text-sm leading-6 text-slate-400 sm:grid-cols-[auto_1fr]">
            <Sparkles className="mt-1 h-4 w-4 text-violet-200" />
            <p>
              <strong className="font-semibold text-slate-200">The operating decision:</strong> Graph Engineering is the one source-backed public path. Expert-to-Product is the one paid validation bet. Four packs are queued Next. Thirty-four remain parked until behavior—not enthusiasm—earns activation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1700px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Portfolio architecture</p>
            <h2 className="mt-3 font-serif text-[clamp(2.4rem,5vw,5.3rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">Five houses hold the field.</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">Each house is a coherent public promise and community grammar. Each domain pack is a thin installable experience over the same contracts, Passport, skills, governance, and free-core laws.</p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {model.houses.map((house) => {
              const style = HOUSE_STYLES[house.accent];
              return (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => chooseHouse(house.id)}
                  className={`group rounded-[1.4rem] border border-white/[0.07] bg-white/[0.018] p-5 text-left transition-std hover:border-white/[0.18] hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 ${style.ring}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">8 packs</span>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-semibold tracking-[-0.025em] text-white">{house.name}</h3>
                  <p className="mt-3 min-h-[90px] text-xs leading-5 text-slate-400">{house.thesis}</p>
                  <ul className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4">
                    {house.packs.map((pack) => (
                      <li key={pack.id} className="flex items-start gap-2 text-[11px] leading-4 text-slate-500">
                        <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${style.dot}`} />
                        {pack.identity}
                      </li>
                    ))}
                  </ul>
                  <span className={`mt-5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] ${style.text}`}>
                    Open this house <ArrowRight className="h-3.5 w-3.5 transition-micro group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Standalone brand gate</p>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{model.portfolio.brandPolicy}</p>
            </div>
            <div className="mt-4 flex shrink-0 items-center gap-2 sm:mt-0">
              <Layers3 className="h-4 w-4 text-violet-200" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-200">packs before properties</span>
            </div>
          </div>
        </div>
      </section>

      <section id="academy-atlas" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.012] px-4 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1760px]">
          <div className="flex flex-col gap-8 border-b border-white/[0.07] pb-9 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Interactive portfolio atlas</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em] text-white sm:text-6xl">Find the learner. Inspect the promise.</h2>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Portfolio lanes">
              {(["all", "now", "next", "later"] as const).map((lane) => (
                <button
                  key={lane}
                  type="button"
                  aria-pressed={laneFilter === lane}
                  onClick={() => setLaneFilter(lane)}
                  className={`rounded-full border px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 ${
                    laneFilter === lane
                      ? "border-violet-300/35 bg-violet-300/[0.09] text-violet-100"
                      : "border-white/[0.08] text-slate-400 hover:border-white/[0.18] hover:text-slate-200"
                  }`}
                >
                  {LANE_LABELS[lane]}
                  {lane !== "all" && ` · ${laneCounts[lane]}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <span className="sr-only">Search domain packs</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search identity, interest, stage, or promise…"
                className="w-full rounded-xl border border-white/[0.09] bg-black/25 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-micro placeholder:text-slate-600 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2" aria-label="House filters">
              <Filter className="mr-1 h-4 w-4 text-slate-500" />
              <button
                type="button"
                aria-pressed={houseFilter === "all"}
                onClick={() => setHouseFilter("all")}
                className={`rounded-lg border px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 ${houseFilter === "all" ? "border-white/20 bg-white/[0.07] text-white" : "border-white/[0.07] text-slate-500 hover:text-slate-200"}`}
              >
                All houses
              </button>
              {model.houses.map((house) => {
                const style = HOUSE_STYLES[house.accent];
                return (
                  <button
                    key={house.id}
                    type="button"
                    aria-pressed={houseFilter === house.id}
                    onClick={() => setHouseFilter(house.id)}
                    className={`rounded-lg border px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-micro focus-visible:outline-none focus-visible:ring-2 ${style.ring} ${houseFilter === house.id ? `${style.border} ${style.wash} ${style.text}` : "border-white/[0.07] text-slate-500 hover:text-slate-200"}`}
                  >
                    {house.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-500" aria-live="polite">
            <span>{visiblePacks.length} of {packs.length} paths visible</span>
            {(query || houseFilter !== "all" || laneFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setQuery(""); setHouseFilter("all"); setLaneFilter("all"); }}
                className="font-mono text-[9px] uppercase tracking-[0.13em] text-cyan-200 transition-micro hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(430px,.82fr)]">
            <div>
              {visiblePacks.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {visiblePacks.map((pack) => (
                    <PackCard key={pack.id} pack={pack} selected={selectedPack.id === pack.id} onSelect={() => setSelectedId(pack.id)} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/[0.1] bg-white/[0.018] p-8 text-center">
                  <Search className="h-7 w-7 text-slate-600" />
                  <h3 className="mt-4 font-serif text-2xl text-white">No path matches those filters.</h3>
                  <button type="button" onClick={() => { setQuery(""); setHouseFilter("all"); setLaneFilter("all"); }} className="mt-4 text-sm font-semibold text-cyan-200 hover:text-white">Reset the Atlas</button>
                </div>
              )}
            </div>
            <SelectedPack pack={selectedPack} model={model} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1640px]">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">The access constitution</p>
              <h2 className="mt-3 font-serif text-[clamp(2.7rem,5vw,5.6rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-white">Open first. Ultra funds capacity.</h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">Learning quality is invariant across tiers. Paid plans finance the parts with real marginal cost and can expand Commons capacity; they do not buy hidden knowledge or a privileged assessment standard.</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["Complete path", model.openAccess.completeLearningPathWithoutPayment],
                  ["All modules and missions", model.openAccess.allModulesAndMissionsPublic],
                  ["Public rubrics and thresholds", model.openAccess.rubricsAndCredentialThresholdsPublic],
                  ["Local or BYOK route", model.openAccess.localOrBringYourOwnKeySupported],
                  ["Free learner export", model.openAccess.learnerExportWithoutPayment],
                  ["Equal credential eligibility", model.openAccess.credentialEligibilityWithoutPayment],
                ].map(([label, enabled]) => (
                  <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.035] px-4 py-3 text-sm text-slate-300">
                    <Check className={`h-4 w-4 shrink-0 ${enabled ? "text-emerald-300" : "text-rose-300"}`} />
                    {String(label)}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  <h3 className="text-sm font-semibold">Accessibility is part of the core</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{model.openAccess.accessibilityRequirement}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {model.pricingTiers.map((tier, index) => (
                <article key={tier.id} className={`rounded-[1.4rem] border p-5 ${index === 0 ? "border-emerald-300/25 bg-emerald-300/[0.045]" : index === 4 ? "border-amber-300/25 bg-amber-300/[0.045]" : "border-white/[0.08] bg-white/[0.018]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Tier 0{index}</span>
                    {index === 0 && <span className="rounded-full bg-emerald-300/[0.1] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-emerald-200">educational core</span>}
                    {index === 4 && <span className="rounded-full bg-amber-300/[0.1] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-amber-200">no 1:1 retainer</span>}
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-semibold text-white">{tier.label}</h3>
                  <p className="mt-2 font-mono text-[11px] text-cyan-200">{tier.priceHypothesis}</p>
                  <p className="mt-5 text-xs leading-5 text-slate-400">{tier.includes}</p>
                  <p className="mt-4 border-t border-white/[0.06] pt-4 text-[11px] leading-5 text-slate-500"><strong className="text-slate-400">Never:</strong> {tier.neverIncludes}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-[1.6rem] border border-amber-300/20 bg-amber-300/[0.035] p-6 sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,.62fr)_minmax(0,1.38fr)] xl:items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-200">
                  <WalletCards className="h-4 w-4" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em]">Commerce boundary / parked design</p>
                </div>
                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.03em] text-white">Autonomous recommendation. Deterministic payment.</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">{model.commerce.execution}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["01", "Human price book", "Named owner ratifies price, tax, refund, and capacity."],
                  ["02", "Buyer confirms", "The exact option and amount are shown before commitment."],
                  ["03", "Provider executes", "A deterministic adapter calls only the published SKU."],
                  ["04", "Receipt bounds access", "Payment and learning state remain separate records."],
                ].map(([step, label, copy], index) => (
                  <div key={label} className="relative rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <span className="font-mono text-[9px] text-amber-200">{step}</span>
                    <strong className="mt-3 block text-sm text-white">{label}</strong>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">{copy}</p>
                    {index < 3 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-amber-300/50 xl:block" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 border-t border-amber-300/10 pt-6 lg:grid-cols-2">
              <p className="text-xs leading-6 text-amber-100/75"><strong>Agent limit:</strong> {model.commerce.agentAuthority}. Agents can explain a published option; they cannot change price, discount, debt, refund, credential, or buyer intent.</p>
              <p className="text-xs leading-6 text-amber-100/75"><strong>Commons financing hypothesis:</strong> {model.commerce.crossSubsidyHypothesis}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1660px]">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Reusable intelligence layer</p>
              <h2 className="mt-3 font-serif text-[clamp(2.6rem,5vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">Skills compose. Agents stop.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">Five reusable skills do most of the work sequentially. Three agent roles exist only as inactive draft candidates where a durable memory and bounded tool boundary could eventually earn activation.</p>

              <div className="mt-8 grid gap-2">
                {candidateSkills.map((skill, index) => (
                  <div key={skill} className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.018] p-4">
                    <span className="font-mono text-[9px] text-cyan-200">0{index + 1}</span>
                    <div>
                      <strong className="text-sm text-white">{humanize(skill)}</strong>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{SKILL_DESCRIPTIONS[skill]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a href={PLUGIN_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition-micro hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
                <Code2 className="h-4 w-4" /> Inspect the skills-only plugin <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {model.agentCandidates.map((agent, index) => (
                <article key={agent.id} className="rounded-[1.5rem] border border-violet-300/18 bg-violet-300/[0.035] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Bot className="h-5 w-5 text-violet-200" />
                    <span className="rounded-full border border-violet-300/20 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-violet-200">inactive · draft only</span>
                  </div>
                  <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Candidate 0{index + 1}</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.02em] text-white">{humanize(agent.id)}</h3>
                  <ol className="mt-5 grid gap-3">
                    {agent.tasks.map((task) => (
                      <li key={task} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                        <CircleDot className="mt-1 h-3 w-3 shrink-0 text-violet-300" />
                        {task}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-rose-200/70">Denied authority</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {agent.denied.map((denial) => (
                        <span key={denial} className="rounded-md bg-black/20 px-2 py-1 font-mono text-[8px] text-slate-500">{denial}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {[
              [BrainCircuit, "Academy OS", "Contracts, Passport, access, authority"],
              [Layers3, "House", "Promise, language, community grammar"],
              [FileCode2, "Domain pack", "Persona, modules, missions, skills"],
              [Users, "Learning cell", "Build, critique, contribution, care"],
              [Waypoints, "Portable proof", "Learner-controlled export and next path"],
            ].map(([Icon, label, copy], index) => {
              const NodeIcon = Icon as typeof BrainCircuit;
              return (
                <div key={String(label)} className="relative rounded-xl border border-white/[0.08] bg-black/20 p-4">
                  <NodeIcon className="h-4 w-4 text-cyan-200" />
                  <strong className="mt-4 block text-sm text-white">{String(label)}</strong>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">{String(copy)}</p>
                  {index < 4 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-cyan-300/40 md:block" />}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">One control plane · replaceable surfaces · learner-owned exit</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1580px]">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] xl:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">Universities, teams, institutions</p>
              <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5.2rem)] font-semibold leading-[0.91] tracking-[-0.048em] text-white">Adopt the interfaces. Keep the authority.</h2>
              <p className="mt-6 text-base leading-7 text-slate-400">The Academy can meet an institution where it already works. One program or workflow becomes a bounded installation; local faculty and operators retain assessment, privacy, system, and adoption decisions.</p>
              <div className="mt-7 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.035] p-5">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Building2 className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">Institution price hypothesis</h3>
                </div>
                <p className="mt-3 font-serif text-3xl text-white">€24k–€60k / year / department</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">Private tenancy, approved integrations, facilitator enablement, observability, service guarantees, and Commons sponsorship. No replacement of academic governance.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["01", "Map one real program", "Name the local owner, learner, capability, artifact, systems, data, and consequential decisions."],
                ["02", "Install open interfaces", "Map capabilities, missions, artifacts, review, consented export, skills, and local execution."],
                ["03", "Enable local stewards", "Faculty, facilitators, privacy, accessibility, IT, and students learn to operate the path."],
                ["04", "Decide from receipts", "At 30, 60, and 90 days: stop, revise, sustain, or expand. Exit and export remain available."],
              ].map(([step, title, copy]) => (
                <article key={title} className="rounded-[1.35rem] border border-white/[0.08] bg-white/[0.018] p-5">
                  <span className="font-mono text-[9px] text-emerald-200">{step}</span>
                  <h3 className="mt-4 font-serif text-2xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-[1.6rem] border border-white/[0.08] bg-white/[0.018] p-6 sm:p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">Graduation evidence before expansion</p>
                <h3 className="mt-3 font-serif text-3xl font-semibold text-white">A pack earns scale through sustained learner behavior.</h3>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
                {[
                  [String(model.activationGate.minimumWeeklyActiveLearners), "weekly active"],
                  [percent(model.activationGate.minimumArtifactCompletionRate), "artifact completion"],
                  [percent(model.activationGate.minimumPeerContributionRate), "peer contribution"],
                  [String(model.activationGate.minimumIndependentStewards), "independent stewards"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#09090e] px-5 py-4 text-center">
                    <strong className="font-serif text-2xl text-white">{value}</strong>
                    <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-xs leading-6 text-slate-500">Measured for {model.activationGate.reviewWindow}, plus independent stewardship and passed accessibility, privacy, license, and authority review. These are operating gates, not promises of market success.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,.65fr)_minmax(0,1.35fr)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Sources and limitations</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em] text-white">Truth stays attached.</h2>
              <p className="mt-5 text-sm leading-6 text-slate-400">Every institution link describes a reachable learner habitat from its official public page. Prices and willingness-to-pay statements are explicit hypotheses. The Atlas is a reference model dated {model.release.asOf}.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={REFERENCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-slate-200 transition-micro hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"><FileCode2 className="h-4 w-4" /> Machine-readable Atlas</a>
                <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-slate-200 transition-micro hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"><GitFork className="h-4 w-4" /> GitHub source</a>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {model.habitats.map((habitat) => (
                <a key={habitat.id} href={habitat.url} target="_blank" rel="noreferrer" className="group rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition-micro hover:border-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <strong className="block text-xs leading-5 text-slate-200">{habitat.name}</strong>
                      <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.11em] text-slate-600">{habitat.place} · {humanize(habitat.type)}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-slate-300" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/[0.07] pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-200">Domain Zero is already inspectable</p>
              <p className="mt-2 font-serif text-2xl text-white">Open the graph before believing the portfolio.</p>
            </div>
            <Link href="/academy/graphs" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07070b] transition-micro hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Enter the Graph Observatory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Icon,
  ArchiveIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BranchIcon,
  CheckIcon,
  CloseIcon,
  CodeIcon,
  CompassIcon,
  DownloadIcon,
  EyeIcon,
  GridIcon,
  LayersIcon,
  LinkIcon,
  MoonIcon,
  OrbitIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SignalIcon,
  SparkIcon,
  SunIcon,
  WarningIcon,
} from "@/components/icons";
import { AgentSigil } from "@/components/AgentSigil";
import {
  StatusBadge,
  EvidenceDisclosure,
  AgentPresence,
  ApprovalCard,
  GlassSurface,
  ModalDialog,
} from "@/components/system";
import { StarlightMark } from "@/components/StarlightMark";
import agentsData from "@/data/agents.json";
import curatedStudies from "@/data/curated-studies.json";

interface AgentRecord {
  id: string;
  profileName?: string;
  title: string;
  tier: string;
  category?: string;
  domain: string;
  voice: string;
  mission: string;
  file: string;
  skills: string[];
}

interface StudyRecord {
  id: string;
  title: string;
  filename: string;
  src: string;
  brand: string;
  role: string;
  vis_score: number;
  tier: string;
  category_scores: {
    brand_canon_fit: number;
    craft_composition: number;
    typography_overlay_cleanliness: number;
    material_lighting_restraint: number;
    surface_role_utility: number;
    accessibility_provenance_artifacts: number;
  };
  model: string;
  prompt_hash: string;
  rights_status: string;
  critique_notes?: string;
  provenance: {
    prompt?: string;
    model?: string;
    rights_status?: string;
    reviewer?: string;
    rubric?: string;
  };
}

export function BrandLabClient() {
  // Page theme state
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [operatorMode, setOperatorMode] = React.useState(false);
  const [surfaceMode, setSurfaceMode] = React.useState<"horizon" | "operator" | "academy" | "cultural">("horizon");
  const [activeChapter, setActiveChapter] = React.useState("ch01");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Chapter 02: Mark Lab state
  const [showGrid, setShowGrid] = React.useState(true);
  const [showClearspace, setShowClearspace] = React.useState(false);
  const [markSize, setMarkSize] = React.useState(72);
  const [cursorTrialActive, setCursorTrialActive] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Chapter 03: Typography & Materiality state
  const [customText, setCustomText] = React.useState("The Open & Abundant Web");
  const [fontSize, setFontSize] = React.useState(36);
  const [freshnessStep, setFreshnessStep] = React.useState<number>(0); // 0: <5m, 1: 15m, 2: 2h, 3: >24h

  // Chapter 04: Agent Codex state
  const [agentSearch, setAgentSearch] = React.useState("");
  const [agentTierFilter, setAgentTierFilter] = React.useState("All");
  const [selectedAgent, setSelectedAgent] = React.useState<AgentRecord | null>(null);

  // Chapter 05: Motion & Spatial Stage state
  const [motionTier, setMotionTier] = React.useState<"webgl" | "css" | "static">("webgl");
  const [stagePlaying, setStagePlaying] = React.useState(true);

  // Chapter 06: Study Archive & Provenance state
  const [studyFilter, setStudyFilter] = React.useState("All");
  const [selectedStudy, setSelectedStudy] = React.useState<StudyRecord | null>(null);

  // Escape key closes open modals
  React.useEffect(() => {
    if (!selectedAgent && !selectedStudy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedAgent(null);
        setSelectedStudy(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedAgent, selectedStudy]);

  const agents: AgentRecord[] = agentsData as AgentRecord[];
  const studies: StudyRecord[] = curatedStudies as StudyRecord[];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter agents
  const filteredAgents = React.useMemo(() => {
    return agents.filter((agent) => {
      const matchSearch =
        agent.id.toLowerCase().includes(agentSearch.toLowerCase()) ||
        agent.title.toLowerCase().includes(agentSearch.toLowerCase()) ||
        agent.domain.toLowerCase().includes(agentSearch.toLowerCase()) ||
        agent.skills.some((s) => s.toLowerCase().includes(agentSearch.toLowerCase()));
      const matchTier =
        agentTierFilter === "All" ||
        agent.category === agentTierFilter ||
        agent.tier.toLowerCase() === agentTierFilter.toLowerCase() ||
        agent.tier.toLowerCase().includes(agentTierFilter.toLowerCase());
      return matchSearch && matchTier;
    });
  }, [agents, agentSearch, agentTierFilter]);

  // Filter studies
  const filteredStudies = React.useMemo(() => {
    return studies.filter((study) => {
      if (studyFilter === "All") return true;
      if (studyFilter === "Hero") return study.vis_score >= 28;
      if (studyFilter === "Approved") return study.vis_score >= 26 && study.vis_score < 28;
      if (studyFilter === "Study") return study.vis_score < 26;
      if (studyFilter === "Queen") return study.role.toLowerCase().includes("queen");
      if (studyFilter === "Chibi") return study.role.toLowerCase().includes("chibi");
      if (studyFilter === "Architecture") return study.role.toLowerCase().includes("architecture");
      return true;
    });
  }, [studies, studyFilter]);

  const freshnessLabels = ["Live (<5m)", "Normal (15m)", "Stale (>2h)", "Breach (>24h)"];
  const freshnessTypes: ("fresh" | "normal" | "stale" | "breach")[] = ["fresh", "normal", "stale", "breach"];

  const chapters = [
    { id: "ch01", num: "01", title: "Foundations & Modes" },
    { id: "ch02", num: "02", title: "Mark Lineage & Geometry" },
    { id: "ch03", num: "03", title: "Typography & Materiality" },
    { id: "ch04", num: "04", title: "151-Agent Sigil Codex" },
    { id: "ch05", num: "05", title: "Motion & Spatial Stage" },
    { id: "ch06", num: "06", title: "VIS Archive & Anti-Slop" },
    { id: "ch07", num: "07", title: "Open Design Kit" },
  ];

  return (
    <div
      data-theme={theme}
      data-mode={operatorMode ? "operator" : undefined}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[var(--sl-bg,#efede7)] text-[var(--sl-fg,#0e131b)]" : "bg-[var(--sl-bg,#070a10)] text-[var(--sl-fg,#ede6d8)]"
      }`}
    >
      {/* Top sticky chapter navigation rail */}
      <nav
        aria-label="Brand Lab Chapters"
        className="sticky top-14 z-40 border-b border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]/90 backdrop-blur-md px-6 py-2.5"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs font-mono font-medium text-[var(--sl-gold,#c9a15c)] uppercase tracking-wider mr-2">
              Observatory v3.0
            </span>
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                onClick={() => setActiveChapter(ch.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-micro whitespace-nowrap ${
                  activeChapter === ch.id
                    ? "bg-[var(--sl-fg,#ede6d8)]/10 text-[var(--sl-fg,#ede6d8)] font-semibold border border-[var(--sl-border,rgba(237,230,216,0.2))]"
                    : "text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
                }`}
              >
                <span className="font-mono text-[10px] text-[var(--sl-gold,#c9a15c)]">{ch.num}</span>
                <span>{ch.title}</span>
              </a>
            ))}
          </div>

          {/* Quick theme toggles right in the rail */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}
              aria-label={`Switch to ${theme === "ink" ? "Paper" : "Ink"} mode`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sl-border,rgba(237,230,216,0.14))] px-3 py-1 text-xs font-mono text-[var(--sl-fg,#ede6d8)] hover:bg-[var(--sl-fg,#ede6d8)]/10 transition-micro"
            >
              {theme === "ink" ? <SunIcon size={13} /> : <MoonIcon size={13} />}
              <span>{theme === "ink" ? "Ink (#070A10)" : "Paper (#EFEDE7)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setOperatorMode(!operatorMode)}
              aria-pressed={operatorMode}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-mono transition-micro ${
                operatorMode
                  ? "border-[var(--sl-companion,#82d8e6)] bg-[var(--sl-companion,#82d8e6)]/15 text-[var(--sl-companion,#82d8e6)]"
                  : "border-[var(--sl-border,rgba(237,230,216,0.14))] text-[var(--sl-fg-muted,#8b93a1)]"
              }`}
            >
              <SettingsIcon size={12} />
              <span>Operator</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Intro Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-6">
            <SparkIcon size={13} />
            <span>Starlight Living Design Language · Award Standard v3.0</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] max-w-4xl leading-[1.1]">
            Celestial Precision × <br className="hidden sm:inline" />
            <span className="italic font-serif text-[var(--sl-gold,#c9a15c)]">Warm Human Craft.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
            A living design observatory bridging mathematical rigor with sovereign human agency.
            Rejecting both neon AI slop and sterile SaaS monotony, Starlight Living Design establishes
            clarity-as-freshness materiality, accessible color-blind dual status semantics, and 151
            deterministic vector agent sigils.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#ch07"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--sl-gold,#c9a15c)] px-4 py-2 text-sm font-semibold text-black hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro shadow-lg"
            >
              <DownloadIcon size={15} />
              <span>Get Open Design Kit</span>
            </a>
            <Link
              href="/design"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] px-4 py-2 text-sm font-medium text-[var(--sl-fg,#ede6d8)] hover:bg-[var(--sl-fg,#ede6d8)]/10 transition-micro"
            >
              <CodeIcon size={15} />
              <span>Read Full DESIGN.md Spec</span>
            </Link>
            <Link
              href="/visuals/system"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] px-4 py-2 text-sm font-medium text-[var(--sl-fg,#ede6d8)] hover:bg-[var(--sl-fg,#ede6d8)]/10 transition-micro"
            >
              <GridIcon size={15} />
              <span>Component Specimen Bench</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-16 space-y-28">
        {/* ========================================================================= */}
        {/* CHAPTER 01: LIVING FOUNDATIONS & MODE SWITCHER */}
        {/* ========================================================================= */}
        <section id="ch01" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
                Chapter 01
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
                Living Foundations & Contextual Modes
              </h2>
              <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
                One living physics across 4 contextual surface modes and 2 canvas grounds (Night Ink & Warm Paper).
              </p>
            </div>

            {/* Surface Mode Selector */}
            <div className="flex items-center rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] p-1 bg-[var(--sl-surface-1,#0d1119)]/60 text-xs">
              {(["horizon", "operator", "academy", "cultural"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSurfaceMode(m)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-micro ${
                    surfaceMode === m
                      ? "bg-[var(--sl-gold,#c9a15c)] text-black font-semibold"
                      : "text-[var(--sl-fg-muted,#8b93a1)] hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Preview Card */}
          <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--sl-companion,#82d8e6)]">
                Active Surface: {surfaceMode.toUpperCase()} MODE
              </span>
              <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">
                Ground: {theme === "ink" ? "Night Ink #070A10" : "Warm Paper #EFEDE7"}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[var(--sl-fg,#ede6d8)] mb-6">
              {surfaceMode === "horizon" &&
                "Horizon Mode: Lusion-calibrated architectural negative space, razor-tight display tracking (-0.025em), whisper-quiet header chrome, and contained 24px-radius interactive focal stages for cinematic manifestos."}
              {surfaceMode === "operator" &&
                "Operator Mode: Value-stepped dark surfaces (#070A10 → #0D1119 → #141926), hairline borders, keyboard-first focus rings, high density, and verifiable cryptographic receipts."}
              {surfaceMode === "academy" &&
                "Academy Mode: Quiet workflow studio, tactile hardware-grade specimen plates (Ableton/Elektron inspired), and distraction-free cognitive reading surfaces."}
              {surfaceMode === "cultural" &&
                "Cultural Mode: Narrative character sheets, Suno audio stems, Constellation lore dials, and living visual identities with warm Instrument Serif editorial grace notes."}
            </p>

            {/* Token Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-[var(--sl-border,rgba(237,230,216,0.12))]">
              {[
                { name: "--sl-bg", hex: theme === "ink" ? "#070A10" : "#EFEDE7", label: "Ground Canvas" },
                { name: "--sl-surface-1", hex: theme === "ink" ? "#0D1119" : "#F7F5F0", label: "Surface Layer" },
                { name: "--sl-fg", hex: theme === "ink" ? "#EDE6D8" : "#0E131B", label: "Primary Ivory (14.9:1)" },
                { name: "--sl-fg-muted", hex: theme === "ink" ? "#8B93A1" : "#525B68", label: "Muted Text (6.4:1)" },
                { name: "--sl-gold", hex: theme === "ink" ? "#C9A15C" : "#8A6522", label: "Human Gate Gold" },
                { name: "--sl-companion", hex: theme === "ink" ? "#82D8E6" : "#16697A", label: "Protocol Cyan" },
              ].map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => copyToClipboard(swatch.hex, swatch.name)}
                  className="flex flex-col text-left p-2.5 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-2,#141926)]/40 hover:border-[var(--sl-gold,#c9a15c)] transition-micro group"
                >
                  <div
                    className="h-9 w-full rounded border border-white/10 mb-2 transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="font-mono text-xs font-semibold text-[var(--sl-fg,#ede6d8)]">
                    {swatch.hex}
                  </span>
                  <span className="text-[10px] text-[var(--sl-fg-muted,#8b93a1)] truncate">
                    {swatch.name}
                  </span>
                  <span className="text-[9px] text-[var(--sl-gold,#c9a15c)] font-mono mt-0.5">
                    {copiedKey === swatch.name ? "Copied!" : swatch.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessible Status Quartet */}
          <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">
                  The Accessible Status Quartet
                </h3>
                <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  WCAG color-blind safe dual encoding: color + shape + glyph. Never rely on color alone.
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">
                From @starlight/tokens
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl border border-[rgba(119,240,191,0.3)] bg-[rgba(119,240,191,0.06)] flex flex-col gap-2">
                <StatusBadge status="ok">Verified Stable</StatusBadge>
                <span className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  Token: <code className="font-mono text-[11px]">#77F0BF</code> · Shape: Circle (●)
                </span>
                <span className="text-[11px] text-[var(--sl-fg-muted,#8b93a1)] leading-tight">
                  All tests green, signed SIP receipt verified, zero breach.
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[rgba(232,195,106,0.3)] bg-[rgba(232,195,106,0.06)] flex flex-col gap-2">
                <StatusBadge status="warn">Warning / Stale</StatusBadge>
                <span className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  Token: <code className="font-mono text-[11px]">#E8C36A</code> · Shape: Triangle (▲)
                </span>
                <span className="text-[11px] text-[var(--sl-fg-muted,#8b93a1)] leading-tight">
                  Telemetry degraded, data older than 2 hours, needs sync.
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[rgba(255,123,123,0.3)] bg-[rgba(255,123,123,0.06)] flex flex-col gap-2">
                <StatusBadge status="breach">Breach / Error</StatusBadge>
                <span className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  Token: <code className="font-mono text-[11px]">#FF7B7B</code> · Shape: Square (■)
                </span>
                <span className="text-[11px] text-[var(--sl-fg-muted,#8b93a1)] leading-tight">
                  Contract violation, security check fail, or data staleness &gt;24h.
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[rgba(183,162,255,0.3)] bg-[rgba(183,162,255,0.06)] flex flex-col gap-2">
                <StatusBadge status="unknown">Unknown / Pending</StatusBadge>
                <span className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  Token: <code className="font-mono text-[11px]">#B7A2FF</code> · Shape: Diamond (◆)
                </span>
                <span className="text-[11px] text-[var(--sl-fg-muted,#8b93a1)] leading-tight">
                  Evaluating state, awaiting model probe response or genesis sync.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 02: MARK LINEAGE & GEOMETRY LAB */}
        {/* ========================================================================= */}
        <section id="ch02" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10">
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
              Chapter 02
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
              Mark Lineage & Geometry Lab
            </h2>
            <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
              Reconciling the two official marks: the 4-Point Starlight Star + Companion Dot (.ai / .academy)
              and the Telescope Orbit-Star Protocol Sigil (.org).
            </p>
          </div>

          {/* Interactive Mark Comparison Stage */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Mark 1: 4-Point Starlight Star */}
            <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)] mb-4">
                <span className="text-[var(--sl-gold,#c9a15c)] font-semibold">Primary Ecosystem Mark</span>
                <span>starlightintelligence.ai / Nexus</span>
              </div>

              {/* Mark Canvas */}
              <div
                className={`relative flex items-center justify-center h-64 w-full rounded-xl border border-white/5 overflow-hidden transition-all ${
                  showGrid ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px]" : "bg-black/20"
                }`}
              >
                {showClearspace && (
                  <div className="absolute inset-8 border border-dashed border-[var(--sl-gold,#c9a15c)]/40 rounded-lg pointer-events-none" />
                )}

                {/* 4-Point SVG Graphic */}
                <svg
                  width={markSize}
                  height={markSize}
                  viewBox="0 0 100 100"
                  fill="none"
                  className="transition-all duration-200"
                >
                  <path
                    d="M50 5 C51 32 68 49 95 50 C68 51 51 68 50 95 C49 68 32 51 5 50 C32 49 49 32 50 5 Z"
                    fill="url(#goldStarGrad)"
                  />
                  <circle cx="50" cy="50" r="7" fill="#FBF6EB" />
                  <circle cx="82" cy="22" r="5" fill="#82D8E6" />
                  <defs>
                    <linearGradient id="goldStarGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F0C87E" />
                      <stop offset="50%" stopColor="#C9A15C" />
                      <stop offset="100%" stopColor="#8A6522" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="w-full mt-4 text-xs text-[var(--sl-fg-muted,#8b93a1)] space-y-1">
                <p className="font-semibold text-[var(--sl-fg,#ede6d8)]">4-Point Star + Orbital Companion</p>
                <p>Represents human operator sovereignty (gold star) and autonomous companion intelligence (cyan node).</p>
              </div>
            </div>

            {/* Mark 2: Telescope Orbit-Star Protocol Sigil */}
            <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)] mb-4">
                <span className="text-[var(--sl-companion,#82d8e6)] font-semibold">Open Protocol Sigil</span>
                <span>starlightintelligence.org (SIP Substrate)</span>
              </div>

              {/* Mark Canvas */}
              <div
                className={`relative flex items-center justify-center h-64 w-full rounded-xl border border-white/5 overflow-hidden transition-all ${
                  showGrid ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px]" : "bg-black/20"
                }`}
              >
                {showClearspace && (
                  <div className="absolute inset-8 border border-dashed border-[var(--sl-companion,#82d8e6)]/40 rounded-lg pointer-events-none" />
                )}

                <div style={{ transform: `scale(${markSize / 24})` }} className="transition-transform duration-200">
                  <StarlightMark size={24} />
                </div>
              </div>

              <div className="w-full mt-4 text-xs text-[var(--sl-fg-muted,#8b93a1)] space-y-1">
                <p className="font-semibold text-[var(--sl-fg,#ede6d8)]">Telescope Orbit-Star Sigil</p>
                <p>Vertical telescope diffraction ray (optics) with tilted orbital ellipse (open SIP protocol layer).</p>
              </div>
            </div>
          </div>

          {/* Mark Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">Scale: {markSize}px</span>
                <input
                  type="range"
                  min="24"
                  max="128"
                  value={markSize}
                  onChange={(e) => setMarkSize(Number(e.target.value))}
                  className="w-32 accent-[var(--sl-gold,#c9a15c)] cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-mono text-[var(--sl-fg,#ede6d8)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="accent-[var(--sl-gold,#c9a15c)]"
                />
                Construction Grid
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-[var(--sl-fg,#ede6d8)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClearspace}
                  onChange={(e) => setShowClearspace(e.target.checked)}
                  className="accent-[var(--sl-gold,#c9a15c)]"
                />
                Clearspace Boundary
              </label>
            </div>

            <button
              type="button"
              onClick={() => setCursorTrialActive(!cursorTrialActive)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-micro border ${
                cursorTrialActive
                  ? "border-[var(--sl-gold,#c9a15c)] bg-[var(--sl-gold,#c9a15c)] text-black"
                  : "border-white/10 bg-white/5 text-[var(--sl-fg,#ede6d8)] hover:text-white"
              }`}
            >
              <SparkIcon size={14} />
              <span>{cursorTrialActive ? "Cursor Sandbox Active (Move Mouse)" : "Test Cursor Trail Sandbox"}</span>
            </button>
          </div>

          {/* Interactive Cursor Trial Area */}
          {cursorTrialActive && (
            <div
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              className="mt-4 h-48 rounded-xl border border-[var(--sl-gold,#c9a15c)]/40 bg-black/40 relative overflow-hidden flex items-center justify-center cursor-crosshair"
            >
              <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)] select-none">
                Move cursor within this bounded area to trial the Starlight 4-point star trail.
              </span>
              <div
                className="pointer-events-none absolute transition-transform duration-75 ease-out"
                style={{
                  left: cursorPos.x,
                  top: cursorPos.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <span className="text-[var(--sl-gold,#c9a15c)] text-lg animate-spin">✦</span>
                  <span className="absolute -top-1 -right-2 text-[var(--sl-companion,#82d8e6)] text-[9px]">●</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 03: TYPOGRAPHY & MATERIALITY */}
        {/* ========================================================================= */}
        <section id="ch03" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10">
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
              Chapter 03
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
              Typography & Clarity-as-Freshness Materiality
            </h2>
            <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
              Type specimens and the Ops Materiality Simulator: Watch liquid glass encode data freshness in physical light.
            </p>
          </div>

          {/* Typography Specimen */}
          <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--sl-gold,#c9a15c)]">
                Variable Type Specimen
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">Size: {fontSize}px</span>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-28 accent-[var(--sl-gold,#c9a15c)] cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your preview text here..."
                className="w-full rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-2,#141926)]/60 px-3.5 py-2 text-sm text-[var(--sl-fg,#ede6d8)] focus:border-[var(--sl-gold,#c9a15c)] outline-none font-mono"
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-[var(--sl-border,rgba(237,230,216,0.1))]">
              <div>
                <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">
                  Instrument Sans (Display & Headings · Tracking -0.025em)
                </span>
                <p
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: "var(--sl-font-sans-loaded), var(--sl-font-sans), sans-serif",
                  }}
                  className="font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] leading-tight"
                >
                  {customText || "The Open & Abundant Web"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">
                  Instrument Serif (Editorial Italic Grace Notes)
                </span>
                <p
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: "var(--sl-font-serif-loaded), var(--sl-font-serif), serif",
                  }}
                  className="italic text-[var(--sl-gold,#c9a15c)] leading-tight"
                >
                  {customText || "Intelligence in service of life."}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">
                  IBM Plex Mono (Telemetry, Cryptographic Proof & Code)
                </span>
                <p
                  style={{
                    fontSize: `${Math.max(14, fontSize - 12)}px`,
                    fontFamily: "var(--sl-font-mono-loaded), var(--sl-font-mono), monospace",
                  }}
                  className="text-[var(--sl-fg-muted,#8b93a1)] leading-tight break-all"
                >
                  {customText ? `SHA256(${customText})` : "c2c35d27 · 30-pt gate verified · SIP-Attested"}
                </p>
              </div>
            </div>
          </div>

          {/* Ops Materiality Simulator */}
          <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">
                  Ops Materiality Simulator
                </h3>
                <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                  Data staleness law: fresh telemetry reflects crisp specular hairline; aging data desaturates to matte amber.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] font-medium">
                  {freshnessLabels[freshnessStep]}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={freshnessStep}
                onChange={(e) => setFreshnessStep(Number(e.target.value))}
                className="w-full accent-[var(--sl-gold,#c9a15c)] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)] mt-1">
                <span>&lt; 5 min (Live)</span>
                <span>15 min (Normal)</span>
                <span>&gt; 2 hr (Stale)</span>
                <span>&gt; 24 hr (Breach)</span>
              </div>
            </div>

            {/* Live GlassSurface Simulator Display */}
            <GlassSurface
              freshness={freshnessTypes[freshnessStep]}
              interactive
              className="p-8 text-center"
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="inline-flex items-center gap-2">
                  <StatusBadge status={freshnessStep === 0 ? "ok" : freshnessStep === 1 ? "ok" : freshnessStep === 2 ? "warn" : "breach"}>
                    {freshnessLabels[freshnessStep]}
                  </StatusBadge>
                  <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">Telemetry Stream</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--sl-fg,#ede6d8)]">
                  {freshnessStep === 0 && "Crystal Specular Hairline (Live Freshness)"}
                  {freshnessStep === 1 && "Nominal Material Surface (15-Minute Sync)"}
                  {freshnessStep === 2 && "Matte Desaturation (2-Hour Warning State)"}
                  {freshnessStep === 3 && "Amber Hairline Breach (Stale Context Alert)"}
                </h4>
                <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed">
                  Notice how the border luminescence, inner bevel highlight, and saturation shift dynamically.
                  The interface is not just styled; it breathes with real data truth.
                </p>
              </div>
            </GlassSurface>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 04: 151-AGENT SIGIL & CONSTELLATION CODEX */}
        {/* ========================================================================= */}
        <section id="ch04" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
                Chapter 04
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
                The 151-Agent Sigil & Constellation Codex
              </h2>
              <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
                Every agent in the Starlight registry rendered with deterministic sacred-geometry vector sigils.
              </p>
            </div>

            {/* Total Count Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-companion,#82d8e6)]/40 bg-[var(--sl-companion,#82d8e6)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-companion,#82d8e6)]">
              <OrbitIcon size={13} />
              <span>{filteredAgents.length} / 151 Minds Active</span>
            </div>
          </div>

          {/* Search and Tier Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sl-fg-muted,#8b93a1)]" />
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Search by agent ID, title, domain, or skill..."
                className="w-full rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] pl-10 pr-4 py-2 text-sm text-[var(--sl-fg,#ede6d8)] focus:border-[var(--sl-gold,#c9a15c)] outline-none"
              />
            </div>

            {/* Tier Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {["All", "Front-Door", "Excavation", "Leadership", "Specialist", "Universal IS", "Council", "Domain Sub-Stack"].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setAgentTierFilter(tier)}
                  className={`px-3 py-1 rounded-md transition-micro font-medium ${
                    agentTierFilter === tier
                      ? "bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] font-semibold"
                      : "border border-white/10 text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)] hover:bg-white/5"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* 151-Agent Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAgents.slice(0, 48).map((agent) => (
              <div
                key={agent.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAgent(agent)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAgent(agent);
                  }
                }}
                className="rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] p-4 hover:border-[var(--sl-gold,#c9a15c)] focus-visible:border-[var(--sl-gold,#c9a15c)] focus-visible:outline-none transition-std cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[var(--sl-fg,#ede6d8)]">
                      {agent.tier}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] truncate max-w-[100px]">
                      {agent.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="shrink-0 transition-transform group-hover:scale-110">
                      <AgentSigil id={agent.id} domain={agent.domain} tier={agent.tier} size={40} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] group-hover:text-[var(--sl-gold,#c9a15c)] transition-micro">
                        {agent.title}
                      </h4>
                      <p className="text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)]">id: {agent.id}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] line-clamp-2 leading-relaxed mb-3">
                    {agent.mission}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--sl-border,rgba(237,230,216,0.08))] flex items-center justify-between text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)]">
                  <span>Voice: {agent.voice}</span>
                  <span className="text-[var(--sl-companion,#82d8e6)] group-hover:translate-x-0.5 transition-transform">
                    Inspect →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length > 48 && (
            <div className="text-center pt-6">
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--sl-gold,#c9a15c)]/40 px-5 py-2.5 text-xs font-mono font-semibold text-[var(--sl-gold,#c9a15c)] hover:bg-[var(--sl-gold,#c9a15c)]/10 transition-micro"
              >
                <span>View Full 151-Agent Sovereign Atlas Route →</span>
              </Link>
            </div>
          )}

          {/* Agent Inspector Modal/Drawer */}
          {selectedAgent && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="brandlab-agent-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--sl-gold,#c9a15c)]/60 bg-[var(--sl-surface-1,#0d1119)] p-6 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  aria-label="Close profile"
                  className="absolute right-4 top-4 text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
                >
                  <CloseIcon size={18} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <AgentSigil
                    id={selectedAgent.id}
                    domain={selectedAgent.domain}
                    tier={selectedAgent.tier}
                    size={64}
                  />
                  <div>
                    <h3 id="brandlab-agent-modal-title" className="text-xl font-semibold text-[var(--sl-fg,#ede6d8)]">
                      {selectedAgent.title}
                    </h3>
                    <p className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">
                      {selectedAgent.tier} · domain: {selectedAgent.domain}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed mb-4">
                  {selectedAgent.mission}
                </p>

                <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-mono">
                  <div>
                    <span className="text-[var(--sl-fg-muted,#8b93a1)] block mb-1">Source File:</span>
                    <span className="text-[var(--sl-fg,#ede6d8)] bg-black/40 px-2 py-1 rounded block truncate">
                      agents/{selectedAgent.file}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--sl-fg-muted,#8b93a1)] block mb-1">Active Skills ({selectedAgent.skills.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAgent.skills.length > 0 ? (
                        selectedAgent.skills.map((s) => (
                          <span
                            key={s}
                            className="bg-[var(--sl-companion,#82d8e6)]/10 text-[var(--sl-companion,#82d8e6)] border border-[var(--sl-companion,#82d8e6)]/20 px-2 py-0.5 rounded text-[11px]"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--sl-fg-muted,#8b93a1)]">Autonomous Council coordination</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAgent(null)}
                    className="px-4 py-1.5 rounded-lg border border-white/10 text-xs text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
                  >
                    Close
                  </button>
                  <Link
                    href={`/agents?id=${selectedAgent.id}`}
                    className="px-4 py-1.5 rounded-lg bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold hover:opacity-90"
                  >
                    Open in Atlas
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 05: MOTION, LIQUID & SPATIAL STAGE */}
        {/* ========================================================================= */}
        <section id="ch05" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
                Chapter 05
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
                Motion, Liquid & Spatial Stage
              </h2>
              <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
                Contained 24px-radius Lusion-inspired interactive focal stage with 3-tier progressive enhancement.
              </p>
            </div>

            {/* Capability Tier Selector */}
            <div className="flex items-center rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] p-1 bg-[var(--sl-surface-1,#0d1119)] text-xs">
              {(["webgl", "css", "static"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMotionTier(t)}
                  className={`px-3 py-1 rounded-md font-medium uppercase transition-micro ${
                    motionTier === t
                      ? "bg-[var(--sl-companion,#82d8e6)] text-black font-semibold"
                      : "text-[var(--sl-fg-muted,#8b93a1)] hover:text-white"
                  }`}
                >
                  {t === "webgl" ? "Tier 1: WebGL2 Spec (CSS Preview)" : t === "css" ? "Tier 2: CSS Lite" : "Tier 3: Static"}
                </button>
              ))}
            </div>
          </div>

          {/* Focal Stage Container */}
          <div className="rounded-3xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-8 relative overflow-hidden">
            {/* Background ambient animation if not static */}
            {motionTier !== "static" && (
              <div
                className={`absolute inset-0 pointer-events-none opacity-25 ${
                  stagePlaying ? "animate-mesh-1" : ""
                }`}
                style={{
                  background:
                    "radial-gradient(circle at 30% 40%, rgba(130,216,230,0.2) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(201,161,92,0.15) 0%, transparent 50%)",
                }}
              />
            )}

            <div className="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--sl-companion,#82d8e6)] mb-3">
                  <SignalIcon size={14} />
                  <span>Interactive Refraction Stage · 60fps Target</span>
                </div>
                <h3 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] leading-tight">
                  Constellation Node Choreography
                </h3>
                <p className="mt-3 text-sm text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed">
                  Notice how liquid glass refraction and specular highlights degrade predictably across tiers.
                  On this static documentation site, Tier 1 renders a CSS backdrop-filter specification preview
                  (full Three.js WebGL2 refraction shaders ship in `@starlight/materials`), Tier 2 uses pure CSS
                  backdrop blur, and Tier 3 delivers zero-blur high-contrast static surfaces under reduced motion.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStagePlaying(!stagePlaying)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-[var(--sl-fg,#ede6d8)] hover:text-white"
                  >
                    {stagePlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    <span>{stagePlaying ? "Pause Animation" : "Resume Motion"}</span>
                  </button>
                </div>
              </div>

              {/* Live Interactive Specimen Canvas */}
              <GlassSurface
                tier={motionTier}
                freshness="fresh"
                interactive
                className="p-6 h-64 flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <div className="relative mb-3">
                  <AgentSigil id="queen" tier="Specialist" domain="Vision" size={72} />
                </div>
                <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">
                  Queen Visual Engine Specimen
                </h4>
                <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] mt-1">
                  Active Renderer: {motionTier === "webgl" ? "CSS Fallback (WebGL2 Spec)" : motionTier === "css" ? "CSS Backdrop" : "Static Matte"}
                </span>
                <span className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] mt-0.5">
                  Frame budget: &lt;16.6ms (60fps)
                </span>
              </GlassSurface>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 06: VIS-VERIFIED STUDY ARCHIVE & ANTI-SLOP WALL */}
        {/* ========================================================================= */}
        <section id="ch06" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
                Chapter 06
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
                VIS-Verified Study Archive & Anti-Slop Wall
              </h2>
              <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
                30-point independent quality gate results across all candidate assets, plus explicit anti-slop rejections.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {["All", "Hero", "Approved", "Study", "Queen", "Architecture", "Chibi"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStudyFilter(f)}
                  className={`px-3 py-1 rounded-md transition-micro font-medium ${
                    studyFilter === f
                      ? "bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] font-semibold"
                      : "border border-white/10 text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)] hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 8px Specimen Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-16">
            {filteredStudies.map((study) => (
              <div
                key={study.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStudy(study)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedStudy(study);
                  }
                }}
                className="group relative rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)] overflow-hidden cursor-pointer hover:border-[var(--sl-gold,#c9a15c)] focus-visible:border-[var(--sl-gold,#c9a15c)] focus-visible:outline-none transition-std flex flex-col"
              >
                {/* Image plate with fallback */}
                <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={study.src}
                    alt={study.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder if relative path or remote URL fails
                      (e.target as HTMLImageElement).src = "/assets/visuals/08-readme-hero.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md ${
                        study.vis_score >= 28
                          ? "bg-emerald-500 text-black"
                          : study.vis_score >= 26
                          ? "bg-amber-400 text-black"
                          : "bg-purple-400 text-black"
                      }`}
                    >
                      {study.vis_score}/30
                    </span>
                  </div>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-medium text-[var(--sl-fg,#ede6d8)] truncate">
                      {study.title}
                    </h5>
                    <p className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] truncate">
                      {study.role}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{study.rights_status}</span>
                    <span className="text-[var(--sl-gold,#c9a15c)] group-hover:underline">Provenance →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Study Provenance Drawer Modal */}
          {selectedStudy && (
            <ModalDialog
              labelledBy="brandlab-study-modal-title"
              onClose={() => setSelectedStudy(null)}
            >
                <button
                  type="button"
                  onClick={() => setSelectedStudy(null)}
                  aria-label="Close study"
                  className="absolute right-4 top-4 text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
                >
                  <CloseIcon size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      selectedStudy.vis_score >= 28
                        ? "bg-emerald-500 text-black"
                        : "bg-amber-400 text-black"
                    }`}
                  >
                    {selectedStudy.vis_score} / 30 PTS
                  </span>
                  <div>
                    <h3 id="brandlab-study-modal-title" className="text-lg font-semibold text-[var(--sl-fg,#ede6d8)]">
                      {selectedStudy.title}
                    </h3>
                    <p className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">
                      {selectedStudy.tier} · Role: {selectedStudy.role}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedStudy.src}
                    alt={selectedStudy.title}
                    className="w-full max-h-72 object-contain"
                  />
                </div>

                {/* Score Breakdown (6x5 rubric) */}
                <div className="mb-4">
                  <h4 className="text-xs font-mono uppercase text-[var(--sl-fg-muted,#8b93a1)] mb-2">
                    30-Point Gate Rubric Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {Object.entries(selectedStudy.category_scores || {}).map(([key, val]) => (
                      <div key={key} className="p-2 rounded border border-white/5 bg-white/5">
                        <span className="text-[10px] text-[var(--sl-fg-muted,#8b93a1)] block truncate">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-semibold text-[var(--sl-gold,#c9a15c)]">
                          {val} / 5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critique Notes */}
                {selectedStudy.critique_notes && (
                  <div className="mb-4 p-3 rounded-lg border border-white/10 bg-white/5 text-xs leading-relaxed text-[var(--sl-fg,#ede6d8)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--sl-gold,#c9a15c)] block mb-1">
                      Independent Critic Assessment:
                    </span>
                    {selectedStudy.critique_notes}
                  </div>
                )}

                {/* Machine JSON Sidecar */}
                <EvidenceDisclosure summary="View Raw .vis.provenance.json Sidecar">
                  <pre className="text-[11px] font-mono text-[var(--sl-fg,#ede6d8)] p-3 rounded bg-black/60 overflow-x-auto">
                    {JSON.stringify(
                      {
                        id: selectedStudy.id,
                        vis_score: selectedStudy.vis_score,
                        tier: selectedStudy.tier,
                        rights_status: selectedStudy.rights_status,
                        model: selectedStudy.model,
                        prompt_hash: selectedStudy.prompt_hash,
                        provenance: selectedStudy.provenance,
                      },
                      null,
                      2
                    )}
                  </pre>
                </EvidenceDisclosure>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedStudy(null)}
                    className="px-4 py-1.5 rounded-lg bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold hover:opacity-90"
                  >
                    Close Provenance
                  </button>
                </div>
            </ModalDialog>
          )}

          {/* Anti-Slop Wall */}
          <div className="rounded-2xl border border-red-500/30 bg-red-950/10 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <WarningIcon size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-300">
                  The Anti-Slop Wall: What Starlight Refuses to Ship
                </h3>
                <p className="text-xs text-red-400/80">
                  Explicit architectural rejects enforced by our 30-point gate and editorial contracts.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[
                {
                  title: "1. Baked-in Garbled AI Text",
                  critique:
                    "Raster images with hallucinated pseudo-English typography. Every title, metric, and label must be rendered as crisp HTML/SVG code overlays.",
                },
                {
                  title: "2. Neon Cyberpunk Rainbow Slop",
                  critique:
                    "Generic purple/cyan radioactive glowing gradients with zero cognitive restraint. Starlight uses disciplined Night Ink and warm human Gold.",
                },
                {
                  title: "3. Disembodied Floating Robot Heads",
                  critique:
                    "Decorative cyborg clichés disconnected from actual agent workflows. Our agents are represented as sacred architectural sigils and structured minds.",
                },
                {
                  title: "4. Uncontained Full-Bleed WebGL",
                  critique:
                    "3D shaders rendered behind paragraphs of body prose, destroying text legibility and draining battery. All 3D stages must be contained in 24px-radius frames.",
                },
                {
                  title: "5. Cartoon Mascot Protocol Takeovers",
                  critique:
                    "Silly anime figures occupying open protocol homepages. Companion and chibi studies belong strictly in research and cultural studio registers.",
                },
                {
                  title: "6. Fake Decorative HUD Telemetry",
                  critique:
                    "Animated dials, waveforms, and graphs that encode no actual data. Every status, line, and badge must be backed by a verified SQLite or SIP receipt.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-red-500/20 bg-black/40 flex flex-col justify-between"
                >
                  <h4 className="text-xs font-mono font-semibold text-red-300 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--sl-fg,#ede6d8)] leading-relaxed">
                    {item.critique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHAPTER 07: OPEN DESIGN KIT & FORKABLE SPEC EXPORT */}
        {/* ========================================================================= */}
        <section id="ch07" className="scroll-mt-32">
          <div className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] pb-5 mb-10">
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] tracking-wider uppercase">
              Chapter 07
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] mt-1">
              Open Design Kit & Forkable Spec Export
            </h2>
            <p className="text-sm text-[var(--sl-fg-muted,#8b93a1)] mt-1 max-w-2xl">
              1-click install snippets, machine-readable specifications, and open movement assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Shadcn Registry Install */}
            <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-[var(--sl-companion,#82d8e6)]">
                  Shadcn Registry 1-Click Install
                </span>
                <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">Next.js / React 19</span>
              </div>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed mb-4">
                Install Starlight Living Design primitives, tokens, and 24 Signal SVG icons into your own project in 60 seconds.
              </p>

              <div className="p-3 rounded-lg border border-white/10 bg-black/60 flex items-center justify-between gap-3 font-mono text-xs text-[var(--sl-fg,#ede6d8)]">
                <code className="truncate">npx shadcn@latest add https://starlightintelligence.org/r/starlight-living.json</code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "npx shadcn@latest add https://starlightintelligence.org/r/starlight-living.json",
                      "shadcn"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold shrink-0 hover:opacity-90"
                >
                  {copiedKey === "shadcn" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Tailwind v4 @theme Block */}
            <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-[var(--sl-gold,#c9a15c)]">
                  Tailwind v4 @theme Integration
                </span>
                <span className="text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]">CSS Tokens</span>
              </div>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed mb-4">
                Drop Starlight semantic variables directly into your Tailwind v4 theme block.
              </p>

              <div className="p-3 rounded-lg border border-white/10 bg-black/60 flex items-center justify-between gap-3 font-mono text-xs text-[var(--sl-fg,#ede6d8)]">
                <code className="truncate">@import &quot;tailwindcss&quot;; /* with --sl-* tokens */</code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      [
                        "@theme inline {",
                        "  --color-sl-bg: var(--sl-bg);",
                        "  --color-sl-gold: var(--sl-gold);",
                        "  --color-sl-companion: var(--sl-companion);",
                        "}",
                      ].join("\n"),
                      "tailwind"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold shrink-0 hover:opacity-90"
                >
                  {copiedKey === "tailwind" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Links to Subpages */}
          <div className="rounded-2xl border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-surface-1,#0d1119)] p-8">
            <h3 className="text-xl font-semibold text-[var(--sl-fg,#ede6d8)] mb-2">
              Explore the Starlight Living Protocol Surface
            </h3>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] mb-6 max-w-xl">
              Connect to our canonical specifications, component sandboxes, rights ledgers, and sovereign movement hubs.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/design"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /design — Living Spec Reader
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Canonical public reader for Living Design v3.0 YAML spec.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Read Spec →</span>
              </Link>

              <Link
                href="/visuals/system"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /visuals/system — Specimen Bench
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Interactive specimen bench with 24 Signal SVG icons sandbox.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Launch Bench →</span>
              </Link>

              <Link
                href="/visuals/provenance"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /visuals/provenance — 30-pt Gate
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Live ledger inspector for VIS 30-pt gate, rights, and R2 CDN.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Inspect Ledger →</span>
              </Link>

              <Link
                href="/agents"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /agents — 151-Agent Atlas
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Full sovereign directory filterable by tier with parametric sigils.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Explore Atlas →</span>
              </Link>

              <Link
                href="/movement"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /movement — The Abundant Web
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Participatory hub uniting manifesto, Built on SIP directory, and pledge.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Join Movement →</span>
              </Link>

              <Link
                href="/visuals/press-kit"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--sl-gold,#c9a15c)] transition-micro flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                    /visuals/press-kit — Protocol Kit
                  </h4>
                  <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Official protocol press kit hosting SVG marks and guidelines.</p>
                </div>
                <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mt-3">Download Kit →</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

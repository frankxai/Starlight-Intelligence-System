"use client";

import * as React from "react";
import Link from "next/link";
import {
  Icon,
  iconNames,
  iconPaths,
  type IconName,
  GridIcon,
  SparkIcon,
  ShieldIcon,
  CheckIcon,
  DownloadIcon,
  CloseIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";
import {
  StatusBadge,
  EvidenceDisclosure,
  AgentPresence,
  ApprovalCard,
  GlassSurface,
  type StatusType,
} from "@/components/system";
import { AgentSigil } from "@/components/AgentSigil";

export function SystemBenchClient() {
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [iconSearch, setIconSearch] = React.useState("");
  const [iconSize, setIconSize] = React.useState(24);
  const [copiedIcon, setCopiedIcon] = React.useState<string | null>(null);

  // ApprovalCard interactive demo state
  const [approvalStatus, setApprovalStatus] = React.useState<"pending" | "approved" | "rejected">("pending");

  // Freshness simulator
  const [freshness, setFreshness] = React.useState<"fresh" | "normal" | "stale" | "breach">("fresh");

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const copyIconCode = (name: string) => {
    const code = `<${name.charAt(0).toUpperCase() + name.slice(1)}Icon size={24} />`;
    navigator.clipboard.writeText(code);
    setCopiedIcon(name);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-3">
              <GridIcon size={14} />
              <span>Living Design v3.0 Primitives</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              Component Specimen Bench
            </h1>
            <p className="mt-2 text-sm text-[var(--sl-fg-muted,#8b93a1)]">
              Interactive sandbox for living components, accessible status quartet, and 24 custom Signal SVG icons.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}
              aria-label="Toggle theme"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] text-xs font-mono text-[var(--sl-fg,#ede6d8)] hover:bg-white/5 transition-micro"
            >
              {theme === "ink" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
              <span>{theme === "ink" ? "Ink Mode" : "Paper Mode"}</span>
            </button>
            <Link
              href="/visuals/brand-lab"
              className="px-3 py-1.5 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro"
            >
              Brand Lab →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Bench Grid */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* ========================================================================= */}
        {/* SECTION 1: 24 SIGNAL SVG ICONS SANDBOX */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Iconography</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
                24 Signal SVG Icons Sandbox
              </h2>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                24-unit viewbox, 1.6-unit stroke. Zero external dependencies. Self-contained SVGs.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Size: {iconSize}px</span>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={iconSize}
                  onChange={(e) => setIconSize(Number(e.target.value))}
                  className="w-24 accent-[var(--sl-gold,#c9a15c)] cursor-pointer"
                />
              </div>

              <div className="relative w-44">
                <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Filter icons..."
                  className="w-full rounded-md border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] pl-8 pr-2 py-1 text-xs text-[var(--sl-fg,#ede6d8)] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => copyIconCode(name)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)] hover:border-[var(--sl-gold,#c9a15c)] transition-std group relative"
              >
                <div className="mb-2 text-[var(--sl-fg,#ede6d8)] group-hover:text-[var(--sl-gold,#c9a15c)] transition-colors">
                  <Icon name={name} size={iconSize} />
                </div>
                <span className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] truncate max-w-full">
                  {name}
                </span>
                <span className="text-[9px] font-mono text-[var(--sl-gold,#c9a15c)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  {copiedIcon === name ? "Copied!" : "Copy JSX"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: STATUS BADGE QUARTET */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Telemetry</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
              StatusBadge (Dual-Encoded Accessible Semantics)
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Color-blind safe status representations adhering to WCAG standards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-3">
              <StatusBadge status="ok">Verified Stable</StatusBadge>
              <p className="text-xs text-slate-400">status=&quot;ok&quot; · glyph=&quot;●&quot; · #77F0BF</p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-3">
              <StatusBadge status="warn">Degraded / Stale</StatusBadge>
              <p className="text-xs text-slate-400">status=&quot;warn&quot; · glyph=&quot;▲&quot; · #E8C36A</p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-3">
              <StatusBadge status="breach">Security Breach</StatusBadge>
              <p className="text-xs text-slate-400">status=&quot;breach&quot; · glyph=&quot;■&quot; · #FF7B7B</p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-3">
              <StatusBadge status="unknown">Awaiting Verification</StatusBadge>
              <p className="text-xs text-slate-400">status=&quot;unknown&quot; · glyph=&quot;◆&quot; · #B7A2FF</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: APPROVAL CARD & HUMAN GATE */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Governance</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
              ApprovalCard (Doctrine 0 Human Gate)
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Interactive sovereign commit approval component. Agents stage; humans execute.
            </p>
          </div>

          <div className="max-w-2xl">
            <ApprovalCard
              title="Autonomous Release Execution Gate"
              scope="starlightintelligence.org / live deploy"
              risk="high"
              status={approvalStatus}
              onApprove={() => setApprovalStatus("approved")}
              onReject={() => setApprovalStatus("rejected")}
            >
              <p>
                Agent swarm has verified all 18 unit tests, validated zero TypeScript errors, and passed
                the 30-point independent visual quality gate. Operator signature is required to release to Cloudflare edge.
              </p>
              {approvalStatus !== "pending" && (
                <button
                  type="button"
                  onClick={() => setApprovalStatus("pending")}
                  className="mt-2 text-xs font-mono text-[var(--sl-gold,#c9a15c)] underline cursor-pointer"
                >
                  Reset Demo State
                </button>
              )}
            </ApprovalCard>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: AGENT PRESENCE & EVIDENCE DISCLOSURE */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Observability</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
              AgentPresence & EvidenceDisclosure
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Live status indicator with parametric sigil and collapsible cryptographic audit drawers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-4">
              <h3 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">AgentPresence Specimens</h3>
              <div className="flex flex-col gap-3">
                <AgentPresence agentId="prime" name="Prime" tier="Leadership" domain="Synthesis" status="online" />
                <AgentPresence agentId="queen" name="Queen" tier="Specialist" domain="Vision" status="busy" />
                <AgentPresence agentId="hermes" name="Hermes" tier="Specialist" domain="Search" status="idle" />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-4">
              <h3 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">EvidenceDisclosure Specimen</h3>
              <EvidenceDisclosure summary="Cryptographic Run Audit (SIP Layer 2 Attestation)">
                <div className="space-y-2">
                  <p>Attestation Hash: <code className="text-[var(--sl-gold,#c9a15c)]">sha256:83100e02da6f...</code></p>
                  <p>Gate: 30-Point Independent Rubric (Score: 29/30 Hero)</p>
                  <p>Reviewer: vis-independent-evaluator (cross-family)</p>
                  <p>Rights Status: generated-owned (first-party prompt receipt)</p>
                </div>
              </EvidenceDisclosure>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: GLASS SURFACE */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Materials</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
                GlassSurface (Clarity-as-Freshness)
              </h2>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
                Dynamic liquid glass responding to telemetry data staleness.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[var(--sl-surface-1,#0d1119)] border border-[var(--sl-border,rgba(237,230,216,0.14))] rounded-lg p-1 text-xs font-mono">
              {(["fresh", "normal", "stale", "breach"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFreshness(f)}
                  className={`px-3 py-1 rounded capitalize transition-micro ${
                    freshness === f ? "bg-[var(--sl-gold,#c9a15c)] text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <GlassSurface freshness={freshness} interactive className="p-8 text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[var(--sl-fg,#ede6d8)]">
              Interactive Specular Hairline
            </h3>
            <p className="mt-2 text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Move your mouse across this card to watch the physical light reflection.
              Current freshness mode: <span className="font-mono text-[var(--sl-gold,#c9a15c)]">{freshness}</span>.
            </p>
          </GlassSurface>
        </section>
      </main>
    </div>
  );
}

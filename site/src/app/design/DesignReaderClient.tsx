"use client";

import * as React from "react";
import Link from "next/link";
import {
  CodeIcon,
  DownloadIcon,
  CheckIcon,
  SparkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  GridIcon,
  ShieldIcon,
} from "@/components/icons";
import { GlassSurface, StatusBadge } from "@/components/system";

const YAML_SPEC = `---
version: "3.0"
name: Starlight Living Design Language
description: Living design language for Starlight surfaces. Celestial precision x warm human craft.
colors:
  primary: "#070A10"
  secondary: "#EFEDE7"
  tertiary: "#C9A15C"
  neutral: "#EDE6D8"
  surface: "#070A10"
  surface-paper: "#EFEDE7"
  surface-ivory: "#EDE6D8"
  surface-operator: "#0B0D12"
  on-surface: "#EDE6D8"
  on-paper: "#0E131B"
  accent: "#C9A15C"
  accent-bright: "#F0C87E"
  signal: "#82D8E6"
  signal-operator: "#73E6FF"
  glass-tint: "rgba(13, 17, 25, 0.58)"
  glass-tint-webgl: "rgba(7, 10, 16, 0.30)"
  glass-tint-paper: "rgba(247, 245, 240, 0.72)"
  glass-opaque: "#0D1119"
  hairline: "rgba(237, 230, 216, 0.12)"
  hairline-paper: "rgba(7, 10, 16, 0.14)"
  hairline-operator: "rgba(124, 146, 194, 0.18)"
  focus: "#F0C87E"
  status-ok: "#77F0BF"
  status-warn: "#E8C36A"
  status-breach: "#FF7B7B"
  status-unknown: "#B7A2FF"
typography:
  display:
    fontFamily: Instrument Sans
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Instrument Sans
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Instrument Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  accent-italic:
    fontFamily: Instrument Serif
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.2
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin: 32px
rounded:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 24px
  xl: 40px
  full: 9999px
---`;

export function DesignReaderClient() {
  const [viewMode, setViewMode] = React.useState<"doc" | "yaml">("doc");
  const [copied, setCopied] = React.useState(false);
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");

  const copyYaml = () => {
    navigator.clipboard.writeText(YAML_SPEC);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Top Banner / Nav */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-12">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-3">
              <SparkIcon size={13} />
              <span>Canonical Specification · @google/design.md v3.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              Starlight Living Design Language
            </h1>
            <p className="mt-2 text-sm text-[var(--sl-fg-muted,#8b93a1)]">
              Celestial Precision × Warm Human Craft. Machine-readable specification for the sovereign, abundant web.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode("doc")}
                className={`px-3 py-1 rounded-md transition-micro ${
                  viewMode === "doc" ? "bg-[var(--sl-gold,#c9a15c)] text-black font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Rendered Spec
              </button>
              <button
                type="button"
                onClick={() => setViewMode("yaml")}
                className={`px-3 py-1 rounded-md transition-micro ${
                  viewMode === "yaml" ? "bg-[var(--sl-gold,#c9a15c)] text-black font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                YAML Code
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] hover:bg-white/5 text-[var(--sl-fg,#ede6d8)] transition-micro"
            >
              {theme === "ink" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Spec Body */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {viewMode === "yaml" ? (
          <div className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-6 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">
                DESIGN.md v3.0 (YAML Frontmatter)
              </span>
              <button
                type="button"
                onClick={copyYaml}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold"
              >
                {copied ? <CheckIcon size={13} /> : <DownloadIcon size={13} />}
                <span>{copied ? "Copied Spec!" : "Copy YAML"}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto p-4 rounded bg-black/60">
              {YAML_SPEC}
            </pre>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Section 1 */}
            <section className="space-y-4">
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">§ 1. Philosophy & Metaphor</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)]">
                Celestial Precision × Warm Human Craft
              </h2>
              <p className="text-sm leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                Most AI interfaces in 2026 err toward either neon sci-fi distraction or sterile SaaS monotony.
                Starlight rejects both. The interface is conceived as an astronomical instrument crafted by
                human hands: dark celestial grounds, luminous ivory typography, warm gold human-gate accents,
                and crisp telemetry hairlines.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)]">
                  <h4 className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-1">Law 1: Four Contextual Modes</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Horizon, Operator, Academy, and Cultural surfaces share one underlying mathematical physics.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)]">
                  <h4 className="text-xs font-mono text-[var(--sl-companion,#82d8e6)] mb-1">Law 2: Clarity-as-Freshness</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Liquid glass encodes live telemetry freshness (crystal specular &lt;5m to desaturated amber &gt;24h).
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)]">
                  <h4 className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-1">Law 3: One Gold per Fold</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Starlight Gold is never wallpaper; it marks human approval seals and sovereign commitments.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">§ 2. Foundations & Palette</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)]">
                Color Architecture & Contrast Standards
              </h2>
              <p className="text-sm leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                All color tokens adhere strictly to WCAG AAA/AA contrast criteria. Dual-encoded Status Quartet ensures
                universal accessibility across light and dark canvas surfaces.
              </p>
              <div className="overflow-x-auto rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-white/10 bg-black/20 text-slate-400">
                    <tr>
                      <th className="p-3">Token</th>
                      <th className="p-3">Ink Mode</th>
                      <th className="p-3">Paper Mode</th>
                      <th className="p-3">Contrast Ratio</th>
                      <th className="p-3">Semantic Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[var(--sl-fg,#ede6d8)]">
                    <tr>
                      <td className="p-3 text-[var(--sl-gold,#c9a15c)]">--sl-bg</td>
                      <td className="p-3">#070A10</td>
                      <td className="p-3">#EFEDE7</td>
                      <td className="p-3 text-slate-400">Canvas ground</td>
                      <td className="p-3 text-slate-300">Base viewport layer</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[var(--sl-gold,#c9a15c)]">--sl-fg</td>
                      <td className="p-3">#EDE6D8</td>
                      <td className="p-3">#0E131B</td>
                      <td className="p-3 text-emerald-400 font-bold">14.9:1 / 15.2:1 (AAA)</td>
                      <td className="p-3 text-slate-300">Primary headline & body prose</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[var(--sl-gold,#c9a15c)]">--sl-gold</td>
                      <td className="p-3">#C9A15C</td>
                      <td className="p-3">#8A6522</td>
                      <td className="p-3 text-emerald-400 font-bold">8.82:1 (AA)</td>
                      <td className="p-3 text-slate-300">Human Gate approval & sovereignty</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[var(--sl-companion,#82d8e6)]">--sl-companion</td>
                      <td className="p-3">#82D8E6</td>
                      <td className="p-3">#16697A</td>
                      <td className="p-3 text-emerald-400 font-bold">9.4:1 (AA)</td>
                      <td className="p-3 text-slate-300">Active agent telemetry & links</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">§ 3. Materiality & The Glass Spectrum</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)]">
                Three Progressive Capability Tiers
              </h2>
              <p className="text-sm leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                Per <code className="text-xs font-mono">starlight.material_foundations.v1</code>, glass blur is capped at
                18px, with a maximum of 2 visible backdrop surfaces per viewport and strictly zero nested blur passes.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <GlassSurface tier="webgl" className="p-4 text-center">
                  <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">Tier 1: WebGL2</span>
                  <p className="text-xs text-slate-300">Physical refraction pass for capable desktop GPUs.</p>
                </GlassSurface>
                <GlassSurface tier="css" className="p-4 text-center">
                  <span className="text-xs font-mono text-[var(--sl-companion,#82d8e6)] block mb-1">Tier 2: CSS Lite</span>
                  <p className="text-xs text-slate-300">CSS backdrop-filter: blur(18px) for mobile & standard clients.</p>
                </GlassSurface>
                <GlassSurface tier="static" className="p-4 text-center">
                  <span className="text-xs font-mono text-slate-400 block mb-1">Tier 3: Static Fallback</span>
                  <p className="text-xs text-slate-300">High contrast matte surface for reduced-motion & battery savers.</p>
                </GlassSurface>
              </div>
            </section>

            {/* Section 4: Cross links */}
            <section className="pt-8 border-t border-[var(--sl-border,rgba(237,230,216,0.12))] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">Ready to test these components?</h4>
                <p className="text-xs text-slate-400">Launch the interactive specimen bench to inspect all 24 Signal SVG icons and UI cards.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/visuals/system"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold"
                >
                  <GridIcon size={14} />
                  <span>Component Bench</span>
                </Link>
                <Link
                  href="/visuals/brand-lab"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-xs text-[var(--sl-fg,#ede6d8)]"
                >
                  <span>Brand Lab Observatory →</span>
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

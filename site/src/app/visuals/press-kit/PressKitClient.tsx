"use client";

import * as React from "react";
import Link from "next/link";
import {
  DownloadIcon,
  CheckIcon,
  SparkIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  LinkIcon,
  GridIcon,
} from "@/components/icons";
import { StarlightMark } from "@/components/StarlightMark";

export function PressKitClient() {
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const primaryMarkSvg = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldStar" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#F0C87E"/>
      <stop offset="50%" stopColor="#C9A15C"/>
      <stop offset="100%" stopColor="#8A6522"/>
    </linearGradient>
  </defs>
  <path d="M50 5 C51 32 68 49 95 50 C68 51 51 68 50 95 C49 68 32 51 5 50 C32 49 49 32 50 5 Z" fill="url(#goldStar)"/>
  <circle cx="50" cy="50" r="7" fill="#FBF6EB"/>
  <circle cx="82" cy="22" r="5" fill="#82D8E6"/>
</svg>`;

  const protocolMarkSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12" cy="12" rx="9.6" ry="3.7" transform="rotate(-24 12 12)" stroke="#a78bfa" stroke-width="0.75"/>
  <circle cx="4.1" cy="15.9" r="1.05" fill="#22d3ee"/>
  <path d="M4 12 C8.6 11.5 10.6 11.2 12 11.2 C13.4 11.2 15.4 11.5 20 12 C15.4 12.5 13.4 12.8 12 12.8 C10.6 12.8 8.6 12.5 4 12 Z" fill="#f8fafc" opacity="0.85"/>
  <path d="M12 0.6 C12.75 6.9 13.1 9.6 14.6 12 C13.1 14.4 12.75 17.1 12 23.4 C11.25 17.1 10.9 14.4 9.4 12 C10.9 9.6 11.25 6.9 12 0.6 Z" fill="#f8fafc"/>
  <circle cx="12" cy="12" r="1.5" fill="#f8fafc"/>
</svg>`;

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-14">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-3">
              <SparkIcon size={14} />
              <span>Official Protocol Press & Media Kit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              Protocol Press & SVG Mark Kit
            </h1>
            <p className="mt-2 text-sm text-[var(--sl-fg-muted,#8b93a1)] max-w-2xl">
              Official vector marks, wordmarks, color tokens, and media guidelines for Starlight Intelligence Systems.
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
            <a
              href="https://starlightintelligence.ai/brand"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro flex items-center gap-1.5"
            >
              <span>Identity Master (.ai)</span>
              <LinkIcon size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">
        {/* Vector Marks Grid */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Vector Assets</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1">
              Official Vector Marks
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Scalable from 16px favicon territory to billboard display without loss of fidelity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mark 1 */}
            <div className="p-8 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] flex flex-col items-center text-center">
              <div className="h-40 flex items-center justify-center mb-6">
                <svg width="84" height="84" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M50 5 C51 32 68 49 95 50 C68 51 51 68 50 95 C49 68 32 51 5 50 C32 49 49 32 50 5 Z"
                    fill="url(#pressGoldStar)"
                  />
                  <circle cx="50" cy="50" r="7" fill="#FBF6EB" />
                  <circle cx="82" cy="22" r="5" fill="#82D8E6" />
                  <defs>
                    <linearGradient id="pressGoldStar" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F0C87E" />
                      <stop offset="50%" stopColor="#C9A15C" />
                      <stop offset="100%" stopColor="#8A6522" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">
                Primary Ecosystem Mark (Starlight Star)
              </h3>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] mt-1 mb-6">
                4-Point Star + Orbital Companion. Primary mark for Starlight apps, desktop nexus, and community kits.
              </p>

              <button
                type="button"
                onClick={() => copyToClipboard(primaryMarkSvg, "primarySvg")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro"
              >
                {copiedKey === "primarySvg" ? <CheckIcon size={14} /> : <DownloadIcon size={14} />}
                <span>{copiedKey === "primarySvg" ? "SVG Copied!" : "Copy Raw SVG"}</span>
              </button>
            </div>

            {/* Mark 2 */}
            <div className="p-8 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] flex flex-col items-center text-center">
              <div className="h-40 flex items-center justify-center mb-6">
                <StarlightMark size={64} />
              </div>

              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">
                Open Protocol Sigil (Telescope Orbit-Star)
              </h3>
              <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] mt-1 mb-6">
                Vertical telescope diffraction optics with tilted orbit. Official mark for Starlight Intelligence Protocol (SIP).
              </p>

              <button
                type="button"
                onClick={() => copyToClipboard(protocolMarkSvg, "protocolSvg")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro"
              >
                {copiedKey === "protocolSvg" ? <CheckIcon size={14} /> : <DownloadIcon size={14} />}
                <span>{copiedKey === "protocolSvg" ? "SVG Copied!" : "Copy Raw SVG"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Color Palette Specification */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Color Palette</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1">
              Brand Colors & Hex Values
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Night Ink", hex: "#070A10", rgb: "7, 10, 16", role: "Primary Void Canvas" },
              { name: "Warm Paper", hex: "#EFEDE7", rgb: "239, 237, 231", role: "Architectural Ground" },
              { name: "Starlight Gold", hex: "#C9A15C", rgb: "201, 161, 92", role: "Human Gate Seal" },
              { name: "Companion Cyan", hex: "#82D8E6", rgb: "130, 216, 230", role: "Agent Telemetry" },
              { name: "Warm Ivory", hex: "#EDE6D8", rgb: "237, 230, 216", role: "Headlines & Text" },
              { name: "Status OK", hex: "#77F0BF", rgb: "119, 240, 191", role: "Verified Gate" },
              { name: "Status Warning", hex: "#E8C36A", rgb: "232, 195, 106", role: "Stale / Degraded" },
              { name: "Status Breach", hex: "#FF7B7B", rgb: "255, 123, 123", role: "Security Breach" },
            ].map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.1))] bg-[var(--sl-surface-1,#0d1119)] flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-full rounded border border-white/10 mb-3" style={{ backgroundColor: c.hex }} />
                  <h4 className="text-xs font-semibold text-[var(--sl-fg,#ede6d8)]">{c.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.hex}</span>
                </div>
                <span className="text-[9px] font-mono text-[var(--sl-gold,#c9a15c)] mt-2">{c.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Media Guidelines & Clearspace */}
        <section className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-8">
          <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Usage Guidelines</span>
          <h2 className="text-xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1 mb-4">
            Clearspace, Scale & Integrity Standards
          </h2>

          <div className="space-y-4 text-xs text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed">
            <p>
              <strong>Clearspace:</strong> Maintain a minimum exclusion zone around the mark equal to the width of the central star core (1x diameter). No other logos, typography, or page borders should infringe upon this space.
            </p>
            <p>
              <strong>Minimum Scale:</strong> The primary mark should never be rendered smaller than 16px digital vector. For raster images, preserve 32px minimum to guarantee crisp optics.
            </p>
            <p>
              <strong>Anti-Slop Prohibitions:</strong> Do not apply drop shadows, 3D extrusions, or glowing neon halos. Do not rotate the 4-point star off its cardinal orientation. Do not recolor marks outside canonical gold, cyan, ivory, or monochrome values.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

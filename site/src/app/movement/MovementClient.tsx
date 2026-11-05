"use client";

import * as React from "react";
import Link from "next/link";
import {
  SparkIcon,
  ShieldIcon,
  CheckIcon,
  DownloadIcon,
  CodeIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  LinkIcon,
  OrbitIcon,
} from "@/components/icons";
import { StatusBadge, GlassSurface } from "@/components/system";
import sisReceipt from "@/lib/generated/sis-receipt.json";

export function MovementClient() {
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [pledged, setPledged] = React.useState(false);
  const [copiedBadge, setCopiedBadge] = React.useState(false);

  const copyBadgeCode = () => {
    const code = `[![Built on SIP](https://starlightintelligence.org/badge/latest)](https://starlightintelligence.org/verify)`;
    navigator.clipboard.writeText(code);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const sisSha = sisReceipt?.receipt?.profileSha256
    ? `sha256:${sisReceipt.receipt.profileSha256.slice(0, 12)}`
    : "sha256:acac2fd23be1";

  const directoryNodes = [
    {
      name: "Starlight Intelligence System",
      domain: "starlightintelligence.org",
      role: "Open Protocol, Vaults & Flagship Observatory",
      sha: sisSha,
      status: "Verified",
      verified: true,
    },
    {
      name: "Starlight Nexus",
      domain: "starlightintelligence.ai",
      role: "Identity Master & Autonomous Crew Desktop",
      sha: "sha256:f600351a92e1",
      status: "Example preview",
      verified: false,
    },
    {
      name: "FrankX Flagship",
      domain: "frankx.ai",
      role: "Systems Architecture, Creative Engine & Demand",
      sha: "sha256:c2c35d2738b6",
      status: "Example preview",
      verified: false,
    },
    {
      name: "Arcanea",
      domain: "arcanea.ai",
      role: "Creative Worlds, Ten Gates & Lore Canon",
      sha: "sha256:754bf99b1042",
      status: "Example preview",
      verified: false,
    },
    {
      name: "Starlight Academy",
      domain: "starlightintelligence.academy",
      role: "Quiet Workflow Studio & Constellation Lab",
      sha: "sha256:bc4eb09befcb",
      status: "Example preview",
      verified: false,
    },
    {
      name: "Starlight Command Center",
      domain: "starlight-command-center",
      role: "Operator Console, HUD Dock & Status Tokens",
      sha: "sha256:08fd0af317c2",
      status: "Example preview",
      verified: false,
    },
  ];

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-16">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-3">
              <SparkIcon size={13} />
              <span>The Open Movement · An Abundant Web</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] leading-[1.1]">
              The Open & Abundant Web
            </h1>
            <p className="mt-3 text-base text-[var(--sl-fg-muted,#8b93a1)] max-w-2xl leading-relaxed">
              Intelligence belongs to the builder. Memory stays sovereign on your vaults.
              Humans hold the gold seal over money and commitments. The web should feel crafted,
              legible, and alive — never extractive AI slop.
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
              className="px-3.5 py-1.5 rounded-lg bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold hover:opacity-90 transition-micro"
            >
              Brand Lab →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">
        {/* The 4 Pillars */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Founding Principles</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1">
              Four Pillars of Sovereign Creation
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-2">
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">Pillar 01</span>
              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">Sovereign Context & Memory</h3>
              <p className="text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                You own your JSONL logs, SQLite indexes, and vector embeddings. Memory lives in your files and vaults,
                never locked in proprietary vendor silos. Take the substrate; keep your keys.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-2">
              <span className="text-xs font-mono text-[var(--sl-companion,#82d8e6)]">Pillar 02</span>
              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">Doctrine 0: Human Gates</h3>
              <p className="text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                Ship autonomously; fail closed on money. Agents stage, audit, and prepare verifiable pull requests;
                named human operators hold the gold seal over billing, contracts, credentials, and live promotion.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-2">
              <span className="text-xs font-mono text-emerald-400">Pillar 03</span>
              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">Anti-Slop Craft Standards</h3>
              <p className="text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                Zero hallucinated text in images. Crisp HTML/SVG overlays. Contained WebGL focal stages.
                Respect the user&apos;s attention, eyesight, and battery. Every pixel earns its place.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-2">
              <span className="text-xs font-mono text-purple-400">Pillar 04</span>
              <h3 className="text-base font-semibold text-[var(--sl-fg,#ede6d8)]">Forkable Open Commons</h3>
              <p className="text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
                Open specifications (DESIGN.md v3.0, tokens.css, 24 Signal SVG icons) published under permissive
                open licenses so any indie creator, researcher, or developer can build world-class tools freely.
              </p>
            </div>
          </div>
        </section>

        {/* Built on SIP Network Directory */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Ecosystem Directory</span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1">
              Built on SIP Node Directory
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">
              Public nodes adopting Starlight Intelligence Protocol (SIP) attestation.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-black/20 text-[var(--sl-fg-muted,#8b93a1)]">
                <tr>
                  <th className="p-3">Ecosystem Node</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Attestation Hash</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[var(--sl-fg,#ede6d8)]">
                {directoryNodes.map((node) => (
                  <tr key={node.name} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-[var(--sl-fg,#ede6d8)]">{node.name}</td>
                    <td className="p-3 text-[var(--sl-companion,#82d8e6)]">{node.domain}</td>
                    <td className="p-3 text-[var(--sl-fg,#ede6d8)]">{node.role}</td>
                    <td className="p-3 text-[var(--sl-fg-muted,#8b93a1)] font-mono">{node.sha}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          node.verified
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* The Open Design Pledge */}
        <section className="rounded-2xl border border-[var(--sl-gold,#c9a15c)]/50 bg-[var(--sl-surface-1,#0d1119)] p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase text-[var(--sl-gold,#c9a15c)] block mb-1">
              The Builder&apos;s Commitment
            </span>
            <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mb-3">
              Take the Open & Abundant Web Pledge
            </h2>
            <p className="text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)] mb-6">
              &quot;I pledge to build software that is legible, sovereign, and crafted with genuine care.
              I will not ship unverified AI slop, fake telemetry, or extractive lock-ins.
              I will honor human agency, keep memories sovereign on builder vaults, and treat design
              as an instrument of human flourishing.&quot;
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setPledged(true)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold font-mono transition-std ${
                  pledged
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] hover:opacity-90"
                }`}
              >
                <CheckIcon size={15} />
                <span>{pledged ? "Acknowledged in This Session" : "Acknowledge Principles (Session Preview)"}</span>
              </button>

              <button
                type="button"
                onClick={copyBadgeCode}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-[var(--sl-fg,#ede6d8)] hover:text-white"
              >
                <CodeIcon size={14} />
                <span>{copiedBadge ? "Badge Copied!" : "Copy Built on SIP Badge"}</span>
              </button>
            </div>

            <p className="mt-4 text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)] leading-relaxed">
              Note: This button records in-session acknowledgement only. Persistent public attestation is earned by committing a signed SIP receipt (<code className="text-[var(--sl-gold,#c9a15c)]">Built on SIP</code>) and verifying at{" "}
              <Link href="/verify" className="underline hover:text-[var(--sl-fg,#ede6d8)]">
                /verify
              </Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

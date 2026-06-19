"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PromotionItem {
  id: string;
  sourceVault: string;
  targetVault: string;
  title: string;
  summary: string;
  confidence: number;
  tags: string[];
}

interface ContradictionItem {
  id: string;
  vaults: string[];
  conflict: string;
  description: string;
  resolutionOptions: string[];
}

const INITIAL_PROMOTIONS: PromotionItem[] = [
  {
    id: "promo-101",
    sourceVault: "operational",
    targetVault: "wisdom",
    title: "Double-Entry Memory Architecture",
    summary: "Standardize plain Markdown + Event-Sourced JSONL ledgers for all local-first agent sessions to protect against database failures.",
    confidence: 0.96,
    tags: ["architecture", "memory", "ledger"],
  },
  {
    id: "promo-102",
    sourceVault: "technical",
    targetVault: "wisdom",
    title: "Surgical Code Editing Constraint",
    summary: "Restricting LLMs to single contiguous edits via replace_file_content is 3.5x more reliable than rewrite-first approaches.",
    confidence: 0.94,
    tags: ["hygiene", "coding", "guardrails"],
  },
  {
    id: "promo-103",
    sourceVault: "creative",
    targetVault: "strategic",
    title: "Liquid Glass Specular aesthetics",
    summary: "Visual dashboards should employ motion-driven light highlights over dark #060609 base layers rather than flat colored cards.",
    confidence: 0.88,
    tags: ["ui-ux", "branding", "aesthetics"],
  },
];

const INITIAL_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: "contra-201",
    vaults: ["technical-vault", "operational-vault"],
    conflict: "Model Routing Strategy",
    description: "Technical Vault recommends routing all reasoning tasks to Claude Opus; Operational Vault shows 84% speed improvements using dynamic Flash-to-Sonnet routing.",
    resolutionOptions: [
      "Keep dynamic Flash-to-Sonnet routing as default (Operational)",
      "Enforce Opus-first routing rules for safety (Technical)",
      "Merge: Flash-first with Opus fallback for complex reasoning steps",
    ],
  },
];

export default function EchoPage() {
  const [promotions, setPromotions] = useState<PromotionItem[]>(INITIAL_PROMOTIONS);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>(INITIAL_CONTRADICTIONS);
  const [activeTab, setActiveTab] = useState<"promotions" | "contradictions" | "health">("promotions");
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    alert(`Promotion ${id} approved and written to destination vault.`);
  };

  const handleReject = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResolve = (id: string, optionIndex: number) => {
    setContradictions((prev) => prev.filter((c) => c.id !== id));
    alert(`Contradiction resolved using option: "${optionIndex}"`);
  };

  const triggerIngest = () => {
    setIngestStatus("scanning");
    setTimeout(() => {
      setIngestStatus("success");
      setTimeout(() => setIngestStatus(null), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#060609] pb-24 pt-8 text-[#e2e8f0]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[3px] text-white/50">
          <Link href="/" className="hover:text-white transition">Starlight</Link>
          <span>/</span>
          <Link href="/queen" className="hover:text-white transition">Queen Swarms</Link>
          <span>/</span>
          <span className="text-white/80">Echo Portal</span>
        </div>

        {/* Header Section */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-0.5 text-[10px] tracking-[2px] text-violet-400 mb-3">
              COGNITIVE REFLECTION &amp; DISTILLATION
            </div>
            <h1 className="text-5xl font-semibold tracking-tighter text-white">Starlight Echo</h1>
            <p className="mt-3 max-w-xl text-lg text-white/70">
              The human-in-the-loop portal. Distill background dreaming traces into permanent vault principles, resolve conflicts, and govern memory health.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={triggerIngest}
              disabled={ingestStatus === "scanning"}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold tracking-widest uppercase text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              {ingestStatus === "scanning" ? (
                <>
                  <span className="h-2 w-2 animate-ping rounded-full bg-violet-400"></span>
                  Scanning folders...
                </>
              ) : ingestStatus === "success" ? (
                "Ingest Complete ✓"
              ) : (
                "Trigger Ingest Simulation"
              )}
            </button>
          </div>
        </div>

        {/* Alignment & Strategy Banner (Local-First Static Mode) */}
        <div className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 text-violet-300 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-sm font-medium">
              Starlight Echo Static Template Active — Rendered via GitHub &amp; Vercel deployment pipeline. Zero local ports required.
            </span>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Navigation and Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl">
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("promotions")}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium tracking-tight transition ${
                    activeTab === "promotions"
                      ? "bg-violet-400/10 text-violet-300 border border-violet-400/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>Promotions Queue</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/75">
                    {promotions.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("contradictions")}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium tracking-tight transition ${
                    activeTab === "contradictions"
                      ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>Contradictions</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/75">
                    {contradictions.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("health")}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium tracking-tight transition ${
                    activeTab === "health"
                      ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>Substrate Health</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              </nav>
            </div>

            {/* Quick Metrics */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[2px] text-white/40 mb-4">Live Telemetry</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/55">Memory Health Index</div>
                  <div className="text-2xl font-semibold text-emerald-400">98.4%</div>
                </div>
                <div>
                  <div className="text-xs text-white/55">RRF Unification Precision</div>
                  <div className="text-2xl font-semibold text-cyan-300">+61% <span className="text-[10px] text-white/40">vs lexical</span></div>
                </div>
                <div>
                  <div className="text-xs text-white/55">Total Active Vault Atoms</div>
                  <div className="text-2xl font-semibold text-white">1,842</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Interface */}
          <div className="lg:col-span-3">
            {activeTab === "promotions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Pending Vault Promotions</h2>
                  <div className="text-xs text-white/55">Requires human signature</div>
                </div>

                {promotions.length === 0 ? (
                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center text-white/40">
                    No pending promotions. Your cognitive vaults are consolidated and in sync.
                  </div>
                ) : (
                  promotions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-white/5 bg-white/[0.01] p-6 hover:border-white/10 transition relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase text-white/60">
                          {item.sourceVault} &rarr; {item.targetVault}
                        </span>
                        <span className="text-[10px] text-violet-400 font-mono">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/70 mb-4 leading-relaxed">{item.summary}</p>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-1.5">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-[10px] text-white/40 bg-white/[0.02] border border-white/5 px-2.5 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(item.id)}
                            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/5 transition"
                          >
                            Discard
                          </button>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="rounded-xl bg-violet-500 text-[#060609] px-4 py-2 text-xs font-semibold hover:bg-violet-400 transition"
                          >
                            Approve Promotion
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "contradictions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Vault Contradictions</h2>
                  <div className="text-xs text-white/55">Emergency resolution required</div>
                </div>

                {contradictions.length === 0 ? (
                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center text-white/40">
                    No vault contradictions found.
                  </div>
                ) : (
                  contradictions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.01] p-6 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {item.vaults.map((v) => (
                          <span key={v} className="rounded-md bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 text-[10px] font-mono uppercase text-cyan-300">
                            {v}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-medium text-white mb-2">{item.conflict}</h3>
                      <p className="text-sm text-white/70 mb-5 leading-relaxed">{item.description}</p>

                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Resolution Options</div>
                        {item.resolutionOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleResolve(item.id, index)}
                            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs hover:border-cyan-400/35 hover:bg-cyan-400/5 transition flex justify-between items-center"
                          >
                            <span>{option}</span>
                            <span className="text-cyan-400/80 font-mono font-bold">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "health" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Substrate Memory Health</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-5">
                    <div className="text-sm font-medium text-white/80 mb-2">Weekly Consolidation Check</div>
                    <div className="text-xs text-white/60 leading-relaxed mb-4">
                      Memory consolidation must run once every 7 days. Stale consolidation delays search and creates context fragmentation.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-semibold text-emerald-400">Consolidated 1 day ago (Healthy)</span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-5">
                    <div className="text-sm font-medium text-white/80 mb-2">Memory Redaction Gateway</div>
                    <div className="text-xs text-white/60 leading-relaxed mb-4">
                      All outbound agent telemetry is sanitized by the Privacy Guardian first to prevent leakages of private credentials.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-semibold text-emerald-400">Guardian Online (Healthy)</span>
                    </div>
                  </div>
                </div>

                {/* Substrate metrics details */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-6">
                  <div className="text-sm font-medium text-white mb-4">Vault Health Scorecard</div>
                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Strategic Vault</span>
                      <span className="text-white">92 entries · 0 stale loops · OK</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Technical Vault</span>
                      <span className="text-white">144 entries · OK</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Creative Vault</span>
                      <span className="text-white">41 entries · OK</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Operational Vault</span>
                      <span className="text-white">219 entries · 3 archived (decay sweep) · OK</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Wisdom Vault</span>
                      <span className="text-white">12 principles · OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Horizon Vault</span>
                      <span className="text-white">5 letters · OK</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

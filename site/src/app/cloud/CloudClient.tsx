"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Database,
  Shield,
  Zap,
  Lock,
  Cpu,
  Server,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  Terminal,
} from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  cadenceUnit: string;
  badge?: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

const PLANS: PlanTier[] = [
  {
    id: "sovereign",
    name: "Sovereign Local",
    monthlyPrice: 0,
    annualPrice: 0,
    cadenceUnit: "Free forever",
    description:
      "Full open-source substrate running entirely on your machine. Your private memory never leaves your hardware.",
    features: [
      "All 6 semantic memory vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon)",
      "Local hybrid SQLite FTS5 index & fast full-text vector search",
      "Universal Knowledge Tree with 40+ pre-seeded epistemic axioms",
      "Starlight Queen meta-orchestrator & Santa adversarial review loop",
      "10 harness presets (Claude Code, Cursor, Codex, Grok, Antigravity)",
      "Standard Starlight MCP server & local CLI",
      "BYOK (Bring Your Own Key) directly to model providers",
    ],
    ctaLabel: "Download source",
    ctaHref: "https://github.com/frankxai/Starlight-Intelligence-System",
  },
  {
    id: "pro",
    name: "Pro Cloud",
    monthlyPrice: 29,
    annualPrice: 23,
    cadenceUnit: "per month",
    badge: "Most popular",
    highlighted: true,
    description:
      "Automated encrypted cloud backups, seamless cross-device synchronization, and pooled frontier LLM routing.",
    features: [
      "Everything in Sovereign Local",
      "3 Free Verified Inclusions: Secret Detector, Multi-Agent Coordination, Memory Vault Management",
      "Edge Semantic Memory Mirror (Cloudflare D1 & Vectorize) for sub-10ms lookup",
      "Universal Twin Everywhere: Real-time reality.md sync across Cursor, Claude Code, Codex, Antigravity",
      "Queen Swarm Autopilot: Adaptive memory lanes (<1.8GB, 1.8-4.0GB, >=4.0GB) & auto git checkpoints",
      "Smart Semantic Cache: Up to 40%–60% token savings across 10 developer harnesses",
      "Zero-knowledge client-side encrypted vault & knowledge tree backups",
      "Priority marketplace access & 10% discount on community skill packs",
    ],
    ctaLabel: "Get started with Pro",
    ctaHref: "/checkout?tier=pro",
  },
  {
    id: "team",
    name: "Team Studio",
    monthlyPrice: 99,
    annualPrice: 79,
    cadenceUnit: "5 seats included",
    badge: "Studio squads",
    description:
      "Shared company memory vaults, role-based access control, brand twin locks, and internal skill publishing.",
    features: [
      "Everything in Pro Cloud (5 seats included, +$20/seat)",
      "Shared Team Memory Vaults with role-based access control (RBAC)",
      "Brand & Voice Twin Lock (starlight.you) enforcing brand invariants across all team agents",
      "Team Operator Lab passes & competency scorecards on starlightintelligence.academy",
      "Private internal skill & harness pack repository",
      "Distributed Queen multi-agent coordinator & shared workspace telemetry",
    ],
    ctaLabel: "Get started with Team",
    ctaHref: "/checkout?tier=team",
  },
  {
    id: "enterprise",
    name: "Enterprise Mesh",
    monthlyPrice: 199,
    annualPrice: 159,
    cadenceUnit: "per seat / mo",
    badge: "Dedicated fleet",
    description:
      "High-concurrency PostgreSQL pgvector clusters, automated GitHub PR review bots, and compliance audit trails.",
    features: [
      "Everything in Team Studio",
      "Dedicated PostgreSQL pgvector cluster with multi-tenant workspace isolation",
      "Automated Santa review bot running on GitHub PRs and CI/CD pipelines",
      "Bi-temporal audit trails, cryptographic event ledgers & GDPR/SOC2 compliance exports",
      "Custom domain vertical stack orchestration (Sound, People, Energy, Finance)",
      "Private MCP server mesh routing with role-based permission boundaries",
      "Dedicated SLA & 1-on-1 architecture design review",
    ],
    ctaLabel: "Get started with Enterprise",
    ctaHref: "/checkout?tier=enterprise",
  },
];

const STORAGE_OPTIONS = [
  {
    id: "sqlite",
    name: "Local SQLite + JSONL",
    latency: "< 1 ms",
    sovereignty: "100% Local air-gapped",
    scale: "Solo builder (1–5 agents)",
    recommendedTier: "Sovereign Local",
    desc: "Zero-dependency append-only JSONL event logs with in-process SQLite FTS5 index. Perfect for sovereign workstations.",
  },
  {
    id: "cloudflare",
    name: "Cloudflare D1 & Vectorize",
    latency: "< 10 ms",
    sovereignty: "Zero-knowledge edge cache",
    scale: "Multi-device (5–20 agents)",
    recommendedTier: "Pro Cloud",
    desc: "Globally distributed SQLite shadow database running on Cloudflare Workers edge. Instant cross-device synchronization.",
  },
  {
    id: "postgres",
    name: "PostgreSQL + pgvector",
    latency: "< 25 ms",
    sovereignty: "Dedicated tenant isolation",
    scale: "Enterprise fleet (20–100+ agents)",
    recommendedTier: "Enterprise Mesh",
    desc: "ACID-compliant relational database with pgvector HNSW indexing, connection pooling, and bi-temporal audit tables.",
  },
  {
    id: "mem0",
    name: "Mem0 & Hindsight Graph",
    latency: "< 50 ms",
    sovereignty: "Associative memory graph",
    scale: "Complex reasoning swarms",
    recommendedTier: "Pro / Enterprise",
    desc: "High-order knowledge graph topology for long-horizon entity recall and associative inference loops.",
  },
];

export function CloudClient() {
  const searchParams = useSearchParams();
  const sessionStatus = searchParams.get("session");

  const [annualBilling, setAnnualBilling] = useState(false);
  const [fleetSize, setFleetSize] = useState(5);
  const [selectedStorage, setSelectedStorage] = useState("sqlite");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estimatedTokens = fleetSize * 450; // k tokens/day
  const estimatedSnapshots = fleetSize * 24; // snapshots/day

  const handleSelectPlan = async (plan: PlanTier) => {
    if (plan.id === "sovereign") {
      window.open(plan.ctaHref, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      setError(null);

      const res = await fetch("/api/cloud/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: plan.id,
          annualBilling,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Failed to initialize checkout session");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout error occurred");
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-16">
      {/* Session Success or Cancel Notification */}
      {sessionStatus === "success" && (
        <div className="rounded-2xl border border-cyan-400/40 bg-cyan-950/20 p-6 shadow-[0_0_50px_rgba(6,182,212,0.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Managed Cloud Subscription Active</h4>
                <p className="mt-0.5 text-xs text-slate-300">
                  Your cryptographic license is active. Run{" "}
                  <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-cyan-300">
                    starlight cloud sync
                  </code>{" "}
                  in your terminal to start synchronizing with the Cloudflare edge mesh.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 font-mono text-xs text-emerald-300 ring-1 ring-emerald-400/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Edge Mesh Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {sessionStatus === "cancelled" && (
        <div className="rounded-xl border border-white/[0.1] bg-[#0c0c16] p-4 text-xs text-slate-400">
          Checkout was cancelled. Your local sovereign vaults remain unaffected.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Billing Cadence Toggle */}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="flex items-center rounded-full border border-white/[0.1] bg-[#0c0c16] p-1">
          <button
            onClick={() => setAnnualBilling(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              !annualBilling ? "bg-white text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setAnnualBilling(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
              annualBilling ? "bg-cyan-400 text-black font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Annual billing</span>
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-black">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;
          const displayPrice = plan.monthlyPrice === 0 ? "$0" : `$${price}`;
          const isCurrentLoading = loadingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between border p-8 backdrop-blur-xl transition ${
                plan.highlighted
                  ? "border-cyan-400/40 bg-[#0d0d1a] shadow-[0_0_50px_rgba(6,182,212,0.12)]"
                  : "border-white/[0.08] bg-[#090910]/80"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-8 rounded-full bg-cyan-400 px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-xl font-medium text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-white">{displayPrice}</span>
                  <span className="text-xs text-slate-400">
                    {plan.monthlyPrice === 0 ? plan.cadenceUnit : `/${plan.cadenceUnit}`}
                  </span>
                </div>
                {annualBilling && plan.monthlyPrice > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-cyan-300">
                    Billed annually (${price * 12}/yr)
                  </p>
                )}
                <p className="mt-4 text-sm text-slate-300">{plan.description}</p>

                <div className="mt-6 border-t border-white/[0.06] pt-6">
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Included capabilities:</p>
                  <ul className="mt-3 space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-white/[0.06] pt-6">
                {plan.id === "sovereign" ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/[0.14] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.05]"
                  >
                    {plan.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlanId !== null}
                    className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
                      plan.highlighted
                        ? "bg-white text-black hover:bg-cyan-50"
                        : "border border-white/[0.14] text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {isCurrentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initializing Checkout...</span>
                      </>
                    ) : (
                      <>
                        {plan.ctaLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Fleet Sizer & Velocity Calculator */}
      <div className="rounded-2xl border border-white/[0.10] bg-[#0b0b14]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-300">Capacity planner</span>
            <h3 className="mt-1 text-2xl font-semibold text-white">Interactive Fleet Sizer</h3>
            <p className="mt-1 text-xs text-slate-400">
              Estimate token throughput and encrypted backup snapshot frequency based on your active agent fleet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-cyan-300">{fleetSize}</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">Active Agents</span>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="range"
            min="1"
            max="50"
            value={fleetSize}
            onChange={(e) => setFleetSize(parseInt(e.target.value, 10))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/[0.1] accent-cyan-400"
          />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500">
            <span>1 Solo Agent</span>
            <span>15 Council Swarm</span>
            <span>30 Vertical Fleet</span>
            <span>50 Enterprise Mesh</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Estimated Daily Tokens</p>
            <p className="mt-1 text-2xl font-bold text-white">~{estimatedTokens.toLocaleString()}k</p>
            <p className="mt-1 text-[11px] text-slate-400">Routed via Vercel AI SDK frontier model pool</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Backup Snapshots</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{estimatedSnapshots} / day</p>
            <p className="mt-1 text-[11px] text-slate-400">Client-side zero-knowledge encrypted</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Recommended Plan</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">
              {fleetSize <= 3 ? "Sovereign ($0)" : fleetSize <= 15 ? "Pro Cloud ($29)" : "Enterprise ($199)"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Optimized for reliability & latency</p>
          </div>
        </div>
      </div>

      {/* Pluggable Database & Storage Matrix */}
      <div className="rounded-2xl border border-white/[0.10] bg-[#0c0c16]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-300">Storage substrate</span>
          <h3 className="mt-1 text-2xl font-semibold text-white">Pluggable Database & Memory Matrix</h3>
          <p className="mt-2 text-sm text-slate-400">
            Starlight lets you choose the storage backend that fits your operational needs. Select a backend to review its properties:
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {STORAGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedStorage(opt.id)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                selectedStorage === opt.id
                  ? "border-cyan-400/50 bg-cyan-400/[0.08]"
                  : "border-white/[0.06] bg-[#08080f] hover:border-white/[0.15]"
              }`}
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-400">{opt.recommendedTier}</p>
                <h4 className="mt-1 text-sm font-semibold text-white">{opt.name}</h4>
              </div>
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <span className="font-mono text-xs text-cyan-300">Latency: {opt.latency}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Storage Highlight */}
        {(() => {
          const current = STORAGE_OPTIONS.find((o) => o.id === selectedStorage) ?? STORAGE_OPTIONS[0];
          return (
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#07070e] p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h4 className="text-lg font-medium text-white">{current.name}</h4>
                <span className="font-mono text-xs text-emerald-400">Sovereignty: {current.sovereignty}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{current.desc}</p>
              <div className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4 font-mono text-xs text-slate-400">
                <span>
                  Target Latency: <strong className="text-white">{current.latency}</strong>
                </span>
                <span>•</span>
                <span>
                  Fleet Scale: <strong className="text-white">{current.scale}</strong>
                </span>
                <span>•</span>
                <span>
                  Recommended Tier: <strong className="text-cyan-300">{current.recommendedTier}</strong>
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Cloud,
  Shield,
  Zap,
  Lock,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
  Server,
  Sparkles,
  GitBranch,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import { GITHUB_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Starlight Cloud — Sovereign Managed Intelligence",
  description:
    "Encrypted vault backups, global edge sync, and pooled frontier model routing via Vercel AI SDK for builders who want cloud power without sacrificing local sovereignty.",
  alternates: {
    canonical: "/cloud",
  },
  openGraph: {
    title: "Starlight Cloud — Sovereign Managed Intelligence",
    description:
      "Encrypted vault backups, global edge sync, and pooled frontier model routing via Vercel AI SDK for builders who want cloud power without sacrificing local sovereignty.",
    type: "website",
    url: "/cloud",
  },
};

interface PlanTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
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
    price: "$0",
    cadence: "Free forever",
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
    ctaHref: "/download",
  },
  {
    id: "pro",
    name: "Pro Cloud",
    price: "$29",
    cadence: "per month",
    badge: "Most popular",
    highlighted: true,
    description:
      "Automated encrypted cloud backups, seamless cross-device synchronization, and pooled frontier LLM routing.",
    features: [
      "Everything in Sovereign Local",
      "Zero-knowledge client-side encrypted vault & knowledge tree backups",
      "Multi-device peer-to-peer sync relay across laptops, workstations & servers",
      "Frontier LLM API credit pooling via Vercel AI SDK (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro)",
      "Cloudflare D1 & Vectorize edge database connector for sub-10ms global query caching",
      "Hosted web cockpit telemetry & token velocity monitoring",
      "Priority community support & early access to new skill packs",
    ],
    ctaLabel: "Get started with Pro",
    ctaHref: "#pricing-contact",
  },
  {
    id: "enterprise",
    name: "Enterprise Mesh",
    price: "$199",
    cadence: "per month / seat",
    badge: "Dedicated fleet",
    description:
      "High-concurrency PostgreSQL pgvector clusters, automated GitHub PR review bots, and compliance audit trails.",
    features: [
      "Everything in Pro Cloud",
      "Dedicated PostgreSQL pgvector cluster with multi-tenant workspace isolation",
      "Automated Santa review bot running on GitHub PRs and CI/CD pipelines",
      "Bi-temporal audit trails, cryptographic event ledgers & GDPR/SOC2 compliance exports",
      "Custom domain vertical stack orchestration (Sound, People, Energy, Finance)",
      "Private MCP server mesh routing with role-based permission boundaries",
      "Dedicated SLA & 1-on-1 architecture design review",
    ],
    ctaLabel: "Contact architecture team",
    ctaHref: "#pricing-contact",
  },
];

export default function CloudPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060609] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <GalaxyField still="nursery" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_20%_75%,rgba(6,182,212,0.10),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300">
              Managed substrate · sovereign cloud
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-7xl">
              Starlight Cloud
            </h1>
            <p className="mt-7 text-lg leading-8 text-slate-300 md:text-xl">
              The power of cloud backups, global edge synchronization, and pooled frontier model inference—without
              surrendering data sovereignty. Your keys, your client-side encryption, your choice of database.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition hover:bg-cyan-50"
              >
                View subscription plans
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/marketplace"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.05]"
              >
                Browse marketplace
                <Layers className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="relative border-b border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-300">Modern edge stack</span>
            <h2 className="mt-2 text-3xl font-semibold text-white">Engineered for autonomy &amp; privacy</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Starlight Cloud pairs sovereign local runtime with high-throughput modern infrastructure.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">Vercel AI SDK &amp; Fluid Compute</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Single unified API key for Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, and Grok. Automatic fallback, streaming tool calls, and usage telemetry.
              </p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">Cloudflare Edge &amp; Vectorize</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sub-10ms global memory sync across all your developer devices. Append-only event stream replication with zero conflict resolution bottlenecks.
              </p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">Zero-Knowledge Vault Encryption</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Vault snapshots are encrypted locally using AES-256-GCM before transport. Starlight Cloud servers never see your plaintext thoughts, code, or memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-300">Transparent pricing</span>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Choose your substrate footprint</h2>
            <p className="mt-3 text-sm text-slate-400">
              Start sovereign and free. Scale to managed sync and fleet mesh when your operations require it.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => (
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
                    <span className="text-4xl font-semibold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">/{plan.cadence}</span>
                  </div>
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
                  <a
                    href={plan.ctaHref}
                    className={`inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                      plan.highlighted
                        ? "bg-white text-black hover:bg-cyan-50"
                        : "border border-white/[0.14] text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {plan.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div id="pricing-contact" className="mt-16 border border-white/[0.08] bg-[#0b0b14]/70 p-8 text-center backdrop-blur-xl">
            <h3 className="text-xl font-medium text-white">Need custom enterprise deployment or air-gapped on-premise mesh?</h3>
            <p className="mt-2 text-sm text-slate-400">
              We provide custom installation for sovereign sovereign-cloud enclaves, defense-grade air gaps, and dedicated team onboarding.
            </p>
            <div className="mt-5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-6 py-2.5 text-xs font-medium text-white hover:bg-white/[0.05]"
              >
                Inquire on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

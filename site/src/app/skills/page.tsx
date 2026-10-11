import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Calculator,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  Workflow,
  BookOpen,
  DollarSign,
  Gauge,
} from "lucide-react";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import { GITHUB_URL } from "@/lib/nav";
import { SkillsClient } from "./SkillsClient";

export const metadata: Metadata = {
  title: "Skill Economy & Studio — Starlight Intelligence",
  description:
    "Empirically value, balance context headroom, compile for 10 developer harnesses, and syndicate agent skills with SIP v1.1.1 cryptographic attestation.",
  alternates: {
    canonical: "/skills",
  },
  openGraph: {
    title: "Starlight Skill Economy & Studio — Starlight Intelligence",
    description:
      "Empirically value, balance context headroom, compile for 10 developer harnesses, and syndicate agent skills with SIP v1.1.1 cryptographic attestation.",
    type: "website",
    url: "/skills",
  },
};

export default function SkillsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060609] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <GalaxyField still="deepField" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_18%_68%,rgba(6,182,212,0.12),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-400">
              Sovereign capability substrate · skill economy
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-7xl">
              Starlight Skill Economy &amp; Studio
            </h1>
            <p className="mt-7 text-lg leading-8 text-slate-300 md:text-xl">
              Author, audit, empirically value, compile for 10 developer harnesses, and syndicate autonomous skills.
              Enforce progressive disclosure and dynamic context headroom across multi-agent swarms.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#studio"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Launch Skill Studio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/marketplace"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.05]"
              >
                Browse Marketplace Packs
                <Workflow className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl rounded-xl">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Agent fleet</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">150 Agents</p>
              <p className="mt-1 text-xs text-slate-400">Orchestrator, Prime, Architect, Sentinel &amp; 146 specialists.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl rounded-xl">
              <div className="flex items-center gap-3">
                <Code2 className="h-5 w-5 text-cyan-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Skill rules</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">88 Rules</p>
              <p className="mt-1 text-xs text-slate-400">Auto-activated capabilities across 17 intelligence verticals.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl rounded-xl">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-amber-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Harness support</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">10 Systems</p>
              <p className="mt-1 text-xs text-slate-400">Claude Code, Codex, Antigravity, Grok, Hermes, Cursor &amp; more.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl rounded-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Attestation</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">SIP v1.1.1</p>
              <p className="mt-1 text-xs text-slate-400">Immutable SHA-256 integrity digests stamped on export.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Studio */}
      <section id="studio" className="relative px-6 py-20 max-w-6xl mx-auto">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
            Interactive Workbench
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Skill Economy &amp; Harness Studio
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Calculate empirical market value, generate native configuration syntax for 10 developer harnesses,
            and monitor dynamic reasoning headroom across your agent fleet.
          </p>
        </div>

        <SkillsClient />
      </section>

      {/* Builder Documentation Callout */}
      <section className="relative border-t border-white/[0.08] px-6 py-16 bg-black/40">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to Author &amp; Sell Sovereign Skills?</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Read our comprehensive Developer &amp; Builder Guide covering 3-level progressive disclosure,
              the 5-stage maturation continuum, and multi-marketplace distribution.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`${GITHUB_URL}/blob/main/docs/skills/BUILDER_GUIDE.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/10"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Builder Guide
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link
              href={`${GITHUB_URL}/blob/main/SKILLS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all"
            >
              SKILLS.md Standard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

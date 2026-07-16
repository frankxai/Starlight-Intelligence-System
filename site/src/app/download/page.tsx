import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BrainHero } from "@/components/BrainHero";
import {
  Brain,
  Download,
  Terminal as TerminalIcon,
  ShieldCheck,
  Coins,
  Cpu,
  Workflow,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Settings,
  Eye,
  FileText
} from "lucide-react";
import {
  SIP_STARTER_ASSET_BASE,
  SIP_STARTER_DOWNLOADS,
  SIP_STARTER_INCLUDED,
  SIP_STARTER_MODULE_NAME,
  SIP_STARTER_RELEASE_URL,
  SIP_STARTER_TAG,
} from "@/lib/sip-download";
import {
  PLUGIN_MODULES_ASSET_BASE,
  PLUGIN_MODULES_DOWNLOADS,
  PLUGIN_MODULES_MODULE_NAME,
  PLUGIN_MODULES_PLUGINS,
  PLUGIN_MODULES_SHA256,
  PLUGIN_MODULES_TAG,
  PLUGIN_PRODUCT_KITS,
  PLUGIN_STARTER_ASSET_BASE,
  PLUGIN_STARTER_DOWNLOADS,
  PLUGIN_STARTER_MODULE_NAME,
  PLUGIN_STARTER_PLUGINS,
  PLUGIN_STARTER_SHA256,
  PLUGIN_STARTER_TAG,
} from "@/lib/plugin-starter-download";

export const metadata: Metadata = {
  title: "Download - Starlight Intelligence",
  description:
    "Download open-core Starlight modules: the SIP Starter, public Codex plugins, books, and software agent packs with release checksums.",
  openGraph: {
    title: "Download — Starlight Intelligence",
    description:
      "Open-core SIP Starter release package for adopting Starlight Intelligence Protocol in any repo or workspace.",
    type: "article",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Starlight Intelligence — Download",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download — Starlight Intelligence",
    description:
      "Download the open-core SIP Starter with checksums and validation guidance.",
    images: ["/opengraph-image"],
  },
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* 1. Header Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-b from-[#080812] to-[#020205] py-20 md:py-28">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.06),transparent_50%)]" />
        <BrainHero className="pointer-events-none absolute right-[-80px] top-8 hidden h-[440px] w-[440px] opacity-25 lg:block" />
        
        <div className="relative mx-auto max-w-5xl px-6">
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Starlight Core Releases
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
            Sovereign Code.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Engineered for Autonomy.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.8] text-slate-400">
            Adopt the Starlight Intelligence Protocol starter, plugin wrapper kits, books, and domain intelligence packs. Start building high-retention cognitive agents.
          </p>
        </div>
      </section>

      {/* 2. Flagship Core Downloads (Bento Grid Section) */}
      <section className="relative px-6 py-20 border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">01 / Foundation</p>
            <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">Core Protocol & SDKs</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Card 1: SIP Starter */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090911]/60 backdrop-blur-md transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.08)]">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 border-b border-white/[0.04]">
                <Image
                  src="/assets/visuals/sip_starter_cover.png"
                  alt="SIP Starter Cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090911] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono rounded-full uppercase">
                  SIP Core • {SIP_STARTER_TAG}
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">SIP Starter Package</h3>
                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                  The foundational Starlight Intelligence Protocol starter. Contains core schemas, Obsidian vault templates, release manifest, and local installation scripts.
                </p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] text-slate-500 font-mono">License: MIT</span>
                  <div className="flex gap-x-2">
                    <a
                      href={`${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.zip`}
                      className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-cyan-100 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Get ZIP
                    </a>
                    <a
                      href={SIP_STARTER_RELEASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-x-1.5 rounded-full border border-white/[0.12] px-4 py-2 text-[12px] font-medium text-white hover:bg-white/[0.04] transition-all"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                      Release
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Codex Plugin Starter */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090911]/60 backdrop-blur-md transition-all hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(167,139,250,0.08)]">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 border-b border-white/[0.04]">
                <Image
                  src="/assets/visuals/codex_starter_cover.png"
                  alt="Codex Plugin Starter Cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090911] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono rounded-full uppercase">
                  Codex SDK • {PLUGIN_STARTER_TAG}
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">Codex Plugin Starter</h3>
                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                  Prerelease bundle containing 4 developer plugins for enterprise AI Center of Excellence, health safety, prompt testing, and audio frequency automation.
                </p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]" title={PLUGIN_STARTER_SHA256}>
                    SHA256: {PLUGIN_STARTER_SHA256.substring(0, 12)}...
                  </span>
                  <div className="flex gap-x-2">
                    <a
                      href={`${PLUGIN_STARTER_ASSET_BASE}/${PLUGIN_STARTER_MODULE_NAME}.zip`}
                      className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-violet-100 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Get ZIP
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Agentic Creator OS (ACOS v11) */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090911]/60 backdrop-blur-md transition-all hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.08)]">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 border-b border-white/[0.04]">
                <Image
                  src="/assets/visuals/16-architecture-flow.jpg"
                  alt="Agentic Creator OS Cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090911] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full uppercase">
                  ACOS Core • v11.2.0
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">Agentic Creator OS</h3>
                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                  The flagship operating system for AI-powered creators. Configured with 90+ skills, 65+ custom CLI commands, 38 agents, and 8 plugins. Works out-of-the-box.
                </p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] text-slate-500 font-mono">License: MIT</span>
                  <div className="flex gap-x-2">
                    <a
                      href="https://github.com/frankxai/agentic-creator-os"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-amber-100 transition-all"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                      Repo
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Starlight Swarm Coordinator */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090911]/60 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 border-b border-white/[0.04]">
                <Image
                  src="/assets/visuals/10-council.jpg"
                  alt="Starlight Swarm Coordinator Cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090911] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-full uppercase">
                  Swarm Core • v1.5.0
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">Swarm Coordinator</h3>
                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                  Multi-agent coordination system orchestrating tasks across frontier models. Integrates trajectory memory persistency, dynamic routing, and consensus gates.
                </p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] text-slate-500 font-mono">License: MIT</span>
                  <div className="flex gap-x-2">
                    <a
                      href="https://github.com/frankxai/starlight-swarm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-emerald-100 transition-all"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                      Repo
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Starlight Intelligence Modules (6 plugin kits) */}
      <section className="px-6 py-20 border-b border-white/[0.04] bg-[#040409]/30">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">02 / Swarm Modules</p>
              <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">Intelligence Wrapper Kits</h2>
              <p className="mt-2 text-slate-400 text-sm font-light">
                Six public-ready wrappers for orchestrating command, revenue, system builds, world engines, and products.
              </p>
            </div>
            <Link
              href="/download/latest.json"
              className="text-[13px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
            >
              API Metadata JSON <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Grid Layout of the 6 kits */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Founder Command Kit",
                file: "starlight-founder-command-kit-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/26.jpg",
                icon: Cpu,
                color: "text-cyan-400 border-cyan-500/10 hover:border-cyan-500/30",
                desc: "Orchestrate executive decisions and harness system overrides.",
              },
              {
                title: "Revenue Engine Kit",
                file: "starlight-revenue-engine-kit-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/12.jpg",
                icon: Coins,
                color: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30",
                desc: "Manage value computational paths and transaction ledgers.",
              },
              {
                title: "Starlight System Module",
                file: "starlight-system-module-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/68.jpg",
                icon: Layers,
                color: "text-violet-400 border-violet-500/10 hover:border-violet-500/30",
                desc: "Manage workspace meshes, naming doctrines, and schemas.",
              },
              {
                title: "Arcanea World Engine",
                file: "arcanea-world-engine-kit-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/45.jpg",
                icon: Workflow,
                color: "text-rose-400 border-rose-500/10 hover:border-rose-500/30",
                desc: "Generative creative writing pipelines and worldbuilding swarms.",
              },
              {
                title: "Enterprise AI Kit",
                file: "starlight-enterprise-ai-kit-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/78.jpg",
                icon: ShieldCheck,
                color: "text-blue-400 border-blue-500/10 hover:border-blue-500/30",
                desc: "Production model orchestration, security gates, and benchmarks.",
              },
              {
                title: "Creator Product Kit",
                file: "starlight-creator-product-kit-2026-06-19.zip",
                img: "/assets/visuals/queen-premium/84.jpg",
                icon: Sparkles,
                color: "text-amber-400 border-amber-500/10 hover:border-amber-500/30",
                desc: "Packaging templates and visual monetization engines.",
              },
            ].map((kit, index) => {
              const Icon = kit.icon;
              return (
                <div
                  key={kit.title}
                  className={`group relative overflow-hidden rounded-xl border bg-[#090912]/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${kit.color}`}
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-950">
                    <Image
                      src={kit.img}
                      alt={kit.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent" />
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-x-2 text-white font-semibold text-lg">
                      <Icon className="h-5 w-5 opacity-85 shrink-0" />
                      <span>{kit.title}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                      {kit.desc}
                    </p>
                    <code className="mt-4 block break-all font-mono text-[10px] text-slate-500">
                      {kit.file}
                    </code>
                    
                    <a
                      href={`${PLUGIN_MODULES_ASSET_BASE}/${kit.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex w-full items-center justify-between rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-white transition-all"
                    >
                      <span>Download wrapper</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Books & Theoretical Foundations (Handbook & Specification) */}
      <section className="px-6 py-20 border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">03 / Knowledge</p>
            <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">Books &amp; Guides</h2>
            <p className="mt-2 text-slate-400 text-sm font-light">
              Understand the core mechanics, cognitive psychology concepts, and protocol standards.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Book 1 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-32 h-44 relative rounded-lg overflow-hidden border border-white/[0.08] bg-slate-900 shrink-0">
                <Image
                  src="/assets/visuals/queen/5.jpg"
                  alt="Lived OS Handbook Cover"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Digital Guide</span>
                <h3 className="mt-2 font-bold text-lg text-white">Lived OS Handbook</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                  A comprehensive guide to adopting active recall, capturing daily workflows, and building a sovereign second brain.
                </p>
                <Link
                  href="/docs"
                  className="mt-4 inline-flex items-center gap-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <BookOpen className="h-4 w-4" />
                  Read online
                </Link>
              </div>
            </div>

            {/* Book 2 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-32 h-44 relative rounded-lg overflow-hidden border border-white/[0.08] bg-slate-900 shrink-0">
                <Image
                  src="/assets/visuals/queen/8.jpg"
                  alt="Starlight Protocol Spec Cover"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Specification</span>
                <h3 className="mt-2 font-bold text-lg text-white">Starlight Protocol Spec</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                  Technical standard documentation covering multi-agent lifecycle events, attestations, and schemas.
                </p>
                <Link
                  href="/protocol"
                  className="mt-4 inline-flex items-center gap-x-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300"
                >
                  <FileText className="h-4 w-4" />
                  View Specification
                </Link>
              </div>
            </div>

            {/* Book 3 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-32 h-44 relative rounded-lg overflow-hidden border border-white/[0.08] bg-slate-900 shrink-0">
                <Image
                  src="/assets/visuals/09-six-vaults.jpg"
                  alt="Prompt Hub Design Books Cover"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Prompt Engineering</span>
                <h3 className="mt-2 font-bold text-lg text-white">Prompt Hub Design Books</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                  A library-of-Alexandria for elite prompt engineering, featuring red-teaming guidelines, evaluation metrics, and model routing.
                </p>
                <a
                  href="https://github.com/frankxai/prompt-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <BookOpen className="h-4 w-4" />
                  Inspect Repository
                </a>
              </div>
            </div>

            {/* Book 4 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-32 h-44 relative rounded-lg overflow-hidden border border-white/[0.08] bg-slate-900 shrink-0">
                <Image
                  src="/assets/visuals/queen/9.jpg"
                  alt="Conscious Creator Guidebook Cover"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Sovereignty Guide</span>
                <h3 className="mt-2 font-bold text-lg text-white">Conscious Creator Guide</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                  Explore how creators build structural leverage and maintain digital sovereignty using autonomous multi-agent networks.
                </p>
                <a
                  href="https://github.com/frankxai/agentic-creator-os"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <BookOpen className="h-4 w-4" />
                  Inspect Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Software Agent Packs & Intelligence Systems */}
      <section className="px-6 py-20 border-b border-white/[0.04] bg-[#040409]/30">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">04 / Runtimes</p>
            <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">Intelligence System Packs</h2>
            <p className="mt-2 text-slate-400 text-sm font-light">
              Deploy specialized cognitive environments built on structured schemas and reproducible pipelines.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Neuroscience Research Pack",
                desc: "Contains standardized BIDS validators, NWB mapping datasets, and active MNE analytics scripts for bio-signal data.",
                img: "/assets/visuals/queen-premium/50.jpg",
                badge: "Neuro-Lobe",
                repo: "https://github.com/frankxai/neuroscience-research-intelligence-system",
              },
              {
                title: "Psychology Construct System",
                desc: "Includes psychometrics verification algorithms, construct mapping schema, and qualitative analysis modules.",
                img: "/assets/visuals/01-10is-visual-composition-constellation.jpg",
                badge: "Psych-Lobe",
                repo: "https://github.com/frankxai/psychology-research-intelligence-system",
              },
              {
                title: "Swarm Control Cockpit",
                desc: "Local control panel for starting, stopping, auditing, and routing commands to local and Railway Hermes agents.",
                img: "/assets/visuals/02-starlight-queen-closed-loop-dashboard.jpg",
                badge: "Control Plane",
                repo: "https://github.com/frankxai/hermes-cockpit",
              },
              {
                title: "Memory Palace Vault Seeds",
                desc: "Pre-configured Obsidian vault seeds with concept maps, identity logs, and spacial indexing templates.",
                img: "/assets/visuals/03-advanced-3d-memory-palace-v2.jpg",
                badge: "Lived OS Vault",
                repo: "https://github.com/frankxai/agentic-mind-os",
              },
              {
                title: "Arcanea InfoGenius Engine",
                desc: "Google Search and Gemini-powered automated research synthesizer and infographic generator.",
                img: "/assets/visuals/04-model-arena-grok-composer25-leaderboard.jpg",
                badge: "InfoGenius",
                repo: "https://github.com/frankxai/arcanea-infogenius",
              },
              {
                title: "Jarvis-Grade Voice Operator",
                desc: "Open-source Rust/Tauri client and Python Pipecat voice agent for sub-800ms low-latency conversation.",
                img: "/assets/visuals/06-self-advancing-sis-constellation.jpg",
                badge: "Voice Lobe",
                repo: "https://github.com/frankxai/starlight-voice",
              },
            ].map((pack) => (
              <div
                key={pack.title}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-white/[0.15] transition-all group"
              >
                <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto relative bg-slate-900 overflow-hidden shrink-0">
                  <Image
                    src={pack.img}
                    alt={pack.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-400">
                      {pack.badge}
                    </span>
                    <h3 className="mt-3 font-bold text-white text-lg">{pack.title}</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                      {pack.desc}
                    </p>
                  </div>
                  <a
                    href={pack.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Inspect repo</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Quickstart Terminal Instruction */}
      <section className="px-6 py-20 border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl grid gap-12 md:grid-cols-2 items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">05 / Setup</p>
            <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">
              Start in seconds.
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed font-light">
              Run the shell script to unpack the Starlight core contract (memory, agents, stack, and vault seeds) into your active workspace.
            </p>
          </div>
          <Terminal>
            <span className="text-cyan-400">$</span>{" "}
            <span className="text-slate-300">curl -LO</span>{" "}
            <span className="text-violet-300">
              {`${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.tar.gz`}
            </span>
            {"\n"}
            <span className="text-cyan-400">$</span>{" "}
            <span className="text-slate-300">tar -xzf</span>{" "}
            <span className="text-violet-300">{`${SIP_STARTER_MODULE_NAME}.tar.gz`}</span>
            {"\n"}
            <span className="text-cyan-400">$</span>{" "}
            <span className="text-slate-300">sh</span>{" "}
            <span className="text-violet-300">
              {`${SIP_STARTER_MODULE_NAME}/install.sh`}
            </span>{" "}
            <span className="text-slate-500">/path/to/your/repo</span>
          </Terminal>
        </div>
      </section>

      {/* 7. Package Contents Grid */}
      <section className="px-6 py-20 border-b border-white/[0.04] bg-[#040409]/30">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 font-mono">06 / Check list</p>
          <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">
            Everything included in the SIP Core module.
          </h2>
          <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {SIP_STARTER_INCLUDED.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3"
              >
                <code className="font-mono text-[11px] text-slate-400 truncate block">
                  {item}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Validation Cards */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-3">
          <ValidationStep
            n="01"
            title="Verify checksums"
            body="Download the SHA256 file and compare it against the archive before unpacking."
          />
          <ValidationStep
            n="02"
            title="Read the manifest"
            body="Use release-manifest.json and starlight-module.json to confirm conformance."
          />
          <ValidationStep
            n="03"
            title="Deploy runtime"
            body="When the file contract is working, install the full Starlight runtime via npm."
          />
        </div>
        
        <div className="mx-auto mt-12 max-w-5xl rounded-xl border border-violet-500/[0.15] bg-violet-500/[0.03] p-6 text-center">
          <p className="text-[13px] leading-relaxed text-slate-400">
            Open-core downloads stay ungated. FrankX offers guidepacks, security audits, and premium support bundles around this protocol.
          </p>
        </div>
      </section>
    </div>
  );
}

function Terminal({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#07070d]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
        <code className="ml-3 font-mono text-[11px] text-slate-500">
          terminal
        </code>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-[1.8] text-slate-300">
        {children}
      </pre>
    </div>
  );
}

function ValidationStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.01] p-5">
      <p className="font-mono text-xs text-violet-400">{n}</p>
      <h3 className="mt-3 text-[15px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400 font-light">{body}</p>
    </div>
  );
}

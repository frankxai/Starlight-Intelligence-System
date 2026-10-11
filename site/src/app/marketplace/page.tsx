import type { Metadata } from "next";
import Link from "next/link";
import {
  Boxes,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2,
  Lock,
  Cloud,
  CheckCircle2,
  Workflow,
  Search,
} from "lucide-react";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import { GITHUB_URL } from "@/lib/nav";
import { MarketplaceClient, type MarketplaceCard } from "./MarketplaceClient";

const FEATURED_ITEMS: MarketplaceCard[] = [
  {
    id: "starlight-mcp",
    name: "Starlight Sovereign Memory MCP",
    version: "8.3.0",
    kind: "MCP server",
    category: "Agent memory",
    author: "Starlight Foundation",
    description:
      "Exposes 6 semantic vaults, hybrid SQLite FTS5 search, epistemic knowledge tree, and Santa convergence loop directly to AI harnesses.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight-mcp --vault-dir ~/.starlight/vaults",
    tags: ["memory-vaults", "sqlite", "fts5", "knowledge-tree"],
    capabilities: ["vault:read", "vault:write", "dreaming:promote", "fts5:query"],
    permissions: ["fs:read:vaults", "fs:write:vaults"],
  },
  {
    id: "starlight-agent-canvas",
    name: "Infinite Visual Spatial DAG MCP",
    version: "0.1.0",
    kind: "MCP server",
    category: "Spatial reasoning",
    author: "Starlight Media Lab",
    description:
      "2D infinite canvas MCP server for multimodal asset lineage. Ingests URLs, YouTube videos, and images into a visual node graph.",
    pricing: "Free",
    featured: true,
    installCommand: "npx @starlight-intelligence/agent-canvas-mcp",
    tags: ["canvas", "dag", "visual-memory", "spatial-reasoning"],
    capabilities: ["canvas:create_node", "canvas:connect_edges", "canvas:render_dag"],
    permissions: ["network:fetch", "fs:write:canvas-cache"],
  },
  {
    id: "starlight-foundry",
    name: "Starlight Foundry & Compiler",
    version: "1.0.0",
    kind: "Skill pack",
    category: "Capability compilation",
    author: "Starlight Engineering",
    description:
      "Compiles high-level agent missions into target-specific skill packages, evaluates taste gates, and produces cryptographic evidence receipts.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight pack install starlight-foundry",
    tags: ["foundry", "compiler", "codex", "claude-code"],
    capabilities: ["foundry:compile", "foundry:audit", "foundry:receipt"],
    permissions: ["fs:read:repo", "fs:write:repo"],
  },
  {
    id: "dashboard-cockpit-pack",
    name: "Zellij & Web Cockpit Console",
    version: "0.1.0",
    kind: "Skill pack",
    category: "Developer experience",
    author: "Starlight Foundation",
    description:
      "Real-time multi-pane terminal cockpit (Zellij) and local web interface for tracking agent fleets, token velocity, and memory vault health.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight pack install dashboard-cockpit-pack",
    tags: ["cockpit", "zellij", "telemetry", "monitoring"],
    capabilities: ["cockpit:stream_metrics", "cockpit:inspect_vaults"],
    permissions: ["fs:read:vaults", "network:local_bind"],
  },
  {
    id: "anime-legends-mascots",
    name: "AnimeLegends Mascot Trinity & Legal Firewall",
    version: "0.1.0",
    kind: "Skill pack",
    category: "Creative & cinema",
    author: "AnimeLegends Studio",
    description:
      "Maintains strict character sheet consistency for Akashi, Kage, and Mira while filtering prompt leaks against trademarked anime styles.",
    pricing: "Freemium",
    featured: true,
    installCommand: "npx @anime-legends/cli character akashi",
    tags: ["anime", "mascot", "cinema", "storyboard", "firewall"],
    capabilities: ["mascot:render_spec", "firewall:audit_prompt"],
    permissions: ["network:fetch:fal", "fs:write:assets"],
  },
  {
    id: "harness-claude-code",
    name: "Claude Code Symphony Profile",
    version: "2.1.0",
    kind: "Harness profile",
    category: "Harness presets",
    author: "Starlight Foundation",
    description:
      "Optimized CLAUDE.md guidelines, slash command bindings, and background task supervisor config for Anthropic Claude Code.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight guidance --project default --target claude-code",
    tags: ["claude-code", "anthropic", "prompt-caching", "subagents"],
    capabilities: ["harness:guidance", "harness:rules_sync"],
    permissions: ["fs:write:workspace"],
  },
  {
    id: "starlight-managed-router",
    name: "Unified Frontier LLM API Router",
    version: "2.0.0",
    kind: "Cloud service",
    category: "Managed cloud",
    author: "Starlight Cloud",
    description:
      "Pooled credits and ultra-low latency model routing across Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, and Grok via Vercel AI SDK.",
    pricing: "Pro",
    featured: true,
    installCommand: "starlight cloud route --enable-ai-sdk",
    tags: ["vercel-ai-sdk", "model-routing", "unified-billing", "frontier-llms"],
    capabilities: ["route:frontier", "billing:pool_credits"],
    permissions: ["network:egress:starlight-cloud"],
  },
  {
    id: "postgres-vector-mcp",
    name: "PostgreSQL pgvector Enterprise Connector",
    version: "1.0.0",
    kind: "MCP server",
    category: "Enterprise storage",
    author: "Starlight Enterprise",
    description:
      "High-concurrency PostgreSQL pgvector adapter for multi-agent teams requiring ACID compliance, tenant isolation, and connection pooling.",
    pricing: "Pro",
    installCommand: "npx @starlight-intelligence/mcp-pgvector --dsn $DATABASE_URL",
    tags: ["postgres", "pgvector", "enterprise", "acid"],
    capabilities: ["storage:pgvector_query", "storage:connection_pool"],
    permissions: ["network:egress:postgres"],
  },
];

export const metadata: Metadata = {
  title: "Marketplace & Hub — Starlight Intelligence",
  description:
    "Curated registry of verified Skill Packs, MCP Servers, and Harness Profiles built on the Starlight Intelligence Protocol.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Starlight Marketplace & Hub — Starlight Intelligence",
    description:
      "Curated registry of verified Skill Packs, MCP Servers, and Harness Profiles built on the Starlight Intelligence Protocol.",
    type: "website",
    url: "/marketplace",
  },
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060609] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <GalaxyField still="deepField" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_18%_68%,rgba(168,85,247,0.12),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300">
              Ecosystem catalog · sovereign extensions
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-7xl">
              Starlight Marketplace &amp; Hub
            </h1>
            <p className="mt-7 text-lg leading-8 text-slate-300 md:text-xl">
              Discover, install, and compose community-built Skill Packs, verified Model Context Protocol (MCP) servers,
              and optimized agent harness profiles. Every item carries cryptographic attestation and fail-closed permission manifests.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition hover:bg-cyan-50"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/cloud"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.05]"
              >
                Starlight Cloud offering
                <Cloud className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Boxes className="h-5 w-5 text-cyan-300" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Skill packs</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">88+ Rules</p>
              <p className="mt-1 text-xs text-slate-400">Packaged skills across 17 vertical intelligence domains.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-violet-300" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">MCP servers</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">Verified</p>
              <p className="mt-1 text-xs text-slate-400">Local-first memory, 2D canvas, media engines &amp; databases.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-emerald-300" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Harnesses</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">10 Systems</p>
              <p className="mt-1 text-xs text-slate-400">Profiles for Claude Code, Cursor, Codex, Grok &amp; Antigravity.</p>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0b12]/80 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Attestation</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">SIP Verified</p>
              <p className="mt-1 text-xs text-slate-400">Manifest SHA validation and permission explicit boundaries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section id="catalog" className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-300">Curated ecosystem</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Verified extensions &amp; services</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-[#0c0c14] px-4 py-2 text-xs text-slate-400">
              <Terminal className="h-4 w-4 text-cyan-300" />
              <span>Install via CLI: <code className="text-white">starlight pack install &lt;id&gt;</code></span>
            </div>
          </div>

          <MarketplaceClient items={FEATURED_ITEMS} />

          {/* Publishing instructions */}
          <div className="mt-16 border border-white/[0.10] bg-[#0c0c16]/80 p-8 backdrop-blur-xl">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-300">Open protocol contribution</span>
              <h3 className="mt-2 text-2xl font-semibold text-white">How to publish your pack or server</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Any developer can publish an extension to the ecosystem. Author a standard <code className="text-white">manifest.json</code> in your repository,
                declare explicit permissions, compute the directory manifest SHA, and attach the SIP attestation footer.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.05]"
                >
                  <Code2 className="h-4 w-4" />
                  View manifest schema
                </a>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.05]"
                >
                  Read developer guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

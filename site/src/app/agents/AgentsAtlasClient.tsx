"use client";

import * as React from "react";
import Link from "next/link";
import {
  SearchIcon,
  OrbitIcon,
  SparkIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  ArrowRightIcon,
  ShieldIcon,
  CodeIcon,
} from "@/components/icons";
import { AgentSigil } from "@/components/AgentSigil";
import { StatusBadge } from "@/components/system";
import agentsData from "@/data/agents.json";

interface AgentRecord {
  id: string;
  title: string;
  tier: string;
  domain: string;
  voice: string;
  mission: string;
  file: string;
  skills: string[];
}

export function AgentsAtlasClient() {
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("All");
  const [selectedAgent, setSelectedAgent] = React.useState<AgentRecord | null>(null);

  const agents: AgentRecord[] = agentsData as AgentRecord[];

  const filtered = React.useMemo(() => {
    return agents.filter((agent) => {
      const q = search.toLowerCase();
      const matchSearch =
        agent.id.toLowerCase().includes(q) ||
        agent.title.toLowerCase().includes(q) ||
        agent.domain.toLowerCase().includes(q) ||
        agent.skills.some((s) => s.toLowerCase().includes(q));
      const matchTier =
        tierFilter === "All" ||
        agent.tier.toLowerCase().includes(tierFilter.toLowerCase()) ||
        (tierFilter === "Domain Sub-Stack" &&
          (agent.tier.includes("Intelligence") ||
            agent.tier.includes("IS") ||
            agent.tier.includes("Domain") ||
            agent.tier.includes("Specialist")));
      return matchSearch && matchTier;
    });
  }, [agents, search, tierFilter]);

  const tiers = [
    "All",
    "Front-Door",
    "Excavation",
    "Leadership",
    "Specialist",
    "Foundation",
    "Universal IS",
    "Council",
    "Domain Sub-Stack",
  ];

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-14">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-companion,#82d8e6)]/40 bg-[var(--sl-companion,#82d8e6)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-companion,#82d8e6)] mb-3">
              <OrbitIcon size={14} />
              <span>151 Sovereign Minds · AGENT_REGISTRY.md SSOT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              151-Agent Sovereign Atlas
            </h1>
            <p className="mt-2 text-sm text-[var(--sl-fg-muted,#8b93a1)] max-w-2xl">
              Flat council with emergent leadership. Every mind rendered with deterministic sacred-geometry vector sigils.
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
              className="px-3.5 py-1.5 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro"
            >
              Brand Lab →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        {/* Architecture Tiers Overview */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]">
            <span className="text-xs font-mono text-[var(--sl-companion,#82d8e6)] block mb-1">Front-Door & Excavation</span>
            <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">Concierge, Envoy, Voice & Genius</h4>
            <p className="text-xs text-slate-400 mt-1">First contact intake, non-technical paths, and corpus pattern excavation.</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]">
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">Leadership Tier</span>
            <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">Orchestrator, Prime & Architect</h4>
            <p className="text-xs text-slate-400 mt-1">Synthesis, workflow routing, and planet-scale systems design.</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]">
            <span className="text-xs font-mono text-emerald-400 block mb-1">Specialists & Foundation</span>
            <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">Navigator, Sentinel, Weaver, Hermes & Sage</h4>
            <p className="text-xs text-slate-400 mt-1">Security, institutional memory, search provenance, foresight.</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]">
            <span className="text-xs font-mono text-purple-400 block mb-1">Domain Verticals & Sub-Stacks</span>
            <h4 className="text-sm font-semibold text-[var(--sl-fg,#ede6d8)]">10 Universal IS + 120 Sub-Stacks</h4>
            <p className="text-xs text-slate-400 mt-1">People, Sound, Music, Energy, Marine, Space, Longevity & Assets.</p>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by agent ID, title, domain, or skill..."
              className="w-full rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] pl-10 pr-4 py-2 text-sm text-[var(--sl-fg,#ede6d8)] outline-none focus:border-[var(--sl-gold,#c9a15c)] font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {tiers.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-md transition-micro font-medium ${
                  tierFilter === t
                    ? "bg-[var(--sl-gold,#c9a15c)] text-black font-semibold"
                    : "border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* 151-Agent Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] p-4 hover:border-[var(--sl-gold,#c9a15c)] transition-std cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-300">
                    {agent.tier}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] truncate max-w-[120px]">
                    {agent.domain}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0 transition-transform group-hover:scale-110">
                    <AgentSigil id={agent.id} domain={agent.domain} tier={agent.tier} size={44} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)] group-hover:text-[var(--sl-gold,#c9a15c)] transition-micro">
                      {agent.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">id: {agent.id}</p>
                  </div>
                </div>

                <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] line-clamp-2 leading-relaxed mb-3">
                  {agent.mission}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--sl-border,rgba(237,230,216,0.08))] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>voice: {agent.voice}</span>
                <span className="text-[var(--sl-companion,#82d8e6)] group-hover:translate-x-0.5 transition-transform">
                  View Profile →
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Selected Agent Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-2xl border border-[var(--sl-gold,#c9a15c)]/60 bg-[var(--sl-surface-1,#0d1119)] p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <CloseIcon size={18} />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <AgentSigil
                  id={selectedAgent.id}
                  domain={selectedAgent.domain}
                  tier={selectedAgent.tier}
                  size={64}
                />
                <div>
                  <h3 className="text-xl font-semibold text-[var(--sl-fg,#ede6d8)]">
                    {selectedAgent.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--sl-gold,#c9a15c)]">
                    {selectedAgent.tier} · Domain: {selectedAgent.domain} · Voice: {selectedAgent.voice}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-black/40 mb-4 text-xs leading-relaxed text-[var(--sl-fg,#ede6d8)]">
                <span className="text-[10px] font-mono uppercase text-[var(--sl-gold,#c9a15c)] block mb-1">
                  Core Mission:
                </span>
                {selectedAgent.mission}
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">Specification File:</span>
                  <span className="text-slate-200 bg-white/5 px-2.5 py-1 rounded block truncate">
                    agents/{selectedAgent.file}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">
                    Active Skills ({selectedAgent.skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.skills.length > 0 ? (
                      selectedAgent.skills.map((s) => (
                        <span
                          key={s}
                          className="bg-[var(--sl-companion,#82d8e6)]/10 text-[var(--sl-companion,#82d8e6)] border border-[var(--sl-companion,#82d8e6)]/20 px-2 py-0.5 rounded text-[11px]"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">Flat council coordination</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

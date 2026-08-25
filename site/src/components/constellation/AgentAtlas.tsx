"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ALL_AGENTS, SWARM_HOUSES, type PublicAgent } from "@/lib/constellation-data";
import { Search, Shield, ArrowUpRight, Cpu, Sparkles, Filter, X, Network, BookOpen } from "lucide-react";

export function AgentAtlas() {
  const [selectedHouse, setSelectedHouse] = useState<string>("all");
  const [selectedRoleKind, setSelectedRoleKind] = useState<"all" | "conductor" | "specialist">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState<PublicAgent | null>(null);

  const filteredAgents = useMemo(() => {
    return ALL_AGENTS.filter((agent) => {
      // Filter by house/swarm
      if (selectedHouse !== "all") {
        const house = SWARM_HOUSES.find((h) => h.id === selectedHouse);
        if (house) {
          // Check if agent belongs to this swarm by finding the swarm
          const swarm = ALL_AGENTS.find((a) => a.id === agent.id);
          // Let's match by ID prefix or checking swarm containment
          const houseSwarm = rawSwarmForAgent(agent.id);
          if (houseSwarm !== selectedHouse) return false;
        }
      }

      // Filter by role kind
      if (selectedRoleKind !== "all" && agent.role_kind !== selectedRoleKind) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = agent.display_name.toLowerCase().includes(q);
        const matchesRole = agent.role_title.toLowerCase().includes(q);
        const matchesPurpose = agent.purpose.toLowerCase().includes(q);
        const matchesCapabilities = agent.capabilities.some((c) => c.toLowerCase().includes(q));
        const matchesArchetype = agent.visual_dna.archetype.toLowerCase().includes(q);
        return matchesName || matchesRole || matchesPurpose || matchesCapabilities || matchesArchetype;
      }

      return true;
    });
  }, [selectedHouse, selectedRoleKind, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Filters bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 50 agents by name, role, capability, or prompt..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c14] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 transition focus:border-violet-400/60 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Role Type Filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0c0c14] p-1">
          <button
            onClick={() => setSelectedRoleKind("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedRoleKind === "all"
                ? "bg-violet-500/20 text-violet-300 border border-violet-400/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Roles ({ALL_AGENTS.length})
          </button>
          <button
            onClick={() => setSelectedRoleKind("conductor")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedRoleKind === "conductor"
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Conductors
          </button>
          <button
            onClick={() => setSelectedRoleKind("specialist")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedRoleKind === "specialist"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Specialists
          </button>
        </div>
      </div>

      {/* House selector pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedHouse("all")}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedHouse === "all"
              ? "bg-white text-[#060609] font-semibold"
              : "border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          All Houses (10)
        </button>
        {SWARM_HOUSES.map((house) => (
          <button
            key={house.id}
            onClick={() => setSelectedHouse(house.id)}
            className={`flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
              selectedHouse === house.id
                ? "bg-violet-600/30 text-violet-200 border border-violet-400/50 shadow-[0_0_12px_rgba(167,139,250,0.25)]"
                : "border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            {house.name}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAgents.map((agent) => (
          <article
            key={agent.id}
            onClick={() => setActiveAgent(agent)}
            data-cursor-label="INSPECT"
            data-cursor-accent={agent.visual_dna.accent || "#a78bfa"}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#12121e] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            {/* Header: Visual Asset & Archetype */}
            <div>
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/40 border border-white/[0.06]">
                <Image
                  src={agent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"}
                  alt={`${agent.display_name} portrait`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent opacity-60" />

                {/* Role Kind Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      agent.role_kind === "conductor"
                        ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                    }`}
                  >
                    {agent.role_kind}
                  </span>
                </div>

                {/* Version & Archetype */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/90 drop-shadow-md">
                    {agent.visual_dna.archetype}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 drop-shadow-md">
                    {agent.version}
                  </span>
                </div>
              </div>

              {/* Title & Role */}
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight text-white group-hover:text-violet-300 transition-colors">
                    {agent.display_name}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-400" />
                </div>
                <p className="font-mono text-xs text-violet-400/90">{agent.role_title}</p>
              </div>

              {/* Purpose */}
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                {agent.purpose}
              </p>
            </div>

            {/* Footer: Capabilities & Stop Condition hint */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.slice(0, 3).map((cap) => (
                  <span
                    key={cap}
                    className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-white/[0.04]"
                  >
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 3 && (
                  <span className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                    +{agent.capabilities.length - 3}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty Search State */}
      {filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0c0c14]/50 py-16 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-slate-600" />
          <h3 className="text-base font-semibold text-white">No agents match your filter</h3>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search keywords or selecting a different house.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedHouse("all");
              setSelectedRoleKind("all");
            }}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Agent Detail Modal */}
      {activeAgent && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/20 bg-[#0c0c16] p-6 shadow-2xl md:p-8">
            {/* Close button */}
            <button
              onClick={() => setActiveAgent(null)}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-slate-400 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="relative aspect-[4/5] w-full md:w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                <Image
                  src={activeAgent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"}
                  alt={activeAgent.display_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 font-mono text-xs font-semibold uppercase ${
                      activeAgent.role_kind === "conductor"
                        ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                    }`}
                  >
                    {activeAgent.role_kind}
                  </span>
                  <span className="font-mono text-xs text-slate-500">{activeAgent.version}</span>
                  <span className="font-mono text-xs text-slate-500">· {activeAgent.visual_dna.archetype}</span>
                </div>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {activeAgent.display_name}
                </h2>
                <p className="font-mono text-sm text-violet-400">{activeAgent.role_title}</p>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {activeAgent.public_profile || activeAgent.purpose}
                </p>

                <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/05 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-violet-400">
                    Authority Statement
                  </p>
                  <p className="mt-1 text-xs text-slate-200">
                    {activeAgent.prompt_contract.authority_statement}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body Sections */}
            <div className="mt-8 space-y-6 border-t border-white/[0.08] pt-6">
              {/* Capabilities & Stop Conditions */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    <Sparkles className="h-4 w-4" /> Capabilities
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                    {activeAgent.capabilities.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-rose-400">
                    <Shield className="h-4 w-4" /> Stop Conditions (Invariants)
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                    {activeAgent.stop_conditions.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400/60 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Routing Graph */}
              {activeAgent.graph.routes_to.length > 0 && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    <Network className="h-4 w-4" /> Graph Routing Handoffs
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeAgent.graph.routes_to.map((target) => (
                      <span
                        key={target}
                        className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-xs text-cyan-300"
                      >
                        → {target}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Contract Snippet */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/50 p-4">
                <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <BookOpen className="h-4 w-4" /> Prompt Contract (Excerpt)
                </h4>
                <pre className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-black/60 p-3 font-mono text-[11px] text-slate-400">
                  {activeAgent.prompt_contract.markdown}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function rawSwarmForAgent(agentId: string): string {
  for (const house of SWARM_HOUSES) {
    const s = ALL_AGENTS.find((a) => a.id === agentId);
    if (s && s.id.includes(house.id.split("-")[0])) return house.id;
  }
  return "all";
}

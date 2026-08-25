"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import agentsData from "@/data/agents.json";

interface AgentItem {
  id: string;
  name: string;
  tier: string;
  domain: string;
  voice: string;
  tagline: string;
  mission: string;
  activeSkills: string[];
  triggers: string[];
  content: string;
}

const TIERS = [
  "all",
  "leadership",
  "specialist",
  "foundation",
  "front-door",
  "excavation",
  "universal-is",
  "domain-sub-stack",
  "council-archetype",
  "evaluator",
  "extractor",
];

const TIER_COLORS: Record<string, { badge: string; border: string }> = {
  leadership: { badge: "bg-amber-500/10 text-amber-300 border-amber-500/30", border: "hover:border-amber-500/50" },
  specialist: { badge: "bg-purple-500/10 text-purple-300 border-purple-500/30", border: "hover:border-purple-500/50" },
  foundation: { badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30", border: "hover:border-cyan-500/50" },
  "front-door": { badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", border: "hover:border-emerald-500/50" },
  excavation: { badge: "bg-rose-500/10 text-rose-300 border-rose-500/30", border: "hover:border-rose-500/50" },
  "universal-is": { badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30", border: "hover:border-indigo-500/50" },
  "domain-sub-stack": { badge: "bg-pink-500/10 text-pink-300 border-pink-500/30", border: "hover:border-pink-500/50" },
  "council-archetype": { badge: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30", border: "hover:border-yellow-500/50" },
  evaluator: { badge: "bg-blue-500/10 text-blue-300 border-blue-500/30", border: "hover:border-blue-500/50" },
  extractor: { badge: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30", border: "hover:border-zinc-500/50" },
};

export default function AgentsPage() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAgent, setActiveAgent] = useState<AgentItem | null>(null);
  const [selectedCouncil, setSelectedCouncil] = useState<AgentItem[]>([]);
  const [councilTaskGoal, setCouncilTaskGoal] = useState("");
  const [showCouncilModal, setShowCouncilModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const agents = agentsData as unknown as AgentItem[];

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      let normTier = agent.tier.toLowerCase();
      if (agent.id.startsWith("council/")) normTier = "council-archetype";
      if (agent.id.includes("extractor")) normTier = "extractor";
      if (agent.id.includes("evaluator")) normTier = "evaluator";

      const matchesTier =
        selectedTier === "all" ||
        normTier === selectedTier ||
        (selectedTier === "specialist" && (normTier === "specialist" || normTier === "core"));

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.domain.toLowerCase().includes(q) ||
        agent.mission.toLowerCase().includes(q) ||
        agent.tagline.toLowerCase().includes(q) ||
        agent.activeSkills.some((s) => s.toLowerCase().includes(q));

      return matchesTier && matchesSearch;
    });
  }, [agents, selectedTier, searchQuery]);

  const toggleCouncilMember = (agent: AgentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCouncil.some((a) => a.id === agent.id)) {
      setSelectedCouncil(selectedCouncil.filter((a) => a.id !== agent.id));
    } else {
      if (selectedCouncil.length >= 7) {
        alert("Hybrid Sizing Protocol Rule: Council consensus is capped at ≤7 active agents to avoid token dilution and deadlock.");
        return;
      }
      setSelectedCouncil([...selectedCouncil, agent]);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generatedCouncilPrompt = useMemo(() => {
    const goal = councilTaskGoal || "[Describe your high-stakes multi-agent task or system build here]";
    const agentList = selectedCouncil
      .map((a, i) => `${i + 1}. **${a.name}** (${a.tier} · ${a.domain}): ${a.tagline || a.mission.slice(0, 120)}...`)
      .join("\n");

    return `# Starlight Council Swarm Dispatch
> Mission Goal: ${goal}
> Swarm Consensus Sizing: ${selectedCouncil.length} Nodes (Hybrid Sizing Protocol ≤ 7)
> Architecture: Built on SIP v1.1.1 (Starlight Intelligence Protocol)

## Convened Council Members
${agentList}

## Orchestration Protocol (The Santa Loop)
1. **Fire Gate (Generation)**: Lead agents rapidly draft the initial solution, architecture, and code.
2. **Crown Gate (Adversarial Review)**: Specialist and Sentinel agents ruthlessly audit against invariants, security, and taste.
3. **Unity Gate (Consensus & Synthesis)**: Prime synthesizes the consensus into the final attested deliverable.

Execute with full excellence and report state back to the operational memory vault.`;
  }, [selectedCouncil, councilTaskGoal]);

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 selection:bg-cyan-500/30">
      {/* Hero Header */}
      <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-cyan-950/20 via-[#060609] to-[#060609] px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            146 Sovereign Minds · 10 Tiers · Flat Council with Emergent Leadership
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Starlight Agent Fleet
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            Specialized autonomous LLM personas sharing a unified memory substrate and active skill registry. Assemble swarms, run adversarial councils, and build sovereign agent armies.
          </p>

          {/* Sticky Council Dock Preview */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Council Swarm Composer:</span>
              <span className="text-xs text-cyan-400 font-mono">
                {selectedCouncil.length} / 7 active seats selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedCouncil.length > 0 && (
                <button
                  onClick={() => setSelectedCouncil([])}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowCouncilModal(true)}
                disabled={selectedCouncil.length === 0}
                className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20"
              >
                Assemble & Export Swarm Prompt →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        {/* Search & Tier Filters */}
        <div className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search 146 agents by name, domain, mission, or active skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition focus:border-cyan-500 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tier Pills */}
          <div className="flex flex-wrap gap-2">
            {TIERS.map((tier) => {
              const active = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-105"
                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
                  }`}
                >
                  {tier.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  {tier === "all" && ` (${agents.length})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const isSelected = selectedCouncil.some((a) => a.id === agent.id);
            const style = TIER_COLORS[agent.tier] || {
              badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
              border: "hover:border-slate-500/50",
            };

            return (
              <div
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-[#0c0c14] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20 cursor-pointer ${
                  isSelected ? "border-cyan-500 bg-cyan-950/10" : "border-white/[0.08]"
                } ${style.border}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.badge}`}>
                      {agent.tier}
                    </span>
                    <button
                      onClick={(e) => toggleCouncilMember(agent, e)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        isSelected
                          ? "bg-cyan-500 text-black font-semibold"
                          : "bg-white/[0.06] text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isSelected ? "✓ in Council" : "+ Add Seat"}
                    </button>
                  </div>

                  <h3 className="mt-3.5 text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {agent.name}
                  </h3>

                  <p className="mt-1 text-xs text-cyan-400/80 font-mono">
                    Domain: {agent.domain}
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                    {agent.tagline || agent.mission}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.activeSkills.slice(0, 3).map((sk, i) => (
                      <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                        {sk.split("/").pop()}
                      </span>
                    ))}
                    {agent.activeSkills.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{agent.activeSkills.length - 3} skills
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[160px]">Voice: {agent.voice.slice(0, 24)}...</span>
                    <span className="text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                      Inspect →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Detail Modal */}
      {activeAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-white/15 bg-[#0e0e18] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#121220]">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                  {activeAgent.tier}
                </span>
                <h2 className="text-lg font-bold text-white">{activeAgent.name}</h2>
              </div>
              <button
                onClick={() => setActiveAgent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mission & Purpose</h4>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                  {activeAgent.mission || activeAgent.tagline}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Domain</h4>
                  <p className="mt-1 text-xs text-cyan-300 font-mono">{activeAgent.domain}</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Voice</h4>
                  <p className="mt-1 text-xs text-slate-300">{activeAgent.voice}</p>
                </div>
              </div>

              {activeAgent.activeSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Active Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeAgent.activeSkills.map((s, i) => (
                      <span key={i} className="rounded bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs text-purple-300 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Profile Markdown</h4>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {activeAgent.content}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#121220]">
              <span className="text-xs text-slate-500 font-mono">File: agents/{activeAgent.id}.md</span>
              <button
                onClick={() => setActiveAgent(null)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swarm Composer Modal */}
      {showCouncilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-cyan-500/30 bg-[#0e0e18] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#121220]">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">⚔ Council Swarm Dispatcher</span>
                <span className="text-xs text-slate-400 font-mono">({selectedCouncil.length} agents)</span>
              </div>
              <button
                onClick={() => setShowCouncilModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Task / Goal Objective
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build an autonomous token economics engine with Monte Carlo simulations"
                  value={councilTaskGoal}
                  onChange={(e) => setCouncilTaskGoal(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Assembled Council Fleet
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCouncil.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
                    >
                      <span>{a.name}</span>
                      <button
                        onClick={(e) => toggleCouncilMember(a, e)}
                        className="text-cyan-400 hover:text-white ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Generated Swarm Prompt (Ready for Antigravity / Claude Code / Codex)
                </h4>
                <pre className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#060609] p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {generatedCouncilPrompt}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#121220]">
              <span className="text-xs text-slate-400">
                Santa Loop Consensus · Bound to ≤7 Agents
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedCouncilPrompt, "council-prompt")}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20"
                >
                  {copiedKey === "council-prompt" ? "✓ Copied to Clipboard!" : "Copy Swarm Prompt"}
                </button>
                <button
                  onClick={() => setShowCouncilModal(false)}
                  className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/15 transition border border-white/10"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

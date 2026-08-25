"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import skillsData from "@/data/skills.json";

interface TriggerData {
  keywords?: string[];
  agents?: string[];
  intents?: string[];
  files?: string[];
}

interface SkillItem {
  id: string;
  domain: string;
  name: string;
  description: string;
  priority: string;
  loadLevel: string;
  triggers: TriggerData;
  body: string;
  tokenEstimate: number;
}

const DOMAINS = [
  "all",
  "intelligence",
  "orchestration",
  "memory",
  "integration",
  "vision",
  "business",
  "safety",
  "music-is",
  "sound-intelligence",
  "energy-intelligence",
  "people-intelligence",
  "relational",
  "health",
  "crypto-intelligence",
  "machine",
  "marine-intelligence",
];

const DOMAIN_COLORS: Record<string, { badge: string; border: string; glow: string }> = {
  intelligence: { badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", border: "hover:border-indigo-500/50", glow: "from-indigo-500/20" },
  orchestration: { badge: "bg-purple-500/10 text-purple-400 border-purple-500/30", border: "hover:border-purple-500/50", glow: "from-purple-500/20" },
  memory: { badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", border: "hover:border-cyan-500/50", glow: "from-cyan-500/20" },
  integration: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/30", border: "hover:border-blue-500/50", glow: "from-blue-500/20" },
  vision: { badge: "bg-pink-500/10 text-pink-400 border-pink-500/30", border: "hover:border-pink-500/50", glow: "from-pink-500/20" },
  business: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", border: "hover:border-emerald-500/50", glow: "from-emerald-500/20" },
  safety: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", border: "hover:border-amber-500/50", glow: "from-amber-500/20" },
  "music-is": { badge: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30", border: "hover:border-fuchsia-500/50", glow: "from-fuchsia-500/20" },
  "sound-intelligence": { badge: "bg-violet-500/10 text-violet-400 border-violet-500/30", border: "hover:border-violet-500/50", glow: "from-violet-500/20" },
  "energy-intelligence": { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", border: "hover:border-yellow-500/50", glow: "from-yellow-500/20" },
  "people-intelligence": { badge: "bg-rose-500/10 text-rose-400 border-rose-500/30", border: "hover:border-rose-500/50", glow: "from-rose-500/20" },
  relational: { badge: "bg-teal-500/10 text-teal-400 border-teal-500/30", border: "hover:border-teal-500/50", glow: "from-teal-500/20" },
  health: { badge: "bg-green-500/10 text-green-400 border-green-500/30", border: "hover:border-green-500/50", glow: "from-green-500/20" },
  "crypto-intelligence": { badge: "bg-amber-400/10 text-amber-300 border-amber-400/30", border: "hover:border-amber-400/50", glow: "from-amber-400/20" },
  machine: { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30", border: "hover:border-zinc-500/50", glow: "from-zinc-500/20" },
  "marine-intelligence": { badge: "bg-sky-500/10 text-sky-400 border-sky-500/30", border: "hover:border-sky-500/50", glow: "from-sky-500/20" },
};

export default function SkillsPage() {
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(null);
  const [exportPlatform, setExportPlatform] = useState<"antigravity" | "claude" | "cursor" | "codex" | "cline">("antigravity");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const skills = skillsData as unknown as SkillItem[];

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesDomain =
        selectedDomain === "all" || skill.domain === selectedDomain;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.domain.toLowerCase().includes(q) ||
        skill.triggers.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        skill.triggers.agents?.some((a) => a.toLowerCase().includes(q));

      return matchesDomain && matchesSearch;
    });
  }, [skills, selectedDomain, searchQuery]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getExportSnippet = (skill: SkillItem, platform: string) => {
    const slug = skill.name.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    switch (platform) {
      case "antigravity":
        return `<!-- Starlight Skill: ${skill.name} -->\n<skill name="${slug}">\n${skill.body}\n</skill>`;
      case "claude":
        return `---
name: ${slug}
description: >-
  ${skill.description}
---

${skill.body}`;
      case "cursor":
        return `---
description: "${skill.description.replace(/"/g, '\\"')}"
globs: ${JSON.stringify(skill.triggers.files ?? ["**/*"])}
alwaysApply: false
---

# ${skill.name}

${skill.body}`;
      case "codex":
        return `---
name: ${slug}
description: "${skill.description.replace(/"/g, '\\"')}"
---

${skill.body}`;
      case "cline":
        return `# Skill: ${skill.name}\n> ${skill.description}\n\n${skill.body}`;
      default:
        return skill.body;
    }
  };

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 selection:bg-purple-500/30">
      {/* Hero Header */}
      <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-purple-950/20 via-[#060609] to-[#060609] px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-medium text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            agentskills.io Standard · 87 Canonical Skills · 16 Domains
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Starlight Skills Directory
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            Executable cognitive capabilities, multi-agent orchestration loops, persistent memory protocols, and frontier reasoning SOPs. Sovereign in authoring, universal in distribution.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyToClipboard("npx -p @arcanea/starlight-intelligence-system export:skills", "cli-sync")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 border border-white/10"
            >
              <code>npm run export:skills</code>
              <span className="text-xs text-purple-300">
                {copiedKey === "cli-sync" ? "✓ Copied!" : "Copy Sync CLI"}
              </span>
            </button>
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 shadow-lg shadow-purple-600/20"
            >
              Get Manifest & Plugin Bundles
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        {/* Search & Domain Filter Bar */}
        <div className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search 87 skills by name, trigger keyword, agent, or intent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition focus:border-purple-500 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-purple-500"
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

          {/* Domain Pills */}
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((domain) => {
              const active = selectedDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
                  }`}
                >
                  {domain.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  {domain === "all" && ` (${skills.length})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => {
            const style = DOMAIN_COLORS[skill.domain] || {
              badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
              border: "hover:border-slate-500/50",
              glow: "from-slate-500/20",
            };

            return (
              <div
                key={skill.id}
                onClick={() => setActiveSkill(skill)}
                className={`group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer ${style.border}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.badge}`}>
                      {skill.domain}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ~{skill.tokenEstimate} tokens
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {skill.name.split("/").pop()}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                    {skill.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {skill.triggers.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                        {kw}
                      </span>
                    ))}
                    {(skill.triggers.keywords?.length ?? 0) > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{(skill.triggers.keywords?.length ?? 0) - 3} more
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize">Level: {skill.loadLevel}</span>
                    <span className="text-purple-400 font-medium group-hover:translate-x-0.5 transition-transform">
                      Inspect & Export →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="mt-12 text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <p className="text-base text-slate-400">No skills match your search filters.</p>
            <button
              onClick={() => {
                setSelectedDomain("all");
                setSearchQuery("");
              }}
              className="mt-3 text-sm text-purple-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Modal / Drawer Detail View */}
      {activeSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#0e0e18] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#121220]">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                  {activeSkill.domain}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {activeSkill.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveSkill(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                  {activeSkill.description}
                </p>
              </div>

              {/* Triggers & Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trigger Keywords</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeSkill.triggers.keywords?.map((kw, i) => (
                      <span key={i} className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs text-purple-300 font-mono">
                        {kw}
                      </span>
                    )) || <span className="text-xs text-slate-500">None declared</span>}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Agents</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeSkill.triggers.agents?.map((agent, i) => (
                      <span key={i} className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300 font-mono">
                        {agent}
                      </span>
                    )) || <span className="text-xs text-slate-500">All Council Agents</span>}
                  </div>
                </div>
              </div>

              {/* Multi-Platform Export Tab */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Compiled IDE Export
                  </h4>
                  <div className="flex gap-1 bg-white/[0.05] p-1 rounded-lg border border-white/[0.05]">
                    {(["antigravity", "claude", "cursor", "codex", "cline"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setExportPlatform(p)}
                        className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition ${
                          exportPlatform === p
                            ? "bg-purple-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <pre className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#060609] p-4 text-xs font-mono text-slate-300">
                    {getExportSnippet(activeSkill, exportPlatform)}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        getExportSnippet(activeSkill, exportPlatform),
                        `snippet-${activeSkill.id}-${exportPlatform}`
                      )
                    }
                    className="absolute right-3 top-3 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition backdrop-blur border border-white/10"
                  >
                    {copiedKey === `snippet-${activeSkill.id}-${exportPlatform}`
                      ? "✓ Copied!"
                      : `Copy for ${exportPlatform}`}
                  </button>
                </div>
              </div>

              {/* Full Procedure Content */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Canonical Markdown Content
                </h4>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {activeSkill.body}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#121220]">
              <span className="text-xs text-slate-500 font-mono">
                Key: {activeSkill.id} · Est: {activeSkill.tokenEstimate} tokens
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(activeSkill.body, `raw-${activeSkill.id}`)
                  }
                  className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/15 transition border border-white/10"
                >
                  {copiedKey === `raw-${activeSkill.id}` ? "✓ Copied!" : "Copy Raw Markdown"}
                </button>
                <button
                  onClick={() => setActiveSkill(null)}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

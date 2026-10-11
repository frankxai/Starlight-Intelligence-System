"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Calculator,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Check,
  Copy,
  Download,
  ExternalLink,
  Code2,
  Workflow,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Gauge,
  Sliders,
  Share2,
} from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  domain: string;
  version: string;
  description: string;
  contextTokens: number;
  maturityStage: number;
  stageLabel: string;
  triggers: string[];
}

const DEFAULT_SKILLS: SkillItem[] = [
  {
    id: "safety-secret-detector",
    name: "safety/secret-detector",
    domain: "safety",
    version: "1.0.0",
    description: "Zero-trust PII and high-entropy credential scrubbing gateway.",
    contextTokens: 800,
    maturityStage: 3,
    stageLabel: "Tested & Automated",
    triggers: ["api_key", "secret", "token", "sanitize"],
  },
  {
    id: "intelligence-strategic-reasoning",
    name: "intelligence/strategic-reasoning",
    domain: "intelligence",
    version: "1.0.0",
    description: "First-principles strategic reasoning, trade-offs, and second-order modeling.",
    contextTokens: 1400,
    maturityStage: 4,
    stageLabel: "Sovereign Syndicated",
    triggers: ["strategy", "decision", "trade-off", "architecture"],
  },
  {
    id: "orchestration-multi-agent",
    name: "orchestration/multi-agent-coordination",
    domain: "orchestration",
    version: "1.0.0",
    description: "Hierarchical multi-agent swarm coordination and Santa convergence loops.",
    contextTokens: 1600,
    maturityStage: 4,
    stageLabel: "Sovereign Syndicated",
    triggers: ["swarm", "subagent", "dispatch", "consensus"],
  },
  {
    id: "memory-vault-management",
    name: "memory/vault-management",
    domain: "memory",
    version: "1.0.0",
    description: "Event-sourced memory recall, contradiction resolution & dreaming.",
    contextTokens: 900,
    maturityStage: 3,
    stageLabel: "Tested & Automated",
    triggers: ["vault", "recall", "memory", "dreaming"],
  },
  {
    id: "code-debugging",
    name: "code-intelligence/systematic-debugging",
    domain: "code-intelligence",
    version: "1.0.0",
    description: "Deterministic 4-phase root cause isolation and regression proofing.",
    contextTokens: 1200,
    maturityStage: 3,
    stageLabel: "Tested & Automated",
    triggers: ["debug", "error", "traceback", "fix"],
  },
];

const HARNESS_LIST = [
  { id: "claude-code", name: "Claude Code", file: ".claude/config.json", format: "JSON + Markdown" },
  { id: "codex", name: "OpenAI Codex", file: ".codex/skills.json", format: "OpenAI AgentKit Schema" },
  { id: "antigravity", name: "Antigravity", file: ".antigravity/skills.json", format: "Auto-Hooks + JSON" },
  { id: "grok", name: "Grok CLI", file: "grok-skills.json", format: "Grok Triggers JSON" },
  { id: "hermes", name: "Hermes Agent", file: "hermes-skills.json", format: "Hermes Runner JSON" },
  { id: "gemini-cli", name: "Gemini CLI", file: "gemini-skills.json", format: "Prompt Contract JSON" },
  { id: "cursor", name: "Cursor IDE", file: ".cursorrules", format: "Cursor Rules MD" },
  { id: "opencode", name: "OpenCode", file: "opencode.skills.json", format: "OpenCode Manifest JSON" },
  { id: "kilo", name: "Kilo Engine", file: "kilo.config.json", format: "Kilo Config JSON" },
  { id: "windsurf", name: "Windsurf Cascade", file: ".windsurfrules", format: "Cascade Markdown" },
];

export function SkillsClient() {
  const [activeTab, setActiveTab] = useState<"calculator" | "harnesses" | "headroom" | "syndicate">("calculator");

  // Valuation Calculator State
  const [skillName, setSkillName] = useState("safety/secret-detector");
  const [skillDomain, setSkillDomain] = useState("safety");
  const [capabilityDepth, setCapabilityDepth] = useState(85);
  const [complexityMultiplier, setComplexityMultiplier] = useState(1.8);
  const [weeklyHoursSaved, setWeeklyHoursSaved] = useState(4.5);

  // Harness Studio State
  const [selectedHarness, setSelectedHarness] = useState("claude-code");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(["safety-secret-detector", "code-debugging"]);

  // Clipboard State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Empirical Valuation Derivations
  const valuationMetrics = useMemo(() => {
    const annualLaborSavingsUSD = weeklyHoursSaved * 50 * 125;
    const valuationIndex = Math.round((capabilityDepth / 100) * complexityMultiplier * (annualLaborSavingsUSD / 1000) * 10) / 10;

    let freeMSRP = 0;
    let builderTier = Math.max(19, Math.round(valuationIndex * 3));
    let proTier = Math.max(49, Math.round(valuationIndex * 8));
    let teamTierMonthly = Math.max(99, Math.round(valuationIndex * 15));
    let enterpriseAnnual = Math.max(1200, Math.round(annualLaborSavingsUSD * 0.15));

    return {
      valuationIndex,
      annualLaborSavingsUSD,
      pricing: {
        freeMSRP,
        builderTier,
        proTier,
        teamTierMonthly,
        enterpriseAnnual,
      },
    };
  }, [capabilityDepth, complexityMultiplier, weeklyHoursSaved]);

  // Selected Skills objects
  const activeSkills = useMemo(() => {
    return DEFAULT_SKILLS.filter((s) => selectedSkillIds.includes(s.id));
  }, [selectedSkillIds]);

  // Dynamic Harness Code Generator
  const generatedHarnessCode = useMemo(() => {
    const currentHarness = HARNESS_LIST.find((h) => h.id === selectedHarness);
    if (!currentHarness) return "";

    switch (selectedHarness) {
      case "claude-code":
        return JSON.stringify(
          {
            name: "starlight-agent-fleet",
            version: "1.0.0",
            harness: "claude-code",
            enabledSkills: activeSkills.map((s) => s.name),
            mcpServers: {
              starlight: {
                command: "starlight",
                args: ["mcp", "serve"],
              },
            },
          },
          null,
          2
        );

      case "codex":
        return JSON.stringify(
          {
            $schema: "https://schemas.openai.com/codex/skills.v1.json",
            skills: activeSkills.map((s) => ({
              name: s.name,
              description: s.description,
              domain: s.domain,
              parameters: { type: "object", properties: { task: { type: "string" } } },
            })),
          },
          null,
          2
        );

      case "antigravity":
        return JSON.stringify(
          {
            target: "antigravity",
            autoHooksEnabled: true,
            skills: activeSkills.map((s) => ({
              name: s.name,
              triggers: { keywords: s.triggers },
              permissions: { terminal: "read-write", filesystem: "read-write" },
            })),
          },
          null,
          2
        );

      case "cursor":
        return [
          "# Cursor Rules — Starlight Intelligence Fleet",
          "",
          "## Active Skills & Verification Directives",
          "",
          ...activeSkills.map((s) => {
            return `### ${s.name}\n- Description: ${s.description}\n- Context Budget: ~${s.contextTokens} tokens\n- Triggers: ${s.triggers.join(", ")}\n`;
          }),
        ].join("\n");

      default:
        return JSON.stringify(
          {
            harness: selectedHarness,
            project: "starlight-sovereign",
            activeSkills: activeSkills.map((s) => ({
              id: s.name,
              domain: s.domain,
              triggers: s.triggers,
            })),
          },
          null,
          2
        );
    }
  }, [selectedHarness, activeSkills]);

  return (
    <div className="space-y-12">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl max-w-2xl mx-auto backdrop-blur-md">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "calculator"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Valuation Engine
        </button>
        <button
          onClick={() => setActiveTab("harnesses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "harnesses"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Terminal className="w-4 h-4" />
          10-Harness Studio
        </button>
        <button
          onClick={() => setActiveTab("headroom")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "headroom"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Gauge className="w-4 h-4" />
          Context Headroom
        </button>
        <button
          onClick={() => setActiveTab("syndicate")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "syndicate"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Share2 className="w-4 h-4" />
          Marketplace Syndicator
        </button>
      </div>

      {/* TAB 1: VALUATION CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls */}
          <div className="lg:col-span-6 space-y-6 bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Skill Parameters</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Formula: V = D × C × S
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1.5">Skill Name</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">Capability Depth Score</label>
                  <span className="text-xs font-mono text-emerald-400">{capabilityDepth} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={capabilityDepth}
                  onChange={(e) => setCapabilityDepth(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Measures instruction completeness, error handlers, and schemas.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">Execution Complexity Multiplier</label>
                  <span className="text-xs font-mono text-emerald-400">{complexityMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={complexityMultiplier}
                  onChange={(e) => setComplexityMultiplier(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">1.0x (Prompt-only) $\to$ 1.8x (Script runner) $\to$ 2.5x (Zero-trust crypto/mesh).</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">Estimated Weekly Hours Saved</label>
                  <span className="text-xs font-mono text-emerald-400">{weeklyHoursSaved.toFixed(1)} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={weeklyHoursSaved}
                  onChange={(e) => setWeeklyHoursSaved(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Benchmarked against senior engineering rate ($125/hr × 50 weeks).</p>
              </div>
            </div>
          </div>

          {/* Real-Time Valuation Output */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-black border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Empirical Valuation Index
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  SIP v1.1.1 Attested
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <div className="text-4xl font-extrabold text-white font-mono">{valuationMetrics.valuationIndex}</div>
                <span className="text-sm text-zinc-400">points</span>
              </div>

              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-300">Annual Labor Savings:</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ${valuationMetrics.annualLaborSavingsUSD.toLocaleString()} / year
                </span>
              </div>

              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Suggested Fair-Market Pricing Tiers
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-400">Free Community</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">$0</div>
                  <div className="text-[10px] text-zinc-500">Permissive Open Source (MIT)</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-400">Builder Tier</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    ${valuationMetrics.pricing.builderTier}
                  </div>
                  <div className="text-[10px] text-zinc-500">Single seat lifetime license</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-400">Pro Tier</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    ${valuationMetrics.pricing.proTier}
                  </div>
                  <div className="text-[10px] text-zinc-500">Commercial with scripts</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-400">Team Tier</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    ${valuationMetrics.pricing.teamTierMonthly}
                    <span className="text-xs text-zinc-500 font-normal">/mo</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">5-15 Seats with Telemetry</div>
                </div>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        skill: skillName,
                        valuationIndex: valuationMetrics.valuationIndex,
                        annualLaborSavingsUSD: valuationMetrics.annualLaborSavingsUSD,
                        pricing: valuationMetrics.pricing,
                        attestation: "Built on SIP — Starlight Intelligence Protocol v1.1.1",
                      },
                      null,
                      2
                    ),
                    "valuation"
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {copiedKey === "valuation" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === "valuation" ? "Valuation Copied!" : "Copy Valuation Audit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10-HARNESS STUDIO */}
      {activeTab === "harnesses" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-white mb-2">Select Target Harness</h3>
            <div className="space-y-2">
              {HARNESS_LIST.map((harness) => (
                <button
                  key={harness.id}
                  onClick={() => setSelectedHarness(harness.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedHarness === harness.id
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{harness.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{harness.file}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                    {harness.format}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-zinc-300">
                  {HARNESS_LIST.find((h) => h.id === selectedHarness)?.file}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(generatedHarnessCode, "code")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
              >
                {copiedKey === "code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "code" ? "Copied" : "Copy Config"}
              </button>
            </div>

            <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-[500px] leading-relaxed">
              {generatedHarnessCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: CONTEXT HEADROOM */}
      {activeTab === "headroom" && (
        <div className="space-y-6 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-semibold text-white">Council Agent Context Headroom Allocation</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Starlight enforces dynamic reasoning headroom (&gt;50%) to prevent model degradation from skill bloat.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono">
              Status: HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "orchestrator", skills: 2, tokens: 2200, headroom: 55, color: "emerald" },
              { id: "prime", skills: 2, tokens: 1800, headroom: 60, color: "emerald" },
              { id: "architect", skills: 1, tokens: 1200, headroom: 75, color: "emerald" },
              { id: "sentinel", skills: 2, tokens: 1600, headroom: 68, color: "emerald" },
              { id: "weaver", skills: 1, tokens: 900, headroom: 82, color: "emerald" },
              { id: "sage", skills: 1, tokens: 800, headroom: 84, color: "emerald" },
            ].map((agent) => (
              <div key={agent.id} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">starlight-{agent.id}</span>
                  <span className="text-[11px] text-zinc-400">{agent.skills} skills assigned</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-500 font-mono">{agent.tokens} static tokens</span>
                    <span className="text-emerald-400 font-mono font-semibold">{agent.headroom}% Headroom</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${agent.headroom}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-MARKETPLACE SYNDICATOR */}
      {activeTab === "syndicate" && (
        <div className="space-y-6 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-semibold text-white">Universal Marketplace Syndicator & SIP Attestation</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Author once in canonical Starlight format; export simultaneously to all major AI skill marketplaces.
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono">
              5 Marketplaces Supported
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { id: "starlight", name: "Starlight Hub", file: "starlight-manifest.json", ready: true },
              { id: "openclaw", name: "OpenClaw", file: "claw.json", ready: true },
              { id: "agentskills", name: "AgentSkills (npm)", file: "package.json", ready: true },
              { id: "claude", name: "Anthropic Claude", file: ".claude-plugin.json", ready: true },
              { id: "openai", name: "OpenAI Actions", file: "openapi.json", ready: true },
            ].map((mkt) => (
              <div key={mkt.id} className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{mkt.name}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] font-mono text-zinc-500">{mkt.file}</div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-black/80 border border-purple-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold font-mono">
              <span>Cryptographic Proof: SIP v1.1.1 Attestation Footer</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `---\nBuilt on SIP — Starlight Intelligence Protocol v1.1.1\n- Skill: safety/secret-detector v1.0.0\n- Domain: safety\n- Integrity SHA256: d52d153efab388c20cb39d43a8a05e3e995c963c4dfba1d12a297c4ae07de0c0\n- Substrate: starlightintelligence.org/protocol\n---`,
                    "attest"
                  )
                }
                className="flex items-center gap-1 hover:text-white"
              >
                {copiedKey === "attest" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "attest" ? "Copied" : "Copy Seal"}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-zinc-400">
{`---
Built on SIP — Starlight Intelligence Protocol v1.1.1
- Skill: safety/secret-detector v1.0.0
- Domain: safety
- Author: Starlight Security Council
- License: MIT
- Integrity SHA256: d52d153efab388c20cb39d43a8a05e3e995c963c4dfba1d12a297c4ae07de0c0
- Substrate: starlightintelligence.org/protocol
---`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

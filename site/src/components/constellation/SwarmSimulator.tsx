"use client";

import { useState } from "react";
import Image from "next/image";
import { ALL_AGENTS, SWARM_HOUSES, type PublicAgent } from "@/lib/constellation-data";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Shield,
  Layers,
  ArrowRight,
  Cpu
} from "lucide-react";

interface StepLog {
  agentName: string;
  role: string;
  action: string;
  status: "success" | "warning" | "evaluating";
  output: string;
  tokenCost: number;
}

export function SwarmSimulator() {
  const [activeHouse, setActiveHouse] = useState<string>("all");
  const [selectedConductor, setSelectedConductor] = useState<PublicAgent>(
    ALL_AGENTS.find((a) => a.id === "cassian-orchestration-lead") || ALL_AGENTS[0]
  );
  const [selectedSpecialists, setSelectedSpecialists] = useState<PublicAgent[]>([
    ALL_AGENTS.find((a) => a.id === "bastion-governance-sentinel") || ALL_AGENTS[2],
    ALL_AGENTS.find((a) => a.id === "quill-source-analyst") || ALL_AGENTS[1],
  ].filter(Boolean) as PublicAgent[]);

  const [missionPrompt, setMissionPrompt] = useState(
    "Audit SQLite hybrid FTS5 memory indexing, detect contradiction edge cases in strategic vault, and generate SIP v1.1.1 verifiable attestation receipt."
  );

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<StepLog[]>([]);
  const [activeTab, setActiveTab] = useState<"simulator" | "cursorrules" | "claude" | "windsurf" | "antigravity">("simulator");
  const [copiedCode, setCopiedCode] = useState(false);

  const toggleSpecialist = (agent: PublicAgent) => {
    if (agent.id === selectedConductor.id) return;
    if (selectedSpecialists.some((a) => a.id === agent.id)) {
      if (selectedSpecialists.length > 1) {
        setSelectedSpecialists(selectedSpecialists.filter((a) => a.id !== agent.id));
      }
    } else {
      if (selectedSpecialists.length < 4) {
        setSelectedSpecialists([...selectedSpecialists, agent]);
      }
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationLogs([]);

    const steps: StepLog[] = [
      {
        agentName: selectedConductor.display_name,
        role: "Conductor / Orchestrator",
        action: "Triage Intent & Parse Mission Constraints",
        status: "evaluating",
        output: `Validated mission scope: "${missionPrompt}". Sized council to ${1 + selectedSpecialists.length} agents. Enforcing Rule of 7 and SIP Layer 5 Human Sovereignty lock.`,
        tokenCost: 480,
      },
      ...selectedSpecialists.map((agent, i) => ({
        agentName: agent.display_name,
        role: agent.role_title,
        action: `Execute Domain Pass: ${agent.capabilities[0] || "Specialist Evaluation"}`,
        status: (i === 1 ? "warning" : "success") as "success" | "warning",
        output: `Evaluated authority statement: "${agent.prompt_contract.authority_statement}". Checked stop condition: "${agent.stop_conditions[0] || "Halt on ambiguous intent"}". Generated verified execution trace.`,
        tokenCost: 820 + i * 150,
      })),
      {
        agentName: selectedConductor.display_name,
        role: "Conductor / Synthesis",
        action: "Consensus Synthesis & Attestation Sign-off",
        status: "success",
        output: `Consensus verified across ${selectedSpecialists.length} specialists. Generated starlight.run_receipt.json with sha256 hash. Handoff to human operator for final write gate approval.`,
        tokenCost: 610,
      },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, step]);
        if (index === steps.length - 1) {
          setIsSimulating(false);
        }
      }, (index + 1) * 600);
    });
  };

  const getExportCode = () => {
    const allSwarmAgents = [selectedConductor, ...selectedSpecialists];

    if (activeTab === "cursorrules") {
      return `---
description: Starlight Governed Council (.cursorrules / MDC)
globs: **/*
alwaysApply: true
---
# Starlight Governed Swarm Configuration
# Substrate: SIP v1.1.1 (Starlight Intelligence Protocol)

## Active Council (${allSwarmAgents.length} Agents)
- **Conductor**: ${selectedConductor.display_name} (${selectedConductor.role_title})
  - Authority: ${selectedConductor.prompt_contract.authority_statement}
${selectedSpecialists
  .map(
    (s) =>
      `- **Specialist**: ${s.display_name} (${s.role_title})\n  - Authority: ${s.prompt_contract.authority_statement}\n  - Stop Condition: ${s.stop_conditions[0] || "Halt on unverified state"}`
  )
  .join("\n")}

## Governance Invariants
1. Human holds the irreversible write and deploy key.
2. Limit consensus loops to 3–5 agents (Rule of 7).
3. Validate memory against JSONL before executing modifying actions.
4. Output must carry verifiable SIP attestation footer.
`;
    }

    if (activeTab === "claude") {
      return `# CLAUDE.md - Starlight Governed Agent Fleet
# Protocol: Starlight Intelligence Protocol v1.1.1

## Swarm Conductor
- **Lead**: ${selectedConductor.display_name}
- **Role**: ${selectedConductor.role_title}
- **Mission Boundary**: ${selectedConductor.prompt_contract.authority_statement}

## Governed Specialist Fleet
${selectedSpecialists
  .map(
    (s) => `### ${s.display_name} (${s.role_title})
- **Authority**: ${s.prompt_contract.authority_statement}
- **Capabilities**: ${s.capabilities.join(" · ")}
- **Stop Invariants**: ${s.stop_conditions.join(" | ")}`
  )
  .join("\n\n")}

## Memory & MCP Wiring
- Memory Vaults: strategic, technical, operational, creative, wisdom, horizon
- Run Command: \`node node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js\`
`;
    }

    if (activeTab === "windsurf") {
      return `# .windsurfrules - Starlight Swarm Protocol
# Active Swarm: ${selectedConductor.display_name} + ${selectedSpecialists.map((s) => s.display_name).join(", ")}

[SWARM_ORCHESTRATOR]
conductor = "${selectedConductor.id}"
authority = "${selectedConductor.prompt_contract.authority_statement}"

[SPECIALISTS]
${selectedSpecialists.map((s) => `${s.id} = { role = "${s.role_title}", authority = "${s.prompt_contract.authority_statement}" }`).join("\n")}

[GOVERNANCE]
human_in_the_loop = true
max_council_size = 5
sqlite_fts5_indexing = true
proof_format = "starlight.run_receipt.json"
`;
    }

    if (activeTab === "antigravity") {
      return JSON.stringify(
        {
          $schema: "https://antigravity.dev/schemas/subagent-swarm.v1.json",
          swarm_name: `${selectedConductor.display_name}-Council`,
          protocol: "SIP-v1.1.1",
          conductor: {
            name: selectedConductor.id,
            role: selectedConductor.role_title,
            authority: selectedConductor.prompt_contract.authority_statement,
          },
          specialists: selectedSpecialists.map((s) => ({
            name: s.id,
            role: s.role_title,
            authority: s.prompt_contract.authority_statement,
            capabilities: s.capabilities,
            stop_conditions: s.stop_conditions,
          })),
          governance: {
            require_human_gate: true,
            max_active_agents: 5,
            memory_mount: "starlight-sis",
          },
        },
        null,
        2
      );
    }

    return "";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getExportCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const totalTokens = simulationLogs.reduce((acc, curr) => acc + curr.tokenCost, 0);

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0c0c16] p-6 shadow-2xl md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Cpu className="h-4 w-4" /> Interactive Council Simulator & Export Lab
          </div>
          <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">
            Simulate Governed Agent Handoffs in Real-Time
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Configure conductors and specialists, test multi-agent consensus chains, and export production configurations.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "simulator" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setActiveTab("cursorrules")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "cursorrules" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            .cursorrules
          </button>
          <button
            onClick={() => setActiveTab("claude")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "claude" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            CLAUDE.md
          </button>
          <button
            onClick={() => setActiveTab("windsurf")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "windsurf" ? "bg-fuchsia-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Windsurf
          </button>
          <button
            onClick={() => setActiveTab("antigravity")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "antigravity" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Antigravity JSON
          </button>
        </div>
      </div>

      {activeTab === "simulator" ? (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Configuration Controls */}
          <div>
            {/* Mission Input */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-300">
                Mission Intent & Objective
              </label>
              <div className="mt-2 relative">
                <textarea
                  value={missionPrompt}
                  onChange={(e) => setMissionPrompt(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                  placeholder="Enter multi-agent mission..."
                />
              </div>
            </div>

            {/* Conductor Selector */}
            <div className="mt-5">
              <label className="font-mono text-xs uppercase tracking-wider text-violet-400">
                1. Select Swarm Conductor (1 Lead)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_AGENTS.filter((a) => a.role_kind === "conductor").slice(0, 6).map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedConductor(agent)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                      selectedConductor.id === agent.id
                        ? "border-violet-400 bg-violet-600/20 text-white shadow-[0_0_15px_rgba(167,139,250,0.2)]"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-black/40">
                      <Image src={agent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"} alt={agent.display_name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{agent.display_name}</div>
                      <div className="truncate font-mono text-[9px] text-slate-500">{agent.role_title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialist Selector */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                  2. Select Specialists ({selectedSpecialists.length}/4 active)
                </label>
                <span className="font-mono text-[10px] text-slate-500">Max 4 specialists</span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_AGENTS.filter((a) => a.role_kind === "specialist").slice(0, 9).map((agent) => {
                  const isSelected = selectedSpecialists.some((s) => s.id === agent.id);
                  return (
                    <button
                      key={agent.id}
                      onClick={() => toggleSpecialist(agent)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-600/20 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-black/40">
                        <Image src={agent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"} alt={agent.display_name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold">{agent.display_name}</div>
                        <div className="truncate font-mono text-[9px] text-slate-500">{agent.role_title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Action */}
            <div className="mt-6">
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(167,139,250,0.3)] transition hover:opacity-90 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Simulating Council Consensus...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" /> Execute Governed Council Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Execution Console */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/80 p-4 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold">Swarm Execution Trace</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {isSimulating ? "RUNNING..." : simulationLogs.length > 0 ? "DONE" : "IDLE"}
                </div>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[340px] pr-1">
                {simulationLogs.length === 0 && !isSimulating && (
                  <div className="py-12 text-center text-slate-600">
                    <p>Click &ldquo;Execute Governed Council Run&rdquo; to simulate execution handoffs.</p>
                  </div>
                )}

                {simulationLogs.map((log, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] leading-relaxed transition-all"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {log.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {log.status === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                        {log.status === "evaluating" && <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />}
                        {log.agentName}
                      </span>
                      <span className="text-[9px] text-slate-500">{log.tokenCost} tokens</span>
                    </div>
                    <div className="mt-1 text-[10px] text-violet-400 font-semibold">{log.action}</div>
                    <p className="mt-1 text-slate-300 font-sans text-xs">{log.output}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics footer */}
            {simulationLogs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Total Token Budget: <strong className="text-white">{totalTokens} tokens</strong></span>
                <span className="text-emerald-400">Status: Governed Proof Verified</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Export Code Tab */
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
              {activeTab === "cursorrules" && "Production .cursorrules (MDC Rule)"}
              {activeTab === "claude" && "Production CLAUDE.md System Prompt"}
              {activeTab === "windsurf" && "Production .windsurfrules Config"}
              {activeTab === "antigravity" && "Production Antigravity Subagent Swarm Spec"}
            </span>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? "Copied!" : "Copy Configuration"}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/90 p-4 font-mono text-xs leading-relaxed text-slate-300 max-h-[380px]">
            <code>{getExportCode()}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

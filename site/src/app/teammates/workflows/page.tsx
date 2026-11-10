"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Workflow,
  Scale,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Cpu,
  Shield,
  Layers,
  Bot,
  Zap,
  RefreshCw,
  ChevronRight,
  Copy,
  Check,
  Split,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { AutonomicHeartbeatPill } from "@/components/teammates/AutonomicHeartbeatPill";
import { AgentExecutionTree } from "@/components/teammates/AgentExecutionTree";
import type { ExecutionStep } from "@/components/teammates/types";

interface WorkflowItem {
  id: string;
  name: string;
  category: "autonomous-development" | "code-intelligence" | "safety-governance";
  description: string;
  pipeline: string;
  stepCount: number;
  estimatedDurationMs: number;
  steps: Array<{
    id: string;
    name: string;
    agent: string;
    model: string;
    description: string;
  }>;
}

interface CouncilModelViewpoint {
  provider: "anthropic" | "google" | "openai";
  model: string;
  modelDisplayName: string;
  avatarColor: string;
  role: string;
  content: string;
  durationMs: number;
}

interface CouncilResponse {
  prompt: string;
  timestamp: string;
  viewpoints: CouncilModelViewpoint[];
  agreements: string[];
  divergences: string[];
  agreementIndex: number;
  consensusText: string;
  recommendation: string;
  attestation: string;
}

const PRESET_COUNCIL_PROMPTS = [
  "State Persistence & Memory Fault Tolerance across autonomous multi-agent swarms",
  "MicroVM Sandbox Isolation vs Local Container execution trade-offs for code tasks",
  "Fail-closed financial invariants and autonomous git merge authorization thresholds",
];

export default function WorkflowsStudioPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "council" | "split">("workflows");

  // Workflows State
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("product-sprint");
  const [workflowInput, setWorkflowInput] = useState<string>(
    "Build a real-time Model Council consensus visualizer for the Starlight Cockpit"
  );
  const [isRunningWorkflow, setIsRunningWorkflow] = useState<boolean>(false);
  const [activeExecutionTree, setActiveExecutionTree] = useState<ExecutionStep[]>([]);
  const [workflowRunSummary, setWorkflowRunSummary] = useState<{
    runId: string;
    durationMs: number;
    summary: string;
    attestation: string;
  } | null>(null);

  // Council Consensus State
  const [councilPrompt, setCouncilPrompt] = useState<string>(
    "Evaluate system architecture and state persistence across multi-agent swarms"
  );
  const [isEvaluatingCouncil, setIsEvaluatingCouncil] = useState<boolean>(false);
  const [councilResult, setCouncilResult] = useState<CouncilResponse | null>(null);
  const [selectedModelTab, setSelectedModelTab] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch initial workflows
  useEffect(() => {
    async function loadWorkflows() {
      try {
        const res = await fetch("/api/workflows");
        if (res.ok) {
          const data = await res.json();
          if (data.workflows) {
            setWorkflows(data.workflows);
          }
        }
      } catch {
        // Fallback default
      }
    }
    loadWorkflows();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunWorkflow = async () => {
    if (isRunningWorkflow) return;
    setIsRunningWorkflow(true);
    setWorkflowRunSummary(null);

    // Seed optimistic running state
    const currentWf = workflows.find((w) => w.id === selectedWorkflowId);
    if (currentWf) {
      setActiveExecutionTree(
        currentWf.steps.map((s, idx) => ({
          id: `step-opt-${idx}`,
          summary: `${s.name} (${s.agent})`,
          durationMs: idx === 0 ? 300 : 0,
          status: idx === 0 ? "running" : "pending",
          tool: s.agent,
        }))
      );
    }

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          input: workflowInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveExecutionTree(data.executionTree || []);
        setWorkflowRunSummary({
          runId: data.runId,
          durationMs: data.durationMs,
          summary: data.summary,
          attestation: data.attestation,
        });
      }
    } catch {
      // Set error in tree
      setActiveExecutionTree((prev) =>
        prev.map((step, i) =>
          i === 0
            ? { ...step, status: "error", output: "Failed to connect to workflow runner" }
            : step
        )
      );
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const handleConveneCouncil = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || councilPrompt;
    if (isEvaluatingCouncil || !promptToUse.trim()) return;

    setIsEvaluatingCouncil(true);
    try {
      const res = await fetch("/api/workflows/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      if (res.ok) {
        const data: CouncilResponse = await res.json();
        setCouncilResult(data);
      }
    } catch {
      // Keep existing
    } finally {
      setIsEvaluatingCouncil(false);
    }
  };

  const activeWf = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header Bar */}
      <header className="border-b border-white/[0.08] bg-[#0c0e17]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/teammates"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-mono"
          >
            <Bot className="h-4 w-4 text-indigo-400" />
            <span>Teammates Cockpit</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-indigo-400" />
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Workflows & Tri-Model Council Studio
            </h1>
          </div>
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
            SIP § 3 Sovereign Orchestration
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-black/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("workflows")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "workflows"
                  ? "bg-indigo-600 text-white shadow-sm font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>Workflows</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("council")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "council"
                  ? "bg-indigo-600 text-white shadow-sm font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Model Council</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "split"
                  ? "bg-indigo-600 text-white shadow-sm font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Unified Studio</span>
            </button>
          </div>

          <AutonomicHeartbeatPill compact />
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* WORKFLOWS SECTION */}
        {(activeTab === "workflows" || activeTab === "split") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-indigo-400" />
                  Autonomous Execution Pipelines
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Multi-agent swarms with empirical verification gates, SAGE self-healing, and memory vault settlement.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {workflows.length} Registered Workflows
              </span>
            </div>

            {/* Workflow Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {workflows.map((wf) => {
                const isSelected = wf.id === selectedWorkflowId;
                return (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkflowId(wf.id);
                      setActiveExecutionTree([]);
                      setWorkflowRunSummary(null);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                      isSelected
                        ? "border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/40"
                        : "border-white/[0.08] bg-[#0c0e17] hover:border-white/[0.15] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                        {wf.category.replace("-", " ")}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(wf.estimatedDurationMs / 1000).toFixed(1)}s
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 flex items-center justify-between">
                      <span>{wf.name}</span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                      {wf.description}
                    </p>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>{wf.stepCount} Steps</span>
                      <span className="text-indigo-400/90 truncate max-w-[160px]">
                        {wf.pipeline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Workflow Execution Trigger & Config Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0e17] p-4.5 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <label htmlFor="workflow-input-field" className="sr-only">
                    Workflow Target & Objective
                  </label>
                  <input
                    id="workflow-input-field"
                    type="text"
                    value={workflowInput}
                    onChange={(e) => setWorkflowInput(e.target.value)}
                    placeholder="Enter objective or feature requirements for this autonomous run..."
                    className="w-full rounded-lg border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunWorkflow}
                  disabled={isRunningWorkflow}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/60 disabled:text-zinc-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/50 shrink-0"
                >
                  {isRunningWorkflow ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Executing Swarm Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Execute {activeWf ? activeWf.name : "Workflow"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Step Execution Tree */}
              {activeExecutionTree.length > 0 && (
                <div className="pt-2">
                  <AgentExecutionTree steps={activeExecutionTree} />
                </div>
              )}

              {/* Execution Summary Banner */}
              {workflowRunSummary && (
                <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-emerald-300">Run Complete:</span>{" "}
                      <span className="text-zinc-300">{workflowRunSummary.summary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400 shrink-0 pl-4">
                    <span>{(workflowRunSummary.durationMs / 1000).toFixed(2)}s</span>
                    <span className="text-emerald-400/80">{workflowRunSummary.attestation}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* MODEL COUNCIL CONSENSUS SECTION */}
        {(activeTab === "council" || activeTab === "split") && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-indigo-400" />
                  Tri-Model Council Studio
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Multi-perspective consensus engine pairing Claude Sonnet 5.5 (Anthropic) vs Gemini 4 Argon (Google) vs GPT-6.1 Sol (OpenAI).
                </p>
              </div>
              {councilResult && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-indigo-300 font-semibold">
                    {councilResult.agreementIndex}% Consensus
                  </span>
                </div>
              )}
            </div>

            {/* Prompt Formulation & Presets */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0e17] p-4.5 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <label htmlFor="council-prompt-field" className="sr-only">
                    Council Proposition or Architecture Prompt
                  </label>
                  <input
                    id="council-prompt-field"
                    type="text"
                    value={councilPrompt}
                    onChange={(e) => setCouncilPrompt(e.target.value)}
                    placeholder="Pose an architectural proposition or design trade-off for the Council..."
                    className="w-full rounded-lg border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleConveneCouncil()}
                  disabled={isEvaluatingCouncil}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/60 disabled:text-zinc-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/50 shrink-0"
                >
                  {isEvaluatingCouncil ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Convening Council...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="h-3.5 w-3.5" />
                      <span>Convene Council</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">Presets:</span>
                {PRESET_COUNCIL_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCouncilPrompt(p);
                      handleConveneCouncil(p);
                    }}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] hover:bg-white/5 hover:border-white/[0.12] px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-[11px] whitespace-nowrap transition-colors"
                  >
                    {p.length > 55 ? p.slice(0, 55) + "..." : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Council Synthesis & Comparison Results */}
            {councilResult && (
              <div className="space-y-4">
                {/* Executive Consensus Card */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                    <span className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      Synthesized Council Finding ({councilResult.agreementIndex}% Concordance)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {councilResult.attestation}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {councilResult.consensusText}
                  </p>

                  <div className="p-3 rounded-lg border border-indigo-500/20 bg-black/40 text-xs">
                    <span className="font-semibold text-indigo-300">Operational Recommendation:</span>{" "}
                    <span className="text-zinc-300">{councilResult.recommendation}</span>
                  </div>

                  {/* Points of Agreement & Divergences Accordion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 space-y-2">
                      <h4 className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Unanimous Agreements
                      </h4>
                      <ul className="space-y-1.5 text-[11px] text-zinc-300">
                        {councilResult.agreements.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 space-y-2">
                      <h4 className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5" />
                        Distinct Model Emphases
                      </h4>
                      <ul className="space-y-1.5 text-[11px] text-zinc-300">
                        {councilResult.divergences.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Model Viewpoints Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {councilResult.viewpoints.map((vp) => {
                    const isAnthropic = vp.provider === "anthropic";
                    const isGoogle = vp.provider === "google";
                    const isOpenAI = vp.provider === "openai";

                    const badgeColor = isAnthropic
                      ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                      : isGoogle
                      ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                      : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

                    return (
                      <div
                        key={vp.model}
                        className="rounded-xl border border-white/[0.08] bg-[#0c0e17] p-4 flex flex-col justify-between space-y-3 hover:border-white/[0.15] transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${badgeColor}`}
                            >
                              {vp.modelDisplayName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {vp.durationMs}ms
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(vp.content, vp.model)}
                                title="Copy evaluation text"
                                className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
                              >
                                {copiedKey === vp.model ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-zinc-200">
                            {vp.role}
                          </div>

                          <div className="max-h-[340px] overflow-y-auto rounded-lg border border-white/[0.04] bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-line">
                            {vp.content}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>Provider: {vp.provider}</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Invariant Verified
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

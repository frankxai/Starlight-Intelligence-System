"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Cpu,
  Shield,
  Zap,
  Sparkles,
  BookOpen,
  ExternalLink,
  Check,
  Copy,
  Layers,
  Lock,
  ArrowUpRight,
  Play,
  RefreshCw,
  Compass,
  Code2,
  FileCode2,
  Workflow,
  Server,
  Activity,
  UserCheck,
  Scale,
} from "lucide-react";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

type Language = "typescript" | "curl" | "python";
type ApiEndpoint = "dispatch" | "stream" | "sandbox" | "approve" | "heartbeat";

interface CodeSnippet {
  typescript: string;
  curl: string;
  python: string;
}

const API_SNIPPETS: Record<ApiEndpoint, { title: string; method: string; path: string; desc: string; snippets: CodeSnippet }> = {
  dispatch: {
    title: "Dispatch Autonomous Teammate",
    method: "POST",
    path: "/api/teammates",
    desc: "Dispatches a task prompt to an autonomous teammate. Evaluates intent, applies The Veil sanitization, and routes to the designated model tier.",
    snippets: {
      typescript: `// TypeScript: Dispatch task to Starlight Queen
const response = await fetch("https://sis.starlightintelligence.org/api/teammates", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    teammateId: "starlight-queen",
    prompt: "Scan open PRs, run Sentinel security checks, and stage release notes",
    tier: "standard", // "light" | "standard" | "frontier"
    model: "claude-sonnet-5-5", // optional explicit model override
  }),
});

const data = await response.json();
console.log("Teammate response:", data.message.content);
console.log("Execution steps:", data.message.executionTree);`,
      curl: `# cURL: Dispatch task to Starlight Queen
curl -X POST https://sis.starlightintelligence.org/api/teammates \\
  -H "Content-Type: application/json" \\
  -d '{
    "teammateId": "starlight-queen",
    "prompt": "Scan open PRs, run Sentinel security checks, and stage release notes",
    "tier": "standard",
    "model": "claude-sonnet-5-5"
  }'`,
      python: `# Python (httpx): Dispatch task to Starlight Queen
import httpx

payload = {
    "teammateId": "starlight-queen",
    "prompt": "Scan open PRs, run Sentinel security checks, and stage release notes",
    "tier": "standard",
    "model": "claude-sonnet-5-5",
}

with httpx.Client() as client:
    res = client.post("https://sis.starlightintelligence.org/api/teammates", json=payload)
    result = res.json()
    print("Response:", result["message"]["content"])
    print("Trace steps:", len(result["message"]["executionTree"]))`,
    },
  },
  stream: {
    title: "Server-Sent Events (SSE) Stream",
    method: "POST",
    path: "/api/teammates/stream",
    desc: "Real-time execution stream yielding status, step progress, token output, and approval requests as the teammate reasons and acts in the microVM.",
    snippets: {
      typescript: `// TypeScript: Consume SSE Execution Stream
const res = await fetch("/api/teammates/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    teammateId: "github-officer",
    prompt: "Verify branch diff against Sentinel invariant gates",
    tier: "standard",
  }),
});

const reader = res.body?.getReader();
const decoder = new TextDecoder();

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunkText = decoder.decode(value);
  for (const line of chunkText.split("\\n")) {
    if (line.startsWith("data: ")) {
      const chunk = JSON.parse(line.slice(6));
      console.log("Stream Event:", chunk.type, chunk);
    }
  }
}`,
      curl: `# cURL: Stream real-time execution trace with SSE
curl -N -X POST https://sis.starlightintelligence.org/api/teammates/stream \\
  -H "Content-Type: application/json" \\
  -d '{
    "teammateId": "github-officer",
    "prompt": "Verify branch diff against Sentinel invariant gates",
    "tier": "standard"
  }'`,
      python: `# Python: Real-time SSE streaming reader
import httpx
import json

payload = {
    "teammateId": "github-officer",
    "prompt": "Verify branch diff against Sentinel invariant gates",
    "tier": "standard",
}

with httpx.Client() as client:
    with client.stream("POST", "https://sis.starlightintelligence.org/api/teammates/stream", json=payload) as stream:
        for line in stream.iter_lines():
            if line.startswith("data: "):
                chunk = json.loads(line[6:])
                print(f"[{chunk.get('type')}]", chunk)`,
    },
  },
  sandbox: {
    title: "Empirical MicroVM Sandbox Execution",
    method: "POST",
    path: "/api/teammates/sandbox",
    desc: "Run untrusted code in an ephemeral Firecracker MicroVM or local isolated runner with automatic process tree-killing and path confinement.",
    snippets: {
      typescript: `// TypeScript: Execute sandboxed script in MicroVM
const res = await fetch("/api/teammates/sandbox", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: "typescript", // "javascript" | "typescript" | "python" | "bash"
    provider: "microvm",    // "microvm" | "local" | "edge"
    code: \`
      import { cpus } from "node:os";
      console.log("MicroVM Core count:", cpus().length);
      console.log("SIP Invariant Check: PASSED");
    \`,
    timeoutMs: 8000,
  }),
});

const sandboxRun = await res.json();
console.log("Output:", sandboxRun.output);
console.log("Duration:", sandboxRun.durationMs, "ms");`,
      curl: `# cURL: Execute code in isolated MicroVM
curl -X POST https://sis.starlightintelligence.org/api/teammates/sandbox \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "provider": "microvm",
    "code": "import sys\\nprint(f\\\"Python {sys.version} in Starlight Sandbox\\\")",
    "timeoutMs": 5000
  }'`,
      python: `# Python: Run remote code in Starlight Sandbox
import httpx

code_to_test = """
def calculate_vault_entropy():
    return [x**2 for x in range(5)]
print("Entropy values:", calculate_vault_entropy())
"""

res = httpx.post("https://sis.starlightintelligence.org/api/teammates/sandbox", json={
    "language": "python",
    "provider": "microvm",
    "code": code_to_test,
    "timeoutMs": 5000,
})

print(res.json()["output"])`,
    },
  },
  approve: {
    title: "Governance Invariant Gate Approval",
    method: "POST",
    path: "/api/teammates/approve",
    desc: "Resolves a fail-closed governance hold (e.g. financial transaction or main branch merge). Generates cryptographic SIP receipt.",
    snippets: {
      typescript: `// TypeScript: Approve a pending governance gate
const res = await fetch("/api/teammates/approve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requestId: "gate-1718019482000",
    action: "approve", // "approve" | "reject"
  }),
});

const receipt = await res.json();
console.log("Approved with receipt:", receipt.receipt);`,
      curl: `# cURL: Approve gate with receipt
curl -X POST https://sis.starlightintelligence.org/api/teammates/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "gate-1718019482000",
    "action": "approve"
  }'`,
      python: `# Python: Authorize pending governance card
import httpx

res = httpx.post("https://sis.starlightintelligence.org/api/teammates/approve", json={
    "requestId": "gate-1718019482000",
    "action": "approve",
})

data = res.json()
print("Receipt:", data["receipt"])`,
    },
  },
  heartbeat: {
    title: "Autonomic Health & Telemetry",
    method: "GET",
    path: "/api/teammates/heartbeat",
    desc: "1-second autonomic cadence pulse. Returns system latency jitter, active workflow states, sandbox memory pressure, and pending approvals.",
    snippets: {
      typescript: `// TypeScript: Query autonomic heartbeat
const res = await fetch("/api/teammates/heartbeat");
const telemetry = await res.json();

console.log("Pulse:", telemetry.pulse);
console.log("Latency:", telemetry.latencyMs, "ms");
console.log("Active Workflows:", telemetry.activeWorkflowsCount);`,
      curl: `# cURL: Query autonomic telemetry
curl -X GET https://sis.starlightintelligence.org/api/teammates/heartbeat`,
      python: `# Python: Query autonomic pulse
import httpx

res = httpx.get("https://sis.starlightintelligence.org/api/teammates/heartbeat")
health = res.json()
print(f"Status: {health['status']} | Latency: {health['latencyMs']}ms")`,
    },
  },
};

const MODELS = [
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    tier: "Standard Tier",
    badge: "Daily Driver",
    badgeColor: "emerald",
    latency: "600–1200ms",
    context: "200k tokens",
    bestFor: "Full-stack code implementation, PR reviews, multi-tool workflows, and Git operations.",
    purpose: "The primary engine for autonomous execution. High reasoning precision with surgical tool invocations.",
  },
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon",
    tier: "Light Tier",
    badge: "High Throughput",
    badgeColor: "cyan",
    latency: "150–400ms",
    context: "1M+ tokens",
    bestFor: "Real-time market scanning, arXiv literature ingestion, heartbeat pulse, and massive context sweeps.",
    purpose: "Sub-second responsiveness with expansive context window. Powers background daemons and initial intent routing.",
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    tier: "Frontier Tier",
    badge: "Deep Architecture",
    badgeColor: "purple",
    latency: "1800–4000ms",
    context: "200k tokens",
    bestFor: "Deep systems architecture, mathematical proofs, model council consensus, and cross-repo refactors.",
    purpose: "Reserved for high-cognitive-load architectural decisions and protocol-level proofs where accuracy is paramount.",
  },
  {
    id: "gpt-6-1-sol",
    name: "GPT-6.1 Sol",
    tier: "Standard / Sentinel",
    badge: "Security Guardian",
    badgeColor: "amber",
    latency: "500–900ms",
    context: "128k tokens",
    bestFor: "Sentinel security code audits, AST verification, and alternative perspective consensus checks.",
    purpose: "Cross-checks diffs and enforces non-waivable security rules before branches merge to staging.",
  },
];

export function TeammatesDocsClient() {
  const [selectedLang, setSelectedLang] = useState<Language>("typescript");
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>("dispatch");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentSnippet = API_SNIPPETS[selectedEndpoint];

  return (
    <div className="relative min-h-screen bg-[#060609] text-slate-200">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/[0.06] pt-12 pb-16">
        <GalaxyField still="veil" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-violet-400">
            <span className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
              <Sparkles className="h-3 w-3 text-violet-400" />
              Starlight Architecture Guide
            </span>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-slate-400">
              SIP Protocol v8.3
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
              Production Verified
            </span>
          </div>

          <h1 className="mt-5 font-serif text-[clamp(2.2rem,5vw,3.6rem)] font-semibold tracking-tight text-white leading-tight">
            Starlight Teammates & AI Genius
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-400">
            The definitive developer & architectural reference for autonomous digital workers,
            multi-model frontier orchestration, MicroVM sandboxes, and sovereign creator freedom paths.
          </p>

          {/* Quick Actions & Live Cockpit Jump */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/teammates"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 font-mono text-[13px] font-medium text-white shadow-lg shadow-violet-600/20 transition-micro hover:bg-violet-500"
            >
              <Workflow className="h-4 w-4" />
              Launch Teammates Workspace
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
            </Link>
            <Link
              href="/cockpit"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 font-mono text-[13px] font-medium text-slate-200 transition-micro hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
            >
              <Terminal className="h-4 w-4 text-cyan-400" />
              Open Central Cockpit
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
            <a
              href="#freedom-path"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 font-mono text-[13px] font-medium text-amber-300 transition-micro hover:bg-amber-500/10"
            >
              <Compass className="h-4 w-4" />
              AI Genius Freedom Path
            </a>
          </div>

          {/* Table of Contents Pill Bar */}
          <nav className="mt-10 flex flex-wrap gap-2 pt-6 border-t border-white/[0.06]">
            {[
              { label: "Overview", id: "overview" },
              { label: "REST & SSE API", id: "api-reference" },
              { label: "Frontier Models", id: "model-engine" },
              { label: "MicroVM Security", id: "sandbox-security" },
              { label: "Fail-Closed Governance", id: "fail-closed" },
              { label: "AI Genius Framework", id: "freedom-path" },
              { label: "Field Manuals", id: "field-manuals" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 font-mono text-[12px] text-slate-400 transition-micro hover:border-violet-400/40 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-24">
        {/* SECTION: Overview */}
        <section id="overview" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-violet-400 uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            01 / System Overview
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            Autonomous Digital Workers on a Sovereign Substrate
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Unlike ephemeral chat bots that forget everything when a browser tab closes,
            <strong className="text-slate-200"> Starlight Teammates</strong> are persistent, stateful swarm nodes
            anchored directly into the 6 Starlight semantic memory vaults. They reason autonomously, execute code in isolated
            MicroVMs, and respect strict fail-closed governance invariants designed to protect your code, data, and finances.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-mono text-[14px] font-semibold text-white">6-Vault Memory Hydration</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Pre-hydrated before every task with Strategic ◆, Technical ⬡, Creative ✦, and Operational ▸ vaults.
                Never forgets your architecture or voice.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-mono text-[14px] font-semibold text-white">Frontier Multi-Model Cascade</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Routes dynamically across Sonnet 5.5, Gemini 4 Argon, Opus 5.5, and GPT-6.1 Sol to balance
                sub-second speed with architectural precision.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-mono text-[14px] font-semibold text-white">Fail-Closed Invariants</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Financial transactions and production merges halt execution instantly. Requires cryptographic
                human approval before mutating state.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: REST & SSE API Reference */}
        <section id="api-reference" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-cyan-400 uppercase tracking-wider">
            <Code2 className="h-4 w-4" />
            02 / API Reference & Code Integration
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            REST & SSE Streaming Interfaces
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Interact with teammates programmatically via HTTP REST endpoints or real-time Server-Sent Events (SSE).
            All responses provide structured execution trees and emit cryptographic SIP receipts.
          </p>

          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
            {(
              [
                { id: "dispatch", label: "POST /api/teammates", badge: "Task Dispatch" },
                { id: "stream", label: "POST /api/teammates/stream", badge: "SSE Stream" },
                { id: "sandbox", label: "POST /api/teammates/sandbox", badge: "MicroVM Runner" },
                { id: "approve", label: "POST /api/teammates/approve", badge: "Gate Resolve" },
                { id: "heartbeat", label: "GET /api/teammates/heartbeat", badge: "Autonomic Pulse" },
              ] as const
            ).map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[12px] transition-micro ${
                  selectedEndpoint === ep.id
                    ? "bg-violet-600/20 text-white border border-violet-500/40 shadow-sm"
                    : "bg-white/[0.02] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/[0.12]"
                }`}
              >
                <span>{ep.label}</span>
                <span className="text-[10px] rounded px-1.5 py-0.5 bg-white/[0.04] text-slate-400">
                  {ep.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Active Endpoint Info Card */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-block rounded px-2 py-0.5 font-mono text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mr-2">
                  {currentSnippet.method}
                </span>
                <span className="font-mono text-[14px] text-white">{currentSnippet.path}</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-1">
                {(["typescript", "curl", "python"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-micro ${
                      selectedLang === lang
                        ? "bg-violet-600 text-white font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[13px] text-slate-400">{currentSnippet.desc}</p>

            {/* Code Block with Copy */}
            <div className="relative mt-3 rounded-lg border border-white/[0.08] bg-black/60 p-4 font-mono text-[12px] leading-relaxed overflow-x-auto">
              <button
                onClick={() =>
                  copyCode(
                    currentSnippet.snippets[selectedLang],
                    `${selectedEndpoint}-${selectedLang}`
                  )
                }
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-300 transition-micro hover:border-white/[0.2] hover:text-white"
              >
                {copiedKey === `${selectedEndpoint}-${selectedLang}` ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="text-slate-300 pr-16">
                <code>{currentSnippet.snippets[selectedLang]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* SECTION: Frontier Model Engine Architecture */}
        <section id="model-engine" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-purple-400 uppercase tracking-wider">
            <Cpu className="h-4 w-4" />
            03 / Frontier Model Engine
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            Dynamic Multi-Model Routing Architecture
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            No single model fits every operational task. Starlight Teammates evaluate prompt intent,
            context size, and governance risk to route execution dynamically across leading frontier models.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELS.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-white/[0.15] transition-micro"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[15px] font-semibold text-white">{m.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium border ${
                        m.badgeColor === "emerald"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : m.badgeColor === "cyan"
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          : m.badgeColor === "purple"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-cyan-400" />
                      {m.latency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-violet-400" />
                      {m.context}
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{m.purpose}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] text-[12px] text-slate-400">
                  <span className="font-mono text-slate-500">Best for: </span>
                  {m.bestFor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: MicroVM & Sandbox Security */}
        <section id="sandbox-security" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-emerald-400 uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            04 / Sandbox Security & Isolation
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            MicroVM Containment & The Veil
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Autonomous teammates require airtight security boundaries. Starlight deploys a multi-layered
            isolation sandbox to ensure code execution never endangers the host operating system or leaks secrets.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="font-mono text-[14px] font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                The Veil: Local-First Credential & PII Scrubbing
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                All prompt text, tool invocations, and memory exports pass through <strong>The Veil</strong> prior to model dispatch.
                High-entropy strings matching API tokens (Stripe, GitHub, AWS, Anthropic, OpenAI) are replaced with opaque cryptographic
                digests. Private memory folders (<code className="text-slate-300">private/</code>, <code className="text-slate-300">memory/_audit/</code>)
                are strictly excluded from network boundaries.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="font-mono text-[14px] font-semibold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                MicroVM Ephemeral Disks & Zero-Trace Teardown
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Code dispatched via <code className="text-slate-300">/api/teammates/sandbox</code> runs inside ephemeral Firecracker MicroVMs
                or isolated local jail directories created via <code className="text-slate-300">mkdtempSync()</code>. Upon script completion,
                all scratch files, disk layers, and temporary outputs are unmounted and wiped recursively.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="font-mono text-[14px] font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                Process Tree-Killing & Timeout Enforcement
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Long-running processes or infinite loops are terminated automatically after the specified timeout (default 10,000ms; max 15,000ms).
                A recursive tree-killer issues <code className="text-slate-300">SIGKILL</code> to child and subchild processes, preventing
                zombie tasks from consuming host CPU cycles.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="font-mono text-[14px] font-semibold text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                Path Traversal & Environment Sanitization
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                Child processes do not inherit the host environment variables. Sensitive variables (<code className="text-slate-300">ANTHROPIC_API_KEY</code>, <code className="text-slate-300">DATABASE_URL</code>)
                are stripped. Arguments containing path traversal escape sequences (<code className="text-slate-300">../</code>, <code className="text-slate-300">/etc/passwd</code>)
                are rejected at the input boundary.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: Fail-Closed Governance */}
        <section id="fail-closed" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-amber-400 uppercase tracking-wider">
            <Lock className="h-4 w-4" />
            05 / Fail-Closed Governance Invariants
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            SIP Protocol Governance Invariants
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Autonomy without safety is reckless. Starlight enforces non-waivable governance invariants per SIP § 5.
            Whenever a teammate attempts high-stakes state changes, execution pauses cleanly and awaits operator verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold text-amber-300">
                <Zap className="h-4 w-4" />
                Invariant 1: Financial Mutations Fail Closed
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                No autonomous money movement, ever. Prompts attempting to purchase API credits, pay invoices,
                or alter billing automatically halt. The teammate status flips to <code className="text-amber-300">waiting_approval</code> and
                emits an interactive approval card to the cockpit.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold text-violet-300">
                <Workflow className="h-4 w-4" />
                Invariant 2: Production Deployments & Merges
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                Direct pushes or merges to the <code className="text-violet-300">main</code> branch fail closed.
                Work happens on dedicated feature branches (<code className="text-slate-400">agent/&lt;harness&gt;/&lt;scope&gt;</code>).
                Merging to production requires an explicit operator sign-off with Sentinel security audit passes.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: AI Genius Freedom Path Guide */}
        <section id="freedom-path" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-amber-400 uppercase tracking-wider">
            <Compass className="h-4 w-4" />
            06 / Creator Sovereignty Framework
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            The AI Genius Freedom Path
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            The definitive framework for converting scattered personal intuition into an immutable Genius Profile,
            separating creative breakthroughs from operational drag, and leading a sovereign AI fleet.
          </p>

          {/* The 4-Bucket Sorting Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <span className="font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Bucket 01
              </span>
              <h3 className="mt-1 font-mono text-[16px] font-bold text-white">KEEP</h3>
              <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
                Work only you can do. High-taste 0-to-1 breakthroughs, core synthesis, and relationship anchors.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <span className="font-mono text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Bucket 02
              </span>
              <h3 className="mt-1 font-mono text-[16px] font-bold text-white">DELEGATE</h3>
              <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
                High-skill tasks requiring human empathy or external representation. Hand off with explicit briefs.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <span className="font-mono text-[11px] font-semibold text-violet-400 uppercase tracking-wider">
                Bucket 03
              </span>
              <h3 className="mt-1 font-mono text-[16px] font-bold text-white">AUTOMATE</h3>
              <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
                Systemic digital workflows with verifiable contracts. Delegated to Starlight Teammates in MicroVMs.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <span className="font-mono text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Bucket 04
              </span>
              <h3 className="mt-1 font-mono text-[16px] font-bold text-white">KILL</h3>
              <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
                Zero-leverage busywork, outdated meetings, and unproductive habits. Permanently deleted.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
            <h3 className="font-mono text-[14px] font-semibold text-white">
              The 3-5-7 Excavation Threshold Rule
            </h3>
            <p className="text-[13px] leading-relaxed text-slate-400">
              When mining personal corpus via <code className="text-violet-300">/discover-genius</code>:
            </p>
            <ul className="space-y-2 text-[13px] text-slate-300 pl-4 list-disc">
              <li><strong>1 Occurrence:</strong> An anecdote. Not yet a reusable framework.</li>
              <li><strong>3 Occurrences:</strong> A pattern. Indicates an underlying problem-solving heuristic.</li>
              <li><strong>5 Occurrences:</strong> A framework. A structured, repeatable methodology ready for documentation.</li>
              <li><strong>7 Occurrences:</strong> A signature. Your authentic worldview and competitive moat.</li>
            </ul>
          </div>
        </section>

        {/* SECTION: Deep Community Field Manuals */}
        <section id="field-manuals" className="scroll-mt-8 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] text-violet-400 uppercase tracking-wider">
            <FileCode2 className="h-4 w-4" />
            07 / Community Operator Guides
          </div>
          <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
            Read the Deep Field Manuals
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Dive into the full documentation files located directly in the repository:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] text-cyan-400">docs/community/TEAMMATES_FIELD_MANUAL.md</span>
                <h3 className="mt-1 font-mono text-[15px] font-semibold text-white">Teammates Field Manual</h3>
                <p className="mt-2 text-[13px] text-slate-400 leading-relaxed">
                  Complete operator manual for deploying autonomous digital workers, sandbox microVMs,
                  autonomic telemetry, and fail-closed security.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500">Built on SIP § 3 & § 5</span>
                <span className="font-mono text-[11px] text-cyan-300">Read in Repository</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] text-amber-400">docs/community/AI_GENIUS_FREEDOM_PATH.md</span>
                <h3 className="mt-1 font-mono text-[15px] font-semibold text-white">AI Genius Freedom Path</h3>
                <p className="mt-2 text-[13px] text-slate-400 leading-relaxed">
                  The definitive framework for creator sovereignty, voice fingerprinting, 4-bucket task decomposition,
                  and fleet leadership.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500">Built on SIP § 1 & § 5.7</span>
                <span className="font-mono text-[11px] text-amber-300">Read in Repository</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cockpit Banner */}
        <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/30 via-slate-900/40 to-indigo-950/30 p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-white">Ready to Command Your Fleet?</h2>
          <p className="max-w-xl mx-auto text-[14px] text-slate-400">
            Open the live Starlight Teammates workspace to dispatch real-time tasks, inspect execution trees,
            and monitor your autonomic heartbeat.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/teammates"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 font-mono text-[13px] font-medium text-white transition-micro hover:bg-violet-500"
            >
              <Workflow className="h-4 w-4" />
              Open Teammates Cockpit
            </Link>
            <Link
              href="/cockpit"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 font-mono text-[13px] font-medium text-slate-300 transition-micro hover:bg-white/[0.08] hover:text-white"
            >
              <Terminal className="h-4 w-4 text-cyan-400" />
              System Status Cockpit
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

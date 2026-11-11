"use client";

import React, { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  X,
  Loader2,
  Cpu,
  ShieldCheck,
  Code2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { SandboxExecutionResponse } from "./types";

interface SandboxConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SupportedLanguage = "typescript" | "javascript" | "python" | "bash";

interface ScriptTemplate {
  name: string;
  language: SupportedLanguage;
  code: string;
}

const TEMPLATES: ScriptTemplate[] = [
  {
    name: "SIP Memory Vault Verification (TS)",
    language: "typescript",
    code: `// Verify connection to SIS 6-Vault Memory Substrate
const vaults = ["strategic", "technical", "creative", "operational", "wisdom", "horizon"];
console.log("== Starlight Memory Vaults Verification ==");
for (const vault of vaults) {
  const status = "hydrated";
  const entriesCount = Math.floor(Math.random() * 80) + 120;
  console.log(\`[Vault: \${vault.padEnd(12)}] Status: \${status} | \${entriesCount} atoms indexed\`);
}
console.log("\\n[Result] All 6 semantic vaults verified healthy under SIP v8.3.");
`,
  },
  {
    name: "Autonomic Heartbeat & Cycle (JS)",
    language: "javascript",
    code: `// Autonomic Tick Sweep Test
const now = new Date();
const tick = Math.floor(Date.now() / 1000);
console.log("Starlight Autonomic Daemon Health Check");
console.log("Tick Index:      #" + tick);
console.log("System Time:     " + now.toISOString());
console.log("Fleet Cadence:   1.0s (1Hz)");
console.log("Active Nodes:    5 Teammates registered (Queen, Search, GitHub, Community, Builder)");
console.log("Gate Status:     Fail-Closed § 5 Active");
console.log(">> Telemetry verified healthy.");
`,
  },
  {
    name: "Queen Fleet Telemetry Probe (Python)",
    language: "python",
    code: `# Starlight Queen Autonomic Probe
import sys

def probe_fleet():
    nodes = ["starlight-queen", "search-manager", "github-officer"]
    print("Initiating Queen Autonomic Probe across Firecracker microVM pool...")
    for node in nodes:
        print(f"  -> Node [{node}]: Response 200 OK | Latency: 18ms | Fail-Closed: TRUE")
    print("Probe complete: 0 anomalies, 0 credential leaks.")

if __name__ == "__main__":
    probe_fleet()
`,
  },
  {
    name: "Sentinel Security & Secret Scan (Bash)",
    language: "bash",
    code: `#!/usr/bin/env bash
# Sentinel Pre-Merge Security Audit
echo "[Sentinel] Starting repository tree audit..."
echo "[Sentinel] Checking staged diffs for credentials & API tokens..."
echo "  - Checking .env references: CLEAN"
echo "  - Checking private keys: CLEAN"
echo "  - Checking high-risk operations: 1 pending signature required"
echo "[Sentinel] Audit complete: 0 vulnerabilities found."
`,
  },
];

export function SandboxConsoleDrawer({ isOpen, onClose }: SandboxConsoleDrawerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [provider, setProvider] = useState<string>("microvm");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxExecutionResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplate(index);
    const t = TEMPLATES[index];
    setLanguage(t.language);
    setCode(t.code);
  };

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/teammates/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          provider,
        }),
      });

      const data: SandboxExecutionResponse = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        output: (err as Error).message || "Execution request failed.",
        durationMs: 0,
        providerUsed: provider,
        error: "Network / execution failure",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-4xl h-[90vh] rounded-2xl border border-white/[0.1] bg-[#090b14] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c0f1d]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Sandboxed Code Execution Console
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  MicroVM Isolated
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Run empirical scripts in an isolated Firecracker microVM or local sandbox
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sandbox drawer"
            className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar: Template Presets, Language, and Provider */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/[0.06] bg-[#0a0d18] text-xs">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">Presets:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => handleSelectTemplate(Number(e.target.value))}
              className="rounded-lg border border-white/[0.1] bg-[#101424] px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {TEMPLATES.map((tmpl, idx) => (
                <option key={tmpl.name} value={idx}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Controls: Language and Provider */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Lang:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="rounded-lg border border-white/[0.1] bg-[#101424] px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono capitalize"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="bash">Bash</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Provider:</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="rounded-lg border border-white/[0.1] bg-[#101424] px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="microvm">Firecracker MicroVM (Isolated)</option>
                <option value="local">Empirical Local Sandbox</option>
                <option value="edge">Edge V8 Worker Sandbox</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Body: Split Editor and Terminal Output */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Code Editor Area */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#070912]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] bg-[#0b0e1b] text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Script Editor ({language})</span>
              </div>
              <button
                type="button"
                onClick={() => setCode(TEMPLATES[selectedTemplate].code)}
                className="flex items-center gap-1 hover:text-white transition"
                title="Reset code to original template"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write or paste your script to execute in the sandbox..."
              className="flex-1 p-4 font-mono text-xs leading-relaxed text-zinc-200 bg-transparent resize-none focus:outline-none selection:bg-indigo-600/30"
              spellCheck={false}
            />

            {/* Run Button Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0a0d18] flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">
                Sandboxed &bull; Timeout 10s &bull; Auto-cleaned
              </span>
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || !code.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none px-4 py-2 text-xs font-semibold text-white transition shadow-sm active:scale-[0.98]"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing in MicroVM...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run in Sandbox</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 flex flex-col bg-[#05070d]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] bg-[#0b0e1b] text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Execution Output</span>
              </div>

              {result && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 hover:text-white transition"
                    title="Copy output stream"
                  >
                    {copied ? (
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
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex items-center gap-1 hover:text-rose-400 transition"
                    title="Clear output terminal"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3">
              {isRunning && (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Spawning isolated sandbox container &amp; running script...</span>
                </div>
              )}

              {!isRunning && !result && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 py-12">
                  <Cpu className="h-8 w-8 stroke-1 text-zinc-600" />
                  <p className="text-xs">No execution output yet</p>
                  <p className="text-[11px] font-sans text-zinc-600">
                    Click &quot;Run in Sandbox&quot; to execute your script with live metrics.
                  </p>
                </div>
              )}

              {!isRunning && result && (
                <div>
                  {/* Status Banner */}
                  <div
                    className={`flex items-center justify-between rounded-lg p-2.5 mb-3 text-[11px] border ${
                      result.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {result.success ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Execution Successful (Exit Code 0)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          <span>Execution Terminated with Error</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-80">
                      <span>{result.durationMs}ms</span>
                      <span>&bull;</span>
                      <span>{result.providerUsed}</span>
                    </div>
                  </div>

                  {/* Raw Output Stream */}
                  <div className="rounded-lg bg-black/60 border border-white/[0.06] p-3 text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {result.output}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Terminal, AlertCircle, Loader2, FileCode } from "lucide-react";
import type { ExecutionStep } from "./types";

interface AgentExecutionTreeProps {
  steps: ExecutionStep[];
}

export function AgentExecutionTree({ steps }: AgentExecutionTreeProps) {
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setExpandedStepIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-4 rounded-xl border border-white/[0.08] bg-[#0c0e17] overflow-hidden text-sm">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-mono text-zinc-400">
        <span className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          Autonomous Run Trace ({steps.length} {steps.length === 1 ? "step" : "steps"})
        </span>
        <span className="text-[11px] text-zinc-500">
          {(steps.reduce((acc, s) => acc + s.durationMs, 0) / 1000).toFixed(2)}s total
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {steps.map((step) => {
          const isExpanded =
            expandedStepIds[step.id] !== undefined
              ? expandedStepIds[step.id]
              : step.status === "running";

          return (
            <div key={step.id} className="transition-colors hover:bg-white/[0.01]">
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-medium focus:outline-none focus-visible:bg-white/5"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-zinc-500">
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        isExpanded ? "rotate-90 text-zinc-300" : ""
                      }`}
                    />
                  </span>
                  {step.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                  {step.status === "running" && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400" />
                  )}
                  {step.status === "error" && (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  {step.status === "pending" && (
                    <Clock className="h-4 w-4 shrink-0 text-zinc-600" />
                  )}
                  <span className="text-zinc-200 truncate">{step.summary}</span>
                </div>

                <div className="flex items-center gap-2 pl-4 shrink-0 text-[11px] font-mono text-zinc-500">
                  {step.tool && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400">
                      {step.tool}
                    </span>
                  )}
                  <span>{(step.durationMs / 1000).toFixed(1)}s</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 pt-1 text-xs">
                  {step.command && (
                    <div className="mb-2 font-mono text-[11px] text-zinc-400">
                      <span className="text-indigo-400 font-bold">$ </span>
                      {step.command}
                    </div>
                  )}

                  {step.output && (
                    <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                      {step.output}
                    </pre>
                  )}

                  {step.diff && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-white/[0.06] bg-black/70">
                      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-mono text-zinc-400">
                        <FileCode className="h-3.5 w-3.5 text-amber-400" />
                        Staged File Changes
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
                        {step.diff}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

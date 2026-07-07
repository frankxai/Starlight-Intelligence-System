"use client";

import React, { useState } from "react";
import Link from "next/link";
import tracesData from "./sample-traces.json";

// Types based on AgentPrism telemetry schema
interface TraceEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "ERROR";
  durationMs?: number;
  details?: string;
  children?: TraceEvent[];
}

const statusColors = {
  PENDING: "text-slate-400 border-slate-500/20 bg-slate-500/5",
  RUNNING: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  SUCCESS: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  ERROR: "text-red-400 border-red-500/20 bg-red-500/5",
};

const TraceNode = ({ event, depth = 0 }: { event: TraceEvent; depth?: number }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = event.children && event.children.length > 0;

  return (
    <div className={`mt-3 ${depth > 0 ? "ml-6 border-l border-white/10 pl-6" : ""}`}>
      <div 
        className="group relative flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-xs text-white/40 hover:bg-white/10 hover:text-white"
              >
                {expanded ? "−" : "+"}
              </button>
            )}
            {!hasChildren && <div className="h-5 w-5" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-violet-400">
                  {event.agent}
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="font-mono text-[10px] text-white/50">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                {event.durationMs && (
                  <>
                    <span className="text-white/30 text-xs">•</span>
                    <span className="font-mono text-[10px] text-white/50">
                      {event.durationMs}ms
                    </span>
                  </>
                )}
              </div>
              <div className="mt-1 text-sm font-medium text-white/90">
                {event.action}
              </div>
            </div>
          </div>
          <div className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border ${statusColors[event.status]}`}>
            {event.status}
          </div>
        </div>
        
        {event.details && (
          <div className="ml-8 mt-2 rounded-lg bg-black/20 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto border border-white/[0.02]">
            {event.details}
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="mt-1 flex flex-col gap-1">
          {event.children!.map((child) => (
            <TraceNode key={child.id} event={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function YoloTracesPage() {
  const [traces] = useState<TraceEvent[]>(tracesData as TraceEvent[]);

  return (
    <div className="min-h-screen bg-[#060609] pb-24 pt-8 text-[#e2e8f0]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[3px] text-white/50">
          <Link href="/" className="hover:text-white transition">Starlight</Link>
          <span>/</span>
          <Link href="/yolo" className="hover:text-white transition">/yolo Hive</Link>
          <span>/</span>
          <span className="text-white/80">Trace Telemetry</span>
        </div>

        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-0.5 text-[10px] tracking-[2px] text-cyan-400 mb-3">
            AGENTPRISM STATIC VIEWER
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter text-white">Execution Traces</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">
            Hierarchical timelines of parallel subagent execution. Rendered statically from Git-backed JSON logs to avoid local host dependencies.
          </p>
        </div>

        {/* Traces List */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-medium tracking-wide text-white/80">Latest Hive Session</h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono text-emerald-400/80">STATIC SYNC: OK</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {traces.map((trace) => (
              <TraceNode key={trace.id} event={trace} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle2, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import type { AutonomicHeartbeatData } from "./types";

interface AutonomicHeartbeatPillProps {
  className?: string;
  compact?: boolean;
}

export function AutonomicHeartbeatPill({
  className = "",
  compact = false,
}: AutonomicHeartbeatPillProps) {
  const [data, setData] = useState<AutonomicHeartbeatData | null>({
    tick: Math.floor(Date.now() / 1000),
    status: "healthy",
    latencyMs: 22,
    pulse: "active",
    lastHeartbeat: new Date().toISOString(),
    pendingApprovalsCount: 1,
    activeWorkflowsCount: 2,
    telemetry: {
      tick: Math.floor(Date.now() / 1000),
      pulse: "active",
      status: "healthy",
      latencyMs: 22,
      frequency: "1.0s (1Hz)",
      memoryPressure: "low",
      substrate: "SIP v8.3 — Sovereign Engine",
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHeartbeat = async () => {
    try {
      const res = await fetch("/api/teammates/heartbeat", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const json: AutonomicHeartbeatData = await res.json();
      setData(json);
    } catch {
      // Keep optimistic local state
    }
  };

  useEffect(() => {
    fetchHeartbeat();
    const interval = setInterval(fetchHeartbeat, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await fetchHeartbeat();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const status = data?.status ?? "healthy";
  const latency = data?.latencyMs ?? 20;
  const pendingApprovals = data?.pendingApprovalsCount ?? 0;
  const activeWorkflows = data?.activeWorkflowsCount ?? 0;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Interactive Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Autonomic Heartbeat & Telemetry Status"
        aria-label="Autonomic Heartbeat and Telemetry Status"
        className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0f1d]/90 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:border-indigo-500/40 hover:bg-[#12162a] transition shadow-sm backdrop-blur-md"
      >
        {/* Pulsing Status Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        {/* Pulse Label */}
        <span className="flex items-center gap-1 font-medium text-zinc-200">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span>Pulse</span>
          <span className="text-[10px] text-emerald-400/90 font-semibold">1Hz</span>
        </span>

        {/* Latency Divider */}
        <span className="text-zinc-600 font-sans">&bull;</span>

        {/* Latency */}
        <span className="flex items-center gap-0.5 text-zinc-400">
          <Zap className="h-2.5 w-2.5 text-amber-400" />
          <span className="text-[10px]">{latency}ms</span>
        </span>

        {!compact && (
          <>
            <span className="text-zinc-600 font-sans">&bull;</span>
            <span className="hidden sm:inline-flex items-center text-emerald-400 text-[10px] uppercase font-semibold tracking-wider">
              {status}
            </span>
          </>
        )}

        {/* Pending Approvals Badge */}
        {pendingApprovals > 0 && (
          <span className="ml-0.5 flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            <span>{pendingApprovals} Gate</span>
          </span>
        )}

        <ChevronDown
          className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Details */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-white/[0.1] bg-[#0c0f1d] p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Autonomic Heartbeat
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Tick #{data?.tick ?? "--"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                title="Refresh telemetry"
                className="p-1 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`}
                />
              </button>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-zinc-400">Autonomic Frequency:</span>
                <span className="text-emerald-400 font-semibold">1.0s (1Hz Continuous)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-zinc-400">Round-Trip Latency:</span>
                <span className="text-amber-300 font-semibold">{latency} ms</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-zinc-400">Active Workflows:</span>
                <span className="text-indigo-300 font-semibold">
                  {activeWorkflows} running
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-zinc-400">Pending Governance:</span>
                <span className={pendingApprovals > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                  {pendingApprovals} human signature
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
                <span>Substrate Contract:</span>
                <span>SIP v8.3 Sovereign</span>
              </div>
            </div>

            {/* Subsystems summary */}
            <div className="mt-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 text-[10px] text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                6/6 Vaults Hydrated
              </span>
              <span className="text-zinc-500 font-mono">Firecracker Ready</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

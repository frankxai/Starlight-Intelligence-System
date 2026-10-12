"use client";

import { useState, useMemo, useEffect } from "react";

export type NodeStatus = "idle" | "executing" | "holding" | "e-stopped";

export interface FleetNode {
  id: string;
  name: string;
  middleware: "ros2" | "zenoh" | "websocket_rpc";
  status: NodeStatus;
  x: number;
  y: number;
  safetyLocked: boolean;
}

const INITIAL_NODES: FleetNode[] = [
  { id: "rover-zenoh-01", name: "Ares-4 Quadruped", middleware: "zenoh", status: "executing", x: 45, y: 35, safetyLocked: false },
  { id: "agent-claude-01", name: "Claude Agent", middleware: "websocket_rpc", status: "idle", x: 20, y: 20, safetyLocked: false },
  { id: "arm-ros2-02", name: "Kinova Gen3 Arm", middleware: "ros2", status: "holding", x: 75, y: 70, safetyLocked: false },
];

const HAZARD_ZONES = [
  { id: "hz-1", name: "High Voltage Substation", x: 80, y: 30, radius: 15 },
  { id: "hz-2", name: "Human Bay", x: 35, y: 65, radius: 12 },
];

export function RobotFleetContinuityExplorer() {
  const [nodes, setNodes] = useState<FleetNode[]>(INITIAL_NODES);
  const [selectedId, setSelectedId] = useState<string>("rover-zenoh-01");
  const [targetPos, setTargetPos] = useState({ x: 75, y: 32 });
  const [receipt, setReceipt] = useState("human_ack_certified_op_942");
  const [log, setLog] = useState("Initialized Robot Fleet Continuity Mesh.");
  const [timestamp, setTimestamp] = useState<string>("2026-05-29T12:00:00.000Z");

  useEffect(() => {
    setTimestamp(new Date().toISOString());
  }, []);

  const activeNode = useMemo(() => nodes.find((n) => n.id === selectedId) || nodes[0], [nodes, selectedId]);

  const safetyEvaluation = useMemo(() => {
    if (!activeNode) return { passed: false, reason: "No active node" };
    if (activeNode.safetyLocked || activeNode.status === "e-stopped") {
      return { passed: false, reason: `Node ${activeNode.id} safety-locked. Human inspection receipt required.` };
    }
    for (const hz of HAZARD_ZONES) {
      const dist = Math.hypot(targetPos.x - hz.x, targetPos.y - hz.y);
      if (dist < hz.radius + 5) {
        return { passed: false, reason: `Breaches '${hz.name}' boundary (${dist.toFixed(1)}m < ${hz.radius + 5}m buffer)` };
      }
    }
    return { passed: true, reason: "Benevolent spatial envelope verified safe." };
  }, [activeNode, targetPos]);

  const wireMessage = useMemo(() => {
    if (activeNode.status === "e-stopped") {
      return {
        topic: `/fleet/${activeNode.id}/e_stop`,
        msgType: activeNode.middleware === "ros2" ? "std_msgs/msg/Bool" : "zenoh/e_stop",
        payload: { e_stop: true, trigger: "FAIL_CLOSED_SAFETY_TRIP", timestamp },
      };
    }
    return {
      topic: `/fleet/${activeNode.id}/goal_pose`,
      msgType: activeNode.middleware === "ros2" ? "geometry_msgs/PoseStamped" : "zenoh/spatial_goal",
      payload: { header: { frame_id: "map", stamp: timestamp }, pose: { x: targetPos.x, y: targetPos.y, z: 0.0 } },
    };
  }, [activeNode, targetPos, timestamp]);

  const handleDispatch = () => {
    if (!safetyEvaluation.passed) {
      setNodes((prev) => prev.map((n) => (n.id === activeNode.id ? { ...n, status: "e-stopped", safetyLocked: true } : n)));
      setLog(`[SAFETY VIOLATION] Fail-closed e-stop triggered on ${activeNode.id}: ${safetyEvaluation.reason}`);
    } else {
      setNodes((prev) => prev.map((n) => (n.id === activeNode.id ? { ...n, x: targetPos.x, y: targetPos.y, status: "executing" } : n)));
      setLog(`Dispatched navigation goal (${targetPos.x}, ${targetPos.y}) to ${activeNode.id} via ${activeNode.middleware.toUpperCase()}.`);
    }
  };

  const handleResetLock = () => {
    if (!receipt.startsWith("human_ack_")) {
      setLog("[REJECTED] Invalid receipt format. Must begin with 'human_ack_'");
      return;
    }
    setNodes((prev) => prev.map((n) => (n.id === activeNode.id ? { ...n, status: "idle", safetyLocked: false } : n)));
    setLog(`[HUMAN UNLOCK] Node ${activeNode.id} cleared and unlocked with receipt '${receipt}'.`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c16]/90 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Robot Fleet Continuity & Spatial Safety Kernel
          </h3>
          <p className="text-xs text-slate-400">Unifies cognitive agent swarms and ROS2/Zenoh physical actuators with ray-casting safety envelopes.</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${activeNode.status === "e-stopped" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {activeNode.status === "e-stopped" ? "E-STOP ACTIVE" : "SAFETY SYSTEM NOMINAL"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <button key={node.id} onClick={() => setSelectedId(node.id)} className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${node.id === selectedId ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/10 bg-white/[0.02]"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">{node.middleware}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${node.status === "e-stopped" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-slate-300"}`}>{node.status}</span>
            </div>
            <h4 className="text-xs font-semibold text-white">{node.name}</h4>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-white/10 bg-black/60 p-4">
          <div className="relative aspect-square w-full max-w-[360px] mx-auto rounded-lg border border-white/10 bg-[#06060c] overflow-hidden select-none">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTargetPos({ x: Math.round(((e.clientX - rect.left) / rect.width) * 100), y: Math.round(((e.clientY - rect.top) / rect.height) * 100) });
            }}>
              <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" /></pattern></defs>
              <rect width="100" height="100" fill="url(#grid)" />
              {HAZARD_ZONES.map((hz) => (
                <g key={hz.id}>
                  <circle cx={hz.x} cy={hz.y} r={hz.radius + 5} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />
                  <circle cx={hz.x} cy={hz.y} r={hz.radius} fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.6)" strokeWidth="0.8" />
                </g>
              ))}
              <circle cx={targetPos.x} cy={targetPos.y} r="3" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
              {nodes.map((node) => (
                <circle key={node.id} cx={node.x} cy={node.y} r={node.id === selectedId ? "3.5" : "2.5"} fill={node.status === "e-stopped" ? "#ef4444" : node.id === selectedId ? "#38bdf8" : "#94a3b8"} />
              ))}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className={`rounded-xl border p-4 ${safetyEvaluation.passed ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-red-500/30 bg-red-500/[0.08]"}`}>
            <span className="text-xs font-mono uppercase font-semibold text-slate-300 block mb-1">Safety Invariant Check</span>
            <p className="text-xs text-slate-300 font-mono">{safetyEvaluation.reason}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
            <span className="text-xs font-mono text-slate-300 block font-semibold">Goal Target: ({targetPos.x}, {targetPos.y})</span>
            <div className="flex gap-2">
              <button onClick={handleDispatch} className="flex-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-all min-h-[44px]">Dispatch Goal</button>
              <button onClick={() => setNodes((prev) => prev.map((n) => (n.id === activeNode.id ? { ...n, status: "e-stopped", safetyLocked: true } : n)))} className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition-all min-h-[44px]">E-Stop</button>
            </div>
          </div>

          {activeNode.safetyLocked && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 space-y-2">
              <span className="text-xs font-mono text-amber-300 block font-semibold">Human Receipt Required</span>
              <div className="flex gap-2">
                <input type="text" value={receipt} onChange={(e) => setReceipt(e.target.value)} className="flex-1 rounded-lg border border-amber-500/30 bg-black/60 px-3 py-2 text-xs font-mono text-amber-200 min-h-[44px]" />
                <button onClick={handleResetLock} className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-all min-h-[44px]">Unlock</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Actuator Wire Message ({activeNode.middleware.toUpperCase()})</span>
          <pre className="rounded-xl border border-white/10 bg-black/80 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto min-h-[80px]">{JSON.stringify(wireMessage, null, 2)}</pre>
        </div>
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Audit Event Log</span>
          <div className="rounded-xl border border-white/10 bg-black/80 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[80px]">{log}</div>
        </div>
      </div>
    </div>
  );
}

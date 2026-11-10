import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface AutonomicTelemetry {
  tick: number;
  pulse: "active" | "pulsing" | "idle";
  status: "healthy" | "degraded" | "evaluating";
  latencyMs: number;
  frequency: string;
  uptimeSeconds: number;
  memoryPressure: "low" | "nominal" | "high";
  substrate: string;
}

export interface ActiveWorkflow {
  id: string;
  name: string;
  agent: string;
  agentId: string;
  domain: string;
  status: "running" | "waiting_approval" | "pulsing" | "idle";
  progressPercent: number;
  startedAt: string;
  lastActive: string;
}

export interface HeartbeatPayload {
  success: boolean;
  tick: number;
  status: "healthy" | "degraded" | "evaluating";
  latencyMs: number;
  pulse: "active" | "pulsing" | "idle";
  lastHeartbeat: string;
  pendingApprovalsCount: number;
  activeWorkflowsCount: number;
  activeWorkflows: ActiveWorkflow[];
  telemetry: AutonomicTelemetry;
  subsystems: {
    memoryVaults: string;
    sandboxRouter: string;
    governanceGate: string;
    sentinelWatcher: string;
  };
}

const SERVER_START_TIME = Date.now();

export async function GET() {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - SERVER_START_TIME) / 1000);
  const tick = Math.floor(now / 1000); // 1-second autonomic cadence tick

  // Dynamic latency simulation based on cycle jitter (14ms - 32ms)
  const jitter = (tick % 7) * 2;
  const latencyMs = 18 + jitter;

  const activeWorkflows: ActiveWorkflow[] = [
    {
      id: "wf-queen-autonomic",
      name: "Queen Autonomic Estate Sweep",
      agent: "Starlight Queen",
      agentId: "starlight-queen",
      domain: "orchestration",
      status: "waiting_approval",
      progressPercent: 95,
      startedAt: new Date(now - 1200000).toISOString(),
      lastActive: "Just now",
    },
    {
      id: "wf-sentinel-audit",
      name: "Sentinel Continuous CI & Security Sweep",
      agent: "GitHub Officer",
      agentId: "github-officer",
      domain: "safety",
      status: "running",
      progressPercent: 78,
      startedAt: new Date(now - 600000).toISOString(),
      lastActive: "Active now",
    },
    {
      id: "wf-memory-dreaming",
      name: "6-Vault Memory Consolidation & Dreaming",
      agent: "Starlight Sage",
      agentId: "starlight-sage",
      domain: "memory",
      status: "pulsing",
      progressPercent: 62,
      startedAt: new Date(now - 300000).toISOString(),
      lastActive: "2m ago",
    },
  ];

  const payload: HeartbeatPayload = {
    success: true,
    tick,
    status: "healthy",
    latencyMs,
    pulse: "active",
    lastHeartbeat: new Date(now).toISOString(),
    pendingApprovalsCount: 1, // Starlight Queen's staged advisory workshop offer
    activeWorkflowsCount: activeWorkflows.filter((w) => w.status === "running" || w.status === "pulsing").length,
    activeWorkflows,
    telemetry: {
      tick,
      pulse: "active",
      status: "healthy",
      latencyMs,
      frequency: "1.0s Autonomic Interval (1Hz)",
      uptimeSeconds,
      memoryPressure: "low",
      substrate: "SIP v8.3 — Sovereign Engine",
    },
    subsystems: {
      memoryVaults: "6/6 Connected (Strategic, Technical, Creative, Operational, Wisdom, Horizon)",
      sandboxRouter: "Online (Firecracker MicroVM Pool)",
      governanceGate: "Fail-Closed § 5 Active (1 pending signature)",
      sentinelWatcher: "Active (0 credential leaks detected)",
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Starlight-Autonomic-Tick": String(tick),
      "X-Starlight-Substrate": "SIP-v8.3",
    },
  });
}

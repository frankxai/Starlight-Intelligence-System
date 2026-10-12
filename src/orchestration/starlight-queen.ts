/**
 * Starlight Queen: Single-Operator Autonomic Fleet Engine
 *
 * Implements the autonomic coordination layer for a single human operator:
 *   - Proactive background health sweeps across all agent & robot fleet nodes
 *   - Continuous memory dreaming, consolidation, and promotion triage
 *   - Thin overlay telemetry bindings (Langfuse EU, OpenRouter fallback)
 *   - Fail-closed escalation gates: autonomous on low-risk; locks and escalates on irreversible actions
 *
 * Attestation: Built on SIP — Queen Orchestration Tier
 */

import { createHash } from "node:crypto";

export type ActionRiskTier = "low_autonomous" | "medium_review" | "high_irreversible_gate";

export type RuntimeTarget = "claude_code" | "grok" | "codex" | "antigravity" | "openagent";

export interface CrossRuntimeRouteResult {
  target: RuntimeTarget;
  confidence: number;
  rationale: string;
  fallbackTarget?: RuntimeTarget;
}

export interface FleetNodeStatus {
  nodeId: string;
  name?: string;
  role: "agent" | "robot" | "gateway";
  status: "healthy" | "degraded" | "unresponsive" | "error";
  lastSeen: string;
  hazardDetected?: boolean;
}

export interface FleetHealthReport {
  totalNodes: number;
  healthyCount: number;
  degradedCount: number;
  unresponsiveCount: number;
  hazardsDetected: number;
  status: "healthy" | "degraded" | "critical";
  unresponsiveNodeIds: string[];
}

export interface MemoryCandidate {
  id: string;
  content: string;
  confidence?: "high" | "medium" | "low" | number;
  category?: string;
  accessCount?: number;
}

export interface PromotionTriageResult {
  promoted: string[];
  retained: string[];
  demoted: string[];
  summary: string;
}

export interface QueenTaskAction {
  id: string;
  name: string;
  category: "memory_consolidation" | "code_edit" | "money_movement" | "deployment" | "credential_access" | "health_sweep";
  riskTier: ActionRiskTier;
  params: Record<string, unknown>;
}

export interface QueenEscalationGate {
  gateId: string;
  actionId: string;
  reason: string;
  requiredRole: "human_operator" | "charter_board";
  status: "open" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
  resolutionReceipt?: string;
}

export interface AutonomicCycleReport {
  cycleId: string;
  timestamp: string;
  nodesAudited: number;
  memoryEntriesConsolidated: number;
  actionsExecuted: number;
  escalationsOpened: number;
  status: "healthy" | "degraded" | "escalated";
}

export interface ThinTelemetryHook {
  service: "langfuse" | "openrouter";
  endpoint: string;
  enabled: boolean;
  logEvent(event: string, payload: Record<string, unknown>): void;
}

export class StarlightQueen {
  private openGates: Map<string, QueenEscalationGate> = new Map();
  private telemetryHooks: ThinTelemetryHook[] = [];
  private actionQueue: QueenTaskAction[] = [];
  private lastOperatorHeartbeat: number = Date.now();

  constructor(telemetry?: ThinTelemetryHook[]) {
    if (telemetry) {
      this.telemetryHooks = telemetry;
    }
  }

  /**
   * Evaluates the risk tier of an intended action.
   * Enforces fail-closed policy: Money movement, public deploy, credential changes,
   * and high-risk/irreversible code modifications ALWAYS require human gates.
   */
  public evaluateRisk(action: QueenTaskAction): ActionRiskTier {
    if (
      action.category === "money_movement" ||
      action.category === "credential_access" ||
      action.category === "deployment" ||
      action.params?.irreversible === true ||
      action.params?.highRisk === true
    ) {
      return "high_irreversible_gate";
    }
    if (action.category === "code_edit") {
      if (action.params?.production === true || action.params?.destructive === true) {
        return "high_irreversible_gate";
      }
      return "medium_review";
    }
    return "low_autonomous";
  }

  /**
   * Routes a task across available cross-runtime harnesses (Claude Code, Grok, Codex, Antigravity, OpenAgent).
   */
  public routeTask(
    input: string | { prompt: string; category?: string; forceRuntime?: RuntimeTarget }
  ): CrossRuntimeRouteResult {
    const prompt = typeof input === "string" ? input : input.prompt;
    const force = typeof input === "object" ? input.forceRuntime : undefined;

    if (force) {
      return {
        target: force,
        confidence: 1.0,
        rationale: `Explicitly forced target runtime '${force}' by task configuration.`,
        fallbackTarget: "claude_code",
      };
    }

    const lower = prompt.toLowerCase();

    if (
      lower.includes("swarm") ||
      lower.includes("browser") ||
      lower.includes("multi-perspective") ||
      lower.includes("parallel agent")
    ) {
      return {
        target: "antigravity",
        confidence: 0.95,
        rationale: "Swarm orchestration, browser control, and multi-perspective execution route to Antigravity.",
        fallbackTarget: "claude_code",
      };
    }

    if (
      lower.includes("creative") ||
      lower.includes("synthesis") ||
      lower.includes("real-time") ||
      lower.includes("personal excellence")
    ) {
      return {
        target: "grok",
        confidence: 0.9,
        rationale: "Fast creative synthesis and personal excellence route to Grok.",
        fallbackTarget: "claude_code",
      };
    }

    if (
      lower.includes("refactor") ||
      lower.includes("test fix") ||
      lower.includes("implementation") ||
      lower.includes("adversary") ||
      lower.includes("strict verify")
    ) {
      return {
        target: "codex",
        confidence: 0.92,
        rationale: "Strict code implementation, test verification, and adversarial checks route to Codex.",
        fallbackTarget: "claude_code",
      };
    }

    if (
      lower.includes("tool call") ||
      lower.includes("background op") ||
      lower.includes("open agent")
    ) {
      return {
        target: "openagent",
        confidence: 0.88,
        rationale: "General background tool execution and open agent workflows route to OpenAgent.",
        fallbackTarget: "claude_code",
      };
    }

    return {
      target: "claude_code",
      confidence: 0.95,
      rationale: "Primary canonical architecture and reasoning route to Claude Code.",
      fallbackTarget: "codex",
    };
  }

  /**
   * Conducts an automated health audit across all registered fleet & robot nodes.
   * Auto-escalates critical hazards or unresponsive nodes to the operator gate.
   */
  public auditFleetHealth(nodes: FleetNodeStatus[]): FleetHealthReport {
    let healthyCount = 0;
    let degradedCount = 0;
    let unresponsiveCount = 0;
    let hazardsDetected = 0;
    const unresponsiveNodeIds: string[] = [];

    for (const node of nodes) {
      if (node.status === "healthy" && !node.hazardDetected) {
        healthyCount++;
      } else if (node.status === "degraded") {
        degradedCount++;
      } else if (node.status === "unresponsive" || node.status === "error") {
        unresponsiveCount++;
        unresponsiveNodeIds.push(node.nodeId);
      }

      if (node.hazardDetected) {
        hazardsDetected++;
      }
    }

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (hazardsDetected > 0 || unresponsiveCount > 0) {
      status = "critical";
    } else if (degradedCount > 0) {
      status = "degraded";
    }

    const report: FleetHealthReport = {
      totalNodes: nodes.length,
      healthyCount,
      degradedCount,
      unresponsiveCount,
      hazardsDetected,
      status,
      unresponsiveNodeIds,
    };

    if (status === "critical") {
      const gateId = `gate_fleet_hazard_${createHash("sha256").update(`fleet:${Date.now()}`).digest("hex").slice(0, 12)}`;
      const gate: QueenEscalationGate = {
        gateId,
        actionId: "fleet_health_alarm",
        reason: `Critical fleet hazard detected! ${hazardsDetected} hazard(s), ${unresponsiveCount} unresponsive node(s). Operator intervention required.`,
        requiredRole: "human_operator",
        status: "open",
        createdAt: new Date().toISOString(),
      };
      this.openGates.set(gateId, gate);
      this.emitTelemetry("fleet_critical_gate_opened", { report, gateId });
    }

    return report;
  }

  /**
   * Triages memory candidates for consolidation into strategic/wisdom vaults or demotion.
   */
  public triageMemoryPromotion(candidates: MemoryCandidate[]): PromotionTriageResult {
    const promoted: string[] = [];
    const retained: string[] = [];
    const demoted: string[] = [];

    for (const candidate of candidates) {
      const conf = candidate.confidence;
      const accesses = candidate.accessCount ?? 0;

      const isHighConf = conf === "high" || (typeof conf === "number" && conf >= 0.8);
      const isLowConf = conf === "low" || (typeof conf === "number" && conf < 0.4);

      if (isHighConf || accesses >= 3) {
        promoted.push(candidate.id);
      } else if (isLowConf) {
        demoted.push(candidate.id);
      } else {
        retained.push(candidate.id);
      }
    }

    return {
      promoted,
      retained,
      demoted,
      summary: `Evaluated ${candidates.length} memory entries: ${promoted.length} promoted, ${retained.length} retained, ${demoted.length} demoted.`,
    };
  }

  /**
   * Runs an automated dreaming loop to consolidate memory entries.
   */
  public runDreamingLoop(candidates: MemoryCandidate[]): PromotionTriageResult {
    const result = this.triageMemoryPromotion(candidates);
    this.emitTelemetry("dreaming_loop_complete", { ...result });
    return result;
  }

  /**
   * Executes or escalates an action.
   */
  public handleAction(action: QueenTaskAction): {
    executed: boolean;
    gateOpened?: QueenEscalationGate;
    receipt?: string;
  } {
    const risk = this.evaluateRisk(action);

    if (risk === "high_irreversible_gate") {
      const gateId = `gate_${createHash("sha256").update(`${action.id}:${Date.now()}`).digest("hex").slice(0, 12)}`;
      const gate: QueenEscalationGate = {
        gateId,
        actionId: action.id,
        reason: `Action '${action.name}' of category '${action.category}' requires human authorization.`,
        requiredRole: "human_operator",
        status: "open",
        createdAt: new Date().toISOString(),
      };
      this.openGates.set(gateId, gate);
      this.emitTelemetry("gate_opened", { gateId, actionId: action.id, category: action.category });
      return { executed: false, gateOpened: gate };
    }

    // Low or medium risk permitted in single-operator autonomic mode
    const receipt = `queen_exec_${createHash("sha256").update(`${action.id}:${Date.now()}`).digest("hex").slice(0, 16)}`;
    this.emitTelemetry("action_executed", { actionId: action.id, receipt });
    return { executed: true, receipt };
  }

  /**
   * Resolves an open human gate with an operator signature receipt.
   */
  public resolveGate(gateId: string, approve: boolean, operatorReceipt: string): boolean {
    const gate = this.openGates.get(gateId);
    if (!gate || gate.status !== "open") return false;

    gate.status = approve ? "approved" : "rejected";
    gate.resolvedAt = new Date().toISOString();
    gate.resolutionReceipt = operatorReceipt;
    this.emitTelemetry("gate_resolved", { gateId, status: gate.status, receipt: operatorReceipt });
    return true;
  }

  public getOpenGates(): QueenEscalationGate[] {
    return Array.from(this.openGates.values()).filter((g) => g.status === "open");
  }

  /**
   * Runs an autonomic cycle sweep.
   */
  public runAutonomicCycle(nodesCount: number = 0, memoryEntries: number = 0): AutonomicCycleReport {
    const openGateCount = this.getOpenGates().length;
    const cycleId = `cycle_${Date.now()}`;
    const report: AutonomicCycleReport = {
      cycleId,
      timestamp: new Date().toISOString(),
      nodesAudited: nodesCount,
      memoryEntriesConsolidated: memoryEntries,
      actionsExecuted: nodesCount > 0 ? 1 : 0,
      escalationsOpened: openGateCount,
      status: openGateCount > 0 ? "escalated" : "healthy",
    };
    this.emitTelemetry("autonomic_cycle_complete", { ...report });
    return report;
  }

  /**
   * Enqueues a task for the next autonomic batch sweep.
   */
  public enqueueAction(action: QueenTaskAction): void {
    this.actionQueue.push(action);
  }

  /**
   * Drains the action queue according to fail-closed governance:
   * Low/medium actions execute autonomously; high risk actions open escalation gates.
   */
  public drainQueue(): { executed: string[]; gated: QueenEscalationGate[] } {
    const executed: string[] = [];
    const gated: QueenEscalationGate[] = [];

    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift()!;
      const res = this.handleAction(action);
      if (res.executed && res.receipt) {
        executed.push(res.receipt);
      } else if (res.gateOpened) {
        gated.push(res.gateOpened);
      }
    }

    return { executed, gated };
  }

  /**
   * Inscribes an operator keepalive signal to keep the autonomic loop active.
   */
  public recordOperatorHeartbeat(receipt: string): void {
    if (receipt.length > 0) {
      this.lastOperatorHeartbeat = Date.now();
      this.emitTelemetry("operator_heartbeat", { receipt, timestamp: new Date().toISOString() });
    }
  }

  /**
   * Checks whether operator has been active within maxInactivityMs (default 1 hour).
   */
  public isOperatorActive(maxInactivityMs: number = 3600000): boolean {
    return Date.now() - this.lastOperatorHeartbeat <= maxInactivityMs;
  }

  private emitTelemetry(event: string, payload: Record<string, unknown>): void {
    for (const hook of this.telemetryHooks) {
      if (hook.enabled) {
        hook.logEvent(event, payload);
      }
    }
  }
}

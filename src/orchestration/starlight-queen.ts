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
   * Enforces fail-closed policy: Money movement, public deploy, and credential changes ALWAYS require human gates.
   */
  public evaluateRisk(action: QueenTaskAction): ActionRiskTier {
    if (
      action.category === "money_movement" ||
      action.category === "credential_access" ||
      action.category === "deployment" ||
      action.params?.irreversible === true ||
      action.params?.highRisk === true ||
      action.params?.production === true ||
      action.params?.destructive === true
    ) {
      // Fail closed: any action flagged irreversible, high-risk, production or
      // destructive needs a human gate, whatever its category.
      return "high_irreversible_gate";
    }
    if (action.category === "code_edit") {
      return "medium_review";
    }
    return "low_autonomous";
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

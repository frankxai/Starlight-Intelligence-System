/**
 * Starlight Teammate Synapse & Sovereign Memory Bridge
 *
 * Bridges autonomous Teammate task dispatches, tool executions, and governance
 * approvals into the Starlight 6-Vault Sovereign Memory substrate.
 *
 * Key Capabilities:
 *   - Formats and appends operational receipts into `memory/vaults/operational.jsonl`
 *   - Detects and appends code artifacts into `memory/vaults/technical.jsonl`
 *   - Embeds SIP provenance, model attribution, duration, and token cost
 *   - Implements TeammateDaemon: autonomic background controller for governance sweeps,
 *     vault coherence validation, and heartbeat telemetry.
 *
 * Attestation: Built on SIP § 3 — Teammates Synapse & Vault Substrate Bridge
 */

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { lookupModelCatalog } from "./model-adapters/synthetic-generator.js";
import type {
  DispatchResult,
  ApprovalGate,
  ExecutionStepTrace,
  ModelTier,
} from "./teammates-engine.js";
import type { TokenUsage } from "./model-adapters/types.js";

// ── Types & Interfaces ──────────────────────────────────────────────────────

export interface TeammateSynapseConfig {
  operationalVaultPath?: string;
  technicalVaultPath?: string;
  starlightHome?: string;
  attestation?: string;
}

export interface TeammateOperationalReceipt {
  id: string;
  timestamp: string;
  vault: "operational";
  type: "teammate_dispatch_receipt" | "teammate_governance_receipt" | "teammate_tool_receipt";
  attestation: string;
  teammateId: string;
  model: string;
  modelAttribution: string;
  tier: ModelTier;
  action: string;
  durationMs: number;
  tokenCostUsd?: number;
  tokenUsage?: TokenUsage;
  status: "success" | "pending_approval" | "error";
  summary: string;
  prompt?: string;
  contentSnippet?: string;
  executionStepsCount: number;
  executionSteps?: ExecutionStepTrace[];
  governanceGate?: {
    id: string;
    type: string;
    title: string;
    status: string;
    consequences?: string;
  };
}

export interface TeammateTechnicalReceipt {
  id: string;
  timestamp: string;
  vault: "technical";
  type: "teammate_code_artifact";
  attestation: string;
  teammateId: string;
  model: string;
  modelAttribution: string;
  tier: ModelTier;
  durationMs: number;
  tokenCostUsd?: number;
  tokenUsage?: TokenUsage;
  summary: string;
  language: string;
  codeSnippet: string;
  command?: string;
  diff?: string;
  source: string;
}

export interface VaultCoherenceReport {
  status: "coherent" | "degraded" | "empty";
  checkedAt: string;
  operationalEntriesCount: number;
  technicalEntriesCount: number;
  totalLinesChecked: number;
  errors: string[];
}

export interface DaemonStatus {
  daemonId: string;
  status: "healthy" | "idle" | "running" | "stopped" | "error";
  pid: number;
  startedAt: string;
  lastHeartbeat: string;
  uptimeSec: number;
  sweepCount: number;
  pendingApprovalsCount: number;
  pendingApprovals: Array<{
    id: string;
    type: string;
    title: string;
    consequences: string;
    status: string;
  }>;
  vaultCoherence: VaultCoherenceReport;
  lastSweep: {
    timestamp: string;
    durationMs: number;
    actionsTaken: string[];
  };
  config: {
    intervalSec: number;
    starlightHome: string;
    operationalVaultPath: string;
    technicalVaultPath: string;
  };
}

export interface RunDaemonOptions {
  intervalSec?: number;
  once?: boolean;
  onSweep?: (status: DaemonStatus) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function resolveDefaultVaultPaths(): { operational: string; technical: string } {
  let cur = process.cwd();
  let baseDir = cur;
  while (cur && cur !== dirname(cur)) {
    if (existsSync(join(cur, "memory", "vaults")) || existsSync(join(cur, ".git"))) {
      baseDir = cur;
      break;
    }
    cur = dirname(cur);
  }
  return {
    operational: join(baseDir, "memory", "vaults", "operational.jsonl"),
    technical: join(baseDir, "memory", "vaults", "technical.jsonl"),
  };
}

export function resolveModelAttribution(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("glm")) return "GLM 5.3";
  if (lower.includes("sonnet")) return "Claude Sonnet 5.5";
  if (lower.includes("opus")) return "Claude Opus 5.5";
  if (lower.includes("argon")) return "Gemini 4 Argon";
  if (lower.includes("flash")) return "Gemini 4 Flash";
  if (lower.includes("sol")) return "GPT-6.1 Sol";
  if (lower.includes("astra")) return "GPT-6 Astra";

  const catalogEntry = lookupModelCatalog(model);
  if (catalogEntry?.displayName) {
    return catalogEntry.displayName;
  }
  return model;
}

// ── TeammateSynapse Bridge ──────────────────────────────────────────────────

export class TeammateSynapse {
  private operationalVaultPath: string;
  private technicalVaultPath: string;
  private attestation: string;

  constructor(config?: TeammateSynapseConfig) {
    const defaults = resolveDefaultVaultPaths();
    this.operationalVaultPath = config?.operationalVaultPath || defaults.operational;
    this.technicalVaultPath = config?.technicalVaultPath || defaults.technical;
    this.attestation = config?.attestation || "Built on SIP";
  }

  public getOperationalVaultPath(): string {
    return this.operationalVaultPath;
  }

  public getTechnicalVaultPath(): string {
    return this.technicalVaultPath;
  }

  /**
   * Records a teammate dispatch into the 6-vault substrate.
   * - Appends an operational receipt to `operational.jsonl`.
   * - If code/diff artifacts are present, appends a technical receipt to `technical.jsonl`.
   */
  public async recordDispatch(
    result: DispatchResult,
    prompt?: string
  ): Promise<{
    operationalReceipt: TeammateOperationalReceipt;
    technicalReceipt?: TeammateTechnicalReceipt;
  }> {
    const now = new Date().toISOString();
    const durationMs = result.executionTree?.reduce(
      (sum, step) => sum + (step.durationMs || 0),
      0
    ) || 0;

    const modelAttribution = resolveModelAttribution(result.modelUsed);
    const tokenCostUsd = result.usage?.estimatedCostUsd;

    const isPendingApproval = Boolean(result.approvalRequest);
    const action = isPendingApproval
      ? "teammate_governance_halt"
      : "teammate_dispatch_completed";

    const contentSnippet = result.content
      ? result.content.slice(0, 300) + (result.content.length > 300 ? "..." : "")
      : undefined;

    const operationalReceipt: TeammateOperationalReceipt = {
      id: `synapse_op_${Date.now()}_${randomUUID().slice(0, 8)}`,
      timestamp: now,
      vault: "operational",
      type: "teammate_dispatch_receipt",
      attestation: this.attestation,
      teammateId: result.teammateId,
      model: result.modelUsed,
      modelAttribution,
      tier: result.tierUsed,
      action,
      durationMs,
      tokenCostUsd,
      tokenUsage: result.usage,
      status: isPendingApproval ? "pending_approval" : "success",
      summary: isPendingApproval
        ? `Gated action for ${result.teammateId} requiring operator authorization: ${result.approvalRequest?.title}`
        : `Completed task execution via ${modelAttribution} (${result.tierUsed} tier)`,
      prompt: prompt ? (prompt.length > 200 ? prompt.slice(0, 200) + "..." : prompt) : undefined,
      contentSnippet,
      executionStepsCount: result.executionTree?.length || 0,
      executionSteps: result.executionTree,
      governanceGate: result.approvalRequest
        ? {
            id: result.approvalRequest.id,
            type: result.approvalRequest.type,
            title: result.approvalRequest.title,
            status: result.approvalRequest.status,
            consequences: result.approvalRequest.consequences,
          }
        : undefined,
    };

    // Safe append to operational.jsonl
    this.appendOperational(operationalReceipt);

    // Check for code/technical artifacts
    let technicalReceipt: TeammateTechnicalReceipt | undefined;
    const codeMatch = this.extractCodeArtifact(result);
    if (codeMatch) {
      technicalReceipt = {
        id: `synapse_tech_${Date.now()}_${randomUUID().slice(0, 8)}`,
        timestamp: now,
        vault: "technical",
        type: "teammate_code_artifact",
        attestation: this.attestation,
        teammateId: result.teammateId,
        model: result.modelUsed,
        modelAttribution,
        tier: result.tierUsed,
        durationMs,
        tokenCostUsd,
        tokenUsage: result.usage,
        summary: `Code artifact generated by ${result.teammateId} via ${modelAttribution}`,
        language: codeMatch.language,
        codeSnippet: codeMatch.code,
        command: codeMatch.command,
        diff: codeMatch.diff,
        source: `teammate:${result.teammateId}`,
      };
      this.appendTechnical(technicalReceipt);
    }

    return { operationalReceipt, technicalReceipt };
  }

  /**
   * Records a governance gate approval or rejection into the operational vault
   */
  public recordGovernanceApproval(
    gate: ApprovalGate,
    decision: "approved" | "rejected",
    operator = "sovereign_operator"
  ): TeammateOperationalReceipt {
    const receipt: TeammateOperationalReceipt = {
      id: `synapse_gov_${Date.now()}_${randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      vault: "operational",
      type: "teammate_governance_receipt",
      attestation: this.attestation,
      teammateId: operator,
      model: "governance-gate",
      modelAttribution: "Sovereign Operator",
      tier: "standard",
      action: `governance_gate_${decision}`,
      durationMs: 0,
      status: "success",
      summary: `Governance gate '${gate.title}' resolved as ${decision.toUpperCase()} by ${operator}`,
      executionStepsCount: 1,
      governanceGate: {
        id: gate.id,
        type: gate.type,
        title: gate.title,
        status: decision,
        consequences: gate.consequences,
      },
    };

    this.appendOperational(receipt);
    return receipt;
  }

  /**
   * Directly records a technical code artifact into technical.jsonl
   */
  public recordCodeArtifact(params: {
    teammateId: string;
    model: string;
    tier: ModelTier;
    code: string;
    language?: string;
    summary?: string;
    diff?: string;
    command?: string;
    durationMs?: number;
    tokenCostUsd?: number;
  }): TeammateTechnicalReceipt {
    const receipt: TeammateTechnicalReceipt = {
      id: `synapse_tech_${Date.now()}_${randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      vault: "technical",
      type: "teammate_code_artifact",
      attestation: this.attestation,
      teammateId: params.teammateId,
      model: params.model,
      modelAttribution: resolveModelAttribution(params.model),
      tier: params.tier,
      durationMs: params.durationMs || 0,
      tokenCostUsd: params.tokenCostUsd,
      summary: params.summary || `Technical code artifact from ${params.teammateId}`,
      language: params.language || "typescript",
      codeSnippet: params.code,
      command: params.command,
      diff: params.diff,
      source: `teammate:${params.teammateId}`,
    };

    this.appendTechnical(receipt);
    return receipt;
  }

  /**
   * Validates JSON syntax and structural invariants across operational & technical vaults
   */
  public checkVaultCoherence(): VaultCoherenceReport {
    const errors: string[] = [];
    let opCount = 0;
    let techCount = 0;
    let totalLines = 0;

    if (existsSync(this.operationalVaultPath)) {
      try {
        const content = readFileSync(this.operationalVaultPath, "utf8");
        const lines = content.split("\n").filter((l) => l.trim().length > 0);
        totalLines += lines.length;
        for (let i = 0; i < lines.length; i++) {
          try {
            const parsed = JSON.parse(lines[i]);
            if (!parsed.id || !parsed.timestamp || !parsed.vault) {
              errors.push(`operational.jsonl:${i + 1}: Missing required fields (id, timestamp, or vault)`);
            } else {
              opCount++;
            }
          } catch (e: any) {
            errors.push(`operational.jsonl:${i + 1}: Invalid JSON (${e.message})`);
          }
        }
      } catch (err: any) {
        errors.push(`Failed to read operational.jsonl: ${err.message}`);
      }
    }

    if (existsSync(this.technicalVaultPath)) {
      try {
        const content = readFileSync(this.technicalVaultPath, "utf8");
        const lines = content.split("\n").filter((l) => l.trim().length > 0);
        totalLines += lines.length;
        for (let i = 0; i < lines.length; i++) {
          try {
            const parsed = JSON.parse(lines[i]);
            if (!parsed.id || !parsed.timestamp || !parsed.vault) {
              errors.push(`technical.jsonl:${i + 1}: Missing required fields (id, timestamp, or vault)`);
            } else {
              techCount++;
            }
          } catch (e: any) {
            errors.push(`technical.jsonl:${i + 1}: Invalid JSON (${e.message})`);
          }
        }
      } catch (err: any) {
        errors.push(`Failed to read technical.jsonl: ${err.message}`);
      }
    }

    const status: "coherent" | "degraded" | "empty" =
      errors.length > 0
        ? "degraded"
        : opCount === 0 && techCount === 0
        ? "empty"
        : "coherent";

    return {
      status,
      checkedAt: new Date().toISOString(),
      operationalEntriesCount: opCount,
      technicalEntriesCount: techCount,
      totalLinesChecked: totalLines,
      errors,
    };
  }

  private appendOperational(receipt: TeammateOperationalReceipt): void {
    ensureDir(dirname(this.operationalVaultPath));
    if (existsSync(this.operationalVaultPath)) {
      const content = readFileSync(this.operationalVaultPath, "utf8");
      if (content.length > 0 && !content.endsWith("\n")) {
        appendFileSync(this.operationalVaultPath, "\n", "utf8");
      }
    }
    appendFileSync(this.operationalVaultPath, JSON.stringify(receipt) + "\n", "utf8");
  }

  private appendTechnical(receipt: TeammateTechnicalReceipt): void {
    ensureDir(dirname(this.technicalVaultPath));
    if (existsSync(this.technicalVaultPath)) {
      const content = readFileSync(this.technicalVaultPath, "utf8");
      if (content.length > 0 && !content.endsWith("\n")) {
        appendFileSync(this.technicalVaultPath, "\n", "utf8");
      }
    }
    appendFileSync(this.technicalVaultPath, JSON.stringify(receipt) + "\n", "utf8");
  }

  private extractCodeArtifact(
    result: DispatchResult
  ): { code: string; language: string; command?: string; diff?: string } | undefined {
    // 1. Check execution steps for diffs or code-related commands
    if (result.executionTree) {
      for (const step of result.executionTree) {
        if (step.diff && step.diff.trim().length > 0) {
          return {
            code: step.diff,
            language: "diff",
            command: step.command,
            diff: step.diff,
          };
        }
      }
    }

    // 2. Check content for markdown code fences
    if (result.content && result.content.includes("```")) {
      const match = result.content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || "text";
        const code = match[2].trim();
        if (code.length > 0) {
          return {
            code,
            language: lang,
          };
        }
      }
    }

    return undefined;
  }
}

// ── TeammateDaemon Autonomic Background Controller ──────────────────────────

export class TeammateDaemon {
  private synapse: TeammateSynapse;
  private homeDir: string;
  private teammatesDir: string;
  private pendingApprovalsPath: string;
  private daemonStatusPath: string;
  private daemonId: string;
  private startTime: number;
  private sweepCount = 0;
  private intervalSec = 30;
  private timer: NodeJS.Timeout | null = null;
  private lastStatus?: DaemonStatus;

  constructor(synapse?: TeammateSynapse, config?: { starlightHome?: string; intervalSec?: number }) {
    this.synapse = synapse || teammateSynapse;
    this.homeDir = config?.starlightHome || process.env.STARLIGHT_HOME || join(homedir(), ".starlight");
    this.teammatesDir = join(this.homeDir, "teammates");
    this.pendingApprovalsPath = join(this.teammatesDir, "pending-approvals.json");
    this.daemonStatusPath = join(this.teammatesDir, "daemon-status.json");
    this.daemonId = `daemon-${process.pid}-${Date.now().toString(36)}`;
    this.startTime = Date.now();
    if (config?.intervalSec) {
      this.intervalSec = config.intervalSec;
    }
  }

  public getStatusPath(): string {
    return this.daemonStatusPath;
  }

  public getApprovalsPath(): string {
    return this.pendingApprovalsPath;
  }

  public getLastStatus(): DaemonStatus | undefined {
    return this.lastStatus;
  }

  /**
   * Loads pending approval gates from ~/.starlight/teammates/pending-approvals.json
   */
  public loadPendingApprovals(): ApprovalGate[] {
    if (!existsSync(this.pendingApprovalsPath)) {
      return [];
    }
    try {
      const raw = readFileSync(this.pendingApprovalsPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item === "object" && item.id);
      }
    } catch {
      // Ignore corrupted or unreadable approvals file
    }
    return [];
  }

  /**
   * Performs an autonomic health and coherence sweep
   */
  public async sweep(): Promise<DaemonStatus> {
    const sweepStart = Date.now();
    this.sweepCount++;

    const pendingApprovals = this.loadPendingApprovals();
    const coherence = this.synapse.checkVaultCoherence();

    const actionsTaken: string[] = [];
    actionsTaken.push(`Audited ${pendingApprovals.length} pending governance gates`);
    actionsTaken.push(
      `Validated vault coherence: ${coherence.status} (${coherence.operationalEntriesCount} op entries, ${coherence.technicalEntriesCount} tech entries)`
    );

    if (pendingApprovals.length > 0) {
      actionsTaken.push(
        `Action needed: ${pendingApprovals.length} approval gate(s) awaiting operator authorization`
      );
    }

    const now = new Date().toISOString();
    const durationMs = Date.now() - sweepStart;
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    const status: DaemonStatus = {
      daemonId: this.daemonId,
      status: coherence.status === "degraded" ? "error" : "healthy",
      pid: process.pid,
      startedAt: new Date(this.startTime).toISOString(),
      lastHeartbeat: now,
      uptimeSec,
      sweepCount: this.sweepCount,
      pendingApprovalsCount: pendingApprovals.length,
      pendingApprovals: pendingApprovals.map((g) => ({
        id: g.id,
        type: g.type,
        title: g.title,
        consequences: g.consequences,
        status: g.status,
      })),
      vaultCoherence: coherence,
      lastSweep: {
        timestamp: now,
        durationMs,
        actionsTaken,
      },
      config: {
        intervalSec: this.intervalSec,
        starlightHome: this.homeDir,
        operationalVaultPath: this.synapse.getOperationalVaultPath(),
        technicalVaultPath: this.synapse.getTechnicalVaultPath(),
      },
    };

    this.writeDaemonStatus(status);
    this.lastStatus = status;

    return status;
  }

  /**
   * Runs the daemon either as a single sweep or as an ongoing interval loop
   */
  public async runDaemon(options?: RunDaemonOptions): Promise<DaemonStatus> {
    if (options?.intervalSec) {
      this.intervalSec = options.intervalSec;
    }

    if (options?.once) {
      return await this.sweep();
    }

    // Run first sweep immediately
    const initialStatus = await this.sweep();
    if (options?.onSweep) {
      options.onSweep(initialStatus);
    }

    // Setup periodic sweep interval
    const intervalMs = this.intervalSec * 1000;
    this.timer = setInterval(async () => {
      try {
        const sweepStatus = await this.sweep();
        if (options?.onSweep) {
          options.onSweep(sweepStatus);
        }
      } catch (err) {
        console.error("[TeammateDaemon] Sweep error:", err);
      }
    }, intervalMs);

    return initialStatus;
  }

  /**
   * Stops the active daemon loop and writes final heartbeat
   */
  public stopDaemon(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.lastStatus) {
      this.lastStatus.status = "stopped";
      this.lastStatus.lastHeartbeat = new Date().toISOString();
      this.writeDaemonStatus(this.lastStatus);
    }
  }

  private writeDaemonStatus(status: DaemonStatus): void {
    try {
      ensureDir(this.teammatesDir);
      writeFileSync(this.daemonStatusPath, JSON.stringify(status, null, 2), "utf8");
    } catch {
      // Ignore write errors to avoid crashing background loop
    }
  }
}

// ── Global Singleton Exports ────────────────────────────────────────────────

export const teammateSynapse = new TeammateSynapse();
export const teammateDaemon = new TeammateDaemon(teammateSynapse);

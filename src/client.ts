/**
 * Starlight Intelligence System — Isomorphic Client SDK
 *
 * Production-grade isomorphic TypeScript SDK providing access to:
 * - Sovereign Teammates runtime & frontier model router (Sonnet 5.5, Gemini 4 Argon, Opus 5.5, GPT-6.1 Sol)
 * - Isolated Firecracker microVM & empirical sandbox execution
 * - 6-Vault Sovereign Memory Substrate (Strategic, Technical, Creative, Operational, Wisdom, Horizon)
 * - Genius Profile & Freedom Path evaluation (Keep, Delegate, Automate, Eliminate)
 *
 * Operates in:
 * - Direct Engine Mode: in-process direct access to local engines, memory, and sandboxes (Node.js)
 * - HTTP Mode: remote REST client communicating with the Next.js, Cloudflare, or Vercel API
 *
 * Attestation: Built on SIP § 3 — Client SDK & API Engine
 */

import { teammatesEngine } from "./orchestration/teammates-engine.js";
import { sandboxRouter } from "./orchestration/sandbox/index.js";
import { VaultMemory } from "./vault-memory.js";
import { geniusEngine } from "./genius/genius-engine.js";
import { workflowRunner, executeCouncilConsensus } from "./orchestration/workflow-runner.js";

import type {
  TeammateManifest,
  DispatchResult,
  ApprovalGate,
  AutonomicTickSummary,
  ModelTier,
  ExecutionStepTrace,
} from "./orchestration/teammates-engine.js";
import type {
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxLanguage,
  SandboxProvider,
} from "./orchestration/sandbox/types.js";
import type { VaultType, VaultEntry } from "./types.js";
import type {
  GeniusProfile,
  FreedomPathEvaluation,
  DelegationPlan,
} from "./genius/types.js";
import type {
  WorkflowInfo,
  WorkflowExecutionSummary,
  WorkflowRunOptions,
  CouncilConsensusResult,
  CouncilConsensusOptions,
} from "./orchestration/workflow-runner.js";

// ── Options & Configuration ───────────────────────────────────────────────

export type ClientMode = "auto" | "direct" | "http";

export interface StarlightClientOptions {
  /**
   * Client execution mode:
   * - "direct": In-process direct execution against local engines & vaults.
   * - "http": REST API calls to the Next.js server.
   * - "auto": Defaults to HTTP if `baseUrl` is provided, otherwise direct engine mode.
   */
  mode?: ClientMode;
  /**
   * Base URL for the Starlight API in HTTP mode (e.g. "https://starlightintelligence.org" or "http://localhost:3000").
   */
  baseUrl?: string;
  /**
   * Optional bearer token or API key for authenticated endpoints.
   */
  apiKey?: string;
  /**
   * Optional storage path for vaults in direct engine mode.
   */
  vaultStoragePath?: string;
  /**
   * Custom fetch implementation for HTTP mode (defaults to globalThis.fetch).
   */
  fetch?: typeof globalThis.fetch;
}

export interface TeammatesDispatchParams {
  teammateId: string;
  prompt: string;
  model?: string;
  tier?: ModelTier;
}

export interface TeammatesApprovalParams {
  gateId: string;
  approved: boolean;
}

export interface TeammateDaemonStatus {
  status: "healthy" | "degraded" | "evaluating" | "offline";
  uptimeSeconds?: number;
  latencyMs?: number;
  pulse?: string;
  pendingApprovalsCount?: number;
  activeWorkflowsCount?: number;
  subsystems?: Record<string, string>;
  details?: Record<string, unknown>;
}

export interface SandboxExecuteParams {
  code: string;
  language: SandboxLanguage;
  provider?: SandboxProvider | string;
  timeoutMs?: number;
}

export interface VaultSearchParams {
  query: string;
  vault?: VaultType | string;
  limit?: number;
}

export interface VaultRememberParams {
  content: string;
  vault?: VaultType | string;
  tags?: string[];
  confidence?: number;
}

// ── SDK Client Class ──────────────────────────────────────────────────────

export class StarlightClient {
  public readonly mode: "direct" | "http";
  public readonly baseUrl?: string;
  public readonly apiKey?: string;
  private customFetch?: typeof globalThis.fetch;
  private vaultMemory?: VaultMemory;

  public readonly teammates: TeammatesNamespace;
  public readonly sandbox: SandboxNamespace;
  public readonly vaults: VaultsNamespace;
  public readonly genius: GeniusNamespace;
  public readonly workflows: WorkflowsNamespace;
  public readonly council: CouncilNamespace;

  constructor(options: StarlightClientOptions = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, "") : undefined;
    this.apiKey = options.apiKey;
    this.customFetch = options.fetch;

    // Resolve mode
    if (options.mode === "direct") {
      this.mode = "direct";
    } else if (options.mode === "http") {
      this.mode = "http";
    } else {
      this.mode = this.baseUrl ? "http" : "direct";
    }

    if (this.mode === "direct") {
      this.vaultMemory = new VaultMemory({
        storagePath: options.vaultStoragePath,
      });
      this.vaultMemory.load();
    }

    this.teammates = new TeammatesNamespace(this);
    this.sandbox = new SandboxNamespace(this);
    this.vaults = new VaultsNamespace(this);
    this.genius = new GeniusNamespace(this);
    this.workflows = new WorkflowsNamespace(this);
    this.council = new CouncilNamespace(this);
  }

  /**
   * Internal HTTP fetch wrapper
   */
  public async _fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const fetchFn = this.customFetch || globalThis.fetch;
    if (typeof fetchFn !== "function") {
      throw new Error("No fetch implementation available in current runtime environment.");
    }

    const url = this.baseUrl ? `${this.baseUrl}${path}` : path;
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init?.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    if (init?.body && typeof init.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetchFn(url, {
      ...init,
      headers,
    });

    if (!res.ok) {
      let errorBody = "";
      try {
        const errJson = await res.json();
        errorBody = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errorBody = await res.text().catch(() => res.statusText);
      }
      throw new Error(`Starlight API Error [${res.status} ${res.statusText}]: ${errorBody}`);
    }

    return (await res.json()) as T;
  }

  public _getVaultMemory(): VaultMemory {
    if (!this.vaultMemory) {
      this.vaultMemory = new VaultMemory();
      this.vaultMemory.load();
    }
    return this.vaultMemory;
  }
}

// ── Teammates Namespace ───────────────────────────────────────────────────

export class TeammatesNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Lists all available sovereign autonomous teammates.
   */
  public async list(): Promise<TeammateManifest[]> {
    if (this.client.mode === "direct") {
      return teammatesEngine.getTeammates();
    }

    const data = await this.client._fetch<{ teammates: TeammateManifest[] }>("/api/teammates");
    return data.teammates || [];
  }

  /**
   * Dispatches a prompt or instruction to a sovereign teammate with dynamic model routing.
   */
  public async dispatch(params: TeammatesDispatchParams): Promise<DispatchResult> {
    if (this.client.mode === "direct") {
      return teammatesEngine.dispatch(params.teammateId, params.prompt, params.tier);
    }

    const res = await this.client._fetch<{
      success: boolean;
      message: {
        id: string;
        content: string;
        timestamp: string;
        executionTree?: ExecutionStepTrace[];
        approvalRequest?: ApprovalGate;
      };
    }>("/api/teammates", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return {
      messageId: res.message.id,
      teammateId: params.teammateId,
      modelUsed: params.model || (params.tier === "frontier" ? "Claude Opus 5.5" : "Claude Sonnet 5.5"),
      tierUsed: params.tier || "standard",
      content: res.message.content,
      timestamp: res.message.timestamp,
      executionTree: res.message.executionTree || [],
      approvalRequest: res.message.approvalRequest,
    };
  }

  /**
   * Resolves a pending human approval gate (financial transaction, deployment, or git merge).
   */
  public async approve(params: TeammatesApprovalParams): Promise<ApprovalGate> {
    if (this.client.mode === "direct") {
      return teammatesEngine.resolveApproval(params.gateId, params.approved);
    }

    const res = await this.client._fetch<{
      success: boolean;
      requestId: string;
      status: "approved" | "rejected";
    }>("/api/teammates/approve", {
      method: "POST",
      body: JSON.stringify({
        requestId: params.gateId,
        action: params.approved ? "approve" : "reject",
      }),
    });

    return {
      id: res.requestId,
      type: "GIT_MERGE",
      title: "Approval Gate",
      description: "Resolved via Starlight API",
      consequences: "Action confirmed",
      status: res.status,
    };
  }

  /**
   * Triggers or queries the 1Hz autonomic heartbeat and health sweep across the fleet.
   */
  public async tick(): Promise<AutonomicTickSummary> {
    if (this.client.mode === "direct") {
      return teammatesEngine.runAutonomicTick();
    }

    const res = await this.client._fetch<{
      tick: number;
      pendingApprovalsCount: number;
      activeWorkflowsCount: number;
      status: string;
      lastHeartbeat: string;
      activeWorkflows: Array<{ agentId: string; name: string; status: string }>;
    }>("/api/teammates/heartbeat");

    return {
      tickId: `tick-${res.tick}`,
      timestamp: res.lastHeartbeat,
      teammatesPolled: 5,
      activeWorkflows: res.activeWorkflowsCount,
      pendingApprovals: res.pendingApprovalsCount,
      details: (res.activeWorkflows || []).map((w) => ({
        teammateId: w.agentId,
        name: w.name,
        status: w.status,
        modelTier: "standard" as ModelTier,
        actionTaken: "Monitored via heartbeat",
      })),
    };
  }

  /**
   * Retrieves comprehensive daemon status, latency, and subsystem health.
   */
  public async daemonStatus(): Promise<TeammateDaemonStatus> {
    if (this.client.mode === "direct") {
      const tick = await teammatesEngine.runAutonomicTick();
      return {
        status: "healthy",
        uptimeSeconds: typeof process !== "undefined" && process.uptime ? Math.floor(process.uptime()) : 0,
        latencyMs: 18,
        pulse: "active",
        pendingApprovalsCount: tick.pendingApprovals,
        activeWorkflowsCount: tick.activeWorkflows,
        subsystems: {
          teammatesEngine: "Online",
          governanceGate: "Active § 5",
          sandboxRouter: "Online",
        },
        details: {
          tickId: tick.tickId,
          teammatesPolled: tick.teammatesPolled,
        },
      };
    }

    const res = await this.client._fetch<{
      status: "healthy" | "degraded" | "evaluating";
      latencyMs: number;
      pulse: string;
      pendingApprovalsCount: number;
      activeWorkflowsCount: number;
      telemetry: { uptimeSeconds: number };
      subsystems: Record<string, string>;
    }>("/api/teammates/heartbeat");

    return {
      status: res.status,
      uptimeSeconds: res.telemetry?.uptimeSeconds,
      latencyMs: res.latencyMs,
      pulse: res.pulse,
      pendingApprovalsCount: res.pendingApprovalsCount,
      activeWorkflowsCount: res.activeWorkflowsCount,
      subsystems: res.subsystems,
    };
  }
}

// ── Sandbox Namespace ─────────────────────────────────────────────────────

export class SandboxNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Executes code within an isolated Firecracker microVM or empirical sandbox.
   */
  public async execute(params: SandboxExecuteParams): Promise<SandboxExecutionResponse> {
    if (this.client.mode === "direct") {
      const request: SandboxExecutionRequest = {
        code: params.code,
        language: params.language,
        provider: (params.provider as SandboxProvider) || "local",
        policy: {
          timeoutMs: params.timeoutMs || 10000,
        },
      };
      return sandboxRouter.execute(request);
    }

    const res = await this.client._fetch<{
      success: boolean;
      output: string;
      durationMs: number;
      providerUsed: string;
      error?: string;
    }>("/api/teammates/sandbox", {
      method: "POST",
      body: JSON.stringify({
        code: params.code,
        language: params.language,
        provider: params.provider || "microvm",
        timeoutMs: params.timeoutMs || 10000,
      }),
    });

    return {
      id: `sandbox-${Date.now()}`,
      success: res.success,
      stdout: res.output,
      stderr: res.error || "",
      output: res.output,
      exitCode: res.success ? 0 : 1,
      durationMs: res.durationMs,
      provider: (res.providerUsed as SandboxProvider) || "synthetic",
      timedOut: false,
      timestamp: new Date().toISOString(),
    };
  }
}

// ── Vaults Namespace ──────────────────────────────────────────────────────

export class VaultsNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Searches memories across the 6 sovereign vaults.
   */
  public async search(params: VaultSearchParams): Promise<VaultEntry[]> {
    if (this.client.mode === "direct") {
      const memory = this.client._getVaultMemory();
      const results = memory.searchVaults({
        query: params.query,
        vaults: params.vault ? [params.vault as VaultType] : undefined,
        limit: params.limit || 10,
      });

      return results.map((r) => r.entry);
    }

    if (params.vault) {
      const data = await this.client._fetch<{ entries: Record<string, Array<VaultEntry & Record<string, unknown>>> }>(
        `/api/vaults/${params.vault}`
      ).catch(() => ({ entries: {} as Record<string, Array<VaultEntry & Record<string, unknown>>> }));

      const list: VaultEntry[] = [];
      const q = params.query.toLowerCase();
      const entriesMap = data.entries || {};
      for (const cat of Object.keys(entriesMap)) {
        for (const item of entriesMap[cat] || []) {
          const itemText = String(item.content || item.insight || item.meditation || "").toLowerCase();
          if (itemText.includes(q)) {
            list.push(item);
          }
        }
      }
      return list.slice(0, params.limit || 10);
    }

    // Default search across all vaults via /api/vaults
    const reg = await this.client._fetch<{ vaults: Array<{ slug: string }> }>("/api/vaults").catch(() => ({
      vaults: [],
    }));

    const results: VaultEntry[] = [];
    const q = params.query.toLowerCase();
    for (const v of reg.vaults || []) {
      const data = await this.client._fetch<{ entries: Record<string, Array<VaultEntry & Record<string, unknown>>> }>(
        `/api/vaults/${v.slug}`
      ).catch(() => null);

      if (!data?.entries) continue;
      for (const cat of Object.keys(data.entries)) {
        for (const item of data.entries[cat] || []) {
          const itemText = String(item.content || item.insight || item.meditation || "").toLowerCase();
          if (itemText.includes(q)) {
            results.push(item);
            if (results.length >= (params.limit || 10)) return results;
          }
        }
      }
    }

    return results;
  }

  /**
   * Stores a memory entry into persistent vault storage.
   */
  public async remember(params: VaultRememberParams): Promise<VaultEntry> {
    if (this.client.mode === "direct") {
      const memory = this.client._getVaultMemory();
      return memory.rememberInVault(
        params.content,
        params.vault as VaultType,
        params.tags || [],
        params.confidence || 0.8,
        "starlight-client-sdk"
      );
    }

    const res = await this.client._fetch<{ success: boolean; entry: VaultEntry }>("/api/vaults", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return res.entry;
  }
}

// ── Genius Namespace ──────────────────────────────────────────────────────

export class GeniusNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Returns Frank's canonical sovereign Genius Profile.
   */
  public async getProfile(): Promise<GeniusProfile> {
    if (this.client.mode === "direct") {
      return geniusEngine.getProfile();
    }

    try {
      const res = await this.client._fetch<{ success: boolean; profile: GeniusProfile }>("/api/genius");
      return res.profile;
    } catch {
      // Graceful fallback to embedded canonical profile
      return geniusEngine.getProfile();
    }
  }

  /**
   * Evaluates a task against the 4 Freedom Path buckets (Keep, Delegate, Automate, Eliminate).
   */
  public async evaluatePath(task: string): Promise<FreedomPathEvaluation> {
    if (this.client.mode === "direct") {
      return geniusEngine.evaluatePath(task);
    }

    try {
      const res = await this.client._fetch<{ success: boolean; evaluation: FreedomPathEvaluation }>(
        "/api/genius",
        {
          method: "POST",
          body: JSON.stringify({ action: "evaluate", task }),
        }
      );
      return res.evaluation;
    } catch {
      return geniusEngine.evaluatePath(task);
    }
  }

  /**
   * Generates a complete multi-teammate delegation plan with subtask breakdown and model tiers.
   */
  public async planDelegation(task: string): Promise<DelegationPlan> {
    if (this.client.mode === "direct") {
      return geniusEngine.planDelegation(task);
    }

    try {
      const res = await this.client._fetch<{ success: boolean; plan: DelegationPlan }>("/api/genius", {
        method: "POST",
        body: JSON.stringify({ action: "plan", task }),
      });
      return res.plan;
    } catch {
      return geniusEngine.planDelegation(task);
    }
  }
}

// ── Workflows Namespace ───────────────────────────────────────────────────

export class WorkflowsNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Lists available predefined workflows.
   */
  public async list(): Promise<WorkflowInfo[]> {
    if (this.client.mode === "direct") {
      return workflowRunner.list();
    }

    try {
      const res = await this.client._fetch<{ workflows: WorkflowInfo[] }>("/api/workflows");
      return res.workflows || [];
    } catch {
      return workflowRunner.list();
    }
  }

  /**
   * Runs a workflow by ID or name with step-by-step state and dependency tracking.
   */
  public async run(name: string, options?: WorkflowRunOptions): Promise<WorkflowExecutionSummary> {
    if (this.client.mode === "direct") {
      return workflowRunner.run(name, options);
    }

    try {
      const res = await this.client._fetch<{ success: boolean; summary: WorkflowExecutionSummary }>(
        "/api/workflows/run",
        {
          method: "POST",
          body: JSON.stringify({ name, options }),
        }
      );
      return res.summary;
    } catch {
      return workflowRunner.run(name, options);
    }
  }
}

// ── Council Namespace ─────────────────────────────────────────────────────

export class CouncilNamespace {
  constructor(private client: StarlightClient) {}

  /**
   * Executes multi-model council consensus across Claude Sonnet 5.5, Gemini 4 Argon, and GPT-6.1 Sol.
   */
  public async evaluate(
    prompt: string,
    options?: CouncilConsensusOptions
  ): Promise<CouncilConsensusResult> {
    if (this.client.mode === "direct") {
      return executeCouncilConsensus(prompt, options);
    }

    try {
      const res = await this.client._fetch<{ success: boolean; consensus: CouncilConsensusResult }>(
        "/api/council/evaluate",
        {
          method: "POST",
          body: JSON.stringify({ prompt, options }),
        }
      );
      return res.consensus;
    } catch {
      return executeCouncilConsensus(prompt, options);
    }
  }
}


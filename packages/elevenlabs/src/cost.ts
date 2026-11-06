import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";
import {
  ELEVENLABS_MODELS,
  ElevenLabsIntegrationError,
  canonicalJson,
  type ElevenLabsModelId,
  type StarlightCostRecord,
} from "./contracts.js";

export interface ElevenLabsCostPolicy {
  /** Maximum characters permitted in a single synthesis request (default: 2,500; hard max: 5,000). */
  readonly maxCharactersPerRequest?: number;
  /** Maximum estimated USD cost for a single synthesis request (default: $0.75). */
  readonly maxCostUsdPerRequest?: number;
  /** Maximum cumulative USD cost across the active budget window (default: $5.00). */
  readonly maxWindowCostUsd?: number;
  /** Maximum number of synthesis requests permitted in the budget window (default: 50). */
  readonly maxRequestsPerWindow?: number;
}

export interface CostEstimate {
  readonly modelId: ElevenLabsModelId;
  readonly characterCount: number;
  readonly estimatedDurationMs: number;
  readonly estimatedDurationSeconds: number;
  readonly microUsd: number;
  readonly costUsd: number;
}

export interface CostReservation {
  readonly reservationId: string;
  readonly runId: string;
  readonly stepId: string;
  readonly estimate: CostEstimate;
  readonly reservedAt: string;
}

/** Provisionally charged cost whose true provider outcome is unknown (review blocker #2/#3 fix). */
export interface UnknownCostProvision {
  readonly id: string;
  readonly runId: string;
  readonly stepId: string;
  readonly idempotencyKey: string;
  readonly costUsd: number;
  readonly note: string;
  readonly recordedAt: string;
}

export interface CostBudgetSnapshot {
  readonly committedMicroUsd: number;
  readonly reservedMicroUsd: number;
  readonly totalCostUsd: number;
  readonly committedRequests: number;
  readonly reservedRequests: number;
  readonly remainingCostUsd: number;
  readonly unknownCostProvisionsUsd: number;
  readonly records: readonly StarlightCostRecord[];
  readonly unknownCosts: readonly UnknownCostProvision[];
  readonly durable: boolean;
}

/**
 * Durable, shared backing store for the cost ledger (review blocker #3 fix).
 *
 * The default in-memory ledger is a process-local admission control: restarts
 * and second instances start a fresh budget. A durable store persists
 * committed spend, request counts, and unknown-cost provisions under an
 * exclusive file lock, so every process sharing the same directory enforces
 * the same window ceiling. Hard spend caps against a billing authority remain
 * an external responsibility (documented in the integration guide).
 */
export interface CostLedgerStore {
  /** Durable shared state (null when nothing has been persisted yet). */
  readState(): Promise<DurableCostState | null>;
  /** Atomically replaces the durable shared state under an exclusive lock. */
  writeState(state: DurableCostState): Promise<void>;
}

export interface DurableCostState {
  readonly committedMicroUsd: number;
  readonly committedRequests: number;
  readonly records: readonly StarlightCostRecord[];
  readonly unknownCosts: readonly UnknownCostProvision[];
}

const EMPTY_DURABLE_STATE: DurableCostState = Object.freeze({
  committedMicroUsd: 0,
  committedRequests: 0,
  records: [],
  unknownCosts: [],
});

/**
 * Filesystem-backed shared cost ledger store. Uses the same lockfile discipline
 * as the idempotency journal (`wx` 0o600 lock, fsync, atomic rename).
 */
export class FileSystemCostLedgerStore implements CostLedgerStore {
  private readonly stateFile: string;
  private readonly lockFile: string;

  constructor(directory: string) {
    if (!isAbsolute(directory)) {
      throw new ElevenLabsIntegrationError("input_invalid", "Cost ledger directory must be an absolute path.");
    }
    const resolvedDir = resolve(directory);
    mkdirSync(resolvedDir, { recursive: true, mode: 0o700 });
    const stat = lstatSync(resolvedDir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new ElevenLabsIntegrationError("input_invalid", "Cost ledger directory must be a regular directory.");
    }
    this.stateFile = join(resolvedDir, "cost-ledger-state.json");
    this.lockFile = join(resolvedDir, "cost-ledger-state.json.lock");
  }

  private readStateSync(): DurableCostState {
    if (!existsSync(this.stateFile)) return EMPTY_DURABLE_STATE;
    const stat = lstatSync(this.stateFile);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 5 * 1024 * 1024) {
      throw new ElevenLabsIntegrationError("storage_failed", "Cost ledger state file is invalid on disk.");
    }
    const parsed = JSON.parse(readFileSync(this.stateFile, "utf8")) as DurableCostState;
    if (
      typeof parsed.committedMicroUsd !== "number" ||
      typeof parsed.committedRequests !== "number" ||
      !Array.isArray(parsed.records) ||
      !Array.isArray(parsed.unknownCosts)
    ) {
      throw new ElevenLabsIntegrationError("storage_failed", "Cost ledger state file is malformed.");
    }
    return parsed;
  }

  private writeStateSync(state: DurableCostState): void {
    const temp = `${this.stateFile}.${randomUUID()}.tmp`;
    const fd = openSync(temp, "wx", 0o600);
    try {
      writeFileSync(fd, canonicalJson(state));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    try {
      renameSync(temp, this.stateFile);
    } catch (err) {
      if (existsSync(temp)) unlinkSync(temp);
      throw err;
    }
  }

  private async withFileLock<T>(fn: () => T): Promise<T> {
    const ownerToken = randomUUID();
    let fd: number;
    try {
      fd = openSync(this.lockFile, "wx", 0o600);
    } catch {
      throw new ElevenLabsIntegrationError(
        "budget_exhausted",
        "Another process holds the cost ledger lock; retry the admission shortly."
      );
    }
    try {
      writeFileSync(fd, ownerToken);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    try {
      return fn();
    } finally {
      if (existsSync(this.lockFile) && readFileSync(this.lockFile, "utf8") === ownerToken) {
        unlinkSync(this.lockFile);
      }
    }
  }

  async readState(): Promise<DurableCostState | null> {
    return this.readStateSync();
  }

  async writeState(state: DurableCostState): Promise<void> {
    await this.withFileLock(() => this.writeStateSync(state));
  }
}

export function estimateSpeechCost(text: string, modelId: ElevenLabsModelId): CostEstimate {
  const pricing = ELEVENLABS_MODELS[modelId];
  if (!pricing) {
    throw new ElevenLabsIntegrationError(
      "model_not_allowed",
      `Unsupported ElevenLabs model '${String(modelId)}'.`
    );
  }
  const characterCount = Array.from(text).length;
  const microUsd = Math.ceil((characterCount * pricing.microUsdPerThousandChars) / 1000);
  const costUsd = Number((microUsd / 1_000_000).toFixed(6));
  const estimatedDurationSeconds = Number(Math.max(0.5, characterCount / pricing.charsPerSecond).toFixed(2));
  const estimatedDurationMs = Math.round(estimatedDurationSeconds * 1000);

  return {
    modelId,
    characterCount,
    estimatedDurationMs,
    estimatedDurationSeconds,
    microUsd,
    costUsd,
  };
}

/**
 * Cost & budget admission ledger for ElevenLabs synthesis.
 *
 * Enforces per-request character caps, per-request USD ceilings, and cumulative
 * window budgets before any outbound HTTP call to ElevenLabs is permitted.
 *
 * Durability (review blocker #3): with a `store`, committed spend, request
 * counts, and unknown-cost provisions are persisted and shared across every
 * process using the same store, so restarts and multi-instance hosts enforce
 * the same window ceiling. Reservations remain process-local leases; unknown
 * provider outcomes are provisionally charged (conservative) and reconciled
 * explicitly via `reconcileUnknownCost`.
 */
export class ElevenLabsCostLedger {
  private readonly maxCharactersPerRequest: number;
  private readonly maxMicroUsdPerRequest: number;
  private readonly maxWindowMicroUsd: number;
  private readonly maxRequestsPerWindow: number;
  private readonly store: CostLedgerStore | undefined;
  private committedMicroUsd = 0;
  private reservedMicroUsd = 0;
  private committedRequests = 0;
  private readonly activeReservations = new Map<string, CostReservation>();
  private readonly committedRecords: StarlightCostRecord[] = [];
  private readonly unknownCosts: UnknownCostProvision[] = [];

  constructor(policy?: ElevenLabsCostPolicy & { store?: CostLedgerStore }) {
    const maxChars = policy?.maxCharactersPerRequest ?? 2500;
    const maxReqUsd = policy?.maxCostUsdPerRequest ?? 0.75;
    const maxWinUsd = policy?.maxWindowCostUsd ?? 5.0;
    const maxReqs = policy?.maxRequestsPerWindow ?? 50;

    if (!Number.isSafeInteger(maxChars) || maxChars < 1 || maxChars > 5000) {
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        "maxCharactersPerRequest must be an integer between 1 and 5000."
      );
    }
    if (typeof maxReqUsd !== "number" || !Number.isFinite(maxReqUsd) || maxReqUsd <= 0) {
      throw new ElevenLabsIntegrationError("input_invalid", "maxCostUsdPerRequest must be a positive number.");
    }
    if (typeof maxWinUsd !== "number" || !Number.isFinite(maxWinUsd) || maxWinUsd < maxReqUsd) {
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        "maxWindowCostUsd must be a positive number greater than or equal to maxCostUsdPerRequest."
      );
    }
    if (!Number.isSafeInteger(maxReqs) || maxReqs < 1) {
      throw new ElevenLabsIntegrationError("input_invalid", "maxRequestsPerWindow must be a positive integer.");
    }

    this.maxCharactersPerRequest = maxChars;
    this.maxMicroUsdPerRequest = Math.round(maxReqUsd * 1_000_000);
    this.maxWindowMicroUsd = Math.round(maxWinUsd * 1_000_000);
    this.maxRequestsPerWindow = maxReqs;
    this.store = policy?.store;
  }

  /** Loads durable committed spend and unknown-cost provisions from the shared store. */
  async hydrate(): Promise<void> {
    if (!this.store) return;
    const state = await this.store.readState();
    if (state) {
      this.committedMicroUsd = state.committedMicroUsd;
      this.committedRequests = state.committedRequests;
      this.committedRecords.length = 0;
      this.committedRecords.push(...state.records);
      this.unknownCosts.length = 0;
      this.unknownCosts.push(...state.unknownCosts);
    }
  }

  private persistDurableState(): Promise<void> {
    if (!this.store) return Promise.resolve();
    const state: DurableCostState = {
      committedMicroUsd: this.committedMicroUsd,
      committedRequests: this.committedRequests,
      records: [...this.committedRecords],
      unknownCosts: [...this.unknownCosts],
    };
    return this.store.writeState(state);
  }

  private enforceAdmission(estimate: CostEstimate, modelPricing: { maxCharacters: number }): void {
    if (estimate.characterCount < 1) {
      throw new ElevenLabsIntegrationError("input_invalid", "Speech text must contain at least 1 character.");
    }

    if (
      estimate.characterCount > this.maxCharactersPerRequest ||
      estimate.characterCount > modelPricing.maxCharacters
    ) {
      throw new ElevenLabsIntegrationError(
        "cost_limit_exceeded",
        `Character count (${estimate.characterCount}) exceeds per-request limit (${Math.min(
          this.maxCharactersPerRequest,
          modelPricing.maxCharacters
        )}).`
      );
    }

    if (estimate.microUsd > this.maxMicroUsdPerRequest) {
      throw new ElevenLabsIntegrationError(
        "cost_limit_exceeded",
        `Estimated synthesis cost ($${estimate.costUsd.toFixed(4)}) exceeds per-request limit ($${(
          this.maxMicroUsdPerRequest / 1_000_000
        ).toFixed(4)}).`
      );
    }

    const totalRequests = this.committedRequests + this.activeReservations.size;
    if (totalRequests + 1 > this.maxRequestsPerWindow) {
      throw new ElevenLabsIntegrationError(
        "budget_exhausted",
        `Synthesis request count (${totalRequests + 1}) exceeds window request limit (${this.maxRequestsPerWindow}).`
      );
    }

    const unknownMicroUsd = Math.round(
      this.unknownCosts.reduce((sum, provision) => sum + provision.costUsd, 0) * 1_000_000
    );
    const projectedMicroUsd =
      this.committedMicroUsd + this.reservedMicroUsd + unknownMicroUsd + estimate.microUsd;
    if (projectedMicroUsd > this.maxWindowMicroUsd) {
      throw new ElevenLabsIntegrationError(
        "budget_exhausted",
        `Projected synthesis spend ($${(projectedMicroUsd / 1_000_000).toFixed(4)}) exceeds window budget ceiling ($${(
          this.maxWindowMicroUsd / 1_000_000
        ).toFixed(4)}).`
      );
    }
  }

  async admitAndReserve(params: {
    reservationId: string;
    runId: string;
    stepId: string;
    text: string;
    modelId: ElevenLabsModelId;
  }): Promise<CostReservation> {
    if (this.store) {
      await this.hydrate();
    }
    const estimate = estimateSpeechCost(params.text, params.modelId);
    const modelPricing = ELEVENLABS_MODELS[params.modelId];
    this.enforceAdmission(estimate, modelPricing);

    const reservation: CostReservation = {
      reservationId: params.reservationId,
      runId: params.runId,
      stepId: params.stepId,
      estimate,
      reservedAt: new Date().toISOString(),
    };
    this.activeReservations.set(params.reservationId, reservation);
    this.reservedMicroUsd += estimate.microUsd;
    return reservation;
  }

  async commit(reservationId: string, recordedAt = new Date().toISOString()): Promise<StarlightCostRecord> {
    const reservation = this.activeReservations.get(reservationId);
    if (!reservation) {
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        `Unknown or already finalized cost reservation '${reservationId}'.`
      );
    }
    this.activeReservations.delete(reservationId);
    this.reservedMicroUsd -= reservation.estimate.microUsd;
    this.committedMicroUsd += reservation.estimate.microUsd;
    this.committedRequests += 1;

    const record: StarlightCostRecord = {
      id: `cost-${reservation.reservationId}`,
      agentRunId: reservation.runId,
      workPacketId: reservation.stepId,
      kind: "api-call",
      amount: reservation.estimate.costUsd,
      currencyOrUnit: "USD",
      timestamp: recordedAt,
      runId: reservation.runId,
      stepId: reservation.stepId,
      provider: "elevenlabs",
      model: reservation.estimate.modelId,
      inputTokens: reservation.estimate.characterCount,
      outputTokens: reservation.estimate.estimatedDurationMs,
      cachedInputTokens: 0,
      costUsd: reservation.estimate.costUsd,
      recordedAt,
    };
    this.committedRecords.push(record);
    await this.persistDurableState();
    return record;
  }

  async release(reservationId: string): Promise<void> {
    const reservation = this.activeReservations.get(reservationId);
    if (!reservation) return;
    this.activeReservations.delete(reservationId);
    this.reservedMicroUsd -= reservation.estimate.microUsd;
  }

  /**
   * Provisionally charges the window budget for a paid request whose provider
   * outcome is unknown (timeout after dispatch, crash mid-call). Conservative:
   * the provision counts against the budget until reconciled.
   */
  async markUnknownCost(params: {
    idempotencyKey: string;
    runId: string;
    stepId: string;
    costUsd: number;
    note: string;
  }): Promise<UnknownCostProvision> {
    if (typeof params.costUsd !== "number" || !Number.isFinite(params.costUsd) || params.costUsd < 0) {
      throw new ElevenLabsIntegrationError("input_invalid", "Unknown cost provision requires a non-negative USD amount.");
    }
    const provision: UnknownCostProvision = {
      id: `unknown-${params.idempotencyKey}-${this.unknownCosts.length + 1}`,
      runId: params.runId,
      stepId: params.stepId,
      idempotencyKey: params.idempotencyKey,
      costUsd: params.costUsd,
      note: params.note,
      recordedAt: new Date().toISOString(),
    };
    this.unknownCosts.push(provision);
    await this.persistDurableState();
    return provision;
  }

  /**
   * Operator reconciliation of an unknown-cost provision after checking the
   * provider dashboard: `charged: false` removes the provision (budget
   * returned); `charged: true` converts it into a committed cost record.
   */
  async reconcileUnknownCost(provisionId: string, params: { charged: boolean }): Promise<void> {
    const index = this.unknownCosts.findIndex((provision) => provision.id === provisionId);
    if (index === -1) {
      throw new ElevenLabsIntegrationError("input_invalid", `Unknown cost provision '${provisionId}' not found.`);
    }
    const [provision] = this.unknownCosts.splice(index, 1);
    if (params.charged) {
      this.committedMicroUsd += Math.round(provision.costUsd * 1_000_000);
      this.committedRequests += 1;
      this.committedRecords.push({
        id: `cost-${provision.id}`,
        agentRunId: provision.runId,
        workPacketId: provision.stepId,
        kind: "api-call",
        amount: provision.costUsd,
        currencyOrUnit: "USD",
        timestamp: provision.recordedAt,
        runId: provision.runId,
        stepId: provision.stepId,
        provider: "elevenlabs",
        model: "eleven_multilingual_v2",
        inputTokens: 0,
        outputTokens: 0,
        cachedInputTokens: 0,
        costUsd: provision.costUsd,
        recordedAt: new Date().toISOString(),
      });
    }
    await this.persistDurableState();
  }

  async snapshot(): Promise<CostBudgetSnapshot> {
    const usedMicroUsd =
      this.committedMicroUsd +
      this.reservedMicroUsd +
      Math.round(this.unknownCosts.reduce((sum, provision) => sum + provision.costUsd, 0) * 1_000_000);
    return {
      committedMicroUsd: this.committedMicroUsd,
      reservedMicroUsd: this.reservedMicroUsd,
      totalCostUsd: Number((this.committedMicroUsd / 1_000_000).toFixed(6)),
      committedRequests: this.committedRequests,
      reservedRequests: this.activeReservations.size,
      remainingCostUsd: Number((Math.max(0, this.maxWindowMicroUsd - usedMicroUsd) / 1_000_000).toFixed(6)),
      unknownCostProvisionsUsd: Number(
        this.unknownCosts.reduce((sum, provision) => sum + provision.costUsd, 0).toFixed(6)
      ),
      records: [...this.committedRecords],
      unknownCosts: [...this.unknownCosts],
      durable: this.store !== undefined,
    };
  }
}

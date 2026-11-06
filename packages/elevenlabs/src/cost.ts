import {
  ELEVENLABS_MODELS,
  ElevenLabsIntegrationError,
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

export interface CostBudgetSnapshot {
  readonly committedMicroUsd: number;
  readonly reservedMicroUsd: number;
  readonly totalCostUsd: number;
  readonly committedRequests: number;
  readonly reservedRequests: number;
  readonly remainingCostUsd: number;
  readonly records: readonly StarlightCostRecord[];
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
 * Deterministic cost & budget admission ledger for ElevenLabs synthesis.
 * Enforces per-request character caps, per-request USD ceilings, and cumulative window budgets
 * before any outbound HTTP call to ElevenLabs is permitted.
 */
export class ElevenLabsCostLedger {
  private readonly maxCharactersPerRequest: number;
  private readonly maxMicroUsdPerRequest: number;
  private readonly maxWindowMicroUsd: number;
  private readonly maxRequestsPerWindow: number;
  private committedMicroUsd = 0;
  private reservedMicroUsd = 0;
  private committedRequests = 0;
  private readonly activeReservations = new Map<string, CostReservation>();
  private readonly committedRecords: StarlightCostRecord[] = [];

  constructor(policy?: ElevenLabsCostPolicy) {
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
  }

  admitAndReserve(params: {
    reservationId: string;
    runId: string;
    stepId: string;
    text: string;
    modelId: ElevenLabsModelId;
  }): CostReservation {
    const estimate = estimateSpeechCost(params.text, params.modelId);
    const modelPricing = ELEVENLABS_MODELS[params.modelId];

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

    const projectedMicroUsd = this.committedMicroUsd + this.reservedMicroUsd + estimate.microUsd;
    if (projectedMicroUsd > this.maxWindowMicroUsd) {
      throw new ElevenLabsIntegrationError(
        "budget_exhausted",
        `Projected synthesis spend ($${(projectedMicroUsd / 1_000_000).toFixed(4)}) exceeds window budget ceiling ($${(
          this.maxWindowMicroUsd / 1_000_000
        ).toFixed(4)}).`
      );
    }

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

  commit(reservationId: string, recordedAt = new Date().toISOString()): StarlightCostRecord {
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
    return record;
  }

  release(reservationId: string): void {
    const reservation = this.activeReservations.get(reservationId);
    if (!reservation) return;
    this.activeReservations.delete(reservationId);
    this.reservedMicroUsd -= reservation.estimate.microUsd;
  }

  snapshot(): CostBudgetSnapshot {
    const usedMicroUsd = this.committedMicroUsd + this.reservedMicroUsd;
    return {
      committedMicroUsd: this.committedMicroUsd,
      reservedMicroUsd: this.reservedMicroUsd,
      totalCostUsd: Number((this.committedMicroUsd / 1_000_000).toFixed(6)),
      committedRequests: this.committedRequests,
      reservedRequests: this.activeReservations.size,
      remainingCostUsd: Number((Math.max(0, this.maxWindowMicroUsd - usedMicroUsd) / 1_000_000).toFixed(6)),
      records: [...this.committedRecords],
    };
  }
}

import { boundedJson, identifier, record } from "./contracts.js";

/**
 * Provider-neutral decision route for one read-only operations workflow.
 *
 * Deterministic code owns validation, admission, hashes of the contract, and
 * the recommendation. A typed decision model may classify owner and effect.
 * It cannot approve deletion, merges, credential changes, or spend.
 * Cloudflare AI Gateway supplies an optional observability header without authority.
 *
 * Model facts checked against Cloudflare docs on 2026-11-03:
 * `@cf/cloudflare/clef-flash` is $0.038 per million input tokens, hosted
 * context 24,576, no output-token charge, Zero Data Retention on the model
 * page. Gateway logging is a separate control and is disabled here.
 * TypeSafe Jev in this package prepares OpenRouter chat completions.
 * Because it operates outside System One requirements, this route skips dispatch.
 * Liquid d1-omni-600M uses LFM Open License 1.0 with approximately 587M parameters.
 * It remains unloaded because system RAM remained below the 4 GiB reserve threshold.
 */

export const DECISION_CONTRACT = "starlight.decision-route.v1" as const;
export const CLEF_FLASH_MODEL = "@cf/cloudflare/clef-flash" as const;
export const CLEF_FLASH_USD_PER_MILLION_INPUT = 0.038;
export const CLEF_FLASH_CONTEXT_TOKENS = 24_576;
export const RAM_RESERVE_BYTES = 4 * 1024 * 1024 * 1024;

const MAX_SUMMARY_BYTES = 8_192;
const QUESTION_TOKEN_OVERHEAD = 200;
const MIN_CHOICE_PROBABILITY = 0.55;
const OWNERS = ["storage-programme", "sis", "agentic-ops", "frank", "unknown"] as const;
const EFFECTS = ["observe", "hold", "human"] as const;

export type DecisionOwner = (typeof OWNERS)[number];
export type DecisionEffect = (typeof EFFECTS)[number];
export type DecisionProvider = "baseline" | "clef-flash" | "jev" | "liquid-local";

export interface DecisionAdmission {
  now: string;
  ramFreeBytes: number;
  budgetRemainingUsd: number;
  maxCallUsd: number;
  /** Host decision. Packet text cannot set this. */
  cloudPermitted: boolean;
  providerAvailable: boolean;
  allowNetwork: boolean;
  evidenceMaxAgeMs: number;
  timeoutMs?: number;
}

export interface DecisionResult {
  contract: typeof DECISION_CONTRACT;
  packetId: string;
  evidenceId: string;
  status: "decided" | "abstain" | "failed";
  owner: DecisionOwner;
  effect: DecisionEffect;
  authority: "recommendation-only";
  approvals: { deletion: false; merge: false; credentials: false; spend: false };
  provider: { id: DecisionProvider; model: string; version: string };
  usage: { inputTokens: number; outputTokens: number; latencyMs: number; estimatedUsd: number };
  reason: string;
}

export interface PreparedClefRequest {
  url: string;
  headers: { "Content-Type": "application/json"; "cf-aig-gateway-id"?: string };
  body: {
    model: typeof CLEF_FLASH_MODEL;
    input: {
      model: "clef-flash";
      state: string;
      questions: Record<string, { type: "choice"; instructions: string; criteria: Record<string, string> }>;
    };
  };
}

export interface RouteInput {
  packet: unknown;
  admission: DecisionAdmission;
  provider: DecisionProvider;
  /** Ignored. A failed cloud call must not switch provider. */
  fallbackProvider?: DecisionProvider;
  fetchImpl?: typeof fetch;
  token?: string;
  accountId?: string;
  gatewayId?: string;
  signal?: AbortSignal;
  monotonicMs?: () => number;
}

const APPROVALS = { deletion: false, merge: false, credentials: false, spend: false } as const;
const QUESTIONS = {
  owner: {
    type: "choice" as const,
    instructions: "Which existing owner should review this public operations packet? Abstain with unknown when the packet does not name a lane.",
    criteria: {
      "storage-programme": "Disk, cache, archive, or free-space evidence",
      sis: "Memory, vault, or shared MCP evidence",
      "agentic-ops": "Ledger, guard, or fleet-bus evidence",
      frank: "A human gate for reboot, merge, credentials, or spend",
      unknown: "The owner is not clear",
    },
  },
  effect: {
    type: "choice" as const,
    instructions: "Choose observe, hold, or human. Never approve deletion, a merge, a credential change, or spend.",
    criteria: {
      observe: "Keep reading. No change is recommended.",
      hold: "Leave the data in place until a named gate is met.",
      human: "A person must decide. This is not approval.",
    },
  },
};

function approvals(): DecisionResult["approvals"] {
  return { ...APPROVALS };
}

function providerVersion(provider: DecisionProvider): { model: string; version: string } {
  if (provider === "clef-flash") return { model: CLEF_FLASH_MODEL, version: "workers-ai-2026-11-03" };
  if (provider === "jev") return { model: "typesafe/jev-router", version: "not-dispatched" };
  if (provider === "liquid-local") return { model: "LiquidAI/d1-omni-600M", version: "not-admitted" };
  return { model: "deterministic-rules", version: "2026-11-03" };
}

function failed(
  packetId: string,
  evidenceId: string,
  provider: DecisionProvider,
  reason: string,
  started: number,
  nowMs: number,
  status: DecisionResult["status"] = "failed",
  owner: DecisionOwner = "unknown",
  effect: DecisionEffect = "hold",
): DecisionResult {
  return {
    contract: DECISION_CONTRACT,
    packetId, evidenceId, status, owner, effect,
    authority: "recommendation-only",
    approvals: approvals(),
    provider: { id: provider, ...providerVersion(provider) },
    usage: { inputTokens: 0, outputTokens: 0, latencyMs: Math.max(0, nowMs - started), estimatedUsd: 0 },
    reason,
  };
}

function parseAdmission(value: DecisionAdmission): string | null {
  if (!record(value)) return "invalid-admission";
  const now = Date.parse(value.now);
  if (!Number.isFinite(now)) return "invalid-admission";
  if (!Number.isFinite(value.ramFreeBytes) || value.ramFreeBytes < 0) return "invalid-admission";
  if (!Number.isFinite(value.budgetRemainingUsd) || value.budgetRemainingUsd < 0) return "invalid-admission";
  if (!Number.isFinite(value.maxCallUsd) || value.maxCallUsd < 0) return "invalid-admission";
  if (typeof value.cloudPermitted !== "boolean" || typeof value.providerAvailable !== "boolean"
    || typeof value.allowNetwork !== "boolean") return "invalid-admission";
  if (!Number.isFinite(value.evidenceMaxAgeMs) || value.evidenceMaxAgeMs < 0
    || value.evidenceMaxAgeMs > 7 * 24 * 60 * 60 * 1000) return "invalid-admission";
  if (value.timeoutMs !== undefined && (!Number.isInteger(value.timeoutMs) || value.timeoutMs < 1
    || value.timeoutMs > 30_000)) return "invalid-admission";
  return null;
}

interface ParsedPacket {
  packetId: string;
  evidenceId: string;
  classification: "public" | "internal" | "restricted" | "unknown";
  capturedAt: number;
  summary: string;
}

function parsePacket(value: unknown): ParsedPacket | null {
  if (!record(value)) return null;
  const keys = ["contract", "packetId", "evidenceId", "classification", "capturedAt", "summary", "signals"];
  if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) return null;
  if (value.contract !== DECISION_CONTRACT || !identifier(value.packetId) || !identifier(value.evidenceId)) return null;
  if (value.classification !== "public" && value.classification !== "internal"
    && value.classification !== "restricted" && value.classification !== "unknown") return null;
  if (typeof value.capturedAt !== "string" || !Number.isFinite(Date.parse(value.capturedAt))) return null;
  if (typeof value.summary !== "string" || !value.summary.trim()
    || Buffer.byteLength(value.summary, "utf8") > MAX_SUMMARY_BYTES) return null;
  if (!record(value.signals)) return null;
  for (const key of Object.keys(value.signals)) {
    if (key !== "repo" && key !== "issue") return null;
    const item = value.signals[key];
    if (item !== undefined && !identifier(item)) return null;
  }
  return {
    packetId: value.packetId,
    evidenceId: value.evidenceId,
    classification: value.classification,
    capturedAt: Date.parse(value.capturedAt),
    summary: value.summary,
  };
}

function estimateClef(summary: string): { tokens: number; usd: number } {
  const tokens = Math.ceil(Buffer.byteLength(summary, "utf8") / 4) + QUESTION_TOKEN_OVERHEAD;
  return { tokens, usd: tokens / 1_000_000 * CLEF_FLASH_USD_PER_MILLION_INPUT };
}

/** Same questions Clef-flash scores. This does not send them. */
export function decisionQuestions(): typeof QUESTIONS {
  return QUESTIONS;
}

export function prepareClefFlashRequest(summary: string, accountId: string, gatewayId?: string): PreparedClefRequest {
  if (!/^[a-f0-9]{32}$/.test(accountId)) throw new Error("Cloudflare account id must be 32 lowercase hex characters");
  if (gatewayId !== undefined && !/^[a-z0-9][a-z0-9-]{0,63}$/.test(gatewayId)) throw new Error("Invalid AI Gateway id");
  if (typeof summary !== "string" || !summary.trim() || Buffer.byteLength(summary, "utf8") > MAX_SUMMARY_BYTES) {
    throw new Error("Clef state must be a short public summary");
  }
  const headers: PreparedClefRequest["headers"] = { "Content-Type": "application/json" };
  if (gatewayId) headers["cf-aig-gateway-id"] = gatewayId;
  const body: PreparedClefRequest["body"] = {
    model: CLEF_FLASH_MODEL,
    input: { model: "clef-flash", state: summary, questions: decisionQuestions() },
  };
  boundedJson(body);
  return {
    url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`,
    headers,
    body,
  };
}

function baseline(summary: string): { status: DecisionResult["status"]; owner: DecisionOwner; effect: DecisionEffect; reason: string } {
  const text = summary.toLowerCase();
  if (/\b(reboot|merge|credential|spend)\b/.test(text) || (/\bdelete\b/.test(text) && !/\bno deletion\b/.test(text))) {
    return { status: "decided", owner: "frank", effect: "human", reason: "human-gate" };
  }
  if (/\b(disk|gib|pnpm|restic|pagefile|free space|storage)\b/.test(text)) {
    return { status: "decided", owner: "storage-programme", effect: "hold", reason: "storage-evidence" };
  }
  if (/\b(sis|vault|memory bridge|mcp)\b/.test(text)) {
    return { status: "decided", owner: "sis", effect: "observe", reason: "memory-evidence" };
  }
  if (/\b(ledger|guard|heartbeat|agentic-ops)\b/.test(text)) {
    return { status: "decided", owner: "agentic-ops", effect: "observe", reason: "operations-evidence" };
  }
  return { status: "abstain", owner: "unknown", effect: "hold", reason: "no-matching-owner" };
}

function readChoice(answer: unknown, allowed: readonly string[]): { choice: string; probability: number } | "malformed" {
  if (!record(answer) || typeof answer.choice !== "string" || !allowed.includes(answer.choice)) return "malformed";
  if (!record(answer.probabilities)) return "malformed";
  const raw = answer.probabilities[answer.choice];
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 1) return "malformed";
  return { choice: answer.choice, probability: raw };
}

export function inspectClefFlashResponse(value: unknown): {
  status: "decided" | "abstain" | "failed";
  owner: DecisionOwner;
  effect: DecisionEffect;
  reason: string;
  inputTokens: number;
  outputTokens: number;
} {
  let body = value;
  if (record(body) && body.success === true && record(body.result)) body = body.result;
  if (!record(body) || record(body.approvals) || !record(body.answers)) {
    return { status: "failed", owner: "unknown", effect: "hold", reason: "malformed-output", inputTokens: 0, outputTokens: 0 };
  }
  const owner = readChoice(body.answers.owner, OWNERS);
  const effect = readChoice(body.answers.effect, EFFECTS);
  if (owner === "malformed" || effect === "malformed") {
    return { status: "failed", owner: "unknown", effect: "hold", reason: "malformed-output", inputTokens: 0, outputTokens: 0 };
  }
  let inputTokens = 0;
  let outputTokens = 0;
  if (record(body.usage)) {
    if (typeof body.usage.prompt_tokens === "number" && Number.isInteger(body.usage.prompt_tokens) && body.usage.prompt_tokens >= 0) {
      inputTokens = body.usage.prompt_tokens;
    }
    if (typeof body.usage.completion_tokens === "number" && Number.isInteger(body.usage.completion_tokens) && body.usage.completion_tokens >= 0) {
      outputTokens = body.usage.completion_tokens;
    }
  }
  if (owner.choice === "unknown" || owner.probability < MIN_CHOICE_PROBABILITY || effect.probability < MIN_CHOICE_PROBABILITY) {
    return { status: "abstain", owner: "unknown", effect: "hold", reason: "low-confidence", inputTokens, outputTokens };
  }
  return {
    status: "decided",
    owner: owner.choice as DecisionOwner,
    effect: effect.choice as DecisionEffect,
    reason: "clef-choice",
    inputTokens, outputTokens,
  };
}

async function dispatchClef(input: RouteInput, summary: string, started: number, now: () => number): Promise<DecisionResult> {
  const provider: DecisionProvider = "clef-flash";
  if (!input.accountId || !input.fetchImpl) return failed("invalid", "invalid", provider, "provider-unavailable", started, now());
  let prepared: PreparedClefRequest;
  try {
    prepared = prepareClefFlashRequest(summary, input.accountId, input.gatewayId);
  } catch {
    return failed("invalid", "invalid", provider, "invalid-provider-request", started, now());
  }
  if (!input.token) return failed("invalid", "invalid", provider, "credentials-absent", started, now());
  const controller = new AbortController();
  let timedOut = false;
  const timeoutMs = input.admission.timeoutMs ?? 5_000;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const parentAbort = () => controller.abort();
  input.signal?.addEventListener("abort", parentAbort);
  try {
    const response = await input.fetchImpl(prepared.url, {
      method: "POST",
      headers: { ...prepared.headers, Authorization: `Bearer ${input.token}` },
      body: JSON.stringify(prepared.body),
      signal: controller.signal,
    });
    if (!response.ok) return failed("invalid", "invalid", provider, input.fallbackProvider ? "fallback-refused" : "provider-error", started, now());
    const parsed: unknown = await response.json();
    const inspected = inspectClefFlashResponse(parsed);
    const estimate = estimateClef(summary);
    return {
      contract: DECISION_CONTRACT,
      packetId: "invalid",
      evidenceId: "invalid",
      status: inspected.status,
      owner: inspected.owner,
      effect: inspected.effect,
      authority: "recommendation-only",
      approvals: approvals(),
      provider: { id: provider, ...providerVersion(provider) },
      usage: {
        inputTokens: inspected.inputTokens || estimate.tokens,
        outputTokens: inspected.outputTokens,
        latencyMs: Math.max(0, now() - started),
        estimatedUsd: estimate.usd,
      },
      reason: inspected.reason,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    const reason = aborted && timedOut ? "timeout" : aborted ? "aborted" : "provider-error";
    return failed("invalid", "invalid", provider, input.fallbackProvider ? "fallback-refused" : reason, started, now());
  } finally {
    clearTimeout(timer);
    input.signal?.removeEventListener("abort", parentAbort);
  }
}

export async function routeDecision(input: RouteInput): Promise<DecisionResult> {
  const now = input.monotonicMs ?? Date.now;
  const started = now();
  const provider = input.provider;
  const admissionError = parseAdmission(input.admission);
  const packet = parsePacket(input.packet);
  if (admissionError || !packet) {
    return failed(packet?.packetId ?? "invalid", packet?.evidenceId ?? "invalid", provider, admissionError ?? "invalid-packet", started, now());
  }
  const nowMs = Date.parse(input.admission.now);
  if (packet.capturedAt > nowMs + 5_000 || nowMs - packet.capturedAt > input.admission.evidenceMaxAgeMs) {
    return failed(packet.packetId, packet.evidenceId, provider, "stale-evidence", started, now());
  }
  if (provider === "liquid-local") return failed(packet.packetId, packet.evidenceId, provider, "local-runtime-not-admitted", started, now());
  if (provider === "jev") return failed(packet.packetId, packet.evidenceId, provider, "provider-not-dispatched", started, now());
  if (provider === "baseline") {
    const route = baseline(packet.summary);
    return {
      ...failed(packet.packetId, packet.evidenceId, provider, route.reason, started, now(), route.status, route.owner, route.effect),
      reason: route.reason,
    };
  }
  if (packet.classification !== "public" || !input.admission.cloudPermitted) {
    return failed(packet.packetId, packet.evidenceId, provider, "privacy-denied", started, now());
  }
  if (input.admission.ramFreeBytes < RAM_RESERVE_BYTES) {
    return failed(packet.packetId, packet.evidenceId, provider, "capacity-held", started, now());
  }
  const estimate = estimateClef(packet.summary);
  if (estimate.tokens > CLEF_FLASH_CONTEXT_TOKENS || estimate.usd > input.admission.maxCallUsd
    || estimate.usd > input.admission.budgetRemainingUsd) {
    return failed(packet.packetId, packet.evidenceId, provider, "budget-denied", started, now());
  }
  if (!input.admission.providerAvailable) return failed(packet.packetId, packet.evidenceId, provider, "provider-unavailable", started, now());
  if (!input.admission.allowNetwork) return failed(packet.packetId, packet.evidenceId, provider, "network-not-admitted", started, now());
  const dispatched = await dispatchClef(input, packet.summary, started, now);
  return { ...dispatched, packetId: packet.packetId, evidenceId: packet.evidenceId };
}

/** Read-only shadow route. Uses the deterministic baseline and does not call a provider. */
export function routeShadowOperations(packet: unknown, admission: DecisionAdmission, monotonicMs = Date.now): Promise<DecisionResult> {
  return routeDecision({ packet, admission, provider: "baseline", monotonicMs });
}

export const SHADOW_STORAGE_PACKET = {
  contract: DECISION_CONTRACT,
  packetId: "pkt-c940-storage-20261103",
  evidenceId: "disk-free-121.68gib",
  classification: "public" as const,
  capturedAt: "2026-11-03T02:25:00.000Z",
  summary: "C: free space remains below the 150 GiB target. The pnpm stores and the local restic archive are still present. No deletion is requested.",
  signals: { repo: "agentic-ops", issue: "365" },
};

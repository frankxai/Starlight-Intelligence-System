import { createHash } from "node:crypto";
import type { SIPAttestation } from "@starlight-intelligence/core";

/**
 * Canonical ElevenLabs voice catalog aligned across Starlight Intelligence,
 * GenCreator (frankxai/gencreator.ai), and FrankX Resources (frankxai/frankx.ai-vercel-website#1183).
 */
export interface ElevenLabsVoiceProfile {
  readonly id: string;
  readonly voiceId: string;
  readonly label: string;
  readonly persona: string;
  readonly defaultStability: number;
  readonly defaultSimilarityBoost: number;
  readonly defaultStyle: number;
  readonly useSpeakerBoost: boolean;
}

export const STARLIGHT_ELEVENLABS_VOICES: Readonly<Record<string, ElevenLabsVoiceProfile>> = Object.freeze({
  starlight_architect: {
    id: "starlight_architect",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    label: "Starlight Architect (Adam)",
    persona: "Executive system briefings, technical deep dives, and architecture narratives",
    defaultStability: 0.55,
    defaultSimilarityBoost: 0.78,
    defaultStyle: 0.15,
    useSpeakerBoost: true,
  },
  luminor_oracle: {
    id: "luminor_oracle",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    label: "Luminor Oracle (Sarah)",
    persona: "Warm editorial essays, research syntheses, and guided creator workflows",
    defaultStability: 0.62,
    defaultSimilarityBoost: 0.80,
    defaultStyle: 0.10,
    useSpeakerBoost: true,
  },
  gencreator_pulse: {
    id: "gencreator_pulse",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    label: "GenCreator Pulse (George)",
    persona: "High-clarity studio intros, release announcements, and audio trailers",
    defaultStability: 0.50,
    defaultSimilarityBoost: 0.75,
    defaultStyle: 0.20,
    useSpeakerBoost: true,
  },
  arcanea_chronicler: {
    id: "arcanea_chronicler",
    voiceId: "Xb7hH8MSUJpSbSDYk0k2",
    label: "Arcanea Chronicler (Alice)",
    persona: "Worldbuilding lore, narrative chapters, and meditative soundscapes",
    defaultStability: 0.68,
    defaultSimilarityBoost: 0.82,
    defaultStyle: 0.12,
    useSpeakerBoost: true,
  },
});

export type ElevenLabsModelId =
  | "eleven_multilingual_v2"
  | "eleven_turbo_v2_5"
  | "eleven_flash_v2_5"
  | "eleven_monolingual_v1";

export type ElevenLabsOutputFormat =
  | "mp3_44100_128"
  | "mp3_44100_192"
  | "pcm_24000"
  | "pcm_44100";

export interface ElevenLabsModelPricing {
  readonly modelId: ElevenLabsModelId;
  readonly label: string;
  readonly maxCharacters: number;
  /** USD cost per 1,000 characters in integer micro-dollars (1 USD = 1,000,000 micro-USD) for deterministic math. */
  readonly microUsdPerThousandChars: number;
  /** Approximate characters per second of synthesized speech for preview duration estimation. */
  readonly charsPerSecond: number;
}

export const ELEVENLABS_MODELS: Readonly<Record<ElevenLabsModelId, ElevenLabsModelPricing>> = Object.freeze({
  eleven_multilingual_v2: {
    modelId: "eleven_multilingual_v2",
    label: "Eleven Multilingual v2 (Flagship Studio Quality)",
    maxCharacters: 5000,
    microUsdPerThousandChars: 300_000, // $0.30 / 1K chars
    charsPerSecond: 14.5,
  },
  eleven_turbo_v2_5: {
    modelId: "eleven_turbo_v2_5",
    label: "Eleven Turbo v2.5 (Low-Latency Interactive)",
    maxCharacters: 5000,
    microUsdPerThousandChars: 150_000, // $0.15 / 1K chars
    charsPerSecond: 15.0,
  },
  eleven_flash_v2_5: {
    modelId: "eleven_flash_v2_5",
    label: "Eleven Flash v2.5 (Ultra-Fast Real-Time)",
    maxCharacters: 5000,
    microUsdPerThousandChars: 100_000, // $0.10 / 1K chars
    charsPerSecond: 15.5,
  },
  eleven_monolingual_v1: {
    modelId: "eleven_monolingual_v1",
    label: "Eleven English v1 (Legacy Studio)",
    maxCharacters: 5000,
    microUsdPerThousandChars: 300_000, // $0.30 / 1K chars
    charsPerSecond: 14.5,
  },
});

export interface ElevenLabsVoiceSettings {
  readonly stability: number;
  readonly similarityBoost: number;
  readonly style?: number;
  readonly useSpeakerBoost?: boolean;
  readonly speed?: number;
}

/**
 * Exact Starlight core ApprovalGate schema shape (`packages/core/schemas/approval-gate.schema.json`).
 */
export interface CoreApprovalGateRecord {
  readonly id: string;
  readonly workPacketId: string;
  readonly requestedAt: string;
  readonly status: "pending" | "approved" | "rejected" | "expired";
  readonly riskLevel: "low" | "medium" | "high" | "critical";
  readonly decidedBy?: string;
  readonly decidedAt?: string;
  readonly rationale?: string;
}

/**
 * Exact Starlight core Artifact schema shape (`packages/core/schemas/artifact.schema.json`).
 */
export interface CoreArtifactRecord {
  readonly id: string;
  readonly kind: string;
  readonly uri: string;
  readonly sha256: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly attestation: "sip-attested" | "unattested";
}

/**
 * Exact Starlight core CostRecord schema shape (`packages/core/schemas/cost-record.schema.json`).
 */
export interface CoreCostRecord {
  readonly id: string;
  readonly agentRunId?: string;
  readonly workPacketId?: string;
  readonly kind: "tokens" | "time" | "api-call" | "storage";
  readonly amount: number;
  readonly currencyOrUnit: string;
  readonly timestamp: string;
}

/**
 * Schema-valid Starlight approval gate aligned with `packages/core/schemas/approval-gate.schema.json`,
 * extended with cryptographic text digest and voice consent bindings.
 */
export interface VoiceConsentApprovalGate {
  readonly id: string;
  readonly runId: string;
  readonly workPacketId?: string;
  readonly riskLevel?: "low" | "medium" | "high" | "critical";
  readonly action: string;
  readonly status: "pending" | "approved" | "rejected" | "expired";
  readonly requestedAt: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly reason?: string;
  /** Optional ISO-8601 expiration timestamp for the approval window. */
  readonly expiresAt?: string;
  /** SHA-256 hex digest of the exact normalized text approved by the user. */
  readonly approvedTextSha256: string;
  /** Explicit confirmation that the user has rights/consent to synthesize with the target voice. */
  readonly voiceRightsConfirmed: boolean;
  /** Optional target voiceId or preset bound at approval time. */
  readonly approvedVoiceId?: string;
}

/**
 * Schema-valid Starlight cost record aligned with `packages/core/schemas/cost-record.schema.json`.
 */
export interface StarlightCostRecord {
  readonly id: string;
  readonly agentRunId: string;
  readonly workPacketId: string;
  readonly kind: "api-call";
  readonly amount: number;
  readonly currencyOrUnit: "USD";
  readonly timestamp: string;
  readonly runId: string;
  readonly stepId: string;
  readonly provider: "elevenlabs";
  readonly model: ElevenLabsModelId;
  /** Character count mapped to inputTokens for telemetry. */
  readonly inputTokens: number;
  /** Audio output duration in milliseconds mapped to outputTokens. */
  readonly outputTokens: number;
  readonly cachedInputTokens?: number;
  readonly costUsd: number;
  readonly recordedAt: string;
}

/**
 * Schema-valid Starlight audio artifact aligned with `packages/core/schemas/artifact.schema.json`.
 */
export interface StarlightAudioArtifact {
  readonly id: string;
  readonly kind: "audio";
  readonly uri: string;
  readonly mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm";
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly createdByRunId: string;
  readonly attestation: "sip-attested";
  readonly sourceIds?: readonly string[];
}

/**
 * Playable audio preview payload usable across web surfaces, GenCreator studio,
 * FrankX Resources, and agent UIs.
 */
export interface PlayableAudioPreview {
  readonly artifactId: string;
  readonly playbackUrl: string;
  readonly mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm";
  readonly format: ElevenLabsOutputFormat;
  readonly sizeBytes: number;
  readonly estimatedDurationSeconds: number;
  readonly sampleRateHz: number;
  readonly channels: 1;
  readonly subresourceIntegrity: `sha256-${string}`;
  readonly transcriptExcerpt: string;
  readonly voiceLabel: string;
  readonly modelId: ElevenLabsModelId;
  /** Self-contained accessible HTML5 audio player markup. */
  readonly htmlEmbed: string;
  /** Optional inline data URL when inline preview is requested and byte size is within threshold. */
  readonly inlineDataUrl?: string;
}

/**
 * Cryptographic provenance record binding consent, text digest, synthesis parameters,
 * storage artifact, cost record, and SIP audio attestation.
 */
export interface VoiceProvenanceRecord {
  readonly version: "starlight.elevenlabs.provenance.v1";
  readonly id: string;
  readonly runId: string;
  readonly idempotencyKey: string;
  readonly requestFingerprintSha256: string;
  readonly createdAt: string;
  readonly crossReferenceIssue: "frankxai/frankx.ai-vercel-website#1183";
  readonly input: {
    readonly rawTextSha256: string;
    readonly sanitizedTextSha256: string;
    readonly characterCount: number;
    readonly wasSanitized: boolean;
    readonly languageCode?: string;
  };
  readonly consent: {
    readonly approvalGateId: string;
    readonly decidedBy: string;
    readonly decidedAt: string;
    readonly approvedTextSha256: string;
    readonly voiceRightsConfirmed: true;
  };
  readonly synthesis: {
    readonly voiceId: string;
    readonly voicePresetId?: string;
    readonly modelId: ElevenLabsModelId;
    readonly outputFormat: ElevenLabsOutputFormat;
    readonly settings: ElevenLabsVoiceSettings;
    readonly providerRequestId: string | null;
    readonly providerHistoryItemId: string | null;
    readonly attempts: number;
    readonly latencyMs: number;
  };
  readonly artifact: StarlightAudioArtifact;
  readonly cost: StarlightCostRecord;
  readonly sipAttestation: SIPAttestation & {
    readonly modality: "audio";
    readonly tool: "elevenlabs";
    readonly toolVersion: ElevenLabsModelId;
    readonly promptHash: string;
    readonly payloadSha256: string;
    readonly durationSeconds: number;
    readonly sampleRateHz: number;
    readonly channels: 1;
    readonly sidecarKey: string;
  };
  /** Canonical SHA-256 over all fields above. */
  readonly provenanceSha256: string;
}

export interface SynthesizeSpeechInput {
  readonly idempotencyKey: string;
  readonly runId: string;
  readonly stepId?: string;
  readonly text: string;
  /** Either a preset ID from STARLIGHT_ELEVENLABS_VOICES or an explicit ElevenLabs voice_id. */
  readonly voice: string;
  readonly modelId?: ElevenLabsModelId;
  readonly outputFormat?: ElevenLabsOutputFormat;
  readonly languageCode?: string;
  readonly voiceSettings?: Partial<ElevenLabsVoiceSettings>;
  /**
   * Server-verifiable approval token issued by a trusted ApprovalAuthority.
   * Preferred over a caller-asserted `approvalGate` object: the pipeline resolves
   * and verifies the token server-side (signature, tenant, expiry, revocation).
   */
  readonly approvalGateToken?: string;
  /**
   * Caller-asserted approval gate. Only honored when the pipeline was explicitly
   * constructed with `allowCallerAssertedConsent: true` (development/testing only).
   * Production hosts must issue and pass `approvalGateToken` instead.
   */
  readonly approvalGate?: VoiceConsentApprovalGate;
  readonly sourceIds?: readonly string[];
  readonly includeInlinePreview?: boolean;
  /** Rejects synthesis if sanitization had to redact secrets/PII from the approved text (default: true). */
  readonly rejectOnSanitizationMutation?: boolean;
  /**
   * Operator resolution for a previous attempt whose paid outcome is unknown
   * (timeout after dispatch, crash mid-call). "redispatch" explicitly accepts
   * the risk of a second provider charge; without it the pipeline fails closed
   * with `idempotency_ambiguous`.
   */
  readonly ambiguousResolution?: "redispatch";
}

export interface SynthesizeSpeechResult {
  readonly status: "synthesized" | "replayed";
  readonly idempotencyKey: string;
  readonly requestFingerprintSha256: string;
  readonly artifact: StarlightAudioArtifact;
  readonly provenance: VoiceProvenanceRecord;
  readonly preview: PlayableAudioPreview;
  readonly cost: StarlightCostRecord;
  readonly approvalGate: VoiceConsentApprovalGate;
}

export type ElevenLabsErrorCode =
  | "consent_required"
  | "consent_not_approved"
  | "consent_expired"
  | "consent_text_mismatch"
  | "consent_voice_mismatch"
  | "consent_rights_unconfirmed"
  | "consent_untrusted"
  | "consent_token_invalid"
  | "consent_revoked"
  | "consent_tenant_mismatch"
  | "input_invalid"
  | "input_sanitization_blocked"
  | "voice_not_allowed"
  | "model_not_allowed"
  | "cost_limit_exceeded"
  | "budget_exhausted"
  | "idempotency_conflict"
  | "idempotency_in_progress"
  | "idempotency_ambiguous"
  | "credential_missing"
  | "credential_invalid"
  | "endpoint_insecure"
  | "provider_rate_limited"
  | "provider_unavailable"
  | "provider_rejected"
  | "response_too_large"
  | "storage_failed"
  | "provenance_integrity_failed";

export class ElevenLabsIntegrationError extends Error {
  readonly code: ElevenLabsErrorCode;
  readonly retryable: boolean;
  readonly statusCode: number | undefined;

  constructor(
    code: ElevenLabsErrorCode,
    message: string,
    options?: { retryable?: boolean; statusCode?: number; cause?: unknown }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ElevenLabsIntegrationError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.statusCode = options?.statusCode;
  }
}

const SAFE_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$/;
const VOICE_ID_PATTERN = /^[a-zA-Z0-9]{10,40}$/;

export function isSafeIdentifier(value: unknown): value is string {
  return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

export function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

export function normalizeSpeechText(text: string): string {
  return text.normalize("NFC").replace(/\r\n?/g, "\n").trim();
}

export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function sha256Base64(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("base64");
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(item => canonicalJson(item)).join(",") + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return (
    "{" +
    entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",") +
    "}"
  );
}

export function canonicalDigest(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}

export function resolveVoiceSelection(
  voice: string,
  allowedVoiceIds?: ReadonlySet<string>
): { voiceId: string; preset?: ElevenLabsVoiceProfile } {
  const preset = STARLIGHT_ELEVENLABS_VOICES[voice];
  const resolvedVoiceId = preset ? preset.voiceId : voice;

  if (!VOICE_ID_PATTERN.test(resolvedVoiceId)) {
    throw new ElevenLabsIntegrationError(
      "voice_not_allowed",
      `Voice identifier '${voice}' is not a valid preset or ElevenLabs voice ID.`
    );
  }

  if (allowedVoiceIds && allowedVoiceIds.size > 0 && !allowedVoiceIds.has(resolvedVoiceId) && !allowedVoiceIds.has(voice)) {
    throw new ElevenLabsIntegrationError(
      "voice_not_allowed",
      `Voice '${voice}' (${resolvedVoiceId}) is not in the configured voice allowlist.`
    );
  }

  return preset ? { voiceId: resolvedVoiceId, preset } : { voiceId: resolvedVoiceId };
}

export function resolveVoiceSettings(
  overrides?: Partial<ElevenLabsVoiceSettings>,
  preset?: ElevenLabsVoiceProfile
): ElevenLabsVoiceSettings {
  const stability = overrides?.stability ?? preset?.defaultStability ?? 0.55;
  const similarityBoost = overrides?.similarityBoost ?? preset?.defaultSimilarityBoost ?? 0.78;
  const style = overrides?.style ?? preset?.defaultStyle ?? 0.15;
  const useSpeakerBoost = overrides?.useSpeakerBoost ?? preset?.useSpeakerBoost ?? true;
  const speed = overrides?.speed ?? 1.0;

  for (const [name, val] of [
    ["stability", stability],
    ["similarityBoost", similarityBoost],
    ["style", style],
  ] as const) {
    if (typeof val !== "number" || !Number.isFinite(val) || val < 0 || val > 1) {
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        `Voice setting '${name}' must be a finite number between 0 and 1.`
      );
    }
  }

  if (typeof speed !== "number" || !Number.isFinite(speed) || speed < 0.7 || speed > 1.2) {
    throw new ElevenLabsIntegrationError(
      "input_invalid",
      "Voice setting 'speed' must be a finite number between 0.7 and 1.2."
    );
  }

  return {
    stability: Number(stability.toFixed(4)),
    similarityBoost: Number(similarityBoost.toFixed(4)),
    style: Number(style.toFixed(4)),
    useSpeakerBoost: Boolean(useSpeakerBoost),
    speed: Number(speed.toFixed(4)),
  };
}

export function formatMetadata(outputFormat: ElevenLabsOutputFormat): {
  mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm";
  extension: "mp3" | "pcm";
  sampleRateHz: number;
} {
  switch (outputFormat) {
    case "mp3_44100_128":
    case "mp3_44100_192":
      return { mimeType: "audio/mpeg", extension: "mp3", sampleRateHz: 44100 };
    case "pcm_24000":
      return { mimeType: "audio/pcm", extension: "pcm", sampleRateHz: 24000 };
    case "pcm_44100":
      return { mimeType: "audio/pcm", extension: "pcm", sampleRateHz: 44100 };
    default:
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        `Unsupported ElevenLabs output format '${String(outputFormat)}'.`
      );
  }
}

/**
 * Helper to create a user-approved consent gate for a specific speech script.
 */
export function createApprovedVoiceConsentGate(params: {
  id: string;
  runId: string;
  text: string;
  decidedBy: string;
  action?: string;
  reason?: string;
  approvedVoiceId?: string;
  requestedAt?: string;
  decidedAt?: string;
  expiresAt?: string;
}): VoiceConsentApprovalGate {
  const now = new Date().toISOString();
  const normalized = normalizeSpeechText(params.text);
  if (!normalized) {
    throw new ElevenLabsIntegrationError("input_invalid", "Cannot approve empty speech text.");
  }
  if (!isSafeIdentifier(params.id) || !isSafeIdentifier(params.runId)) {
    throw new ElevenLabsIntegrationError("input_invalid", "Approval gate id and runId must be valid identifiers.");
  }
  if (typeof params.decidedBy !== "string" || !params.decidedBy.trim()) {
    throw new ElevenLabsIntegrationError("consent_required", "Approval gate requires a non-empty decidedBy principal.");
  }

  return {
    id: params.id,
    runId: params.runId,
    action: params.action ?? "elevenlabs.tts.synthesize",
    status: "approved",
    requestedAt: params.requestedAt ?? now,
    decidedAt: params.decidedAt ?? now,
    decidedBy: params.decidedBy.trim(),
    ...(params.reason !== undefined ? { reason: params.reason } : {}),
    ...(params.expiresAt !== undefined ? { expiresAt: params.expiresAt } : {}),
    approvedTextSha256: sha256Hex(normalized),
    voiceRightsConfirmed: true,
    ...(params.approvedVoiceId !== undefined ? { approvedVoiceId: params.approvedVoiceId } : {}),
  };
}

/**
 * Validates that the consent gate is approved, non-expired, bound to the exact runId,
 * bound to the exact normalized text SHA-256, and confirms voice rights.
 */
export function toCoreApprovalGateRecord(gate: VoiceConsentApprovalGate): CoreApprovalGateRecord {
  return {
    id: gate.id,
    workPacketId: gate.workPacketId ?? gate.runId,
    requestedAt: gate.requestedAt,
    status: gate.status,
    riskLevel: gate.riskLevel ?? "medium",
    ...(gate.decidedBy !== undefined ? { decidedBy: gate.decidedBy } : {}),
    ...(gate.decidedAt !== undefined ? { decidedAt: gate.decidedAt } : {}),
    ...(gate.reason !== undefined ? { rationale: gate.reason } : {}),
  };
}

export function toCoreArtifactRecord(artifact: StarlightAudioArtifact): CoreArtifactRecord {
  return {
    id: artifact.id,
    kind: artifact.kind,
    uri: artifact.uri,
    sha256: artifact.sha256,
    createdBy: artifact.createdBy,
    createdAt: artifact.createdAt,
    attestation: artifact.attestation,
  };
}

export function toCoreCostRecord(cost: StarlightCostRecord): CoreCostRecord {
  return {
    id: cost.id,
    agentRunId: cost.agentRunId,
    workPacketId: cost.workPacketId,
    kind: cost.kind,
    amount: cost.amount,
    currencyOrUnit: cost.currencyOrUnit,
    timestamp: cost.timestamp,
  };
}

export function verifyVoiceConsentGate(
  gate: VoiceConsentApprovalGate,
  context: {
    runId: string;
    normalizedText: string;
    voiceId: string;
    voicePresetId?: string;
    nowMs?: number;
  }
): void {
  if (!gate || typeof gate !== "object") {
    throw new ElevenLabsIntegrationError("consent_required", "Explicit voice consent approval gate is required.");
  }
  if (!isSafeIdentifier(gate.id) || !isSafeIdentifier(gate.runId)) {
    throw new ElevenLabsIntegrationError("consent_required", "Approval gate id and runId must be valid identifiers.");
  }
  if (gate.runId !== context.runId) {
    throw new ElevenLabsIntegrationError(
      "consent_not_approved",
      `Approval gate runId '${gate.runId}' does not match active runId '${context.runId}'.`
    );
  }
  if (gate.status !== "approved") {
    throw new ElevenLabsIntegrationError(
      "consent_not_approved",
      `Approval gate '${gate.id}' has status '${gate.status}'; synthesis requires 'approved'.`
    );
  }
  if (!gate.voiceRightsConfirmed) {
    throw new ElevenLabsIntegrationError(
      "consent_rights_unconfirmed",
      `Approval gate '${gate.id}' has not confirmed voice synthesis rights.`
    );
  }
  if (typeof gate.decidedBy !== "string" || !gate.decidedBy.trim()) {
    throw new ElevenLabsIntegrationError(
      "consent_not_approved",
      `Approval gate '${gate.id}' is missing the approving principal (decidedBy).`
    );
  }
  if (!isIsoTimestamp(gate.requestedAt) || !isIsoTimestamp(gate.decidedAt)) {
    throw new ElevenLabsIntegrationError(
      "consent_not_approved",
      `Approval gate '${gate.id}' requires valid ISO-8601 requestedAt and decidedAt timestamps.`
    );
  }
  const nowMs = context.nowMs ?? Date.now();
  if (gate.expiresAt !== undefined) {
    if (!isIsoTimestamp(gate.expiresAt)) {
      throw new ElevenLabsIntegrationError("consent_expired", "Approval gate expiresAt is not a valid ISO-8601 timestamp.");
    }
    if (Date.parse(gate.expiresAt) <= nowMs) {
      throw new ElevenLabsIntegrationError(
        "consent_expired",
        `Approval gate '${gate.id}' expired at ${gate.expiresAt}.`
      );
    }
  }
  const actualSha256 = sha256Hex(context.normalizedText);
  if (gate.approvedTextSha256 !== actualSha256) {
    throw new ElevenLabsIntegrationError(
      "consent_text_mismatch",
      "Input text SHA-256 does not match the digest approved in the consent gate."
    );
  }
  if (
    gate.approvedVoiceId !== undefined &&
    gate.approvedVoiceId !== context.voiceId &&
    gate.approvedVoiceId !== context.voicePresetId
  ) {
    throw new ElevenLabsIntegrationError(
      "consent_voice_mismatch",
      `Approval gate is bound to voice '${gate.approvedVoiceId}', but synthesis requested '${context.voiceId}'.`
    );
  }
}

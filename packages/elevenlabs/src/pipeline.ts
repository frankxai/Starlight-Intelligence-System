import { SanitizationGateway } from "@starlight-intelligence/core";
import {
  ELEVENLABS_MODELS,
  ElevenLabsIntegrationError,
  canonicalDigest,
  formatMetadata,
  isSafeIdentifier,
  normalizeSpeechText,
  resolveVoiceSelection,
  resolveVoiceSettings,
  sha256Hex,
  verifyVoiceConsentGate,
  type ElevenLabsModelId,
  type ElevenLabsOutputFormat,
  type StarlightAudioArtifact,
  type SynthesizeSpeechInput,
  type SynthesizeSpeechResult,
} from "./contracts.js";
import { ElevenLabsSpeechClient, type ElevenLabsClientOptions } from "./client.js";
import { ElevenLabsCostLedger, type ElevenLabsCostPolicy } from "./cost.js";
import { InMemoryIdempotencyStore, type ElevenLabsIdempotencyStore } from "./idempotency.js";
import { buildPlayableAudioPreview, buildVoiceProvenanceRecord } from "./provenance.js";
import { InMemoryAudioStorageAdapter, type DurableAudioStorageAdapter } from "./storage.js";

export interface StarlightElevenLabsPipelineOptions {
  readonly client?: ElevenLabsSpeechClient | ElevenLabsClientOptions;
  readonly storage?: DurableAudioStorageAdapter;
  readonly costLedger?: ElevenLabsCostLedger | ElevenLabsCostPolicy;
  readonly idempotencyStore?: ElevenLabsIdempotencyStore;
  readonly sanitizer?: SanitizationGateway;
  readonly allowedVoiceIds?: readonly string[];
  readonly allowedModelIds?: readonly ElevenLabsModelId[];
  readonly storageKeyPrefix?: string;
}

/**
 * End-to-end, consent-gated ElevenLabs synthesis workflow for Starlight Intelligence:
 *   user-approved text -> ElevenLabs API speech synthesis -> durable asset storage
 *   -> provenance record -> playable preview
 */
export class StarlightElevenLabsPipeline {
  readonly client: ElevenLabsSpeechClient;
  readonly storage: DurableAudioStorageAdapter;
  readonly costLedger: ElevenLabsCostLedger;
  readonly idempotencyStore: ElevenLabsIdempotencyStore;
  readonly sanitizer: SanitizationGateway;
  private readonly allowedVoiceIds: ReadonlySet<string> | undefined;
  private readonly allowedModelIds: ReadonlySet<ElevenLabsModelId>;
  private readonly storageKeyPrefix: string;

  constructor(options?: StarlightElevenLabsPipelineOptions) {
    this.client =
      options?.client instanceof ElevenLabsSpeechClient
        ? options.client
        : new ElevenLabsSpeechClient(options?.client);
    this.storage = options?.storage ?? new InMemoryAudioStorageAdapter();
    this.costLedger =
      options?.costLedger instanceof ElevenLabsCostLedger
        ? options.costLedger
        : new ElevenLabsCostLedger(options?.costLedger);
    this.idempotencyStore = options?.idempotencyStore ?? new InMemoryIdempotencyStore();
    this.sanitizer = options?.sanitizer ?? new SanitizationGateway({ scrubSecrets: true, scrubPII: true });
    this.allowedVoiceIds = options?.allowedVoiceIds ? new Set(options.allowedVoiceIds) : undefined;
    this.allowedModelIds = new Set(
      options?.allowedModelIds ?? (Object.keys(ELEVENLABS_MODELS) as ElevenLabsModelId[])
    );
    this.storageKeyPrefix = (options?.storageKeyPrefix ?? "voice-assets").replace(/^\/+|\/+$/g, "");
  }

  async synthesizeSpeech(
    input: SynthesizeSpeechInput,
    signal?: AbortSignal
  ): Promise<SynthesizeSpeechResult> {
    if (!input || typeof input !== "object") {
      throw new ElevenLabsIntegrationError("input_invalid", "Synthesis input must be an object.");
    }
    if (!isSafeIdentifier(input.idempotencyKey)) {
      throw new ElevenLabsIntegrationError("input_invalid", "idempotencyKey must be a safe identifier.");
    }
    if (!isSafeIdentifier(input.runId)) {
      throw new ElevenLabsIntegrationError("input_invalid", "runId must be a safe identifier.");
    }
    const stepId = input.stepId ?? `tts-${input.idempotencyKey}`;
    if (!isSafeIdentifier(stepId)) {
      throw new ElevenLabsIntegrationError("input_invalid", "stepId must be a safe identifier.");
    }
    if (typeof input.text !== "string") {
      throw new ElevenLabsIntegrationError("input_invalid", "Speech text must be a string.");
    }

    const rawNormalizedText = normalizeSpeechText(input.text);
    if (!rawNormalizedText) {
      throw new ElevenLabsIntegrationError("input_invalid", "Speech text cannot be empty.");
    }

    const sanitizedText = normalizeSpeechText(this.sanitizer.sanitize(rawNormalizedText));
    const wasSanitized = sanitizedText !== rawNormalizedText;
    const rejectOnSanitizationMutation = input.rejectOnSanitizationMutation ?? true;
    if (wasSanitized && rejectOnSanitizationMutation) {
      throw new ElevenLabsIntegrationError(
        "input_sanitization_blocked",
        "Speech text contained secrets or PII redacted by SanitizationGateway; synthesis blocked prior to provider dispatch."
      );
    }

    const modelId: ElevenLabsModelId = input.modelId ?? "eleven_multilingual_v2";
    if (!ELEVENLABS_MODELS[modelId] || !this.allowedModelIds.has(modelId)) {
      throw new ElevenLabsIntegrationError(
        "model_not_allowed",
        `Model '${String(modelId)}' is not permitted by pipeline policy.`
      );
    }

    const outputFormat: ElevenLabsOutputFormat = input.outputFormat ?? "mp3_44100_128";
    const { mimeType, extension, sampleRateHz } = formatMetadata(outputFormat);
    const { voiceId, preset } = resolveVoiceSelection(input.voice, this.allowedVoiceIds);
    const settings = resolveVoiceSettings(input.voiceSettings, preset);

    // 1. Verify explicit human consent gate over the exact text to be synthesized
    verifyVoiceConsentGate(input.approvalGate, {
      runId: input.runId,
      normalizedText: sanitizedText,
      voiceId,
      ...(preset ? { voicePresetId: preset.id } : {}),
    });

    const rawTextSha256 = sha256Hex(rawNormalizedText);
    const sanitizedTextSha256 = sha256Hex(sanitizedText);

    // 2. Compute deterministic request fingerprint for idempotency
    const requestFingerprintSha256 = canonicalDigest({
      runId: input.runId,
      voiceId,
      modelId,
      outputFormat,
      languageCode: input.languageCode ?? null,
      settings,
      sanitizedTextSha256,
      approvalGateId: input.approvalGate.id,
      approvedTextSha256: input.approvalGate.approvedTextSha256,
    });

    const lock = await this.idempotencyStore.acquireOrInspect(
      input.idempotencyKey,
      requestFingerprintSha256
    );
    if (lock.status === "completed") {
      return lock.result;
    }

    // 3. Reserve cost budget before calling ElevenLabs
    let reservationId: string | undefined;
    try {
      const reservation = this.costLedger.admitAndReserve({
        reservationId: `res-${input.idempotencyKey}`,
        runId: input.runId,
        stepId,
        text: sanitizedText,
        modelId,
      });
      reservationId = reservation.reservationId;

      // 4. Execute ElevenLabs speech synthesis
      const httpResult = await this.client.synthesize({
        voiceId,
        modelId,
        outputFormat,
        text: sanitizedText,
        ...(input.languageCode ? { languageCode: input.languageCode } : {}),
        voiceSettings: settings,
        idempotencyKey: input.idempotencyKey,
        ...(signal ? { signal } : {}),
      });

      const nowIso = new Date().toISOString();
      const audioSha256 = sha256Hex(httpResult.audioBytes);
      const artifactId = `art-voice-${audioSha256.slice(0, 16)}`;
      const objectKey = `${this.storageKeyPrefix}/${input.runId}/${artifactId}.${extension}`;
      const sidecarKey = `${objectKey}.sip.json`;

      // 5. Commit cost reservation
      const costRecord = this.costLedger.commit(reservation.reservationId, nowIso);

      const provisionalArtifact: StarlightAudioArtifact = {
        id: artifactId,
        kind: "audio",
        uri: `r2://pending/${objectKey}`,
        mimeType,
        sha256: audioSha256,
        sizeBytes: httpResult.audioBytes.byteLength,
        createdAt: nowIso,
        createdBy: input.approvalGate.decidedBy ?? "starlight-elevenlabs",
        createdByRunId: input.runId,
        attestation: "sip-attested",
        ...(input.sourceIds && input.sourceIds.length > 0 ? { sourceIds: [...input.sourceIds] } : {}),
      };

      const initialProvenance = buildVoiceProvenanceRecord({
        id: `prov-voice-${audioSha256.slice(0, 16)}`,
        runId: input.runId,
        idempotencyKey: input.idempotencyKey,
        requestFingerprintSha256,
        createdAt: nowIso,
        rawTextSha256,
        sanitizedTextSha256,
        characterCount: reservation.estimate.characterCount,
        wasSanitized,
        ...(input.languageCode ? { languageCode: input.languageCode } : {}),
        approvalGate: input.approvalGate,
        voiceId,
        ...(preset ? { voicePresetId: preset.id } : {}),
        modelId,
        outputFormat,
        settings,
        providerRequestId: httpResult.providerRequestId,
        providerHistoryItemId: httpResult.providerHistoryItemId,
        attempts: httpResult.attempts,
        latencyMs: httpResult.latencyMs,
        artifact: provisionalArtifact,
        cost: costRecord,
        durationSeconds: reservation.estimate.estimatedDurationSeconds,
        sampleRateHz,
        sidecarKey,
      });

      // 6. Store durable audio asset and SIP provenance sidecar
      const storedAsset = await this.storage.putAudioAndSidecar(
        {
          objectKey,
          audioBytes: httpResult.audioBytes,
          mimeType,
          sha256: audioSha256,
        },
        sidecarKey,
        initialProvenance
      );

      const finalArtifact: StarlightAudioArtifact = {
        ...provisionalArtifact,
        uri: storedAsset.uri,
      };

      // 7. Finalize provenance record with durable storage URI
      const finalProvenance = buildVoiceProvenanceRecord({
        id: initialProvenance.id,
        runId: input.runId,
        idempotencyKey: input.idempotencyKey,
        requestFingerprintSha256,
        createdAt: nowIso,
        rawTextSha256,
        sanitizedTextSha256,
        characterCount: reservation.estimate.characterCount,
        wasSanitized,
        ...(input.languageCode ? { languageCode: input.languageCode } : {}),
        approvalGate: input.approvalGate,
        voiceId,
        ...(preset ? { voicePresetId: preset.id } : {}),
        modelId,
        outputFormat,
        settings,
        providerRequestId: httpResult.providerRequestId,
        providerHistoryItemId: httpResult.providerHistoryItemId,
        attempts: httpResult.attempts,
        latencyMs: httpResult.latencyMs,
        artifact: finalArtifact,
        cost: costRecord,
        durationSeconds: reservation.estimate.estimatedDurationSeconds,
        sampleRateHz,
        sidecarKey,
      });

      // 8. Build playable preview
      const preview = buildPlayableAudioPreview({
        artifact: finalArtifact,
        playbackUrl: storedAsset.playbackUrl,
        audioBytes: httpResult.audioBytes,
        format: outputFormat,
        estimatedDurationSeconds: reservation.estimate.estimatedDurationSeconds,
        sampleRateHz,
        sanitizedText,
        voiceLabel: preset?.label ?? `ElevenLabs Voice (${voiceId})`,
        modelId,
        ...(input.includeInlinePreview !== undefined
          ? { includeInlinePreview: input.includeInlinePreview }
          : {}),
      });

      const result: SynthesizeSpeechResult = {
        status: "synthesized",
        idempotencyKey: input.idempotencyKey,
        requestFingerprintSha256,
        artifact: finalArtifact,
        provenance: finalProvenance,
        preview,
        cost: costRecord,
        approvalGate: input.approvalGate,
      };

      await this.idempotencyStore.complete(
        input.idempotencyKey,
        requestFingerprintSha256,
        result
      );

      return result;
    } catch (error) {
      if (reservationId) {
        this.costLedger.release(reservationId);
      }
      await lock.releaseOnFailure();
      throw error;
    }
  }
}

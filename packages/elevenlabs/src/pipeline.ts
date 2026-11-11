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
  type VoiceConsentApprovalGate,
} from "./contracts.js";
import { ElevenLabsSpeechClient, type ElevenLabsClientOptions } from "./client.js";
import { ElevenLabsCostLedger, estimateSpeechCost, type ElevenLabsCostPolicy } from "./cost.js";
import type { CostLedgerStore } from "./cost.js";
import { InMemoryIdempotencyStore, type ElevenLabsIdempotencyStore } from "./idempotency.js";
import { buildPlayableAudioPreview, buildVoiceProvenanceRecord } from "./provenance.js";
import { InMemoryAudioStorageAdapter, type DurableAudioStorageAdapter } from "./storage.js";
import type { ApprovalAuthority } from "./consent.js";

export interface StarlightElevenLabsPipelineOptions {
  readonly client?: ElevenLabsSpeechClient | ElevenLabsClientOptions;
  readonly storage?: DurableAudioStorageAdapter;
  readonly costLedger?: ElevenLabsCostLedger | (ElevenLabsCostPolicy & { store?: CostLedgerStore });
  readonly idempotencyStore?: ElevenLabsIdempotencyStore;
  readonly sanitizer?: SanitizationGateway;
  readonly allowedVoiceIds?: readonly string[];
  readonly allowedModelIds?: readonly ElevenLabsModelId[];
  readonly storageKeyPrefix?: string;
  /**
   * Trusted server-side approval authority. When configured, callers must pass
   * `approvalGateToken`; caller-asserted gate objects are rejected unless the
   * pipeline was explicitly constructed with `allowCallerAssertedConsent`.
   */
  readonly approvalAuthority?: ApprovalAuthority;
  /** Tenant binding enforced when verifying approval tokens. */
  readonly expectedTenantId?: string;
  /** Purpose binding enforced when verifying approval tokens. */
  readonly expectedPurpose?: string;
  /**
   * Explicit development/testing opt-in that allows caller-asserted
   * `approvalGate` objects without a server-side authority. Defaults to false:
   * production hosts must not trust tool callers to attest their own consent.
   */
  readonly allowCallerAssertedConsent?: boolean;
}

/**
 * End-to-end, consent-gated ElevenLabs synthesis workflow for Starlight Intelligence:
 *   user-approved text -> ElevenLabs API speech synthesis -> durable asset storage
 *   -> provenance record -> playable preview
 *
 * Consent is resolved server-side: an ApprovalAuthority verifies a signed token
 * (signature, tenant, purpose, expiry, revocation) before any paid call.
 * Paid-effect ambiguity (timeout after dispatch, storage failure after synthesis)
 * is persisted in the idempotency journal and never silently re-charged.
 */
export class StarlightElevenLabsPipeline {
  readonly client: ElevenLabsSpeechClient;
  readonly storage: DurableAudioStorageAdapter;
  readonly costLedger: ElevenLabsCostLedger;
  readonly idempotencyStore: ElevenLabsIdempotencyStore;
  readonly sanitizer: SanitizationGateway;
  readonly approvalAuthority: ApprovalAuthority | undefined;
  private readonly expectedTenantId: string | undefined;
  private readonly expectedPurpose: string | undefined;
  private readonly allowCallerAssertedConsent: boolean;
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
    this.approvalAuthority = options?.approvalAuthority;
    this.expectedTenantId = options?.expectedTenantId;
    this.expectedPurpose = options?.expectedPurpose;
    this.allowCallerAssertedConsent = options?.allowCallerAssertedConsent ?? false;
    this.allowedVoiceIds = options?.allowedVoiceIds ? new Set(options.allowedVoiceIds) : undefined;
    this.allowedModelIds = new Set(
      options?.allowedModelIds ?? (Object.keys(ELEVENLABS_MODELS) as ElevenLabsModelId[])
    );
    this.storageKeyPrefix = (options?.storageKeyPrefix ?? "voice-assets").replace(/^\/+|\/+$/g, "");
  }

  /**
   * Resolves the trusted approval gate for this request (fail closed).
   * Priority: server-side token verification via the authority; a caller-asserted
   * gate object is only honored with the explicit development opt-in.
   */
  private async resolveApprovalGate(input: SynthesizeSpeechInput): Promise<VoiceConsentApprovalGate> {
    if (input.approvalGateToken) {
      if (!this.approvalAuthority) {
        throw new ElevenLabsIntegrationError(
          "consent_untrusted",
          "An approvalGateToken was supplied but this pipeline has no trusted approvalAuthority configured to verify it."
        );
      }
      return this.approvalAuthority.verify(input.approvalGateToken, {
        ...(this.expectedTenantId !== undefined ? { expectedTenantId: this.expectedTenantId } : {}),
        ...(this.expectedPurpose !== undefined ? { expectedPurpose: this.expectedPurpose } : {}),
      });
    }

    if (input.approvalGate) {
      if (!this.allowCallerAssertedConsent) {
        throw new ElevenLabsIntegrationError(
          "consent_untrusted",
          "Caller-asserted approval gates are not trusted in production. Configure an approvalAuthority and pass approvalGateToken, or explicitly set allowCallerAssertedConsent for local development."
        );
      }
      return input.approvalGate;
    }

    throw new ElevenLabsIntegrationError(
      "consent_required",
      "Synthesis requires consent: pass approvalGateToken (verified server-side) or an approvalGate when caller-asserted consent is explicitly enabled."
    );
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

    // 1. Resolve and verify human consent over the exact text to be synthesized (server-side)
    const approvalGate = await this.resolveApprovalGate(input);
    verifyVoiceConsentGate(approvalGate, {
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
      approvalGateId: approvalGate.id,
      approvedTextSha256: approvalGate.approvedTextSha256,
    });

    const lock = await this.idempotencyStore.acquireOrInspect(
      input.idempotencyKey,
      requestFingerprintSha256
    );
    if (lock.status === "completed") {
      return lock.result;
    }
    const releaseOnFailure =
      lock.status === "acquired" ? lock.releaseOnFailure : undefined;

    // 3. Ambiguous prior attempt: reconcile before any new paid request (fail closed)
    if (lock.status === "ambiguous") {
      if (lock.cachedAudio?.bytes) {
        // Provider already synthesized and charged; retry storage only.
        const recovered = await this.finalizeFromCachedAudio(
          input,
          lock.cachedAudio.bytes,
          lock.cachedAudio.mimeType,
          lock.cachedAudio.sha256,
          lock.dispatchDetail,
          sanitizedText,
          outputFormat,
          sampleRateHz,
          approvalGate,
          requestFingerprintSha256,
          rawTextSha256,
          sanitizedTextSha256,
          voiceId,
          preset,
          modelId,
          settings
        );
        return recovered;
      }
      if (input.ambiguousResolution !== "redispatch") {
        throw new ElevenLabsIntegrationError(
          "idempotency_ambiguous",
          `A previous paid request for idempotency key '${input.idempotencyKey}' failed with an unknown provider outcome (${lock.ambiguousReason ?? "unknown"}). The provider may already have charged for it. Pass ambiguousResolution: "redispatch" to explicitly accept the risk of a second charge, or reconcile with the provider first.`
        );
      }
      // Explicit operator resolution: clear the ambiguity and re-dispatch.
      // The unknown cost provision remains in the ledger for reconciliation.
    }

    // 4. Reserve cost budget before calling ElevenLabs
    let reservationId: string | undefined;
    let paidDispatchAttempted = false;
    try {
      const reservation = await this.costLedger.admitAndReserve({
        reservationId: `res-${input.idempotencyKey}`,
        runId: input.runId,
        stepId,
        text: sanitizedText,
        modelId,
      });
      reservationId = reservation.reservationId;

      // 5. Persist that a paid request is about to be dispatched (crash-safety)
      await this.idempotencyStore.markDispatched(input.idempotencyKey, requestFingerprintSha256, {
        providerRequestId: null,
        providerHistoryItemId: null,
        attempts: 0,
        latencyMs: 0,
        reservedAt: reservation.reservedAt,
      });

      // 6. Execute ElevenLabs speech synthesis
      paidDispatchAttempted = true;
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

      // 7. Commit cost reservation (the paid effect is now known)
      const costRecord = await this.costLedger.commit(reservation.reservationId, nowIso);

      // 8. Store durable audio asset and SIP provenance sidecar.
      //    A storage failure is NOT re-synthesized: the audio is cached in the
      //    journal so the retry re-uploads only.
      let storedAsset;
      try {
        storedAsset = await this.storage.putAudioAndSidecar(
          {
            objectKey,
            audioBytes: httpResult.audioBytes,
            mimeType,
            sha256: audioSha256,
          },
          sidecarKey,
          buildVoiceProvenanceRecord({
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
            approvalGate,
            voiceId,
            ...(preset ? { voicePresetId: preset.id } : {}),
            modelId,
            outputFormat,
            settings,
            providerRequestId: httpResult.providerRequestId,
            providerHistoryItemId: httpResult.providerHistoryItemId,
            attempts: httpResult.attempts,
            latencyMs: httpResult.latencyMs,
            artifact: {
              id: artifactId,
              kind: "audio",
              uri: `r2://pending/${objectKey}`,
              mimeType,
              sha256: audioSha256,
              sizeBytes: httpResult.audioBytes.byteLength,
              createdAt: nowIso,
              createdBy: approvalGate.decidedBy ?? "starlight-elevenlabs",
              createdByRunId: input.runId,
              attestation: "sip-attested",
              ...(input.sourceIds && input.sourceIds.length > 0 ? { sourceIds: [...input.sourceIds] } : {}),
            },
            cost: costRecord,
            durationSeconds: reservation.estimate.estimatedDurationSeconds,
            sampleRateHz,
            sidecarKey,
          })
        );
      } catch (storageError) {
        await this.idempotencyStore.markAmbiguous(
          input.idempotencyKey,
          requestFingerprintSha256,
          `synthesis succeeded but durable storage failed: ${storageError instanceof Error ? storageError.message : "unknown"}`,
          {
            bytes: httpResult.audioBytes,
            sha256: audioSha256,
            mimeType,
            sizeBytes: httpResult.audioBytes.byteLength,
          },
          {
            providerRequestId: httpResult.providerRequestId,
            providerHistoryItemId: httpResult.providerHistoryItemId,
            attempts: httpResult.attempts,
            latencyMs: httpResult.latencyMs,
            reservedAt: reservation.reservedAt,
          }
        );
        throw storageError;
      }

      return await this.finalizeResult({
        input,
        approvalGate,
        requestFingerprintSha256,
        rawTextSha256,
        sanitizedTextSha256,
        sanitizedText,
        wasSanitized,
        voiceId,
        preset,
        modelId,
        outputFormat,
        settings,
        sampleRateHz,
        audioSha256,
        audioBytes: httpResult.audioBytes,
        artifactId,
        sidecarKey,
        storedAsset,
        costRecord,
        reservationCharacterCount: reservation.estimate.characterCount,
        reservationDurationSeconds: reservation.estimate.estimatedDurationSeconds,
        providerRequestId: httpResult.providerRequestId,
        providerHistoryItemId: httpResult.providerHistoryItemId,
        attempts: httpResult.attempts,
        latencyMs: httpResult.latencyMs,
      });
    } catch (error) {
      // A 4xx response (except 408 request-timeout) is a definite provider
      // rejection: the request was not synthesized and not charged.
      const definiteProviderRejection =
        error instanceof ElevenLabsIntegrationError &&
        error.statusCode !== undefined &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 408;
      if (!paidDispatchAttempted || definiteProviderRejection) {
        // No paid effect: safe release.
        if (reservationId) {
          await this.costLedger.release(reservationId).catch(() => undefined);
        }
        await releaseOnFailure?.().catch(() => undefined);
      } else {
        // Ambiguous paid outcome (transport failure, timeout after acceptance,
        // 5xx, 408): the provider may have synthesized and charged. Fail closed —
        // persist the ambiguity and provisionally charge the budget until reconciled.
        try {
          const estimate = estimateSpeechCost(sanitizedText, modelId);
          if (reservationId) {
            await this.costLedger.release(reservationId);
          }
          await this.costLedger.markUnknownCost({
            idempotencyKey: input.idempotencyKey,
            runId: input.runId,
            stepId,
            costUsd: estimate.costUsd,
            note: `ambiguous provider outcome: ${error instanceof Error ? error.message : "unknown"}`,
          });
        } catch {
          // Ledger bookkeeping must never mask the original failure.
        }
        await this.idempotencyStore
          .markAmbiguous(
            input.idempotencyKey,
            requestFingerprintSha256,
            `provider outcome unknown: ${error instanceof Error ? error.message : "unknown"}`
          )
          .catch(() => undefined);
      }
      throw error;
    }
  }

  private async finalizeResult(params: {
    input: SynthesizeSpeechInput;
    approvalGate: VoiceConsentApprovalGate;
    requestFingerprintSha256: string;
    rawTextSha256: string;
    sanitizedTextSha256: string;
    sanitizedText: string;
    wasSanitized: boolean;
    voiceId: string;
    preset?: { id: string; label: string };
    modelId: ElevenLabsModelId;
    outputFormat: ElevenLabsOutputFormat;
    settings: import("./contracts.js").ElevenLabsVoiceSettings;
    sampleRateHz: number;
    audioSha256: string;
    audioBytes: Uint8Array;
    artifactId: string;
    sidecarKey: string;
    storedAsset: { uri: string; playbackUrl: string };
    costRecord: import("./contracts.js").StarlightCostRecord;
    reservationCharacterCount: number;
    reservationDurationSeconds: number;
    providerRequestId: string | null;
    providerHistoryItemId: string | null;
    attempts: number;
    latencyMs: number;
  }): Promise<SynthesizeSpeechResult> {
    const {
      input,
      approvalGate,
      requestFingerprintSha256,
      rawTextSha256,
      sanitizedTextSha256,
      sanitizedText,
      wasSanitized,
      voiceId,
      preset,
      modelId,
      outputFormat,
      settings,
      sampleRateHz,
      audioSha256,
      audioBytes,
      artifactId,
      sidecarKey,
      storedAsset,
      costRecord,
      reservationCharacterCount,
      reservationDurationSeconds,
      providerRequestId,
      providerHistoryItemId,
      attempts,
      latencyMs,
    } = params;

    const nowIso = costRecord.recordedAt;

    const finalArtifact: StarlightAudioArtifact = {
      id: artifactId,
      kind: "audio",
      uri: storedAsset.uri,
      mimeType: outputFormat.startsWith("mp3_") ? "audio/mpeg" : "audio/pcm",
      sha256: audioSha256,
      sizeBytes: audioBytes.byteLength,
      createdAt: nowIso,
      createdBy: approvalGate.decidedBy ?? "starlight-elevenlabs",
      createdByRunId: input.runId,
      attestation: "sip-attested",
      ...(input.sourceIds && input.sourceIds.length > 0 ? { sourceIds: [...input.sourceIds] } : {}),
    };

    const finalProvenance = buildVoiceProvenanceRecord({
      id: `prov-voice-${audioSha256.slice(0, 16)}`,
      runId: input.runId,
      idempotencyKey: input.idempotencyKey,
      requestFingerprintSha256,
      createdAt: nowIso,
      rawTextSha256,
      sanitizedTextSha256,
      characterCount: reservationCharacterCount,
      wasSanitized,
      ...(input.languageCode ? { languageCode: input.languageCode } : {}),
      approvalGate,
      voiceId,
      ...(preset ? { voicePresetId: preset.id } : {}),
      modelId,
      outputFormat,
      settings,
      providerRequestId,
      providerHistoryItemId,
      attempts,
      latencyMs,
      artifact: finalArtifact,
      cost: costRecord,
      durationSeconds: reservationDurationSeconds,
      sampleRateHz,
      sidecarKey,
    });

    const preview = buildPlayableAudioPreview({
      artifact: finalArtifact,
      playbackUrl: storedAsset.playbackUrl,
      audioBytes,
      format: outputFormat,
      estimatedDurationSeconds: reservationDurationSeconds,
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
      approvalGate,
    };

    await this.idempotencyStore.complete(
      input.idempotencyKey,
      requestFingerprintSha256,
      result
    );

    return result;
  }

  /**
   * Storage-only recovery path: the provider already synthesized (and was
   * charged); the retry re-uploads the cached audio without a second paid call.
   */
  private async finalizeFromCachedAudio(
    input: SynthesizeSpeechInput,
    audioBytes: Uint8Array,
    mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm",
    expectedSha256: string,
    dispatchDetail: { providerRequestId: string | null; providerHistoryItemId: string | null; attempts: number; latencyMs: number } | undefined,
    sanitizedText: string,
    outputFormat: ElevenLabsOutputFormat,
    sampleRateHz: number,
    approvalGate: VoiceConsentApprovalGate,
    requestFingerprintSha256: string,
    rawTextSha256: string,
    sanitizedTextSha256: string,
    voiceId: string,
    preset: { id: string; label: string } | undefined,
    modelId: ElevenLabsModelId,
    settings: import("./contracts.js").ElevenLabsVoiceSettings
  ): Promise<SynthesizeSpeechResult> {
    const audioSha256 = sha256Hex(audioBytes);
    if (audioSha256 !== expectedSha256) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Cached audio digest mismatch; the journal audio cache is corrupt. Manual resolution required."
      );
    }

    const estimate = await this.costLedger
      .admitAndReserve({
        reservationId: `res-${input.idempotencyKey}`,
        runId: input.runId,
        stepId: input.stepId ?? `tts-${input.idempotencyKey}`,
        text: sanitizedText,
        modelId,
      })
      .catch(() => undefined);

    const { extension } = formatMetadata(outputFormat);
    const artifactId = `art-voice-${audioSha256.slice(0, 16)}`;
    const objectKey = `${this.storageKeyPrefix}/${input.runId}/${artifactId}.${extension}`;
    const sidecarKey = `${objectKey}.sip.json`;
    const nowIso = new Date().toISOString();

    const costRecord = estimate
      ? await this.costLedger.commit(`res-${input.idempotencyKey}`, nowIso)
      : {
          id: `cost-unknown-${input.idempotencyKey}`,
          agentRunId: input.runId,
          workPacketId: input.stepId ?? `tts-${input.idempotencyKey}`,
          kind: "api-call" as const,
          amount: 0,
          currencyOrUnit: "USD" as const,
          timestamp: nowIso,
          runId: input.runId,
          stepId: input.stepId ?? `tts-${input.idempotencyKey}`,
          provider: "elevenlabs" as const,
          model: modelId,
          inputTokens: 0,
          outputTokens: 0,
          cachedInputTokens: 0,
          costUsd: 0,
          recordedAt: nowIso,
        };

    const provisionalArtifact: StarlightAudioArtifact = {
      id: artifactId,
      kind: "audio",
      uri: `r2://pending/${objectKey}`,
      mimeType,
      sha256: audioSha256,
      sizeBytes: audioBytes.byteLength,
      createdAt: nowIso,
      createdBy: approvalGate.decidedBy ?? "starlight-elevenlabs",
      createdByRunId: input.runId,
      attestation: "sip-attested",
      ...(input.sourceIds && input.sourceIds.length > 0 ? { sourceIds: [...input.sourceIds] } : {}),
    };

    const storedAsset = await this.storage.putAudioAndSidecar(
      {
        objectKey,
        audioBytes,
        mimeType,
        sha256: audioSha256,
      },
      sidecarKey,
      buildVoiceProvenanceRecord({
        id: `prov-voice-${audioSha256.slice(0, 16)}`,
        runId: input.runId,
        idempotencyKey: input.idempotencyKey,
        requestFingerprintSha256,
        createdAt: nowIso,
        rawTextSha256,
        sanitizedTextSha256,
        characterCount: Array.from(sanitizedText).length,
        wasSanitized: false,
        approvalGate,
        voiceId,
        ...(preset ? { voicePresetId: preset.id } : {}),
        modelId,
        outputFormat,
        settings,
        providerRequestId: dispatchDetail?.providerRequestId ?? null,
        providerHistoryItemId: dispatchDetail?.providerHistoryItemId ?? null,
        attempts: dispatchDetail?.attempts ?? 1,
        latencyMs: dispatchDetail?.latencyMs ?? 0,
        artifact: provisionalArtifact,
        cost: costRecord,
        durationSeconds: estimate?.estimate.estimatedDurationSeconds ?? 0,
        sampleRateHz,
        sidecarKey,
      })
    );

    return this.finalizeResult({
      input,
      approvalGate,
      requestFingerprintSha256,
      rawTextSha256,
      sanitizedTextSha256,
      sanitizedText,
      wasSanitized: false,
      voiceId,
      preset,
      modelId,
      outputFormat,
      settings,
      sampleRateHz,
      audioSha256,
      audioBytes,
      artifactId,
      sidecarKey,
      storedAsset,
      costRecord,
      reservationCharacterCount: estimate?.estimate.characterCount ?? Array.from(sanitizedText).length,
      reservationDurationSeconds: estimate?.estimate.estimatedDurationSeconds ?? 0,
      providerRequestId: dispatchDetail?.providerRequestId ?? null,
      providerHistoryItemId: dispatchDetail?.providerHistoryItemId ?? null,
      attempts: dispatchDetail?.attempts ?? 1,
      latencyMs: dispatchDetail?.latencyMs ?? 0,
    });
  }
}

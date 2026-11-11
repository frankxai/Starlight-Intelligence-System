import {
  ElevenLabsIntegrationError,
  canonicalDigest,
  sha256Base64,
  type ElevenLabsModelId,
  type ElevenLabsOutputFormat,
  type ElevenLabsVoiceSettings,
  type PlayableAudioPreview,
  type StarlightAudioArtifact,
  type StarlightCostRecord,
  type VoiceConsentApprovalGate,
  type VoiceProvenanceRecord,
} from "./contracts.js";

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds a cryptographically bound VoiceProvenanceRecord and SIP audio sidecar payload.
 */
export function buildVoiceProvenanceRecord(params: {
  id: string;
  runId: string;
  idempotencyKey: string;
  requestFingerprintSha256: string;
  createdAt: string;
  rawTextSha256: string;
  sanitizedTextSha256: string;
  characterCount: number;
  wasSanitized: boolean;
  languageCode?: string;
  approvalGate: VoiceConsentApprovalGate;
  voiceId: string;
  voicePresetId?: string;
  modelId: ElevenLabsModelId;
  outputFormat: ElevenLabsOutputFormat;
  settings: ElevenLabsVoiceSettings;
  providerRequestId: string | null;
  providerHistoryItemId: string | null;
  attempts: number;
  latencyMs: number;
  artifact: StarlightAudioArtifact;
  cost: StarlightCostRecord;
  durationSeconds: number;
  sampleRateHz: number;
  sidecarKey: string;
}): VoiceProvenanceRecord {
  const unsignedRecord: Omit<VoiceProvenanceRecord, "provenanceSha256"> = {
    version: "starlight.elevenlabs.provenance.v1",
    id: params.id,
    runId: params.runId,
    idempotencyKey: params.idempotencyKey,
    requestFingerprintSha256: params.requestFingerprintSha256,
    createdAt: params.createdAt,
    crossReferenceIssue: "frankxai/frankx.ai-vercel-website#1183",
    input: {
      rawTextSha256: params.rawTextSha256,
      sanitizedTextSha256: params.sanitizedTextSha256,
      characterCount: params.characterCount,
      wasSanitized: params.wasSanitized,
      ...(params.languageCode ? { languageCode: params.languageCode } : {}),
    },
    consent: {
      approvalGateId: params.approvalGate.id,
      decidedBy: params.approvalGate.decidedBy!,
      decidedAt: params.approvalGate.decidedAt!,
      approvedTextSha256: params.approvalGate.approvedTextSha256,
      voiceRightsConfirmed: true,
    },
    synthesis: {
      voiceId: params.voiceId,
      ...(params.voicePresetId ? { voicePresetId: params.voicePresetId } : {}),
      modelId: params.modelId,
      outputFormat: params.outputFormat,
      settings: params.settings,
      providerRequestId: params.providerRequestId,
      providerHistoryItemId: params.providerHistoryItemId,
      attempts: params.attempts,
      latencyMs: params.latencyMs,
    },
    artifact: params.artifact,
    cost: params.cost,
    sipAttestation: {
      sipVersion: "1.1.0",
      layers: ["attestation", "voice", "provenance"],
      generatedAt: params.createdAt,
      subject: {
        uri: params.artifact.uri,
        sha256: params.artifact.sha256,
      },
      modality: "audio",
      tool: "elevenlabs",
      toolVersion: params.modelId,
      promptHash: params.sanitizedTextSha256,
      payloadSha256: params.artifact.sha256,
      durationSeconds: params.durationSeconds,
      sampleRateHz: params.sampleRateHz,
      channels: 1,
      sidecarKey: params.sidecarKey,
    },
  };

  const provenanceSha256 = canonicalDigest(unsignedRecord);
  return {
    ...unsignedRecord,
    provenanceSha256,
  };
}

/**
 * Verifies the cryptographic integrity and internal bindings of a VoiceProvenanceRecord.
 */
export function verifyVoiceProvenanceRecord(record: VoiceProvenanceRecord): boolean {
  if (!record || record.version !== "starlight.elevenlabs.provenance.v1") {
    throw new ElevenLabsIntegrationError(
      "provenance_integrity_failed",
      "Invalid provenance record version."
    );
  }
  const { provenanceSha256, ...unsigned } = record;
  const expectedSha = canonicalDigest(unsigned);
  if (provenanceSha256 !== expectedSha) {
    throw new ElevenLabsIntegrationError(
      "provenance_integrity_failed",
      "Provenance record SHA-256 digest mismatch."
    );
  }
  if (record.consent.approvedTextSha256 !== record.input.sanitizedTextSha256) {
    throw new ElevenLabsIntegrationError(
      "provenance_integrity_failed",
      "Provenance consent digest does not match synthesized text digest."
    );
  }
  if (record.sipAttestation.payloadSha256 !== record.artifact.sha256) {
    throw new ElevenLabsIntegrationError(
      "provenance_integrity_failed",
      "SIP attestation payload SHA-256 does not match artifact SHA-256."
    );
  }
  return true;
}

const MAX_INLINE_DATA_URL_BYTES = 262_144; // 256 KiB ceiling for inline base64 data URLs

/**
 * Builds a structured PlayableAudioPreview contract with Subresource Integrity (SRI)
 * and accessible HTML5 player markup.
 */
export function buildPlayableAudioPreview(params: {
  artifact: StarlightAudioArtifact;
  playbackUrl: string;
  audioBytes: Uint8Array;
  format: ElevenLabsOutputFormat;
  estimatedDurationSeconds: number;
  sampleRateHz: number;
  sanitizedText: string;
  voiceLabel: string;
  modelId: ElevenLabsModelId;
  includeInlinePreview?: boolean;
}): PlayableAudioPreview {
  const sri = `sha256-${sha256Base64(params.audioBytes)}` as const;
  const excerpt =
    params.sanitizedText.length > 180
      ? `${params.sanitizedText.slice(0, 177).trimEnd()}...`
      : params.sanitizedText;

  const safeUrl = escapeHtmlAttribute(params.playbackUrl);
  const safeMime = escapeHtmlAttribute(params.artifact.mimeType);
  const safeLabel = escapeHtmlAttribute(`${params.voiceLabel} — ${excerpt}`);
  const safeSri = escapeHtmlAttribute(sri);

  const htmlEmbed = [
    `<figure class="starlight-audio-preview" data-artifact-id="${escapeHtmlAttribute(params.artifact.id)}" data-sri="${safeSri}">`,
    `  <audio controls preload="metadata" src="${safeUrl}" aria-label="${safeLabel}">`,
    `    <source src="${safeUrl}" type="${safeMime}" />`,
    `  </audio>`,
    `  <figcaption>${escapeHtmlAttribute(params.voiceLabel)} (${escapeHtmlAttribute(params.modelId)})</figcaption>`,
    `</figure>`,
  ].join("\n");

  const includeInline =
    Boolean(params.includeInlinePreview) && params.audioBytes.byteLength <= MAX_INLINE_DATA_URL_BYTES;
  const inlineDataUrl = includeInline
    ? `data:${params.artifact.mimeType};base64,${Buffer.from(params.audioBytes).toString("base64")}`
    : undefined;

  return {
    artifactId: params.artifact.id,
    playbackUrl: params.playbackUrl,
    mimeType: params.artifact.mimeType,
    format: params.format,
    sizeBytes: params.artifact.sizeBytes,
    estimatedDurationSeconds: params.estimatedDurationSeconds,
    sampleRateHz: params.sampleRateHz,
    channels: 1,
    subresourceIntegrity: sri,
    transcriptExcerpt: excerpt,
    voiceLabel: params.voiceLabel,
    modelId: params.modelId,
    htmlEmbed,
    ...(inlineDataUrl !== undefined ? { inlineDataUrl } : {}),
  };
}

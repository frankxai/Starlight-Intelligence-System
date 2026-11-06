# @starlight-intelligence/elevenlabs

Reusable, consent-gated ElevenLabs voice synthesis package for **Starlight Intelligence**, **GenCreator**, and **FrankX Resources** (cross-referencing [`frankxai/frankx.ai-vercel-website#1183`](https://github.com/frankxai/frankx.ai-vercel-website/issues/1183)).

## End-to-End Workflow

`user-approved text -> ElevenLabs API speech synthesis -> durable asset storage -> provenance record -> playable preview`

1. **Consent & Text Integrity Gate (`VoiceConsentApprovalGate`)**:
   - Aligned with `packages/core/schemas/approval-gate.schema.json`.
   - Enforces `status === "approved"`, non-expired timestamp (`expiresAt`), approving principal (`decidedBy`), explicit voice usage rights (`voiceRightsConfirmed === true`), and cryptographic SHA-256 text binding (`approvedTextSha256`) over NFC-normalized text.
   - Any post-approval text mutation, secret/PII leakage detected by `SanitizationGateway`, or voice mismatch fails closed before any provider call.
2. **Cost Limits & Budget Admission (`ElevenLabsCostLedger`)**:
   - Estimates character count, audio duration, and integer micro-USD cost prior to synthesis.
   - Enforces per-request character caps, per-request USD ceilings, window request limits, and cumulative USD budget ceilings.
   - Emits schema-valid `StarlightCostRecord` receipts (`packages/core/schemas/cost-record.schema.json`).
3. **Idempotency & Crash-Safe Journaling (`InMemoryIdempotencyStore` / `FileSystemIdempotencyJournal`)**:
   - Computes a canonical SHA-256 fingerprint over `(runId, voiceId, modelId, outputFormat, languageCode, settings, sanitizedTextSha256, approvalGateId, approvedTextSha256)`.
   - Duplicate calls with the same `idempotencyKey` and matching fingerprint replay the cached `SynthesizeSpeechResult` (`status: "replayed"`) without re-billing or re-calling ElevenLabs.
   - Calls reusing an `idempotencyKey` with a mutated payload fail closed with `idempotency_conflict`.
4. **Hardened Server-Side ElevenLabs Client (`ElevenLabsSpeechClient`)**:
   - Resolves `ELEVENLABS_API_KEY` (or a server-side secret callback) exclusively at request time; credentials are never serialized into state, logs, or error messages.
   - Enforces HTTPS endpoints (`redirect: "error"`, `credentials: "omit"`), bounded streaming byte ceilings, and exponential backoff with jitter on transient `408`/`429`/`502`/`503`/`504` responses while honoring `Retry-After`.
5. **Durable Asset Storage (`CloudflareR2StorageAdapter` / `FileSystemAudioStorageAdapter` / `InMemoryAudioStorageAdapter`)**:
   - Zero-dependency AWS Signature V4 (`node:crypto`) client for Cloudflare R2 and S3-compatible buckets.
   - Atomically stores both the audio binary (`.mp3` / `.pcm`) and its `.sip.json` provenance sidecar, verifying SHA-256 content digests and generating CDN or presigned GET playback URLs.
6. **Provenance Record & SIP Audio Attestation (`VoiceProvenanceRecord`)**:
   - Aligned with `packages/core/schemas/artifact.schema.json` and `/sip-attest-audio` (`SIP v1.1.0`).
   - Binds the input text SHA-256, consent gate receipt, ElevenLabs `request-id` / `history-item-id`, voice settings, storage URI, audio payload SHA-256, and cost record under a canonical `provenanceSha256` digest.
7. **Playable Audio Preview (`PlayableAudioPreview`)**:
   - Produces a ready-to-render playback contract with Subresource Integrity (`sha256-...`), transcript excerpt, duration estimate, accessible `<audio controls preload="metadata">` HTML5 embed markup, and optional base64 data URL.

## Multi-Host Agent Tool Contracts

`createStarlightElevenLabsToolSuite(pipeline)` exposes typed contracts for heterogeneous agent hosts without assuming identical connector support:

- **Claude Code / MCP (`mcp`)**: Model Context Protocol tool definition (`starlight_elevenlabs_synthesize_speech`) with JSON Schema 2020-12 `inputSchema`, MCP safety annotations, and `structuredContent` execution handler.
- **Codex / OpenAI (`codex`)**: OpenAI Chat Completions (`chatCompletionsTool`) and Responses API (`responsesApiTool`) function definitions plus `invoke()` runner.
- **Vercel AI SDK (`aiSdk`)**: Tool contract (`description`, `inputSchema`, `execute`) compatible with `generateText` and `streamText`.
- **ChatGPT Actions & Non-Connector Bridge (`chatGpt`)**: OpenAPI 3.1.0 Action specification (`buildChatGptOpenApiSpec()`) plus a JSON envelope bridge (`starlight.elevenlabs.action.v1`) for non-connector ChatGPT sessions.

## Quick Start

```ts
import {
  StarlightElevenLabsPipeline,
  CloudflareR2StorageAdapter,
  createApprovedVoiceConsentGate,
  createStarlightElevenLabsToolSuite,
} from "@starlight-intelligence/elevenlabs";

const pipeline = new StarlightElevenLabsPipeline({
  client: {
    // Resolved server-side from process.env.ELEVENLABS_API_KEY by default
    retryPolicy: { maxAttempts: 3, baseDelayMs: 250 },
  },
  storage: new CloudflareR2StorageAdapter({
    accountId: process.env.R2_ACCOUNT_ID!,
    bucket: "starlight-voice-vault",
    publicBaseUrl: "https://cdn.starlightintelligence.ai",
  }),
  costLedger: {
    maxCharactersPerRequest: 2500,
    maxCostUsdPerRequest: 0.75,
    maxWindowCostUsd: 5.0,
  },
});

const text = "Welcome to Starlight Intelligence. Every synthesized voice asset carries cryptographic provenance.";

const approvalGate = createApprovedVoiceConsentGate({
  id: "gate-launch-001",
  runId: "run-frankx-1183",
  text,
  decidedBy: "user:frank",
  approvedVoiceId: "starlight_architect",
  reason: "Approved intro narration for FrankX ElevenLabs resource slice (#1183).",
});

const idemRef = "idem-run-1";
const result = await pipeline.synthesizeSpeech({
  idempotencyKey: idemRef,
  runId: "run-frankx-1183",
  text,
  voice: "starlight_architect",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  approvalGate,
});

console.log(result.preview.playbackUrl);
console.log(result.provenance.provenanceSha256);

const tools = createStarlightElevenLabsToolSuite(pipeline);
```

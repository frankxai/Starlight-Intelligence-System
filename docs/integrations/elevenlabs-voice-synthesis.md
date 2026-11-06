# ElevenLabs Voice Synthesis & Provenance Integration (`@starlight-intelligence/elevenlabs`)

**Cross-Reference**: [`frankxai/frankx.ai-vercel-website#1183`](https://github.com/frankxai/frankx.ai-vercel-website/issues/1183) (*Partner Intelligence → FrankX Resources: ElevenLabs launch slice*)

## Overview

`@starlight-intelligence/elevenlabs` is the first reusable ElevenLabs voice synthesis package for the **Starlight Intelligence System**, unifying voice generation across:

- **Starlight Intelligence** (`@starlight-intelligence/core`, `@starlight-intelligence/mcp`, `@starlight-intelligence/ai-sdk`)
- **GenCreator Studio & Pipelines** (`frankxai/gencreator.ai`, `frankxai/starlight-creator-mcp`)
- **FrankX Resources & Partner Intelligence** (`frankxai/frankx.ai-vercel-website#1183`)

It implements a strict, fail-closed, consent-gated pipeline:

```text
user-approved text
  -> SanitizationGateway + VoiceConsentApprovalGate verification
  -> ElevenLabsCostLedger budget admission & reservation
  -> Idempotency journal lock & fingerprint check
  -> ElevenLabs Speech Synthesis HTTP API (bounded retries + Retry-After)
  -> Durable Asset Storage (Cloudflare R2 AWS SigV4 / Local Vault) + .sip.json sidecar
  -> Cryptographic VoiceProvenanceRecord (SIP v1.1.0 audio attestation)
  -> PlayableAudioPreview (Subresource Integrity + accessible HTML5 audio embed)
```

---

## Architectural Guarantees

### 1. Explicit Human Consent & Text Digest Binding
Every synthesis call requires a `VoiceConsentApprovalGate` aligned with `packages/core/schemas/approval-gate.schema.json`. The pipeline verifies:
- `status === "approved"`
- Non-empty `decidedBy` principal and valid ISO-8601 `requestedAt` / `decidedAt` timestamps
- Non-expired `expiresAt` window (when set)
- `voiceRightsConfirmed === true`
- `approvedTextSha256 === sha256Hex(normalizeSpeechText(text))` — any post-approval edit or prompt injection fails closed with `consent_text_mismatch`
- `SanitizationGateway` preflight — if the text contains secrets or PII that would be redacted, synthesis fails closed with `input_sanitization_blocked` before any outbound API call

### 2. Cost Limits & Budget Admission (`ElevenLabsCostLedger`)
Before dispatching to ElevenLabs, `ElevenLabsCostLedger` computes integer micro-USD cost estimates and enforces:
- `maxCharactersPerRequest` (default `2,500`, hard model cap `5,000`)
- `maxCostUsdPerRequest` (default `$0.75`)
- `maxWindowCostUsd` (default `$5.00`)
- `maxRequestsPerWindow` (default `50`)

Committed syntheses emit a schema-valid `StarlightCostRecord` (`packages/core/schemas/cost-record.schema.json`). Failed provider calls automatically release their cost reservation.

### 3. Idempotency & Crash-Safe Journaling
`InMemoryIdempotencyStore` and `FileSystemIdempotencyJournal` compute a canonical SHA-256 fingerprint over `(runId, voiceId, modelId, outputFormat, languageCode, settings, sanitizedTextSha256, approvalGateId, approvedTextSha256)`:
- **Replay**: Calling `synthesizeSpeech` with an already-completed `idempotencyKey` and identical payload returns the cached `SynthesizeSpeechResult` (`status: "replayed"`) with zero additional ElevenLabs calls or cost charges.
- **Conflict Rejection**: Reusing an `idempotencyKey` with any mutated parameter throws `ElevenLabsIntegrationError("idempotency_conflict")`.
- **Crash-Safe Filesystem Locking**: `FileSystemIdempotencyJournal` uses exclusive lockfiles (`wx`, mode `0o600`) and `fsync` + atomic `rename`.

### 4. Server-Side Credentials & Bounded Retries (`ElevenLabsSpeechClient`)
- Resolves `ELEVENLABS_API_KEY` (or a custom server-side secret callback) at request time.
- Enforces `https:` endpoints (`redirect: "error"`, `credentials: "omit"`).
- Retries transient `408`, `429`, `502`, `503`, and `504` responses with bounded exponential backoff + deterministic jitter, honoring standard `Retry-After` headers.
- Fails immediately on `400`, `401`, `403`, or `422` without leaking API keys into error messages or logs.

### 5. Durable Cloudflare R2 & Local Storage (`CloudflareR2StorageAdapter`)
- Uses zero-dependency Node `crypto` AWS Signature V4 signing to upload both the audio binary (`.mp3` / `.pcm`) and its `.sip.json` provenance sidecar to Cloudflare R2 (`https://<accountId>.r2.cloudflarestorage.com`).
- Generates either a public CDN playback URL (`publicBaseUrl`) or a cryptographically signed S3/R2 presigned `GET` URL (`createPresignedGetUrl`).

### 6. Cryptographic Provenance & Playable Preview
- `VoiceProvenanceRecord` produces a canonical `provenanceSha256` receipt binding the `StarlightAudioArtifact` (`packages/core/schemas/artifact.schema.json`), `StarlightCostRecord`, `VoiceConsentApprovalGate`, ElevenLabs `request-id`/`history-item-id`, and `/sip-attest-audio` (`SIP v1.1.0`) metadata.
- `PlayableAudioPreview` provides `playbackUrl`, `subresourceIntegrity` (`sha256-<base64>`), `estimatedDurationSeconds`, `transcriptExcerpt`, accessible `<audio controls preload="metadata">` HTML5 markup, and optional `inlineDataUrl`.

---

## Multi-Host Agent Tool Contracts (Without Assuming Identical Connector Support)

`createStarlightElevenLabsToolSuite(pipeline)` exposes four host-specific adapters from a single pipeline instance:

| Agent Host / Surface | Adapter Property | Contract Mechanism |
| :--- | :--- | :--- |
| **Claude Code / MCP Servers** | `suite.mcp` | MCP tool `starlight_elevenlabs_synthesize_speech` with Draft 2020-12 `inputSchema`, MCP safety annotations (`idempotentHint: true`), and `structuredContent` response. |
| **Codex / OpenAI Responses & Chat Completions** | `suite.codex` | `chatCompletionsTool` + `responsesApiTool` function definitions and `invoke(rawArgs)` runner. |
| **Vercel AI SDK (`generateText` / `streamText`)** | `suite.aiSdk` | Standard AI SDK tool contract (`{ description, inputSchema, execute }`). |
| **ChatGPT Actions & Non-Connector Bridge** | `suite.chatGpt` | OpenAPI 3.1.0 Action spec (`openApiSpec`) + `starlight.elevenlabs.action.v1` JSON envelope bridge for non-connector ChatGPT sessions (`src/runtime-bridge/chatgpt-plan.ts`). |

### Example: Wiring Across Claude Code, Codex, Vercel AI SDK, and ChatGPT

```ts
import {
  StarlightElevenLabsPipeline,
  CloudflareR2StorageAdapter,
  FileSystemIdempotencyJournal,
  createApprovedVoiceConsentGate,
  createStarlightElevenLabsToolSuite,
} from "@starlight-intelligence/elevenlabs";

const pipeline = new StarlightElevenLabsPipeline({
  client: {
    apiKey: () => process.env.ELEVENLABS_API_KEY ?? "",
    retryPolicy: { maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 4000 },
  },
  storage: new CloudflareR2StorageAdapter({
    accountId: process.env.R2_ACCOUNT_ID!,
    bucket: "starlight-voice-vault",
    publicBaseUrl: "https://cdn.starlightintelligence.ai",
  }),
  idempotencyStore: new FileSystemIdempotencyJournal("/var/lib/starlight/voice-journal"),
  costLedger: {
    maxCharactersPerRequest: 2500,
    maxCostUsdPerRequest: 0.75,
    maxWindowCostUsd: 5.0,
    maxRequestsPerWindow: 50,
  },
});

const suite = createStarlightElevenLabsToolSuite(pipeline);

// 1. Claude Code / MCP tool call
const gate = createApprovedVoiceConsentGate({
  id: "gate-1183",
  runId: "run-1183",
  text: "Starlight Intelligence brings verifiable provenance to studio voice synthesis.",
  decidedBy: "user:frank",
  approvedVoiceId: "starlight_architect",
});

const mcpResponse = await suite.mcp.execute({
  idempotencyKey: "idem-1183-intro",
  runId: "run-1183",
  text: "Starlight Intelligence brings verifiable provenance to studio voice synthesis.",
  voice: "starlight_architect",
  approvalGate: gate,
});

// 2. Codex / OpenAI tool call
const codexResult = await suite.codex.invoke({
  idempotencyKey: "idem-1183-intro",
  runId: "run-1183",
  text: "Starlight Intelligence brings verifiable provenance to studio voice synthesis.",
  voice: "starlight_architect",
  approvalGate: gate,
});
// codexResult.status === "replayed" (deduplicated by FileSystemIdempotencyJournal)
```

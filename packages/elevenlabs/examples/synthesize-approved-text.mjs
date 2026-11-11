#!/usr/bin/env node
/**
 * Runnable end-to-end example for @starlight-intelligence/elevenlabs.
 *
 * Demonstrates the complete consent-gated workflow:
 *   user-approved text -> ElevenLabs synthesis -> durable storage
 *   -> provenance record -> playable preview
 *
 * Safe modes:
 *   node examples/synthesize-approved-text.mjs --dry-run
 *     Runs the full pipeline against a stubbed ElevenLabs transport and the
 *     in-memory storage adapter. No credentials, no network, no cost.
 *
 *   node examples/synthesize-approved-text.mjs --journal /abs/path
 *     Persists the idempotency journal to disk (durable replay semantics).
 *
 * Live mode (real API call, real cost) requires ALL of:
 *   ELEVENLABS_API_KEY            server-side ElevenLabs API key
 *   R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_VOICE_BUCKET
 *     Cloudflare R2 credentials for durable asset storage
 *
 * See docs/integrations/elevenlabs-voice-synthesis.md and
 * frankxai/frankx.ai-vercel-website#1183 for the full architecture.
 *
 * Requires `pnpm run build` in packages/elevenlabs first (imports ../dist).
 */
import {
  CloudflareR2StorageAdapter,
  FileSystemIdempotencyJournal,
  HmacApprovalAuthority,
  InMemoryAudioStorageAdapter,
  InMemoryIdempotencyStore,
  STARLIGHT_ELEVENLABS_VOICES,
  StarlightElevenLabsPipeline,
  createApprovedVoiceConsentGate,
  estimateSpeechCost,
  verifyVoiceProvenanceRecord,
} from "../dist/index.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run") || process.env.ELEVENLABS_API_KEY === undefined;
const journalDir = [...args].find((arg) => !arg.startsWith("--"));

const TEXT =
  "Welcome to Starlight Intelligence. This narration was synthesized through the " +
  "consent-gated ElevenLabs voice pipeline, cross-referenced with FrankX issue 1183.";

const estimate = estimateSpeechCost(TEXT, "eleven_multilingual_v2");
console.log(`[estimate] ${estimate.characterCount} chars, ~${estimate.estimatedDurationSeconds}s, $${estimate.costUsd.toFixed(6)}`);

if (!dryRun) {
  console.log("[mode] LIVE — a real ElevenLabs synthesis will run and cost money.");
  console.log("[mode] Unset ELEVENLABS_API_KEY or pass --dry-run to avoid all cost.");
}

// 1. The user explicitly approves the exact text and voice before anything runs.
const approvalGate = createApprovedVoiceConsentGate({
  id: "gate-example-001",
  runId: "run-example-001",
  text: TEXT,
  decidedBy: "user:frank",
  approvedVoiceId: "starlight_architect",
  reason: "Example narration approved for the FrankX Resources ElevenLabs launch slice (#1183).",
});

// 2. A server-side authority (holding the signing key) issues a signed token for
//    that approval. The tool caller can present the token but cannot forge one.
//    In production the signing key (STARLIGHT_APPROVAL_SIGNING_KEY) lives only
//    in the consent backend; here we simulate that backend locally.
const approvalAuthority = new HmacApprovalAuthority({
  signingKey: "example-local-authority-signing-key-0123456789abcdef",
});
const approvalGateToken = approvalAuthority.issue({
  gate: approvalGate,
  tenantId: "starlight-main",
  purpose: "frankx-resources-launch",
});

// 2. Assemble the pipeline. In dry-run mode a stubbed transport replaces ElevenLabs.
const pipeline = new StarlightElevenLabsPipeline({
  // Server-side verification of the signed approval token (production consent path).
  approvalAuthority,
  expectedTenantId: "starlight-main",
  expectedPurpose: "frankx-resources-launch",
  ...(dryRun
    ? {
        client: {
          apiKey: () => "el_example_dry_run_transport_key",
          fetchImplementation: async () =>
            new Response(
              new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08]),
              { status: 200, headers: { "content-type": "audio/mpeg" } }
            ),
        },
        storage: new InMemoryAudioStorageAdapter(),
      }
    : {
        storage: new CloudflareR2StorageAdapter({
          accountId: process.env.R2_ACCOUNT_ID ?? "",
          bucket: process.env.R2_VOICE_BUCKET ?? "",
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
          publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
        }),
      }),
  idempotencyStore: journalDir
    ? new FileSystemIdempotencyJournal(journalDir)
    : new InMemoryIdempotencyStore(),
});

// 3. Run the workflow exactly as an agent tool host would.
const result = await pipeline.synthesizeSpeech({
  idempotencyKey: "idem-example-001",
  runId: "run-example-001",
  text: TEXT,
  voice: "starlight_architect",
  approvalGateToken,
  sourceIds: ["frankx-1183"],
});

// 4. Verify the cryptographic provenance chain end to end.
const provenanceValid = verifyVoiceProvenanceRecord(result.provenance);
console.log(`[artifact]   ${result.artifact.id} (${result.artifact.mimeType}, ${result.artifact.sizeBytes} bytes)`);
console.log(`[storage]    ${result.artifact.uri}`);
console.log(`[provenance] ${result.provenance.id} -> ${result.provenance.provenanceSha256.slice(0, 16)}… (valid: ${provenanceValid})`);
console.log(`[cost]       $${result.cost.costUsd.toFixed(6)} committed to ledger`);
console.log(`[preview]    ${result.preview.playbackUrl}`);
console.log(`[sri]        ${result.preview.subresourceIntegrity}`);
console.log("\n[audio embed]\n" + result.preview.htmlEmbed);

// 5. Replay the same request: zero API calls, zero cost, identical artifact.
const replay = await pipeline.synthesizeSpeech({
  idempotencyKey: "idem-example-001",
  runId: "run-example-001",
  text: TEXT,
  voice: "starlight_architect",
  approvalGateToken,
  sourceIds: ["frankx-1183"],
});
console.log(`\n[replay]     status=${replay.status} (expected "replayed", no second charge)`);

if (!dryRun && !journalDir) {
  // Show where a durable journal would live for production replay safety.
  const scratch = mkdtempSync(join(tmpdir(), "elevenlabs-example-"));
  console.log(`[hint] run again with --journal ${scratch} for durable replay across restarts`);
}

console.log(`\n[voices]     available presets: ${Object.keys(STARLIGHT_ELEVENLABS_VOICES).join(", ")}`);

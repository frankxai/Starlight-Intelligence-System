import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CloudflareR2StorageAdapter,
  ELEVENLABS_MODELS,
  ElevenLabsCostLedger,
  ElevenLabsIntegrationError,
  FileSystemCostLedgerStore,
  InMemoryApprovalAuthority,
  FileSystemAudioStorageAdapter,
  FileSystemIdempotencyJournal,
  InMemoryAudioStorageAdapter,
  InMemoryIdempotencyStore,
  STARLIGHT_ELEVENLABS_TOOL_NAME,
  STARLIGHT_ELEVENLABS_VOICES,
  StarlightElevenLabsPipeline,
  createApprovedVoiceConsentGate,
  createStarlightElevenLabsToolSuite,
  estimateSpeechCost,
  sha256Hex,
  verifyVoiceProvenanceRecord,
} from '../dist/index.js';

const SAMPLE_AUDIO = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0xff, 0xfb]);
const SAMPLE_TEXT =
  'Welcome to Starlight Intelligence. Every synthesized voice asset carries cryptographic provenance.';

function createTestClientOptions(overrides = {}) {
  const calls = [];
  const fetchImplementation = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(SAMPLE_AUDIO, {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        'request-id': 'req_el_9001',
        'history-item-id': 'hist_el_9001',
        'character-cost': String(SAMPLE_TEXT.length),
      },
    });
  };
  return {
    calls,
    options: {
      apiKey: () => 'el_live_server_secret_key_9988776655',
      fetchImplementation,
      retryPolicy: {
        maxAttempts: 3,
        baseDelayMs: 5,
        maxDelayMs: 20,
        sleep: async () => {},
      },
      ...overrides,
    },
  };
}

test('package metadata and public exports conform to Starlight workspace standards', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.name, '@starlight-intelligence/elevenlabs');
  assert.equal(pkg.private, false);
  assert.equal(pkg.type, 'module');
  assert.ok(STARLIGHT_ELEVENLABS_VOICES.starlight_architect);
  assert.ok(ELEVENLABS_MODELS.eleven_multilingual_v2);
});

test("end-to-end consent-gated synthesis produces artifact, provenance record, cost receipt, and playable preview", async () => {
  const { calls, options } = createTestClientOptions();
  const storage = new InMemoryAudioStorageAdapter({
    publicBaseUrl: "https://cdn.starlightintelligence.ai",
  });
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: options,
    storage,
  });

  const approvalGate = createApprovedVoiceConsentGate({
    id: "gate-e2e-001",
    runId: "run-e2e-001",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
    approvedVoiceId: "starlight_architect",
    reason: "Approved narration for FrankX issue #1183.",
  });

  const result = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-e2e-001",
    runId: "run-e2e-001",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    approvalGate,
    includeInlinePreview: true,
    sourceIds: ["src-frankx-1183"],
  });

  assert.equal(result.status, "synthesized");
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\/pNInz6obpgDQGcFmaJgB\?output_format=mp3_44100_128/);

  // Artifact schema conformance
  assert.equal(result.artifact.kind, "audio");
  assert.equal(result.artifact.mimeType, "audio/mpeg");
  assert.equal(result.artifact.sha256, sha256Hex(SAMPLE_AUDIO));
  assert.equal(result.artifact.sizeBytes, SAMPLE_AUDIO.byteLength);
  assert.equal(result.artifact.createdByRunId, "run-e2e-001");
  assert.deepEqual(result.artifact.sourceIds, ["src-frankx-1183"]);

  // Provenance record verification
  assert.equal(verifyVoiceProvenanceRecord(result.provenance), true);
  assert.equal(result.provenance.crossReferenceIssue, "frankxai/frankx.ai-vercel-website#1183");
  assert.equal(result.provenance.synthesis.providerRequestId, "req_el_9001");
  assert.equal(result.provenance.synthesis.providerHistoryItemId, "hist_el_9001");
  assert.equal(result.provenance.sipAttestation.modality, "audio");
  assert.equal(result.provenance.sipAttestation.tool, "elevenlabs");
  assert.equal(result.provenance.sipAttestation.payloadSha256, result.artifact.sha256);

  // Cost record verification
  assert.equal(result.cost.provider, "elevenlabs");
  assert.equal(result.cost.model, "eleven_multilingual_v2");
  assert.equal(result.cost.inputTokens, SAMPLE_TEXT.length);
  assert.ok(result.cost.costUsd > 0);

  // Playable preview verification
  assert.match(result.preview.playbackUrl, /^https:\/\/cdn\.starlightintelligence\.ai\/voice-assets\/run-e2e-001\//);
  assert.match(result.preview.subresourceIntegrity, /^sha256-/);
  assert.match(result.preview.htmlEmbed, /<audio controls preload="metadata"/);
  assert.match(result.preview.inlineDataUrl ?? "", /^data:audio\/mpeg;base64,/);

  // Sidecar stored alongside audio
  assert.equal(storage.audioBlobs.size, 1);
  assert.equal(storage.sidecars.size, 1);
});

test("consent gate blocks unapproved status, expired gates, mutated text, unconfirmed rights, and voice mismatch", async () => {
  const { calls, options } = createTestClientOptions();
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true, client: options });

  const baseGate = createApprovedVoiceConsentGate({
    id: "gate-consent-001",
    runId: "run-consent-001",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
    approvedVoiceId: "starlight_architect",
  });

  // 1. Mutated text after approval
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-c1",
      runId: "run-consent-001",
      text: SAMPLE_TEXT + " Tampered clause.",
      voice: "starlight_architect",
      approvalGate: baseGate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_text_mismatch"
  );

  // 2. Pending approval status
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-c2",
      runId: "run-consent-001",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: { ...baseGate, status: "pending" },
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_not_approved"
  );

  // 3. Expired approval window
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-c3",
      runId: "run-consent-001",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: { ...baseGate, expiresAt: "2020-01-01T00:00:00.000Z" },
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_expired"
  );

  // 4. Unconfirmed voice rights
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-c4",
      runId: "run-consent-001",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: { ...baseGate, voiceRightsConfirmed: false },
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_rights_unconfirmed"
  );

  // 5. Voice mismatch
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-c5",
      runId: "run-consent-001",
      text: SAMPLE_TEXT,
      voice: "luminor_oracle",
      approvalGate: baseGate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_voice_mismatch"
  );

  // Zero provider HTTP calls were made
  assert.equal(calls.length, 0);
});

test("SanitizationGateway blocks accidental secret or PII leakage before synthesis", async () => {
  const { calls, options } = createTestClientOptions();
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true, client: options });

  const textWithEmail = "Contact friemerx@example.com for the system key.";
  const gate = createApprovedVoiceConsentGate({
    id: "gate-pii-1",
    runId: "run-pii-1",
    text: textWithEmail,
    decidedBy: "user:frank",
  });

  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-pii-1",
      runId: "run-pii-1",
      text: textWithEmail,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "input_sanitization_blocked"
  );
  assert.equal(calls.length, 0);
});

test("cost ledger enforces per-request character cap, per-request USD ceiling, and window budget", async () => {
  const { calls, options } = createTestClientOptions();
  const ledger = new ElevenLabsCostLedger({
    maxCharactersPerRequest: 120,
    maxCostUsdPerRequest: 0.035,
    maxWindowCostUsd: 0.05,
    maxRequestsPerWindow: 2,
  });
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: options,
    costLedger: ledger,
  });

  const estimate = estimateSpeechCost(SAMPLE_TEXT, "eleven_multilingual_v2");
  assert.equal(estimate.characterCount, SAMPLE_TEXT.length);
  assert.ok(estimate.costUsd > 0.025 && estimate.costUsd < 0.035);

  const gate1 = createApprovedVoiceConsentGate({
    id: "gate-cost-1",
    runId: "run-cost-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  const first = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-cost-1",
    runId: "run-cost-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGate: gate1,
  });
  assert.equal(first.status, "synthesized");
  assert.equal((await ledger.snapshot()).committedRequests, 1);

  // Second request with same size exceeds maxWindowCostUsd ($0.05)
  const gate2 = createApprovedVoiceConsentGate({
    id: "gate-cost-2",
    runId: "run-cost-2",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-cost-2",
      runId: "run-cost-2",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate2,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "budget_exhausted"
  );

  // Oversized text exceeds maxCharactersPerRequest (120)
  const longText = "A".repeat(150);
  const gateLong = createApprovedVoiceConsentGate({
    id: "gate-cost-long",
    runId: "run-cost-long",
    text: longText,
    decidedBy: "user:frank",
  });
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-cost-long",
      runId: "run-cost-long",
      text: longText,
      voice: "starlight_architect",
      approvalGate: gateLong,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "cost_limit_exceeded"
  );

  assert.equal(calls.length, 1);
});

test("filesystem idempotency journal replays identical requests without re-charging and rejects conflicting payloads", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "starlight-el-journal-"));
  try {
    const { calls, options } = createTestClientOptions();
    const journal = new FileSystemIdempotencyJournal(join(tempRoot, "journal"));
    const storage = new FileSystemAudioStorageAdapter({
      directory: join(tempRoot, "audio"),
      publicBaseUrl: "https://cdn.starlightintelligence.ai/local",
    });

    const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
      client: options,
      idempotencyStore: journal,
      storage,
    });

    const gate = createApprovedVoiceConsentGate({
      id: "gate-idem-1",
      runId: "run-idem-1",
      text: SAMPLE_TEXT,
      decidedBy: "user:frank",
    });

    const journalRef = "idem-journal-1";
    const initial = await pipeline.synthesizeSpeech({
      idempotencyKey: journalRef,
      runId: "run-idem-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    });
    assert.equal(initial.status, "synthesized");
    assert.equal(calls.length, 1);

    // Re-instantiate journal from disk and replay identical request
    const pipelineRestarted = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
      client: options,
      idempotencyStore: new FileSystemIdempotencyJournal(join(tempRoot, "journal")),
      storage,
    });

    const replayed = await pipelineRestarted.synthesizeSpeech({
      idempotencyKey: journalRef,
      runId: "run-idem-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    });
    assert.equal(replayed.status, "replayed");
    assert.equal(replayed.artifact.sha256, initial.artifact.sha256);
    assert.equal(calls.length, 1);
    assert.equal((await pipeline.costLedger.snapshot()).committedRequests, 1);

    // Conflicting payload on same idempotencyKey must fail closed
    await assert.rejects(
      pipelineRestarted.synthesizeSpeech({
        idempotencyKey: journalRef,
        runId: "run-idem-1",
        text: SAMPLE_TEXT,
        voice: "luminor_oracle",
        approvalGate: gate,
      }),
      err => err instanceof ElevenLabsIntegrationError && err.code === "idempotency_conflict"
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("HTTP client retries transient 429 and 503 with Retry-After, and fails fast on 401 without leaking credentials", async () => {
  const sleepDelays = [];
  let attemptCount = 0;
  const secretKey = "el_live_super_sensitive_token_do_not_leak";

  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: {
      apiKey: () => secretKey,
      retryPolicy: {
        maxAttempts: 3,
        baseDelayMs: 50,
        maxDelayMs: 1000,
        sleep: async ms => {
          sleepDelays.push(ms);
        },
      },
      fetchImplementation: async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return new Response("Rate limited", {
            status: 429,
            headers: { "retry-after": "0.12" },
          });
        }
        if (attemptCount === 2) {
          return new Response("Gateway unavailable", { status: 503 });
        }
        return new Response(SAMPLE_AUDIO, {
          status: 200,
          headers: { "content-type": "audio/mpeg", "request-id": "req_recovered_3" },
        });
      },
    },
  });

  const gate = createApprovedVoiceConsentGate({
    id: "gate-retry-1",
    runId: "run-retry-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  const recovered = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-retry-1",
    runId: "run-retry-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGate: gate,
  });

  assert.equal(recovered.provenance.synthesis.attempts, 3);
  assert.equal(sleepDelays.length, 2);
  assert.equal(sleepDelays[0], 120); // Honored Retry-After: 0.12s = 120ms

  // Non-retryable 401 fails on attempt 1 and never leaks the API key
  let authAttempts = 0;
  const unauthorizedPipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: {
      apiKey: () => secretKey,
      fetchImplementation: async () => {
        authAttempts++;
        return new Response("Unauthorized", { status: 401 });
      },
    },
  });

  await assert.rejects(
    unauthorizedPipeline.synthesizeSpeech({
      idempotencyKey: "idem-unauth-1",
      runId: "run-retry-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => {
      assert.ok(err instanceof ElevenLabsIntegrationError);
      assert.equal(err.code, "credential_invalid");
      assert.equal(err.retryable, false);
      assert.ok(!err.message.includes(secretKey));
      return true;
    }
  );
  assert.equal(authAttempts, 1);
});

test("CloudflareR2StorageAdapter signs PUT requests with AWS SigV4 and generates presigned GET playback URLs", async () => {
  const r2Calls = [];
  const r2Adapter = new CloudflareR2StorageAdapter({
    accountId: "acc1234567890abcdef",
    bucket: "starlight-voice-vault",
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    presignExpiresSeconds: 1800,
    fetchImplementation: async (url, init) => {
      r2Calls.push({ url: String(url), init });
      return new Response("", { status: 200 });
    },
  });

  const { options } = createTestClientOptions();
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: options,
    storage: r2Adapter,
  });

  const gate = createApprovedVoiceConsentGate({
    id: "gate-r2-1",
    runId: "run-r2-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  const result = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-r2-1",
    runId: "run-r2-1",
    text: SAMPLE_TEXT,
    voice: "gencreator_pulse",
    approvalGate: gate,
  });

  // Two PUT uploads: 1 for audio binary, 1 for .sip.json provenance sidecar
  assert.equal(r2Calls.length, 2);
  assert.equal(r2Calls[0].init.method, "PUT");
  assert.match(
    r2Calls[0].init.headers.authorization,
    /^AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE\/\d{8}\/auto\/s3\/aws4_request/
  );
  assert.equal(r2Calls[0].init.headers["x-amz-content-sha256"], sha256Hex(SAMPLE_AUDIO));
  assert.equal(r2Calls[1].init.headers["content-type"], "application/json");
  assert.match(r2Calls[1].url, /\.mp3\.sip\.json$/);

  // Presigned GET URL generated when publicBaseUrl is omitted
  assert.match(result.preview.playbackUrl, /X-Amz-Algorithm=AWS4-HMAC-SHA256/);
  assert.match(result.preview.playbackUrl, /X-Amz-Expires=1800/);
  assert.match(result.preview.playbackUrl, /X-Amz-Signature=[a-f0-9]{64}/);
});

test("multi-host tool suite exposes working contracts for Claude Code (MCP), Codex, Vercel AI SDK, and ChatGPT Actions", async () => {
  const { options } = createTestClientOptions();
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true, client: options });
  const suite = createStarlightElevenLabsToolSuite(pipeline);

  assert.equal(suite.toolName, STARLIGHT_ELEVENLABS_TOOL_NAME);

  const gate = createApprovedVoiceConsentGate({
    id: "gate-tools-1",
    runId: "run-tools-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  // 1. Claude Code / MCP tool execution
  const mcpRes = await suite.mcp.execute({
    idempotencyKey: "idem-tool-mcp",
    runId: "run-tools-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGate: gate,
  });
  assert.equal(mcpRes.isError, false);
  const mcpJson = JSON.parse(mcpRes.content[0].text);
  assert.equal(mcpJson.status, "synthesized");
  assert.ok(mcpRes.structuredContent);

  // 2. Codex / OpenAI function tool execution
  assert.equal(suite.codex.chatCompletionsTool.function.name, STARLIGHT_ELEVENLABS_TOOL_NAME);
  assert.equal(suite.codex.responsesApiTool.name, STARLIGHT_ELEVENLABS_TOOL_NAME);
  const codexRes = await suite.codex.invoke(
    JSON.stringify({
      idempotencyKey: "idem-tool-codex",
      runId: "run-tools-1",
      text: SAMPLE_TEXT,
      voice: "luminor_oracle",
      approvalGate: gate,
    })
  );
  assert.equal(codexRes.status, "synthesized");

  // 3. Vercel AI SDK tool execution
  const aiSdkRes = await suite.aiSdk.execute({
    idempotencyKey: "idem-tool-aisdk",
    runId: "run-tools-1",
    text: SAMPLE_TEXT,
    voice: "arcanea_chronicler",
    approvalGate: gate,
  });
  assert.equal(aiSdkRes.status, "synthesized");

  // 4. ChatGPT Action OpenAPI 3.1.0 spec + non-connector envelope execution
  assert.equal(suite.chatGpt.openApiSpec.openapi, "3.1.0");
  const envelope = suite.chatGpt.createActionEnvelope({
    idempotencyKey: "idem-tool-chatgpt",
    runId: "run-tools-1",
    text: SAMPLE_TEXT,
    voice: "gencreator_pulse",
    approvalGate: gate,
  });
  const chatGptRes = await suite.chatGpt.executeActionEnvelope(JSON.stringify(envelope));
  assert.equal(chatGptRes.status, "synthesized");
});

test("idempotency stores serialize concurrent writers and fail closed on lock contention", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "starlight-el-concurrency-"));
  try {
    const journal = new FileSystemIdempotencyJournal(join(tempRoot, "journal"));
    const fingerprint = sha256Hex("concurrent-request-payload");

    // First writer acquires the exclusive journal lock.
    const first = await journal.acquireOrInspect("idem-concurrent-1", fingerprint);
    assert.equal(first.status, "acquired");

    // A second writer with the same key and identical payload must fail closed,
    // never silently double-charging or racing the first writer's completion.
    await assert.rejects(
      () => journal.acquireOrInspect("idem-concurrent-1", fingerprint),
      (error) =>
        error instanceof ElevenLabsIntegrationError &&
        error.code === "idempotency_in_progress"
    );

    // A mutated payload under the same key is a conflict, not a retry.
    await assert.rejects(
      () => journal.acquireOrInspect("idem-concurrent-1", sha256Hex("mutated-payload")),
      (error) =>
        error instanceof ElevenLabsIntegrationError &&
        error.code === "idempotency_conflict"
    );

    // The in-memory store enforces the same invariants for single-process hosts.
    const memory = new InMemoryIdempotencyStore();
    const memoryFirst = await memory.acquireOrInspect("idem-concurrent-2", fingerprint);
    assert.equal(memoryFirst.status, "acquired");
    await assert.rejects(
      () => memory.acquireOrInspect("idem-concurrent-2", fingerprint),
      (error) =>
        error instanceof ElevenLabsIntegrationError &&
        error.code === "idempotency_in_progress"
    );

    // Releasing on failure frees the key for a clean retry.
    await memoryFirst.releaseOnFailure();
    const retried = await memory.acquireOrInspect("idem-concurrent-2", fingerprint);
    assert.equal(retried.status, "acquired");

    // Release the filesystem writer's lock so the pipeline below starts clean.
    await first.releaseOnFailure();

    // Completing the filesystem writer makes the result replayable exactly once.
    const { options } = createTestClientOptions();
    const storage = new InMemoryAudioStorageAdapter();
    const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true, client: options, storage, idempotencyStore: journal });
    const gate = createApprovedVoiceConsentGate({
      id: "gate-concurrent-1",
      runId: "run-concurrent-1",
      text: SAMPLE_TEXT,
      decidedBy: "user:frank",
      approvedVoiceId: "starlight_architect",
    });
    const live = await pipeline.synthesizeSpeech({
      idempotencyKey: "idem-concurrent-1",
      runId: "run-concurrent-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    });
    assert.equal(live.status, "synthesized");
    const replayed = await pipeline.synthesizeSpeech({
      idempotencyKey: "idem-concurrent-1",
      runId: "run-concurrent-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    });
    assert.equal(replayed.status, "replayed");
    assert.equal(replayed.artifact.sha256, live.artifact.sha256);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("caller-asserted consent is rejected by default; only signed approval tokens pass in production mode", async () => {
  const { calls, options } = createTestClientOptions();
  const gate = createApprovedVoiceConsentGate({
    id: "gate-untrusted-1",
    runId: "run-untrusted-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  // Default pipeline (no authority, no opt-in): caller-asserted gate fails closed.
  const strictPipeline = new StarlightElevenLabsPipeline({ client: options });
  await assert.rejects(
    strictPipeline.synthesizeSpeech({
      idempotencyKey: "idem-untrusted-1",
      runId: "run-untrusted-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_untrusted"
  );

  // A token without a configured authority also fails closed.
  await assert.rejects(
    strictPipeline.synthesizeSpeech({
      idempotencyKey: "idem-untrusted-1b",
      runId: "run-untrusted-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: "v1.aaaaaaaaaaaa.bbbbbbbbbbbb",
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_untrusted"
  );

  // Token without any consent at all fails closed.
  await assert.rejects(
    strictPipeline.synthesizeSpeech({
      idempotencyKey: "idem-untrusted-1c",
      runId: "run-untrusted-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_required"
  );

  assert.equal(calls.length, 0);
});

test("approval authority rejects forged, tampered, revoked, expired, cross-tenant, and cross-run approvals", async () => {
  const authority = new InMemoryApprovalAuthority();
  const gate = createApprovedVoiceConsentGate({
    id: "gate-auth-1",
    runId: "run-auth-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });
  const token = authority.issue({ gate, tenantId: "starlight-main" });

  const { calls, options } = createTestClientOptions();
  const pipeline = new StarlightElevenLabsPipeline({
    client: options,
    approvalAuthority: authority,
    expectedTenantId: "starlight-main",
  });

  // Forged token (wrong signature) is rejected.
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-auth-forge",
      runId: "run-auth-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: "v1.Zm9yZ2Vk.wrong-signature",
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_token_invalid"
  );

  // Tampered payload (gate text swapped) breaks the signature.
  const tamperedGate = { ...gate, approvedTextSha256: sha256Hex("different approved text") };
  const tamperedToken = new InMemoryApprovalAuthority().issue({ gate: tamperedGate, tenantId: "starlight-main" });
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-auth-tamper",
      runId: "run-auth-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: tamperedToken,
    }),
    err =>
      err instanceof ElevenLabsIntegrationError &&
      ["consent_token_invalid", "consent_text_mismatch"].includes(err.code)
  );

  // Cross-tenant replay: a validly-signed token issued for another tenant is rejected.
  const crossTenantToken = authority.issue({ gate, tenantId: "other-tenant" });
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-auth-tenant",
      runId: "run-auth-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: crossTenantToken,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_tenant_mismatch"
  );

  // Revoked approval is rejected even with a valid signature.
  const revokeAuthority = new InMemoryApprovalAuthority();
  const revocableToken = revokeAuthority.issue({ gate, tenantId: "starlight-main" });
  revokeAuthority.revoke(gate.id);
  const revokedPipeline = new StarlightElevenLabsPipeline({
    client: options,
    approvalAuthority: revokeAuthority,
    expectedTenantId: "starlight-main",
  });
  await assert.rejects(
    revokedPipeline.synthesizeSpeech({
      idempotencyKey: "idem-auth-revoke",
      runId: "run-auth-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: revocableToken,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_revoked"
  );

  // Cross-run replay: gate bound to a different runId is rejected.
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-auth-crossrun",
      runId: "run-auth-OTHER",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGateToken: token,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "consent_not_approved"
  );

  // Valid token in a valid run synthesizes exactly once.
  const ok = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-auth-ok",
    runId: "run-auth-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGateToken: token,
  });
  assert.equal(ok.status, "synthesized");
  assert.equal(calls.length, 1);
});

test("timeout after paid dispatch fails closed: retry is blocked until explicit operator resolution", async () => {
  // Simulates a request that was accepted but whose response never arrives
  // on the first dispatch; the re-dispatch after operator resolution succeeds.
  let dispatchCount = 0;
  const fetchImplementation = async () => {
    dispatchCount += 1;
    if (dispatchCount === 1) {
      return new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error("socket hang up")), 5);
      });
    }
    return new Response(SAMPLE_AUDIO, { status: 200, headers: { "content-type": "audio/mpeg" } });
  };
  const { options } = createTestClientOptions({
    fetchImplementation,
    retryPolicy: { maxAttempts: 1, sleep: async () => {} },
  });
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: options,
  });
  const gate = createApprovedVoiceConsentGate({
    id: "gate-ambiguous-1",
    runId: "run-ambiguous-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  // The dispatch fails with a transport error: outcome may be charged.
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-ambiguous-1",
      runId: "run-ambiguous-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "provider_unavailable"
  );

  // Retry without resolution fails closed.
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-ambiguous-1",
      runId: "run-ambiguous-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "idempotency_ambiguous"
  );

  // Explicit operator resolution allows a re-dispatch.
  const resolved = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-ambiguous-1",
    runId: "run-ambiguous-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGate: gate,
    ambiguousResolution: "redispatch",
  });
  assert.equal(resolved.status, "synthesized");
});

test("storage failure after successful synthesis is recovered from the cached audio without a second provider charge", async () => {
  const transportCalls = [];
  const fetchImplementation = async () => {
    transportCalls.push(Date.now());
    return new Response(SAMPLE_AUDIO, { status: 200, headers: { "content-type": "audio/mpeg" } });
  };
  const { options } = createTestClientOptions({ fetchImplementation });
  let storageBroken = true;
  const goodAudio = new Map();
  const flakyStorage = {
    putAudioAndSidecar: async (asset, sidecarKey, provenance) => {
      if (storageBroken) {
        throw new ElevenLabsIntegrationError("storage_failed", "simulated R2 outage");
      }
      goodAudio.set(asset.objectKey, asset.audioBytes);
      return {
        uri: `r2://starlight-voice-vault/${asset.objectKey}`,
        playbackUrl: `https://cdn.starlightintelligence.ai/${asset.objectKey}`,
        sidecarUri: `r2://starlight-voice-vault/${sidecarKey}`,
        sha256: asset.sha256,
        sizeBytes: asset.audioBytes.byteLength,
      };
    },
  };
  const pipeline = new StarlightElevenLabsPipeline({
    allowCallerAssertedConsent: true,
    client: options,
    storage: flakyStorage,
  });
  const gate = createApprovedVoiceConsentGate({
    id: "gate-storage-1",
    runId: "run-storage-1",
    text: SAMPLE_TEXT,
    decidedBy: "user:frank",
  });

  // First attempt: synthesis succeeds, storage fails.
  await assert.rejects(
    pipeline.synthesizeSpeech({
      idempotencyKey: "idem-storage-1",
      runId: "run-storage-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    }),
    err => err instanceof ElevenLabsIntegrationError && err.code === "storage_failed"
  );
  assert.equal(transportCalls.length, 1);

  // Retry with storage repaired: completes from cached audio — provider NOT called again.
  storageBroken = false;
  const recovered = await pipeline.synthesizeSpeech({
    idempotencyKey: "idem-storage-1",
    runId: "run-storage-1",
    text: SAMPLE_TEXT,
    voice: "starlight_architect",
    approvalGate: gate,
  });
  assert.equal(recovered.status, "synthesized");
  assert.equal(transportCalls.length, 1);
  assert.ok(verifyVoiceProvenanceRecord(recovered.provenance));
});

test("durable cost ledger persists window budgets across restarts and reconciles unknown costs", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "starlight-el-costledger-"));
  try {
    const store = new FileSystemCostLedgerStore(join(tempRoot, "ledger"));
    const policy = {
      maxCostUsdPerRequest: 0.05,
      maxWindowCostUsd: 0.05,
      maxRequestsPerWindow: 10,
      store,
    };

    const { options } = createTestClientOptions();
    const firstInstance = new StarlightElevenLabsPipeline({
      allowCallerAssertedConsent: true,
      client: options,
      costLedger: policy,
    });
    const gate = createApprovedVoiceConsentGate({
      id: "gate-durable-1",
      runId: "run-durable-1",
      text: SAMPLE_TEXT,
      decidedBy: "user:frank",
    });
    const first = await firstInstance.synthesizeSpeech({
      idempotencyKey: "idem-durable-1",
      runId: "run-durable-1",
      text: SAMPLE_TEXT,
      voice: "starlight_architect",
      approvalGate: gate,
    });
    assert.equal(first.status, "synthesized");

    // A "restart": a brand-new pipeline and ledger sharing the same durable store.
    const restartedLedger = new ElevenLabsCostLedger(policy);
    await restartedLedger.hydrate();
    const restarted = new StarlightElevenLabsPipeline({
      allowCallerAssertedConsent: true,
      client: options,
      costLedger: restartedLedger,
    });
    const snapshot = await restartedLedger.snapshot();
    assert.equal(snapshot.durable, true);
    assert.equal(snapshot.committedRequests, 1);

    // The persisted spend still counts against the window budget on the new instance.
    await assert.rejects(
      restarted.synthesizeSpeech({
        idempotencyKey: "idem-durable-2",
        runId: "run-durable-2",
        text: SAMPLE_TEXT,
        voice: "starlight_architect",
        approvalGate: createApprovedVoiceConsentGate({
          id: "gate-durable-2",
          runId: "run-durable-2",
          text: SAMPLE_TEXT,
          decidedBy: "user:frank",
        }),
      }),
      err => err instanceof ElevenLabsIntegrationError && err.code === "budget_exhausted"
    );

    // Unknown-cost provision counts against the budget and reconciles explicitly.
    const provision = await restartedLedger.markUnknownCost({
      idempotencyKey: "idem-durable-unknown",
      runId: "run-durable-2",
      stepId: "tts-idem-durable-unknown",
      costUsd: 0.001,
      note: "test provision",
    });
    let afterProvision = await restartedLedger.snapshot();
    assert.equal(afterProvision.unknownCostProvisionsUsd, 0.001);
    await restartedLedger.reconcileUnknownCost(provision.id, { charged: false });
    afterProvision = await restartedLedger.snapshot();
    assert.equal(afterProvision.unknownCostProvisionsUsd, 0);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

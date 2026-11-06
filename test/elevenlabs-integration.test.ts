import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import {
  CloudflareR2StorageAdapter,
  STARLIGHT_ELEVENLABS_TOOL_NAME,
  StarlightElevenLabsPipeline,
  createApprovedVoiceConsentGate,
  createStarlightElevenLabsToolSuite,
  HmacApprovalAuthority,
  toCoreApprovalGateRecord,
  toCoreArtifactRecord,
  toCoreCostRecord,
  verifyVoiceProvenanceRecord,
} from "../packages/elevenlabs/dist/index.js";

const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });

const artifactSchema = JSON.parse(
  readFileSync(new URL("../packages/core/schemas/artifact.schema.json", import.meta.url), "utf8")
);
const approvalGateSchema = JSON.parse(
  readFileSync(new URL("../packages/core/schemas/approval-gate.schema.json", import.meta.url), "utf8")
);
const costRecordSchema = JSON.parse(
  readFileSync(new URL("../packages/core/schemas/cost-record.schema.json", import.meta.url), "utf8")
);

const validateArtifact = ajv.compile(artifactSchema);
const validateApprovalGate = ajv.compile(approvalGateSchema);
const validateCostRecord = ajv.compile(costRecordSchema);

describe("ElevenLabs integration core schema conformance & multi-host verification", () => {
  it("emits artifacts, approval gates, and cost records that validate against packages/core/schemas/", async () => {
    const audioBytes = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08]);
    const r2Uploaded = new Map<string, Uint8Array>();

    const r2 = new CloudflareR2StorageAdapter({
      accountId: "acc9876543210abcdef",
      bucket: "starlight-voice-vault",
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      publicBaseUrl: "https://cdn.starlightintelligence.ai",
      fetchImplementation: async (url, init) => {
        r2Uploaded.set(String(url), new Uint8Array(init?.body as ArrayBuffer));
        return new Response("", { status: 200 });
      },
    });

    const approvalAuthority = new HmacApprovalAuthority({
      signingKey: "schema-verification-authority-signing-key-0123456789abcdef",
    });
    const pipeline = new StarlightElevenLabsPipeline({
      client: {
        apiKey: () => "el_live_schema_verification_key_123456",
        fetchImplementation: async () =>
          new Response(audioBytes, {
            status: 200,
            headers: {
              "content-type": "audio/mpeg",
              "request-id": "req_schema_001",
              "history-item-id": "hist_schema_001",
            },
          }),
      },
      storage: r2,
      approvalAuthority,
      expectedTenantId: "starlight-main",
    });

    const text = "Starlight Intelligence consent-gated ElevenLabs synthesis for FrankX issue 1183.";
    const gate = createApprovedVoiceConsentGate({
      id: "gate-schema-001",
      runId: "run-schema-001",
      text,
      decidedBy: "user:frank",
      approvedVoiceId: "starlight_architect",
      reason: "Approved narration for FrankX Resources ElevenLabs launch slice (#1183).",
    });

    // Validate base approval gate against core approval-gate.schema.json
    const coreApprovalGate = toCoreApprovalGateRecord(gate);
    assert.equal(
      validateApprovalGate(coreApprovalGate),
      true,
      JSON.stringify(validateApprovalGate.errors)
    );

    const suite = createStarlightElevenLabsToolSuite(pipeline);
    assert.equal(suite.toolName, STARLIGHT_ELEVENLABS_TOOL_NAME);

    // Production consent path: the authority issues a signed token after the
    // user's approval; the pipeline verifies it server-side before synthesis.
    const approvalGateToken = approvalAuthority.issue({
      gate,
      tenantId: "starlight-main",
      purpose: "frankx-resources-launch",
    });
    const coreGateFromToken = await approvalAuthority.verify(approvalGateToken, {
      expectedTenantId: "starlight-main",
    });
    assert.equal(coreGateFromToken.id, gate.id);

    const result = await suite.codex.invoke({
      idempotencyKey: "idem-schema-001",
      runId: "run-schema-001",
      text,
      voice: "starlight_architect",
      approvalGateToken,
      sourceIds: ["issue-1183"],
    });

    assert.equal(
      validateArtifact(toCoreArtifactRecord(result.artifact)),
      true,
      JSON.stringify(validateArtifact.errors)
    );
    assert.equal(
      validateCostRecord(toCoreCostRecord(result.cost)),
      true,
      JSON.stringify(validateCostRecord.errors)
    );
    assert.equal(verifyVoiceProvenanceRecord(result.provenance), true);
    assert.equal(r2Uploaded.size, 2);
  });
});

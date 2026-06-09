/**
 * Track A v0.1 — Schema conformance harness
 *
 * Validates the 13 JSON Schemas in packages/core/schemas/ reject inputs
 * that are missing required fields. We use a tiny in-process validator
 * (required-field + enum + type) to avoid adding ajv as a dependency
 * for a substrate schema integrity check.
 *
 * Built on SIP — operational tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const SCHEMAS_DIR = join(REPO_ROOT, "packages", "core", "schemas");

// ── Minimal JSON-Schema-ish validator (Draft 2020-12 subset) ──

interface JsonSchema {
  type?: string;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  enum?: string[];
  items?: JsonSchema;
  minLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  additionalProperties?: boolean;
}

interface ValidationError {
  path: string;
  message: string;
}

function validate(
  instance: unknown,
  schema: JsonSchema,
  path = "$",
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schema.type) {
    const actual = Array.isArray(instance) ? "array" : typeof instance;
    const normalised = actual === "object" && instance === null ? "null" : actual;
    if (normalised !== schema.type) {
      errors.push({ path, message: `expected ${schema.type}, got ${normalised}` });
      return errors;
    }
  }

  if (schema.enum && typeof instance === "string" && !schema.enum.includes(instance)) {
    errors.push({ path, message: `value ${instance} not in enum` });
  }

  if (typeof instance === "string" && schema.minLength != null && instance.length < schema.minLength) {
    errors.push({ path, message: `string too short (min ${schema.minLength})` });
  }

  if (typeof instance === "number") {
    if (schema.minimum != null && instance < schema.minimum) {
      errors.push({ path, message: `value < minimum ${schema.minimum}` });
    }
    if (schema.maximum != null && instance > schema.maximum) {
      errors.push({ path, message: `value > maximum ${schema.maximum}` });
    }
  }

  if (typeof instance === "string" && schema.pattern) {
    const re = new RegExp(schema.pattern);
    if (!re.test(instance)) {
      errors.push({ path, message: `string does not match pattern` });
    }
  }

  if (schema.type === "object" && instance !== null && typeof instance === "object") {
    const obj = instance as Record<string, unknown>;
    for (const req of schema.required ?? []) {
      if (!(req in obj)) {
        errors.push({ path: `${path}.${req}`, message: "missing required" });
      }
    }
    if (schema.properties) {
      for (const [key, sub] of Object.entries(schema.properties)) {
        if (key in obj) {
          errors.push(...validate(obj[key], sub, `${path}.${key}`));
        }
      }
    }
  }

  if (schema.type === "array" && Array.isArray(instance) && schema.items) {
    for (let i = 0; i < instance.length; i++) {
      errors.push(...validate(instance[i], schema.items, `${path}[${i}]`));
    }
  }

  return errors;
}

function loadSchema(name: string): JsonSchema {
  const path = join(SCHEMAS_DIR, `${name}.schema.json`);
  return JSON.parse(readFileSync(path, "utf-8")) as JsonSchema;
}

const NOW = "2026-05-11T12:00:00.000Z";
const SHA256 = "a".repeat(64);

// Minimal valid fixtures so we can mutate them to break each one.
const VALID: Record<string, Record<string, unknown>> = {
  "work-packet": {
    id: "wp_1",
    title: "test",
    mission: "test",
    contextRefs: [],
    requiredOutputs: [],
    allowedTools: [],
    allowedPaths: [],
    forbiddenActions: [],
    riskLevel: "low",
    approvalRequired: false,
    assignedAgent: "unassigned",
    status: "pending",
    events: [],
    artifacts: [],
    costEstimate: 0,
    createdAt: NOW,
  },
  "agent-run": {
    id: "run_1",
    workPacketId: "wp_1",
    agentId: "a",
    startedAt: NOW,
    status: "pending",
  },
  "agent-event": {
    id: "evt_1",
    runId: "run_1",
    agentId: "a",
    eventType: "tool.call",
    summary: "",
    toolsUsed: [],
    inputRefs: [],
    outputRefs: [],
    decisionsCreated: [],
    artifactsCreated: [],
    riskLevel: "low",
    costEstimate: 0,
    timestamp: NOW,
  },
  decision: {
    id: "dec_1",
    title: "t",
    context: "c",
    options: ["a", "b"],
    chosen: "a",
    rationale: "r",
    riskLevel: "low",
    createdAt: NOW,
    createdBy: "me",
  },
  artifact: {
    id: "art_1",
    kind: "file",
    uri: "file:///x",
    sha256: SHA256,
    createdBy: "me",
    createdAt: NOW,
    attestation: "sip-attested",
  },
  pack: {
    id: "pk_1",
    name: "test",
    version: "0.1.0",
    kind: "skill",
    permissions: [],
    licenseTier: "free",
    manifestSha: SHA256,
  },
  permission: {
    id: "perm_1",
    scope: "fs",
    action: "read",
    conditions: [],
  },
  "approval-gate": {
    id: "ag_1",
    workPacketId: "wp_1",
    requestedAt: NOW,
    status: "pending",
    riskLevel: "low",
  },
  "council-review": {
    id: "cr_1",
    decision: "ship",
    context: "ctx",
    perspectives: {
      elderFather: "",
      elderMother: "",
      sage: "",
      builderElder: "",
      shadowWitness: "",
      divineNeutralWitness: "",
      futureSelf90: "",
    },
    convergence: "",
    conflict: "",
    redLines: [],
    cleanestPath: "",
    oneNextMove: "",
    reviewDate: NOW,
    createdAt: NOW,
  },
  "graph-entity": {
    id: "ge_1",
    kind: "person",
    name: "Frank",
    attributes: {},
    createdAt: NOW,
  },
  "graph-edge": {
    id: "edge_1",
    edgeType: "knows",
    source: "ge_1",
    target: "ge_2",
    evidenceRef: "evt_1",
    confidence: 0.9,
    createdBy: "me",
    createdAt: NOW,
  },
  "cost-record": {
    id: "cost_1",
    kind: "tokens",
    amount: 100,
    currencyOrUnit: "tokens",
    timestamp: NOW,
  },
  "eval-result": {
    id: "eval_1",
    evalName: "test",
    targetId: "wp_1",
    targetKind: "WorkPacket",
    passed: true,
    createdAt: NOW,
  },
};

// ── Tests ──

describe("Track A v0.1 — JSON Schema conformance", () => {
  it("at least 13 schemas exist on disk under packages/core/schemas/", () => {
    const files = readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith(".schema.json"));
    // Floor: 13 Track A contracts. Additions like vault-loop-entry (Proposal C) bump
    // the count without breaking forward-compat.
    assert.ok(
      files.length >= 13,
      `expected at least 13 schemas, found ${files.length}: ${files.join(", ")}`,
    );
  });

  it("every schema accepts its minimal valid fixture", () => {
    for (const [name, fixture] of Object.entries(VALID)) {
      const schema = loadSchema(name);
      const errs = validate(fixture, schema);
      assert.equal(errs.length, 0, `${name} rejected valid fixture: ${errs.map((e) => `${e.path}: ${e.message}`).join(", ")}`);
    }
  });

  it("every schema rejects an empty object (required-field check)", () => {
    for (const name of Object.keys(VALID)) {
      const schema = loadSchema(name);
      const errs = validate({}, schema);
      assert.ok(errs.length > 0, `${name} accepted empty object — required fields not enforced`);
    }
  });

  it("WorkPacket rejects invalid riskLevel", () => {
    const schema = loadSchema("work-packet");
    const bad = { ...VALID["work-packet"], riskLevel: "extreme" };
    const errs = validate(bad, schema);
    assert.ok(errs.some((e) => e.path === "$.riskLevel"), "expected riskLevel enum rejection");
  });

  it("WorkPacket rejects invalid status", () => {
    const schema = loadSchema("work-packet");
    const bad = { ...VALID["work-packet"], status: "running" };
    const errs = validate(bad, schema);
    assert.ok(errs.some((e) => e.path === "$.status"), "expected status enum rejection");
  });

  it("GraphEdge schema marks evidenceRef as required", () => {
    const schema = loadSchema("graph-edge");
    assert.ok(schema.required?.includes("evidenceRef"), "evidenceRef must be in required[]");
    const bad: Record<string, unknown> = { ...VALID["graph-edge"] };
    delete bad.evidenceRef;
    const errs = validate(bad, schema);
    assert.ok(
      errs.some((e) => e.path === "$.evidenceRef"),
      "GraphEdge without evidenceRef must fail validation (substrate invariant)",
    );
  });

  it("GraphEdge confidence must be 0..1", () => {
    const schema = loadSchema("graph-edge");
    const tooHigh = { ...VALID["graph-edge"], confidence: 1.5 };
    const tooLow = { ...VALID["graph-edge"], confidence: -0.1 };
    assert.ok(validate(tooHigh, schema).length > 0, "confidence > 1 must fail");
    assert.ok(validate(tooLow, schema).length > 0, "confidence < 0 must fail");
  });

  it("Artifact rejects malformed sha256", () => {
    const schema = loadSchema("artifact");
    const bad = { ...VALID["artifact"], sha256: "not-a-hash" };
    const errs = validate(bad, schema);
    assert.ok(errs.some((e) => e.path === "$.sha256"), "expected sha256 pattern rejection");
  });

  it("Artifact attestation enum is exactly { sip-attested, unattested }", () => {
    const schema = loadSchema("artifact");
    const props = schema.properties ?? {};
    const att = props.attestation;
    assert.deepEqual(att?.enum, ["sip-attested", "unattested"]);
  });

  it("Pack kind enum contains all 6 pack types", () => {
    const schema = loadSchema("pack");
    const kind = schema.properties?.kind?.enum ?? [];
    for (const expected of ["prompt", "skill", "agent", "knowledge", "claw", "white-label"]) {
      assert.ok(kind.includes(expected), `Pack kind missing: ${expected}`);
    }
  });

  it("CouncilReview perspectives requires all 7 named seats", () => {
    const schema = loadSchema("council-review");
    const persp = schema.properties?.perspectives;
    const required = persp?.required ?? [];
    for (const seat of [
      "elderFather",
      "elderMother",
      "sage",
      "builderElder",
      "shadowWitness",
      "divineNeutralWitness",
      "futureSelf90",
    ]) {
      assert.ok(required.includes(seat), `Council seat missing: ${seat}`);
    }
  });

  it("CostRecord kind enum covers tokens/time/api-call/storage", () => {
    const schema = loadSchema("cost-record");
    const kind = schema.properties?.kind?.enum ?? [];
    for (const expected of ["tokens", "time", "api-call", "storage"]) {
      assert.ok(kind.includes(expected), `CostRecord kind missing: ${expected}`);
    }
  });

  it("ApprovalGate status enum covers pending/approved/rejected/expired", () => {
    const schema = loadSchema("approval-gate");
    const status = schema.properties?.status?.enum ?? [];
    for (const expected of ["pending", "approved", "rejected", "expired"]) {
      assert.ok(status.includes(expected), `ApprovalGate status missing: ${expected}`);
    }
  });

  it("AgentRun status enum covers pending/in_progress/completed/failed/cancelled", () => {
    const schema = loadSchema("agent-run");
    const status = schema.properties?.status?.enum ?? [];
    for (const expected of ["pending", "in_progress", "completed", "failed", "cancelled"]) {
      assert.ok(status.includes(expected), `AgentRun status missing: ${expected}`);
    }
  });
});

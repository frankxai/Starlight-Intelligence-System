// node --test protocol/test/
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  validateProfile,
  traceClaim,
  findSecrets,
  NODE_TYPES,
  EDGE_TYPES,
  EDGE_MATRIX,
  BODY_REQUIRED,
  idPrefixFor,
  SIP_GRAPH_VERSION,
} from "../lib/graph.mjs";
import { assertStrict, validate as validateAgainstSchema } from "../lib/jsonschema.mjs";
import { buildReceipt } from "../conform.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = resolve(here, "..", "fixtures");
const repoRoot = resolve(here, "..", "..");

const load = (name) => {
  const raw = readFileSync(join(fixtures, name), "utf8");
  return { raw, profile: JSON.parse(raw) };
};

const rule = (result, id) => result.rules.find((r) => r.id === id);
const clone = (o) => JSON.parse(JSON.stringify(o));

test("the declared type sets stay closed and self-consistent", () => {
  assert.equal(NODE_TYPES.length, 12);
  assert.equal(EDGE_TYPES.length, 13);
  for (const type of EDGE_TYPES) {
    assert.ok(EDGE_MATRIX[type], `${type} has no endpoint matrix`);
    for (const t of [...EDGE_MATRIX[type].from, ...EDGE_MATRIX[type].to]) {
      assert.ok(NODE_TYPES.includes(t), `${type} references unknown node type ${t}`);
    }
  }
  for (const type of NODE_TYPES) {
    assert.ok(BODY_REQUIRED[type], `${type} declares no required body fields`);
  }
});

test("the published schema does not drift from the validator", () => {
  const schema = JSON.parse(
    readFileSync(resolve(here, "..", `sip-graph.v${SIP_GRAPH_VERSION}.schema.json`), "utf8")
  );
  assert.deepEqual(schema.$defs.node.properties.type.enum, NODE_TYPES);
  assert.deepEqual(schema.$defs.edge.properties.type.enum, EDGE_TYPES);

  const { endpointMatrix: published } = JSON.parse(
    readFileSync(resolve(here, "..", `sip-graph.v${SIP_GRAPH_VERSION}.endpoints.json`), "utf8")
  );
  for (const type of EDGE_TYPES) {
    const spec = published[type];
    assert.ok(spec, `${type} is missing from the published endpoint matrix`);
    assert.deepEqual(spec.from, EDGE_MATRIX[type].from, `${type}.from drifted`);
    const to = spec.to === "*" ? NODE_TYPES : spec.to;
    assert.deepEqual(to, EDGE_MATRIX[type].to, `${type}.to drifted`);
  }

  for (const type of NODE_TYPES) {
    const def = schema.$defs[`body${type}`];
    assert.ok(def, `body${type} is missing from the schema`);
    assert.deepEqual(
      def.properties.body.required,
      BODY_REQUIRED[type],
      `body${type}.required drifted`
    );
  }
});

test("id prefixes are derived from the type name", () => {
  assert.equal(idPrefixFor("MemoryRecord"), "sip:memory-record:");
  assert.equal(idPrefixFor("Claim"), "sip:claim:");
});

test("the reference profile passes every rule", () => {
  const { profile } = load("valid-profile.json");
  const result = validateProfile(profile);
  const failures = result.rules.filter((r) => r.status === "fail");
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
  assert.equal(result.verdict, "PASS");
});

test("the leaky profile fails exactly the projection rules", () => {
  const { profile } = load("leaky-profile.json");
  const result = validateProfile(profile);
  assert.equal(result.verdict, "FAIL");
  const failed = result.rules.filter((r) => r.status === "fail").map((r) => r.id).sort();
  assert.deepEqual(failed, ["P1", "P2", "P3", "P4", "P5"]);
});

test("P4 names the credential shape it caught", () => {
  const { profile } = load("leaky-profile.json");
  const p4 = rule(validateProfile(profile), "P4");
  assert.match(p4.findings.join(" "), /sip:claim:overshared/);
});

test("an unknown node type is rejected rather than ignored", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  mutated.nodes.push({
    id: "sip:oracle:mystery",
    type: "Oracle",
    version: "1.0.0",
    owner: "sip:identity:example-lab",
    visibility: "public",
    provenance: { origin: "authored", at: "2026-09-02T09:00:00Z", sources: [] },
    evaluation: { rule: "sip:evaluation:none" },
    body: {},
  });
  assert.equal(rule(validateProfile(mutated), "G4").status, "fail");
});

test("an illegal edge endpoint pairing is rejected", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  // A Policy cannot assert a Claim — only an Agent or Identity can.
  mutated.edges.find((e) => e.id === "sip:edge:analyst-asserts-claim").from =
    "sip:policy:public-claims-need-two-sources";
  assert.equal(rule(validateProfile(mutated), "G7").status, "fail");
});

test("an unowned element is rejected", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  mutated.nodes.find((n) => n.id === "sip:claim:retrieval-latency-improved").owner =
    "sip:identity:nobody";
  assert.equal(rule(validateProfile(mutated), "G8").status, "fail");
});

test("a derivation cycle is caught", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  mutated.edges.push({
    id: "sip:edge:corpus-note-derives-claim",
    type: "derivedFrom",
    from: "sip:source:corpus-note-114",
    to: "sip:claim:retrieval-latency-improved",
    version: "1.0.0",
    owner: "sip:identity:example-lab",
    visibility: "public",
    provenance: { origin: "derived", at: "2026-09-02T09:00:00Z", sources: [] },
    evaluation: { rule: "sip:evaluation:derivation-resolves" },
  });
  const g10 = rule(validateProfile(mutated), "G10");
  assert.equal(g10.status, "fail");
  assert.match(g10.findings.join(" "), /cycle/);
});

test("a major version mismatch is refused, a newer minor is flagged", () => {
  const { profile } = load("valid-profile.json");
  const major = clone(profile);
  major.sipGraphVersion = "1.0.0";
  assert.equal(rule(validateProfile(major), "C1").status, "fail");

  const minor = clone(profile);
  const [maj, min, patch] = SIP_GRAPH_VERSION.split(".").map(Number);
  minor.sipGraphVersion = `${maj}.${min + 1}.${patch}`;
  assert.equal(rule(validateProfile(minor), "C1").status, "fail");
});

test("an unknown optional field does not break validation (forward compatible)", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  mutated.nodes[0].futureField = { anything: true };
  mutated.futureTopLevel = ["ignored"];
  assert.equal(validateProfile(mutated).verdict, "PASS");
});

test("the owner trace walks all six stages", () => {
  const { profile } = load("valid-profile.json");
  const trace = traceClaim(profile, "sip:claim:retrieval-latency-improved", "owner");
  assert.ok(trace);
  assert.equal(trace.assertedBy.id, "sip:agent:retrieval-analyst");
  assert.deepEqual(
    trace.stages.map((s) => s.key),
    ["source", "policy", "memory", "artifact", "evaluation", "attestation"]
  );
  for (const stage of trace.stages) {
    assert.ok(stage.nodes.length > 0, `stage ${stage.key} is empty in the reference profile`);
    assert.ok(stage.nodes.every((n) => n.withheld === false));
  }
  // The owner view sees the private source; the public view must not.
  const sources = trace.stages.find((s) => s.key === "source").nodes.map((n) => n.id);
  assert.ok(sources.includes("sip:source:internal-log-7"));
});

test("the public trace withholds the private source without hiding its existence", () => {
  const { profile } = load("valid-profile.json");
  const trace = traceClaim(profile, "sip:claim:retrieval-latency-improved", "public");
  const priv = trace.stages
    .find((s) => s.key === "source")
    .nodes.find((n) => n.id === "sip:source:internal-log-7");
  assert.equal(priv.withheld, true);
  assert.equal(priv.body, undefined);
  assert.equal(priv.private, undefined);
  assert.equal(priv.label, undefined);
});

test("tracing an unknown claim returns null rather than an empty shell", () => {
  const { profile } = load("valid-profile.json");
  assert.equal(traceClaim(profile, "sip:claim:does-not-exist"), null);
});

test("the receipt is deterministic apart from its timestamp", () => {
  const { profile, raw } = load("valid-profile.json");
  const a = buildReceipt({ profile, raw, checkedAt: "2026-09-02T00:00:00Z" });
  const b = buildReceipt({ profile, raw, checkedAt: "2026-09-02T00:00:00Z" });
  assert.deepEqual(a, b);
  assert.equal(a.profileSha256.length, 64);
  assert.equal(a.verdict, "PASS");
  assert.equal(a.counts.nodes, profile.nodes.length);
});

test("a receipt matches the published receipt schema", () => {
  const schema = JSON.parse(
    readFileSync(resolve(here, "..", "receipt.v0.1.0.schema.json"), "utf8")
  );
  const { profile, raw } = load("valid-profile.json");
  const receipt = buildReceipt({ profile, raw, checkedAt: "2026-09-02T00:00:00Z" });

  for (const key of schema.required) {
    assert.ok(receipt[key] !== undefined, `receipt is missing required field ${key}`);
  }
  const allowed = new Set(Object.keys(schema.properties));
  for (const key of Object.keys(receipt)) {
    assert.ok(allowed.has(key), `receipt carries undeclared field ${key}`);
  }
  assert.match(receipt.tool, new RegExp(schema.properties.tool.pattern));
  assert.match(receipt.profileSha256, new RegExp(schema.properties.profileSha256.pattern));
  assert.ok(schema.properties.verdict.enum.includes(receipt.verdict));

  const ruleSchema = schema.properties.rules.items;
  const ruleAllowed = new Set(Object.keys(ruleSchema.properties));
  for (const r of receipt.rules) {
    for (const key of ruleSchema.required) {
      assert.ok(r[key] !== undefined, `rule ${r.id} is missing ${key}`);
    }
    for (const key of Object.keys(r)) {
      assert.ok(ruleAllowed.has(key), `rule ${r.id} carries undeclared field ${key}`);
    }
    assert.match(r.id, new RegExp(ruleSchema.properties.id.pattern));
    assert.ok(ruleSchema.properties.status.enum.includes(r.status));
  }
});

test("the leaky fixture's receipt names the failing elements", () => {
  const { profile, raw } = load("leaky-profile.json");
  const receipt = buildReceipt({ profile, raw, checkedAt: "2026-09-02T00:00:00Z" });
  assert.equal(receipt.verdict, "FAIL");
  for (const r of receipt.rules) {
    if (r.status === "fail") {
      assert.ok(r.findings.length > 0, `${r.id} failed with no findings`);
      assert.ok(
        r.findings.every((f) => f.includes("sip:")),
        `${r.id} findings do not name an element`
      );
    }
  }
});

test("a non-object profile fails closed instead of throwing", () => {
  const result = validateProfile(null);
  assert.equal(result.verdict, "FAIL");
});

// ── Fix pass 2026-09-02 · the projection rules used to govern nodes only ──────
// Every mutation below returned PASS before this pass. They are written as the
// reviewer ran them: change one field on an INTERIOR edge — both endpoints
// inside the public projection — and assert the rule now sees it.

const PUBLIC_INTERIOR_EDGE = "sip:edge:analyst-asserts-claim";
// Assembled at runtime so this file never carries a literal key shape.
const FAKE_KEY = ["sk", "ant", "api03", "EXAMPLEEXAMPLEEXAMPLE0123456789"].join("-");

test("P4 catches a credential on an interior edge, not only on a node", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  const edge = mutated.edges.find((e) => e.id === PUBLIC_INTERIOR_EDGE);
  edge.provenance.method = `run with ${FAKE_KEY}`;
  const p4 = rule(validateProfile(mutated), "P4");
  assert.equal(p4.status, "fail");
  assert.match(p4.findings.join(" "), new RegExp(PUBLIC_INTERIOR_EDGE));
});

test("P1 refuses an interior edge whose visibility is stricter than the audience", () => {
  const { profile } = load("valid-profile.json");
  for (const visibility of ["alliance", "private", "secret"]) {
    const mutated = clone(profile);
    mutated.edges.find((e) => e.id === PUBLIC_INTERIOR_EDGE).visibility = visibility;
    const p1 = rule(validateProfile(mutated), "P1");
    assert.equal(p1.status, "fail", `${visibility} interior edge slipped through P1`);
    assert.match(p1.findings.join(" "), new RegExp(PUBLIC_INTERIOR_EDGE));
  }
});

test("an owner-only block on an interior edge is caught by P3", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  mutated.edges.find((e) => e.id === PUBLIC_INTERIOR_EDGE).private = {
    operatorNotes: "who approved this run",
  };
  const p3 = rule(validateProfile(mutated), "P3");
  assert.equal(p3.status, "fail");
  assert.match(p3.findings.join(" "), new RegExp(PUBLIC_INTERIOR_EDGE));
});

test("P3 guards an owner-only key at any depth, including inside an array", () => {
  const cases = [
    (n) => {
      n.body.internalNotes = { credentials: "vault://ops/db" };
    },
    (n) => {
      n.body.secret = "rotate before publishing";
    },
    (n) => {
      n.body.reviewers = [{ name: "operator a", private: { handle: "@internal" } }];
    },
  ];
  for (const mutate of cases) {
    const { profile } = load("valid-profile.json");
    const mutated = clone(profile);
    mutate(mutated.nodes.find((n) => n.id === "sip:claim:retrieval-latency-improved"));
    const p3 = rule(validateProfile(mutated), "P3");
    assert.equal(p3.status, "fail", `a nested owner-only field passed: ${mutate}`);
    assert.match(p3.findings.join(" "), /sip:claim:retrieval-latency-improved/);
  }
});

test("redactFields strips the top-level private block and nothing deeper", () => {
  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  const claim = mutated.nodes.find((n) => n.id === "sip:claim:retrieval-latency-improved");
  claim.private = { operatorNotes: "draft wording" };
  const projection = mutated.nodes.find((n) => n.id === "sip:projection:public");
  projection.body.redactFields = [claim.id];
  assert.equal(rule(validateProfile(mutated), "P3").status, "pass");

  claim.body.audit = { credentials: "vault://ops/db" };
  assert.equal(rule(validateProfile(mutated), "P3").status, "fail");
});

test("a pinned content hash is not a credential", () => {
  const digest = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  assert.deepEqual(findSecrets(`"contentHash":"${digest}"`), []);
  assert.deepEqual(findSecrets(`"image":"registry.example.org/app@sha256:${digest}"`), []);
  assert.deepEqual(findSecrets(FAKE_KEY), [
    "OpenAI-style secret key",
    "Anthropic-style secret key",
  ]);

  const { profile } = load("valid-profile.json");
  const mutated = clone(profile);
  const artifact = mutated.nodes.find((n) => n.id === "sip:artifact:latency-report-2026-08");
  artifact.body.contentHash = digest;
  artifact.body.imageRef = `registry.example.org/report@sha256:${digest}`;
  const result = validateProfile(mutated);
  assert.equal(rule(result, "P4").status, "pass", JSON.stringify(rule(result, "P4").findings));
  assert.equal(result.verdict, "PASS");
});

// ── The published schema must load strictly and accept its own fixtures ───────

async function schemaValidator(schema) {
  try {
    const { default: Ajv2020 } = await import("ajv/dist/2020.js");
    const ajv = new Ajv2020({ strict: true, allErrors: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}[Tt].+$/);
    const compiled = ajv.compile(schema);
    return {
      engine: "ajv",
      run: (data) => (compiled(data) ? [] : [ajv.errorsText(compiled.errors)]),
    };
  } catch {
    assertStrict(schema);
    return { engine: "subset", run: (data) => validateAgainstSchema(schema, data) };
  }
}

test("the published schema loads under a strict validator and accepts every fixture", async () => {
  const schema = JSON.parse(
    readFileSync(resolve(here, "..", `sip-graph.v${SIP_GRAPH_VERSION}.schema.json`), "utf8")
  );
  const { engine, run } = await schemaValidator(schema);
  assert.ok(["ajv", "subset"].includes(engine));

  for (const name of ["valid-profile.json", "leaky-profile.json"]) {
    const { profile } = load(name);
    const errors = run(profile);
    assert.deepEqual(
      errors,
      [],
      `${name} does not validate against the schema (${engine}): ${JSON.stringify(errors, null, 2)}`
    );
  }

  // The negative case for the strict loader itself: a non-keyword in a subschema
  // is what made v0.1.0's first schema unloadable in ajv strict mode.
  const smuggled = JSON.parse(JSON.stringify(schema));
  smuggled.$defs.edge.endpointMatrix = { asserts: { from: ["Agent"], to: ["Claim"] } };
  assert.throws(() => assertStrict(smuggled), /unknown keyword "endpointMatrix"/);
});

const shippedMaskPath = join(repoRoot, "site", "src", "lib", "generated", "sip-mask.mjs");

// The site explorer is not in this tree yet; the drift check arms itself once it lands.
test("the explorer masks through the same function the protocol does", {
  skip: existsSync(shippedMaskPath) ? false : "site explorer not shipped yet (site/src/lib/generated/sip-mask.mjs absent)",
}, () => {
  const canonical = readFileSync(join(repoRoot, "protocol", "lib", "mask.mjs"), "utf8");
  const shipped = readFileSync(shippedMaskPath, "utf8");
  assert.equal(
    shipped,
    canonical,
    "site/src/lib/generated/sip-mask.mjs has drifted from protocol/lib/mask.mjs — run node site/scripts/sync-protocol-graph.mjs"
  );
});

test("a URL pinned to a full commit SHA is not a credential", () => {
  const sha = "72a84693be9b39d1b7a183d225f1662a8f04703c";
  const pinned = `https://github.com/frankxai/Starlight-Intelligence-System/blob/${sha}/LICENSE`;
  assert.deepEqual(findSecrets(pinned), []);
  assert.deepEqual(findSecrets(`https://github.com/o/r/commit/${sha}`), []);
  assert.deepEqual(findSecrets(`https://github.com/o/r/tree/${sha}#readme`), []);

  // The exemption is the 40-hex segment only: a token-shaped path segment still fails.
  const webhook = "https://hooks.example.com/services/T0AAAAAAA/B0BBBBBBB/Zq8vR2mXkLp4NwYt7HsJd3Fc9GbVe6Ua1Qo5";
  assert.deepEqual(findSecrets(webhook), ["long base64 blob"]);
  assert.deepEqual(findSecrets(`${pinned}?token=${"Zq8vR2mXkLp4NwYt7HsJd3Fc9GbVe6Ua1Qo5".repeat(2)}`), ["long base64 blob"]);
});

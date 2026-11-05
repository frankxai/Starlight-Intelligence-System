import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { keyIdOf, signRunReceipt, verifyRunReceipt, RUN_RECEIPT_SCHEMA } from "../src/run-receipt.ts";
import { adjudicateRuntimeExperiment, experimentDigest, receiptDigest,
  RUNTIME_RECEIPT_SCHEMA } from "../tools/proving-ground/evolution/runtime-receipts.mjs";
import { EVOLUTION_SCHEMA } from "../tools/proving-ground/evolution/adjudicate.mjs";

// Every identity, observation and signature in this suite is SYNTHETIC EXAMPLE.
// Ephemeral local keys exercise real crypto; they establish no hosted identity.
const nowMs = Date.parse("2026-11-05T20:00:00.000Z");
const runnerKeys = generateKeyPairSync("ed25519");
const checkerKeys = generateKeyPairSync("ed25519");
const runnerKeyId = keyIdOf(runnerKeys.publicKey);
const checkerKeyId = keyIdOf(checkerKeys.publicKey);
const pem = key => key.export({ type: "spki", format: "pem" });

async function fixture(evidenceLevel = "independently_observed") {
  const metrics = accepted => ({ attempted: 40, accepted, criticalViolations: 0,
    totalUsd: 10, humanMinutes: 100, p95LatencyMs: 800 });
  const run = candidate => ({
    capabilityVersion: candidate ? "candidate/v1" : "baseline/v1",
    sourceRevision: (candidate ? "b" : "a").repeat(40),
    runtime: { provider: candidate ? "vercel" : "cloudflare", kind: candidate ? "sandbox" : "pi",
      version: "fixture-1.0.0", sourceDigest: (candidate ? "e" : "f").repeat(64) },
    maker: { id: "fixture-maker", provider: "claude" }, evidenceLevel,
    metrics: metrics(candidate ? 35 : 28),
    receipt: { digest: "d".repeat(64), taskSetDigest: "c".repeat(64),
      checker: { id: "fixture-checker", provider: "codex", subjectDigest: "d".repeat(64) } },
  });
  const experiment = { schema: EVOLUTION_SCHEMA, id: "synthetic-comparison", tenantScope: "synthetic-tenant-a",
    sourceRevision: "a".repeat(40), hypothesis: "Synthetic comparison tests only",
    budget: { maxCandidateCostUsd: 15, maxCandidateHumanMinutes: 150 },
    taskSet: { digest: "c".repeat(64), sealed: true, contamination: "clear", kind: "challenge" },
    baseline: run(false), candidate: run(true) };
  const digest = await experimentDigest(experiment);
  const bodies = Object.fromEntries(["baseline", "candidate"].map(label => [label, {
    schema: RUNTIME_RECEIPT_SCHEMA, experimentId: experiment.id, experimentDigest: digest,
    tenantScope: experiment.tenantScope, taskSetDigest: experiment.taskSet.digest,
    runId: `synthetic-${label}`, sourceRevision: experiment[label].sourceRevision,
    capabilityVersion: experiment[label].capabilityVersion,
    runtime: experiment[label].runtime,
    status: "completed", evidenceLevel, metrics: experiment[label].metrics,
    startedAt: "2026-11-05T19:58:00.000Z", completedAt: "2026-11-05T19:59:00.000Z",
  }]));
  const envelope = async body => {
    const payload = JSON.stringify(body);
    const digest = await receiptDigest(payload);
    const signed = (role, key) => signRunReceipt({ schema: RUN_RECEIPT_SCHEMA,
      receiptId: `fixture-${role}-${body.runId}`, issuedAt: "2026-11-05T19:59:00.000Z",
      issuer: { name: `synthetic-${role}` },
      run: { id: `fixture-${role}-${body.runId}`, kind: `evolution.${role}`, host: "synthetic-test",
        correlationId: body.runId, startedAt: "2026-11-05T19:58:00.000Z", endedAt: "2026-11-05T19:59:00.000Z" },
      subject: { name: "synthetic-runtime-evidence", digest: { sha256: digest } },
      stages: [{ name: "fixture", status: "ok", costEur: 0, latencyMs: 1 }],
      totals: { costEur: 0, latencyMs: 1, tokens: { input: 0, output: 0 } },
      decisions: [], evidence: [{ kind: "synthetic", ref: "artifact:synthetic-evidence", sha256: digest }], verdict: "PASS",
    }, key.export({ type: "pkcs8", format: "pem" }));
    return { payload, runner: signed("runner", runnerKeys.privateKey), checker: signed("checker", checkerKeys.privateKey) };
  };
  const envelopes = { baseline: await envelope(bodies.baseline), candidate: await envelope(bodies.candidate) };
  for (const label of ["baseline", "candidate"]) {
    experiment[label].receipt.digest = await receiptDigest(envelopes[label].payload);
    experiment[label].receipt.checker.subjectDigest = experiment[label].receipt.digest;
  }
  const host = { nowMs, maxAgeMs: 300000, verifyRunReceipt,
    keys: {
      [runnerKeyId]: { id: "fixture-maker", provider: "claude", role: "runner",
        publicKeyPem: pem(runnerKeys.publicKey), runtimeProviders: ["cloudflare", "vercel"] },
      [checkerKeyId]: { id: "fixture-checker", provider: "codex", role: "checker", publicKeyPem: pem(checkerKeys.publicKey) },
    },
    authorize: async () => ({ tenantScope: experiment.tenantScope, experimentDigest: digest,
      taskSetDigest: experiment.taskSet.digest, runIds: ["synthetic-baseline", "synthetic-candidate"] }),
  };
  return { experiment, bodies, envelopes, host, envelope };
}

test("signed synthetic Cloudflare/Vercel comparison uses existing advisory and derived hashes", async () => {
  const f = await fixture();
  const result = await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host);
  assert.equal(result.verdict, "SHADOW_REVIEW_CANDIDATE");
  assert.equal(result.releaseAuthorized, false);
  assert.equal(result.candidateReceiptDigest, await receiptDigest(f.envelopes.candidate.payload));
  assert.equal(result.summary.acceptedRate.candidate, 35 / 40);
  assert.equal(JSON.stringify(result).includes("synthetic-tenant-a"), false);
  assert.equal(JSON.stringify(result).includes("fixture-checker"), false);
});

test("client evidence cannot bypass missing, denied or failed host authorization", async () => {
  for (const authorize of [undefined, async () => null, async () => { throw new Error("private-session-detail"); }]) {
    const f = await fixture();
    const result = await adjudicateRuntimeExperiment(f.experiment, f.envelopes, { ...f.host, authorize });
    assert.equal(result.verdict, "BLOCKED");
    assert.equal(JSON.stringify(result).includes("private-session-detail"), false);
  }
});

test("cross-tenant and unregistered run evidence is denied even with valid signatures", async () => {
  for (const change of [b => { b.tenantScope = "synthetic-tenant-b"; }, b => { b.runId = "foreign-run"; }]) {
    const f = await fixture(); change(f.bodies.candidate);
    f.envelopes.candidate = await f.envelope(f.bodies.candidate);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("tampering, missing signatures and checker-signature replay fail closed", async () => {
  for (const change of [
    f => { f.envelopes.candidate.payload += " "; },
    f => { f.envelopes.candidate.runner.signatures[0].sig = "invalid"; },
    f => { delete f.envelopes.candidate.checker; },
    f => { f.envelopes.candidate.checker = f.envelopes.baseline.checker; },
  ]) {
    const f = await fixture(); change(f);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("unknown/revoked issuers, role confusion and self-review are denied", async () => {
  for (const change of [
    h => { delete h.keys[checkerKeyId]; },
    h => { h.keys[checkerKeyId].revoked = true; },
    h => { h.keys[checkerKeyId].role = "runner"; },
    h => { h.keys[checkerKeyId].id = "fixture-maker"; },
    h => { h.keys[checkerKeyId].provider = "claude"; },
    h => { h.keys[runnerKeyId].runtimeProviders = ["cloudflare"]; },
  ]) {
    const f = await fixture(); change(f.host);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("validly signed stale, future, reversed and invalid timestamps fail", async () => {
  for (const change of [
    b => { b.completedAt = "2026-11-05T19:00:00Z"; b.startedAt = "2026-11-05T18:00:00Z"; },
    b => { b.completedAt = "2026-11-05T20:01:00Z"; },
    b => { b.startedAt = "2026-11-05T20:00:00Z"; },
    b => { b.completedAt = "yesterday"; },
  ]) {
    const f = await fixture(); change(f.bodies.candidate);
    f.envelopes.candidate = await f.envelope(f.bodies.candidate);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("runtime, status, dataset, source, signed metric and identity mismatches fail", async () => {
  for (const change of [
    b => { b.runtime = { ...b.runtime, kind: "unsupported" }; },
    b => { b.runtime = { ...b.runtime, version: "latest" }; },
    b => { b.runtime = { ...b.runtime, sourceDigest: "a".repeat(64) }; },
    b => { b.status = "unknown_effect"; }, b => { b.taskSetDigest = "f".repeat(64); },
    b => { b.sourceRevision = "f".repeat(40); },
    b => { b.metrics = { ...b.metrics, accepted: 40 }; },
    b => { b.experimentDigest = "f".repeat(64); },
  ]) {
    const f = await fixture(); change(f.bodies.candidate);
    f.envelopes.candidate = await f.envelope(f.bodies.candidate);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("fixture label survives valid crypto and cannot qualify observed improvement", async () => {
  const f = await fixture("fixture");
  const result = await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host);
  assert.equal(result.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(result.reasons.join(" "), /fixture-only/);
});

test("changing a preregistered budget or hypothesis invalidates host authorization", async () => {
  for (const change of [e => { e.budget.maxCandidateCostUsd = 999; }, e => { e.hypothesis = "post-hoc"; }]) {
    const f = await fixture(); change(f.experiment);
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("comparison is snapshotted before awaiting host authorization", async () => {
  const f = await fixture(); const authorize = f.host.authorize;
  f.host.authorize = async scope => {
    f.experiment.candidate.metrics.accepted = 0;
    f.envelopes.candidate.payload = "tampered while waiting";
    return authorize(scope);
  };
  assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "SHADOW_REVIEW_CANDIDATE");
});

test("malformed envelopes, unbounded clocks and invalid JSON never throw or disclose", async () => {
  const f = await fixture();
  for (const envelopes of [null, {}, { baseline: { payload: "private" } },
    { ...f.envelopes, candidate: { ...f.envelopes.candidate, payload: "x".repeat(32769) } }]) {
    const result = await adjudicateRuntimeExperiment(f.experiment, envelopes, f.host);
    assert.equal(result.verdict, "BLOCKED");
    assert.equal(JSON.stringify(result).includes("private"), false);
  }
  for (const host of [null, { ...f.host, verifyRunReceipt: undefined }, { ...f.host, nowMs: NaN },
    { ...f.host, maxAgeMs: Infinity }, { ...f.host, maxAgeMs: 86400001 }]) {
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, host)).verdict, "BLOCKED");
  }
  assert.equal((await adjudicateRuntimeExperiment(null, f.envelopes, f.host)).verdict, "BLOCKED");
});

test("canonical signatures must bind the evaluation role, exact artifact and run times", async () => {
  for (const change of [
    r => { r.run.kind = "unrelated-work"; },
    r => { r.run.correlationId = "unrelated-run"; },
    r => { r.subject.digest.sha256 = "f".repeat(64); },
    r => { r.run.startedAt = "2026-11-05T19:57:00.000Z"; },
    r => { r.issuedAt = "2026-11-05T20:01:00.000Z"; },
  ]) {
    const f = await fixture();
    const receipt = verifyRunReceipt(f.envelopes.candidate.runner, [pem(runnerKeys.publicKey)]).receipt;
    change(receipt);
    f.envelopes.candidate.runner = signRunReceipt(receipt,
      runnerKeys.privateKey.export({ type: "pkcs8", format: "pem" }));
    assert.equal((await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host)).verdict, "BLOCKED");
  }
});

test("experiment digest is deterministic and rejects non-JSON values", async () => {
  assert.equal(await experimentDigest({ b: 2, a: 1 }), await experimentDigest({ a: 1, b: 2 }));
  await assert.rejects(experimentDigest({ a: undefined }), /JSON data/);
  await assert.rejects(experimentDigest({ a: Infinity }), /JSON data/);
  await assert.rejects(experimentDigest(new Date()), /JSON data/);
});

test("derived receipt hashes do not make preregistration circular", async () => {
  const f = await fixture(); const before = await experimentDigest(f.experiment);
  f.experiment.candidate.receipt.digest = "f".repeat(64);
  f.experiment.candidate.receipt.checker.subjectDigest = "f".repeat(64);
  assert.equal(await experimentDigest(f.experiment), before);
  const result = await adjudicateRuntimeExperiment(f.experiment, f.envelopes, f.host);
  assert.equal(result.candidateReceiptDigest, await receiptDigest(f.envelopes.candidate.payload));
});

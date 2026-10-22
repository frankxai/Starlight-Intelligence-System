#!/usr/bin/env node
/**
 * Regenerates test/fixtures/run-receipt/* for test/verify-receipt.test.ts.
 *
 *   node --import tsx tools/gen-run-receipt-fixtures.mjs
 *
 * TEST KEYS ONLY. The two Ed25519 keys below are derived from fixed public strings so the
 * fixtures are reproducible byte for byte (Ed25519 signing is deterministic). They protect
 * nothing, are committed on purpose, and must never be trusted anywhere outside these tests.
 * Only the PUBLIC halves are written to disk; the private halves exist only in this process.
 *
 * Every planted-fault envelope is signed correctly by the trusted test key, so the verifier has
 * to reject it for the structural reason being tested, not because the signature is bad.
 * The exceptions are the three faults that are about the signature itself.
 */
import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAYLOAD_TYPE, RUN_RECEIPT_PREDICATE_TYPE, STATEMENT_TYPE, keyIdOf, pae } from "../src/run-receipt.js";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "test", "fixtures", "run-receipt");
const PKCS8_ED25519_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");

function testKey(label) {
  const seed = createHash("sha256").update(`starlight run-receipt TEST KEY ${label} - not a secret`).digest();
  const priv = createPrivateKey({ key: Buffer.concat([PKCS8_ED25519_PREFIX, seed]), format: "der", type: "pkcs8" });
  const pub = createPublicKey(priv);
  return { priv, pub, keyid: keyIdOf(pub), pem: pub.export({ type: "spki", format: "pem" }) };
}

const A = testKey("A (trusted)");
const B = testKey("B (untrusted)");
const SUBJECT = "5d56f36f358a8a9c28d37beaa32f90f04158cdd3490f0dbcf5d0e293030774d2";
const EVIDENCE = "a344b51e79871c297106a92b4c7d8882e046fe1aa741688522bee360c5319a98";

function baseReceipt(key, id) {
  return {
    schema: "starlight.run-receipt.v1",
    receiptId: `rcpt_fixture_${id}`,
    issuedAt: "2026-09-21T12:00:00.000Z",
    issuer: { name: "starlight-test", keyid: key.keyid },
    run: { id: `run_fixture_${id}`, kind: "desk.brief", host: "claude-code", startedAt: "2026-09-21T11:58:00.000Z", endedAt: "2026-09-21T11:59:00.000Z" },
    subject: { name: "output.md", digest: { sha256: SUBJECT } },
    stages: [
      { name: "retrieve", status: "ok", costEur: 0.001, latencyMs: 100, inputTokens: 50, outputTokens: 10 },
      { name: "synthesize", status: "ok", costEur: 0.005, latencyMs: 500, inputTokens: 200, outputTokens: 50 },
    ],
    totals: { costEur: 0.006, latencyMs: 600, tokens: { input: 250, output: 60 } },
    decisions: [{ gate: "publish", decidedBy: "human", actorId: "test-approver", outcome: "approved", approvalRef: "mandate:test:publish", at: "2026-09-21T11:59:30.000Z" }],
    evidence: [{ kind: "source", ref: "https://example.org/doc", sha256: EVIDENCE }],
    verdict: "PASS",
  };
}

/** Sign without signRunReceipt, which refuses the very receipts these fixtures need to contain. */
function envelopeOf(statement, key) {
  const payload = Buffer.from(JSON.stringify(statement), "utf8");
  const sig = sign(null, pae(PAYLOAD_TYPE, payload), key.priv);
  return { payloadType: PAYLOAD_TYPE, payload: payload.toString("base64"), signatures: [{ keyid: key.keyid, sig: sig.toString("base64") }] };
}

/** Same shape as receiptStatement(), without its validation: faulty receipts must be representable here. */
const receiptStatement = (r) => ({
  _type: STATEMENT_TYPE,
  subject: [{ name: r.subject.name, digest: { sha256: r.subject.digest.sha256 } }],
  predicateType: RUN_RECEIPT_PREDICATE_TYPE,
  predicate: r,
});
const signed = (receipt, key = A) => envelopeOf(receiptStatement(receipt), key);
const fixtures = {};

fixtures["valid"] = signed(baseReceipt(A, "valid"));

{ // The signed statement's subject disagrees with the receipt's own subject digest.
  const statement = receiptStatement(baseReceipt(A, "subject"));
  statement.subject[0].digest.sha256 = "0".repeat(64);
  fixtures["tampered-subject-digest"] = envelopeOf(statement, A);
}
fixtures["wrong-signing-key"] = signed(baseReceipt(B, "wrongkey"), B);
{ // Valid envelope, then the signed payload is edited without re-signing.
  const env = signed(baseReceipt(A, "edited"));
  const statement = JSON.parse(Buffer.from(env.payload, "base64").toString("utf8"));
  statement.predicate.totals.costEur = 0.0001;
  statement.predicate.stages[0].costEur = 0.0001;
  env.payload = Buffer.from(JSON.stringify(statement), "utf8").toString("base64");
  fixtures["payload-edited-after-signing"] = env;
}
{
  const r = baseReceipt(A, "passfail");
  r.stages[1].status = "failed";
  fixtures["pass-verdict-with-failed-stage"] = signed(r);
}
{
  const r = baseReceipt(A, "totals");
  r.totals.costEur = 0.0001;
  fixtures["totals-cost-below-stage-sum"] = signed(r);
}
{
  const r = baseReceipt(A, "noapproval");
  delete r.decisions[0].approvalRef;
  fixtures["human-decision-without-approval-ref"] = signed(r);
}
{
  const r = baseReceipt(A, "timeorder");
  r.run.startedAt = "2026-09-21T11:59:00.000Z";
  r.run.endedAt = "2026-09-21T11:58:00.000Z";
  fixtures["ended-at-before-started-at"] = signed(r);
}
{
  const r = baseReceipt(A, "noevidencehash");
  delete r.evidence[0].sha256;
  fixtures["evidence-missing-sha256"] = signed(r);
}

mkdirSync(OUT, { recursive: true });
for (const [name, env] of Object.entries(fixtures)) writeFileSync(join(OUT, `${name}.envelope.json`), JSON.stringify(env, null, 2) + "\n");
writeFileSync(join(OUT, "pubkey.pem"), A.pem);
writeFileSync(join(OUT, "other-pubkey.pem"), B.pem);
console.log(`wrote ${Object.keys(fixtures).length} envelopes and 2 public keys to ${OUT}`);

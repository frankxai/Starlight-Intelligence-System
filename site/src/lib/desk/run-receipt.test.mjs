// node --import ./scripts/test/register.mjs --test src/lib/desk/run-receipt.test.mjs
// The public verifier must bind the named issuer to a verifying signature, like src/run-receipt.ts.
import assert from "node:assert/strict";
import { createPrivateKey, generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import { PAYLOAD_TYPE, RUN_RECEIPT_SCHEMA, keyIdOf, pae, sha256Hex, signRunReceipt, totalsFromStages, verdictFromStages, verifyRunReceipt } from "./run-receipt.ts";

function keyPair() {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  return {
    privatePem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    publicPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    keyid: keyIdOf(publicKey),
  };
}

const STAGES = [{ name: "synthesize", status: "ok", model: "m", provider: "p", inputTokens: 10, outputTokens: 5, costEur: 0.001, latencyMs: 100 }];
const receipt = () => ({
  schema: RUN_RECEIPT_SCHEMA,
  receiptId: "rcpt_site_1",
  issuedAt: "2026-09-21T10:00:00.000Z",
  issuer: { name: "desk" },
  run: { id: "run_1", kind: "desk.brief", host: "site", startedAt: "2026-09-21T09:58:00.000Z", endedAt: "2026-09-21T09:59:00.000Z" },
  subject: { name: "brief.md", digest: { sha256: sha256Hex("hello") } },
  stages: STAGES,
  totals: totalsFromStages(STAGES),
  decisions: [],
  evidence: [{ kind: "ledger", ref: "memory/_audit/x.jsonl" }],
  verdict: verdictFromStages(STAGES),
});

function resigned(issuer, signers) {
  const base = signRunReceipt(receipt(), signers[0].privatePem);
  const statement = JSON.parse(Buffer.from(base.payload, "base64").toString("utf8"));
  statement.predicate.issuer = issuer;
  const payload = Buffer.from(JSON.stringify(statement), "utf8");
  const signatures = signers.map((k) => ({ keyid: k.keyid, sig: sign(null, pae(PAYLOAD_TYPE, payload), createPrivateKey(k.privatePem)).toString("base64") }));
  return { payloadType: PAYLOAD_TYPE, payload: payload.toString("base64"), signatures };
}

test("a signed receipt verifies and reports its issuer key", () => {
  const k = keyPair();
  const result = verifyRunReceipt(signRunReceipt(receipt(), k.privatePem), [k.publicPem]);
  assert.equal(result.ok, true, result.reasons.join("; "));
  assert.equal(result.keyid, k.keyid);
});

test("a receipt without issuer.keyid is refused", () => {
  const k = keyPair();
  const result = verifyRunReceipt(resigned({ name: "claimed" }, [k]), [k.publicPem]);
  assert.equal(result.ok, false);
  assert.ok(result.reasons.some((r) => r.includes("does not name its issuer keyid")), result.reasons.join("; "));
});

test("the named issuer is found among co-signers in any order", () => {
  const a = keyPair();
  const b = keyPair();
  const result = verifyRunReceipt(resigned({ name: "a", keyid: a.keyid }, [b, a]), [a.publicPem, b.publicPem]);
  assert.equal(result.ok, true, result.reasons.join("; "));
  assert.equal(result.keyid, a.keyid);
});

test("a trusted co-signer cannot stand in for a named issuer that did not sign", () => {
  const a = keyPair();
  const b = keyPair();
  const result = verifyRunReceipt(resigned({ name: "a", keyid: a.keyid }, [b]), [a.publicPem, b.publicPem]);
  assert.equal(result.ok, false);
  assert.ok(result.reasons.some((r) => r.includes("no verifying signature is from that key")), result.reasons.join("; "));
});

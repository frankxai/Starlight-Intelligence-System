// node --test protocol/test/sign.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createHash, createPrivateKey, generateKeyPairSync, sign as edSign } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { buildReceipt } from "../conform.mjs";
import {
  pae,
  keyIdOf,
  receiptProblems,
  receiptStatement,
  signReceipt,
  verifyEnvelope,
  PAYLOAD_TYPE,
  RECEIPT_PREDICATE_TYPE,
} from "../lib/dsse.mjs";
import { recheckProfile } from "../verify.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const protocolDir = resolve(here, "..");
const fixture = (name) => join(protocolDir, "fixtures", name);

function keypair() {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  return {
    priv: privateKey.export({ type: "pkcs8", format: "pem" }),
    pub: publicKey.export({ type: "spki", format: "pem" }),
  };
}

function receiptFor(name) {
  const raw = readFileSync(fixture(name), "utf8");
  return { raw, receipt: buildReceipt({ profile: JSON.parse(raw), raw, checkedAt: "2026-09-19T00:00:00.000Z" }) };
}

test("PAE matches the DSSE v1 specification example", () => {
  assert.equal(
    pae("http://example.com/HelloWorld", "hello world").toString("utf8"),
    "DSSEv1 29 http://example.com/HelloWorld 11 hello world"
  );
});

test("PAE counts bytes, not characters", () => {
  assert.equal(pae("t", "é").toString("utf8"), "DSSEv1 1 t 2 é");
});

test("a PASS receipt signs and verifies as an in-toto statement", () => {
  const { priv, pub } = keypair();
  const { receipt } = receiptFor("valid-profile.json");
  const envelope = signReceipt(receipt, priv);
  assert.equal(envelope.payloadType, PAYLOAD_TYPE);
  assert.equal(envelope.signatures[0].keyid, keyIdOf(pub));

  const result = verifyEnvelope(envelope, [pub]);
  assert.equal(result.ok, true, result.reasons.join("; "));
  assert.equal(result.statement.predicateType, RECEIPT_PREDICATE_TYPE);
  assert.equal(result.statement.subject[0].digest.sha256, receipt.profileSha256);
});

test("a FAIL receipt is refused, not signed", () => {
  const { priv } = keypair();
  const { receipt } = receiptFor("leaky-profile.json");
  assert.equal(receipt.verdict, "FAIL");
  assert.throws(() => signReceipt(receipt, priv), /refusing to sign/);
});

test("a tampered payload does not verify", () => {
  const { priv, pub } = keypair();
  const envelope = signReceipt(receiptFor("valid-profile.json").receipt, priv);
  const statement = JSON.parse(Buffer.from(envelope.payload, "base64").toString("utf8"));
  statement.predicate.counts.nodes += 1;
  envelope.payload = Buffer.from(JSON.stringify(statement), "utf8").toString("base64");
  const result = verifyEnvelope(envelope, [pub]);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(" "), /does not verify/);
});

test("a signature from an untrusted key does not verify", () => {
  const signer = keypair();
  const stranger = keypair();
  const envelope = signReceipt(receiptFor("valid-profile.json").receipt, signer.priv);
  const result = verifyEnvelope(envelope, [stranger.pub]);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(" "), /not a trusted key/);
});

test("a forged keyid pointing at a trusted key still fails the signature check", () => {
  const signer = keypair();
  const victim = keypair();
  const envelope = signReceipt(receiptFor("valid-profile.json").receipt, signer.priv);
  envelope.signatures[0].keyid = keyIdOf(victim.pub);
  assert.equal(verifyEnvelope(envelope, [victim.pub]).ok, false);
});

test("a non-Ed25519 signing key is refused", () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  assert.throws(() => signReceipt(receiptFor("valid-profile.json").receipt, pem), /must be an Ed25519 key/);
});

test("malformed envelopes are rejected without throwing", () => {
  const { pub } = keypair();
  for (const bad of [null, {}, { payloadType: PAYLOAD_TYPE }, { payloadType: PAYLOAD_TYPE, payload: "e30=", signatures: [] }]) {
    assert.equal(verifyEnvelope(bad, [pub]).ok, false);
  }
  assert.equal(verifyEnvelope({ payloadType: PAYLOAD_TYPE, payload: "e30=", signatures: [{ keyid: "x", sig: "y" }] }, ["not a key"]).ok, false);
});

test("re-checking against the signed profile bytes agrees", () => {
  const { priv, pub } = keypair();
  const { raw, receipt } = receiptFor("valid-profile.json");
  const { statement } = verifyEnvelope(signReceipt(receipt, priv), [pub]);
  assert.deepEqual(recheckProfile(statement, raw), []);
});

test("re-checking against different profile bytes is caught", () => {
  const { priv, pub } = keypair();
  const { raw, receipt } = receiptFor("valid-profile.json");
  const { statement } = verifyEnvelope(signReceipt(receipt, priv), [pub]);
  const altered = raw.replace(/\s*$/, "\n\n");
  assert.match(recheckProfile(statement, altered).join(" "), /differs from signed/);
});

test("the CLIs sign and verify end to end, offline", () => {
  const dir = mkdtempSync(join(tmpdir(), "sip-sign-"));
  const node = process.execPath;
  const run = (args) => spawnSync(node, args, { encoding: "utf8" });

  assert.equal(run([join(protocolDir, "sign.mjs"), "keygen", dir]).status, 0);
  const receiptPath = join(dir, "receipt.json");
  assert.equal(run([join(protocolDir, "conform.mjs"), fixture("valid-profile.json"), "--json", receiptPath, "--quiet"]).status, 0);
  const envelopePath = join(dir, "receipt.dsse.json");
  assert.equal(run([join(protocolDir, "sign.mjs"), receiptPath, "--key", join(dir, "sip-signing.key"), "--out", envelopePath]).status, 0);

  const verified = run([join(protocolDir, "verify.mjs"), envelopePath, "--pub", join(dir, "sip-signing.pub"), "--profile", fixture("valid-profile.json"), "--json"]);
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);
  assert.equal(JSON.parse(verified.stdout).reChecked, true);

  // keygen never overwrites an existing signing key
  assert.equal(run([join(protocolDir, "sign.mjs"), "keygen", dir]).status, 2);

  // a FAIL receipt exits 1 from the signer
  const failPath = join(dir, "fail.json");
  run([join(protocolDir, "conform.mjs"), fixture("leaky-profile.json"), "--json", failPath, "--quiet"]);
  assert.equal(run([join(protocolDir, "sign.mjs"), failPath, "--key", join(dir, "sip-signing.key")]).status, 1);

  writeFileSync(join(dir, ".done"), "");
});

// ── Review hardening (PR #166) ──────────────────────────────────────────────


function signRaw(statement, priv, keyid) {
  const payload = Buffer.from(JSON.stringify(statement), "utf8");
  const sig = edSign(null, pae(PAYLOAD_TYPE, payload), createPrivateKey(priv)).toString("base64");
  return { payloadType: PAYLOAD_TYPE, payload: payload.toString("base64"), signatures: [{ keyid, sig }] };
}

test("a hand-edited receipt that claims PASS without passing rules is refused", () => {
  const { priv } = keypair();
  const { receipt } = receiptFor("leaky-profile.json");
  const edited = { ...receipt, verdict: "PASS" };
  assert.throws(() => signReceipt(edited, priv), /refusing to sign: rules not passing/);
  const bare = { verdict: "PASS", profileSha256: receipt.profileSha256, subject: "x" };
  assert.throws(() => signReceipt(bare, priv), /refusing to sign/);
  assert.ok(receiptProblems(bare).includes("receipt lists no rules"));
});

test("a signed but incomplete receipt is not shown as verified", () => {
  const { priv, pub } = keypair();
  const { receipt } = receiptFor("valid-profile.json");
  const partial = { verdict: "PASS", profileSha256: receipt.profileSha256, subject: "x" };
  const envelope = signRaw(receiptStatement(partial), priv, keyIdOf(pub));
  const result = verifyEnvelope(envelope, [pub]);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(" "), /not a complete PASS/);
});

test("recheckProfile reports a malformed predicate instead of throwing", () => {
  assert.deepEqual(recheckProfile({ predicate: { verdict: "PASS" } }, Buffer.from("{}")), [
    "signed receipt is malformed (no rules or profileSha256)",
  ]);
});

test("a signature without a keyid verifies against any trusted key", () => {
  const { priv, pub } = keypair();
  const envelope = signReceipt(receiptFor("valid-profile.json").receipt, priv);
  delete envelope.signatures[0].keyid;
  assert.equal(verifyEnvelope(envelope, [keypair().pub, pub]).ok, true);
});

test("verifyEnvelope refuses a non-list of trusted keys without throwing", () => {
  const { priv } = keypair();
  const envelope = signReceipt(receiptFor("valid-profile.json").receipt, priv);
  assert.equal(verifyEnvelope(envelope, undefined).ok, false);
});

test("profileSha256 is the sha256 of the file bytes, as sha256sum computes it", () => {
  const dir = mkdtempSync(join(tmpdir(), "sip-bytes-"));
  const out = join(dir, "r.json");
  spawnSync(process.execPath, [join(protocolDir, "conform.mjs"), fixture("valid-profile.json"), "--json", out, "--quiet"]);
  const expected = createHash("sha256").update(readFileSync(fixture("valid-profile.json"))).digest("hex");
  assert.equal(JSON.parse(readFileSync(out, "utf8")).profileSha256, expected);
});

test("keygen ignores its own private key in git", () => {
  const dir = mkdtempSync(join(tmpdir(), "sip-keygen-"));
  assert.equal(spawnSync(process.execPath, [join(protocolDir, "sign.mjs"), "keygen", dir]).status, 0);
  assert.ok(existsSync(join(dir, ".gitignore")));
  assert.match(readFileSync(join(dir, ".gitignore"), "utf8"), /^sip-signing\.key$/m);
});

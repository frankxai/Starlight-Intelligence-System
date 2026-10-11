// DSSE envelopes around in-toto Statements, signed with Ed25519.
//
// Formats, not inventions:
//   DSSE v1        https://github.com/secure-systems-lab/dsse/blob/master/protocol.md
//   in-toto v1     https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md
//
// No I/O, no dependencies beyond node:crypto.

import { KeyObject, createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

export const STATEMENT_TYPE = "https://in-toto.io/Statement/v1";
export const PAYLOAD_TYPE = "application/vnd.in-toto+json";
export const RECEIPT_PREDICATE_TYPE = "https://starlightintelligence.org/protocol/receipt/v0.1.0";

/** DSSE pre-authentication encoding. Lengths are byte lengths, in ASCII decimal. */
export function pae(payloadType, payload) {
  const type = Buffer.from(payloadType, "utf8");
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, "utf8");
  return Buffer.concat([
    Buffer.from(`DSSEv1 ${type.length} `, "utf8"),
    type,
    Buffer.from(` ${body.length} `, "utf8"),
    body,
  ]);
}

/** keyid = sha256 of the public key's SPKI DER, hex. Stable across PEM formatting. */
export function keyIdOf(publicKey) {
  const key = publicKey instanceof KeyObject && publicKey.type === "public" ? publicKey : createPublicKey(publicKey);
  const der = key.export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex");
}

function assertEd25519(key, label) {
  if (key.asymmetricKeyType !== "ed25519") {
    throw new Error(`${label} must be an Ed25519 key, got ${key.asymmetricKeyType ?? "unknown"}`);
  }
  return key;
}

/**
 * Wrap a conformance receipt in an in-toto Statement. The subject digest is the
 * profile's sha256, so the statement names exactly the bytes that were checked.
 */
export function receiptStatement(receipt) {
  if (!/^[0-9a-f]{64}$/.test(receipt?.profileSha256 ?? "")) {
    throw new Error("receipt has no valid profileSha256");
  }
  return {
    _type: STATEMENT_TYPE,
    subject: [
      {
        name: receipt.subject ?? receipt.profileId ?? "sip-graph-profile",
        digest: { sha256: receipt.profileSha256 },
      },
    ],
    predicateType: RECEIPT_PREDICATE_TYPE,
    predicate: receipt,
  };
}

/**
 * What is wrong with a receipt, structurally. An empty list means it is a
 * complete PASS receipt as conform.mjs emits it: every rule present and passing.
 * Checked on both sides so a hand-edited or half-built receipt is neither
 * signed nor shown as verified.
 */
export function receiptProblems(receipt) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) return ["receipt is not an object"];
  const problems = [];
  if (receipt.receiptVersion !== "0.1.0") problems.push(`receiptVersion is ${JSON.stringify(receipt.receiptVersion)}`);
  if (!/^sip-conform@\d+\.\d+\.\d+$/.test(receipt.tool ?? "")) problems.push("tool does not name a sip-conform version");
  if (typeof receipt.checkedAt !== "string" || Number.isNaN(Date.parse(receipt.checkedAt))) problems.push("checkedAt is not a date-time");
  if (!/^[0-9a-f]{64}$/.test(receipt.profileSha256 ?? "")) problems.push("profileSha256 is not a sha256");
  if (!Array.isArray(receipt.rules) || receipt.rules.length === 0) {
    problems.push("receipt lists no rules");
  } else {
    const failed = receipt.rules.filter((r) => r?.status !== "pass").map((r) => r?.id ?? "?");
    if (failed.length) problems.push(`rules not passing: ${failed.join(", ")}`);
  }
  if (receipt.verdict !== "PASS") problems.push(`verdict is ${receipt.verdict ?? "missing"}`);
  return problems;
}

/**
 * Sign a receipt. Refuses anything but a complete PASS receipt: a signature is
 * a statement that the work passed, and SIP does not let a signer vouch for
 * work that did not. (The key holder can still sign what they like with other
 * tools; the defence against that is verify --profile, which re-runs the check.)
 */
export function signReceipt(receipt, privateKeyPem) {
  const problems = receiptProblems(receipt);
  if (problems.length) throw new Error(`refusing to sign: ${problems.join("; ")}`);
  const privateKey = assertEd25519(createPrivateKey(privateKeyPem), "signing key");
  const publicKey = createPublicKey(privateKey);
  const payload = Buffer.from(JSON.stringify(receiptStatement(receipt)), "utf8");
  const sig = sign(null, pae(PAYLOAD_TYPE, payload), privateKey);
  return {
    payloadType: PAYLOAD_TYPE,
    payload: payload.toString("base64"),
    signatures: [{ keyid: keyIdOf(publicKey), sig: sig.toString("base64") }],
  };
}

/**
 * Verify an envelope against a set of trusted Ed25519 public keys.
 * Returns { ok, reasons, keyid, statement }. Never throws on bad input.
 */
export function verifyEnvelope(envelope, trustedPublicKeys) {
  const reasons = [];
  const fail = (reason) => ({ ok: false, reasons: [...reasons, reason], keyid: null, statement: null });

  if (!envelope || typeof envelope !== "object") return fail("envelope is not an object");
  if (envelope.payloadType !== PAYLOAD_TYPE) {
    return fail(`payloadType is ${JSON.stringify(envelope.payloadType)}, expected ${PAYLOAD_TYPE}`);
  }
  if (typeof envelope.payload !== "string") return fail("payload is missing");
  if (!Array.isArray(envelope.signatures) || envelope.signatures.length === 0) {
    return fail("envelope carries no signatures");
  }

  if (!Array.isArray(trustedPublicKeys)) return fail("trusted keys must be a list");
  const trusted = new Map();
  for (const pem of trustedPublicKeys) {
    try {
      const key = assertEd25519(createPublicKey(pem), "trusted key");
      trusted.set(keyIdOf(key), key);
    } catch (err) {
      return fail(`trusted key is unusable: ${err.message}`);
    }
  }
  if (trusted.size === 0) return fail("no trusted keys supplied");

  const payload = Buffer.from(envelope.payload, "base64");
  const message = pae(envelope.payloadType, payload);

  let signedBy = null;
  const verifies = (key, sig) => {
    try {
      return verify(null, message, key, Buffer.from(String(sig), "base64"));
    } catch {
      return false;
    }
  };
  for (const s of envelope.signatures) {
    if (!s || typeof s !== "object") continue;
    // DSSE keyid is an optional hint: without one, try every trusted key.
    const candidates = s.keyid ? [[s.keyid, trusted.get(s.keyid)]] : [...trusted.entries()];
    if (s.keyid && !trusted.has(s.keyid)) {
      reasons.push(`signature keyid ${String(s.keyid).slice(0, 16)}… is not a trusted key`);
      continue;
    }
    const match = candidates.find(([, key]) => verifies(key, s.sig));
    if (match) {
      signedBy = match[0];
      break;
    }
    reasons.push(`signature${s.keyid ? ` by ${String(s.keyid).slice(0, 16)}…` : " without keyid"} does not verify`);
  }
  if (!signedBy) return fail("no signature verifies against a trusted key");

  let statement;
  try {
    statement = JSON.parse(payload.toString("utf8"));
  } catch {
    return fail("payload is not JSON");
  }
  if (statement._type !== STATEMENT_TYPE) return fail(`statement _type is ${JSON.stringify(statement._type)}`);
  if (statement.predicateType !== RECEIPT_PREDICATE_TYPE) {
    return fail(`predicateType is ${JSON.stringify(statement.predicateType)}`);
  }
  const digest = statement.subject?.[0]?.digest?.sha256;
  if (digest !== statement.predicate?.profileSha256) {
    return fail("subject digest does not match the receipt's profileSha256");
  }
  const problems = receiptProblems(statement.predicate);
  if (problems.length) return fail(`signed receipt is not a complete PASS: ${problems.join("; ")}`);

  return { ok: true, reasons, keyid: signedBy, statement };
}

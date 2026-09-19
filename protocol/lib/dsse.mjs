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
 * Sign a receipt. Refuses a FAIL receipt: a signature is a statement that the
 * work passed, and SIP does not let a signer vouch for work that did not.
 */
export function signReceipt(receipt, privateKeyPem) {
  if (receipt?.verdict !== "PASS") {
    throw new Error(`refusing to sign a receipt whose verdict is ${receipt?.verdict ?? "missing"}`);
  }
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
  for (const s of envelope.signatures) {
    const key = trusted.get(s?.keyid);
    if (!key) {
      reasons.push(`signature keyid ${String(s?.keyid).slice(0, 16)}… is not a trusted key`);
      continue;
    }
    let valid = false;
    try {
      valid = verify(null, message, key, Buffer.from(String(s.sig), "base64"));
    } catch {
      valid = false;
    }
    if (valid) {
      signedBy = s.keyid;
      break;
    }
    reasons.push(`signature by ${s.keyid.slice(0, 16)}… does not verify`);
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
  if (statement.predicate?.verdict !== "PASS") return fail("signed receipt is not a PASS");

  return { ok: true, reasons, keyid: signedBy, statement };
}

/**
 * Starlight Sovereign Intelligence Protocol (SIP)
 * Offline Ed25519 Cryptographic License & Entitlement Verifier
 *
 * Provides air-gapped, zero-network license validation for sovereign builders.
 * Allows local CLIs and daemon runtimes to verify active subscription packs,
 * enterprise estate privileges, and feature access without calling home or
 * leaking operator telemetry.
 *
 * Built on SIP — Sovereign Substrate.
 */

import { generateKeyPairSync, sign, verify, createPublicKey } from "node:crypto";

export type LicenseTier = "free" | "supporter" | "sovereign_plus" | "estate";

export interface LicenseClaims {
  /** Unique license identifier */
  licenseId: string;
  /** Licensed entity (GitHub handle, email, or cryptographic public key) */
  licensedTo: string;
  /** Commercial subscription tier */
  tier: LicenseTier;
  /** Allowed modular pack IDs */
  allowedPacks: string[];
  /** Expiration timestamp in ISO 8601 or 'never' for lifetime supporters */
  expiresAt: string;
  /** Issued timestamp in ISO 8601 */
  issuedAt: string;
  /** Ambient protocol attestation */
  attestation: "Built on SIP";
}

export interface LicenseReceipt {
  version: "1.0";
  claims: LicenseClaims;
  /** Hex-encoded Ed25519 signature over normalized claims JSON */
  signature: string;
}

export interface VerificationResult {
  valid: boolean;
  claims?: LicenseClaims;
  error?: string;
}

/**
 * Normalizes claims object to a deterministic canonical JSON string
 * with sorted keys for reproducible signing and verification.
 */
export function canonicalizeClaims(claims: LicenseClaims): string {
  const sortedKeys = Object.keys(claims).sort() as Array<keyof LicenseClaims>;
  const normalized: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    const val = claims[key];
    if (Array.isArray(val)) {
      normalized[key] = [...val].sort();
    } else {
      normalized[key] = val;
    }
  }
  return JSON.stringify(normalized);
}

/**
 * Signs a license claim using the authority's private Ed25519 key (PEM format).
 * Used by Starlight release infrastructure / billing webhooks (Polar, Stripe, on-chain).
 */
export function signLicenseClaims(claims: LicenseClaims, authorityPrivateKeyPem: string): LicenseReceipt {
  const canonical = canonicalizeClaims(claims);
  const signatureBuffer = sign(null, Buffer.from(canonical, "utf-8"), authorityPrivateKeyPem);
  return {
    version: "1.0",
    claims,
    signature: signatureBuffer.toString("hex"),
  };
}

/**
 * Verifies a license receipt completely offline against the authority's public Ed25519 key.
 *
 * Checks:
 * 1. Ambient 'Built on SIP' attestation invariant.
 * 2. Cryptographic signature validity over canonicalized payload.
 * 3. Expiration date against current time.
 */
export function verifyLicenseReceipt(
  receipt: LicenseReceipt,
  authorityPublicKeyPem: string,
  nowIso?: string
): VerificationResult {
  try {
    if (!receipt || !receipt.claims || !receipt.signature) {
      return { valid: false, error: "Malformed license receipt structure." };
    }

    if (receipt.version !== "1.0") {
      return { valid: false, error: `Unsupported license receipt version: ${receipt.version}` };
    }

    if (receipt.claims.attestation !== "Built on SIP") {
      return { valid: false, error: "Non-compliant attestation: license must carry 'Built on SIP'." };
    }

    // Expiration check
    if (receipt.claims.expiresAt !== "never") {
      const now = nowIso ? new Date(nowIso) : new Date();
      const expires = new Date(receipt.claims.expiresAt);
      if (isNaN(expires.getTime())) {
        return { valid: false, error: "Invalid expiresAt date format." };
      }
      if (now.getTime() > expires.getTime()) {
        return { valid: false, error: `License expired on ${receipt.claims.expiresAt}` };
      }
    }

    // Verify cryptographic Ed25519 signature
    const canonical = canonicalizeClaims(receipt.claims);
    const isValid = verify(
      null,
      Buffer.from(canonical, "utf-8"),
      createPublicKey(authorityPublicKeyPem),
      Buffer.from(receipt.signature, "hex")
    );

    if (!isValid) {
      return { valid: false, error: "Invalid cryptographic signature: tampered license." };
    }

    return { valid: true, claims: receipt.claims };
  } catch (err) {
    return { valid: false, error: `Verification failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Helper to generate a new Ed25519 authority keypair (for testing or root authority rotation).
 */
export function generateAuthorityKeyPair(): { publicKey: string; privateKey: string } {
  return generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
}

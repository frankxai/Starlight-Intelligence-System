/**
 * Starlight Sovereign Intelligence Protocol (SIP)
 * Test Suite: Offline Ed25519 Cryptographic License Verification
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateAuthorityKeyPair,
  signLicenseClaims,
  verifyLicenseReceipt,
  type LicenseClaims,
} from "../src/licensing/ed25519-verifier.js";

describe("Ed25519 Offline Cryptographic Licensing", () => {
  const authority = generateAuthorityKeyPair();

  const validClaims: LicenseClaims = {
    licenseId: "lic_948f2b7190",
    licensedTo: "frankxai",
    tier: "sovereign_plus",
    allowedPacks: [
      "durable-blockchain-vault-pack",
      "robot-fleet-continuity-pack",
      "starlight-queen-orchestrator-pack",
    ],
    issuedAt: "2026-10-11T12:00:00.000Z",
    expiresAt: "2027-10-11T12:00:00.000Z",
    attestation: "Built on SIP",
  };

  it("successfully signs and verifies a valid subscription license offline", () => {
    const receipt = signLicenseClaims(validClaims, authority.privateKey);
    const result = verifyLicenseReceipt(receipt, authority.publicKey, "2026-10-11T14:00:00.000Z");

    assert.equal(result.valid, true);
    assert.deepEqual(result.claims?.tier, "sovereign_plus");
    assert.equal(result.claims?.allowedPacks.length, 3);
  });

  it("verifies lifetime supporter licenses with expiresAt: 'never'", () => {
    const lifetimeClaims: LicenseClaims = {
      ...validClaims,
      tier: "supporter",
      expiresAt: "never",
    };
    const receipt = signLicenseClaims(lifetimeClaims, authority.privateKey);
    const result = verifyLicenseReceipt(receipt, authority.publicKey, "2035-01-01T00:00:00.000Z");

    assert.equal(result.valid, true);
    assert.equal(result.claims?.expiresAt, "never");
  });

  it("rejects licenses where claims have been tampered with", () => {
    const receipt = signLicenseClaims(validClaims, authority.privateKey);
    // Maliciously escalate tier to 'estate'
    const tamperedReceipt = {
      ...receipt,
      claims: {
        ...receipt.claims,
        tier: "estate" as const,
      },
    };

    const result = verifyLicenseReceipt(tamperedReceipt, authority.publicKey, "2026-10-11T14:00:00.000Z");
    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Invalid cryptographic signature/);
  });

  it("fails closed on expired licenses", () => {
    const expiredClaims: LicenseClaims = {
      ...validClaims,
      expiresAt: "2026-09-01T00:00:00.000Z",
    };
    const receipt = signLicenseClaims(expiredClaims, authority.privateKey);
    const result = verifyLicenseReceipt(receipt, authority.publicKey, "2026-10-11T14:00:00.000Z");

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /License expired on/);
  });

  it("rejects licenses missing 'Built on SIP' attestation", () => {
    const nonAttestedClaims = {
      ...validClaims,
      attestation: "Unsanctioned Fork" as any,
    };
    const receipt = signLicenseClaims(nonAttestedClaims, authority.privateKey);
    const result = verifyLicenseReceipt(receipt, authority.publicKey, "2026-10-11T14:00:00.000Z");

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Non-compliant attestation/);
  });
});

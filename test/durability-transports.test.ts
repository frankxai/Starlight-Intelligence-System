import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SovereignEnvelopeEncryption,
  type EncryptedVaultEnvelope,
} from "../src/durability/envelope.js";
import {
  SovereignStorageDispatcher,
  IrysArweaveTransport,
  PinataIpfsTransport,
} from "../src/durability/transports.js";
import type { VaultSnapshotItem } from "../src/durability/blockchain-anchor.js";

const mockItems: VaultSnapshotItem[] = [
  {
    id: "item-1",
    vault: "strategic",
    content: "Establish sovereign foundation with zero vendor lock-in.",
    timestamp: "2026-10-10T12:00:00Z",
    tags: ["core", "sovereign"],
  },
  {
    id: "item-2",
    vault: "horizon",
    content: "Continuous autonomous agent fleet operating with fail-closed safety.",
    timestamp: "2026-10-10T12:05:00Z",
    tags: ["horizon", "fleet"],
  },
];

describe("Sovereign Durability — Envelope Encryption & Transports", () => {
  it("encrypts snapshot into Zero-Knowledge AES-256-GCM envelope and decrypts with valid passphrase", () => {
    const passphrase = "super-secret-sovereign-master-passphrase-2026";
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);

    assert.equal(envelope.algorithm, "AES-256-GCM");
    assert.equal(envelope.kdf, "PBKDF2-SHA256");
    assert.equal(envelope.attestation, "Built on SIP");
    assert.equal(envelope.itemCount, 2);
    assert.ok(envelope.merkleRoot);
    assert.ok(envelope.ciphertext);
    assert.ok(envelope.saltHex);
    assert.ok(envelope.ivHex);
    assert.ok(envelope.authTagHex);

    // Decrypt
    const decrypted = SovereignEnvelopeEncryption.decryptSnapshot(envelope, passphrase);
    assert.equal(decrypted.length, 2);
    assert.equal(decrypted[0].id, "item-1");
    assert.equal(decrypted[0].content, mockItems[0].content);
    assert.equal(decrypted[1].id, "item-2");
  });

  it("fails closed on invalid passphrase or tampered envelope", () => {
    const passphrase = "correct-passphrase";
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);

    // Wrong passphrase
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(envelope, "wrong-passphrase"),
      /Decryption failed/
    );

    // Tampered attestation
    const tampered = { ...envelope, attestation: "Not Valid" as any };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(tampered, passphrase),
      /missing Built on SIP attestation/
    );
  });

  it("dispatches unencrypted snapshot via SovereignStorageDispatcher to Arweave", async () => {
    const result = await SovereignStorageDispatcher.dispatchSnapshot(mockItems, {
      provider: "irys-arweave",
    });

    assert.equal(result.isEncrypted, false);
    assert.equal(result.receipt.attestation, "Built on SIP");
    assert.equal(result.receipt.itemCount, 2);
    assert.ok(result.upload.contentIdentifier.startsWith("ar://"));
    assert.ok(result.upload.gatewayUrl.includes("arweave.net"));
  });

  it("dispatches encrypted snapshot via SovereignStorageDispatcher to Pinata IPFS", async () => {
    const passphrase = "pinata-zk-passphrase";
    const result = await SovereignStorageDispatcher.dispatchSnapshot(mockItems, {
      provider: "pinata-ipfs",
      passphrase,
    });

    assert.equal(result.isEncrypted, true);
    assert.ok(result.envelope);
    assert.equal(result.envelope?.algorithm, "AES-256-GCM");
    assert.ok(result.upload.contentIdentifier.startsWith("bafybeic"));
    assert.ok(result.upload.gatewayUrl.includes("ipfs.io"));
  });
});

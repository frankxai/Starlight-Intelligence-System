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

  it("handles boundary condition: empty vault array encryption and decryption", () => {
    const passphrase = "empty-vault-passphrase";
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot([], passphrase);
    assert.equal(envelope.itemCount, 0);

    const decrypted = SovereignEnvelopeEncryption.decryptSnapshot(envelope, passphrase);
    assert.equal(decrypted.length, 0);
  });

  it("handles complex Unicode, emoji, and special characters payload in zero-knowledge envelope", () => {
    const unicodeItems: VaultSnapshotItem[] = [
      {
        id: "unicode-1",
        vault: "horizon",
        content: "✨ Sovereignty & Durability • 🌟 🚀 零知識加密 🔒",
        timestamp: "2026-10-10T15:00:00Z",
        tags: ["✨", "unicode", "日本語"],
      },
    ];
    const passphrase = "unicode-key-🔑";
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(unicodeItems, passphrase);
    const decrypted = SovereignEnvelopeEncryption.decryptSnapshot(envelope, passphrase);

    assert.equal(decrypted.length, 1);
    assert.equal(decrypted[0].content, unicodeItems[0].content);
    assert.deepEqual(decrypted[0].tags, unicodeItems[0].tags);
  });

  it("detects ciphertext, IV, authTag, salt, or merkleRoot tampering on envelope decryption", () => {
    const passphrase = "tamper-proof-passphrase";
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);

    // Tampered authTag
    const badAuthTag = { ...envelope, authTagHex: "00".repeat(16) };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(badAuthTag, passphrase),
      /Decryption failed/
    );

    // Tampered IV
    const badIV = { ...envelope, ivHex: "11".repeat(12) };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(badIV, passphrase),
      /Decryption failed/
    );

    // Tampered Merkle Root
    const badMerkleRoot = { ...envelope, merkleRoot: "a".repeat(64) };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(badMerkleRoot, passphrase),
      /Merkle root mismatch/
    );
  });

  it("dispatches with explicit tier target (managed_cloud vs blockchain_anchored)", async () => {
    const cloudResult = await SovereignStorageDispatcher.dispatchSnapshot(mockItems, {
      provider: "pinata-ipfs",
      targetTier: "managed_cloud",
    });
    assert.equal(cloudResult.receipt.durabilityTier, "managed_cloud");

    const chainResult = await SovereignStorageDispatcher.dispatchSnapshot(mockItems, {
      provider: "irys-arweave",
      targetTier: "blockchain_anchored",
    });
    assert.equal(chainResult.receipt.durabilityTier, "blockchain_anchored");
  });

  it("operates IrysArweaveTransport and PinataIpfsTransport in offline deterministic mode when credentials are not set", async () => {
    const origKey = process.env.IRYS_PRIVATE_KEY;
    const origJwk = process.env.ARWEAVE_JWK;
    const origPinata = process.env.PINATA_JWT;

    delete process.env.IRYS_PRIVATE_KEY;
    delete process.env.ARWEAVE_JWK;
    delete process.env.PINATA_JWT;

    try {
      const irys = new IrysArweaveTransport();
      assert.equal(irys.isLive(), false);
      const irysUpload = await irys.upload(JSON.stringify(mockItems), { name: "test" });
      assert.equal(irysUpload.isLive, false);
      assert.equal(irysUpload.provider, "irys-arweave");
      assert.ok(irysUpload.contentIdentifier.startsWith("ar://"));

      const pinata = new PinataIpfsTransport();
      assert.equal(pinata.isLive(), false);
      const pinataUpload = await pinata.upload(JSON.stringify(mockItems), { name: "test" });
      assert.equal(pinataUpload.isLive, false);
      assert.equal(pinataUpload.provider, "pinata-ipfs");
      assert.ok(pinataUpload.contentIdentifier.startsWith("bafybeic"));
    } finally {
      if (origKey) process.env.IRYS_PRIVATE_KEY = origKey;
      if (origJwk) process.env.ARWEAVE_JWK = origJwk;
      if (origPinata) process.env.PINATA_JWT = origPinata;
    }
  });
});

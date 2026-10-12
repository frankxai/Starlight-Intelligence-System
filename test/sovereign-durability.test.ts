/**
 * Sovereign Durability & Blockchain Anchor Test Suite
 * Exhaustive Tier 1, Tier 2, and Tier 3 durability unit and integration tests.
 * Built on SIP — Substrate Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SovereignBlockchainAnchor } from "../src/durability/blockchain-anchor.js";
import type { VaultSnapshotItem } from "../src/durability/blockchain-anchor.js";
import { SovereignEnvelopeEncryption } from "../src/durability/envelope.js";
import { SovereignStorageDispatcher } from "../src/durability/transports.js";
import { runHorizonAnchor } from "../tools/anchor-horizon.js";

describe("Sovereign Durability — Tier 1: Sovereign Local & Boundary Invariants", () => {
  const sampleItems: VaultSnapshotItem[] = [
    {
      id: "item_1",
      vault: "horizon",
      content: "Human values must persist across generations of intelligence.",
      timestamp: "2026-10-10T00:00:00Z",
      tags: ["alignment", "benevolence"],
    },
    {
      id: "item_2",
      vault: "strategic",
      content: "Sovereignty before convenience. Never bend for vendor lock-in.",
      timestamp: "2026-10-10T01:00:00Z",
      tags: ["governance", "invariants"],
    },
  ];

  it("computes deterministic Merkle root across identical inputs", () => {
    const hashes = sampleItems.map((i) => SovereignBlockchainAnchor.hashItem(i));
    const root1 = SovereignBlockchainAnchor.computeMerkleRoot(hashes);
    const root2 = SovereignBlockchainAnchor.computeMerkleRoot(hashes);
    assert.equal(root1, root2);
    assert.match(root1, /^[a-f0-9]{64}$/);
  });

  it("handles empty vault snapshot boundary without throwing", () => {
    const root = SovereignBlockchainAnchor.computeMerkleRoot([]);
    assert.match(root, /^[a-f0-9]{64}$/);

    const receipt = SovereignBlockchainAnchor.anchorSnapshot([], "arweave", "local");
    assert.equal(receipt.itemCount, 0);
    assert.equal(receipt.durabilityTier, "local");
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt, []), true);
  });

  it("handles single-item vault snapshot boundary", () => {
    const single = [sampleItems[0]];
    const hash = SovereignBlockchainAnchor.hashItem(single[0]);
    const root = SovereignBlockchainAnchor.computeMerkleRoot([hash]);
    assert.equal(root, hash);

    const receipt = SovereignBlockchainAnchor.anchorSnapshot(single, "ipfs", "local");
    assert.equal(receipt.itemCount, 1);
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt, single), true);
  });

  it("sorts tags deterministically during item hashing", () => {
    const itemA: VaultSnapshotItem = {
      id: "test",
      vault: "technical",
      content: "Code safety",
      timestamp: "2026-01-01T00:00:00Z",
      tags: ["beta", "alpha", "gamma"],
    };
    const itemB: VaultSnapshotItem = {
      ...itemA,
      tags: ["gamma", "alpha", "beta"],
    };
    assert.equal(
      SovereignBlockchainAnchor.hashItem(itemA),
      SovereignBlockchainAnchor.hashItem(itemB)
    );
  });

  it("anchors snapshot and produces verifiable receipt with Built on SIP", () => {
    const receipt = SovereignBlockchainAnchor.anchorSnapshot(sampleItems, "arweave", "blockchain_anchored");
    assert.equal(receipt.protocol, "SIP/v1.0");
    assert.equal(receipt.attestation, "Built on SIP");
    assert.equal(receipt.itemCount, 2);
    assert.equal(receipt.verified, true);
    assert.match(receipt.contentIdentifier, /^ar:\/\/[a-f0-9]{42}$/);

    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt, sampleItems), true);
  });

  it("rejects receipt verification if items are tampered with or attestation is invalid", () => {
    const receipt = SovereignBlockchainAnchor.anchorSnapshot(sampleItems, "arweave", "blockchain_anchored");
    const tampered = [
      ...sampleItems,
      {
        id: "item_fake",
        vault: "horizon" as const,
        content: "Malicious injection",
        timestamp: "2026-10-10T02:00:00Z",
        tags: ["fake"],
      },
    ];
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt, tampered), false);

    const badAttestationReceipt = { ...receipt, attestation: "Invalid" };
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(badAttestationReceipt, sampleItems), false);
  });
});

describe("Sovereign Durability — Tier 2: Managed Cloud & ZK Envelope Encryption", () => {
  const mockItems: VaultSnapshotItem[] = [
    {
      id: "cloud_1",
      vault: "strategic",
      content: "Multi-region encrypted cloud backup.",
      timestamp: "2026-10-10T10:00:00Z",
      tags: ["cloud", "backup"],
    },
    {
      id: "cloud_2",
      vault: "wisdom",
      content: "Continuous state replication with zero-knowledge invariants.",
      timestamp: "2026-10-10T10:05:00Z",
      tags: ["wisdom", "replication"],
    },
  ];
  const passphrase = "starlight-managed-cloud-secret-key-2026";

  it("encrypts snapshot into ZK AES-256-GCM envelope preserving plaintext Merkle root", () => {
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);
    assert.equal(envelope.version, "1.0");
    assert.equal(envelope.algorithm, "AES-256-GCM");
    assert.equal(envelope.kdf, "PBKDF2-SHA256");
    assert.equal(envelope.attestation, "Built on SIP");
    assert.equal(envelope.itemCount, 2);
    assert.match(envelope.merkleRoot, /^[a-f0-9]{64}$/);

    const decrypted = SovereignEnvelopeEncryption.decryptSnapshot(envelope, passphrase);
    assert.equal(decrypted.length, 2);
    assert.equal(decrypted[0].id, "cloud_1");
  });

  it("fails closed on invalid passphrase", () => {
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(envelope, "wrong-password"),
      /Decryption failed/
    );
  });

  it("fails closed on corrupted ciphertext or modified auth tag", () => {
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);
    
    // Modify ciphertext
    const corruptedCiphertext = { ...envelope, ciphertext: "AAAA" + envelope.ciphertext.slice(4) };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(corruptedCiphertext, passphrase),
      /Decryption failed/
    );

    // Modify auth tag
    const corruptedTag = { ...envelope, authTagHex: "00".repeat(16) };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(corruptedTag, passphrase),
      /Decryption failed/
    );
  });

  it("fails closed when attestation is missing or invalid", () => {
    const envelope = SovereignEnvelopeEncryption.encryptSnapshot(mockItems, passphrase);
    const tampered = { ...envelope, attestation: "Untrusted" as any };
    assert.throws(
      () => SovereignEnvelopeEncryption.decryptSnapshot(tampered, passphrase),
      /missing Built on SIP attestation/
    );
  });
});

describe("Sovereign Durability — Tier 3: Blockchain-Anchored Permanence & Proofs", () => {
  const items: VaultSnapshotItem[] = Array.from({ length: 5 }, (_, i) => ({
    id: `item_${i}`,
    vault: i % 2 === 0 ? "horizon" : "wisdom",
    content: `State anchor payload node ${i}`,
    timestamp: `2026-10-10T12:0${i}:00Z`,
    tags: [`tier3`, `index_${i}`],
  }));

  it("dispatches snapshot across custom storage targets and tiers", async () => {
    const result = await SovereignStorageDispatcher.dispatchSnapshot(items, {
      provider: "pinata-ipfs",
      storageTarget: "filecoin",
      targetTier: "blockchain_anchored",
      passphrase: "zk-dispatch-pass",
    });

    assert.equal(result.isEncrypted, true);
    assert.equal(result.receipt.storageTarget, "filecoin");
    assert.equal(result.receipt.durabilityTier, "blockchain_anchored");
    assert.equal(result.receipt.itemCount, 5);
    assert.ok(result.envelope);
  });

  it("generates and verifies selective disclosure Merkle proof for all positions in odd tree", () => {
    for (let idx = 0; idx < items.length; idx++) {
      const proof = SovereignBlockchainAnchor.generateMerkleProof(items, idx, `proof_${idx}`);
      assert.equal(proof.itemIndex, idx);
      assert.equal(proof.verified, true);

      // Verify receipt proof checking logic directly
      const valid = SovereignBlockchainAnchor.verifyMerkleProof(
        proof.itemHash,
        proof.proofPath,
        proof.merkleRoot
      );
      assert.equal(valid, true);

      // Tampered item hash fails proof verification
      const invalid = SovereignBlockchainAnchor.verifyMerkleProof(
        "00".repeat(32),
        proof.proofPath,
        proof.merkleRoot
      );
      assert.equal(invalid, false);
    }
  });

  it("throws out-of-range error when requesting proof for invalid index", () => {
    assert.throws(
      () => SovereignBlockchainAnchor.generateMerkleProof(items, -1),
      /out of range/
    );
    assert.throws(
      () => SovereignBlockchainAnchor.generateMerkleProof(items, 99),
      /out of range/
    );
  });

  it("executes runHorizonAnchor tool end-to-end and persists audit receipt", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "starlight-horizon-test-"));
    try {
      const memoryDir = join(tmpDir, "memory", "vaults");
      mkdirSync(memoryDir, { recursive: true });

      const vaultContent = `
# Horizon Vault

### [2026-10-12] — Sovereign Intelligence Alignment
We ensure benevolent human value persistence across all autonomous agent tiers.
**Tags:** horizon, alignment, permanence
`;
      writeFileSync(join(memoryDir, "horizon-vault.md"), vaultContent, "utf-8");

      const receipt = runHorizonAnchor(tmpDir);
      assert.equal(receipt.protocol, "SIP/v1.0");
      assert.equal(receipt.attestation, "Built on SIP");
      assert.equal(receipt.itemCount, 1);
      assert.equal(receipt.verified, true);

      // Verify audit log file was written
      const auditFile = join(tmpDir, "memory", "_audit", "blockchain-anchors.jsonl");
      assert.equal(existsSync(auditFile), true);
      const auditLines = readFileSync(auditFile, "utf-8").trim().split("\n");
      assert.equal(auditLines.length, 1);
      const loggedReceipt = JSON.parse(auditLines[0]);
      assert.equal(loggedReceipt.receiptId, receipt.receiptId);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles edge case: empty items set Merkle root computation and anchoring", () => {
    const emptyRoot = SovereignBlockchainAnchor.computeMerkleRoot([]);
    assert.match(emptyRoot, /^[a-f0-9]{64}$/);

    const emptyReceipt = SovereignBlockchainAnchor.anchorSnapshot([], "arweave", "local");
    assert.equal(emptyReceipt.itemCount, 0);
    assert.equal(emptyReceipt.merkleRoot, emptyRoot);
    assert.equal(emptyReceipt.durabilityTier, "local");
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(emptyReceipt, []), true);
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(emptyReceipt, sampleItems), false);
  });

  it("handles odd-sized Merkle tree boundaries (3, 5 items) and item index proofs", () => {
    const items3: VaultSnapshotItem[] = Array.from({ length: 3 }, (_, idx) => ({
      id: `odd_3_${idx}`,
      vault: "horizon",
      content: `Content entry ${idx}`,
      timestamp: "2026-10-10T00:00:00Z",
      tags: [`tag_${idx}`],
    }));

    const receipt3 = SovereignBlockchainAnchor.anchorSnapshot(items3, "ipfs", "managed_cloud");
    assert.equal(receipt3.itemCount, 3);
    assert.equal(receipt3.durabilityTier, "managed_cloud");
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt3, items3), true);

    for (let i = 0; i < 3; i++) {
      const proof = SovereignBlockchainAnchor.generateMerkleProof(items3, i);
      assert.equal(proof.itemIndex, i);
      assert.equal(proof.verified, true);
      assert.equal(proof.merkleRoot, receipt3.merkleRoot);
    }

    const items5: VaultSnapshotItem[] = Array.from({ length: 5 }, (_, idx) => ({
      id: `odd_5_${idx}`,
      vault: "strategic",
      content: `Content node ${idx}`,
      timestamp: "2026-10-10T00:00:00Z",
      tags: [`tag_${idx}`],
    }));

    const receipt5 = SovereignBlockchainAnchor.anchorSnapshot(items5, "filecoin", "blockchain_anchored");
    assert.equal(receipt5.itemCount, 5);
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(receipt5, items5), true);

    for (let i = 0; i < 5; i++) {
      const proof = SovereignBlockchainAnchor.generateMerkleProof(items5, i);
      assert.equal(proof.itemIndex, i);
      assert.equal(proof.verified, true);
    }
  });

  it("enforces tag sorting invariant in hash calculation", () => {
    const itemA: VaultSnapshotItem = {
      id: "sorted_1",
      vault: "horizon",
      content: "Same content",
      timestamp: "2026-10-10T00:00:00Z",
      tags: ["zeta", "alpha", "gamma"],
    };
    const itemB: VaultSnapshotItem = {
      id: "sorted_1",
      vault: "horizon",
      content: "Same content",
      timestamp: "2026-10-10T00:00:00Z",
      tags: ["alpha", "gamma", "zeta"],
    };

    const hashA = SovereignBlockchainAnchor.hashItem(itemA);
    const hashB = SovereignBlockchainAnchor.hashItem(itemB);
    assert.equal(hashA, hashB);
  });

  it("throws boundary error for out-of-bounds Merkle proof index requests", () => {
    assert.throws(
      () => SovereignBlockchainAnchor.generateMerkleProof(sampleItems, -1),
      /Item index -1 out of range/
    );
    assert.throws(
      () => SovereignBlockchainAnchor.generateMerkleProof(sampleItems, 2),
      /Item index 2 out of range/
    );
  });

  it("rejects verification when attestation is missing or invalid", () => {
    const receipt = SovereignBlockchainAnchor.anchorSnapshot(sampleItems, "arweave", "blockchain_anchored");
    const badAttestationReceipt = { ...receipt, attestation: "Unverified Vendor" };
    assert.equal(SovereignBlockchainAnchor.verifyReceipt(badAttestationReceipt, sampleItems), false);
  });
});

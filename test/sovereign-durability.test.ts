/**
 * Sovereign Durability & Blockchain Anchor Test Suite
 * Built on SIP — Substrate Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SovereignBlockchainAnchor } from "../src/durability/blockchain-anchor.js";
import type { VaultSnapshotItem } from "../src/durability/blockchain-anchor.js";

describe("Sovereign Durability & Blockchain Anchor Engine", () => {
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

  it("computes deterministic Merkle root", () => {
    const hashes = sampleItems.map((i) => SovereignBlockchainAnchor.hashItem(i));
    const root1 = SovereignBlockchainAnchor.computeMerkleRoot(hashes);
    const root2 = SovereignBlockchainAnchor.computeMerkleRoot(hashes);
    assert.equal(root1, root2);
    assert.match(root1, /^[a-f0-9]{64}$/);
  });

  it("anchors snapshot and produces verifiable receipt with Built on SIP", () => {
    const receipt = SovereignBlockchainAnchor.anchorSnapshot(sampleItems, "arweave", "blockchain_anchored");
    assert.equal(receipt.protocol, "SIP/v1.0");
    assert.equal(receipt.attestation, "Built on SIP");
    assert.equal(receipt.itemCount, 2);
    assert.equal(receipt.verified, true);
    assert.match(receipt.contentIdentifier, /^ar:\/\/[a-f0-9]{42}$/);

    const verified = SovereignBlockchainAnchor.verifyReceipt(receipt, sampleItems);
    assert.equal(verified, true);
  });

  it("rejects receipt verification if items are tampered with", () => {
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
    const verified = SovereignBlockchainAnchor.verifyReceipt(receipt, tampered);
    assert.equal(verified, false);
  });

  it("generates and verifies selective disclosure Merkle proof for individual item", () => {
    const proof = SovereignBlockchainAnchor.generateMerkleProof(sampleItems, 0, "sip_proof_0");
    assert.equal(proof.itemIndex, 0);
    assert.equal(proof.verified, true);
    assert.ok(proof.proofPath.length > 0);

    // Tampered item hash fails proof verification
    const tamperedHash = "deadbeef".repeat(8);
    const fakeValid = SovereignBlockchainAnchor.verifyMerkleProof(
      tamperedHash,
      proof.proofPath,
      proof.merkleRoot
    );
    assert.equal(fakeValid, false);
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

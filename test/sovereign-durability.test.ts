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
});

/**
 * Durable Blockchain Vault Pack CLI
 * Built on SIP — Subscription Tier
 */

import { SovereignBlockchainAnchor } from "../../../src/durability/blockchain-anchor.js";
import type { VaultSnapshotItem } from "../../../src/durability/blockchain-anchor.js";

export function anchorVaultItems(items: VaultSnapshotItem[]) {
  const receipt = SovereignBlockchainAnchor.anchorSnapshot(items, "arweave", "blockchain_anchored");
  return receipt;
}

/**
 * Starlight Horizon Vault Blockchain Anchoring Tool
 *
 * Computes deterministic Merkle roots and on-chain calldata/IPFS/Arweave hashes
 * for Horizon Vault notes and critical memory records.
 *
 * Usage:
 *   node --import tsx tools/anchor-horizon.ts
 *
 * Attestation: Built on SIP — Substrate Durability Tier
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SovereignBlockchainAnchor } from "../src/durability/blockchain-anchor.js";
import type { VaultSnapshotItem } from "../src/durability/blockchain-anchor.js";

function parseHorizonVault(repoRoot: string): VaultSnapshotItem[] {
  const vaultPath = join(repoRoot, "memory", "vaults", "horizon-vault.md");
  if (!existsSync(vaultPath)) {
    throw new Error(`Horizon vault not found at ${vaultPath}`);
  }

  const raw = readFileSync(vaultPath, "utf-8");
  const entries: VaultSnapshotItem[] = [];

  // Parse markdown entries by ### [YYYY-MM-DD]
  const regex = /###\s*\[(\d{4}-\d{2}-\d{2})\]\s*—\s*(.+?)\n([\s\S]*?)(?=(?:###\s*\[|$))/g;
  let match: RegExpExecArray | null;

  let index = 0;
  while ((match = regex.exec(raw)) !== null) {
    const date = match[1];
    const title = match[2].trim();
    const body = match[3].trim();

    // Extract tags if present
    const tagMatch = body.match(/\*\*Tags:\*\*\s*(.+)/);
    const tags = tagMatch
      ? tagMatch[1].split(",").map((t) => t.trim().toLowerCase())
      : ["horizon-note"];

    entries.push({
      id: `horizon_entry_${date}_${index++}`,
      vault: "horizon",
      content: `Title: ${title}\n\n${body}`,
      timestamp: `${date}T00:00:00Z`,
      tags,
    });
  }

  // Fallback: If regex didn't split (e.g. format variation), anchor the entire document
  if (entries.length === 0) {
    entries.push({
      id: "horizon_vault_full",
      vault: "horizon",
      content: raw,
      timestamp: new Date().toISOString(),
      tags: ["horizon-vault-document"],
    });
  }

  return entries;
}

export function runHorizonAnchor(repoRoot: string = process.cwd()) {
  console.log("===============================================================================");
  console.log("🌟 STARLIGHT SOVEREIGN DURABILITY: HORIZON VAULT BLOCKCHAIN ANCHORING");
  console.log("===============================================================================");

  const items = parseHorizonVault(repoRoot);
  console.log(`Parsed ${items.length} Horizon Vault notes from disk.`);

  const receipt = SovereignBlockchainAnchor.anchorSnapshot(items, "arweave", "blockchain_anchored");

  console.log("\n📦 Cryptographic Proof-of-State Receipt:");
  console.log(`  • Receipt ID:        ${receipt.receiptId}`);
  console.log(`  • Protocol:          ${receipt.protocol}`);
  console.log(`  • Durability Tier:   ${receipt.durabilityTier}`);
  console.log(`  • Merkle Root:       0x${receipt.merkleRoot}`);
  console.log(`  • Snapshot SHA-256:  ${receipt.vaultSnapshotSha256}`);
  console.log(`  • Storage Target:    ${receipt.storageTarget}`);
  console.log(`  • Content Identifier:${receipt.contentIdentifier}`);
  console.log(`  • Item Count:        ${receipt.itemCount}`);
  console.log(`  • Timestamp:         ${receipt.anchoredAt}`);
  console.log(`  • Attestation:       ${receipt.attestation}`);

  const verified = SovereignBlockchainAnchor.verifyReceipt(receipt, items);
  console.log(`\n🔒 Local Verification Status: ${verified ? "✅ PASS (VERIFIED)" : "❌ FAILED"}`);

  // Append receipt to audit log
  const auditDir = join(repoRoot, "memory", "_audit");
  mkdirSync(auditDir, { recursive: true });
  const auditFile = join(auditDir, "blockchain-anchors.jsonl");
  appendFileSync(auditFile, JSON.stringify(receipt) + "\n", "utf-8");
  console.log(`\nPersisted receipt to ${auditFile}`);

  return receipt;
}

// Execute if run directly
if (process.argv[1]?.endsWith("anchor-horizon.ts")) {
  runHorizonAnchor();
}

/**
 * Subscription-Facing Modular Packs Conformance Suite
 * Tests Issue #352: Managed Durability, Fleet Mesh Overlay & Benevolence Governance Packs.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PackManager } from "../src/marketplace/pack-manager.js";
import { MarketplaceCatalog } from "../src/marketplace/catalog.js";
import { listPacks } from "../src/pack-runtime.js";

describe("Subscription-Facing Modular Packs (#352)", () => {
  const repoRoot = process.cwd();
  const manager = new PackManager(join(repoRoot, "packs", "available"));

  const targetPackIds = [
    "managed-durability-pack",
    "fleet-mesh-overlay-pack",
    "benevolence-governance-pack",
  ];

  it("all three subscription packs exist in packs/available with valid manifests", () => {
    for (const id of targetPackIds) {
      const manifestPath = join(repoRoot, "packs", "available", id, "manifest.json");
      assert.ok(existsSync(manifestPath), `Manifest missing at ${manifestPath}`);

      const raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
      assert.equal(raw.id, id);
      assert.equal(raw.licenseTier, "subscription");
      assert.equal(raw.attestation, "Built on SIP");

      const validation = MarketplaceCatalog.validatePack(raw);
      assert.equal(validation.valid, true, `Pack ${id} validation failed: ${validation.errors.join(", ")}`);
    }
  });

  it("all three subscription packs are discoverable via Marketplace PackManager & Pack Runtime", () => {
    const marketplacePacks = manager.listAvailablePacks();
    const marketplaceIds = marketplacePacks.map((p) => p.id);

    const runtimePacks = listPacks(repoRoot);
    const runtimeIds = runtimePacks.available.map((p) => p.id);

    for (const id of targetPackIds) {
      assert.ok(marketplaceIds.includes(id), `Marketplace missing pack ${id}`);
      assert.ok(runtimeIds.includes(id), `Runtime missing available pack ${id}`);
    }
  });

  it("audits capabilities cleanly for each subscription pack", () => {
    for (const id of targetPackIds) {
      const report = manager.auditPack(id);
      assert.equal(report.packId, id);
      assert.equal(report.licenseTier, "subscription");
      assert.equal(report.attestationValid, true);
      assert.equal(report.securitySafe, true);
      assert.ok(Array.isArray(report.permissions));
      assert.ok(report.permissions.length > 0);
    }
  });
});

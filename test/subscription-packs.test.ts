/**
 * Subscription-Facing Modular Packs Conformance Suite
 * Tests Issue #352: Managed Durability, Fleet Mesh Overlay & Benevolence Governance Packs.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { PackManager } from "../src/marketplace/pack-manager.js";
import { MarketplaceCatalog } from "../src/marketplace/catalog.js";
import {
  computeManifestSha,
  installPack,
  installedDir,
  listPacks,
  readRegistry,
  uninstallPack,
  writeRegistry,
} from "../src/pack-runtime.js";

function withTempRoot<T>(fn: (root: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "sis-sub-packs-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

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

  it("all three subscription packs include README documentation assets", () => {
    for (const id of targetPackIds) {
      const readmePath = join(repoRoot, "packs", "available", id, "README.md");
      assert.ok(existsSync(readmePath), `README.md missing for ${id}`);

      const readmeText = readFileSync(readmePath, "utf-8");
      assert.ok(readmeText.length > 50, `README.md for ${id} is too short`);
    }
  });

  it("all three subscription packs have matching computed manifestSha in registry and runtime list", () => {
    const reg = readRegistry(repoRoot);
    const runtimeList = listPacks(repoRoot);

    for (const id of targetPackIds) {
      const packDir = join(repoRoot, "packs", "available", id);
      const computedSha = computeManifestSha(packDir);

      const regPack = reg.available.find((p) => p.id === id);
      assert.ok(regPack, `Registry entry missing for ${id}`);
      assert.equal(regPack.manifestSha, computedSha, `Registry SHA mismatch for ${id}`);

      const runtimePack = runtimeList.available.find((p) => p.id === id);
      assert.ok(runtimePack, `Runtime list entry missing for ${id}`);
      assert.equal(runtimePack.manifestSha, computedSha, `Runtime list SHA mismatch for ${id}`);
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

  it("supports installation and uninstallation lifecycle via Pack Runtime in isolated environment", () => {
    withTempRoot((root) => {
      const reg = readRegistry(repoRoot);
      writeRegistry(root, reg);

      const realAvailable = join(repoRoot, "packs", "available");
      const tempAvailable = join(root, "packs", "available");

      for (const id of targetPackIds) {
        const src = join(realAvailable, id);
        const dst = join(tempAvailable, id);
        cpSync(src, dst, { recursive: true });
      }

      for (const id of targetPackIds) {
        const gatedRes = installPack(root, id);
        assert.equal(gatedRes.ok, false);
        assert.match(gatedRes.error ?? "", /permissions_acked:true required/);

        const installRes = installPack(root, id, { permissions_acked: true });
        assert.equal(installRes.ok, true, installRes.error);
        assert.ok(existsSync(installedDir(root, id)));
        assert.ok(existsSync(join(installedDir(root, id), "README.md")));

        const uninstallRes = uninstallPack(root, id);
        assert.equal(uninstallRes.ok, true, uninstallRes.error);
        assert.equal(existsSync(installedDir(root, id)), false);
      }
    });
  });
});

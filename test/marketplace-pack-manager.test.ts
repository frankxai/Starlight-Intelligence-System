import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHmac } from "node:crypto";
import { PackManager } from "../src/marketplace/pack-manager.js";
import { MarketplaceCatalog, type MarketplacePackItem } from "../src/marketplace/catalog.js";

describe("Sovereign Marketplace — PackManager", () => {
  it("lists available packs from packs directory", () => {
    const manager = new PackManager();
    const available = manager.listAvailablePacks();
    assert.ok(available.length >= 3);
    const ids = available.map((p) => p.id);
    assert.ok(ids.includes("durable-blockchain-vault-pack"));
    assert.ok(ids.includes("robot-fleet-continuity-pack"));
    assert.ok(ids.includes("starlight-queen-orchestrator-pack"));
  });

  it("audits pack capabilities and flags elevated network permissions", () => {
    const manager = new PackManager();
    const report = manager.auditPack("durable-blockchain-vault-pack");
    assert.equal(report.packId, "durable-blockchain-vault-pack");
    assert.equal(report.attestationValid, true);
    assert.equal(report.securitySafe, true);
    assert.equal(report.requiresUserAck, true);
    assert.ok(report.permissions.includes("network:fetch:blockchain-rpc"));
  });

  it("audits custom harness config with HMAC signature verification", () => {
    const tempPacks = mkdtempSync(join(tmpdir(), "sis-custom-packs-"));
    const tempInstalled = mkdtempSync(join(tmpdir(), "sis-installed-packs-"));
    try {
      const packId = "custom-cursor-harness-pack";
      const packDir = join(tempPacks, packId);
      mkdirSync(packDir, { recursive: true });

      const secret = "signature-secret-key-351";
      const pack: Partial<MarketplacePackItem> = {
        id: packId,
        name: "Custom Cursor Harness",
        version: "1.0.0",
        kind: "harness-config",
        harnessTarget: "cursor",
        author: "community-dev",
        description: "Curated Cursor harness rules",
        licenseTier: "free",
        permissions: ["fs:read:repo"],
        attestation: "Built on SIP v1.1.1",
        manifestSha: "manifest-cursor-sha",
      };

      const payload = MarketplaceCatalog.getCanonicalPayload(pack);
      const signature = createHmac("sha256", secret).update(payload).digest("hex");
      const fullPack = { ...pack, signature, publicKey: secret };

      writeFileSync(join(packDir, "manifest.json"), JSON.stringify(fullPack, null, 2), "utf-8");

      const manager = new PackManager(tempPacks, tempInstalled);
      const report = manager.auditPack(packId);

      assert.equal(report.packId, packId);
      assert.equal(report.kind, "harness-config");
      assert.equal(report.harnessTarget, "cursor");
      assert.equal(report.signatureValid, true);
      assert.equal(report.securitySafe, true);

      const receipt = manager.installPack(packId);
      assert.equal(receipt.packId, packId);
      assert.equal(receipt.attestation, "Built on SIP");
    } finally {
      rmSync(tempPacks, { recursive: true, force: true });
      rmSync(tempInstalled, { recursive: true, force: true });
    }
  });

  it("installs pack cleanly into sandboxed directory and writes install receipt", () => {
    const tempInstalled = mkdtempSync(join(tmpdir(), "sis-installed-packs-"));
    try {
      const manager = new PackManager(undefined, tempInstalled);
      const receipt = manager.installPack("durable-blockchain-vault-pack");

      assert.equal(receipt.packId, "durable-blockchain-vault-pack");
      assert.equal(receipt.attestation, "Built on SIP");
      assert.ok(receipt.receiptId.startsWith("sip_pack_install_"));
      assert.ok(existsSync(join(tempInstalled, "installed.json")));

      const registry = manager.listInstalledPacks();
      assert.equal(registry.length, 1);
      assert.equal(registry[0].packId, "durable-blockchain-vault-pack");
    } finally {
      rmSync(tempInstalled, { recursive: true, force: true });
    }
  });
});

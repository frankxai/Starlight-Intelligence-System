import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PackManager } from "../src/marketplace/pack-manager.js";

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

/**
 * Starlight Sovereign Marketplace Test Suite
 * Built on SIP — Marketplace Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac, createSign, generateKeyPairSync } from "node:crypto";
import { MarketplaceCatalog } from "../src/marketplace/catalog.js";
import type { MarketplacePackItem } from "../src/marketplace/catalog.js";

describe("Starlight Sovereign Marketplace Catalog", () => {
  const validPack: MarketplacePackItem = {
    id: "community-legal-guardian-pack",
    name: "Legal Guardian Pack",
    version: "1.0.0",
    kind: "claw",
    author: "solopreneur_counsel",
    description: "Fail-closed contract and liability audit skill pack.",
    licenseTier: "subscription",
    permissions: ["fs:read:repo"],
    attestation: "Built on SIP",
    manifestSha: "abc1234567890def",
    publishedAt: new Date().toISOString(),
  };

  it("validates a compliant marketplace pack item", () => {
    const res = MarketplaceCatalog.validatePack(validPack);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  it("rejects packs missing Built on SIP attestation", () => {
    const invalid = { ...validPack, attestation: "Generic Badge" };
    const res = MarketplaceCatalog.validatePack(invalid);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("Built on SIP")));
  });

  it("rejects packs requesting dangerous wildcard write permissions or path traversal", () => {
    const dangerousRoot = { ...validPack, permissions: ["fs:write:/"] };
    const resRoot = MarketplaceCatalog.validatePack(dangerousRoot);
    assert.equal(resRoot.valid, false);
    assert.ok(resRoot.errors.some((e) => e.includes("Disallowed dangerous permission")));

    const dangerousTraversal = { ...validPack, permissions: ["fs:read:../../etc/passwd"] };
    const resTraversal = MarketplaceCatalog.validatePack(dangerousTraversal);
    assert.equal(resTraversal.valid, false);
    assert.ok(resTraversal.errors.some((e) => e.includes("Disallowed dangerous permission")));

    const dangerousSudo = { ...validPack, permissions: ["exec:sudo_rm"] };
    const resSudo = MarketplaceCatalog.validatePack(dangerousSudo);
    assert.equal(resSudo.valid, false);
    assert.ok(resSudo.errors.some((e) => e.includes("Disallowed dangerous permission")));
  });

  it("publishes harness configs for Claude Code, Grok, Windsurf, Cursor, and Antigravity", () => {
    const catalog = new MarketplaceCatalog();
    const targets = ["claude-code", "grok", "windsurf", "cursor", "antigravity"] as const;

    for (const target of targets) {
      const harnessPack: MarketplacePackItem = {
        id: `harness-${target}-config`,
        name: `${target.toUpperCase()} Sovereign Harness`,
        version: "1.0.0",
        kind: "harness-config",
        harnessTarget: target,
        author: "council-architect",
        description: `Curated harness configuration for ${target}`,
        licenseTier: "free",
        permissions: ["fs:read:repo"],
        attestation: "Built on SIP v1.1.1",
        manifestSha: `sha-${target}-12345`,
        publishedAt: new Date().toISOString(),
      };

      const pubRes = catalog.publishItem(harnessPack);
      assert.equal(pubRes.success, true);
      assert.ok(pubRes.item);
      assert.equal(pubRes.item.harnessTarget, target);
    }

    const grokItems = catalog.listItems({ harnessTarget: "grok" });
    assert.equal(grokItems.length, 1);
    assert.equal(grokItems[0].id, "harness-grok-config");
  });

  it("verifies HMAC and RSA cryptographic signatures on marketplace items", () => {
    const secret = "hmac-secret-key-351";
    const baseItem: MarketplacePackItem = {
      id: "signed-vertical-pack",
      name: "Signed Vertical Pack",
      version: "2.1.0",
      kind: "vertical-pack",
      author: "starlight-dev",
      description: "Signed vertical integration pack.",
      licenseTier: "enterprise",
      permissions: ["fs:read:repo"],
      attestation: "Built on SIP § 1",
      manifestSha: "manifestsha12345",
      publishedAt: new Date().toISOString(),
    };

    // 1. HMAC signature verification
    const payload = MarketplaceCatalog.getCanonicalPayload(baseItem);
    const hmacSig = createHmac("sha256", secret).update(payload).digest("hex");
    const hmacItem: MarketplacePackItem = {
      ...baseItem,
      signature: hmacSig,
      publicKey: secret,
    };

    assert.equal(MarketplaceCatalog.verifySignature(hmacItem), true);

    const tamperedHmac = { ...hmacItem, description: "Tampered content" };
    assert.equal(MarketplaceCatalog.verifySignature(tamperedHmac), false);

    // 2. RSA signature verification
    const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pubPem = publicKey.export({ type: "pkcs1", format: "pem" }).toString();
    const signer = createSign("SHA256");
    signer.update(payload);
    signer.end();
    const rsaSig = signer.sign(privateKey, "hex");

    const rsaItem: MarketplacePackItem = {
      ...baseItem,
      signature: rsaSig,
      publicKey: pubPem,
    };

    assert.equal(MarketplaceCatalog.verifySignature(rsaItem), true);

    // 3. Publishing with signature requirements
    const catalog = new MarketplaceCatalog();
    const failedPub = catalog.publishItem(baseItem, { requireSignature: true });
    assert.equal(failedPub.success, false);
    assert.ok(failedPub.errors.some((e) => e.includes("signature is required")));

    const okPub = catalog.publishItem(rsaItem, { requireSignature: true });
    assert.equal(okPub.success, true);
  });

  it("registers and lists marketplace packs filtered by license tier and target", () => {
    const catalog = new MarketplaceCatalog();
    const registered = catalog.registerItem(validPack);
    assert.equal(registered, true);

    const subscriptionPacks = catalog.listItems("subscription");
    assert.equal(subscriptionPacks.length, 1);
    assert.equal(subscriptionPacks[0].id, "community-legal-guardian-pack");

    const freePacks = catalog.listItems("free");
    assert.equal(freePacks.length, 0);

    const filtered = catalog.listItems({ tier: "subscription", kind: "claw" });
    assert.equal(filtered.length, 1);
  });

  it("searches catalog items by keyword across fields", () => {
    const catalog = new MarketplaceCatalog();
    catalog.registerItem(validPack);

    const matches = catalog.search("liability");
    assert.equal(matches.length, 1);
    assert.equal(matches[0].id, "community-legal-guardian-pack");

    const noMatches = catalog.search("cryptocurrency");
    assert.equal(noMatches.length, 0);
  });

  it("audits permissions flagging elevated capabilities", () => {
    const auditSafe = MarketplaceCatalog.auditPermissions(["fs:read:repo"]);
    assert.equal(auditSafe.safe, true);
    assert.equal(auditSafe.requiresUserAck, false);

    const auditElevated = MarketplaceCatalog.auditPermissions(["filesystem:write_user", "network:outbound"]);
    assert.equal(auditElevated.safe, true);
    assert.equal(auditElevated.requiresUserAck, true);

    const auditWildcard = MarketplaceCatalog.auditPermissions(["fs:write:*"]);
    assert.equal(auditWildcard.safe, false);

    const auditTraversal = MarketplaceCatalog.auditPermissions(["fs:read:../secret"]);
    assert.equal(auditTraversal.safe, false);
  });
});

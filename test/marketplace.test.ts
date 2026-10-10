/**
 * Starlight Sovereign Marketplace Test Suite
 * Built on SIP — Marketplace Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
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

  it("rejects packs requesting dangerous wildcard write permissions", () => {
    const dangerous = { ...validPack, permissions: ["fs:write:/"] };
    const res = MarketplaceCatalog.validatePack(dangerous);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("Disallowed dangerous permission")));
  });

  it("registers and lists marketplace packs filtered by license tier", () => {
    const catalog = new MarketplaceCatalog();
    const registered = catalog.registerItem(validPack);
    assert.equal(registered, true);

    const subscriptionPacks = catalog.listItems("subscription");
    assert.equal(subscriptionPacks.length, 1);
    assert.equal(subscriptionPacks[0].id, "community-legal-guardian-pack");

    const freePacks = catalog.listItems("free");
    assert.equal(freePacks.length, 0);
  });
});

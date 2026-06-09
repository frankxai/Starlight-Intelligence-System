/**
 * v8.3 substrate symmetry — Finance & Business IS W3.1 contract.
 *
 * Asserts Phase 1 contract per spec:
 *   - business-registry.template.json exists at repo root (schema-only)
 *   - private/business-registry.json is NOT committed (Board REVISE-1)
 *   - All Phase 1 source-instrumenter modules present
 *   - Phase 1 source count = 1 (Board REVISE-3: Stripe only)
 *   - Phase 1 entity scope = Arcanea BV only
 *   - Cockpit pane exists (cockpit-only dashboard, mirrors W2 REVISE-3)
 *   - NO public /finance route on the site
 *   - StaleCashError mechanism encoded
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

describe("v8.3 — Finance & Business IS substrate symmetry", () => {
  it("business-registry.template.json exists at repo root (schema-only)", () => {
    const path = join(ROOT, "business-registry.template.json");
    assert.ok(existsSync(path), "business-registry.template.json must exist at repo root");
    const tpl = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(typeof tpl.version, "string");
    assert.ok(Array.isArray(tpl.entities));
    assert.ok(tpl.entities.length >= 1);
    // Template must NOT have real entity values
    const e = tpl.entities[0];
    assert.match(e.name, /<.*>/, "template entity name must be a placeholder like <entity-display-name>");
  });

  it("private/business-registry.json NOT in repo (Board REVISE-1)", () => {
    const path = join(ROOT, "private", "business-registry.json");
    // It's allowed to exist locally (operator setup), but must be gitignored.
    // We test via .gitignore content rather than absence (operator may have set it up).
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    assert.ok(
      /^private\/?$/m.test(gitignore) || /^private\//m.test(gitignore),
      ".gitignore must exclude private/ directory (Board REVISE-1 sovereignty hygiene)",
    );
  });

  it("finance source modules exist", () => {
    const required = [
      "src/finance/entity-registry.ts",
      "src/finance/revenue-snapshot.ts",
      "src/finance/pnl.ts",
      "src/finance/revenue-sources/_shared.ts",
      "src/finance/revenue-sources/stripe.ts",
    ];
    for (const rel of required) {
      assert.ok(existsSync(join(ROOT, rel)), `${rel} must exist`);
    }
  });

  it("entity-registry exports loadRegistry + updateCash + isCashStale + StaleCashError-like", () => {
    const body = readFileSync(join(ROOT, "src/finance/entity-registry.ts"), "utf8");
    assert.ok(/export function loadRegistry/.test(body));
    assert.ok(/export function updateCash/.test(body));
    assert.ok(/export function isCashStale/.test(body));
    assert.ok(/export class EntityRegistryError/.test(body));
  });

  it("pnl exports computePnL + computeRunway + StaleCashError", () => {
    const body = readFileSync(join(ROOT, "src/finance/pnl.ts"), "utf8");
    assert.ok(/export function computePnL/.test(body));
    assert.ok(/export function computeRunway/.test(body));
    assert.ok(/export class StaleCashError/.test(body));
  });

  it("StaleCashError 14-day threshold encoded (Board REVISE-2)", () => {
    const registryBody = readFileSync(join(ROOT, "src/finance/entity-registry.ts"), "utf8");
    assert.ok(/14/.test(registryBody), "14-day staleness threshold must be encoded");
    assert.ok(/STALE_CASH/.test(readFileSync(join(ROOT, "src/finance/pnl.ts"), "utf8")));
  });

  it("Stripe is sole Phase 1 source (Board REVISE-3)", () => {
    const orchestrator = readFileSync(join(ROOT, "src/finance/revenue-snapshot.ts"), "utf8");
    assert.ok(/StripeFetcher/.test(orchestrator), "orchestrator uses StripeFetcher");
    // Phase 1 narrow: no other fetchers imported
    assert.equal(
      /import.*PaypalFetcher/.test(orchestrator) ||
        /import.*BankCsvFetcher/.test(orchestrator) ||
        /import.*InvoiceManualFetcher/.test(orchestrator),
      false,
      "Phase 1 must not import non-Stripe fetchers (Board REVISE-3)",
    );
  });

  it("Arcanea BV is sole Phase 1 entity (Board REVISE-3)", () => {
    const orchestrator = readFileSync(join(ROOT, "src/finance/revenue-snapshot.ts"), "utf8");
    assert.ok(
      /Arcanea BV/.test(orchestrator),
      "orchestrator must filter to Arcanea BV in Phase 1 (Board REVISE-3)",
    );
  });

  it("cockpit pane exists at cockpit-zellij/layouts/finance.kdl", () => {
    const path = join(ROOT, "cockpit-zellij/layouts/finance.kdl");
    assert.ok(existsSync(path), "finance.kdl Zellij layout must exist (operator dashboard surface)");
  });

  it("NO public /finance route on the site (mirrors W2 REVISE-3)", () => {
    const publicFinance = join(ROOT, "site/src/app/finance/page.tsx");
    assert.ok(
      !existsSync(publicFinance),
      "site/src/app/finance/page.tsx must NOT exist — operator-private financial data",
    );
  });

  it("audit dir is gitignored", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    assert.ok(
      /memory\/_audit/.test(gitignore),
      ".gitignore must exclude memory/_audit/ (covers finance subdir)",
    );
  });

  it("cron entry script exists", () => {
    const path = join(ROOT, "scripts/cron/daily-revenue-snapshot.ps1");
    assert.ok(existsSync(path), "scripts/cron/daily-revenue-snapshot.ps1 must exist");
  });
});

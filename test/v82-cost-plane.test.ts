/**
 * v8.2 substrate symmetry — Cost & API Control Plane W2.1 contract.
 *
 * Asserts the Phase 1 contract per spec:
 *   - cost-plane-config.json exists with required schema
 *   - All Phase 1 source-instrumenter modules present
 *   - Phase 1 source count = 2 (Board REVISE-1: Vercel + Anthropic only)
 *   - Cockpit pane exists (cockpit-only dashboard per Board REVISE-3)
 *   - NO public /cost route on the site (Board REVISE-3)
 *
 * Gates W2.1 ship the same way v76-v81 gate prior substrate ships.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

describe("v8.2 — Cost & API Control Plane substrate symmetry", () => {
  it("cost-plane-config.json exists with required schema", () => {
    const path = join(ROOT, "cost-plane-config.json");
    assert.ok(existsSync(path), "cost-plane-config.json must exist at repo root");
    const cfg = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(typeof cfg.version, "string");
    assert.ok(cfg.thresholds, "thresholds object required");
    assert.ok(cfg.schedule, "schedule object required");
    assert.equal(typeof cfg.schedule.snapshot_cron, "string");
    assert.ok(Array.isArray(cfg.sources_phase_1));
  });

  it("Phase 1 source count = 2 (Board REVISE-1)", () => {
    const cfg = JSON.parse(readFileSync(join(ROOT, "cost-plane-config.json"), "utf8"));
    assert.equal(
      cfg.sources_phase_1.length,
      2,
      "Phase 1 must have exactly 2 sources per Board REVISE-1 (Vercel + Anthropic only)",
    );
    assert.deepEqual(cfg.sources_phase_1.sort(), ["anthropic", "vercel"]);
  });

  it("Vercel and Anthropic have threshold config entries", () => {
    const cfg = JSON.parse(readFileSync(join(ROOT, "cost-plane-config.json"), "utf8"));
    for (const source of cfg.sources_phase_1) {
      assert.ok(cfg.thresholds[source], `Phase 1 source "${source}" must have threshold config`);
      assert.equal(typeof cfg.thresholds[source].daily_usd_cap, "number");
      assert.equal(typeof cfg.thresholds[source].wow_factor, "number");
      assert.equal(typeof cfg.thresholds[source].mom_factor, "number");
    }
  });

  it("source instrumenter modules exist", () => {
    const required = [
      "src/infra/cost-sources/_shared.ts",
      "src/infra/cost-sources/vercel.ts",
      "src/infra/cost-sources/anthropic.ts",
      "src/infra/cost-snapshot.ts",
      "src/infra/secrets.ts",
    ];
    for (const rel of required) {
      assert.ok(existsSync(join(ROOT, rel)), `${rel} must exist`);
    }
  });

  it("Vercel module exports VercelFetcher class", () => {
    const body = readFileSync(join(ROOT, "src/infra/cost-sources/vercel.ts"), "utf8");
    assert.ok(/export class VercelFetcher/.test(body), "VercelFetcher must be exported");
  });

  it("Anthropic module exports AnthropicFetcher class", () => {
    const body = readFileSync(join(ROOT, "src/infra/cost-sources/anthropic.ts"), "utf8");
    assert.ok(/export class AnthropicFetcher/.test(body), "AnthropicFetcher must be exported");
  });

  it("secrets module exports InfisicalSecretsClient + EnvSecretsClient", () => {
    const body = readFileSync(join(ROOT, "src/infra/secrets.ts"), "utf8");
    assert.ok(/export class InfisicalSecretsClient/.test(body));
    assert.ok(/export class EnvSecretsClient/.test(body));
  });

  it("cost-snapshot orchestrator exports runDailySnapshot function", () => {
    const body = readFileSync(join(ROOT, "src/infra/cost-snapshot.ts"), "utf8");
    assert.ok(/export (async )?function runDailySnapshot/.test(body));
  });

  it("cockpit pane exists at cockpit-zellij/layouts/cost-plane.kdl (Board REVISE-3)", () => {
    const path = join(ROOT, "cockpit-zellij/layouts/cost-plane.kdl");
    assert.ok(existsSync(path), "cost-plane.kdl Zellij layout must exist (operator dashboard surface)");
  });

  it("NO public /cost route on the site (Board REVISE-3)", () => {
    const publicCost = join(ROOT, "site/src/app/cost/page.tsx");
    assert.ok(
      !existsSync(publicCost),
      "site/src/app/cost/page.tsx must NOT exist — Board REVISE-3 dropped public cost surface",
    );
  });

  it("audit dir is gitignored (operator-private cost data)", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    assert.ok(
      /memory\/_audit\/cost/.test(gitignore),
      ".gitignore must exclude memory/_audit/cost/ (operator-private cost data)",
    );
  });

  it("cron entry script exists", () => {
    const path = join(ROOT, "scripts/cron/daily-cost-snapshot.ps1");
    assert.ok(existsSync(path), "scripts/cron/daily-cost-snapshot.ps1 must exist");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { computeFinanceBridge, formatBridgeMarkdown } from "./finance-bridge.js";

function withTempRepo<T>(fn: (repoRoot: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "fbridge-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function setupRegistry(repoRoot: string, lastUpdatedDaysAgo: number = 1, cashAmount: number = 50000): void {
  mkdirSync(join(repoRoot, "private"), { recursive: true });
  const lastUpdated = new Date(Date.now() - lastUpdatedDaysAgo * 86_400_000).toISOString();
  const reg = {
    version: "1.0.0",
    schema: "test-schema",
    entities: [
      {
        name: "Arcanea BV",
        type: "operating-company",
        jurisdiction: "NL",
        currency_base: "EUR",
        role: "test",
        operates: ["test"],
        current_cash: { amount: cashAmount, currency: "EUR", last_updated: lastUpdated },
      },
    ],
  };
  writeFileSync(join(repoRoot, "private", "business-registry.json"), JSON.stringify(reg));
}

function setupScope(repoRoot: string, sessionThresholdUsd: number = 20): void {
  mkdirSync(join(repoRoot, "private"), { recursive: true });
  const scope = {
    version: "1.0.0",
    schema: "test-schema",
    budget: { session_threshold_usd: sessionThresholdUsd, action_threshold_usd: 5 },
    phase_in: {
      phase_in_repo: "SIS",
      session_count: 0,
      unlock_status: "closed",
      unlock_review_passed: false,
      notes: "test",
    },
    repos: [{ name: "SIS", path: "/tmp/sis", alliance_touched: false, tier: "active" }],
  };
  writeFileSync(join(repoRoot, "private", "yolo-scope.json"), JSON.stringify(scope));
}

function writeRevenueSnapshot(repoRoot: string, period: string, amount_usd: number): void {
  const dir = join(repoRoot, "memory", "_audit", "finance");
  mkdirSync(dir, { recursive: true });
  const snap = {
    ts: `${period}T00:00:00Z`,
    source: "stripe",
    entity: "Arcanea BV",
    period,
    amount: amount_usd,
    currency: "USD",
    amount_usd_equiv: amount_usd,
    category: "subscription",
  };
  writeFileSync(join(dir, `${period}.jsonl`), JSON.stringify(snap) + "\n");
}

function writeCostSnapshot(repoRoot: string, period: string, cost_usd: number): void {
  const dir = join(repoRoot, "memory", "_audit", "cost");
  mkdirSync(dir, { recursive: true });
  const snap = { ts: `${period}T00:00:00Z`, source: "vercel", cost_usd, period };
  writeFileSync(join(dir, `${period}.jsonl`), JSON.stringify(snap) + "\n");
}

describe("finance-bridge", () => {
  it("returns degraded payload when registry missing", () => {
    withTempRepo((root) => {
      const payload = computeFinanceBridge(root);
      assert.equal(payload.primary_entity, null);
      assert.ok(payload.alerts.some((a) => a.code === "registry-missing"));
    });
  });

  it("returns primary_entity = Arcanea BV when registry present", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const payload = computeFinanceBridge(root);
      assert.equal(payload.primary_entity, "Arcanea BV");
    });
  });

  it("computes MTD P&L composing revenue + cost streams", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const today = new Date("2026-06-10");
      const periodStart = today.toISOString().slice(0, 7) + "-05";
      writeRevenueSnapshot(root, periodStart, 500);
      writeCostSnapshot(root, periodStart, 100);
      const payload = computeFinanceBridge(root, today);
      assert.ok(payload.pnl_mtd);
      assert.equal(payload.pnl_mtd?.inflows_usd, 500);
      assert.equal(payload.pnl_mtd?.outflows_usd, 100);
      assert.equal(payload.pnl_mtd?.net_usd, 400);
    });
  });

  it("returns runway and Infinity when no burn", () => {
    withTempRepo((root) => {
      setupRegistry(root, 1, 100000);
      const payload = computeFinanceBridge(root);
      assert.ok(payload.runway);
      assert.equal(payload.runway?.runway_months, Infinity);
    });
  });

  it("surfaces stale-cash warning when cash > 14d old", () => {
    withTempRepo((root) => {
      setupRegistry(root, 30, 50000);
      const payload = computeFinanceBridge(root);
      assert.equal(payload.runway, null);
      assert.ok(payload.alerts.some((a) => a.code === "stale-cash" && a.severity === "warn"));
    });
  });

  it("surfaces runway-short block when runway < 6mo", () => {
    withTempRepo((root) => {
      // Cash = $1000 USD-equiv (EUR amount × 1.0810)
      // To get 4mo runway we need monthly burn of $250
      // 3 months lookback, each month burns $250 → $750 total outflows, $0 inflows → net = -$750
      // monthlyBurn = 750/3 = $250 → runway = 1000 / 250 = 4mo
      setupRegistry(root, 1, 925); // 925 EUR × 1.081 ≈ $1000 USD
      const today = new Date();
      // Write 3 months of cost data
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        const period = d.toISOString().slice(0, 10);
        writeCostSnapshot(root, period, 250);
      }
      const payload = computeFinanceBridge(root, today);
      assert.ok(payload.runway);
      assert.ok(payload.runway && payload.runway.runway_months < 6);
      assert.ok(payload.alerts.some((a) => a.code === "runway-short" && a.severity === "block"));
    });
  });

  it("scope-missing alert when private/yolo-scope.json absent", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const payload = computeFinanceBridge(root);
      assert.ok(payload.alerts.some((a) => a.code === "scope-missing"));
    });
  });

  it("computes session_budget_headroom_usd when scope present", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      setupScope(root, 20); // $20/session → $600/month budget
      const today = new Date("2026-06-10");
      const periodStart = today.toISOString().slice(0, 7) + "-05";
      writeCostSnapshot(root, periodStart, 100);
      const payload = computeFinanceBridge(root, today);
      assert.equal(payload.session_budget_headroom_usd, 500); // $600 - $100 burned
    });
  });

  it("surfaces session-budget-near-cap when >50% burn", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      setupScope(root, 10); // $10/session → $300/month budget
      const today = new Date("2026-06-10");
      const periodStart = today.toISOString().slice(0, 7) + "-05";
      writeCostSnapshot(root, periodStart, 200); // 67% of $300 budget
      const payload = computeFinanceBridge(root, today);
      assert.ok(payload.alerts.some((a) => a.code === "session-budget-near-cap"));
    });
  });

  it("never throws — degrades gracefully even in worst case", () => {
    withTempRepo((root) => {
      // Empty repo — no registry, no scope, no audit data
      const payload = computeFinanceBridge(root);
      assert.ok(payload, "should return a payload, not throw");
      assert.ok(Array.isArray(payload.alerts), "should always have alerts array");
    });
  });

  it("formatBridgeMarkdown produces human-readable summary", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const payload = computeFinanceBridge(root);
      const md = formatBridgeMarkdown(payload);
      assert.ok(md.includes("Finance bridge"));
      assert.ok(md.includes("Arcanea BV"));
      assert.ok(md.includes("Runway"));
    });
  });
});

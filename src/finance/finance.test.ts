import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadRegistry,
  updateCash,
  isCashStale,
  EntityRegistryError,
  type EntityRegistry,
  type Entity,
} from "./entity-registry.js";

import {
  writeRevenueSnapshot,
  convertToUsd,
  hashResponse,
  type RevenueSnapshot,
} from "./revenue-sources/_shared.js";

import { StripeFetcher } from "./revenue-sources/stripe.js";

import { computePnL, computeRunway, StaleCashError } from "./pnl.js";

import { EnvSecretsClient } from "../infra/secrets.js";

import { runDailyRevenueSnapshot } from "./revenue-snapshot.js";

function withTempRepo<T>(fn: (repoRoot: string) => Promise<T> | T): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "finance-test-"));
  return Promise.resolve(fn(dir)).finally(() => {
    rmSync(dir, { recursive: true, force: true });
  });
}

function mockFetch(body: object, status = 200, ok = true): typeof fetch {
  return (async () => {
    return {
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: async () => body,
    } as Response;
  }) as unknown as typeof fetch;
}

function makeFreshRegistry(): EntityRegistry {
  return {
    version: "1.0.0",
    schema: "test-schema",
    entities: [
      {
        name: "Arcanea BV",
        type: "operating-company",
        jurisdiction: "NL",
        currency_base: "EUR",
        role: "creative-canon-owner",
        operates: ["arcanea"],
        current_cash: {
          amount: 50000,
          currency: "EUR",
          last_updated: new Date().toISOString(),
        },
      },
    ],
  };
}

function setupRegistry(repoRoot: string, reg: EntityRegistry = makeFreshRegistry()): void {
  mkdirSync(join(repoRoot, "private"), { recursive: true });
  writeFileSync(join(repoRoot, "private", "business-registry.json"), JSON.stringify(reg));
}

describe("finance/entity-registry", () => {
  it("loadRegistry throws explicit setup error when private/business-registry.json missing", () => {
    withTempRepo((root) => {
      let caught: unknown;
      try {
        loadRegistry(root);
      } catch (e) {
        caught = e;
      }
      assert.ok(caught instanceof EntityRegistryError, "expected EntityRegistryError");
      assert.match(
        (caught as Error).message,
        /cp business-registry\.template\.json private\/business-registry\.json/,
      );
    });
  });

  it("loadRegistry returns valid registry when present", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const reg = loadRegistry(root);
      assert.equal(reg.entities[0].name, "Arcanea BV");
    });
  });

  it("loadRegistry rejects malformed JSON", () => {
    withTempRepo((root) => {
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "business-registry.json"), "{ not json");
      assert.throws(() => loadRegistry(root), /not valid JSON/);
    });
  });

  it("updateCash atomically updates an entity's current_cash", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      const updated = updateCash(root, "Arcanea BV", 75000, "EUR");
      assert.equal(updated.entities[0].current_cash.amount, 75000);
      const reloaded = loadRegistry(root);
      assert.equal(reloaded.entities[0].current_cash.amount, 75000);
    });
  });

  it("updateCash throws on unknown entity", () => {
    withTempRepo((root) => {
      setupRegistry(root);
      assert.throws(() => updateCash(root, "UnknownEntity", 1000, "USD"), /not found/);
    });
  });

  it("isCashStale returns true when cash > 14 days old", () => {
    const entity: Entity = {
      name: "Test",
      type: "operating-company",
      jurisdiction: "NL",
      currency_base: "EUR",
      role: "test",
      operates: [],
      current_cash: {
        amount: 1000,
        currency: "EUR",
        last_updated: new Date(Date.now() - 15 * 86_400_000).toISOString(),
      },
    };
    assert.equal(isCashStale(entity), true);
  });

  it("isCashStale returns false when cash fresh", () => {
    const entity: Entity = {
      name: "Test",
      type: "operating-company",
      jurisdiction: "NL",
      currency_base: "EUR",
      role: "test",
      operates: [],
      current_cash: {
        amount: 1000,
        currency: "EUR",
        last_updated: new Date().toISOString(),
      },
    };
    assert.equal(isCashStale(entity), false);
  });
});

describe("finance/revenue-sources/_shared", () => {
  it("hashResponse deterministic", async () => {
    const h1 = await hashResponse({ a: 1 });
    const h2 = await hashResponse({ a: 1 });
    assert.equal(h1, h2);
    assert.equal(h1.length, 64);
  });

  it("convertToUsd identity for USD", () => {
    const { amount_usd, conversion } = convertToUsd(100, "USD", "2026-05-11");
    assert.equal(amount_usd, 100);
    assert.equal(conversion.source, "identity");
  });

  it("convertToUsd uses stub for EUR->USD", () => {
    const { amount_usd, conversion } = convertToUsd(100, "EUR", "2026-05-11");
    assert.equal(amount_usd, 108.10);
    assert.match(conversion.source, /ECB/);
  });

  it("convertToUsd throws on unsupported currency", () => {
    assert.throws(() => convertToUsd(100, "XYZ", "2026-05-11"), /No FX rate/);
  });

  it("writeRevenueSnapshot creates dir + appends JSONL", async () => {
    await withTempRepo((root) => {
      const snap: RevenueSnapshot = {
        ts: "2026-05-11T00:00:00Z",
        source: "stripe",
        entity: "Arcanea BV",
        period: "2026-05-10",
        amount: 100,
        currency: "EUR",
        amount_usd_equiv: 108.10,
        fx_rate_used: 1.0810,
        fx_rate_source: "stub-ECB",
        fx_rate_age_days: 0,
        category: "subscription",
        raw_response_sha256: "abc",
        provenance: "stripe-api",
      };
      writeRevenueSnapshot(root, snap);
      const path = join(root, "memory", "_audit", "finance", "2026-05-11.jsonl");
      assert.ok(existsSync(path));
    });
  });
});

describe("finance/StripeFetcher", () => {
  it("returns RevenueSnapshot[] for Stripe payouts", async () => {
    const fetcher = new StripeFetcher(
      "sk_test_mock",
      "EUR",
      mockFetch({
        data: [
          { id: "po_1", amount: 14230, currency: "eur", status: "paid" },
          { id: "po_2", amount: 5000, currency: "eur", status: "paid" },
        ],
      }),
    );

    const snaps = await fetcher.fetch("2026-05-10", "Arcanea BV");
    assert.equal(snaps.length, 2);
    assert.equal(snaps[0].amount, 142.30); // minor units converted
    assert.equal(snaps[0].currency, "EUR");
    assert.equal(snaps[0].entity, "Arcanea BV");
    assert.ok(snaps[0].amount_usd_equiv > snaps[0].amount); // EUR > USD baseline (stub 1.081)
  });

  it("classifies failed/reversed status as refund", async () => {
    const fetcher = new StripeFetcher(
      "sk_test_mock",
      "EUR",
      mockFetch({
        data: [{ id: "po_failed", amount: 1000, currency: "eur", status: "failed" }],
      }),
    );
    const snaps = await fetcher.fetch("2026-05-10", "Arcanea BV");
    assert.equal(snaps[0].category, "refund");
  });

  it("returns empty array when no payouts", async () => {
    const fetcher = new StripeFetcher("sk_test", "EUR", mockFetch({ data: [] }));
    const snaps = await fetcher.fetch("2026-05-10", "Arcanea BV");
    assert.equal(snaps.length, 0);
  });

  it("throws on non-ok response", async () => {
    const fetcher = new StripeFetcher("sk_bad", "EUR", mockFetch({}, 401, false));
    await assert.rejects(() => fetcher.fetch("2026-05-10", "Arcanea BV"), /Stripe API 401/);
  });
});

describe("finance/pnl", () => {
  it("computePnL sums revenue snapshots for entity in period", async () => {
    await withTempRepo((root) => {
      const dir = join(root, "memory", "_audit", "finance");
      mkdirSync(dir, { recursive: true });
      const lines = [
        { entity: "Arcanea BV", amount_usd_equiv: 100, category: "subscription" },
        { entity: "Arcanea BV", amount_usd_equiv: 50, category: "one-off" },
        { entity: "Other", amount_usd_equiv: 1000, category: "subscription" }, // filtered out
      ];
      writeFileSync(
        join(dir, "2026-05-10.jsonl"),
        lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
      );
      const pnl = computePnL(root, "Arcanea BV", "2026-05-01", "2026-05-31");
      assert.equal(pnl.inflows_usd, 150);
      assert.equal(pnl.snapshot_count, 2);
      assert.equal(pnl.by_category["subscription"].in, 100);
    });
  });

  it("computePnL nets cost outflows", async () => {
    await withTempRepo((root) => {
      const revDir = join(root, "memory", "_audit", "finance");
      const costDir = join(root, "memory", "_audit", "cost");
      mkdirSync(revDir, { recursive: true });
      mkdirSync(costDir, { recursive: true });
      writeFileSync(
        join(revDir, "2026-05-10.jsonl"),
        JSON.stringify({ entity: "Arcanea BV", amount_usd_equiv: 200, category: "subscription" }) + "\n",
      );
      writeFileSync(
        join(costDir, "2026-05-10.jsonl"),
        JSON.stringify({ source: "vercel", cost_usd: 30 }) + "\n" +
          JSON.stringify({ source: "anthropic", cost_usd: 70 }) + "\n",
      );
      const pnl = computePnL(root, "Arcanea BV", "2026-05-01", "2026-05-31");
      assert.equal(pnl.inflows_usd, 200);
      assert.equal(pnl.outflows_usd, 100);
      assert.equal(pnl.net_usd, 100);
    });
  });

  it("computeRunway throws StaleCashError on stale cash", () => {
    withTempRepo((root) => {
      const entity: Entity = {
        name: "Test",
        type: "operating-company",
        jurisdiction: "NL",
        currency_base: "EUR",
        role: "test",
        operates: [],
        current_cash: {
          amount: 100000,
          currency: "EUR",
          last_updated: new Date(Date.now() - 30 * 86_400_000).toISOString(),
        },
      };
      assert.throws(() => computeRunway(root, entity), StaleCashError);
    });
  });

  it("computeRunway returns Infinity when no burn (profitable)", () => {
    withTempRepo((root) => {
      const entity: Entity = {
        name: "Test",
        type: "operating-company",
        jurisdiction: "NL",
        currency_base: "EUR",
        role: "test",
        operates: [],
        current_cash: {
          amount: 10000,
          currency: "EUR",
          last_updated: new Date().toISOString(),
        },
      };
      // No revenue or cost data → net = 0 → burn = 0 → runway = Infinity
      const runway = computeRunway(root, entity);
      assert.equal(runway.runway_months, Infinity);
    });
  });
});

describe("finance/runDailyRevenueSnapshot", () => {
  it("returns registry-fail when private/business-registry.json missing", async () => {
    await withTempRepo(async (root) => {
      const secrets = new EnvSecretsClient({ STRIPE_API_KEY: "sk_test" });
      const results = await runDailyRevenueSnapshot(root, secrets, "2026-05-10");
      assert.equal(results.length, 1);
      assert.equal(results[0].source, "registry");
      assert.equal(results[0].status, "fail");
    });
  });

  it("returns stripe-fail when STRIPE_API_KEY missing", async () => {
    await withTempRepo(async (root) => {
      setupRegistry(root);
      const secrets = new EnvSecretsClient({});
      const results = await runDailyRevenueSnapshot(root, secrets, "2026-05-10");
      const stripeResult = results.find((r) => r.source === "stripe");
      assert.ok(stripeResult);
      assert.equal(stripeResult.status, "fail");
      assert.match(stripeResult.error ?? "", /STRIPE_API_KEY/);
    });
  });

  it("returns skipped when Arcanea BV not in registry", async () => {
    await withTempRepo(async (root) => {
      const reg = makeFreshRegistry();
      reg.entities[0].name = "Some Other Entity"; // not Arcanea BV
      setupRegistry(root, reg);
      const secrets = new EnvSecretsClient({ STRIPE_API_KEY: "sk_test" });
      const results = await runDailyRevenueSnapshot(root, secrets, "2026-05-10");
      const skipped = results.find((r) => r.status === "skipped");
      assert.ok(skipped, "expected skipped result for missing Phase 1 entity");
    });
  });
});

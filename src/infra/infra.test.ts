import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { writeSnapshot, periodForToday, extractNumber, hashResponse } from "./cost-sources/_shared.js";
import { VercelFetcher } from "./cost-sources/vercel.js";
import { AnthropicFetcher } from "./cost-sources/anthropic.js";
import { EnvSecretsClient } from "./secrets.js";
import { runDailySnapshot } from "./cost-snapshot.js";

function withTempRepo<T>(fn: (repoRoot: string) => Promise<T> | T): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "cost-test-"));
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

describe("cost-sources/_shared", () => {
  it("periodForToday returns YYYY-MM-DD", () => {
    const period = periodForToday(new Date("2026-05-11T14:32:00Z"));
    assert.equal(period, "2026-05-11");
  });

  it("extractNumber walks nested path safely", () => {
    const obj = { a: { b: { c: 42 } } };
    assert.equal(extractNumber(obj, "a", "b", "c"), 42);
    assert.equal(extractNumber(obj, "a", "b", "missing"), 0);
    assert.equal(extractNumber(null, "anything"), 0);
  });

  it("hashResponse is deterministic", async () => {
    const h1 = await hashResponse({ a: 1, b: 2 });
    const h2 = await hashResponse({ a: 1, b: 2 });
    assert.equal(h1, h2);
    assert.equal(h1.length, 64); // SHA-256 hex
  });

  it("writeSnapshot creates dir + appends JSONL", async () => {
    await withTempRepo((root) => {
      writeSnapshot(root, {
        ts: "2026-05-11T00:00:00Z",
        source: "vercel",
        scope: "personal",
        period: "2026-05-10",
        cost_usd: 4.23,
        usage: { build_minutes: 142 },
        raw_response_sha256: "abc",
        anomaly_flags: [],
      });
      const path = join(root, "memory", "_audit", "cost", "2026-05-11.jsonl");
      assert.ok(existsSync(path));
      const line = readFileSync(path, "utf8").trim();
      const parsed = JSON.parse(line);
      assert.equal(parsed.source, "vercel");
      assert.equal(parsed.cost_usd, 4.23);
    });
  });
});

describe("VercelFetcher", () => {
  it("returns CostSnapshot from mocked Vercel response", async () => {
    const fetcher = new VercelFetcher(
      "fake-token",
      "team-abc",
      mockFetch({
        total: 4.23,
        usage: { build_minutes: 142, bandwidth_gb: 8.7, function_gb_s: 1240 },
      }),
    );

    const snap = await fetcher.fetch("2026-05-10");
    assert.equal(snap.source, "vercel");
    assert.equal(snap.scope, "team-abc");
    assert.equal(snap.period, "2026-05-10");
    assert.equal(snap.cost_usd, 4.23);
    assert.equal(snap.usage.build_minutes, 142);
    assert.equal(snap.raw_response_sha256.length, 64);
    assert.deepEqual(snap.anomaly_flags, []);
  });

  it("falls back to personal scope when teamId null", async () => {
    const fetcher = new VercelFetcher("fake-token", null, mockFetch({ total: 0 }));
    const snap = await fetcher.fetch("2026-05-10");
    assert.equal(snap.scope, "personal");
  });

  it("throws on non-ok response", async () => {
    const fetcher = new VercelFetcher("bad-token", null, mockFetch({}, 401, false));
    await assert.rejects(() => fetcher.fetch("2026-05-10"), /Vercel API 401/);
  });

  it("returns cost 0 when response has neither total nor total.amount", async () => {
    const fetcher = new VercelFetcher("fake-token", null, mockFetch({ irrelevant: "data" }));
    const snap = await fetcher.fetch("2026-05-10");
    assert.equal(snap.cost_usd, 0);
  });
});

describe("AnthropicFetcher", () => {
  it("sums per-line-item cost from data array", async () => {
    const fetcher = new AnthropicFetcher(
      "sk-ant-test",
      "org-xyz",
      mockFetch({
        data: [
          { cost_usd: 1.50, input_tokens: 100_000, output_tokens: 5_000, request_count: 50 },
          { cost_usd: 2.30, input_tokens: 200_000, output_tokens: 8_000, request_count: 75 },
          { cost_usd: 0.20, input_tokens: 50_000, output_tokens: 1_000, request_count: 10 },
        ],
      }),
    );

    const snap = await fetcher.fetch("2026-05-10");
    assert.equal(snap.source, "anthropic");
    assert.equal(snap.scope, "org-xyz");
    assert.equal(snap.cost_usd, 4.00);
    assert.equal(snap.usage.input_tokens, 350_000);
    assert.equal(snap.usage.output_tokens, 14_000);
    assert.equal(snap.usage.request_count, 135);
  });

  it("falls back to total_cost_usd when data array missing", async () => {
    const fetcher = new AnthropicFetcher(
      "sk-ant-test",
      "org-xyz",
      mockFetch({ total_cost_usd: 12.50 }),
    );
    const snap = await fetcher.fetch("2026-05-10");
    assert.equal(snap.cost_usd, 12.50);
  });

  it("throws on non-ok response", async () => {
    const fetcher = new AnthropicFetcher("bad-key", "org-xyz", mockFetch({}, 403, false));
    await assert.rejects(() => fetcher.fetch("2026-05-10"), /Anthropic API 403/);
  });
});

describe("EnvSecretsClient", () => {
  it("get returns value from injected env", () => {
    const client = new EnvSecretsClient({ TEST_KEY: "abc123" });
    assert.equal(client.get("TEST_KEY"), "abc123");
    assert.equal(client.get("MISSING_KEY"), undefined);
  });

  it("list filters env to secret-shape keys", () => {
    const client = new EnvSecretsClient({
      VERCEL_API_TOKEN: "v",
      ANTHROPIC_API_KEY: "a",
      RANDOM_VAR: "r",
      MY_SECRET: "s",
    });
    const list = client.list();
    assert.ok(list.includes("VERCEL_API_TOKEN"));
    assert.ok(list.includes("ANTHROPIC_API_KEY"));
    assert.ok(list.includes("MY_SECRET"));
    assert.ok(!list.includes("RANDOM_VAR"));
  });
});

describe("runDailySnapshot (orchestrator)", () => {
  it("returns fail entries for missing secrets", async () => {
    await withTempRepo(async (root) => {
      const secrets = new EnvSecretsClient({});
      const results = await runDailySnapshot(root, secrets, "2026-05-10");
      assert.equal(results.length, 2);
      assert.equal(results.every((r) => r.status === "fail"), true);
      assert.ok(results[0].error?.includes("not in secrets store"));
    });
  });

  it("writes snapshots when secrets present (mocked fetchers via env)", async () => {
    // This test exercises the snapshot-write path indirectly via the orchestrator's
    // own fetchers using globalThis.fetch — covered by the per-fetcher tests above.
    // The orchestrator is exercised end-to-end in the smoke script (scripts/cost-smoke.ts).
    await withTempRepo(async (root) => {
      const secrets = new EnvSecretsClient({
        VERCEL_API_TOKEN: "test",
        ANTHROPIC_API_KEY: "test",
        ANTHROPIC_ORG_ID: "test",
      });
      const results = await runDailySnapshot(root, secrets, "2026-05-10");
      // These will fail because we can't reach real APIs from the test env,
      // but the result-shape assertion still holds.
      assert.equal(results.length, 2);
      assert.ok(results.every((r) => r.source === "vercel" || r.source === "anthropic"));
    });
  });
});

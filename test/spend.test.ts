import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SPEND_LEDGER_VERSION, adviseRoute, parseLedger, parseTokscaleGraph, parseTokscaleUsage, planSpend,
  type SpendLedger } from "../src/spend.js";
import { runSpendCli, type SpendCliDeps } from "../src/spend-cli.js";

// Shapes copied from tokscale 4.17 `graph` and `usage --json` output.
const graph = {
  contributions: [
    { date: "2026-10-01", totals: { tokens: 1_000, cost: 30 }, clients: [
      { client: "claude", modelId: "claude-opus-5-5", providerId: "anthropic", tokens: { input: 100, output: 100, cacheRead: 300, cacheWrite: 0, reasoning: 0 }, cost: 20 },
      { client: "copilot", modelId: "claude-opus-5-5", providerId: "anthropic", tokens: { input: 50, output: 50, cacheRead: 0, cacheWrite: 0, reasoning: 0 }, cost: 4 },
      { client: "opencode", modelId: "big-pickle", providerId: "opencode", tokens: { input: 200, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 }, cost: 0 },
    ] },
    { date: "2026-10-02", totals: { tokens: 400, cost: 6 }, clients: [
      { client: "codex", modelId: "gpt-6.1-sol", providerId: "openai", tokens: { input: 100, output: 100, cacheRead: 100, cacheWrite: 0, reasoning: 0 }, cost: 6 },
      { client: "hermes", modelId: "mystery-model", providerId: "other", tokens: { input: 100, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 }, cost: 0 },
    ] },
  ],
};

const usage = [
  { provider: "Claude", plan: "Max 20x", metrics: [
    { label: "Session", used_percent: 40, resets_at: "2026-10-19T01:00:00Z" },
    { label: "Weekly", used_percent: 7, resets_at: "2026-10-25T04:00:00Z" },
  ] },
  { provider: "Codex", plan: "Pro", metrics: [{ label: "Weekly", used_percent: 12, resets_at: "2026-10-24T22:00:00Z" }],
    reset_credits: { available_count: 1 } },
  { provider: "Copilot", plan: "Individual_max", metrics: [{ label: "Premium", used_percent: 100, resets_at: "2026-11-01" }] },
];

const ledger: SpendLedger = {
  schema: SPEND_LEDGER_VERSION,
  subscriptions: [
    { id: "claude-max", vendor: "claude", plan: "Claude Max 20x", amount: 200, currency: "USD", period: "month", status: "derived" },
    { id: "chatgpt", vendor: "openai", plan: "ChatGPT Pro", amount: null, currency: "USD", period: "month", status: "unconfirmed" },
    { id: "copilot", vendor: "github-copilot", plan: "Copilot Pro+", amount: 39, currency: "USD", period: "month", status: "derived" },
    { id: "google", vendor: "gemini", plan: "Google AI Ultra", amount: 99.99, currency: "EUR", period: "month", status: "confirmed" },
  ],
  topUps: [{ vendor: "openrouter", amount: 10, currency: "USD", date: "2026-10-05" }, { vendor: "x", amount: 99, currency: "USD", date: "2026-09-30" }],
};

describe("tokscale parsing", () => {
  it("sums tokens and worth per client and names unpriced models, not free ones", () => {
    const u = parseTokscaleGraph(graph);
    assert.equal(u.worthUsd, 36);
    assert.deepEqual(u.clients.find(c => c.client === "claude"), { client: "claude", tokens: 500, worthUsd: 20 });
    assert.deepEqual(u.unpriced, ["mystery-model"]);
  });

  it("reads plans, windows and reset credits from the quota report", () => {
    const q = parseTokscaleUsage(usage);
    assert.equal(q[0].vendor, "claude");
    assert.equal(q[1].resetCredits, 1);
    assert.equal(q[2].vendor, "github-copilot");
  });

  it("tolerates empty or malformed input instead of throwing", () => {
    assert.equal(parseTokscaleGraph(null).worthUsd, 0);
    assert.deepEqual(parseTokscaleUsage({}), []);
  });
});

describe("spend planning", () => {
  const report = planSpend({ usage: parseTokscaleGraph(graph), quota: parseTokscaleUsage(usage), ledger, usdPerEur: null, sinceDate: "2026-10-01" });

  it("credits a plan with the work done in its own client, whatever model that client called", () => {
    const claude = report.plans.find(p => p.vendor === "claude")!;
    const copilot = report.plans.find(p => p.vendor === "github-copilot")!;
    assert.equal(claude.worthUsd, 20);
    assert.equal(copilot.worthUsd, 4);
    assert.equal(claude.multiple, 0.1);
  });

  it("uses the weekly window as headroom and ignores the session window", () => {
    assert.equal(report.plans.find(p => p.vendor === "claude")!.leftPercent, 93);
  });

  it("leaves a EUR price unconverted when no exchange rate is known", () => {
    const google = report.plans.find(p => p.vendor === "gemini")!;
    assert.equal(google.paidUsd, null);
    assert.equal(google.multiple, null);
  });

  it("lists unpriced plans, unattached clients and this month's top-ups only", () => {
    assert.deepEqual(report.missingPrices, ["chatgpt"]);
    assert.deepEqual(report.unattached.map(c => c.client).sort(), ["hermes", "opencode"]);
    assert.equal(report.topUpsUsd, 10);
  });

  it("routes the next long job to the plan with the most weekly room and flags exhausted ones", () => {
    const route = adviseRoute(parseTokscaleUsage(usage));
    assert.equal(route.runOn, "claude");
    assert.deepEqual(route.exhausted, ["github-copilot"]);
    assert.deepEqual(route.resetCreditsAvailable, ["openai"]);
  });

  it("says when no plan has room", () => {
    const route = adviseRoute(parseTokscaleUsage([{ provider: "Claude", plan: "Pro", metrics: [{ label: "Weekly", used_percent: 95 }] }]));
    assert.equal(route.runOn, null);
  });
});

describe("spend cli", () => {
  function deps(): SpendCliDeps & { path: string } {
    const path = join(mkdtempSync(join(tmpdir(), "sis-spend-")), "spend.v1.json");
    writeFileSync(path, JSON.stringify(ledger));
    return { path, ledgerPath: path, today: "2026-10-19", readUsage: () => parseTokscaleGraph(graph),
      readQuota: () => parseTokscaleUsage(usage), readFx: async () => 1.1 };
  }

  it("confirms a price and keeps the ledger valid", async () => {
    const d = deps();
    const result = await runSpendCli(["spend", "set", "chatgpt", "200", "USD"], d);
    assert.equal(result.exitCode, 0);
    const saved = parseLedger(JSON.parse(readFileSync(d.path, "utf8")));
    const sub = saved.subscriptions.find(s => s.id === "chatgpt")!;
    assert.equal(sub.amount, 200);
    assert.equal(sub.status, "confirmed");
  });

  it("refuses an unknown plan, a bad amount and an unsupported currency without writing", async () => {
    const d = deps();
    const before = readFileSync(d.path, "utf8");
    for (const args of [["spend", "set", "nope", "1"], ["spend", "set", "chatgpt", "abc"], ["spend", "set", "chatgpt", "5", "GBP"]]) {
      assert.equal((await runSpendCli(args, d)).exitCode, 1);
    }
    assert.equal(readFileSync(d.path, "utf8"), before);
  });

  it("logs a top-up with today's date", async () => {
    const d = deps();
    assert.equal((await runSpendCli(["spend", "topup", "OpenRouter", "25", "usd"], d)).exitCode, 0);
    const saved = parseLedger(JSON.parse(readFileSync(d.path, "utf8")));
    assert.deepEqual(saved.topUps.at(-1)!.date, "2026-10-19");
  });

  it("prints the route as JSON for agents", async () => {
    const result = await runSpendCli(["plan", "--json"], deps());
    assert.equal(JSON.parse(result.stdout).runOn, "claude");
  });

  it("converts EUR plans when a rate is available", async () => {
    const result = await runSpendCli(["spend", "--json"], deps());
    const google = JSON.parse(result.stdout).plans.find((p: { vendor: string }) => p.vendor === "gemini");
    assert.equal(Math.round(google.paidUsd * 100) / 100, 109.99);
  });
});

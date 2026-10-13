// node --import ./scripts/test/register.mjs --test src/lib/desk/pricing.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { PRICING, baselineCostEur, isPaidStage, isVerified, isVerifiedCallPrice, modelCostEur, pricingIsComplete, retrievalCostEur, unpricedStages } from "./pricing.ts";

test("an unverified price yields no euro figure at all", () => {
  assert.equal(modelCostEur("openai/gpt-oss-120b", 1_000_000, 1_000_000), null);
  assert.equal(baselineCostEur(1_000_000, 1_000_000), null);
  assert.equal(retrievalCostEur("tavily"), null);
  assert.equal(pricingIsComplete(), false, "the shipped table is unpriced until the console is read");
});

test("a dated price computes euros from token counts", () => {
  const table = {
    ...PRICING,
    models: {
      "m": { eurPerMillionInput: 0.1, eurPerMillionOutput: 0.4, verifiedAt: "2026-09-22", source: "console" },
    },
    baselines: {
      "closed-api": { label: "x", eurPerMillionInput: 3, eurPerMillionOutput: 15, verifiedAt: "2026-09-22", source: "list" },
    },
    retrieval: { tavily: { eurPerCall: 0.008, verifiedAt: "2026-09-22", source: "console" } },
  };
  assert.equal(modelCostEur("m", 1_000_000, 500_000, table), 0.3);
  assert.equal(baselineCostEur(1_000_000, 500_000, "closed-api", table), 10.5);
  assert.equal(retrievalCostEur("tavily", 2, table), 0.016);
  assert.equal(pricingIsComplete(table), true);
});

test("a half-filled price stays unverified", () => {
  assert.equal(isVerified({ eurPerMillionInput: 1, eurPerMillionOutput: null, verifiedAt: "2026-09-22" }), false);
  assert.equal(isVerified({ eurPerMillionInput: 1, eurPerMillionOutput: 2, verifiedAt: null }), false);
  assert.equal(isVerified(undefined), false);
});

test("a negative, infinite or NaN rate, or a date that is not a real date, leaves a price unverified", () => {
  const ok = { eurPerMillionInput: 1, eurPerMillionOutput: 2, verifiedAt: "2026-09-22" };
  assert.equal(isVerified(ok), true);
  assert.equal(isVerified({ ...ok, eurPerMillionInput: 0 }), true, "a free rate is a real rate");
  assert.equal(isVerified({ ...ok, verifiedAt: "2026-09-22T10:00:00Z" }), true);
  for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(isVerified({ ...ok, eurPerMillionInput: bad }), false, `input rate ${bad}`);
    assert.equal(isVerified({ ...ok, eurPerMillionOutput: bad }), false, `output rate ${bad}`);
  }
  for (const date of ["yes", "x", "2026-02-30", "2026-13-01", "22.09.2026", " 2026-09-22"]) {
    assert.equal(isVerified({ ...ok, verifiedAt: date }), false, `date ${JSON.stringify(date)}`);
  }
  const table = { ...PRICING, models: { m: { ...ok, eurPerMillionInput: -1, source: "console" } } };
  assert.equal(modelCostEur("m", 1000, 1000, table), null, "a negative rate yields no euro figure");
});

test("a retrieval price must be a finite, nonnegative rate with a real date", () => {
  const table = (eurPerCall, verifiedAt) => ({ ...PRICING, retrieval: { tavily: { eurPerCall, verifiedAt, source: "console" } } });
  assert.equal(retrievalCostEur("tavily", 1, table(0.008, "2026-09-22")), 0.008);
  assert.equal(retrievalCostEur("tavily", 1, table(-0.008, "2026-09-22")), null);
  assert.equal(retrievalCostEur("tavily", 1, table(Number.NaN, "2026-09-22")), null);
  assert.equal(retrievalCostEur("tavily", 1, table(0.008, "soon")), null);
  assert.equal(isVerifiedCallPrice({ eurPerCall: 0.008, verifiedAt: "2026-09-22" }), true);
});

test("the shipped table names the three cascade models and the baseline", () => {
  assert.ok(PRICING.models["nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B"]);
  assert.ok(PRICING.models["deepseek-ai/DeepSeek-V4-Flash-0731"]);
  assert.ok(PRICING.models["openai/gpt-oss-120b"]);
  assert.ok(PRICING.baselines["closed-api"]);
});

test("the table is incomplete while retrieval is unpriced, even with every model dated", () => {
  const price = { eurPerMillionInput: 1, eurPerMillionOutput: 2, verifiedAt: "2026-09-22", source: "console" };
  const table = {
    ...PRICING,
    models: { m: price },
    baselines: { "closed-api": { label: "x", ...price } },
  };
  assert.equal(pricingIsComplete(table), false);
  assert.ok(PRICING.retrieval.tavily, "the shipped table carries a retrieval entry");
  assert.equal(PRICING.retrieval.tavily.eurPerCall, null);
});

test("paid work is a model stage or a retrieval stage that ran; the vault and skipped stages are not", () => {
  const stages = [
    { name: "recall", status: "ok", provider: "vault", costEur: 0 },
    { name: "retrieve", status: "ok", provider: "tavily" },
    { name: "extract", status: "ok", model: "m", provider: "nebius", costEur: 0.001 },
    { name: "synthesize", status: "failed", model: "m", provider: "nebius" },
    { name: "contradict", status: "skipped", model: "m", provider: "nebius" },
    { name: "remember", status: "ok", provider: "vault", costEur: 0 },
  ];
  assert.deepEqual(stages.map((stage) => isPaidStage(stage)), [false, true, true, true, false, false]);
  assert.deepEqual(unpricedStages(stages), ["retrieve", "synthesize"]);
});

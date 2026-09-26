// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/edge-meter.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { edgeMeter } from "./edge-meter.ts";
import { PRICING } from "./pricing.ts";

const RUN = {
  costEur: 0.0033,
  latencyMs: 8400,
  tokens: { input: 20000, output: 2800 },
  groundingRate: 0.92,
  rubricScore: 8.4,
  pricesVerified: true,
};

const PRICED = {
  ...PRICING,
  baselines: {
    "closed-api": { label: "Closed API, published list price", eurPerMillionInput: 3, eurPerMillionOutput: 15, verifiedAt: "2026-09-22", source: "list" },
  },
};

test("with both sides priced, the meter states the multiple", () => {
  const meter = edgeMeter(RUN, "closed-api", PRICED);
  const cost = meter.rows.find((row) => row.axis === "cost");
  assert.equal(cost.ours, "€0.0033");
  assert.equal(cost.baseline, "€0.1020", "20k in at €3/M plus 2.8k out at €15/M");
  assert.equal(cost.ratio, 30.9);
  assert.equal(meter.readable, true);
});

test("an unpriced side reports itself as unpriced and withholds the multiple", () => {
  const meter = edgeMeter({ ...RUN, pricesVerified: false }, "closed-api", PRICING);
  const cost = meter.rows.find((row) => row.axis === "cost");
  assert.equal(cost.ours, "unpriced");
  assert.equal(cost.baseline, "unpriced");
  assert.equal(cost.ratio, null);
  assert.equal(meter.readable, false);
});

test("the other three axes carry the run's own measurements", () => {
  const meter = edgeMeter(RUN, "closed-api", PRICED);
  assert.equal(meter.rows.find((row) => row.axis === "speed").ours, "8.4 s");
  assert.equal(meter.rows.find((row) => row.axis === "grounding").ours, "92%");
  assert.equal(meter.rows.find((row) => row.axis === "quality").ours, "8.4");
  assert.equal(meter.rows.find((row) => row.axis === "quality").ratio, null, "a rubric is not a ratio");
});

test("a run with no judgement shows a dash rather than a zero", () => {
  const meter = edgeMeter({ ...RUN, rubricScore: null }, "closed-api", PRICED);
  assert.equal(meter.rows.find((row) => row.axis === "quality").ours, "—");
});

test("a free run yields no multiple, because dividing by zero proves nothing", () => {
  const meter = edgeMeter({ ...RUN, costEur: 0 }, "closed-api", PRICED);
  assert.equal(meter.rows.find((row) => row.axis === "cost").ratio, null);
});

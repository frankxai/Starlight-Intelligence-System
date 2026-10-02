// node --import ./scripts/test/register.mjs --test src/lib/desk/cost-copy.test.mjs
//
// The page's cost copy, proven without a browser: a subtotal is called a
// subtotal, every gap is named with its reason, and only an unpriced gap is
// described as something a price can close.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { CALL_COUNT_UNKNOWN, UNPRICED, USAGE_UNREPORTED, costFigure, costWarning } from "./cost-copy.ts";

test("a complete run shows its total; an incomplete one shows a labelled subtotal", () => {
  assert.equal(costFigure(true, 0.0123), "€0.0123");
  assert.equal(costFigure(false, 0.0123), "€0.0123 subtotal");
});

test("the warning names every gap with its reason and never claims euros are withheld", () => {
  const text = costWarning(0.004, [
    { stage: "retrieve", reason: CALL_COUNT_UNKNOWN },
    { stage: "synthesize", reason: USAGE_UNREPORTED },
    { stage: "judge", reason: UNPRICED },
  ]);
  assert.match(text, /€0\.0040 is a subtotal of the stages with a known cost/);
  assert.match(text, /retrieve \(the number of billable search calls is unknown\)/);
  assert.match(text, /synthesize \(the provider did not report its token usage\)/);
  assert.match(text, /judge \(no verified price yet\)/);
  assert.match(text, /Once a price is verified, judge will be counted on later runs\./);
  assert.match(text, /For retrieve and synthesize the usage itself is unknown, so no price can complete this run's total\./);
  assert.match(text, /The receipt is an unsigned draft\.$/);
  assert.doesNotMatch(text, /withhold/i);
});

test("a run whose only gaps are unknown usage does not suggest that prices would fix it", () => {
  const text = costWarning(0.01, [{ stage: "extract", reason: USAGE_UNREPORTED }]);
  assert.doesNotMatch(text, /Once a price is verified/);
  assert.match(text, /For extract the usage itself is unknown/);
});

test("the page renders this copy and shows no internal file path", async () => {
  const page = await readFile(new URL("../../app/desk/DeskConsole.tsx", import.meta.url), "utf8");
  assert.match(page, /costWarning\(/);
  assert.match(page, /costFigure\(/);
  assert.doesNotMatch(page, /withholds euros/);
  assert.doesNotMatch(page, /src\/lib\/desk\/pricing\.ts/);
});

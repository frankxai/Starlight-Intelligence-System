import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJsonl, summarize, validateObservation } from "../tools/measure-capability-transfer.mjs";

const synthetic = {
  schemaVersion: "1.0.0", id: "synthetic-1", sourceVenture: "venture-a", destinationVenture: "venture-b",
  capabilityId: "context-import", capabilityVersion: "1.0.0", permissionRef: "synthetic://permission",
  sourceVerificationRef: "synthetic://source-test", destinationApplicationRef: "synthetic://destination-test",
  baseline: { value: 10, unit: "hours", direction: "lower" }, outcome: { value: 7, unit: "hours" },
  measurementMethod: "Synthetic controlled example", attributionLimits: "Test fixture only; no real venture outcome",
  observedAt: "2026-09-23T00:00:00Z", reviewedBy: "synthetic reviewer",
};

test("missing input remains unmeasured, never zero", () => {
  assert.equal(summarize([]).status, "unmeasured");
  assert.equal(summarize([]).observations, null);
});

test("complete synthetic observation is counted without a verified-outcome claim", () => {
  const result = summarize([synthetic]);
  assert.equal(result.improvingObservations, 1);
  assert.match(result.evidenceLevel, /separate verification/);
});

test("same-venture transfer and mismatched units are rejected", () => {
  assert.match(validateObservation({ ...synthetic, destinationVenture: "venture-a" }).join(" "), /must differ/);
  assert.match(validateObservation({ ...synthetic, outcome: { value: 7, unit: "days" } }).join(" "), /units must match/);
});

test("JSONL parser rejects malformed records", () => {
  assert.throws(() => parseJsonl('{"a": 1}\n{bad'), /line 2/);
});

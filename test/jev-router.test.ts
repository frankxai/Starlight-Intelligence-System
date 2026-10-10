import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareJevRouterRequest, inspectJevRouterResponse, type JevRouterPolicy } from "../src/runtime-bridge/jev-router.js";

const now = Date.parse("2026-10-10T12:00:00Z");
const policy: JevRouterPolicy = { classification: "public", region: "global", costTier: "medium",
  models: ["fixture/model-a"], pool: { models: ["fixture/model-a", "fixture/model-b"],
    verifiedAt: new Date(now).toISOString() }, maxCompletionTokens: 512 };
const response = () => ({ model: "fixture/model-a", choices: [{ finish_reason: "stop", message: { content: "ok" } }],
  openrouter_metadata: { pipeline: [{ name: "jev-router", data: { resolved_models: ["fixture/model-a"] } }] } });

test("public pilot snapshots host policy and requests routing metadata without credentials", () => {
  const p = structuredClone(policy); const r = prepareJevRouterRequest("Public task", p, now);
  p.models.push("fixture/model-b");
  assert.deepEqual(r.approvedModels, ["fixture/model-a"]);
  assert.equal(r.body.stream, false);
  assert.equal(r.headers["X-OpenRouter-Metadata"], "enabled");
  assert.equal(JSON.stringify(r).includes("Authorization"), false);
});

test("private, regional, empty, wildcard, unknown and stale routes fail before transmission", () => {
  for (const patch of [{ classification: "private" }, { region: "eu" }, { costTier: "cheap" },
    { models: [] }, { models: ["fixture/*"] }, { models: ["~fixture/model-latest"] },
    { models: ["fixture/missing"] }, { models: ["Fixture/model-a"] }, { maxCompletionTokens: 0 },
    { pool: { ...policy.pool, verifiedAt: "invalid" } },
    { pool: { ...policy.pool, verifiedAt: new Date(now - 3_600_001).toISOString() } }]) {
    assert.throws(() => prepareJevRouterRequest("ok", { ...policy, ...patch } as JevRouterPolicy, now));
  }
  assert.throws(() => prepareJevRouterRequest("x".repeat(16_385), policy, now), /16 KiB/);
});

test("served models, fallbacks and advisors must remain within host admission", () => {
  assert.equal(inspectJevRouterResponse(response(), policy.models).accepted, true);
  const r = response(); r.openrouter_metadata.pipeline[0].data.resolved_models.push("fixture/model-b");
  assert.equal(inspectJevRouterResponse(r, policy.models).reason, "unapproved-model");
  const advisor = response(); Object.assign(advisor.openrouter_metadata.pipeline[0].data, { advisor_model: "fixture/model-b" });
  assert.equal(inspectJevRouterResponse(advisor, policy.models).reason, "unapproved-model");
  assert.equal(inspectJevRouterResponse(advisor, policy.pool.models).advisorModel, "fixture/model-b");
});

test("include fallback, missing or duplicate metadata cannot authorize output", () => {
  const r = response(); Object.assign(r.openrouter_metadata.pipeline[0].data, { list_fallback: "models_ignored" });
  assert.equal(inspectJevRouterResponse(r, policy.models).reason, "include-ignored");
  assert.equal(inspectJevRouterResponse({ ...response(), openrouter_metadata: {} }, policy.models).reason, "missing-metadata");
  const duplicate = response(); duplicate.openrouter_metadata.pipeline.push(duplicate.openrouter_metadata.pipeline[0]);
  assert.equal(inspectJevRouterResponse(duplicate, policy.models).reason, "missing-metadata");
});

test("truncation, tool calls, malformed JSON values and oversized results remain rejected", () => {
  assert.equal(inspectJevRouterResponse({ ...response(), choices: [{ finish_reason: "length", message: { content: "partial" } }] }, policy.models).accepted, false);
  assert.equal(inspectJevRouterResponse({ ...response(), choices: [{ finish_reason: "stop", message: { content: "ok", tool_calls: [] } }] }, policy.models).accepted, false);
  assert.equal(inspectJevRouterResponse({ ...response(), usage: NaN }, policy.models).accepted, false);
  const huge = response(); huge.choices[0].message.content = "x".repeat(65_536);
  assert.equal(inspectJevRouterResponse(huge, policy.models).accepted, false);
});

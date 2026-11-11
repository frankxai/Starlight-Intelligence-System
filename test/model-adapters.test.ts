import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  providerRouter,
  lookupModelCatalog,
  syntheticGenerator,
  MODEL_CATALOG,
  anthropicAdapter,
  googleAdapter,
  openaiAdapter,
} from "../src/orchestration/model-adapters/index.js";

describe("Frontier Model Adapters Layer", () => {
  it("registers all 6 frontier models across Anthropic, Google, and OpenAI", () => {
    const catalog = providerRouter.getCatalog();
    assert.equal(catalog.length, 6);

    const ids = catalog.map((m) => m.id);
    assert.ok(ids.includes("claude-sonnet-5-5"));
    assert.ok(ids.includes("claude-opus-5-5"));
    assert.ok(ids.includes("gemini-4-argon"));
    assert.ok(ids.includes("gemini-4-flash"));
    assert.ok(ids.includes("gpt-6-1-sol"));
    assert.ok(ids.includes("gpt-6-astra"));
  });

  it("normalizes model aliases correctly", () => {
    assert.equal(lookupModelCatalog("Claude Opus 5.5").id, "claude-opus-5-5");
    assert.equal(lookupModelCatalog("opus-5-5").id, "claude-opus-5-5");
    assert.equal(lookupModelCatalog("Gemini 4 Flash").id, "gemini-4-flash");
    assert.equal(lookupModelCatalog("gpt-6-astra").id, "gpt-6-astra");
    assert.equal(lookupModelCatalog("sol").id, "gpt-6-1-sol");
    assert.equal(lookupModelCatalog("unknown-frontier-model").id, "claude-sonnet-5-5");
  });

  it("produces deterministic, high-fidelity synthetic teammate traces", () => {
    const req1 = {
      prompt: "Design unified multi-agent memory bus architecture",
      teammateId: "starlight-queen",
      teammateName: "Starlight Queen",
      model: "claude-opus-5-5",
      tier: "frontier" as const,
      metadata: { voice: "queen" },
    };

    const trace1 = syntheticGenerator.generate(req1);
    const trace2 = syntheticGenerator.generate(req1);

    // Exact determinism: identical seed, tokens, duration, and content
    assert.equal(trace1.id, trace2.id);
    assert.equal(trace1.usage.promptTokens, trace2.usage.promptTokens);
    assert.equal(trace1.usage.completionTokens, trace2.usage.completionTokens);
    assert.equal(trace1.durationMs, trace2.durationMs);
    assert.equal(trace1.content, trace2.content);
    assert.equal(trace1.synthetic, true);
    assert.equal(trace1.provider, "anthropic");
    assert.ok(trace1.content.includes("Starlight Queen Autonomic Directive"));
    assert.ok(trace1.content.includes("Built on SIP § 3"));
  });

  it("tailors synthetic voice outputs according to teammate persona", () => {
    const sentinelReq = {
      prompt: "Audit codebase for secret leaks",
      teammateId: "github-officer",
      teammateName: "GitHub Officer",
      model: "claude-sonnet-5-5",
      metadata: { voice: "sentinel" },
    };
    const sentinelTrace = syntheticGenerator.generate(sentinelReq);
    assert.ok(sentinelTrace.content.includes("Sentinel Guardian Audit"));

    const sageReq = {
      prompt: "Retrieve historical design decisions",
      teammateId: "sage",
      teammateName: "Sage",
      model: "claude-opus-5-5",
      metadata: { voice: "sage" },
    };
    const sageTrace = syntheticGenerator.generate(sageReq);
    assert.ok(sageTrace.content.includes("Sage Wisdom Ledger"));

    const weaverReq = {
      prompt: "Synthesize community vibes",
      teammateId: "community-lead",
      teammateName: "Community Lead",
      model: "gemini-4-argon",
      metadata: { voice: "weaver" },
    };
    const weaverTrace = syntheticGenerator.generate(weaverReq);
    assert.ok(weaverTrace.content.includes("Weaver Relational Synthesis"));
  });

  it("calculates realistic durations and token costs across tiers", () => {
    const lightModel = MODEL_CATALOG["gemini-4-flash"];
    const standardModel = MODEL_CATALOG["claude-sonnet-5-5"];
    const frontierModel = MODEL_CATALOG["claude-opus-5-5"];

    const lightUsage = syntheticGenerator.calculateUsage(
      "Quick status",
      lightModel,
      Buffer.alloc(8, 1),
      "light"
    );
    const frontierUsage = syntheticGenerator.calculateUsage(
      "Complex architecture review spanning 50 modules and formal invariants",
      frontierModel,
      Buffer.alloc(8, 1),
      "frontier"
    );

    // Light tier should be fast and inexpensive
    assert.ok(lightUsage.durationMs < 400);
    assert.ok(lightUsage.usage.completionTokens < 300);
    assert.ok(lightUsage.usage.estimatedCostUsd < 0.001);

    // Frontier tier should account for deeper reasoning and higher rates
    assert.ok(frontierUsage.durationMs > 500);
    assert.ok(frontierUsage.usage.completionTokens > 500);
    assert.ok(frontierUsage.usage.estimatedCostUsd > lightUsage.usage.estimatedCostUsd);
  });

  it("routes dynamically across Anthropic, Google, and OpenAI based on intent and keywords", () => {
    // Frontier routing
    const res1 = providerRouter.resolveModel("frontier", "build normal app");
    assert.equal(res1.modelName, "Claude Opus 5.5");
    assert.equal(res1.provider, "anthropic");

    // Intent-based frontier promotion
    const res2 = providerRouter.resolveModel("standard", "formal council synthesis and mathematical proof");
    assert.equal(res2.modelName, "Claude Opus 5.5");

    // Light routing for search and lint
    const res3 = providerRouter.resolveModel("light", "check database status");
    assert.equal(res3.modelName, "Gemini 4 Argon");
    assert.equal(res3.provider, "google");

    // Flash keyword targeting
    const res4 = providerRouter.resolveModel("standard", "instant triage and fast flash linting");
    assert.equal(res4.modelName, "Gemini 4 Flash");
    assert.equal(res4.provider, "google");

    // Explicit model targeting
    const res5 = providerRouter.resolveModel("standard", "optimize with gpt-6-astra compiler");
    assert.equal(res5.modelName, "GPT-6 Astra");
    assert.equal(res5.provider, "openai");

    const res6 = providerRouter.resolveModel("standard", "agent coordination using sol");
    assert.equal(res6.modelName, "GPT-6.1 Sol");
    assert.equal(res6.provider, "openai");

    // Standard default
    const res7 = providerRouter.resolveModel("standard", "implement checkout component");
    assert.equal(res7.modelName, "Claude Sonnet 5.5");
    assert.equal(res7.provider, "anthropic");
  });

  it("dispatches completions and streams chunks cleanly in offline mode", async () => {
    const request = {
      prompt: "Verify invariant gates across microvm nodes",
      teammateId: "starlight-queen",
      model: "claude-sonnet-5-5",
      offlineMode: true,
    };

    const completion = await providerRouter.dispatchCompletion(request);
    assert.equal(completion.provider, "anthropic");
    assert.equal(completion.synthetic, true);
    assert.ok(completion.content.includes("Completed:"));
    assert.ok(completion.usage.totalTokens > 0);

    // Stream verification
    const chunks: string[] = [];
    for await (const chunk of providerRouter.dispatchStream(request)) {
      chunks.push(chunk.delta);
    }
    assert.ok(chunks.length > 0);
    const combined = chunks.join("");
    assert.equal(combined.trim(), completion.content.trim());
  });

  it("exposes provider availability status summary", () => {
    const statuses = providerRouter.getProviderStatuses();
    assert.equal(statuses.length, 3);

    const anthropicStatus = statuses.find((s) => s.provider === "anthropic");
    const googleStatus = statuses.find((s) => s.provider === "google");
    const openaiStatus = statuses.find((s) => s.provider === "openai");

    assert.ok(anthropicStatus);
    assert.ok(googleStatus);
    assert.ok(openaiStatus);

    assert.deepEqual(anthropicStatus.supportedModels, ["claude-sonnet-5-5", "claude-opus-5-5"]);
    assert.deepEqual(googleStatus.supportedModels, ["gemini-4-argon", "gemini-4-flash"]);
    assert.deepEqual(openaiStatus.supportedModels, ["gpt-6-1-sol", "gpt-6-astra"]);
  });

  it("handles offline completions across all three provider adapters", async () => {
    const req = {
      prompt: "Simulate provider offline execution",
      offlineMode: true,
    };

    const anthropicRes = await anthropicAdapter.complete({ ...req, model: "claude-opus-5-5" });
    assert.equal(anthropicRes.provider, "anthropic");
    assert.equal(anthropicRes.synthetic, true);

    const googleRes = await googleAdapter.complete({ ...req, model: "gemini-4-argon" });
    assert.equal(googleRes.provider, "google");
    assert.equal(googleRes.synthetic, true);

    const openaiRes = await openaiAdapter.complete({ ...req, model: "gpt-6-1-sol" });
    assert.equal(openaiRes.provider, "openai");
    assert.equal(openaiRes.synthetic, true);
  });
});

/**
 * Investment-intelligence council — test suite.
 *
 * Verifies the layering contract the council makes on top of `runSwarm`:
 *   - the real catalog parses (11 agents, cross-cutting excluded from the roster);
 *   - each task carries its `recommended_model` (Sonnet analysis/risk · Opus
 *     portfolio-manager · Haiku technical);
 *   - phase ordering: all analysis settles before any risk runs; risk prompts
 *     contain the analysis output; analysis prompts contain NO peer output;
 *     synthesis runs last and sees the full debate;
 *   - `--only` filtering; a failed agent does not sink the phase.
 *
 * The real `claude -p` runner is never invoked — every test injects a fake.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { AgentRunner } from "./swarm.js";
import {
  buildCouncilPlan,
  loadIISCatalog,
  runCouncil,
  defaultCatalogPath,
} from "./swarm-council.js";

const CONTEXT = "weekly strategy — late-cycle regime, 60/30/10 portfolio";

describe("loadIISCatalog", () => {
  it("parses the real catalog with 11 agents and the expected models", () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    assert.equal(catalog.agents.length, 11);
    const model = (id: string) => catalog.agents.find((a) => a.id === id)?.recommended_model;
    assert.equal(model("macro-risk"), "claude-sonnet-4-6");
    assert.equal(model("technical"), "claude-haiku-4-5");
    assert.equal(model("portfolio-manager"), "claude-opus-4-7");
  });
});

describe("buildCouncilPlan", () => {
  it("threads recommended_model into every task and excludes the researcher", () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    const plan = buildCouncilPlan(catalog, { context: CONTEXT });

    assert.equal(plan.analysis.length, 5);
    assert.equal(plan.risk.length, 3);
    assert.equal(plan.synthesis.length, 2);

    const all = [...plan.analysis, ...plan.risk, ...plan.synthesis];
    assert.ok(all.every((t) => typeof t.model === "string" && t.model.length > 0));
    assert.ok(!all.some((t) => t.id === "researcher"), "researcher must be excluded from v1 roster");

    const pm = plan.synthesis.find((t) => t.id === "portfolio-manager");
    assert.equal(pm?.model, "claude-opus-4-7");
    const tech = plan.analysis.find((t) => t.id === "technical");
    assert.equal(tech?.model, "claude-haiku-4-5");
  });

  it("embeds the R5 clause and the no-execution boundary in every prompt", () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    const plan = buildCouncilPlan(catalog, { context: CONTEXT });
    const all = [...plan.analysis, ...plan.risk, ...plan.synthesis];
    assert.ok(all.every((t) => t.prompt.includes("[R5]")));
    assert.ok(all.every((t) => t.prompt.includes("NO execution tools")));
  });

  it("--only filters the roster", () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    const plan = buildCouncilPlan(catalog, { context: CONTEXT, only: ["technical"] });
    assert.equal(plan.analysis.length, 1);
    assert.equal(plan.analysis[0].id, "technical");
    assert.equal(plan.risk.length, 0);
    assert.equal(plan.synthesis.length, 0);
  });
});

describe("runCouncil", () => {
  it("runs phases in order: analysis blind-parallel → risk sees analysis → synthesis last", async () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    const plan = buildCouncilPlan(catalog, { context: CONTEXT });

    const invocationOrder: string[] = [];
    const analysisIds = new Set(plan.analysis.map((t) => t.id));
    const riskIds = new Set(plan.risk.map((t) => t.id));
    const promptSeen = new Map<string, string>();

    const runner: AgentRunner = async (task) => {
      invocationOrder.push(task.id);
      promptSeen.set(task.id, task.prompt);
      return { output: `VERDICT-${task.id}`, exitCode: 0 };
    };

    await runCouncil(plan, { context: CONTEXT, runner });

    // Every analysis agent runs before any risk agent; every risk before synthesis.
    const lastAnalysisIdx = Math.max(
      ...invocationOrder.map((id, i) => (analysisIds.has(id) ? i : -1)),
    );
    const firstRiskIdx = Math.min(
      ...invocationOrder.map((id, i) => (riskIds.has(id) ? i : Number.MAX_SAFE_INTEGER)),
    );
    assert.ok(lastAnalysisIdx < firstRiskIdx, "all analysis must settle before any risk starts");

    // Analysis prompts contain NO peer verdict; risk prompts DO contain analysis output.
    for (const t of plan.analysis) {
      assert.ok(!/VERDICT-/.test(promptSeen.get(t.id) ?? ""), `analysis agent ${t.id} saw peer output`);
    }
    for (const t of plan.risk) {
      assert.match(promptSeen.get(t.id) ?? "", /VERDICT-macro-risk/, `risk agent ${t.id} did not see analysis`);
    }
    // Synthesis sees the full debate (analysis + risk).
    const pmPrompt = promptSeen.get("portfolio-manager") ?? "";
    assert.match(pmPrompt, /VERDICT-macro-risk/);
    assert.match(pmPrompt, /VERDICT-risk-manager/);
  });

  it("a failed agent does not sink the phase (fail-safe inherited)", async () => {
    const catalog = loadIISCatalog(defaultCatalogPath());
    const plan = buildCouncilPlan(catalog, { context: CONTEXT });

    const runner: AgentRunner = async (task) => {
      if (task.id === "defi-yield") throw new Error("boom");
      return { output: `ok-${task.id}`, exitCode: 0 };
    };

    const result = await runCouncil(plan, { context: CONTEXT, runner });
    assert.equal(result.analysis.total, 5);
    assert.equal(result.analysis.failed, 1);
    assert.equal(result.synthesis.failed, 0, "synthesis still completes despite an upstream failure");
  });
});

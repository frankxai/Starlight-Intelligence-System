/**
 * Starlight Workflow Runner & Multi-Model Council Consensus Tests
 *
 * Verifies:
 * - Listing predefined workflows (`product-sprint`, `autonomous-refactor`, `sentinel-audit`)
 * - Step execution, dependency tracking, duration measurement, and status tracking
 * - Predefined workflow execution (`sentinel-audit` and `autonomous-refactor`)
 * - Custom workflow registration and execution
 * - Multi-Model Council Consensus (`executeCouncilConsensus`):
 *   - Concurrent dispatch across Anthropic, Google, and OpenAI adapters
 *   - Verification of individual viewpoints, agreement index, points of agreement, divergences, and recommendations
 *
 * Attestation: Built on SIP § 3 — Multi-Step Workflow Runner & Council Consensus
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  WorkflowRunner,
  workflowRunner,
  executeCouncilConsensus,
  type WorkflowDefinition,
} from "../src/orchestration/workflow-runner.js";

test("WorkflowRunner — lists predefined workflows", () => {
  const runner = new WorkflowRunner();
  const workflows = runner.list();

  assert.ok(Array.isArray(workflows));
  assert.ok(workflows.length >= 3);

  const ids = workflows.map((w) => w.id);
  assert.ok(ids.includes("product-sprint"), "Should include product-sprint");
  assert.ok(ids.includes("autonomous-refactor"), "Should include autonomous-refactor");
  assert.ok(ids.includes("sentinel-audit"), "Should include sentinel-audit");

  for (const wf of workflows) {
    assert.ok(wf.name, "Workflow should have a name");
    assert.ok(wf.description, "Workflow should have a description");
    assert.ok(wf.stepCount > 0, "Workflow should have at least 1 step");
    assert.ok(wf.pipeline.length > 0, "Workflow should have a readable pipeline summary");
  }
});

test("WorkflowRunner — executes sentinel-audit workflow cleanly", async () => {
  const summary = await workflowRunner.run("sentinel-audit");

  assert.equal(summary.workflowId, "sentinel-audit");
  assert.equal(summary.status, "success");
  assert.ok(summary.totalDurationMs >= 0);
  assert.equal(summary.steps.length, 3);

  // Check individual step execution
  const stepIds = summary.steps.map((s) => s.stepId);
  assert.deepEqual(stepIds, ["worktree-secret-scan", "invariant-validation", "governance-report"]);

  for (const step of summary.steps) {
    assert.equal(step.status, "success");
    assert.ok(step.output && step.output.length > 0);
  }

  assert.ok(summary.finalOutput, "Final deliverable must be populated");
  assert.ok(summary.finalOutput.includes("Starlight Sentinel governance and security audit report"));
});

test("WorkflowRunner — executes autonomous-refactor workflow cleanly", async () => {
  const summary = await workflowRunner.run("autonomous-refactor");

  assert.equal(summary.workflowId, "autonomous-refactor");
  assert.equal(summary.status, "success");
  assert.equal(summary.steps.length, 4);

  const stepIds = summary.steps.map((s) => s.stepId);
  assert.deepEqual(stepIds, [
    "file-inspection",
    "sandbox-validation",
    "typescript-compile-check",
    "vault-settlement",
  ]);

  for (const step of summary.steps) {
    assert.equal(step.status, "success");
    assert.ok(step.output);
  }
});

test("WorkflowRunner — supports custom workflow registration and execution", async () => {
  const runner = new WorkflowRunner();

  const customWf: WorkflowDefinition = {
    id: "custom-pipeline",
    name: "Custom Pipeline Test",
    description: "Custom multi-step test pipeline",
    steps: [
      {
        id: "step-1",
        name: "First Step",
        execute: async () => ({ output: "Step 1 Output", data: { val: 42 } }),
      },
      {
        id: "step-2",
        name: "Second Step",
        dependencies: ["step-1"],
        execute: async (ctx) => {
          const prev = ctx.stepOutputs["step-1"]?.data?.val;
          return { output: `Step 2 received ${prev}`, data: { result: (prev as number) * 2 } };
        },
      },
    ],
  };

  runner.registerWorkflow(customWf);
  const found = runner.get("custom-pipeline");
  assert.ok(found);
  assert.equal(found.name, "Custom Pipeline Test");

  const summary = await runner.run("custom-pipeline");
  assert.equal(summary.status, "success");
  assert.equal(summary.steps.length, 2);
  assert.equal(summary.steps[1].data?.result, 84);
});

test("WorkflowRunner — fails gracefully on non-existent workflow", async () => {
  await assert.rejects(
    async () => {
      await workflowRunner.run("non-existent-workflow");
    },
    { message: /Workflow ['"]non-existent-workflow['"] not found/ }
  );
});

test("executeCouncilConsensus — synthesizes agreement across Anthropic, Google & OpenAI", async () => {
  const prompt = "Should we adopt SQLite FTS5 hybrid indexing for sovereign memory search?";

  const consensus = await executeCouncilConsensus(prompt, {
    offlineMode: true,
  });

  assert.equal(consensus.prompt, prompt);
  assert.ok(consensus.timestamp);
  assert.equal(consensus.viewpoints.length, 3);

  // Verify all 3 frontier model viewpoints
  const providers = consensus.viewpoints.map((v) => v.provider);
  assert.ok(providers.includes("anthropic"), "Anthropic viewpoint required");
  assert.ok(providers.includes("google"), "Google viewpoint required");
  assert.ok(providers.includes("openai"), "OpenAI viewpoint required");

  // Verify synthesis
  assert.ok(consensus.agreements.length > 0, "Must have points of agreement");
  assert.ok(consensus.divergences.length > 0, "Must have points of divergence");
  assert.ok(consensus.agreementIndex >= 80 && consensus.agreementIndex <= 100);
  assert.ok(consensus.consensusText.includes("consensus"));
  assert.ok(consensus.recommendation.length > 0);
});

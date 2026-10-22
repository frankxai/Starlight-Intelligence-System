import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, writeFileSync, symlinkSync, linkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { loadContractRegistry } from "../tools/foundry/lib/schema.mjs";
import { evaluateResearchCampaign, proposeResearchEvolution, selectResearch } from "../tools/foundry/lib/research-evolution.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const registry = loadContractRegistry(join(ROOT, "foundry/contracts"));
const fixture = () => JSON.parse(readFileSync(join(ROOT, "foundry/examples/research-evolution.campaign.json"), "utf8"));
const evaluate = (campaign) => evaluateResearchCampaign(campaign, registry);

test("synthetic example is reproducible, review-only, and cannot recommend a champion", () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const report = evaluate(input);
  assert.deepEqual(report, evaluate(input));
  assert.equal(JSON.stringify(input), before);
  assert.equal(report.apply, false);
  assert.equal(report.evidenceTrust, "supplied-unattested");
  assert.equal(report.status, "demo-only");
  assert.equal(report.recommendedCandidateId, null);
  assert.equal(report.evaluated[0].eligibleForRecommendation, false);
  assert.equal(report.evaluated[0].passesStatisticalChecks, true);
  assert.equal(report.evaluated[0].meanGain > 0, true);
});

test("measured supplied evidence yields only a review candidate with exact revision and provenance", () => {
  const input = fixture();
  input.evidenceMode = "measured";
  const report = evaluate(input);
  assert.equal(report.status, "review-candidate");
  assert.equal(report.recommendedCandidateId, "context-a");
  assert.equal(report.requiresReview, true);
  assert.equal(report.evaluated[0].revision, input.candidates[0].revision);
  assert.equal(report.research[0].paper.url, "https://arxiv.org/abs/2609.40169v1");
  assert.equal(report.evaluated[0].gainInterval[0], .5);
});

test("no gain, negative gain, and insufficient mean gain retain the champion", () => {
  for (const reward of [0, .5]) {
    const input = fixture(); input.evidenceMode = "measured";
    input.candidates[0].validation.forEach((row) => { row.reward = reward; });
    assert.equal(evaluate(input).status, "retain-champion");
  }
  const input = fixture(); input.evidenceMode = "measured"; input.selection.minMeanGain = .6;
  assert.equal(evaluate(input).status, "retain-champion");
});

test("round robin covers distinct mechanisms, deduplicates titles, and screens existing mechanisms", () => {
  const input = fixture();
  const base = input.blueprints[0];
  input.papers = ["a", "b", "c", "duplicate"].map((id, i) => ({
    ...input.papers[0], id, title: i === 3 ? "PAPER a" : `Paper ${id}`,
  }));
  input.blueprints = [
    { ...base, id: "a", paperId: "a", primaryTopic: "compression" },
    { ...base, id: "b", paperId: "b", primaryTopic: "compression" },
    { ...base, id: "c", paperId: "c", primaryTopic: "retrieval" },
    { ...base, id: "duplicate", paperId: "duplicate", primaryTopic: "other" },
    { ...base, id: "present", paperId: "b", alreadyPresent: true },
  ];
  assert.deepEqual(selectResearch(input.blueprints, input.papers, 2), ["a", "c"]);
  assert.deepEqual(selectResearch(input.blueprints, input.papers, 4), ["a", "c", "b"]);
});

const failures = [
  ["overlapping splits", (c) => c.splits.test.push(c.splits.validation[0]), /disjoint/],
  ["artifact leakage", (c) => c.candidates[0].artifactSourceTaskIds.push(c.splits.test[0]), /Artifact leakage/],
  ["champion artifact leakage", (c) => c.champion.artifactSourceTaskIds.push(c.splits.validation[0]), /Artifact leakage/],
  ["backbone drift", (c) => { c.candidates[0].backbone = "changed"; }, /Backbone changed/],
  ["protocol drift", (c) => { c.candidates[0].protocolSha256 = "f".repeat(64); }, /protocol changed/],
  ["duplicate rows", (c) => c.candidates[0].validation.push(c.candidates[0].validation[0]), /Duplicate task\/trial/],
  ["missing rows", (c) => c.candidates[0].validation.pop(), /Unpaired/],
  ["missing task", (c) => { c.candidates[0].validation = c.candidates[0].validation.filter((row) => row.taskId !== "v0"); }, /Missing validation/],
  ["held-out selection", (c) => { c.candidates[0].validation[0].taskId = c.splits.test[0]; }, /Non-validation/],
  ["trial drift", (c) => { c.candidates[0].validation[0].trialId = "different"; }, /Unpaired/],
  ["unknown fields", (c) => { c.autoApply = true; }, /ADDITIONAL_PROPERTY/],
  ["missing hard gate", (c) => { delete c.candidates[0].hardGates.security; }, /REQUIRED/],
  ["invalid scores", (c) => { c.candidates[0].validation[0].reward = NaN; }, /TYPE/],
  ["negative cost", (c) => { c.candidates[0].validation[0].costUsd = -1; }, /MINIMUM/],
  ["unsupported excerpt", (c) => { c.blueprints[0].evidenceExcerpt = "not in abstract"; }, /Unsupported abstract excerpt/],
  ["dangling paper", (c) => { c.blueprints[0].paperId = "missing"; }, /Unknown paper/],
  ["dangling blueprint", (c) => { c.candidates[0].blueprintIds = ["missing"]; }, /Unknown blueprint/],
  ["duplicate paper ids", (c) => c.papers.push(c.papers[0]), /Duplicate paper/],
  ["duplicate blueprint ids", (c) => c.blueprints.push(c.blueprints[0]), /Duplicate blueprint/],
  ["duplicate candidate ids", (c) => c.candidates.push(c.candidates[0]), /Duplicate candidate/],
  ["candidate champion collision", (c) => { c.candidates[0].id = c.champion.id; }, /collides/],
  ["candidate budget", (c) => { c.budget.maxEvaluatedCandidates = 1; addMemory(c); }, /Candidate budget/],
  ["bootstrap work budget", (c) => {
    addMemory(c); c.selection.bootstrapSamples = 10000;
    c.splits.validation = Array.from({ length: 1100 }, (_, i) => `v${i}`);
  }, /Bootstrap work budget/],
  ["minimum validation tasks", (c) => { c.selection.minValidationTasks = 100; }, /Insufficient validation/],
  ["screened research", (c) => { c.blueprints[0].alreadyPresent = true; }, /Research not selected/],
];
for (const [name, mutate, expected] of failures) {
  test(`rejects ${name}`, () => {
    const input = fixture(); mutate(input);
    assert.throws(() => evaluate(input), expected);
  });
}

for (const [gate, mutate, reason] of [
  ["health probe", (c) => { c.candidates[0].health.validAction = false; }, "health-probe-failed"],
  ["security", (c) => { c.candidates[0].hardGates.security = false; }, "hard-gate-failed"],
  ["permissions", (c) => { c.candidates[0].hardGates.permissions = false; }, "hard-gate-failed"],
  ["required tests", (c) => { c.candidates[0].hardGates.requiredTests = false; }, "hard-gate-failed"],
  ["cost", (c) => { c.budget.maxMeanCostUsd = 0; }, "cost-budget-exceeded"],
  ["latency", (c) => { c.budget.maxMeanLatencyMs = 0; }, "latency-budget-exceeded"],
  ["task regression", (c) => { c.candidates[0].validation.filter((row) => row.taskId === "v0").forEach((row) => { row.reward = 0; }); }, "task-regression"],
]) {
  test(`${gate} blocks a positive average gain`, () => {
    const input = fixture(); input.evidenceMode = "measured"; mutate(input);
    const report = evaluate(input);
    assert.equal(report.status, "retain-champion");
    assert.ok(report.evaluated[0].reasons.includes(reason));
  });
}

function addMemory(input) {
  input.blueprints.push({ ...input.blueprints[0], id: "memory-blueprint", module: "memory" });
  const candidate = structuredClone(input.candidates[0]);
  candidate.id = "memory-a"; candidate.blueprintIds = ["memory-blueprint"];
  input.candidates.push(candidate);
}

test("unmeasured crossover is only a suggestion; a measured interaction regression cannot win", () => {
  const input = fixture(); input.evidenceMode = "measured"; addMemory(input);
  const report = evaluate(input);
  assert.equal(report.crossoverSuggestions.length, 1);
  assert.equal(report.crossoverSuggestions[0].eligibleForRecommendation, false);
  assert.equal(report.crossoverSuggestions[0].predictedGain, 1);
  const joint = structuredClone(input.candidates[0]);
  joint.id = "joint"; joint.blueprintIds.push("memory-blueprint");
  joint.validation.forEach((row) => { row.reward = .25; }); input.candidates.push(joint);
  const measured = evaluate(input);
  assert.equal(measured.recommendedCandidateId, "context-a");
  assert.equal(measured.crossoverSuggestions.length, 0);
  assert.equal(measured.evaluated[2].eligibleForRecommendation, false);
  assert.equal(measured.evaluated[0].adjustedAlpha, input.selection.alpha / 3);
});

test("duplicate configurations and two mutations in the same slot fail closed", () => {
  const input = fixture(); addMemory(input);
  input.candidates[1].blueprintIds = input.candidates[0].blueprintIds;
  assert.throws(() => evaluate(input), /Duplicate candidate configuration/);
  input.blueprints[1].module = "context";
  input.blueprints[1].paperId = "second-paper";
  input.papers.push({ ...input.papers[0], id: "second-paper", title: "Second source" });
  input.candidates = [{ ...input.candidates[0], blueprintIds: ["context-blueprint", "memory-blueprint"] }];
  assert.throws(() => evaluate(input), /Multiple mutations/);
});

test("trials are averaged inside tasks, and an uncertain gain cannot win", () => {
  const input = fixture(); input.evidenceMode = "measured";
  for (const row of input.candidates[0].validation) row.reward = Number(row.taskId.slice(1)) < 12 ? 1 : 0;
  input.selection.maxTaskRegression = 1;
  const report = evaluate(input);
  assert.equal(report.evaluated[0].meanGain, 0);
  assert.ok(report.evaluated[0].gainInterval[0] < 0);
  assert.equal(report.status, "retain-champion");
});

test("CLI emits a report, rejects malformed data, and preserves the input on failure", () => {
  const directory = mkdtempSync(join(tmpdir(), "research-evolution-"));
  try {
    const source = join(ROOT, "foundry/examples/research-evolution.campaign.json");
    const output = join(directory, "report.json");
    const run = spawnSync(process.execPath, ["tools/foundry/cli.mjs", "evolve-research", source, "--out", output], { cwd: ROOT, encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(JSON.parse(readFileSync(output, "utf8")).status, "demo-only");
    assert.throws(() => proposeResearchEvolution({ campaignPath: source, output, registry }), /EEXIST/);
    assert.throws(() => proposeResearchEvolution({ campaignPath: source, output: source, registry }), /overwrite/);
    const malformed = join(directory, "bad.json"); writeFileSync(malformed, "{}");
    const bad = spawnSync(process.execPath, ["tools/foundry/cli.mjs", "evolve-research", malformed, "--out", output], { cwd: ROOT, encoding: "utf8" });
    assert.equal(bad.status, 1); assert.match(bad.stderr, /Research campaign/);
    assert.equal(JSON.parse(readFileSync(output, "utf8")).status, "demo-only");
    writeFileSync(malformed, " ".repeat(5_000_001));
    assert.throws(() => proposeResearchEvolution({ campaignPath: malformed, output, registry }), /5 MB/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("output aliases cannot overwrite the source campaign", () => {
  const directory = mkdtempSync(join(tmpdir(), "research-evolution-alias-"));
  try {
    const source = join(directory, "campaign.json");
    const original = JSON.stringify(fixture()); writeFileSync(source, original);
    for (const [name, link] of [["symlink", symlinkSync], ["hardlink", linkSync]]) {
      const output = join(directory, `${name}.json`); link(source, output);
      assert.throws(() => proposeResearchEvolution({ campaignPath: source, output, registry }), /EEXIST/);
      assert.equal(readFileSync(source, "utf8"), original);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

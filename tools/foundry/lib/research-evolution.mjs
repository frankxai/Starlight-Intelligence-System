import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { assertValid, getContract } from "./schema.mjs";

export const HARNESS_MODULES = ["tools", "context", "skills", "memory", "workflow"];
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const check = (condition, message) => { if (!condition) throw new Error(message); };
const key = (row) => JSON.stringify([row.taskId, row.trialId]);

function indexUnique(items, label) {
  const entries = new Map(items.map((item) => [item.id, item]));
  check(entries.size === items.length, `Duplicate ${label} id`);
  return entries;
}

// Resample tasks, preserving all correlated trials within each sampled task.
// A seeded PRNG makes the supplied-evidence decision exactly reproducible.
function bootstrap(gains, samples, seed, alpha) {
  let state = seed >>> 0;
  function random() {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  const draws = Array.from({ length: samples }, () => {
    let sum = 0;
    for (let i = 0; i < gains.length; i += 1) sum += gains[Math.floor(random() * gains.length)];
    return sum / gains.length;
  }).sort((a, b) => a - b);
  const quantile = (p) => draws[Math.floor((draws.length - 1) * p)];
  return [quantile(alpha / 2), quantile(1 - alpha / 2)];
}

export function selectResearch(blueprints, papers, limit) {
  const byPaper = new Map(papers.map((paper) => [paper.id, paper]));
  const selected = [];
  for (const module of HARNESS_MODULES) {
    const topics = new Map();
    const seenTitles = new Set();
    for (const blueprint of blueprints.filter((item) => item.module === module && !item.alreadyPresent)) {
      const title = byPaper.get(blueprint.paperId).title.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);
      const cluster = topics.get(blueprint.primaryTopic) ?? [];
      cluster.push(blueprint.id);
      topics.set(blueprint.primaryTopic, cluster);
    }
    // Stable ties retain retrieval order, as do entries within each cluster.
    const clusters = [...topics.values()].sort((a, b) => b.length - a.length);
    let count = 0;
    for (let round = 0; count < limit; round += 1) {
      let added = false;
      for (const cluster of clusters) {
        if (cluster[round] && count < limit) {
          selected.push(cluster[round]);
          count += 1;
          added = true;
        }
      }
      if (!added) break;
    }
  }
  return selected;
}

function validateCampaign(campaign, registry) {
  assertValid(campaign, getContract(registry, "research-campaign"), registry, "Research campaign");
  const splits = campaign.splits;
  const allTasks = [...splits.evolution, ...splits.validation, ...splits.test];
  check(new Set(allTasks).size === allTasks.length, "Task splits must be unique and disjoint");
  check(splits.validation.length >= campaign.selection.minValidationTasks, "Insufficient validation tasks");
  check(campaign.candidates.length <= campaign.budget.maxEvaluatedCandidates, "Candidate budget exceeded");
  check(campaign.candidates.length * splits.validation.length * campaign.selection.bootstrapSamples <= 20_000_000,
    "Bootstrap work budget exceeded (20 million task draws)");
  const papers = indexUnique(campaign.papers, "paper");
  const blueprints = indexUnique(campaign.blueprints, "blueprint");
  const candidates = indexUnique(campaign.candidates, "candidate");
  check(!candidates.has(campaign.champion.id), "Candidate id collides with champion");
  const configurations = campaign.candidates.map((item) => JSON.stringify([...item.blueprintIds].sort()));
  check(new Set(configurations).size === configurations.length, "Duplicate candidate configuration");
  for (const blueprint of blueprints.values()) {
    const paper = papers.get(blueprint.paperId);
    check(paper, `Unknown paper: ${blueprint.paperId}`);
    check(paper.abstract.includes(blueprint.evidenceExcerpt), `Unsupported abstract excerpt: ${blueprint.id}`);
  }
  const evolution = new Set(splits.evolution);
  const validation = new Set(splits.validation);
  let championKeys;
  for (const run of [campaign.champion, ...campaign.candidates]) {
    check(run.backbone === campaign.champion.backbone, `Backbone changed: ${run.id}`);
    check(run.protocolSha256 === campaign.champion.protocolSha256, `Evaluation protocol changed: ${run.id}`);
    check(new Set(run.artifactSourceTaskIds).size === run.artifactSourceTaskIds.length,
      `Duplicate artifact source: ${run.id}`);
    check(run.artifactSourceTaskIds.every((id) => evolution.has(id)), `Artifact leakage: ${run.id}`);
    const keys = run.validation.map(key);
    check(new Set(keys).size === keys.length, `Duplicate task/trial row: ${run.id}`);
    check(run.validation.every((row) => validation.has(row.taskId)), `Non-validation task in selection: ${run.id}`);
    check(new Set(run.validation.map((row) => row.taskId)).size === validation.size,
      `Missing validation task: ${run.id}`);
    const sortedKeys = keys.sort();
    if (!championKeys) championKeys = JSON.stringify(sortedKeys);
    check(JSON.stringify(sortedKeys) === championKeys, `Unpaired task/trial rows: ${run.id}`);
  }
  return blueprints;
}

function taskMeans(run, taskIds) {
  const rows = new Map(taskIds.map((id) => [id, []]));
  for (const row of run.validation) rows.get(row.taskId).push(row.reward);
  return taskIds.map((id) => mean(rows.get(id)));
}

function crossoverSuggestions(campaign, blueprints, evaluated) {
  const singles = evaluated.filter((item) => item.blueprintIds.length === 1 && item.reasons.length === 0);
  let combinations = [{ blueprintIds: [], predictedGain: 0 }];
  for (const module of HARNESS_MODULES) {
    const choices = singles.filter((item) => blueprints.get(item.blueprintIds[0]).module === module);
    combinations = combinations.flatMap((combination) => [combination, ...choices.map((item) => ({
      blueprintIds: [...combination.blueprintIds, item.blueprintIds[0]],
      predictedGain: combination.predictedGain + item.meanGain,
    }))]);
  }
  const signature = (ids) => JSON.stringify([...ids].sort());
  const measured = new Set(evaluated.map((item) => signature(item.blueprintIds)));
  return combinations.filter((item) => item.blueprintIds.length > 1 && !measured.has(signature(item.blueprintIds)))
    .sort((a, b) => b.predictedGain - a.predictedGain || signature(a.blueprintIds).localeCompare(signature(b.blueprintIds)))
    .slice(0, campaign.budget.maxCrossoverSuggestions)
    .map((item) => ({ ...item, status: "requires-joint-measurement", eligibleForRecommendation: false }));
}

export function evaluateResearchCampaign(campaign, registry) {
  const blueprints = validateCampaign(campaign, registry);
  const selectedBlueprintIds = selectResearch(campaign.blueprints, campaign.papers, campaign.budget.maxSelectedPerModule);
  const selected = new Set(selectedBlueprintIds);
  const baseline = taskMeans(campaign.champion, campaign.splits.validation);
  // Conservative correction for all candidate comparisons in this supplied batch.
  // Repeated adaptive campaigns still need fresh validation / a separate lockbox.
  const adjustedAlpha = campaign.selection.alpha / Math.max(1, campaign.candidates.length);
  const evaluated = campaign.candidates.map((candidate) => {
    const modules = candidate.blueprintIds.map((id) => {
      check(blueprints.has(id), `Unknown blueprint: ${id}`);
      return blueprints.get(id).module;
    });
    check(new Set(modules).size === modules.length, `Multiple mutations for one module: ${candidate.id}`);
    const rewards = taskMeans(candidate, campaign.splits.validation);
    const gains = rewards.map((reward, index) => reward - baseline[index]);
    const interval = bootstrap(gains, campaign.selection.bootstrapSamples, campaign.selection.seed, adjustedAlpha);
    const meanCostUsd = mean(candidate.validation.map((row) => row.costUsd));
    const meanLatencyMs = mean(candidate.validation.map((row) => row.latencyMs));
    const reasons = [];
    check(candidate.blueprintIds.every((id) => selected.has(id)), `Research not selected: ${candidate.id}`);
    if (!Object.values(candidate.health).every((value) => value === true)) reasons.push("health-probe-failed");
    if (!Object.values(candidate.hardGates).every((value) => value === true)) reasons.push("hard-gate-failed");
    if (meanCostUsd > campaign.budget.maxMeanCostUsd) reasons.push("cost-budget-exceeded");
    if (meanLatencyMs > campaign.budget.maxMeanLatencyMs) reasons.push("latency-budget-exceeded");
    if (Math.min(...gains) < -campaign.selection.maxTaskRegression) reasons.push("task-regression");
    const meanGain = mean(gains);
    const confirmed = interval[0] > 0 && meanGain >= campaign.selection.minMeanGain;
    return {
      id: candidate.id, revision: candidate.revision, artifactSha256: candidate.artifactSha256,
      blueprintIds: candidate.blueprintIds, meanReward: mean(rewards), meanGain,
      gainInterval: interval, adjustedAlpha, meanCostUsd, meanLatencyMs, reasons,
      passesStatisticalChecks: confirmed,
      eligibleForRecommendation: campaign.evidenceMode === "measured" && reasons.length === 0 && confirmed,
    };
  });
  const best = evaluated.filter((item) => item.eligibleForRecommendation)
    .sort((a, b) => b.meanGain - a.meanGain || a.meanCostUsd - b.meanCostUsd || a.id.localeCompare(b.id))[0];
  const recommendation = campaign.evidenceMode === "measured" ? best : undefined;
  return {
    schemaVersion: "1.0.0", campaignId: campaign.campaignId,
    inputSha256: createHash("sha256").update(JSON.stringify(campaign)).digest("hex"),
    evidenceMode: campaign.evidenceMode, evidenceTrust: "supplied-unattested",
    apply: false, requiresReview: true,
    status: campaign.evidenceMode === "synthetic" ? "demo-only" : recommendation ? "review-candidate" : "retain-champion",
    championId: campaign.champion.id,
    recommendedCandidateId: recommendation?.id ?? null,
    selectedBlueprintIds,
    research: selectedBlueprintIds.map((id) => ({
      ...blueprints.get(id), paper: campaign.papers.find((paper) => paper.id === blueprints.get(id).paperId),
    })),
    evaluated,
    crossoverSuggestions: crossoverSuggestions(campaign, blueprints, evaluated),
    nextProof: "Independently verify supplied runs, source revisions, frozen artifacts and gates. Freeze selection before held-out testing; use /prove for package evidence. This report cannot apply or promote a change.",
  };
}

export function proposeResearchEvolution({ campaignPath, output, registry }) {
  check(resolve(campaignPath) !== resolve(output), "Output must not overwrite campaign input");
  check(statSync(resolve(campaignPath)).size <= 5_000_000, "Campaign input exceeds 5 MB");
  const bytes = readFileSync(resolve(campaignPath));
  check(bytes.length <= 5_000_000, "Campaign input exceeds 5 MB");
  const report = evaluateResearchCampaign(JSON.parse(bytes.toString("utf8")), registry);
  mkdirSync(dirname(resolve(output)), { recursive: true });
  // Exclusive creation also rejects symlink and hardlink aliases of the input.
  writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { report, output: resolve(output) };
}

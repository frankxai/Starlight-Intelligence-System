/**
 * Starlight Evolution Lab — deterministic offline candidate eligibility.
 *
 * This is an admission *advisory*, not a deployment controller, signature
 * verification service, human approval or statistically causal proof.
 * The host must independently authenticate runner/checker identities and
 * validate receipt content hashes before any result is used for release.
 * Built on SIP — Starlight Intelligence Protocol.
 */
export const EVOLUTION_SCHEMA = "starlight.evolution-experiment/v1";
export const DEFAULT_LIMITS = Object.freeze({
  minAttempts: 20,
  minAcceptedRateGain: 0.05,
  minCostPerAcceptedReduction: 0.10,
  minHumanMinutesReduction: 0.10,
  maxCostPerAcceptedRatio: 1.15,
  maxHumanMinutesRatio: 1.20,
  maxP95LatencyRatio: 1.50,
});

const sha40 = x => typeof x === "string" && /^[0-9a-f]{40}$/.test(x);
const sha64 = x => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
const plainObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const text = x => typeof x === "string" && x.trim().length > 0 && x.length <= 160;
const positive = x => typeof x === "number" && Number.isFinite(x) && x > 0;
const nonnegative = x => typeof x === "number" && Number.isFinite(x) && x >= 0;
const integer = x => Number.isInteger(x) && x >= 0;
const rate = m => m.accepted / m.attempted;
const perAccepted = (quantity, m) => m.accepted === 0 ? null : quantity / m.accepted;
const ratio = (a, b) => b === 0 ? (a === 0 ? 1 : null) : a / b;

function assertRun(label, run, taskSetDigest) {
  const failures = [];
  if (!plainObject(run)) return [`${label}.run missing`];
  if (!text(run.capabilityVersion) || !sha40(run.sourceRevision)) {
    failures.push(`${label}: version and exact Git source SHA required`);
  }
  if (!plainObject(run.maker) || !text(run.maker.id) || !text(run.maker.provider)) {
    failures.push(`${label}: maker identity required`);
  }
  const receipt = run.receipt;
  if (!plainObject(receipt) || !sha64(receipt.digest) || receipt.taskSetDigest !== taskSetDigest) {
    failures.push(`${label}: receipt digest/task set mismatch`);
  }
  if (
    !plainObject(receipt?.checker) || !text(receipt.checker.id) ||
    !text(receipt.checker.provider) ||
    receipt.checker.id === run.maker?.id ||
    receipt.checker.provider === run.maker?.provider
  ) {
    failures.push(`${label}: checker must differ from maker in identity and provider`);
  }
  if (receipt?.checker?.subjectDigest !== receipt?.digest) {
    failures.push(`${label}: checker did not bind exact receipt digest`);
  }
  const m = run.metrics;
  if (!plainObject(m) || !integer(m.attempted) || !integer(m.accepted) ||
      m.accepted > m.attempted || !integer(m.criticalViolations) ||
      !nonnegative(m.totalUsd) || !nonnegative(m.humanMinutes) ||
      !nonnegative(m.p95LatencyMs)) {
    failures.push(`${label}: invalid or incomplete metrics`);
  }
  if (!["fixture", "independently_observed"].includes(run.evidenceLevel)) {
    failures.push(`${label}: invalid evidence level`);
  }
  return failures;
}

/**
 * Returns a hard-gated, evidence-scoped recommendation.
 * No private prompts, task labels, raw traces or customer content are returned.
 *
 * `SHADOW_REVIEW_CANDIDATE` means eligible for a fresh independent/owner review
 * and potentially a shadow run. It NEVER authorizes production promotion.
 */
export function adjudicateEvolution(experiment, limits = DEFAULT_LIMITS) {
  const reasons = [];
  if (!plainObject(experiment)) throw new TypeError("experiment must be an object");
  if (experiment.schema !== EVOLUTION_SCHEMA || !text(experiment.id) ||
      !text(experiment.tenantScope) || !sha40(experiment.sourceRevision) ||
      !text(experiment.hypothesis)) {
    reasons.push("invalid experiment identity/hypothesis/source revision");
  }
  const taskSet = experiment.taskSet;
  if (!plainObject(taskSet) || !sha64(taskSet.digest) ||
      taskSet.sealed !== true || taskSet.contamination !== "clear" ||
      !["heldout", "challenge"].includes(taskSet.kind)) {
    reasons.push("sealed, uncontaminated challenge set required");
  }
  const digest = taskSet?.digest;
  reasons.push(...assertRun("baseline", experiment.baseline, digest));
  reasons.push(...assertRun("candidate", experiment.candidate, digest));

  if (!plainObject(limits) || !integer(limits.minAttempts) ||
      !nonnegative(limits.minAcceptedRateGain) ||
      !nonnegative(limits.minCostPerAcceptedReduction) ||
      !nonnegative(limits.minHumanMinutesReduction) ||
      !positive(limits.maxCostPerAcceptedRatio) ||
      !positive(limits.maxHumanMinutesRatio) ||
      !positive(limits.maxP95LatencyRatio)) {
    reasons.push("invalid explicit evaluation limits");
  }

  const b = experiment.baseline?.metrics;
  const c = experiment.candidate?.metrics;
  if (reasons.length) {
    return { verdict: "BLOCKED", reasons, releaseAuthorized: false, summary: null };
  }

  if (b.attempted < limits.minAttempts || c.attempted < limits.minAttempts) {
    reasons.push("insufficient sample; not a statistical improvement claim");
  }
  if (b.attempted !== c.attempted) {
    reasons.push("paired comparison requires equal observed task counts");
  }
  if (b.criticalViolations !== 0 || c.criticalViolations !== 0) {
    reasons.push("critical integrity, safety or tenant-boundary violation");
  }
  if (b.accepted === 0 || c.accepted === 0) {
    reasons.push("no usable accepted outcome; cost per accepted is undefined");
  }
  if (experiment.baseline.evidenceLevel !== "independently_observed" ||
      experiment.candidate.evidenceLevel !== "independently_observed") {
    reasons.push("fixture-only evidence cannot qualify a real-world improvement");
  }

  const bCost = perAccepted(b.totalUsd, b);
  const cCost = perAccepted(c.totalUsd, c);
  const bHuman = perAccepted(b.humanMinutes, b);
  const cHuman = perAccepted(c.humanMinutes, c);
  const qualityGain = rate(c) - rate(b);
  const costRatio = bCost === null || cCost === null ? null : ratio(cCost, bCost);
  const humanRatio = bHuman === null || cHuman === null ? null : ratio(cHuman, bHuman);
  const latencyRatio = ratio(c.p95LatencyMs, b.p95LatencyMs);
  const summary = {
    attempted: { baseline: b.attempted, candidate: c.attempted },
    acceptedRate: { baseline: rate(b), candidate: rate(c), delta: qualityGain },
    costPerAcceptedUsd: { baseline: bCost, candidate: cCost, ratio: costRatio },
    humanMinutesPerAccepted: { baseline: bHuman, candidate: cHuman, ratio: humanRatio },
    p95LatencyMs: { baseline: b.p95LatencyMs, candidate: c.p95LatencyMs, ratio: latencyRatio },
  };

  if (qualityGain < 0) reasons.push("accepted outcome rate regressed");
  if (costRatio === null || costRatio > limits.maxCostPerAcceptedRatio) {
    reasons.push("cost per accepted outcome exceeded ceiling or has unknown denominator");
  }
  if (humanRatio === null || humanRatio > limits.maxHumanMinutesRatio) {
    reasons.push("human work per accepted outcome exceeded ceiling or has unknown denominator");
  }
  if (latencyRatio === null || latencyRatio > limits.maxP95LatencyRatio) {
    reasons.push("latency exceeded ceiling or has unknown denominator");
  }
  const improvement = qualityGain >= limits.minAcceptedRateGain ||
    (costRatio !== null && costRatio <= 1 - limits.minCostPerAcceptedReduction) ||
    (humanRatio !== null && humanRatio <= 1 - limits.minHumanMinutesReduction);
  if (!improvement) reasons.push("no preregistered meaningful improvement observed");

  return {
    verdict: reasons.length ? "REVISE_OR_MORE_EVIDENCE" : "SHADOW_REVIEW_CANDIDATE",
    reasons,
    releaseAuthorized: false,
    summary,
    experimentId: experiment.id,
    datasetDigest: taskSet.digest,
    sourceRevision: experiment.sourceRevision,
    candidateReceiptDigest: experiment.candidate.receipt.digest,
  };
}

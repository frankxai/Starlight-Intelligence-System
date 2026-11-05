import assert from "node:assert/strict";
import test from "node:test";
import { adjudicateEvolution, EVOLUTION_SCHEMA } from "../tools/proving-ground/evolution/adjudicate.mjs";

const HASH_A = "a".repeat(40);
const HASH_B = "b".repeat(40);
const SET = "c".repeat(64);
const BASE_RECEIPT = "d".repeat(64);
const CANDIDATE_RECEIPT = "e".repeat(64);

function run(name, metrics, evidenceLevel = "independently_observed") {
  const candidate = name === "candidate";
  const digest = candidate ? CANDIDATE_RECEIPT : BASE_RECEIPT;
  return {
    capabilityVersion: `${name}/v1`,
    sourceRevision: candidate ? HASH_B : HASH_A,
    maker: { id: candidate ? "maker-b" : "maker-a", provider: "claude" },
    receipt: {
      digest,
      taskSetDigest: SET,
      checker: { id: candidate ? "review-b" : "review-a", provider: "codex", subjectDigest: digest },
    },
    evidenceLevel,
    metrics,
  };
}

const baselineMetrics = {
  attempted: 40, accepted: 28, criticalViolations: 0,
  totalUsd: 10, humanMinutes: 120, p95LatencyMs: 800,
};
const candidateMetrics = {
  attempted: 40, accepted: 34, criticalViolations: 0,
  totalUsd: 9, humanMinutes: 85, p95LatencyMs: 850,
};

function experiment(overrides = {}) {
  return {
    schema: EVOLUTION_SCHEMA,
    id: "eval-nov-2026",
    tenantScope: "synthetic-test-tenant",
    sourceRevision: HASH_A,
    hypothesis: "Versioned context compiler will improve accepted output at fixed task set",
    taskSet: { digest: SET, sealed: true, contamination: "clear", kind: "heldout" },
    baseline: run("baseline", baselineMetrics),
    candidate: run("candidate", candidateMetrics),
    ...overrides,
  };
}

test("a beneficial, independently observed, paired comparison is only shadow eligible", () => {
  const got = adjudicateEvolution(experiment());
  assert.equal(got.verdict, "SHADOW_REVIEW_CANDIDATE");
  assert.equal(got.releaseAuthorized, false);
  assert.equal(got.summary.acceptedRate.candidate, 34 / 40);
  assert.equal(got.candidateReceiptDigest, CANDIDATE_RECEIPT);
  assert.equal("customerPayload" in got, false);
});

test("candidate critical violation fails even if quality improved", () => {
  const bad = run("candidate", { ...candidateMetrics, criticalViolations: 1 });
  const got = adjudicateEvolution(experiment({ candidate: bad }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(got.reasons.join(" "), /critical integrity/);
  assert.equal(got.releaseAuthorized, false);
});

test("unsealed or contaminated challenge data cannot pass", () => {
  for (const taskSet of [
    { digest: SET, sealed: false, contamination: "clear", kind: "heldout" },
    { digest: SET, sealed: true, contamination: "suspected", kind: "heldout" },
    { digest: SET, sealed: true, contamination: "clear", kind: "training" },
  ]) {
    const got = adjudicateEvolution(experiment({ taskSet }));
    assert.equal(got.verdict, "BLOCKED");
    assert.match(got.reasons.join(" "), /sealed, uncontaminated/);
  }
});

test("self-certified or same-provider checker never satisfies independence", () => {
  for (const checker of [
    { id: "maker-b", provider: "codex", subjectDigest: CANDIDATE_RECEIPT },
    { id: "review-b", provider: "claude", subjectDigest: CANDIDATE_RECEIPT },
    { id: "review-b", provider: "codex", subjectDigest: BASE_RECEIPT },
  ]) {
    const candidate = run("candidate", candidateMetrics);
    candidate.receipt.checker = checker;
    assert.equal(adjudicateEvolution(experiment({ candidate })).verdict, "BLOCKED");
  }
});

test("cross-dataset candidate, missing cost, and missing exact revision fail closed", () => {
  const mismatched = run("candidate", candidateMetrics);
  mismatched.receipt.taskSetDigest = "f".repeat(64);
  assert.equal(adjudicateEvolution(experiment({ candidate: mismatched })).verdict, "BLOCKED");

  const costMissing = run("candidate", { ...candidateMetrics, totalUsd: null });
  assert.equal(adjudicateEvolution(experiment({ candidate: costMissing })).verdict, "BLOCKED");

  const revisionMissing = run("candidate", candidateMetrics);
  revisionMissing.sourceRevision = "main";
  assert.equal(adjudicateEvolution(experiment({ candidate: revisionMissing })).verdict, "BLOCKED");
});

test("synthetic fixture never claims human-observed improvement", () => {
  const candidate = run("candidate", candidateMetrics, "fixture");
  const got = adjudicateEvolution(experiment({ candidate }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(got.reasons.join(" "), /fixture-only/);
});

test("insufficient and unpaired samples are not promoted", () => {
  const few = run("candidate", { ...candidateMetrics, attempted: 10, accepted: 9 });
  const got = adjudicateEvolution(experiment({ candidate: few }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(got.reasons.join(" "), /insufficient sample/);
  assert.match(got.reasons.join(" "), /paired comparison/);
});

test("declining acceptance with no improvement does not pass", () => {
  const candidate = run("candidate", {
    ...candidateMetrics, accepted: 25, totalUsd: 12, humanMinutes: 130,
  });
  const got = adjudicateEvolution(experiment({ candidate }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(got.reasons.join(" "), /accepted outcome rate regressed/);
});

test("an expensive but effective model must satisfy the cost ceiling", () => {
  const candidate = run("candidate", { ...candidateMetrics, totalUsd: 40 });
  const got = adjudicateEvolution(experiment({ candidate }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.match(got.reasons.join(" "), /cost per accepted outcome/);
});

test("missing accepted outcome leaves denominator unknown instead of inventing zero cost", () => {
  const candidate = run("candidate", { ...candidateMetrics, accepted: 0 });
  const got = adjudicateEvolution(experiment({ candidate }));
  assert.equal(got.verdict, "REVISE_OR_MORE_EVIDENCE");
  assert.equal(got.summary.costPerAcceptedUsd.candidate, null);
});

test("bad input object and malformed limits fail without remote effects", () => {
  assert.throws(() => adjudicateEvolution(null), /experiment must/);
  const got = adjudicateEvolution(experiment(), { minAttempts: -1 });
  assert.equal(got.verdict, "BLOCKED");
  assert.match(got.reasons.join(" "), /invalid explicit evaluation limits/);
});

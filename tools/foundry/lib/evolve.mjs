import { resolve } from "node:path";
import { readJson, writeJson } from "./io.mjs";
import { assertValid, getContract } from "./schema.mjs";

const LAYER_BY_LANE = {
  static: "contract-or-compiler",
  behavioral: "procedure-or-runtime",
  factual: "evidence-policy",
  artifact: "renderer-or-packaging",
  taste: "taste-profile",
  security: "permission-or-guardrail",
  economic: "routing-or-budget",
  drift: "registry-or-adapter",
};

function actionFor(test) {
  if (test.status === "pending") {
    return "Collect the missing independent evidence; do not patch implementation until the test has actually run.";
  }
  if (test.type === "command") {
    return "Repair the smallest implementation layer that causes this command to fail, then rerun the same test.";
  }
  if (test.type === "judge") {
    return "Revise the taste profile or artifact using the judge rationale, preserving passing hard gates.";
  }
  return "Patch the smallest responsible layer and rerun this exact test before promotion.";
}

export function proposeEvolution({ receiptPath, output, registry }) {
  const receipt = readJson(resolve(receiptPath));
  assertValid(receipt, getContract(registry, "evidence-receipt"), registry, "Evidence Receipt");
  const unresolved = receipt.tests.filter((test) => test.required && test.status !== "passed");
  const proposal = {
    schemaVersion: "1.0.0",
    proposalId: `${receipt.packageId}-evolution-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourceReceipt: resolve(receiptPath),
    packageId: receipt.packageId,
    currentStatus: receipt.status,
    apply: false,
    patches: unresolved.map((test) => ({
      testId: test.id,
      layer: LAYER_BY_LANE[test.lane] ?? "capability-package",
      reason: test.detail,
      action: actionFor(test),
      requiresApproval: test.lane === "security" || test.lane === "drift",
    })),
    nextProof: unresolved.length > 0
      ? "Recompile only if a source contract or pack changed, then run /prove against the patched package."
      : "No patch proposed. Preserve this receipt as the promotion evidence.",
  };
  writeJson(resolve(output), proposal);
  return { proposal, output: resolve(output) };
}

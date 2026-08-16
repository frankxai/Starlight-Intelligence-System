import assert from "node:assert/strict";
import { test } from "node:test";

import { loadRegistry, validateRegistry } from "../scripts/validate-agent-deployments.mjs";

const registry = await loadRegistry();

function mutated(change) {
  const copy = structuredClone(registry);
  change(copy);
  return validateRegistry(copy);
}

test("the audited deployment registry satisfies every executable gate", () => {
  assert.deepEqual(validateRegistry(registry), []);
});

test("a deployment cannot smuggle in a second orchestration owner", () => {
  const failures = mutated((copy) => {
    copy.deployments[0].loop_owner = "openai-agents-runner";
  });
  assert.ok(failures.some((failure) => failure.includes("nested or ambiguous loops are forbidden")));
});

test("R3 and higher work is approval-gated in the tool plane", () => {
  const failures = mutated((copy) => {
    const deployment = copy.deployments.find((item) => item.id === "internal-production-studio");
    deployment.autonomy = "bounded-autonomous";
    deployment.policy.approval_events = [];
  });
  assert.ok(failures.some((failure) => failure.includes("R3+ deployments must be approval-gated")));
  assert.ok(failures.some((failure) => failure.includes("must gate external writes")));
});

test("sensitive personal data fails closed without region, ZDR and memory isolation", () => {
  const failures = mutated((copy) => {
    const deployment = copy.deployments.find((item) => item.id === "reality-architect-blueprint");
    deployment.policy.zdr = "preferred";
    deployment.policy.region = "tenant-configurable";
    copy.surfaces.find((item) => item.id === "reality-architect").data_boundary = "shared-product-kernel";
  });
  assert.ok(failures.some((failure) => failure.includes("sensitive data requires ZDR")));
  assert.ok(failures.some((failure) => failure.includes("sensitive data requires EU regional policy")));
  assert.ok(failures.some((failure) => failure.includes("isolated-personal-memory")));
});

test("BYOK keys cannot be stored as ordinary server secrets", () => {
  const failures = mutated((copy) => {
    copy.deployments.find((item) => item.id === "gencreator-campaign-forge").secret_handling = "server-managed";
  });
  assert.ok(failures.some((failure) => failure.includes("BYOK credentials must be encrypted and write-only")));
});

test("managed usage cannot launch without an application unit, budget and margin target", () => {
  const failures = mutated((copy) => {
    const commercial = copy.deployments.find((item) => item.id === "gencreator-campaign-forge").commercial;
    commercial.billable_unit = "none";
    commercial.managed_provider_envelope_eur = 0;
    commercial.target_median_gross_margin_pct = 60;
  });
  assert.ok(failures.some((failure) => failure.includes("positive provider envelope")));
  assert.ok(failures.some((failure) => failure.includes("at least 75%")));
  assert.ok(failures.some((failure) => failure.includes("application-level billable unit")));
});

test("live is an evidence claim, not a marketing label", () => {
  const failures = mutated((copy) => {
    copy.deployments.find((item) => item.id === "gencreator-campaign-forge").lifecycle = "live";
  });
  assert.ok(failures.some((failure) => failure.includes("advisory registries cannot authorize a live lifecycle")));
  assert.ok(failures.some((failure) => failure.includes("live lifecycle requires test evidence")));
});

test("v1.0 cannot be relabeled as a release gate", () => {
  const failures = mutated((copy) => {
    copy.registrar_mode = "release-gate";
  });
  assert.ok(failures.some((failure) => failure.includes("must remain advisory")));
});

test("raw provider-credit resale and uncapped usage cannot be enabled", () => {
  const failures = mutated((copy) => {
    copy.policy_defaults.raw_provider_credit_resale = true;
    copy.policy_defaults.managed_usage_hard_cap = false;
  });
  assert.ok(failures.some((failure) => failure.includes("raw provider-credit resale")));
  assert.ok(failures.some((failure) => failure.includes("hard cap")));
});

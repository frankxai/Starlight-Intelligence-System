import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const registryUrl = new URL("../context/empire/agent-deployments.json", import.meta.url);

const riskRank = new Map([
  ["R0", 0],
  ["R1", 1],
  ["R2", 2],
  ["R3", 3],
  ["R4", 4],
  ["R5", 5],
]);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

function duplicateIds(records, collectionName, failures) {
  const seen = new Set();
  for (const record of records) {
    if (!record?.id) {
      failures.push(`${collectionName}: every record requires an id`);
      continue;
    }
    if (seen.has(record.id)) failures.push(`${collectionName}: duplicate id ${record.id}`);
    seen.add(record.id);
  }
}

function validateEvidence(records, owner, asOf, failures) {
  if (!Array.isArray(records) || records.length === 0) {
    failures.push(`${owner}: evidence must be non-empty`);
    return;
  }
  for (const [index, evidence] of records.entries()) {
    const label = `${owner}: evidence ${index + 1}`;
    if (!evidence?.reference?.trim()) failures.push(`${label} requires a reference`);
    if (!evidence?.claim?.trim()) failures.push(`${label} requires a claim`);
    if (!isIsoDate(evidence?.observed_at)) failures.push(`${label} requires an ISO date`);
    if (isIsoDate(evidence?.observed_at) && evidence.observed_at > asOf) {
      failures.push(`${label} cannot postdate registry as_of ${asOf}`);
    }
  }
}

export function validateRegistry(registry) {
  const failures = [];

  if (registry?.schema_version !== "1.0.0") failures.push("schema_version must be 1.0.0");
  if (registry?.registrar_mode !== "advisory") {
    failures.push("registrar_mode must remain advisory until the v1.1 release evidence contract lands");
  }
  if (!isIsoDate(registry?.as_of)) failures.push("as_of must be an ISO date");
  if (registry?.authority?.run_rule !== "exactly-one-orchestration-loop-per-run") {
    failures.push("authority.run_rule must enforce exactly one orchestration loop per run");
  }
  if (registry?.authority?.capability_abi !== "tenant-aware-mcp") {
    failures.push("authority.capability_abi must be tenant-aware-mcp");
  }
  if (registry?.policy_defaults?.raw_provider_credit_resale !== false) {
    failures.push("raw provider-credit resale must remain disabled");
  }
  if (registry?.policy_defaults?.plaintext_byok_storage !== false) {
    failures.push("plaintext BYOK storage must remain disabled");
  }
  if (registry?.policy_defaults?.managed_usage_hard_cap !== true) {
    failures.push("managed usage must have a hard cap");
  }

  const surfaces = Array.isArray(registry?.surfaces) ? registry.surfaces : [];
  const runtimes = Array.isArray(registry?.runtimes) ? registry.runtimes : [];
  const deployments = Array.isArray(registry?.deployments) ? registry.deployments : [];

  if (surfaces.length === 0) failures.push("surfaces must be non-empty");
  if (runtimes.length === 0) failures.push("runtimes must be non-empty");
  if (deployments.length === 0) failures.push("deployments must be non-empty");

  duplicateIds(surfaces, "surfaces", failures);
  duplicateIds(runtimes, "runtimes", failures);
  duplicateIds(deployments, "deployments", failures);

  const surfacesById = new Map(surfaces.map((surface) => [surface.id, surface]));
  const runtimesById = new Map(runtimes.map((runtime) => [runtime.id, runtime]));
  const priorities = new Set();

  for (const surface of surfaces) {
    validateEvidence(surface.evidence, `surface ${surface.id}`, registry.as_of, failures);
    if (surface.deployment_state === "production-ready" && surface.production_domains?.length === 0) {
      const bindingEvidence = surface.evidence?.some((item) => /domain|binding/i.test(`${item.reference} ${item.claim}`));
      if (!bindingEvidence) {
        failures.push(`surface ${surface.id}: production-ready without a domain requires explicit binding evidence`);
      }
    }
    if (surface.data_boundary === "isolated-personal-memory" && surface.role !== "reflective-planning") {
      failures.push(`surface ${surface.id}: isolated personal memory is reserved for reflective-planning surfaces`);
    }
  }

  for (const runtime of runtimes) {
    if (!runtime.loop_owner?.trim()) failures.push(`runtime ${runtime.id}: loop_owner is required`);
    if (!Array.isArray(runtime.constraints) || runtime.constraints.length === 0) {
      failures.push(`runtime ${runtime.id}: constraints must be non-empty`);
    }
  }

  for (const deployment of deployments) {
    const label = `deployment ${deployment.id}`;
    const surface = surfacesById.get(deployment.surface_id);
    const runtime = runtimesById.get(deployment.runtime_id);

    if (!surface) failures.push(`${label}: unknown surface_id ${deployment.surface_id}`);
    if (!runtime) failures.push(`${label}: unknown runtime_id ${deployment.runtime_id}`);
    if (runtime?.status === "deferred") failures.push(`${label}: cannot use deferred runtime ${runtime.id}`);
    if (runtime && deployment.loop_owner !== runtime.loop_owner) {
      failures.push(`${label}: loop_owner must equal ${runtime.loop_owner}; nested or ambiguous loops are forbidden`);
    }

    if (priorities.has(deployment.priority)) failures.push(`${label}: duplicate priority ${deployment.priority}`);
    priorities.add(deployment.priority);

    const rank = riskRank.get(deployment.risk_class);
    if (rank === undefined) failures.push(`${label}: unsupported risk class ${deployment.risk_class}`);
    if (rank >= 3 && deployment.autonomy !== "approval-gated") {
      failures.push(`${label}: R3+ deployments must be approval-gated`);
    }
    if (deployment.risk_class === "R5") {
      failures.push(`${label}: R5 deployments are not permitted in the product portfolio`);
    }
    if (rank >= 3 && !deployment.policy?.approval_events?.includes("external-write")) {
      failures.push(`${label}: R3+ deployments must gate external writes`);
    }

    const usesByok = ["tenant-byok", "dual"].includes(deployment.credential_mode);
    if (usesByok && deployment.secret_handling !== "encrypted-write-only") {
      failures.push(`${label}: BYOK credentials must be encrypted and write-only`);
    }
    if (deployment.credential_mode === "none" && deployment.secret_handling !== "not-applicable") {
      failures.push(`${label}: credential_mode none must use not-applicable secret handling`);
    }

    if (deployment.data_classes?.includes("sensitive")) {
      if (deployment.policy?.zdr !== "required") failures.push(`${label}: sensitive data requires ZDR`);
      if (deployment.policy?.region !== "eu-required") failures.push(`${label}: sensitive data requires EU regional policy`);
      if (surface?.data_boundary !== "isolated-personal-memory") {
        failures.push(`${label}: sensitive personal data requires an isolated-personal-memory surface`);
      }
    }
    if (runtime?.status === "pilot-only" && deployment.data_classes?.includes("sensitive")) {
      failures.push(`${label}: pilot runtimes cannot process sensitive data`);
    }

    if (deployment.commercial?.pricing_model === "subscription-plus-usage") {
      if (!(deployment.commercial.managed_provider_envelope_eur > 0)) {
        failures.push(`${label}: managed usage requires a positive provider envelope`);
      }
      if ((deployment.commercial.target_median_gross_margin_pct ?? 0) < 75) {
        failures.push(`${label}: managed usage target median gross margin must be at least 75%`);
      }
      if (!deployment.commercial.billable_unit || deployment.commercial.billable_unit === "none") {
        failures.push(`${label}: managed usage requires an application-level billable unit`);
      }
    }

    if (deployment.lifecycle === "live") {
      if (registry.registrar_mode === "advisory") {
        failures.push(`${label}: advisory registries cannot authorize a live lifecycle`);
      }
      if (surface?.deployment_state !== "production-ready") {
        failures.push(`${label}: live lifecycle requires a production-ready surface`);
      }
      if (!deployment.evidence?.some((item) => item.kind === "test")) {
        failures.push(`${label}: live lifecycle requires test evidence`);
      }
    }

    validateEvidence(deployment.evidence, label, registry.as_of, failures);
    if (!Array.isArray(deployment.forbidden_uses) || deployment.forbidden_uses.length === 0) {
      failures.push(`${label}: forbidden_uses must be non-empty`);
    }
    if (!Array.isArray(deployment.success_metrics) || deployment.success_metrics.length === 0) {
      failures.push(`${label}: success_metrics must be non-empty`);
    }
    if (!deployment.next_gate?.trim()) failures.push(`${label}: next_gate is required`);
  }

  return failures;
}

export async function loadRegistry(url = registryUrl) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function main() {
  const registry = await loadRegistry();
  const failures = validateRegistry(registry);
  if (failures.length > 0) {
    console.error("Agent deployment registry validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  const lifecycleCounts = Object.groupBy
    ? Object.fromEntries(
        Object.entries(Object.groupBy(registry.deployments, (deployment) => deployment.lifecycle)).map(
          ([key, value]) => [key, value.length],
        ),
      )
    : registry.deployments.reduce((counts, deployment) => {
        counts[deployment.lifecycle] = (counts[deployment.lifecycle] ?? 0) + 1;
        return counts;
      }, {});

  console.log(
    `Agent deployment registry valid: ${registry.deployments.length} deployments across ${registry.surfaces.length} surfaces (${registry.as_of}).`,
  );
  console.log(`Lifecycle: ${JSON.stringify(lifecycleCounts)}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await main();

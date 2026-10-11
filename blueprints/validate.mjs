#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getContract,
  loadContractRegistry,
  validateValue,
} from "../tools/foundry/lib/schema.mjs";

const blueprintRoot = dirname(fileURLToPath(import.meta.url));
const contractsDir = join(blueprintRoot, "contracts");
const examplesDir = join(blueprintRoot, "examples");
const registry = loadContractRegistry(contractsDir);
const contract = getContract(registry, "architecture-blueprint-manifest");

function issue(errors, path, code, message) {
  errors.push({ path, code, message });
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function isImmutableEvidenceRef(value) {
  return (
    typeof value === "string" &&
    /^https:\/\/[^\s#]+#sha256=[a-f0-9]{64}$/.test(value)
  );
}

function environmentByName(surface) {
  return new Map(
    (Array.isArray(surface?.environment) ? surface.environment : [])
      .filter((entry) => typeof entry?.name === "string")
      .map((entry) => [entry.name, entry]),
  );
}

function validateSemanticInvariants(manifest) {
  const errors = [];
  if (manifest === null || typeof manifest !== "object" || Array.isArray(manifest)) return errors;

  const surfaces = Array.isArray(manifest.surfaces) ? manifest.surfaces : [];
  const surfaceIds = surfaces.map((surface) => surface?.id).filter((id) => typeof id === "string");
  const surfaceById = new Map(surfaces.map((surface) => [surface?.id, surface]));

  for (const id of duplicateValues(surfaceIds)) {
    issue(errors, "$.surfaces", "DUPLICATE_SURFACE", `surface id must be unique: ${id}`);
  }

  for (const surface of surfaces) {
    const path = `$.surfaces[${surfaceIds.indexOf(surface?.id)}]`;
    const environmentNames = (surface?.environment ?? [])
      .map((entry) => entry?.name)
      .filter((name) => typeof name === "string");
    for (const name of duplicateValues(environmentNames)) {
      issue(errors, `${path}.environment`, "DUPLICATE_ENVIRONMENT", `environment name must be unique: ${name}`);
    }

    const unitIds = (surface?.units ?? [])
      .map((unit) => unit?.id)
      .filter((id) => typeof id === "string");
    for (const id of duplicateValues(unitIds)) {
      issue(errors, `${path}.units`, "DUPLICATE_UNIT", `deployment unit id must be unique: ${id}`);
    }

    if (surface?.source?.state === "available") {
      for (const key of ["repository", "rootDirectory", "ref"]) {
        if (typeof surface.source[key] !== "string" || surface.source[key].length === 0) {
          issue(
            errors,
            `${path}.source.${key}`,
            "AVAILABLE_SOURCE_INCOMPLETE",
            `available source requires ${key}`,
          );
        }
      }
    }

    if (surface?.deployment?.state === "published") {
      if (!surface.deployment.releaseTemplateRef) {
        issue(
          errors,
          `${path}.deployment.releaseTemplateRef`,
          "PUBLISHED_TEMPLATE_REF_REQUIRED",
          "published deployment requires a release template reference",
        );
      }
      if (surface?.source?.state !== "available") {
        issue(
          errors,
          `${path}.source.state`,
          "PUBLISHED_SOURCE_REQUIRED",
          "published deployment requires available pinned source",
        );
      }
    }

    if (surface?.provider === "vercel" && surface?.deployment?.method !== "vercel-project") {
      issue(
        errors,
        `${path}.deployment.method`,
        "VERCEL_PROJECT_REQUIRED",
        "a Vercel surface must be modeled as a Vercel project",
      );
    }
    if (surface?.provider === "railway") {
      if (surface?.deployment?.method !== "railway-project") {
        issue(
          errors,
          `${path}.deployment.method`,
          "RAILWAY_PROJECT_REQUIRED",
          "a Railway surface must be modeled as a Railway multi-service project",
        );
      }
      if (surface?.deployment?.iacPath !== ".railway/railway.ts") {
        issue(
          errors,
          `${path}.deployment.iacPath`,
          "RAILWAY_IAC_REQUIRED",
          "Railway project IaC must use .railway/railway.ts; marketplace templates are release artifacts",
        );
      }
    }
  }

  const deploymentOrder = Array.isArray(manifest.deploymentOrder) ? manifest.deploymentOrder : [];
  const deploymentSet = new Set(deploymentOrder);
  const surfaceSet = new Set(surfaceIds);
  if (
    deploymentOrder.length !== surfaceIds.length ||
    [...surfaceSet].some((id) => !deploymentSet.has(id)) ||
    [...deploymentSet].some((id) => !surfaceSet.has(id))
  ) {
    issue(
      errors,
      "$.deploymentOrder",
      "DEPLOYMENT_ORDER_MISMATCH",
      "deploymentOrder must name every surface exactly once",
    );
  }

  const connections = Array.isArray(manifest.connections) ? manifest.connections : [];
  const connectionIds = connections
    .map((connection) => connection?.id)
    .filter((id) => typeof id === "string");
  for (const id of duplicateValues(connectionIds)) {
    issue(errors, "$.connections", "DUPLICATE_CONNECTION", `connection id must be unique: ${id}`);
  }

  const connectedSurfaceIds = new Set();
  connections.forEach((connection, index) => {
    const path = `$.connections[${index}]`;
    const source = surfaceById.get(connection?.from);
    const target = surfaceById.get(connection?.to);
    if (!source) {
      issue(errors, `${path}.from`, "UNKNOWN_SURFACE", `unknown source surface: ${connection?.from}`);
    } else {
      connectedSurfaceIds.add(connection.from);
    }
    if (!target) {
      issue(errors, `${path}.to`, "UNKNOWN_SURFACE", `unknown target surface: ${connection?.to}`);
    } else {
      connectedSurfaceIds.add(connection.to);
    }
    if (connection?.from && connection?.from === connection?.to) {
      issue(errors, path, "SELF_CONNECTION", "a connection must cross two distinct surfaces");
    }
    if (!source || !target) return;

    const sourceEnvironment = environmentByName(source);
    const targetEnvironment = environmentByName(target);
    const endpoint = sourceEnvironment.get(connection.endpointRef);
    if (!endpoint || endpoint.required !== true || endpoint.secret !== false) {
      issue(
        errors,
        `${path}.endpointRef`,
        "INVALID_ENDPOINT_REF",
        "endpointRef must resolve to a required, non-secret variable on the source surface",
      );
    }

    const secretModes = new Set(["service-token", "bearer-token", "mtls"]);
    const sourceSecretRef = connection?.auth?.sourceSecretRef;
    const targetSecretRef = connection?.auth?.targetSecretRef;
    if (connection?.auth?.mode === "none" && (sourceSecretRef !== null || targetSecretRef !== null)) {
      issue(errors, `${path}.auth`, "AUTH_NONE_HAS_SECRET", "auth mode none cannot reference secrets");
    }
    if (secretModes.has(connection?.auth?.mode)) {
      const sourceSecret = sourceEnvironment.get(sourceSecretRef);
      const targetSecret = targetEnvironment.get(targetSecretRef);
      if (!sourceSecret || sourceSecret.required !== true || sourceSecret.secret !== true) {
        issue(
          errors,
          `${path}.auth.sourceSecretRef`,
          "INVALID_SOURCE_SECRET_REF",
          "authenticated connection requires a required secret on the source surface",
        );
      }
      if (!targetSecret || targetSecret.required !== true || targetSecret.secret !== true) {
        issue(
          errors,
          `${path}.auth.targetSecretRef`,
          "INVALID_TARGET_SECRET_REF",
          "authenticated connection requires a required secret on the target surface",
        );
      }
    }
    if (
      connection?.client === "browser" &&
      (sourceSecretRef !== null || targetSecretRef !== null || secretModes.has(connection?.auth?.mode))
    ) {
      issue(
        errors,
        `${path}.client`,
        "BROWSER_SECRET_FORBIDDEN",
        "browser connections cannot carry provider or operator secrets; use a server boundary",
      );
    }

    const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
    if (
      connection?.mutationPolicy === "read-only" &&
      (connection?.interface?.methods ?? []).some((method) => mutatingMethods.has(method))
    ) {
      issue(
        errors,
        `${path}.mutationPolicy`,
        "MUTATION_POLICY_CONFLICT",
        "a read-only connection cannot declare a mutating HTTP method",
      );
    }
    if (
      connection?.mutationPolicy === "approval-required" &&
      manifest?.controls?.approvals?.externalMutationDefault !== "human"
    ) {
      issue(
        errors,
        `${path}.mutationPolicy`,
        "HUMAN_APPROVAL_CONTROL_REQUIRED",
        "approval-required connection needs a human external-mutation default",
      );
    }

    if (source.provider === "vercel" && target.provider === "railway") {
      if (connection.client !== "server") {
        issue(
          errors,
          `${path}.client`,
          "VERCEL_RAILWAY_SERVER_BOUNDARY_REQUIRED",
          "Vercel-to-Railway calls must originate from a Vercel server boundary",
        );
      }
      if (!secretModes.has(connection?.auth?.mode)) {
        issue(
          errors,
          `${path}.auth.mode`,
          "VERCEL_RAILWAY_AUTH_REQUIRED",
          "Vercel-to-Railway calls require an authenticated secret mode and mapped secrets on both surfaces",
        );
      }
      if (connection.protocol !== "https" || target.exposure !== "protected-public") {
        issue(
          errors,
          path,
          "VERCEL_RAILWAY_PUBLIC_HTTPS_REQUIRED",
          "Vercel must reach Railway through authenticated protected-public HTTPS, never private railway.internal networking",
        );
      }
    }
  });

  for (const id of surfaceIds) {
    if (!connectedSurfaceIds.has(id)) {
      issue(errors, "$.connections", "DISCONNECTED_SURFACE", `surface is not connected: ${id}`);
    }
  }

  const adapters = Array.isArray(manifest.adapters) ? manifest.adapters : [];
  const adapterIds = adapters.map((adapter) => adapter?.id).filter((id) => typeof id === "string");
  for (const id of duplicateValues(adapterIds)) {
    issue(errors, "$.adapters", "DUPLICATE_ADAPTER", `adapter id must be unique: ${id}`);
  }
  adapters.forEach((adapter, index) => {
    const path = `$.adapters[${index}]`;
    if (!surfaceSet.has(adapter?.attachesTo)) {
      issue(errors, `${path}.attachesTo`, "UNKNOWN_SURFACE", `unknown adapter surface: ${adapter?.attachesTo}`);
    }
    if (adapter?.state !== "planned" && !adapter?.sourceRef) {
      issue(errors, `${path}.sourceRef`, "ADAPTER_SOURCE_REQUIRED", `${adapter?.state} adapter requires sourceRef`);
    }
    if (adapter?.state === "verified" && !adapter?.evidence) {
      issue(errors, `${path}.evidence`, "ADAPTER_EVIDENCE_REQUIRED", "verified adapter requires evidence");
    }
  });

  const verification = manifest.verification ?? {};
  const checks = Array.isArray(verification.checks) ? verification.checks : [];
  const checkIds = checks.map((check) => check?.id).filter((id) => typeof id === "string");
  for (const id of duplicateValues(checkIds)) {
    issue(errors, "$.verification.checks", "DUPLICATE_CHECK", `verification check id must be unique: ${id}`);
  }
  checks.forEach((check, index) => {
    const path = `$.verification.checks[${index}]`;
    if (check?.target !== "manifest" && !surfaceSet.has(check?.target)) {
      issue(errors, `${path}.target`, "UNKNOWN_VERIFICATION_TARGET", `unknown check target: ${check?.target}`);
    }
    if (check?.status === "passed" && !check?.evidence) {
      issue(errors, `${path}.evidence`, "PASSED_CHECK_EVIDENCE_REQUIRED", "passed check requires evidence");
    }
  });

  if (checks.some((check) => check?.status === "passed") && !verification.lastVerifiedAt) {
    issue(
      errors,
      "$.verification.lastVerifiedAt",
      "VERIFICATION_TIME_REQUIRED",
      "a manifest with passing checks requires lastVerifiedAt",
    );
  }
  const hasPassingManifestSchema = checks.some(
    (check) => check?.target === "manifest" && check?.kind === "schema" && check?.status === "passed",
  );
  if (verification.state === "contract-valid" && !hasPassingManifestSchema) {
    issue(
      errors,
      "$.verification.state",
      "CONTRACT_VALID_PROOF_REQUIRED",
      "contract-valid requires a passing manifest schema check",
    );
  }
  if (manifest.status === "verified" || verification.state === "production-proven") {
    if (manifest.status !== "verified" || verification.state !== "production-proven") {
      issue(
        errors,
        "$.verification.state",
        "VERIFIED_STATE_MISMATCH",
        "verified status and production-proven verification state must appear together",
      );
    }
    for (const surface of surfaces) {
      if (surface?.source?.state !== "available") {
        issue(
          errors,
          "$.surfaces",
          "PRODUCTION_SOURCE_REQUIRED",
          `production-proven requires available source: ${surface?.id}`,
        );
      }
      if (!new Set(["available", "published"]).has(surface?.deployment?.state)) {
        issue(
          errors,
          "$.surfaces",
          "PRODUCTION_DEPLOYMENT_REQUIRED",
          `production-proven requires an available deployment: ${surface?.id}`,
        );
      }
    }

    const requiredCoverage = [
      { kind: "schema", target: "manifest" },
      { kind: "integration", target: "manifest" },
      ...surfaceIds.flatMap((target) =>
        ["build", "health", "security", "rollback"].map((kind) => ({ kind, target })),
      ),
    ];
    for (const requiredCheck of requiredCoverage) {
      const covered = checks.some(
        (check) =>
          check?.kind === requiredCheck.kind &&
          check?.target === requiredCheck.target &&
          check?.required === true &&
          check?.status === "passed" &&
          isImmutableEvidenceRef(check?.evidence),
      );
      if (!covered) {
        issue(
          errors,
          "$.verification.checks",
          "PRODUCTION_CHECK_COVERAGE",
          `production-proven requires a required, passing, immutable ${requiredCheck.kind} check for ${requiredCheck.target}`,
        );
      }
    }

    for (const check of checks.filter((entry) => entry?.required)) {
      if (check.status !== "passed" || !check.evidence) {
        issue(
          errors,
          "$.verification.checks",
          "REQUIRED_CHECK_NOT_PROVEN",
          `required check is not proven: ${check.id}`,
        );
      } else if (!isImmutableEvidenceRef(check.evidence)) {
        issue(
          errors,
          "$.verification.checks",
          "PRODUCTION_EVIDENCE_REQUIRED",
          `production evidence must be an immutable HTTPS reference with a SHA-256 fragment: ${check.id}`,
        );
      }
    }
    for (const adapter of adapters.filter((entry) => entry?.required)) {
      if (adapter.state !== "verified" || !isImmutableEvidenceRef(adapter.evidence)) {
        issue(
          errors,
          "$.adapters",
          "REQUIRED_ADAPTER_NOT_PROVEN",
          `required adapter is not proven: ${adapter.id}`,
        );
      }
    }
  }

  return errors;
}

export function validateBlueprint(manifest) {
  const structural = validateValue(manifest, contract, registry);
  return [
    ...structural.errors,
    ...validateSemanticInvariants(manifest),
  ];
}

export function validateBlueprintFile(path) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  return { manifest, errors: validateBlueprint(manifest) };
}

function defaultBlueprintPaths() {
  return readdirSync(examplesDir)
    .filter((entry) => entry.endsWith(".blueprint.json"))
    .sort()
    .map((entry) => join(examplesDir, entry));
}

function main() {
  const paths = process.argv.slice(2).map((path) => resolve(path));
  const targets = paths.length > 0 ? paths.sort() : defaultBlueprintPaths();
  let failureCount = 0;

  for (const path of targets) {
    try {
      const { manifest, errors } = validateBlueprintFile(path);
      if (errors.length === 0) {
        console.log(`Blueprint valid: ${manifest.id}@${manifest.version} (${path})`);
        continue;
      }
      failureCount += 1;
      console.error(`Blueprint invalid: ${path}`);
      for (const error of errors) {
        console.error(`- ${error.path} [${error.code}] ${error.message}`);
      }
    } catch (error) {
      failureCount += 1;
      console.error(`Blueprint unreadable: ${path}`);
      console.error(`- ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failureCount > 0) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

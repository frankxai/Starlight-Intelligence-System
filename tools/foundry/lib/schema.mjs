import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { readJson } from "./io.mjs";

function typeMatches(value, expected) {
  if (expected === "null") return value === null;
  if (expected === "array") return Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return typeof value === expected;
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function resolvePointer(document, pointer) {
  if (!pointer || pointer === "#") return document;
  if (!pointer.startsWith("#/")) {
    throw new Error(`Unsupported JSON pointer: ${pointer}`);
  }
  return pointer
    .slice(2)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((current, key) => current?.[key], document);
}

function resolveRef(ref, rootSchema, registry) {
  if (ref.startsWith("#")) {
    return { schema: resolvePointer(rootSchema, ref), rootSchema };
  }
  const [id, fragment = ""] = ref.split("#", 2);
  const external = registry.get(id) ?? registry.get(basename(id));
  if (!external) throw new Error(`Unknown schema reference: ${ref}`);
  const schema = fragment ? resolvePointer(external, `#${fragment}`) : external;
  return { schema, rootSchema: external };
}

function pushError(errors, path, code, message) {
  errors.push({ path: path || "$", code, message });
}

function validateNode(value, schema, context, path) {
  const { errors, registry } = context;
  if (schema === true) return;
  if (schema === false) {
    pushError(errors, path, "FALSE_SCHEMA", "value is forbidden by the schema");
    return;
  }
  if (!schema || typeof schema !== "object") return;

  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, context.rootSchema, registry);
    validateNode(value, resolved.schema, { ...context, rootSchema: resolved.rootSchema }, path);
    return;
  }

  if (Array.isArray(schema.allOf)) {
    for (const branch of schema.allOf) validateNode(value, branch, context, path);
  }

  if (Array.isArray(schema.anyOf)) {
    const matched = schema.anyOf.some((branch) => {
      const branchErrors = [];
      validateNode(value, branch, { ...context, errors: branchErrors }, path);
      return branchErrors.length === 0;
    });
    if (!matched) pushError(errors, path, "ANY_OF", "value does not match any allowed schema");
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter((branch) => {
      const branchErrors = [];
      validateNode(value, branch, { ...context, errors: branchErrors }, path);
      return branchErrors.length === 0;
    }).length;
    if (matches !== 1) pushError(errors, path, "ONE_OF", `value matches ${matches} branches; expected exactly one`);
  }

  if (schema.not) {
    const branchErrors = [];
    validateNode(value, schema.not, { ...context, errors: branchErrors }, path);
    if (branchErrors.length === 0) pushError(errors, path, "NOT", "value matches a forbidden schema");
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    pushError(errors, path, "CONST", `value must equal ${JSON.stringify(schema.const)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((entry) => deepEqual(value, entry))) {
    pushError(errors, path, "ENUM", `value is not one of the allowed options`);
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((expected) => typeMatches(value, expected))) {
      pushError(errors, path, "TYPE", `expected ${types.join(" or ")}`);
      return;
    }
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      pushError(errors, path, "MIN_LENGTH", `must contain at least ${schema.minLength} characters`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      pushError(errors, path, "MAX_LENGTH", `must contain at most ${schema.maxLength} characters`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      pushError(errors, path, "PATTERN", `must match ${schema.pattern}`);
    }
    if (
      schema.format === "date-time" &&
      (
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
        Number.isNaN(Date.parse(value))
      )
    ) {
      pushError(errors, path, "FORMAT", "must be an ISO date-time");
    }
    if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      pushError(errors, path, "FORMAT", "must be an ISO date");
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (schema.minimum !== undefined && value < schema.minimum) {
      pushError(errors, path, "MINIMUM", `must be at least ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      pushError(errors, path, "MAXIMUM", `must be at most ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      pushError(errors, path, "MIN_ITEMS", `must contain at least ${schema.minItems} items`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      pushError(errors, path, "MAX_ITEMS", `must contain at most ${schema.maxItems} items`);
    }
    if (schema.uniqueItems) {
      const serialized = value.map((entry) => JSON.stringify(entry));
      if (new Set(serialized).size !== serialized.length) {
        pushError(errors, path, "UNIQUE_ITEMS", "must not contain duplicate items");
      }
    }
    if (schema.items) {
      value.forEach((entry, index) => validateNode(entry, schema.items, context, `${path}[${index}]`));
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = schema.properties ?? {};
    for (const key of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        pushError(errors, `${path}.${key}`, "REQUIRED", "required property is missing");
      }
    }
    for (const [key, entry] of Object.entries(value)) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        validateNode(entry, properties[key], context, `${path}.${key}`);
      } else if (schema.additionalProperties === false) {
        pushError(errors, `${path}.${key}`, "ADDITIONAL_PROPERTY", "property is not allowed");
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateNode(entry, schema.additionalProperties, context, `${path}.${key}`);
      }
    }
  }
}

export function loadContractRegistry(contractsDir) {
  const registry = new Map();
  for (const file of readdirSync(contractsDir).filter((entry) => entry.endsWith(".schema.json"))) {
    const schema = readJson(join(contractsDir, file));
    registry.set(file, schema);
    registry.set(file.replace(/\.schema\.json$/, ""), schema);
    if (schema.$id) registry.set(schema.$id, schema);
  }
  return registry;
}

export function getContract(registry, name) {
  const normalized = name
    .replace(/^.*\//, "")
    .replace(/\.schema\.json$/, "")
    .replace(/\.json$/, "");
  const schema = registry.get(name) ?? registry.get(normalized) ?? registry.get(`${normalized}.schema.json`);
  if (!schema) throw new Error(`Unknown Foundry contract: ${name}`);
  return schema;
}

export function validateValue(value, schema, registry) {
  const errors = [];
  validateNode(value, schema, { errors, registry, rootSchema: schema }, "$");
  if (schema.$id?.endsWith("/taste-profile.schema.json") && value && typeof value === "object") {
    const weights = Array.isArray(value.dimensions)
      ? value.dimensions.map((dimension) => dimension?.weight).filter((weight) => typeof weight === "number")
      : [];
    const weightTotal = weights.reduce((total, weight) => total + weight, 0);
    if (weights.length > 0 && Math.abs(weightTotal - 1) > 1e-9) {
      pushError(errors, "$.dimensions", "WEIGHT_TOTAL", `dimension weights must total 1.0; received ${weightTotal}`);
    }
    for (const key of ["hardGates", "dimensions"]) {
      const ids = Array.isArray(value[key]) ? value[key].map((entry) => entry?.id).filter(Boolean) : [];
      if (new Set(ids).size !== ids.length) {
        pushError(errors, `$.${key}`, "DUPLICATE_ID", `${key} ids must be unique`);
      }
    }
    const candidatePolicy = value.candidatePolicy;
    if (
      candidatePolicy &&
      candidatePolicy.minimumCandidates > candidatePolicy.maximumCandidates
    ) {
      pushError(
        errors,
        "$.candidatePolicy",
        "CANDIDATE_RANGE",
        "minimumCandidates must not exceed maximumCandidates",
      );
    }
    if (
      candidatePolicy?.comparisonMethod === "blind-pairwise" &&
      candidatePolicy.maximumCandidates < 2
    ) {
      pushError(
        errors,
        "$.candidatePolicy.maximumCandidates",
        "PAIRWISE_CANDIDATES",
        "blind-pairwise comparison requires at least two possible candidates",
      );
    }
  }
  if (schema.$id?.endsWith("/capability-graph.schema.json") && value && typeof value === "object") {
    const nodeIds = new Set();
    const addressOwners = new Map();
    for (const node of Array.isArray(value.nodes) ? value.nodes : []) {
      if (nodeIds.has(node.id)) {
        pushError(errors, "$.nodes", "DUPLICATE_NODE", `duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);
      if (typeof node.id === "string" && node.kind && !node.id.startsWith(`${node.kind}:`)) {
        pushError(errors, "$.nodes", "NODE_KIND", `node ${node.id} does not match kind ${node.kind}`);
      }
      for (const address of [node.id, ...(node.aliases ?? [])]) {
        const owner = addressOwners.get(address);
        if (owner && owner !== node.id) {
          pushError(errors, "$.nodes", "ALIAS_COLLISION", `${address} maps to both ${owner} and ${node.id}`);
        }
        addressOwners.set(address, node.id);
      }
    }
    const edgeKeys = new Set();
    for (const edge of Array.isArray(value.edges) ? value.edges : []) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        pushError(
          errors,
          "$.edges",
          "DANGLING_EDGE",
          `edge endpoints must be canonical node ids: ${edge.from} -> ${edge.to}`,
        );
      }
      const key = `${edge.from}|${edge.relation}|${edge.to}`;
      if (edgeKeys.has(key)) {
        pushError(errors, "$.edges", "DUPLICATE_EDGE", `duplicate edge: ${key}`);
      }
      edgeKeys.add(key);
    }
  }
  if (
    schema.$id?.endsWith("/host-capability-registry.schema.json") &&
    value &&
    typeof value === "object"
  ) {
    const ids = (Array.isArray(value.surfaces) ? value.surfaces : [])
      .map((surface) => surface?.id)
      .filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      pushError(errors, "$.surfaces", "DUPLICATE_ID", "surface ids must be unique");
    }
  }
  if (
    schema.$id?.endsWith("/platform-release-receipt.schema.json") &&
    value &&
    typeof value === "object"
  ) {
    if (Date.parse(value.expiresAt) <= Date.parse(value.createdAt)) {
      pushError(errors, "$.expiresAt", "RECEIPT_EXPIRY", "receipt expiry must follow creation");
    }
    if (Date.parse(value.run?.completedAt) < Date.parse(value.run?.startedAt)) {
      pushError(errors, "$.run.completedAt", "RUN_ORDER", "run completion must follow its start");
    }

    const evidence = Array.isArray(value.evidence) ? value.evidence : [];
    const evidenceIds = evidence.map((artifact) => artifact?.id).filter(Boolean);
    if (new Set(evidenceIds).size !== evidenceIds.length) {
      pushError(errors, "$.evidence", "DUPLICATE_ID", "evidence ids must be unique");
    }
    const evidenceSet = new Set(evidenceIds);
    for (const collection of [value.checks, value.claims]) {
      for (const entry of Array.isArray(collection) ? collection : []) {
        for (const ref of Array.isArray(entry?.evidenceRefs) ? entry.evidenceRefs : []) {
          if (!evidenceSet.has(ref)) {
            pushError(errors, "$.evidence", "DANGLING_EVIDENCE", `unknown evidence reference: ${ref}`);
          }
        }
      }
    }

    const checkIds = (Array.isArray(value.checks) ? value.checks : [])
      .map((check) => check?.id)
      .filter(Boolean);
    if (new Set(checkIds).size !== checkIds.length) {
      pushError(errors, "$.checks", "DUPLICATE_ID", "check ids must be unique");
    }

    const strongStates = new Set(["verified", "published", "supported"]);
    const distributedStates = new Set(["published", "supported"]);
    const checks = Array.isArray(value.checks) ? value.checks : [];
    for (const claim of Array.isArray(value.claims) ? value.claims : []) {
      const claimRefs = Array.isArray(claim?.evidenceRefs) ? claim.evidenceRefs : [];
      if (
        [...strongStates, "degraded"].includes(claim?.state) &&
        claimRefs.length === 0
      ) {
        pushError(
          errors,
          "$.claims",
          "CLAIM_EVIDENCE",
          `${claim.state} claims require at least one evidence reference`,
        );
      }
      if (Date.parse(claim?.expiresAt) > Date.parse(value.expiresAt)) {
        pushError(
          errors,
          "$.claims",
          "CLAIM_EXPIRY",
          "claim expiry must not extend beyond receipt expiry",
        );
      }
      if (Date.parse(claim?.expiresAt) <= Date.parse(claim?.verifiedAt)) {
        pushError(errors, "$.claims", "CLAIM_EXPIRY", "claim expiry must follow verification");
      }

      const matchingChecks = checks.filter((check) => check?.capability === claim?.capability);
      const evidencedPass = matchingChecks.some(
        (check) =>
          check.status === "pass" &&
          (Array.isArray(check.evidenceRefs) ? check.evidenceRefs : []).some((ref) =>
            claimRefs.includes(ref),
          ),
      );
      if (strongStates.has(claim?.state) && !evidencedPass) {
        pushError(
          errors,
          "$.claims",
          "CLAIM_PASS",
          `${claim.state} claims require an evidenced passing check for ${claim.capability}`,
        );
      }
      if (strongStates.has(claim?.state)) {
        pushError(
          errors,
          "$.attestation",
          "ATTESTATION_VERIFIER_REQUIRED",
          "strong claims require external cryptographic attestation verification; structural validation cannot promote them",
        );
      }
      if (strongStates.has(claim?.state) && value.adapter?.tier === "unsupported") {
        pushError(
          errors,
          "$.adapter.tier",
          "UNSUPPORTED_ADAPTER_CLAIM",
          `${claim.state} is forbidden for an unsupported adapter`,
        );
      }
      if (distributedStates.has(claim?.state)) {
        if (value.distribution?.reviewState === "blocked") {
          pushError(
            errors,
            "$.distribution.reviewState",
            "BLOCKED_DISTRIBUTION_CLAIM",
            `${claim.state} is forbidden for a blocked distribution`,
          );
        }
        if (!value.distribution?.listingUrl) {
          pushError(
            errors,
            "$.distribution.listingUrl",
            "LISTING_REQUIRED",
            `${claim.state} requires a public release or listing URL`,
          );
        }
        if (
          ["public-marketplace", "team-marketplace"].includes(value.distribution?.mode) &&
          value.distribution?.reviewState !== "approved"
        ) {
          pushError(
            errors,
            "$.distribution.reviewState",
            "MARKETPLACE_APPROVAL",
            `${claim.state} requires an approved marketplace review`,
          );
        }
      }
      if (claim?.state === "supported") {
        if (typeof claim.owner !== "string" || claim.owner.trim().length === 0) {
          pushError(errors, "$.claims", "SUPPORT_OWNER", "supported claims require an owner");
        }
        if (matchingChecks.some((check) => check.status === "fail")) {
          pushError(
            errors,
            "$.claims",
            "FAILING_SUPPORT_CHECK",
            `supported is forbidden while ${claim.capability} has a failing check`,
          );
        }
      }
    }

    if (value.attestation?.artifactSha256 !== value.subject?.artifactSha256) {
      pushError(
        errors,
        "$.attestation.artifactSha256",
        "ATTESTATION_SUBJECT",
        "attestation artifact digest must match the receipt subject",
      );
    }
  }
  return { valid: errors.length === 0, errors };
}

export function assertValid(value, schema, registry, label = "value") {
  const result = validateValue(value, schema, registry);
  if (!result.valid) {
    const details = result.errors
      .slice(0, 20)
      .map((error) => `${error.path} [${error.code}] ${error.message}`)
      .join("\n");
    const remainder = result.errors.length > 20 ? `\n...and ${result.errors.length - 20} more` : "";
    throw new Error(`${label} failed contract validation:\n${details}${remainder}`);
  }
  return result;
}

export function inferContractName(value) {
  if (typeof value?.$schema === "string" && value.$schema.includes("/foundry/")) {
    return value.$schema.split("/").at(-1).replace(/\.schema\.json$/, "");
  }
  if (value?.subject && value?.host && value?.claims) return "platform-release-receipt";
  if (value?.receiptId) return "evidence-receipt";
  if (value?.packageId && value?.compiler && value?.sources) return "foundry-manifest";
  if (value?.nodes && value?.edges) return "capability-graph";
  if (value?.hardGates && value?.dimensions) return "taste-profile";
  if (value?.objective && value?.completionTests) return "task-envelope";
  if (value?.kind) return `${value.kind}-pack`;
  throw new Error("Cannot infer Foundry contract. Pass --schema <contract-name>.");
}

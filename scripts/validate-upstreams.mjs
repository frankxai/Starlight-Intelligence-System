import { readFile } from "node:fs/promises";

const manifestUrl = new URL("../context/empire/upstreams.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

const allowedClasses = new Set([
  "standards",
  "runtime_dependency",
  "reference_harness",
  "memory_provider",
]);
const allowedAdoptions = new Set([
  "candidate",
  "conformance",
  "lab",
  "pattern",
  "shadow",
]);
const requiredFields = [
  "id",
  "class",
  "repository",
  "track",
  "verified_at",
  "adoption",
  "owner",
  "primitive",
  "security_notes",
];

const failures = [];
const ids = new Set();
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

if (manifest.schema_version !== "1.0.0") {
  failures.push("schema_version must be 1.0.0");
}
if (!isoDate.test(manifest.audit_cutoff ?? "")) {
  failures.push("audit_cutoff must be an ISO date");
}
if (!Array.isArray(manifest.upstreams) || manifest.upstreams.length === 0) {
  failures.push("upstreams must be a non-empty array");
}

for (const [index, upstream] of (manifest.upstreams ?? []).entries()) {
  const label = upstream?.id || `entry ${index}`;
  for (const field of requiredFields) {
    if (typeof upstream?.[field] !== "string" || upstream[field].trim() === "") {
      failures.push(`${label}: ${field} must be a non-empty string`);
    }
  }
  if (ids.has(upstream.id)) failures.push(`${label}: duplicate id`);
  ids.add(upstream.id);
  if (!allowedClasses.has(upstream.class)) {
    failures.push(`${label}: unsupported class ${upstream.class}`);
  }
  if (!allowedAdoptions.has(upstream.adoption)) {
    failures.push(`${label}: unsupported adoption ${upstream.adoption}`);
  }
  if (!isoDate.test(upstream.verified_at ?? "")) {
    failures.push(`${label}: verified_at must be an ISO date`);
  }
  try {
    const repository = new URL(upstream.repository);
    if (repository.protocol !== "https:" || repository.hostname !== "github.com") {
      failures.push(`${label}: repository must be an https://github.com URL`);
    }
  } catch {
    failures.push(`${label}: repository must be a valid URL`);
  }
  if (upstream.class === "reference_harness" && upstream.adoption !== "lab") {
    failures.push(`${label}: reference harnesses must remain lab-only`);
  }
  if (upstream.class === "memory_provider" && !["shadow", "pattern"].includes(upstream.adoption)) {
    failures.push(`${label}: memory providers must remain shadow or pattern-only`);
  }
}

if (failures.length > 0) {
  console.error("Upstream manifest validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Upstream manifest valid: ${manifest.upstreams.length} records (${manifest.audit_cutoff}).`);

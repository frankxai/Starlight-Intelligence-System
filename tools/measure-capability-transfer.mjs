#!/usr/bin/env node
// A local pilot instrument for the compounding thesis. No sample outcomes are shipped.
// Structural checks do not verify referenced evidence or establish causality.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertStrict, validate } from "../protocol/lib/jsonschema.mjs";

const schema = JSON.parse(readFileSync(new URL("../metrics/capability-transfer.v1.schema.json", import.meta.url), "utf8"));
assertStrict(schema);

export function validateObservation(record) {
  const errors = validate(schema, record);
  if (errors.length) return errors;
  const names = ["id", "sourceVenture", "destinationVenture", "capabilityId", "capabilityVersion", "permissionRef", "sourceVerificationRef", "destinationApplicationRef", "measurementMethod", "attributionLimits", "reviewedBy"];
  for (const name of names) if (!record[name].trim()) errors.push(`${name} must be non-empty`);
  if (record.sourceVenture === record.destinationVenture) errors.push("source and destination ventures must differ");
  if (!record.baseline.unit.trim() || record.baseline.unit !== record.outcome.unit) errors.push("baseline and outcome units must match");
  if (!Number.isFinite(record.baseline.value) || !Number.isFinite(record.outcome.value)) errors.push("values must be finite numbers");
  if (!Number.isFinite(Date.parse(record.observedAt))) errors.push("observedAt must be a real date-time");
  return errors;
}

export function summarize(records) {
  if (records.length === 0) return { status: "unmeasured", observations: null, improvingObservations: null, distinctCapabilities: null, evidenceLevel: "No transfer observations supplied" };
  const seenIds = new Set();
  const seenCapabilities = new Set();
  let improvingObservations = 0;
  let unchangedObservations = 0;
  for (const [index, record] of records.entries()) {
    const errors = validateObservation(record);
    if (errors.length) throw new Error(`observation ${index + 1}: ${errors.join("; ")}`);
    if (seenIds.has(record.id)) throw new Error(`observation ${index + 1}: duplicate id ${record.id}`);
    seenIds.add(record.id);
    seenCapabilities.add(`${record.capabilityId}@${record.capabilityVersion}`);
    const delta = record.baseline.direction === "higher"
      ? record.outcome.value - record.baseline.value
      : record.baseline.value - record.outcome.value;
    if (delta > 0) improvingObservations += 1;
    if (delta === 0) unchangedObservations += 1;
  }
  return {
    status: "observations-recorded",
    observations: records.length,
    improvingObservations,
    unchangedObservations,
    distinctCapabilities: seenCapabilities.size,
    evidenceLevel: "Reviewed record fields only; referenced evidence, attribution, and independence require separate verification",
  };
}

export function parseJsonl(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error(`line ${index + 1}: ${error.message}`); }
  });
}

function main(argv) {
  if (argv.length > 1 || argv[0] === "--help") {
    process.stdout.write("Usage: node tools/measure-capability-transfer.mjs [observations.jsonl]\nNo input reports unmeasured; a JSONL file reports structurally complete observations.\n");
    return argv[0] === "--help" ? 0 : 2;
  }
  try {
    const records = argv[0] ? parseJsonl(readFileSync(resolve(argv[0]), "utf8")) : [];
    process.stdout.write(`${JSON.stringify(summarize(records), null, 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`capability-transfer: ${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main(process.argv.slice(2));

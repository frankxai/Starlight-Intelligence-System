import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateCrossRecords, validateInvariants } from "./invariants.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaDir = join(root, "schemas", "v0.1");
const fixtureDir = join(root, "fixtures");
const schemaFiles = (await readdir(schemaDir)).filter((name) => name.endsWith(".json"));
const schemas = await Promise.all(schemaFiles.map(async (name) => JSON.parse(await readFile(join(schemaDir, name), "utf8"))));

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: false });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);
for (const schema of schemas) ajv.getSchema(schema.$id);

const manifest = JSON.parse(await readFile(join(fixtureDir, "manifest.json"), "utf8"));
const accepted = [];
const failures = [];

async function loadAndValidateRecord(test) {
  const schema = schemas.find((candidate) => candidate.$id.endsWith(`/${test.schema}`));
  if (!schema) throw new Error(`Unknown fixture schema: ${test.schema}`);
  const record = JSON.parse(await readFile(join(fixtureDir, test.file), "utf8"));
  const validator = ajv.getSchema(schema.$id);
  const structuralValid = validator(record);
  const structuralErrors = structuralValid ? [] : structuredClone(validator.errors ?? []);
  const invariantErrors = structuralValid ? validateInvariants(test.schema, record) : [];
  return { schemaName: test.schema, record, structuralValid, structuralErrors, invariantErrors, valid: structuralValid && invariantErrors.length === 0 };
}

for (const test of manifest.cases) {
  const result = await loadAndValidateRecord(test);
  const actualCodes = result.structuralValid ? result.invariantErrors.map((error) => error.code) : ["SCHEMA_INVALID"];
  const missingExpectedCodes = (test.expectedErrorCodes ?? []).filter((code) => !actualCodes.includes(code));
  if (result.valid !== test.valid || missingExpectedCodes.length) {
    failures.push({ test, structuralErrors: result.structuralErrors, invariantErrors: result.invariantErrors, missingExpectedCodes });
  }
  if (result.valid) accepted.push({ schemaName: test.schema, record: result.record });
}

const crossErrors = validateCrossRecords(accepted);
const crossCaseFailures = [];
for (const test of manifest.crossCases ?? []) {
  let results = [];
  let rawRecords = [];
  if (test.file) {
    rawRecords = JSON.parse(await readFile(join(fixtureDir, test.file), "utf8")).records;
  } else {
    results = await Promise.all(test.records.map(loadAndValidateRecord));
  }
  const recordFailures = results.filter((result) => !result.valid);
  const records = test.file ? rawRecords : results.map(({ schemaName, record }) => ({ schemaName, record }));
  const errors = recordFailures.length ? [] : validateCrossRecords(records);
  const actualValid = recordFailures.length === 0 && errors.length === 0;
  const actualCodes = errors.map((error) => error.code);
  const missingExpectedCodes = (test.expectedErrorCodes ?? []).filter((code) => !actualCodes.includes(code));
  if (actualValid !== test.valid || missingExpectedCodes.length || recordFailures.length) {
    crossCaseFailures.push({ test, recordFailures, crossErrors: errors, missingExpectedCodes });
  }
}

if (failures.length || crossErrors.length || crossCaseFailures.length) {
  console.error(JSON.stringify({ failures, crossErrors, crossCaseFailures }, null, 2));
  process.exit(1);
}
console.log(`Validated ${schemas.length} schemas, ${manifest.cases.length} record fixtures, and ${(manifest.crossCases ?? []).length} cross-record suites.`);

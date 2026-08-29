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

for (const test of manifest.cases) {
  const schema = schemas.find((candidate) => candidate.$id.endsWith(`/${test.schema}`));
  if (!schema) throw new Error(`Unknown fixture schema: ${test.schema}`);
  const record = JSON.parse(await readFile(join(fixtureDir, test.file), "utf8"));
  const validator = ajv.getSchema(schema.$id);
  const structuralValid = validator(record);
  const invariantErrors = structuralValid ? validateInvariants(test.schema, record) : [];
  const actualValid = structuralValid && invariantErrors.length === 0;
  if (actualValid !== test.valid) {
    failures.push({ test, structuralErrors: validator.errors, invariantErrors });
  }
  if (actualValid) accepted.push({ schemaName: test.schema, record });
}

const crossErrors = validateCrossRecords(accepted);
if (failures.length || crossErrors.length) {
  console.error(JSON.stringify({ failures, crossErrors }, null, 2));
  process.exit(1);
}
console.log(`Validated ${schemas.length} schemas and ${manifest.cases.length} conformance fixtures.`);

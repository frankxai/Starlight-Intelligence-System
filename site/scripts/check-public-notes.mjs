import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const schema = JSON.parse(read("schemas/public-note-v1.schema.json"));
const note = JSON.parse(read("site/content/public-notes/intelligence-should-compound.json"));

function validate(value, rule, path = "note") {
  if ("const" in rule) assert.equal(value, rule.const, path);
  if (rule.enum) assert.ok(rule.enum.includes(value), `${path}: unexpected enum value`);
  if (rule.type === "object") {
    assert.ok(value && typeof value === "object" && !Array.isArray(value), `${path}: expected object`);
    for (const key of rule.required ?? []) assert.ok(Object.hasOwn(value, key), `${path}.${key}: missing`);
    if (rule.additionalProperties === false) {
      for (const key of Object.keys(value)) assert.ok(Object.hasOwn(rule.properties, key), `${path}.${key}: unexpected`);
    }
    for (const [key, item] of Object.entries(value)) validate(item, rule.properties[key], `${path}.${key}`);
  }
  if (rule.type === "array") {
    assert.ok(Array.isArray(value), `${path}: expected array`);
    assert.ok(value.length >= (rule.minItems ?? 0), `${path}: too few items`);
    value.forEach((item, index) => validate(item, rule.items, `${path}[${index}]`));
  }
  if (rule.type === "string") {
    assert.equal(typeof value, "string", `${path}: expected string`);
    assert.ok(value.length >= (rule.minLength ?? 0), `${path}: too short`);
    if (rule.pattern) assert.match(value, new RegExp(rule.pattern), path);
    if (rule.format === "uri") assert.ok(/^https:\/\/[^\s]+$/.test(value), `${path}: expected HTTPS URL`);
    if (rule.format === "date") assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), `${path}: expected ISO date`);
  }
}

function validateHistory(record) {
  assert.equal(record.revisions[0].date, record.created, "first revision must match creation date");
  assert.equal(record.revisions.at(-1).version, record.revision, "current revision must match history");
  for (let index = 1; index < record.revisions.length; index += 1) {
    const previous = record.revisions[index - 1];
    const current = record.revisions[index];
    assert.ok(current.date >= previous.date, "revision dates must be monotonic");
    const currentVersion = current.version.split(".").map(Number);
    const previousVersion = previous.version.split(".").map(Number);
    assert.ok(currentVersion.some((part, partIndex) => part > previousVersion[partIndex] && currentVersion.slice(0, partIndex).every((value, earlier) => value === previousVersion[earlier])), "revision versions must increase");
  }
}

validate(note, schema);
validateHistory(note);
assert.equal(note.slug, "intelligence-should-compound");
assert.equal(note.visibility, "public");
const revisedNote = structuredClone(note);
revisedNote.revision = "1.0.1";
revisedNote.revisions.push({ version: "1.0.1", date: "2026-09-24", summary: "Synthetic revision validation fixture." });
validate(revisedNote, schema);
validateHistory(revisedNote);
const backwardDate = structuredClone(revisedNote);
backwardDate.revisions[1].date = "2026-09-22";
assert.throws(() => validateHistory(backwardDate), /revision dates must be monotonic/);
const backwardVersion = structuredClone(revisedNote);
backwardVersion.revisions[1].version = "0.9.9";
backwardVersion.revision = "0.9.9";
assert.throws(() => validateHistory(backwardVersion), /revision versions must increase/);

// Publication is a static allowlist. Path traversal and private-vault discovery
// cannot reach content through this loader or its two GET routes.
const loader = read("site/src/lib/public-notes.ts");
assert.match(loader, /import compoundingNote from "\.\.\/\.\.\/content\/public-notes\/intelligence-should-compound\.json"/);
assert.match(loader, /Object\.hasOwn\(PUBLIC_NOTES, slug\)/);
assert.doesNotMatch(loader, /\b(?:readFile|readdir|fetch|process\.env|glob)\b/);
assert.doesNotMatch(loader, /from ["'][^"']*(?:vault|memory|notes\/active|notes\/archive)/i);
assert.doesNotMatch(JSON.stringify(note), /(?:[A-Z]:\\|~\/|\.\.\/|private\/|memory\/vaults\/)/i);
assert.match(read("site/src/app/api/notes/[slug]/route.ts"), /getPublicNote\(slug\)/);

console.log("Public Notes: schema, curated record, export boundary, and path privacy checks passed.");

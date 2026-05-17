import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");

const REQUIRED_FILES = [
  "commands/sis-forge.md",
  "agents/sis-extractor-transcripts.md",
  "agents/sis-extractor-vault.md",
  "agents/sis-extractor-prompts.md",
  "agents/sis-extractor-repos.md",
  "agents/sis-extractor-external.md",
  "tools/sis-forge/atom-schema.ts",
  "tools/sis-forge/clusterer.ts",
  "tools/sis-forge/density-classifier.ts",
  "tools/sis-forge/cli.ts",
];

test("v86: every /sis-forge pre-alpha file exists", () => {
  for (const rel of REQUIRED_FILES) {
    const abs = resolve(REPO_ROOT, rel);
    assert.ok(existsSync(abs), `missing required pre-alpha file: ${rel}`);
  }
});

test("v86: command spec references existing extractor agents", () => {
  const spec = readFileSync(resolve(REPO_ROOT, "commands/sis-forge.md"), "utf8");
  const referenced = [
    "agents/sis-extractor-transcripts.md",
    "agents/sis-extractor-vault.md",
    "agents/sis-extractor-prompts.md",
    "agents/sis-extractor-repos.md",
    "agents/sis-extractor-external.md",
  ];
  for (const ref of referenced) {
    assert.ok(spec.includes(ref), `command spec missing reference: ${ref}`);
    assert.ok(existsSync(resolve(REPO_ROOT, ref)), `referenced agent file does not exist: ${ref}`);
  }
});

test("v86: every extractor agent carries SIP attestation footer", () => {
  const agents = [
    "agents/sis-extractor-transcripts.md",
    "agents/sis-extractor-vault.md",
    "agents/sis-extractor-prompts.md",
    "agents/sis-extractor-repos.md",
    "agents/sis-extractor-external.md",
  ];
  for (const rel of agents) {
    const content = readFileSync(resolve(REPO_ROOT, rel), "utf8");
    assert.ok(
      content.includes("Built on SIP"),
      `${rel} missing 'Built on SIP' attestation`,
    );
  }
});

test("v86: TypeScript core modules type-check via direct import", async () => {
  const atomSchema = await import("../tools/sis-forge/atom-schema.ts");
  const clusterer = await import("../tools/sis-forge/clusterer.ts");
  const classifier = await import("../tools/sis-forge/density-classifier.ts");

  assert.equal(typeof atomSchema.atomToJsonl, "function");
  assert.equal(typeof atomSchema.jsonlToAtom, "function");
  assert.equal(typeof clusterer.clusterAtoms, "function");
  assert.equal(typeof clusterer.applyAtomBudget, "function");
  assert.equal(typeof classifier.classifyDensity, "function");
});

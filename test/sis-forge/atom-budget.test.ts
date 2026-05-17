import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAtomBudget } from "../../tools/sis-forge/clusterer.ts";
import type { Atom } from "../../tools/sis-forge/atom-schema.ts";

const MAX_ATOMS = 1000;
const PER_SOURCE_CAP = 200;

const makeAtom = (id: string, source: Atom["source"], weight = 1): Atom => ({
  id,
  source,
  topic: `topic-${id}`,
  summary: `summary for atom ${id}`,
  weight,
  ts: "2026-05-17T00:00:00Z",
});

test("applyAtomBudget passes through when under cap", () => {
  const atoms = Array.from({ length: 50 }, (_, i) => makeAtom(`a${i}`, "vault"));
  const result = applyAtomBudget(atoms);
  assert.equal(result.length, 50);
});

test("applyAtomBudget truncates per-source at 200 atoms", () => {
  const atoms = Array.from({ length: 300 }, (_, i) => makeAtom(`a${i}`, "vault", 300 - i));
  const result = applyAtomBudget(atoms);
  assert.equal(result.length, PER_SOURCE_CAP);
  assert.ok(
    result.every((a) => a.weight !== undefined && a.weight >= 100),
    "truncation kept top-weighted atoms",
  );
});

test("applyAtomBudget caps total at 1000 atoms even across 5 sources", () => {
  const sources: Atom["source"][] = ["transcripts", "vault", "prompts", "repos", "external"];
  const atoms: Atom[] = [];
  for (const src of sources) {
    for (let i = 0; i < 250; i++) atoms.push(makeAtom(`${src}-${i}`, src, 250 - i));
  }
  assert.equal(atoms.length, 1250);
  const result = applyAtomBudget(atoms);
  assert.equal(result.length, MAX_ATOMS);
});

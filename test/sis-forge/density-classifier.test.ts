import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyDensity } from "../../tools/sis-forge/density-classifier.ts";
import type { Cluster } from "../../tools/sis-forge/atom-schema.ts";

const makeCluster = (
  id: string,
  bucket: Cluster["bucket"],
  atomCount: number,
  sourceCount: number,
): Cluster => ({
  id,
  label: `cluster-${id}`,
  atoms: Array.from({ length: atomCount }, (_, i) => ({
    id: `${id}-a${i}`,
    source: "vault",
    topic: id,
    summary: `atom ${i}`,
    ts: "2026-05-17T00:00:00Z",
  })),
  sources: Array.from({ length: sourceCount }, (_, i) => (["vault", "transcripts", "prompts", "repos", "external"] as const)[i]),
  bucket,
});

test("classifyDensity returns auto-build when ≥1 signature cluster present", () => {
  const result = classifyDensity([
    makeCluster("c1", "signature", 7, 2),
    makeCluster("c2", "framework", 4, 2),
  ]);
  assert.equal(result.mode, "auto-build");
});

test("classifyDensity returns propose-menu with 2-3 framework clusters and no signature", () => {
  const result = classifyDensity([
    makeCluster("c1", "framework", 4, 2),
    makeCluster("c2", "framework", 5, 3),
    makeCluster("c3", "anecdote", 1, 1),
  ]);
  assert.equal(result.mode, "propose-menu");
});

test("classifyDensity returns empower when zero framework clusters", () => {
  const result = classifyDensity([
    makeCluster("c1", "anecdote", 2, 1),
    makeCluster("c2", "anecdote", 1, 1),
  ]);
  assert.equal(result.mode, "empower");
});

test("classifyDensity returns empower when no clusters at all", () => {
  const result = classifyDensity([]);
  assert.equal(result.mode, "empower");
});

test("classifyDensity counts buckets in byBucket", () => {
  const result = classifyDensity([
    makeCluster("c1", "signature", 7, 2),
    makeCluster("c2", "framework", 3, 2),
    makeCluster("c3", "framework", 4, 2),
    makeCluster("c4", "anecdote", 1, 1),
  ]);
  assert.deepEqual(result.byBucket, { signature: 1, framework: 2, anecdote: 1 });
});

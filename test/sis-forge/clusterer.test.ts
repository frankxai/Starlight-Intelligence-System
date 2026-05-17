import { test } from "node:test";
import assert from "node:assert/strict";
import { clusterAtoms } from "../../tools/sis-forge/clusterer.ts";
import type { Atom } from "../../tools/sis-forge/atom-schema.ts";

const atom = (id: string, source: Atom["source"], topic: string, summary: string): Atom => ({
  id,
  source,
  topic,
  summary,
  ts: "2026-05-17T00:00:00Z",
});

test("clusterAtoms returns empty when given no atoms", () => {
  const result = clusterAtoms([]);
  assert.equal(result.length, 0);
});

test("clusterAtoms groups semantically similar atoms by cosine ≥ 0.75", () => {
  const atoms: Atom[] = [
    atom("a1", "vault", "verticals", "build a domain sub-stack for sound intelligence"),
    atom("a2", "vault", "verticals", "build a domain sub-stack for music intelligence"),
    atom("a3", "vault", "verticals", "build a domain sub-stack for people intelligence"),
    atom("a4", "transcripts", "cooking", "recipe for sourdough bread proofing"),
  ];
  const clusters = clusterAtoms(atoms);

  const verticalsCluster = clusters.find((c) => c.atoms.length >= 3);
  assert.ok(verticalsCluster, "expected one cluster with ≥3 verticals atoms");
  assert.equal(verticalsCluster.atoms.length, 3);

  const standalone = clusters.find((c) => c.atoms.some((a) => a.id === "a4"));
  assert.ok(standalone, "expected the cooking atom to land in its own cluster");
  assert.equal(standalone.atoms.length, 1);
});

test("clusterAtoms is deterministic — same input → same cluster IDs and contents", () => {
  const atoms: Atom[] = [
    atom("a1", "vault", "verticals", "build a domain sub-stack"),
    atom("a2", "vault", "verticals", "build another domain sub-stack"),
    atom("a3", "transcripts", "verticals", "domain sub-stack pattern again"),
  ];
  const run1 = clusterAtoms(atoms);
  const run2 = clusterAtoms(atoms);
  assert.equal(run1.length, run2.length);
  for (let i = 0; i < run1.length; i++) {
    assert.equal(run1[i].id, run2[i].id);
    assert.deepEqual(
      run1[i].atoms.map((a) => a.id).sort(),
      run2[i].atoms.map((a) => a.id).sort(),
    );
  }
});

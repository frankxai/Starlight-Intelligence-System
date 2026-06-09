import { test } from "node:test";
import assert from "node:assert/strict";
import { clusterAtoms } from "../../tools/sis-forge/clusterer.ts";
import type { Atom } from "../../tools/sis-forge/atom-schema.ts";

const fixtureAtoms: Atom[] = [
  { id: "v1", source: "vault", topic: "verticals", summary: "build a domain sub-stack for sound intelligence", ts: "2026-05-17T00:00:00Z" },
  { id: "v2", source: "vault", topic: "verticals", summary: "build a domain sub-stack for music intelligence", ts: "2026-05-17T00:00:00Z" },
  { id: "v3", source: "vault", topic: "verticals", summary: "build a domain sub-stack for people intelligence", ts: "2026-05-17T00:00:00Z" },
  { id: "t1", source: "transcripts", topic: "verticals", summary: "domain sub-stack pattern across multiple verticals", ts: "2026-05-17T00:00:00Z" },
  { id: "g1", source: "vault", topic: "governance", summary: "starlight board verdict pressure-test before commit", ts: "2026-05-17T00:00:00Z" },
  { id: "g2", source: "prompts", topic: "governance", summary: "board-before-tag rule applied to substrate changes", ts: "2026-05-17T00:00:00Z" },
  { id: "c1", source: "transcripts", topic: "cookbook", summary: "sourdough starter feeding ratio twelve hours", ts: "2026-05-17T00:00:00Z" },
];

test("clusterer is deterministic — identical clusters across two runs on same corpus", () => {
  const r1 = clusterAtoms(fixtureAtoms);
  const r2 = clusterAtoms(fixtureAtoms);

  assert.equal(r1.length, r2.length, "cluster count differs across runs");
  for (let i = 0; i < r1.length; i++) {
    assert.equal(r1[i].id, r2[i].id, `cluster ${i} id differs`);
    assert.equal(r1[i].bucket, r2[i].bucket, `cluster ${i} bucket differs`);
    assert.deepEqual(
      r1[i].atoms.map((a) => a.id).sort(),
      r2[i].atoms.map((a) => a.id).sort(),
      `cluster ${i} atom membership differs`,
    );
  }
});

test("clusterer is order-invariant — shuffling input atoms produces same clusters", () => {
  const shuffled = [...fixtureAtoms].reverse();
  const r1 = clusterAtoms(fixtureAtoms);
  const r2 = clusterAtoms(shuffled);

  const membership = (clusters: ReturnType<typeof clusterAtoms>) =>
    clusters
      .map((c) => c.atoms.map((a) => a.id).sort().join(","))
      .sort();

  assert.deepEqual(
    membership(r1),
    membership(r2),
    "cluster membership changed when input order changed — clusterer is order-dependent",
  );
});

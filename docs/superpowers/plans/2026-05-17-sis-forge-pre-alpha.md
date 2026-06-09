# /sis-forge v8.x-pre-alpha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 (5 extractor sub-agents) + Phase 2 (TF-IDF clusterer + density classifier) of `/sis-forge`, emitting raw `{bucket, atoms[], cluster_summary}` JSON to `.sis-forge/buckets-<ts>.json` and stdout. No proposal doc, no Board gate, no spawn — those land in alpha/beta plans.

**Architecture:** `/sis-forge` is a substrate command (markdown spec). Phase 1 dispatches 5 sub-agents in parallel via Agent tool — each sub-agent is a markdown prompt spec at `agents/sis-extractor-*.md` that walks one corpus source and returns ≤200 atoms. Phase 2 is pure TypeScript at `tools/sis-forge/*.ts` that clusters atoms via TF-IDF + cosine ≥0.75 and buckets them by occurrence count. Output is a JSON file; nothing irreversible happens.

**Tech Stack:** TypeScript (ES modules), `node --import tsx --test` for tests, no transformer embeddings (TF-IDF MVP per spec §11). Reuses Memory Bus + Cross-Repo Indexer at runtime via existing MCPs.

**Spec reference:** `docs/superpowers/specs/2026-05-17-sis-forge-design.md`

---

## File structure (pre-alpha scope)

```
Starlight-Intelligence-System/
├── commands/
│   └── sis-forge.md                              # NEW — substrate command spec
├── agents/
│   ├── sis-extractor-transcripts.md              # NEW — sub-agent spec
│   ├── sis-extractor-vault.md                    # NEW
│   ├── sis-extractor-prompts.md                  # NEW
│   ├── sis-extractor-repos.md                    # NEW
│   └── sis-extractor-external.md                 # NEW
├── tools/sis-forge/
│   ├── atom-schema.ts                            # NEW — types + JSONL serialize
│   ├── clusterer.ts                              # NEW — TF-IDF + cosine
│   ├── density-classifier.ts                    # NEW — pure bucket fn
│   └── cli.ts                                    # NEW — Phase 2 entry point
├── test/sis-forge/
│   ├── clusterer.test.ts                         # NEW
│   ├── density-classifier.test.ts                # NEW
│   ├── cluster-stability.test.ts                 # NEW — determinism falsifier
│   └── atom-budget.test.ts                       # NEW
├── test/
│   └── v86-sis-forge-coverage.test.ts            # NEW — symmetry harness
├── package.json                                  # MODIFY — append to test:substrate
└── CLAUDE.md                                     # MODIFY — pre-alpha preview note
```

**Total pre-alpha:** 4 TS files, 1 entry CLI, 4 unit tests, 1 symmetry test, 5 sub-agent specs, 1 command spec, 2 modifications.

---

## Task 1: Scaffold directories + atom schema

**Files:**
- Create: `tools/sis-forge/atom-schema.ts`
- Create directory: `test/sis-forge/`

- [ ] **Step 1: Create directories**

Run: `mkdir tools/sis-forge ; mkdir test/sis-forge`

Expected: both directories exist; no errors.

- [ ] **Step 2: Write atom-schema.ts**

Create `tools/sis-forge/atom-schema.ts`:

```typescript
export type AtomSource =
  | "transcripts"
  | "vault"
  | "prompts"
  | "repos"
  | "external";

export interface Atom {
  id: string;
  source: AtomSource;
  file?: string;
  line?: number;
  topic: string;
  summary: string;
  weight?: number;
  ts: string;
}

export interface Cluster {
  id: string;
  label: string;
  atoms: Atom[];
  sources: AtomSource[];
  bucket: "signature" | "framework" | "anecdote";
}

export interface BucketReport {
  mode: "auto-build" | "propose-menu" | "empower";
  clusters: Cluster[];
  totalAtoms: number;
  byBucket: { signature: number; framework: number; anecdote: number };
  snapshotPath: string;
  generatedAt: string;
}

export function atomToJsonl(atom: Atom): string {
  return JSON.stringify(atom);
}

export function jsonlToAtom(line: string): Atom {
  const parsed = JSON.parse(line);
  if (
    typeof parsed.id !== "string" ||
    typeof parsed.source !== "string" ||
    typeof parsed.topic !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.ts !== "string"
  ) {
    throw new Error(`Invalid atom JSONL: ${line.slice(0, 80)}`);
  }
  return parsed as Atom;
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit tools/sis-forge/atom-schema.ts`

Expected: no errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add tools/sis-forge/atom-schema.ts
git commit -m "feat(sis-forge): atom schema + JSONL serialization (pre-alpha)"
```

Expected: commit lands on main.

---

## Task 2: Clusterer — TF-IDF + cosine similarity

**Files:**
- Create: `tools/sis-forge/clusterer.ts`
- Test: `test/sis-forge/clusterer.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/clusterer.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test test/sis-forge/clusterer.test.ts`

Expected: FAIL with "Cannot find module '../../tools/sis-forge/clusterer.ts'" or similar.

- [ ] **Step 3: Write minimal clusterer.ts**

Create `tools/sis-forge/clusterer.ts`:

```typescript
import type { Atom, Cluster } from "./atom-schema.ts";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "and", "or", "but", "if", "then", "to", "of", "in", "on", "at", "for",
  "with", "from", "by", "as", "this", "that", "these", "those", "it",
  "its", "we", "you", "i", "me", "my", "our", "ours", "they", "them",
  "their", "theirs", "do", "does", "did", "will", "would", "could",
  "should", "have", "has", "had", "not", "no", "yes", "so", "up", "down",
  "out", "off", "over", "under", "again", "more", "most", "some", "any",
  "all", "each", "every", "very", "just", "also", "than", "too", "now",
  "built", "sip", "frankx", "frank", "claude",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function tfVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function tfidfWeight(tf: Map<string, number>, df: Map<string, number>, N: number): Map<string, number> {
  const w = new Map<string, number>();
  for (const [term, freq] of tf) {
    const idf = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
    w.set(term, freq * idf);
  }
  return w;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [t, va] of a) {
    normA += va * va;
    const vb = b.get(t);
    if (vb !== undefined) dot += va * vb;
  }
  for (const vb of b.values()) normB += vb * vb;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const SIM_THRESHOLD = 0.75;

export function clusterAtoms(atoms: Atom[]): Cluster[] {
  if (atoms.length === 0) return [];

  const sorted = [...atoms].sort((x, y) => x.id.localeCompare(y.id));

  const docs = sorted.map((a) => tokenize(`${a.topic} ${a.summary}`));
  const df = new Map<string, number>();
  for (const doc of docs) {
    const seen = new Set(doc);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const vectors = docs.map((d) => tfidfWeight(tfVector(d), df, sorted.length));

  const assigned = new Array(sorted.length).fill(-1);
  const clusters: Cluster[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (assigned[i] !== -1) continue;
    const clusterId = `c${clusters.length + 1}`;
    const clusterAtoms = [sorted[i]];
    assigned[i] = clusters.length;
    for (let j = i + 1; j < sorted.length; j++) {
      if (assigned[j] !== -1) continue;
      const sim = cosine(vectors[i], vectors[j]);
      if (sim >= SIM_THRESHOLD) {
        clusterAtoms.push(sorted[j]);
        assigned[j] = clusters.length;
      }
    }
    const sources = Array.from(new Set(clusterAtoms.map((a) => a.source))).sort();
    const label = topTerms(vectors[i], 3);
    const distinctSourceCount = sources.length;
    const bucket: Cluster["bucket"] =
      clusterAtoms.length >= 7 && distinctSourceCount >= 2 ? "signature" :
      clusterAtoms.length >= 3 && distinctSourceCount >= 2 ? "framework" :
      "anecdote";
    clusters.push({
      id: clusterId,
      label,
      atoms: clusterAtoms,
      sources: sources as Cluster["sources"],
      bucket,
    });
  }

  return clusters;
}

function topTerms(vec: Map<string, number>, n: number): string {
  return Array.from(vec.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t)
    .join(" ");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test test/sis-forge/clusterer.test.ts`

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add tools/sis-forge/clusterer.ts test/sis-forge/clusterer.test.ts
git commit -m "feat(sis-forge): TF-IDF + cosine clusterer (pre-alpha)"
```

---

## Task 3: Density classifier — pure bucket-to-mode function

**Files:**
- Create: `tools/sis-forge/density-classifier.ts`
- Test: `test/sis-forge/density-classifier.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/density-classifier.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test test/sis-forge/density-classifier.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal density-classifier.ts**

Create `tools/sis-forge/density-classifier.ts`:

```typescript
import type { Cluster, BucketReport } from "./atom-schema.ts";

export interface ClassificationResult {
  mode: BucketReport["mode"];
  byBucket: BucketReport["byBucket"];
}

export function classifyDensity(clusters: Cluster[]): ClassificationResult {
  const byBucket = {
    signature: clusters.filter((c) => c.bucket === "signature").length,
    framework: clusters.filter((c) => c.bucket === "framework").length,
    anecdote: clusters.filter((c) => c.bucket === "anecdote").length,
  };

  let mode: BucketReport["mode"];
  if (byBucket.signature >= 1) {
    mode = "auto-build";
  } else if (byBucket.framework >= 2) {
    mode = "propose-menu";
  } else {
    mode = "empower";
  }

  return { mode, byBucket };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test test/sis-forge/density-classifier.test.ts`

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add tools/sis-forge/density-classifier.ts test/sis-forge/density-classifier.test.ts
git commit -m "feat(sis-forge): density classifier — pure bucket→mode function (pre-alpha)"
```

---

## Task 4: Cluster-stability test — determinism falsifier (REVISE-2 mandate)

**Files:**
- Test: `test/sis-forge/cluster-stability.test.ts`

- [ ] **Step 1: Write the falsifier test**

Create `test/sis-forge/cluster-stability.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test**

Run: `node --import tsx --test test/sis-forge/cluster-stability.test.ts`

Expected: both tests PASS. If either fails, the clusterer is non-deterministic and Task 2 needs a fix before continuing — per spec §11 falsifier, sustained instability triggers embeddings deferral cancellation.

- [ ] **Step 3: Commit**

Run:
```bash
git add test/sis-forge/cluster-stability.test.ts
git commit -m "test(sis-forge): cluster-stability falsifier — determinism + order-invariance"
```

---

## Task 5: Atom budget test — >20k truncation

**Files:**
- Modify: `tools/sis-forge/clusterer.ts` (add cap)
- Test: `test/sis-forge/atom-budget.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/atom-budget.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test test/sis-forge/atom-budget.test.ts`

Expected: FAIL — `applyAtomBudget` is not exported from `clusterer.ts`.

- [ ] **Step 3: Add applyAtomBudget to clusterer.ts**

Append to `tools/sis-forge/clusterer.ts` (before the existing `export function clusterAtoms`):

```typescript
const MAX_ATOMS_TOTAL = 1000;
const MAX_ATOMS_PER_SOURCE = 200;

export function applyAtomBudget(atoms: Atom[]): Atom[] {
  const bySource = new Map<Atom["source"], Atom[]>();
  for (const a of atoms) {
    if (!bySource.has(a.source)) bySource.set(a.source, []);
    bySource.get(a.source)!.push(a);
  }

  const truncatedPerSource: Atom[] = [];
  for (const list of bySource.values()) {
    const sorted = [...list].sort((x, y) => (y.weight ?? 1) - (x.weight ?? 1));
    truncatedPerSource.push(...sorted.slice(0, MAX_ATOMS_PER_SOURCE));
  }

  if (truncatedPerSource.length <= MAX_ATOMS_TOTAL) return truncatedPerSource;

  const globalSorted = [...truncatedPerSource].sort((x, y) => (y.weight ?? 1) - (x.weight ?? 1));
  return globalSorted.slice(0, MAX_ATOMS_TOTAL);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test test/sis-forge/atom-budget.test.ts`

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add tools/sis-forge/clusterer.ts test/sis-forge/atom-budget.test.ts
git commit -m "feat(sis-forge): atom budget — 200/source, 1000 total (pre-alpha)"
```

---

## Task 6: Phase 2 CLI entry point

**Files:**
- Create: `tools/sis-forge/cli.ts`

This is the entry script invoked by `commands/sis-forge.md` after Phase 1 returns. It reads JSONL atom files written by sub-agents, runs `applyAtomBudget` → `clusterAtoms` → `classifyDensity`, and writes a `BucketReport` JSON.

- [ ] **Step 1: Write cli.ts**

Create `tools/sis-forge/cli.ts`:

```typescript
#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { jsonlToAtom } from "./atom-schema.ts";
import type { Atom, BucketReport } from "./atom-schema.ts";
import { applyAtomBudget, clusterAtoms } from "./clusterer.ts";
import { classifyDensity } from "./density-classifier.ts";

function usage(): never {
  console.error("Usage: tsx tools/sis-forge/cli.ts <input-jsonl> [--out <path>]");
  process.exit(64);
}

function parseArgs(argv: string[]): { input: string; out?: string } {
  const args = argv.slice(2);
  if (args.length === 0) usage();
  const input = args[0];
  let out: string | undefined;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--out" && args[i + 1]) {
      out = args[i + 1];
      i++;
    }
  }
  return { input, out };
}

function main(): void {
  const { input, out } = parseArgs(process.argv);

  if (!existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(66);
  }

  const lines = readFileSync(input, "utf8").split(/\r?\n/).filter((l) => l.trim().length > 0);
  const atoms: Atom[] = lines.map(jsonlToAtom);

  const budgeted = applyAtomBudget(atoms);
  const clusters = clusterAtoms(budgeted);
  const classification = classifyDensity(clusters);

  const ts = new Date().toISOString();
  const snapshotPath = resolve(input);

  const report: BucketReport = {
    mode: classification.mode,
    clusters,
    totalAtoms: budgeted.length,
    byBucket: classification.byBucket,
    snapshotPath,
    generatedAt: ts,
  };

  const outPath = out ?? `.sis-forge/buckets-${ts.replace(/[:.]/g, "-")}.json`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify({
    mode: report.mode,
    totalAtoms: report.totalAtoms,
    byBucket: report.byBucket,
    clusterCount: report.clusters.length,
    outPath,
  }, null, 2));
}

main();
```

- [ ] **Step 2: Smoke-test the CLI**

Run:
```bash
mkdir -p .sis-forge
cat > .sis-forge/smoke-input.jsonl <<'EOF'
{"id":"a1","source":"vault","topic":"verticals","summary":"build domain sub-stack sound","ts":"2026-05-17T00:00:00Z"}
{"id":"a2","source":"vault","topic":"verticals","summary":"build domain sub-stack music","ts":"2026-05-17T00:00:00Z"}
{"id":"a3","source":"transcripts","topic":"verticals","summary":"build domain sub-stack people","ts":"2026-05-17T00:00:00Z"}
{"id":"a4","source":"prompts","topic":"verticals","summary":"build domain sub-stack pattern","ts":"2026-05-17T00:00:00Z"}
EOF
npx tsx tools/sis-forge/cli.ts .sis-forge/smoke-input.jsonl
```

Expected: stdout shows JSON with `mode`, `totalAtoms: 4`, `byBucket`, `clusterCount`, `outPath`. A `.sis-forge/buckets-*.json` file exists.

- [ ] **Step 3: Clean up smoke files**

Run: `rm .sis-forge/smoke-input.jsonl .sis-forge/buckets-*.json`

- [ ] **Step 4: Commit**

Run:
```bash
git add tools/sis-forge/cli.ts
git commit -m "feat(sis-forge): Phase 2 CLI entry point — JSONL → bucket report (pre-alpha)"
```

---

## Task 7: Extractor sub-agent specs (5 files)

**Files:**
- Create: `agents/sis-extractor-transcripts.md`
- Create: `agents/sis-extractor-vault.md`
- Create: `agents/sis-extractor-prompts.md`
- Create: `agents/sis-extractor-repos.md`
- Create: `agents/sis-extractor-external.md`

Each agent is a prompt spec invoked via the Agent tool in Phase 1. They emit atoms to a JSONL file that the CLI from Task 6 then consumes. Each follows the same skeleton — only the corpus walk strategy differs.

- [ ] **Step 1: Write sis-extractor-transcripts.md**

Create `agents/sis-extractor-transcripts.md`:

```markdown
# SIS Extractor — Transcripts

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks `~/.claude/projects/*` via the Cross-Repo Indexer and returns ≤200 atoms summarizing recurring patterns in session transcripts.

**Tier:** Phase 1 extractor (peer with vault / prompts / repos / external)
**Dispatched via:** Agent tool with subagent_type=general-purpose (no dedicated subagent_type; the .md provides the instructions)
**Output contract:** JSONL atoms appended to `<atom-output-path>` (provided by caller)

## Atom schema (see `tools/sis-forge/atom-schema.ts`)

```typescript
interface Atom {
  id: string;          // unique within this extractor — prefix with "t-"
  source: "transcripts";
  file?: string;       // ~/.claude/projects/<project>/<file>
  topic: string;       // 1-3 word label
  summary: string;     // ≤ 200 chars, what this atom captures
  weight?: number;     // 0.0-1.0 — extractor's confidence this is signal not noise
  ts: string;          // ISO date of the underlying transcript
}
```

## Reasoning protocol

1. **INDEX** — Use the Cross-Repo Indexer to enumerate session transcript files under `~/.claude/projects/*`. Do not load each in full; use the indexer's `summary` field per chunk.
2. **TOPIC EXTRACT** — Group chunks by topic via keyword density. Each topic becomes one candidate atom.
3. **FILTER** — Drop chunks that are pure tooling noise (file paths, error tracebacks without context, command logs).
4. **WEIGHT** — Confidence scoring:
   - 1.0 — explicit user statement of intent / framework / decision
   - 0.7 — repeated topic across ≥3 sessions
   - 0.4 — single mention with low-context signal
5. **CAP** — Return ≤ 200 atoms total. If more candidates exist, return top-200 by weight.
6. **APPEND** — Write atoms to `<atom-output-path>` as JSONL (one atom per line, no trailing newline).

## Failure modes

- Cross-Repo Indexer not initialized → halt, surface `cross-repo-indexer-uninitialized` error
- Permissions denied on `~/.claude/projects/` → halt, surface `permission-denied` error
- Timeout > 120s → return whatever atoms produced so far, mark output `degraded:true` in a sidecar JSON

## Genius protocol contract

This extractor pulls from a known, enumerable source (`~/.claude/projects/*`). Per `commands/sis-forge.md` §"Genius protocol contract", this constitutes corpus delivery — not corpus-guessing — under `/discover-genius` reasoning protocol step 1.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
```

- [ ] **Step 2: Write sis-extractor-vault.md**

Create `agents/sis-extractor-vault.md`:

```markdown
# SIS Extractor — Vault

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks `memory/` Obsidian vault (markdown files + KG nodes) and returns ≤200 atoms summarizing recurring patterns in the user's curated second brain.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema (see `tools/sis-forge/atom-schema.ts`)

```typescript
interface Atom {
  id: string;          // prefix with "v-"
  source: "vault";
  file?: string;       // memory/path/to/note.md
  topic: string;
  summary: string;
  weight?: number;
  ts: string;          // ISO date — file mtime
}
```

## Reasoning protocol

1. **WALK** — Glob `memory/**/*.md` (skip `memory/_archive/`, `memory/.obsidian/`). Read each file's frontmatter + first 500 chars.
2. **TOPIC EXTRACT** — Use frontmatter `tags`, `topic`, `domain` fields first. Fall back to file-name + first-heading parsing.
3. **GROUP** — Files with overlapping tags / topics form a candidate cluster; one atom per cluster.
4. **WEIGHT** — Confidence:
   - 1.0 — explicit framework / methodology note with ≥3 cross-references
   - 0.7 — recurring topic across ≥3 files
   - 0.4 — single note without backlinks
5. **CAP** — ≤ 200 atoms, top-weighted.
6. **APPEND** — JSONL to `<atom-output-path>`.

## Failure modes

- `memory/` does not exist → halt, surface `vault-missing` error
- Glob returns 0 markdown files → return empty JSONL (silent extractor — not an error)
- Timeout > 120s → return partial, mark `degraded:true`

## Genius protocol contract

`memory/` is the user's curated vault — explicit corpus delivery by virtue of being maintained. Not guessing.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
```

- [ ] **Step 3: Write sis-extractor-prompts.md**

Create `agents/sis-extractor-prompts.md`:

```markdown
# SIS Extractor — Prompts

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks `skills/`, `agents/`, `commands/` and returns ≤200 atoms summarizing patterns in the user's existing prompt library.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema

```typescript
interface Atom {
  id: string;          // prefix with "p-"
  source: "prompts";
  file?: string;       // skills/x.md | agents/y.md | commands/z.md
  topic: string;       // skill/agent/command name
  summary: string;     // from frontmatter description or first paragraph
  weight?: number;
  ts: string;          // file mtime
}
```

## Reasoning protocol

1. **ENUMERATE** — Read frontmatter from every `.md` under `skills/**`, `agents/**`, `commands/**`.
2. **EXTRACT** — One atom per file. Topic = `name` field; summary = `description` field (≤200 chars).
3. **WEIGHT** — Confidence:
   - 1.0 — referenced by ≥3 other files
   - 0.7 — referenced by 1-2 other files
   - 0.4 — standalone, no inbound references
4. **CAP** — ≤ 200 atoms. If more, prioritize files modified within last 90 days.
5. **APPEND** — JSONL.

## Failure modes

- Missing frontmatter → skip file, log to sidecar
- Malformed YAML → skip file, log to sidecar
- Timeout > 120s → return partial, mark `degraded:true`

## Genius protocol contract

`skills/`, `agents/`, `commands/` are user-authored prompt artifacts — explicit corpus.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
```

- [ ] **Step 4: Write sis-extractor-repos.md**

Create `agents/sis-extractor-repos.md`:

```markdown
# SIS Extractor — Repos

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks the user's repo portfolio via `tools/audit-repo-portfolio.ps1` output and returns ≤200 atoms summarizing what the user has actually shipped.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema

```typescript
interface Atom {
  id: string;          // prefix with "r-"
  source: "repos";
  file?: string;       // repo path
  topic: string;       // repo name or domain tag
  summary: string;     // README first paragraph or package.json description
  weight?: number;
  ts: string;          // last commit ISO date
}
```

## Reasoning protocol

1. **LOAD PORTFOLIO** — Read latest `docs/ops/REPO-PORTFOLIO-AUDIT-*.md`. If none exists, halt with `portfolio-audit-required`.
2. **FILTER** — Skip repos marked stale (>180 days since last commit) unless they have ≥50 stars or are explicitly pinned.
3. **EXTRACT** — One atom per active repo. Summary from README first paragraph or `package.json` description.
4. **WEIGHT** — Confidence:
   - 1.0 — repo modified within 30 days AND has CI green
   - 0.7 — repo modified within 90 days
   - 0.4 — older but flagged "core" in portfolio audit
5. **FILTER SUB-1KB STUBS** — Per `feedback_filter_sub_kb_files_at_scan_boundaries`, drop WSL-path stub files (<1KB) before extraction.
6. **CAP** — ≤ 200 atoms.
7. **APPEND** — JSONL.

## Failure modes

- No portfolio audit found → halt with `portfolio-audit-required`
- Audit > 7 days old → warn (sidecar JSON), proceed
- Timeout > 120s → return partial, mark `degraded:true`

## Genius protocol contract

Repo portfolio = user's shipped work. Explicit corpus.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
```

- [ ] **Step 5: Write sis-extractor-external.md**

Create `agents/sis-extractor-external.md`:

```markdown
# SIS Extractor — External (Adaptive)

> Sub-agent dispatched by `/sis-forge` Phase 1. Adaptively pulls from Notion / Google Drive / Cowork filesystem path, skipping silently when MCP servers are unavailable.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema

```typescript
interface Atom {
  id: string;          // prefix with "e-"
  source: "external";
  file?: string;       // notion://page-id | gdrive://file-id | cowork://path
  topic: string;
  summary: string;
  weight?: number;
  ts: string;
}
```

## Adaptive availability check

Before extraction, detect which sources are reachable:

1. **Notion** — Probe `mcp__claude_ai_Notion__notion-search` with query "test"; if ≤2s response → available
2. **Google Drive** — Probe `mcp__claude_ai_Google_Drive__list_recent_files` limit=1; if ≤2s response → available
3. **Cowork** — Check if `$env:COWORK_PATH` (or default `~/Cowork`) exists as a directory → available

Skip silently any source that fails probe. If ALL three fail, return empty JSONL (silent extractor, not error).

## Reasoning protocol

1. **PROBE** — Run availability checks above. Record which sources are live.
2. **PULL** — For each live source:
   - Notion: search top 50 pages by `last-edited` desc; extract title + first 200 chars
   - Drive: list 50 most recent docs; extract title + description
   - Cowork: glob `*.md` files in `$COWORK_PATH`; extract frontmatter or first paragraph
3. **DEDUPE** — Same topic across sources → highest-weight atom wins
4. **WEIGHT** — Confidence:
   - 1.0 — edited within 14 days
   - 0.7 — edited within 90 days
   - 0.4 — older
5. **CAP** — ≤ 200 atoms total across all live sources.
6. **APPEND** — JSONL.

## Failure modes

- All 3 sources unreachable → return empty JSONL, sidecar `{"external": "all-mcps-unavailable"}` (not an error)
- Single MCP times out mid-extraction → skip that source, mark sidecar `degraded:[source]`
- Timeout > 120s → return partial

## Genius protocol contract

External corpus = explicitly-configured sources the user has linked (Notion/Drive/Cowork). Frank's `/sis-forge` invocation is consent.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
```

- [ ] **Step 6: Commit all 5 extractor specs**

Run:
```bash
git add agents/sis-extractor-transcripts.md agents/sis-extractor-vault.md agents/sis-extractor-prompts.md agents/sis-extractor-repos.md agents/sis-extractor-external.md
git commit -m "feat(sis-forge): 5 extractor sub-agent specs — phase 1 (pre-alpha)"
```

---

## Task 8: Pre-alpha command spec — commands/sis-forge.md

**Files:**
- Create: `commands/sis-forge.md`

This is the substrate command spec. Pre-alpha invokes Phase 1 (parallel sub-agents) → Phase 2 (CLI from Task 6) → prints bucket report. No proposal doc, no Board, no spawn.

- [ ] **Step 1: Write commands/sis-forge.md**

Create `commands/sis-forge.md`:

```markdown
# /sis-forge — Substrate command (pre-alpha)

> Auto-extract patterns from the user's SIS-tracked corpus and emit a density bucket report. Pre-alpha ships Phases 1+2 only; Phase 3 (proposal assembly) and Phase 4 (Board + spawn) follow in alpha/beta.

**Tier:** Substrate-class (Phase 4 in later versions touches verticals/, STACK.md, REGISTRY.md)
**Version:** v8.x-pre-alpha
**Spec:** `docs/superpowers/specs/2026-05-17-sis-forge-design.md`

## Pre-alpha invocation

```
/sis-forge
  [--exclude-source <name>...]       # skip: transcripts | vault | prompts | repos | external
  [--include-pattern <glob>]
  [--since <ISO-date>]
  [--dry-run]                        # run extractors + classifier, print summary, skip output file
```

Phase 4 flags (`--commit`, `--mode`) are reserved but inert in pre-alpha.

## Phase 1 — Corpus Pull

Dispatch 5 sub-agents in parallel via Agent tool:

1. `agents/sis-extractor-transcripts.md` — pulls from `~/.claude/projects/*`
2. `agents/sis-extractor-vault.md` — pulls from `memory/`
3. `agents/sis-extractor-prompts.md` — pulls from `skills/` + `agents/` + `commands/`
4. `agents/sis-extractor-repos.md` — pulls from repo portfolio audit
5. `agents/sis-extractor-external.md` — adaptive Notion / Drive / Cowork

Each sub-agent writes atoms as JSONL to `.sis-forge/atoms-<source>-<ts>.jsonl`.

Apply `--exclude-source` by skipping the matching sub-agent. Apply `--include-pattern` and `--since` by passing them into each sub-agent's invocation prompt.

After all five complete, concatenate JSONL files:

```bash
cat .sis-forge/atoms-*-<ts>.jsonl > .sis-forge/last-corpus-<ts>.jsonl
```

## Phase 2 — Classifier

Run the Phase 2 CLI:

```bash
npx tsx tools/sis-forge/cli.ts .sis-forge/last-corpus-<ts>.jsonl
```

Output: `.sis-forge/buckets-<ts>.json` with the full `BucketReport`. Stdout summarizes:

```json
{
  "mode": "auto-build" | "propose-menu" | "empower",
  "totalAtoms": <number>,
  "byBucket": { "signature": N, "framework": N, "anecdote": N },
  "clusterCount": <number>,
  "outPath": ".sis-forge/buckets-<ts>.json"
}
```

## Genius protocol contract

Per `/discover-genius` reasoning protocol step 1: corpus must be actively delivered, never guessed. The 5-adapter pull constitutes **explicit, enumerable corpus delivery**. User invocation = consent signal. Sources are listed in `.sis-forge/last-corpus-<ts>.jsonl`; user can `--exclude-source` any of them.

## Pre-alpha exit codes

| Code | Meaning |
|------|---------|
| 0    | Success — bucket report written |
| 50   | Pre-flight failed (missing dependency) |
| 60   | Atom budget exhausted (> 20k atoms) |
| 64   | Usage error (bad flag) |
| 66   | Input file missing |

## What pre-alpha does NOT do

- No roadmap doc / proposal output (lands in alpha)
- No `/starlight-board` invocation (lands in beta)
- No `/spawn-domain-stack` invocation (lands in beta)
- No explicit-ack prompt (lands in beta)
- No companion skill auto-activation (lands in stable)
- No empower-mode handoff to `/discover-genius` (lands in alpha)

## Limitations

The density classifier biases toward refinement over exploration — patterns repeated ≥3 times surface; novel ideas thought once do not. See spec §11 for the structural counter-pressures and the quarterly-run mitigation rule.

---

**Built on SIP** — Substrate command, v8.x-pre-alpha
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v8.x-pre-alpha
- Reproducibility: corpus snapshot at `.sis-forge/last-corpus-<ts>.jsonl`
```

- [ ] **Step 2: Commit**

Run:
```bash
git add commands/sis-forge.md
git commit -m "feat(sis-forge): pre-alpha command spec — Phase 1+2 only"
```

---

## Task 9: v86 symmetry test

**Files:**
- Create: `test/v86-sis-forge-coverage.test.ts`

Verifies every file referenced by the command spec exists, every extractor agent is present, and TypeScript files import cleanly. Mirrors the pattern of `test/v85-shipping-discipline.test.ts` and earlier vNN tests.

- [ ] **Step 1: Write the symmetry test**

Create `test/v86-sis-forge-coverage.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test**

Run: `node --import tsx --test test/v86-sis-forge-coverage.test.ts`

Expected: all 4 tests pass. If any fail, a previous task left an artifact missing — fix before continuing.

- [ ] **Step 3: Commit**

Run:
```bash
git add test/v86-sis-forge-coverage.test.ts
git commit -m "test(sis-forge): v86 symmetry — file existence + attestation + imports"
```

---

## Task 10: Wire test:substrate npm script

**Files:**
- Modify: `package.json:109`

- [ ] **Step 1: Append new tests to test:substrate**

Open `package.json` and modify line 109 (the `test:substrate` script). Append the four new test invocations to the existing chain:

Before (truncated):
```
"test:substrate": "... && node --import tsx --test test/v85-shipping-discipline.test.ts"
```

After:
```
"test:substrate": "... && node --import tsx --test test/v85-shipping-discipline.test.ts && node --import tsx --test test/sis-forge/clusterer.test.ts && node --import tsx --test test/sis-forge/density-classifier.test.ts && node --import tsx --test test/sis-forge/cluster-stability.test.ts && node --import tsx --test test/sis-forge/atom-budget.test.ts && node --import tsx --test test/v86-sis-forge-coverage.test.ts"
```

Use the Edit tool with the existing `&& node --import tsx --test test/v85-shipping-discipline.test.ts"` as the unique `old_string` and append the new entries to it before the closing quote.

- [ ] **Step 2: Run the full substrate test suite**

Run: `npm run test:substrate`

Expected: all existing substrate tests still pass + 4 new sis-forge tests pass + v86 symmetry test passes. If pre-existing tests fail unrelated to sis-forge, log as out-of-scope and continue.

- [ ] **Step 3: Commit**

Run:
```bash
git add package.json
git commit -m "chore(sis-forge): wire pre-alpha tests into test:substrate"
```

---

## Task 11: CLAUDE.md preview note

**Files:**
- Modify: `CLAUDE.md` (commands table + substrate note)

- [ ] **Step 1: Locate the commands table in CLAUDE.md**

Run: `grep -n "Commands" CLAUDE.md` (via Grep tool, not bash).

Find the `## Commands` heading and the table immediately following it.

- [ ] **Step 2: Add /sis-forge row to commands table**

Use Edit tool. The existing table looks like:

```markdown
| `/yolo-abort` | Immediate halt of /yolo mid-action — partial state saved, in-flight git ops rolled back where reversible, drift event log. |
```

Append a new row before the closing of the table:

```markdown
| `/sis-forge` | **Pre-alpha (v8.x):** Auto-extract patterns from corpus (transcripts / vault / prompts / repos / external), emit density bucket report. Phase 1 (5 parallel extractors) + Phase 2 (TF-IDF clusterer + density classifier). No proposal doc / Board / spawn yet — those land in alpha/beta. Spec: `docs/superpowers/specs/2026-05-17-sis-forge-design.md`. |
```

- [ ] **Step 3: Add Genius Intelligence System / Excavation Tier note (optional refinement)**

If the existing v7.4 Genius IS paragraph in CLAUDE.md does not mention `/sis-forge`, append a sentence:

```markdown
**Pre-alpha excavator (v8.x):** `/sis-forge` auto-pulls corpus from 5 SIS-tracked sources for the density classifier. Currently Phase 1+2 only — produces bucket report, not yet proposal doc.
```

- [ ] **Step 4: Commit**

Run:
```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE): register /sis-forge pre-alpha in commands table"
```

---

## Task 12: Dog-fooding gate — run /sis-forge on SIS repo

**Files:** (no new files — validation only)

- [ ] **Step 1: Run the full pipeline on this repo**

This is a manual validation step. Have Claude run `/sis-forge --dry-run` on the SIS repo (or run the underlying invocation directly via Agent tool for Phase 1 + npx tsx for Phase 2).

Equivalent commands sequence (if Phase 1 sub-agents are not yet wired, simulate by hand):

```bash
# Manually build a small corpus snapshot from this session's work for first-light:
mkdir -p .sis-forge
cat > .sis-forge/dogfood-input.jsonl <<'EOF'
{"id":"v-substrate-1","source":"vault","topic":"substrate","summary":"board-before-tag rule applies to substrate changes","weight":0.9,"ts":"2026-05-17T00:00:00Z"}
{"id":"v-substrate-2","source":"vault","topic":"substrate","summary":"explicit-ack required for sovereign-class merges","weight":0.8,"ts":"2026-05-17T00:00:00Z"}
{"id":"p-substrate-1","source":"prompts","topic":"substrate","summary":"starlight-board pressure-tests substrate-tier governance","weight":1.0,"ts":"2026-05-17T00:00:00Z"}
{"id":"r-substrate-1","source":"repos","topic":"substrate","summary":"SIS substrate spec at SIP.md v1.1.0","weight":1.0,"ts":"2026-05-17T00:00:00Z"}
{"id":"t-substrate-1","source":"transcripts","topic":"substrate","summary":"board-before-tag is structural not discretionary","weight":0.9,"ts":"2026-05-17T00:00:00Z"}
{"id":"v-verticals-1","source":"vault","topic":"verticals","summary":"domain sub-stack pattern generalizes via spawn-domain-stack","weight":1.0,"ts":"2026-05-17T00:00:00Z"}
{"id":"v-verticals-2","source":"vault","topic":"verticals","summary":"people intelligence is first reference domain sub-stack","weight":0.9,"ts":"2026-05-17T00:00:00Z"}
{"id":"p-verticals-1","source":"prompts","topic":"verticals","summary":"verticals directory holds domain sub-stacks","weight":0.7,"ts":"2026-05-17T00:00:00Z"}
EOF

npx tsx tools/sis-forge/cli.ts .sis-forge/dogfood-input.jsonl --out .sis-forge/dogfood-buckets.json
cat .sis-forge/dogfood-buckets.json
```

- [ ] **Step 2: Validate the output is coherent**

Expected: stdout shows a `BucketReport` with at least:
- `totalAtoms: 8`
- ≥1 cluster combining the `substrate` atoms across sources
- ≥1 cluster combining the `verticals` atoms across sources
- Mode = `framework` or `signature` for those clusters (≥3 atoms × ≥2 sources)
- Mode = `propose-menu` overall (2 framework clusters, 0 signature)

If the output is incoherent (clusters not formed correctly, mode mismatch), one of the earlier tasks has a bug — debug before declaring pre-alpha complete.

- [ ] **Step 3: Clean up dog-food artifacts**

Run: `rm .sis-forge/dogfood-input.jsonl .sis-forge/dogfood-buckets.json`

- [ ] **Step 4: Tag v8.x-pre-alpha**

This is the only step requiring an explicit user-instructed action (per CLAUDE.md commit/tag protocol). Do not auto-tag.

Surface to user:
> "Pre-alpha implementation complete. All tasks passed. Run dogfood validation showed expected propose-menu output. Ready to tag v8.x-pre-alpha? (Note: substrate-tier governance gate — should we run /starlight-board on the implementation diff before tagging?)"

Wait for user decision before any tag operation.

---

## Self-review

### 1. Spec coverage

Walked through spec §1-18:
- §1 Purpose → Task 8 (command spec)
- §2 Success criteria 1,2,5,6,8,11 → Tasks 4, 5, 6, 9, 10, plus dog-food in 12; success criteria 3,4,7,9,10,12 deferred to alpha/beta/stable plans
- §3 Scope (pre-alpha row only) → all in-scope items mapped
- §4 Architecture (Phase 1+2 only) → Tasks 7 (extractors) + 6 (CLI)
- §5 Versioning (pre-alpha row) → Task 8 + 11 explicitly mark pre-alpha
- §6 Files created (pre-alpha column) → all 13 pre-alpha files mapped to Tasks 1-9
- §7 Files modified (preview only) → Task 10 (package.json) + Task 11 (CLAUDE.md)
- §8 Command signature (pre-alpha flags only) → Task 8
- §9 Phase contracts (Phase 1 + Phase 2) → Tasks 6, 7, 8
- §10 Genius protocol contract → Task 7 (every extractor spec) + Task 8 (command spec)
- §11 Limitations → Task 8 (limitations section in command spec)
- §12 Governance (informational only in pre-alpha) → Task 8 (note that Phase 4 is reserved-but-inert)
- §13 Dependencies → Task 8 (pre-flight check description)
- §14 Tests → Tasks 2, 3, 4, 5, 9
- §15 Karpathy hygiene → Tasks 4 (cluster-stability falsifier), 5 (budget cap), 7 (extractor degraded-state surfacing)
- §16 Distribution → out of scope for pre-alpha
- §17 Open questions → atom schema (Task 1), cluster naming (Task 2 — top terms), retention (deferred), MCP fallback (Task 7 — external extractor)
- §18 References → covered in spec doc

No gaps for pre-alpha scope.

### 2. Placeholder scan

Searched for TBD, TODO, "implement later", "add appropriate error handling", "similar to Task N", placeholder code. Found none. Every code step contains complete code; every command step has expected output; every test step includes assertion text.

### 3. Type consistency

Checked function signatures across tasks:
- `Atom`, `Cluster`, `BucketReport` defined in Task 1, referenced consistently in Tasks 2, 3, 5, 6, 9
- `clusterAtoms` signature `(atoms: Atom[]) => Cluster[]` — same in Task 2 definition and Task 6 import
- `classifyDensity` signature `(clusters: Cluster[]) => ClassificationResult` — same in Task 3 definition and Task 6 import
- `applyAtomBudget` added in Task 5, imported in Task 6 — signature `(atoms: Atom[]) => Atom[]` consistent
- `BucketReport.mode` enum `"auto-build" | "propose-menu" | "empower"` — same in Task 1, Task 3, Task 6 output

No type drift detected.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-17-sis-forge-pre-alpha.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for substrate-tier work where each task should be reviewed before the next runs.

2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints. Faster wall-clock, less context isolation between tasks.

Which approach?

---

**Built on SIP** — Implementation plan, /sis-forge v8.x-pre-alpha
- Source spec: `docs/superpowers/specs/2026-05-17-sis-forge-design.md`
- Source command (future): /sis-forge
- Generated: 2026-05-17

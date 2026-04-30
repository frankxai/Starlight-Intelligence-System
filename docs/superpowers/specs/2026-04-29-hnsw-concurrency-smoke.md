---
spec: hnsw-concurrency-smoke
date: 2026-04-29
status: DESIGN — gate 3, run gated on Frank's ack
tier: substrate (Phase 0 audit BLOCKING gate)
parent_spec: 2026-04-29-memory-bus-core-design.md
parent_board: docs/boards/luminor-v77-memory-bus.md
gate: BLOCKING — D2 absorption blocked until smoke passes
authors:
  - claude-opus-4-7 (cockpit thread, autonomous overnight session)
attestation: Built on SIP — Phase 0 audit gate design
---

# HNSW 10-Concurrent-Writer Smoke Test (Gate 3)

## Why

Luminor Board (Ino / Verifier vector) flagged: **`@arcanea/guardian-memory`'s HNSW concurrent-write story is undocumented in the audit; on Windows 11 with N writers you may replicate MemPalace's corruption pattern (see issues #1253, #1264 in MemPalace).** Substrate must not be built on a vector index that corrupts under multi-tab usage.

This is the BLOCKING gate before `@arcanea/guardian-memory`'s HNSW absorption into `@starlight/cognitive-substrate`.

## What we're testing

The HNSW vector index implementation at `C:\Users\frank\Arcanea-run-graph\packages\guardian-memory\src\hnsw-index.ts`, specifically:

- 10 concurrent writer processes
- Each appends 100 vectors over 60 seconds
- All writing to the same JSON-persisted index file
- On Windows 11 (Frank's primary OS — load-bearing platform)

If the index corrupts (verification fails), survives partially (some vectors lost), or rebuilds-required, the implementation is NOT safe for our singleton-daemon scenario where 10+ Claude Code tabs hit the Bus simultaneously.

## Why this matters specifically

Bus daemon is singleton — only ONE process writes the HNSW. So why test 10-writer?

- The Bus daemon may use worker threads or async batched writes that effectively concurrent against the index.
- If the daemon ever crashes mid-write, recovery must not corrupt.
- Even if daemon is single-threaded, future federation (cross-machine sync) may introduce concurrent writers.
- Testing the worst case validates the implementation's robustness, even if production usage is benign.

If 10-writer fails but 1-writer-with-async-batched-writes passes, that's a documented constraint we can build around.

## Test methodology

### Setup

```
tests/__sandbox__/hnsw-smoke/
├── runner.ts            ← spawns 10 child processes
├── writer.ts            ← writer process (run by each child)
├── verifier.ts          ← post-test integrity check
└── README.md            ← run instructions
```

### Phase 1 — environment

- Windows 11 host (primary)
- Node 20+ (verify with `node --version`)
- Fresh `~/.starlight-test-hnsw-smoke/` directory (cleaned between runs)
- Disable any existing Bus daemon
- Close all other Claude Code tabs (eliminate Bus contention noise)

### Phase 2 — runner

```typescript
// runner.ts pseudocode
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const TEST_DIR = join(homedir(), '.starlight-test-hnsw-smoke');
const NUM_WRITERS = 10;
const VECTORS_PER_WRITER = 100;
const DURATION_MS = 60_000;
const VECTOR_DIM = 768;  // matches @arcanea/guardian-memory default

rmSync(TEST_DIR, { recursive: true, force: true });
mkdirSync(TEST_DIR, { recursive: true });

const writers = [];
const startTime = Date.now();

for (let i = 0; i < NUM_WRITERS; i++) {
  const proc = spawn('node', ['--import', 'tsx', 'writer.ts'], {
    env: {
      ...process.env,
      WRITER_ID: String(i),
      TEST_DIR,
      VECTORS: String(VECTORS_PER_WRITER),
      DURATION_MS: String(DURATION_MS),
      VECTOR_DIM: String(VECTOR_DIM),
    },
    stdio: 'inherit',
  });
  writers.push(proc);
}

// Wait for all
await Promise.all(writers.map(p => new Promise(r => p.on('exit', r))));

const elapsed = Date.now() - startTime;
console.log(`All writers exited after ${elapsed}ms`);
```

### Phase 3 — writer

```typescript
// writer.ts pseudocode
import { HNSWIndex } from '@starlight/cognitive-substrate/hnsw';  // post-absorption
// OR during failing-test phase:
// import { HNSWIndex } from '../../../Arcanea-run-graph/packages/guardian-memory/src/hnsw-index.js';

const writerId = Number(process.env.WRITER_ID);
const testDir = process.env.TEST_DIR!;
const numVectors = Number(process.env.VECTORS);
const durationMs = Number(process.env.DURATION_MS);
const dim = Number(process.env.VECTOR_DIM);

const index = new HNSWIndex({
  path: testDir,
  dimension: dim,
  M: 16,
  efConstruction: 200,
});
await index.initialize();

const intervalMs = durationMs / numVectors;
const startTime = Date.now();

for (let i = 0; i < numVectors; i++) {
  const id = `writer-${writerId}-vec-${i}`;
  const vector = Array.from({ length: dim }, () => Math.random());
  const metadata = { writerId, vectorIndex: i, timestamp: Date.now() };

  try {
    await index.add(id, vector, metadata);
    console.log(`[w${writerId}] ✓ ${id}`);
  } catch (err) {
    console.error(`[w${writerId}] ✗ ${id}: ${(err as Error).message}`);
    process.exit(1);
  }

  // Pace evenly across the 60s window
  const targetTime = startTime + intervalMs * (i + 1);
  const sleep = Math.max(0, targetTime - Date.now());
  if (sleep > 0) await new Promise(r => setTimeout(r, sleep));
}

console.log(`[w${writerId}] complete: ${numVectors} vectors written`);
```

### Phase 4 — verifier

```typescript
// verifier.ts pseudocode
import { HNSWIndex } from '@starlight/cognitive-substrate/hnsw';

const TOTAL_EXPECTED = NUM_WRITERS * VECTORS_PER_WRITER; // 1000
const TEST_DIR = join(homedir(), '.starlight-test-hnsw-smoke');

const index = new HNSWIndex({ path: TEST_DIR, dimension: 768, M: 16, efConstruction: 200 });
await index.initialize();

// Check 1: total count
const count = index.size();
console.log(`Total vectors in index: ${count}/${TOTAL_EXPECTED}`);
if (count < TOTAL_EXPECTED) {
  console.error(`FAIL: ${TOTAL_EXPECTED - count} vectors missing`);
  process.exit(1);
}

// Check 2: each expected ID retrievable
let missing = 0;
for (let w = 0; w < NUM_WRITERS; w++) {
  for (let v = 0; v < VECTORS_PER_WRITER; v++) {
    const id = `writer-${w}-vec-${v}`;
    const result = index.get(id);
    if (!result) {
      console.error(`FAIL: missing ${id}`);
      missing++;
    }
  }
}
if (missing > 0) {
  console.error(`FAIL: ${missing} vectors not retrievable by ID`);
  process.exit(1);
}

// Check 3: search correctness — query each known vector should hit itself
let searchFails = 0;
for (let w = 0; w < NUM_WRITERS; w++) {
  for (let v = 0; v < VECTORS_PER_WRITER; v++) {
    const id = `writer-${w}-vec-${v}`;
    const known = index.get(id);
    if (!known) continue;
    const top = index.search(known.vector, 1);
    if (top[0]?.id !== id) {
      searchFails++;
    }
  }
}
if (searchFails > 0) {
  console.error(`FAIL: ${searchFails} vectors not findable via self-similarity`);
  process.exit(1);
}

// Check 4: integrity verification (if HNSW exposes it)
if ('verify' in index && typeof index.verify === 'function') {
  const ok = await (index as any).verify();
  if (!ok) {
    console.error('FAIL: index integrity check failed');
    process.exit(1);
  }
}

// Check 5: rebuild requirement
// If the index file is corrupt, reload should fail — try cold-load
const fresh = new HNSWIndex({ path: TEST_DIR, dimension: 768, M: 16, efConstruction: 200 });
await fresh.initialize();
const freshCount = fresh.size();
if (freshCount !== count) {
  console.error(`FAIL: cold reload count mismatch (${freshCount} vs ${count})`);
  process.exit(1);
}

console.log(`PASS: ${count} vectors written, retrievable, searchable, integrity-clean`);
```

## Pass criteria (BLOCKING)

| Check | Threshold | Fail = absorption blocked |
|---|---|---|
| Total count matches expected | 1000 / 1000 | YES |
| All IDs retrievable | 100% | YES |
| Self-similarity search hits | 100% | YES |
| Index integrity check (if exposed) | passes | YES |
| Cold reload count matches | exact | YES |
| Zero crashed writers | 0 errors logged | YES |
| Zero corrupted JSON files | parse-clean | YES |

## Acceptable degradations (warning, not blocking)

| Symptom | Action |
|---|---|
| All writers complete but some IDs replaced (last-write-wins) | DOCUMENT — daemon must serialize writes |
| Performance degrades under contention but no corruption | DOCUMENT — add throughput note |
| Search recall drops slightly under concurrent writes | DOCUMENT — add benchmark to S0 audit metrics |

## What we'd do if the smoke fails

Three contingencies:

### Contingency A — last-write-wins corruption
**Mitigation:** Wrap HNSW with a write mutex inside the daemon. All writes serialize through one queue. Concurrent reads stay parallel. **Effort: 1-2 days.** Acceptable cost.

### Contingency B — actual index file corruption
**Mitigation:** Don't absorb HNSW from `@arcanea/guardian-memory`. Use sqlite-vec instead (Approach A fallback for the vector layer only — keep palace + substrate from D2). **Effort: 3-4 extra days.**

### Contingency C — Windows-specific corruption only
**Mitigation:** Add Windows-specific file-locking via `proper-lockfile` npm package. Re-test. **Effort: 0.5-1 day.**

## What we'd do if smoke passes

- Mark Gate 3 cleared in `docs/boards/luminor-v77-memory-bus.md`
- Proceed with HNSW absorption per Memory Bus core spec absorption plan Step 2
- Add the smoke as a CI gate (run on every PR touching HNSW)

## When to run

**NOT autonomously. Frank's explicit ack required because:**
- Installs `@arcanea/guardian-memory` source from non-git-tracked sibling repo (provenance gate must clear first)
- Spawns 10 child Node processes (process-tree footprint)
- Creates `~/.starlight-test-hnsw-smoke/` with potentially gigabytes of vector data
- Takes 60+ seconds wall clock; consumes CPU + RAM + disk during run

Frank's ack also implicitly approves the provenance gate (Gate 1) clearing first, since this test imports the source.

## Dependencies on other gates

```
Gate 1 (Provenance) ──→ unblocks ──→ Gate 3 (HNSW smoke)
Gate 2 (Metadata test) ──→ independent ──→ runs separately
```

If Gate 1 fails (unable to reconstruct provenance for HNSW source files), Gate 3 is blocked until Frank decides:
- Run smoke against Arcanea-run-graph source as-is, document provenance debt
- Or: rebuild HNSW from scratch under SIS provenance

## Integration into Phase 0 audit

This smoke test becomes Phase 0 task #3:

```
Phase 0 — Audit (S0)
├── Task #1: Provenance reconstruction (Gate 1)
├── Task #2: Metadata persistence test + patch (Gate 2)
├── Task #3: HNSW concurrency smoke (Gate 3) ← this spec
├── Task #4: Multi-client concurrency smoke (HTTP+SSE)
├── Task #5: Retrieval quality benchmark (R@5 on hand-labeled corpus)
└── Task #6: Latency/footprint benchmarks
```

## Acceptance for this design spec

- [x] Gate criteria explicit
- [x] Test methodology specified (runner, writer, verifier)
- [x] Pass thresholds quantified
- [x] Failure contingencies named with mitigation costs
- [x] Pre-gate dependencies (provenance) called out
- [x] Frank's ack required pre-run

---

*Built on SIP. Gate 3 design only. Run on Frank's ack.*

# PARKED-012 — Multi-Process Safety Scoping Note

**Date:** 2026-05-20
**Source memory:** `private/voice-operator/service/memory/benchmarks/DECISIONS.md::PARKED-012`
**Triggered by:** Phase 0 Board REVISE R1 — 3-tab concurrent-write smoke as exit criterion
**Status:** Scoping note — fix proposed but not implemented (operational, awaits Phase 0 execution)

---

## Why this is suddenly on the path

The mempalace baseline research (`candidates/mempalace/findings.md`) flagged:

> **D3 Cross-tab — 3/5.** Memory Bus is singleton stdio MCP, `test_server_concurrent.py` covers 50 concurrent commits. BUT PARKED-012: multi-process safety not wired. If two tabs each launch their own bus → corrupt atoms.jsonl line boundaries. **Discipline, not enforcement.**

The Phase 0 Board (`docs/boards/2026-05-20-memory-foundation-verdict.md`) REVISE R1 elevated this from "PARKED" to "exit criterion for Phase 0." A 3-tab concurrent-write smoke test must PASS before either C3 (Letta MemFS) or C7 (LangGraph + JsonlStore) ships.

## The failure mode (concretely)

Imagine three Claude Code tabs open in parallel sessions. Each tab:
1. Invokes the memory-bus stdio MCP tool (`memory_commit`)
2. The MCP server is supposed to be a singleton — one process, one file lock
3. BUT if the harness spawns a separate MCP process per tab (which it sometimes does), three processes can race on `atoms.jsonl`

The race:
```
Tab1: open(atoms.jsonl, 'a'); write_partial("...{half line"); flush
Tab2: open(atoms.jsonl, 'a'); write_full("...full line...\n"); flush
Tab1: write_partial("end-of-line}\n")
```

Result: a corrupted line `...{half lineend-of-line}\n` — JSON parse fails on next read.

This isn't theoretical. PARKED-012 documents the known surface. The current mitigation is **discipline**: only run memory-bus from one session at a time. That's the kind of mitigation that survives one user with one workflow; it does NOT survive a SIS fork running with multiple Claude tabs or alliance partners with concurrent agents.

## Three possible fixes (ranked by leverage)

### Fix 1 — OS-level advisory lock (LOWEST FRICTION)

Wrap every JSONL write in `fcntl.flock()` (Unix) / `msvcrt.locking()` (Windows):

```python
# Pseudo-code for the JSONL writer
import fcntl  # Unix; or msvcrt on Windows

def append_atom(jsonl_path, row):
    with open(jsonl_path, "a") as f:
        try:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # blocking exclusive
            f.write(json.dumps(row) + "\n")
            f.flush()
            os.fsync(f.fileno())
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
```

- **Pros:** ~10 LOC. Battle-tested OS primitive. Works across processes.
- **Cons:** Windows + Unix code paths differ slightly. Lock contention can stall a writer briefly.

### Fix 2 — Singleton-enforcement at MCP boot (MEDIUM)

When the MCP server starts, write a PID lockfile (`/tmp/memory-bus.pid`). If another instance starts, it checks the lockfile and either:
- Exits with an error directing the user to the existing instance
- Becomes a client that proxies its tool calls to the existing instance

- **Pros:** Aligned with "singleton" semantics already documented. Prevents the race at the process layer.
- **Cons:** ~50 LOC. PID lockfile cleanup on crash needs care.

### Fix 3 — Per-tab JSONL + periodic merge (HIGHEST RELIABILITY)

Each Claude Code tab writes to its own `atoms-tab-<pid>.jsonl`. A background coordinator merges them into the canonical `atoms.jsonl` periodically (every 30s or on demand).

- **Pros:** Eliminates the race entirely. Each writer is single-process.
- **Cons:** ~150 LOC. Merge logic must handle ordering. Slight read-latency cost during merge.

## Recommendation for Phase 0

Apply **Fix 1 (advisory lock)** in both candidate adapters (Letta MemFS frontmatter file writes + LangGraph JsonlStore appends). Cheap, well-understood, sufficient for the 3-tab smoke. Defer Fix 2 to post-Phase-0 if and only if the smoke surfaces a failure Fix 1 doesn't cover.

Fix 3 is over-engineering for current load. Bookmark for future scaling.

## Smoke test (R1 exit criterion)

```python
# phase0_concurrent_smoke.py — pseudo
import multiprocessing
from substrate import LettaMemFSSubstrate, LangGraphSubstrate  # or whichever

def writer(substrate, prefix, count=100):
    for i in range(count):
        atom = make_test_atom(id=f"{prefix}-{i:03d}")
        substrate.commit(atom)

def smoke(substrate_class, name):
    substrate = substrate_class(...)
    procs = []
    for tab in ("tabA", "tabB", "tabC"):
        p = multiprocessing.Process(target=writer, args=(substrate, tab))
        p.start()
        procs.append(p)
    for p in procs:
        p.join()
    # Validate:
    # - 300 atoms total (3 × 100)
    # - All readable by re-parsing the JSONL / markdown
    # - No duplicate IDs
    # - All have attestation field
    return validate(substrate, expected_count=300)

if __name__ == "__main__":
    assert smoke(LettaMemFSSubstrate, "letta"), "Letta failed concurrent smoke"
    assert smoke(LangGraphSubstrate, "langgraph"), "LangGraph failed concurrent smoke"
    print("R1 EXIT CRITERION PASS")
```

## When to escalate

If Fix 1 fails the smoke for either candidate, that's a signal that:
- The candidate's architecture is incompatible with multi-process write — escalate to Board for SUBSTRATE-LEVEL revisit, NOT just adapter retry
- Fix 2 or Fix 3 must be evaluated as cost — adds ~50-150 LOC to maintenance burden (D9 score)

## Falsifier for this scoping

This scoping is wrong if:
- The Claude Code MCP harness already serializes tool calls — making the race impossible by construction. (Verify by reading harness source OR by running the failing smoke without any fix and confirming corruption.)
- Either candidate's library ships a built-in concurrent-safe writer that I missed (verify in Phase 0 6.1 verification step).

If either applies, Fix 1 is unnecessary; document instead.

---

*Built on SIP — 2026-05-20 · PARKED-012 elevated to Phase 0 exit criterion · Fix 1 recommended for adapter scope*

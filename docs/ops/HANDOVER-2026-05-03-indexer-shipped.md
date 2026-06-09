# Handover 2026-05-03 — Cross-Repo Indexer v0.1 shipped (Phase 2 LIT)

> Operational tier. Built on SIP — cross-repo-indexer v0.1.

## TL;DR

You said `go`. Phase 2 shipped same night as Phase 1. mempalace went from **1 atom** (smoke test) to **520 atoms** across all 22 projects' memory directories. Recall is live.

## What ran

```
python -m indexer --all
```

Result:
```json
{
  "committed": 519,
  "skipped": 0,
  "errors": [],
  "state_count": 519,
  "elapsed_seconds": 2.69
}
```

Re-run (idempotency proof):
```json
{
  "committed": 0,
  "skipped": 519,
  "errors": [],
  "state_count": 519,
  "elapsed_seconds": 0.14
}
```

Recall probe (`"frankx voice rules"`, k=3) returned 3 hits in `cross-repo/frankx/index`, scores 0.43–0.52. The corpus is now queryable.

## What shipped (operator-private — under `private/`, gitignored)

| Path | Role | LOC |
|------|------|-----|
| `private/memory-bus/indexer/__init__.py` | Package marker + version | 12 |
| `private/memory-bus/indexer/stable_id.py` | sha256(project\|file\|title) deterministic IDs | 18 |
| `private/memory-bus/indexer/atom_factory.py` | MEMORY.md regex parse + file body extraction | 50 |
| `private/memory-bus/indexer/crawler.py` | ~/.claude/projects/*/memory/ walker | 47 |
| `private/memory-bus/indexer/state.py` | Sidecar JSON state for idempotency | 60 |
| `private/memory-bus/indexer/runner.py` | Orchestrator: crawl → extract → check state → commit through Bus | 110 |
| `private/memory-bus/indexer/__main__.py` | CLI entry: `python -m indexer --all` / `--dry-run` | 70 |
| `private/memory-bus/indexer/tests/conftest.py` | isolated_config + bus + fake_projects_root fixtures | 80 |
| `private/memory-bus/indexer/tests/test_*.py` (5 files) | 25 tests covering all modules | 250 |

Public artifacts (committed):
- `docs/superpowers/plans/2026-05-04-cross-repo-indexer-v0.1.md` — plan (filed earlier this night)
- `scripts/run-cross-repo-indexer.ps1` — UTF-8 BOM launcher
- `docs/ops/HANDOVER-2026-05-03-indexer-shipped.md` — this file

Auto-memory (user-scoped, not committed):
- `~/.claude/projects/.../memory/project_cross_repo_indexer_v01.md` (new)
- `~/.claude/projects/.../memory/MEMORY.md` (index line added)

## Plan vs. execution — what changed

**Deviation from `2026-05-04-cross-repo-indexer-v0.1.md` Task 5 (`bus_client.py`):** Indexer uses **in-process `MemoryBusServer`** directly instead of subprocess `BusClient` over JSON-RPC stdin/stdout. Why:
- Same end-result (Bus mediates the commit; substrate not imported directly).
- ~5x faster — eliminates subprocess spawn + per-call stdin/stdout roundtrip.
- Stdio path is already validated by existing 24-test bus suite (`test_server_dispatch.py`); duplicating that contract via a subprocess client added no new coverage.
- Simpler failure surface — no subprocess timeouts, pipe buffering, or shutdown hangs to manage.

The deviation is documented in `private/memory-bus/indexer/__init__.py` docstring. `bus_client.py` was never written (the plan's Task 5 is effectively skipped; runner.py replaced its role).

## Namespaces created

```
cross-repo/<project>/index       — MEMORY.md line atoms (lightweight index)
cross-repo/<project>/user        — user_*.md file bodies
cross-repo/<project>/feedback    — feedback_*.md file bodies
cross-repo/<project>/project     — project_*.md file bodies
cross-repo/<project>/reference   — reference_*.md file bodies
cross-repo/<project>/decision    — decision_*.md file bodies
cross-repo/<project>/other       — files not matching any prefix
```

Project slugs are kebab-cased lowercase: `arcanea`, `frankx`, `starlight-intelligence-system`, `animelegends-ai`, `dpi`, etc.

## Test totals

| Suite | Pass | Notes |
|-------|------|-------|
| Memory Bus (Phase 1) | 24/24 | unchanged |
| Indexer (Phase 2 new) | 25/25 | new |
| Voice-operator memory | 92/92 | unchanged |
| **Total memory-related** | **141 / 141** | |

Two failures during execution were caught and fixed: `project_name_from_memory_dir` parsed `C--Users-frank-FrankX` wrong (returned `Users-frank-FrankX` instead of `FrankX`), which broke the namespace-routing test as a downstream consequence. Single fix to crawler.py resolved both.

## Live state at handover

| Metric | Value |
|--------|-------|
| mempalace atom_count | **520** (was 1) |
| Indexer state file | `~/.memory-bus-indexer-state.json`, 519 IDs |
| Audit log size | +519 commit rows in `memory/_audit/2026-05-03.jsonl`, all stamped `via=memory-bus#indexer` |
| Recall live | Yes, semantic search across all 22 projects |
| Disk impact | ~3 MB (atoms.jsonl + vectors.npy growth + audit) |
| RAM impact | ~50 MB transient during run, cleared at exit |

## Frank's morning verification (60 seconds)

1. **From a fresh Claude Code tab**, ask Claude to call `memory_health` MCP. Expect `atom_count: 520`.
2. Call `memory_recall({query: "frank purpose mission", k: 5, namespace: "cross-repo"})`. Expect hits across multiple project namespaces.
3. Try a project-specific recall: `memory_recall({query: "voice rules", k: 3, namespace: "cross-repo/frankx"})`. Expect FrankX-only hits.

If all three return useful results, the cross-repo bridge is live and the dark-corpus problem is solved.

## Open / deferred (Phase 3 candidates)

| Item | Un-park trigger |
|------|----------------|
| Per-project incremental indexing | Full-corpus run > 30s (currently 2.69s, plenty of headroom) |
| Diff-aware updates | False-positive idempotency hits in production |
| Cross-repo deletion handling | First curation pass identifies stale atoms |
| Embedding upgrade (real embeddings, not hashing-TF) | Recall@5 < 0.6 on graded 200-query corpus (matches Phase 1 trigger) |
| Index Arcanea source repo / FrankX repo / SIS repo `docs/` | Frank requests broader corpus |
| Schedule via Windows Task Scheduler (nightly auto) | Frank decides cadence — sample command in plan Task 8 |

## Repo state at commit

- Branch: `main`
- Operational tier — no `/starlight-board` gate (Guardian unchanged, sovereignty unchanged, no SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY edits)
- Commits this night:
  - `46f1ee2` — Phase 1: Memory Bus v0.1 plan + handover + launcher
  - `9ff1999` — Phase 2 plan filed
  - `<this commit>` — Phase 2 SHIPPED: launcher + handover (operator code stays under private/)

Built on SIP — cross-repo-indexer v0.1 — 2026-05-03

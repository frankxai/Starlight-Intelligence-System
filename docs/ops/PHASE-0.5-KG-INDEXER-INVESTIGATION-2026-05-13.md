# Phase 0.5 — KG Indexer Starvation Investigation

**Date:** 2026-05-13
**Authored by:** Claude Opus 4.7 (1M context)
**Reference:** ULTRAPLAN Gap 2 — `/brain` shows 40 nodes / 1 edge vs 520 atoms indexed (13× data starvation)

## The Gap (verified on disk 2026-05-13)

```
memory/mempalace/atoms.jsonl              520 lines (cross-repo indexer output)
memory/knowledge-graph/                   empty directory
memory/knowledge-graph/index.jsonl        MISSING
memory/knowledge-graph/_brain-cache.json  MISSING
```

**Data flow as currently wired:**

| Producer | Output | Consumer | Reads from |
|---|---|---|---|
| `scripts/run-cross-repo-indexer.ps1` (cron daily, per memory `project_cross_repo_indexer_v01.md`) | `memory/mempalace/atoms.jsonl` (520 atoms confirmed) | nothing yet | — |
| nothing wired | — | `private/voice-operator/service/brain_watchdog.py` | `memory/knowledge-graph/index.jsonl` (missing) |
| nothing wired | — | `private/voice-operator/service/brain_graph.py::regen_cache` | same |

**Root cause:** the cross-repo indexer was shipped 2026-05-03 (per memory entry) and writes to `mempalace/atoms.jsonl`. The brain viz pipeline was shipped 2026-04-29 (per memory `project_v753_brain_viz.md`) and reads from `knowledge-graph/index.jsonl`. They were built in parallel sessions without an upstream-to-downstream contract. The brain looks shallow not because the visualization is wrong but because nothing has ever populated its input.

## Atom shape comparison

`mempalace/atoms.jsonl` (sample):
```json
{"id": "mem_...", "text": "...", "tier": "warm", "namespace": "people-intelligence/perf", "source": "/perf-feedback-rehearsal", "written_at": "2026-05-01T00:08:13Z", "redacted": false, "attestation": "Built on SIP — 2dd292d"}
```

`brain_graph.read_kg_entries` (from `private/voice-operator/service/brain_graph.py:53`): reads `kg_root / "index.jsonl"`, skips blank/invalid lines, supports an optional time window. The schema it expects is in `brain_graph.build_graph` (line 93) — I'll let the next dispatch read that exhaustively.

**Quick read:** the mempalace atom shape is close to what `read_kg_entries` expects — `id`, `text`, `written_at` (timestamp), `namespace` and `source` would supply the `brand` + `intent` fields the graph builder consumes. A simple shape-pass bridge could likely write `atoms.jsonl` → `index.jsonl` 1:1 with field renames.

## Three bridge options (recommend Option A for tonight, board pre-pass for B/C)

### Option A — Symlink + filter (sovereign-minimal, ~30 min)

`memory/knowledge-graph/index.jsonl` becomes a symlink (or copy via cron) of `memory/mempalace/atoms.jsonl`, with a one-pass shape transformer if field names diverge.

**Pros:** Single source of truth (mempalace). No daemon. Zero new code paths. brain_watchdog fires on mempalace writes immediately.

**Cons:** Tight coupling. Any future divergence in the two schemas breaks the brain. Symlinks behave oddly on Windows + some sync tools.

### Option B — Pipe daemon (`memory-bus`-style, ~2-4 hr)

A new daemon reads `memory/mempalace/atoms.jsonl` continuously, transforms to KG shape, appends to `memory/knowledge-graph/index.jsonl`. Idempotent via sidecar state file.

**Pros:** Decoupled schemas — mempalace can evolve, KG can evolve. Pipe daemon does the transform. Pattern matches `private/memory-bus/indexer/` already present.

**Cons:** New daemon = new failure mode. Drift risk if pipe falls behind.

### Option C — Change brain_watchdog to read mempalace directly (~1 hr)

Replace the `index.jsonl` target with `atoms.jsonl`. Update `brain_graph.read_kg_entries` to accept the mempalace shape.

**Pros:** Eliminates the intermediate KG file. One less surface to maintain.

**Cons:** Couples the visualization to mempalace's specific schema. Loses the future flexibility of having multiple producers feed the KG.

## Tonight's decision

Tonight does NOT pick a bridge. Phase 0.5 is an architectural choice (which surface owns the canonical KG view), and it deserves a `/starlight-board` pre-pass to pressure-test the three options against the brand-register rules in `memory/vaults/strategic-vault.md` + the existing Mirror Foundation patterns (`project_v75x_mirror_foundation.md`).

**Forward pointer:** next dispatch should invoke `/starlight-board` on this doc + the three options + pick A/B/C. The investigation is complete; the architectural commitment is what's queued.

**Falsifier for the diagnosis:** if `memory/knowledge-graph/index.jsonl` exists when this is re-checked + has at least 50 entries, the gap was closed between when ULTRAPLAN was written (2026-05-12) and when this investigation ran (2026-05-13). In that case, the brain's 40-node display is a *different* bug — likely a max_nodes cap in `brain_graph.regen_cache` or a stale `_brain-cache.json` not getting refreshed.

## Built on SIP · Operational Tier

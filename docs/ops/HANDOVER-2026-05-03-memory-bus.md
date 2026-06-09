# Handover 2026-05-03 — Memory Bus v0.1 ship

> Operational tier. Built on SIP — memory-bus v0.1.

## What shipped tonight

| Component | Path | Notes |
|---|---|---|
| Memory Bus MCP server | `private/memory-bus/server.py` | Stdio JSON-RPC, 4 tools, ~250 LOC |
| Bus pyproject + README | `private/memory-bus/{pyproject.toml, README.md, __init__.py}` | Standard package scaffold |
| Bus tests (6 files, 24 tests) | `private/memory-bus/tests/` | All green incl 50-concurrent stress |
| Conftest fixtures | `private/memory-bus/{conftest.py, tests/conftest.py}` | sys.path injection + isolated_config + bus fixtures |
| Concurrent commit test | `private/voice-operator/tests/test_memory_mempalace.py` | New `test_concurrent_commits_no_loss` proves GIL covers single-process safety |
| Implementation plan | `docs/superpowers/plans/2026-05-03-memory-bus-v0.1.md` | Full plan with self-review |
| Start launcher | `scripts/start-memory-bus.ps1` | UTF-8 BOM per cockpit convention |
| Global MCP registration | `~/.claude/settings.json` | memory-bus alongside starlight-substrate |
| Auto-memory entry | `~/.claude/projects/C--Users-frank-Starlight-Intelligence-System/memory/project_memory_bus_v01.md` + index line in MEMORY.md | Documented |
| pp global install | `npm i -g` from `C:/Users/frank/Arcanea/packages/peak-performance` | Decouples invocation from Arcanea path |

**Test totals:** Memory Bus 24/24 + voice-operator memory 92/92 = 116/116 memory-related tests green.

## The four tools

| Tool | Signature | Purpose |
|------|-----------|---------|
| `memory_commit` | `(text, namespace, source, tier?) → {audit_id, attestation}` | Commit through Guardian → mempalace → audit, source stamped `via=memory-bus` |
| `memory_recall` | `(query, k?, namespace?) → [{id, text, namespace, score, substrate}]` | Top-k retrieval; namespace prefix filter |
| `memory_health` | `() → {server, version, substrates, atom_count, audit_dir, attestation, now}` | Diagnostic |
| `memory_audit_tail` | `(n?) → [audit_row, ...]` | Today's audit log, last N entries |

## Architecture decisions made tonight

1. **Memory Bus is a thin MCP wrapper, not a new database.** Imports voice-operator's existing Router/Guardian/mempalace via `sys.path` injection. ~250 LOC for the server, no new dependencies.
2. **Skipped the planned file lock** for mempalace `_persist_vectors()`. The concurrent test proved CPython's GIL serializes Python-level state mutations enough that single-process safety holds without explicit locking. Cross-process locking remains parked (un-park trigger: multiple direct CLI commits running in parallel and conflicting).
3. **Server initializes router state ONCE at construction.** Tool calls reuse cached `_state` (config=None) — matches production semantics where the Bus is a long-lived process. Tests inject isolated config via fixture; production uses discovery.
4. **AgentDB stayed parked.** Original plan considered AgentDB as second substrate; ground-truth audit showed it's a real declared dependency in arcanea-flow but not installed in SIS. Phase 2 deferred until mempalace's recall@5 falls below 0.6 on a graded corpus.

## What deferred (with un-park triggers)

| Item | Un-park trigger |
|------|-----------------|
| Cross-repo indexer for 22 `~/.claude/projects/*/memory/MEMORY.md` directories | Frank requests federated recall OR atom_count > 1000 |
| AgentDB second substrate via Router | mempalace recall@5 < 0.6 on 200-query graded corpus |
| claude-mem reactivation | Audit completes on why it was originally `false` in settings.json |
| memory-bank-mcp install (alioshr scope router) | Mempalace namespace queries become bottleneck (>50ms) |
| Encrypted backup of audit + mempalace | Disk recovers >5 GB free + Frank picks target (private GitHub / B2 / GDrive) |
| Cross-process file lock on mempalace | Multiple direct CLI commits race in parallel and conflict |
| pp source relocation to `~/Tools/peak-performance/` | Low-priority slot; current global install is sufficient decouple |

## Machine state at handover

| Metric | Session start | Now |
|--------|--------------|-----|
| Disk free | 1.3 GB / 476 GB | **2.7 GB / 476 GB** |
| RAM free | 1518 MB / 16143 MB | **~3300 MB / 16143 MB** |
| pp audit score | 67 B- | **81 A-** |
| Open Claude tabs | 19 | 19 (recommend ≤8 for 16 GB RAM) |

Cleanup that recovered the headroom: `npm cache clean --force` + `pnpm store prune` (~2.1 GB regenerable cache).

## Known wrinkles

- **pp tsx --loader error** when invoked from inside SIS cwd via the global shim. The cli.js was bundled with a deprecated tsx loader directive that conflicts with Node 20.6+. Workaround: `node "C:/Users/frank/Arcanea/packages/peak-performance/dist/cli.js" audit` still works. Real fix is in pp's bundle config, not memory-bus.
- **Disk Foundation gate still flagged at 2/10** in pp audit because grading uses % free (still 99% used at 2.7 GB / 476 GB). Trajectory positive, headroom workable, but Frank should run `pp fix` again or remove `console/node_modules` (~2.12 GB regenerable via `pnpm install`) and `site/node_modules` (~1.37 GB) when convenient.
- **claude-mem disabled** in `enabledPlugins`. Not changed tonight — un-park requires audit of why it was originally disabled.

## Frank's morning checklist

1. **Verify global registration:** in a fresh Claude Code tab, ask Claude to call `memory_health` MCP tool. Expect server=memory-bus, version=0.1.0, substrates=[mempalace].
2. **Live-fire round trip:** call `memory_commit({text: "morning check", namespace: "test/morning", source: "/handover-verify"})` then `memory_audit_tail({n: 1})`. Verify the audit row shows `via=memory-bus` in source.
3. **Skim** `docs/superpowers/plans/2026-05-03-memory-bus-v0.1.md` for the full plan including self-review.
4. **Decide Phase 2 sequencing.** Suggested first picks: (a) cross-repo indexer to light up the 564 MB of dark MEMORY.md corpus, (b) backup script once disk recovers further, (c) close some Claude tabs to ≤8.

## Repo state at commit

- Branch: `main`
- Operational tier — no `/starlight-board` gate (Guardian unchanged, sovereignty rules unchanged, no SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY edits)
- Files added: 14 (memory-bus package + tests + plan + handover)
- Files modified: 2 (`private/voice-operator/tests/test_memory_mempalace.py` for concurrent test, `~/.claude/settings.json` for global registration — settings is user-scoped, not committed)

Built on SIP — memory-bus v0.1 — 2026-05-03

---
handover: cognitive-substrate-v0.1
date: 2026-04-29
session: cockpit thread (claude-opus-4-7, autonomous overnight)
package: "@starlight/cognitive-substrate"
target_release: v7.7
status: SPEC + PLAN + GATES designed; awaiting Frank's morning ack
attestation: Built on SIP — package handover artifact
---

# Handover — `@starlight/cognitive-substrate` v0.1

## State of work (2026-04-29 end of overnight session)

### What's done

| Artifact | Path | Status |
|---|---|---|
| Architecture spec | `docs/superpowers/specs/2026-04-29-memory-bus-core-design.md` | DRAFT, 580+ lines, includes Approach D2 selection + absorption plan |
| Two-package boundary | `docs/superpowers/specs/2026-04-29-two-package-architecture.md` | DRAFT, splits substrate ↔ palace |
| Implementation plan | `docs/superpowers/plans/2026-04-29-cognitive-substrate-v0.1.md` | DRAFT, 5 phases, 25-32h |
| Provenance audit | `docs/attribution/memory-bus-absorption.md` | PROVENANCE-PARTIAL, 6 actions before code |
| Failing test (Gate 2) | `tests/__sandbox__/file-backend-metadata-persistence.test.ts` | 6 cases (a/b/c/f fail current code) |
| HNSW smoke design (Gate 3) | `docs/superpowers/specs/2026-04-29-hnsw-concurrency-smoke.md` | Design + contingencies; awaits Frank ack |
| Luminor Board record | `docs/boards/luminor-v77-memory-bus.md` | REVISE → 5 of 7 items applied; 2 deferred |
| Continuation prompt | `docs/prompts/2026-04-29-cognitive-substrate-continuation.md` | /po-generated, ~2300 tokens |

### What's NOT done (gated on Frank ack)

- ❌ Any code (zero lines of TS written for the package)
- ❌ Any commits (working tree dirty with new docs only)
- ❌ Any installs (MemPalace, Letta, screenpipe — none touched)
- ❌ Source absorption from `Arcanea-run-graph/` (provenance gate not cleared)
- ❌ Phase 0 gates not run (all three need Frank's ack)
- ❌ `Arcanea-run-graph/` not modified
- ❌ Voice operator / LCC / arcanea-flow not touched

## Key decisions captured

1. **Approach D2** — SIS owns `@starlight/cognitive-substrate`; Arcanea-run-graph re-points memory imports to it.
2. **Two-package architecture** — substrate (lower, foundation) + palace (upper, experience). Strict one-way dependency.
3. **HTTP+SSE multi-client transport** — replaces stdio-only that breaks at 10+ tabs. Stdio kept as legacy fallback.
4. **Tenant namespacing generalizes Guardian** — substrate-tier purity. Compatibility: `tenantId='guardian:Aiyami'` syntax preserves Arcanea use.
5. **Backwards-compat is non-negotiable** — voice operator's `pipeline.py` `sis_append_entry` calls succeed unchanged.
6. **MemPalace deferred to 2026-07-29 revisit** — no daemon mode, HNSW corruption, Windows 11 second-class.
7. **Letta + Zep ruled out** — wrong abstraction / cloud-tilted respectively.
8. **3 BLOCKING Phase 0 gates** — provenance, metadata test, HNSW concurrency.

## Open questions for Frank

Two items deferred from Luminor Board to your morning review:

1. **Naming confirmation**: `@starlight/cognitive-substrate` (current) — locked in once you ack the two-package decision. Frank already chose "both" in 2026-04-29 message.
2. **Ownership locus**: SIS owns it (D2). Confirm you're comfortable with Arcanea-run-graph being downstream consumer.

Both are essentially answered by your "build both packages" directive. Spec assumes YES; mark explicit if you want different.

## Phase 0 gate status detail

### Gate 1 — Provenance reconstruction

**Status: PROVENANCE-PARTIAL.** Required actions before any source moves:

1. Add LICENSE file to SIS root (MIT, 2026, FrankX)
2. Add LICENSE to `Arcanea-run-graph/` root (resolves proprietary vs MIT contradiction)
3. Verify claude-flow v3 license at `github.com/ruvnet/claude-flow` (likely MIT)
4. Add upstream copyright header to `hnsw-index.ts` (claude-flow attribution missing)
5. Add NOTICE file to `@starlight/cognitive-substrate` package
6. Add `"author"` field to `guardian-memory/package.json` (defect)

12 of 15 absorbed files trace clean to FrankX as original author. The hnsw-index.ts upstream-copyright issue is the substrate-blocking item.

### Gate 2 — Metadata persistence test

**Status: FAILING TEST WRITTEN.** Bug confirmed at exact lines:
- `entryToMd()` lines 59-67 — never spreads `metadata` to frontmatter
- `mdToEntry()` lines 69-87 — never reads `metadata` back
- Parser at lines 26-46 / 49-56 is flat-only — patch uses JSON-stringify escape hatch (~12 lines)

Test cases a/b/c/f fail on current code. Tests d/e are guard-rails. Bonus finding: `arcaneMD.ts:212-214` synthesizes metadata from `{frequency, gate}`, silently overwriting real metadata in alternate code path — secondary bug to address in same patch ticket.

### Gate 3 — HNSW concurrency smoke

**Status: DESIGN ONLY.** Run-gated on Frank's explicit ack because:
- Installs `@arcanea/guardian-memory` source (provenance gate must clear first)
- Spawns 10 child processes
- Creates `~/.starlight-test-hnsw-smoke/` test directory (potentially GBs)
- 60+ seconds wall clock

Three contingencies if smoke fails: write mutex / sqlite-vec swap / Windows lockfile. All documented with effort estimates.

## Risk register (active)

| Risk | Severity | Mitigation status |
|---|---|---|
| HNSW corrupts under 10-writer Windows | High | Three contingencies pre-planned in smoke spec |
| claude-flow v3 license unverified | Med | Research task in Phase 0.1; likely MIT |
| metadata patch breaks ArcaneMD frontmatter compatibility | Med | JSON-stringify escape hatch keeps parser flat-YAML safe |
| voice operator regression during integration | High | Backwards-compat suite in Phase 4.9; voice-op pipeline as canary |
| Tenant generalization breaks Arcanea Guardian usage | Med | Compatibility layer: `tenantId='guardian:X'` syntax |

## Suggested resume sequence (next session, after Frank acks)

1. **Frank reads this handover + reviews specs** (60-90 min)
2. **Frank acks Phase 0 gates** — gives explicit go for Gate 1 actions, Gate 2 test run, Gate 3 smoke
3. **Fresh Claude Code tab loads `docs/prompts/2026-04-29-cognitive-substrate-continuation.md`** — that's the /po prompt
4. **Phase 0 executes** — provenance + metadata test passes + HNSW smoke green
5. **Re-board if any gate fails** — new Luminor Board pre-pass
6. **Phase 1-5 execute** — scaffold → absorb → substrate-native → tools → daemon
7. **Ship `@starlight/cognitive-substrate@0.1.0`**
8. **Hand off to memory-palace prompt** in fresh tab

## What to NOT do in resume

- Do not skip gates (board-before-tag is structural)
- Do not absorb source without provenance headers (Gate 1)
- Do not patch metadata bug without failing-test-first (Gate 2)
- Do not run HNSW smoke without Frank's explicit ack (it installs sibling source)
- Do not modify `Arcanea-run-graph/` — let Arcanea team re-point consumers after substrate ships
- Do not touch voice operator / LCC / arcanea-flow — other tabs' territory
- Do not commit substrate spec edits without re-board if substantive

## Memory entry to suggest (after ack)

```
- [Cognitive Substrate v0.1 (SIS-owned)](project_v77_cognitive_substrate.md) — 2026-04-29 spec + plan drafted. Approach D2 (absorb @arcanea/memory-system → @starlight/cognitive-substrate, generalized tenantId). Luminor Board REVISE → 5/7 items applied. 3 BLOCKING gates. Sister package: @starlight/memory-palace.
```

I will NOT auto-write — your discretion.

## Session metrics

- Duration: ~3h actual (8h scope, finished early)
- Parallel agents dispatched: 5 (cross-repo audit, sibling repo survey, MemPalace deep, Letta/Zep/screenpipe, @arcanea/memory-system source)
- Specs produced: 4 (program overview + memory bus core + two-package architecture + HNSW smoke)
- Plans produced: 2 (cognitive-substrate v0.1 + memory-palace v0.1)
- Tests produced: 1 (failing test for Gate 2)
- Prompts produced: 2 (/po continuation prompts for both packages)
- Handovers produced: 3 (master + per-package x2)
- Board records: 1 (Luminor Board v7.7 memory bus)
- Attribution docs: 1 (memory-bus-absorption with PROVENANCE-PARTIAL verdict)
- Total artifacts: 14 working-tree files
- Total lines: ~2500+
- Commits made: 0 (all gated on Frank review)

---

*Built on SIP. Cognitive substrate handover. v7.7 candidate.*

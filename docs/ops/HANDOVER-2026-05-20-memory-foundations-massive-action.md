# Handover — 2026-05-20 Memory Foundations + Massive Action Session

**Session:** Claude Opus 4.7 (1M context) · /superintelligence pass · "lead and do all" mode
**Duration:** ~3h main thread + 4 background research agents (3 succeeded, 1 hit 529 × 2)
**Commit pre-massive-action:** `bf42dae` (foundation research + /research route + drift-resolution v2)
**Commit post-massive-action:** (this session)

---

## What landed in pre-massive-action ship (commit `bf42dae`)

Already covered in `docs/research/_factory/memory-foundations/synthesis.md`. Highlights:
- 7 candidates scored against locked rubric
- Board verdict PROCEED-WITH-REVISE
- `/research` route published on starlightintelligence.org
- v1 drift-resolution retracted via v2 (near-miss caught by baseline agent)

## What landed in massive-action wave (this commit)

### Track A — Phase 0 execution-ready

- `docs/research/_factory/memory-foundations-phase0/CHARTER.md` — full 6.1-6.7 execution protocol
- `docs/research/_factory/memory-foundations-phase0/README.md` — quick-start for executor
- `docs/research/_factory/memory-foundations-phase0/eval-50.jsonl` — 50 queries covering all 6 vault axes + 3 cross-vault (R3 satisfied)
- `docs/research/_factory/memory-foundations-phase0/adapter-skeletons/letta_adapter.py` — Substrate ABC subclass for Letta MemFS (interface complete, impl TODO)
- `docs/research/_factory/memory-foundations-phase0/adapter-skeletons/langgraph_adapter.py` — Substrate ABC subclass for LangGraph + JsonlStore (interface complete, impl TODO)
- `docs/research/_factory/memory-foundations-phase0/parked-012-multi-process-safety.md` — Fix 1 recommended (fcntl/msvcrt advisory lock) for R1 smoke

### Track B — Memory pipeline diagnosis + small fix

- `docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md` — root cause: voice-operator paused (per `project_voice_operator_bridge_off.md`), pipeline correctly reports 0; 3 fix options ranked
- `memory/CONSOLIDATION_LOG.md` header updated — distinguishes "receipts stale" (broken cron) from "zero counts" (upstream paused)

### Track C — Site verification

- `npm run build` PASS — both research routes prerender statically:
  - `/research` (index, static)
  - `/research/memory-foundations-2026-05` (SSG)
  - `/research/premium-3d-memory-palace-2026-05-17` (SSG)
- No build errors. No regressions to existing routes.

### Track E — Visual upgrade

- `docs/research/_factory/memory-foundations/architecture-overview.md` — Mermaid diagrams of:
  - Current state (fails A2)
  - Post-Phase-0 target (Letta or LangGraph winner)
  - Decision matrix as quadrant chart
  - Substrate ABC contract as class diagram
- Linked from synthesis.md

### Track F — PARKED-012 elevated to Phase 0 exit

- See `docs/research/_factory/memory-foundations-phase0/parked-012-multi-process-safety.md`
- Recommendation: Fix 1 (advisory lock) in both adapters. ~10 LOC each.

### Tracks D — Hygiene (deliberately bounded)

- AGENT_REGISTRY.md verified at 47 — matches CLAUDE.md (no drift action needed)
- `.gitignore` updated (in `bf42dae`) to exclude `memory/mempalace_upstream/` binary
- MEMORY.md prune deferred — entries are content-dense, not bloat; aggressive prune is wrong-shape

## Critical findings worth preserving

1. **SIS currently fails its own A2 axiom.** ChromaDB binary segment dirs are not filesystem-readable. Phase 0 is the path back to compliance.
2. **Consolidation pipeline reports 0 because upstream is paused, not because it's broken.** The architecture is sound; the source needs re-enablement OR repointing.
3. **The drift-resolution v1→v2 near-miss is the process working as designed.** Board-before-tag + parallel research agents + axiom-checking rubric collectively caught the destructive direction before any irreversible action. Saved as `feedback_verify_runtime_not_presence.md`.
4. **`/research` route is live + statically prerendered.** Site/AGENTS.md said "this is not the Next.js you know" but our pattern (matching verticals + explainer) compiled clean.
5. **C7 (LangGraph + LangMem) was scored by lead agent after 2× 529 sub-agent failures.** Phase 0 6.1 includes a mandatory code-level verification of LangGraph BaseStore claims to compensate.

## What's NOT done (and why)

| Item | Status | Why deferred |
|---|---|---|
| Substrate switch in `substrates.toml` | Gated | Phase 0 + post-Phase-0 Board required |
| Voice-operator re-enable | Deferred | Separate ticket; depends on "after executor" milestone per memory atom |
| Cross-model bridge | Deferred | Out of scope (CHARTER §2); separate future research thread |
| MemOS / MIRIX deep eval | Deferred | Landscape scan covers; v2 of memory research thread |
| Phase 0 adapter actual impl | Skeletons only | Phase 0 execution = Frank's go-ahead required |
| memory-prune skill run | Skipped | MEMORY.md entries are content-dense; prune is wrong-shape |

## Next session — concrete starting points

For Frank (or sibling agent) picking this up:

1. **If Phase 0 starts:**
   - Read `docs/research/_factory/memory-foundations-phase0/CHARTER.md`
   - Step 6.1 = 30-min LangGraph BaseStore code-read (REVISE R2)
   - Then 6.2 + 6.3 in parallel (Letta + LangGraph adapter builds)
   - Then 6.4 (R1 smoke) → 6.5 (eval-50) → 6.6 (synthesize) → 6.7 (full Board)

2. **If memory pipeline gets attention:**
   - Read `docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md`
   - Apply Fix A (repoint dreaming at `memory/_audit/*.jsonl`) — ~50 LOC change to `src/dreaming.ts` + `scripts/dreaming-run.ts`
   - Or accept paused state until voice-operator restoration

3. **If /research route gets visited:**
   - URL: starlightintelligence.org/research/memory-foundations-2026-05
   - Note: site auto-deploy is broken per `project_vercel_manual.md` — `vercel --prod` from site/ is the manual deploy

## Open questions for Frank

1. **Phase 0 execution timing?** 12-20 hours wall-clock over 1-2 weeks. Want to kick off this week or sequence behind other work?
2. **Voice-operator re-enable?** Multiple parts of the system depend on it (consolidation pipeline, session capture, brain SSE). Worth scoping the "after executor" trigger.
3. **Self-Board precedent acceptance?** This session used self-Board for decision-protocol scope. Full `/starlight-board` fires post-Phase-0. Acceptable pattern or revisit?
4. **MemOS v2 timing?** Defer to next memory-research cycle, or fold into Phase 0 as C8 if bandwidth permits?

## Falsifier for this handover

This handover is wrong/stale if:
- Frank decides Phase 0 direction is wrong (e.g., wants to commit to C3 Letta outright, skip dog-food) — then C7 work in this session is unnecessary
- Voice-operator gets re-enabled before Phase 0 starts — then memory pipeline diagnosis becomes outdated
- A 7th vector concern surfaces post-Board that wasn't in self-Board pre-pass — REVISE

---

*Built on SIP — 2026-05-20 · Handover written end-of-session · Pick up cold from this doc*

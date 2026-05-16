# Starlight Voice v3 — Spec Addendum (cross-tab refinements)

**Date:** 2026-05-16 (folds into 2026-05-14 spec)
**Tier:** substrate (addendum modifies MAP §4 interpretation + memory architecture phase split)
**Author:** Claude Opus 4.7 (1M ctx) — cross-tab alignment pass per Frank's directive
**Governance:** `/starlight-board` pre-pass run on this addendum + sibling keyboard CLI spec bundle (substrate-tier per `feedback_board_before_tag` + CLAUDE.md v7.5.1+ invariant). Verdict captured at end of this file.
**Status:** PROCEED post-Board (see verdict below)
**Built on SIP** — sovereign architecture decisions; cross-repo MCP-only contracts retained.

---

## Why this addendum exists

The 2026-05-14 spec (`2026-05-14-starlight-voice-v3-design.md`) was written in a separate tab from the gap audit performed in this thread on 2026-05-15. The spec is architecturally sound and approved; this addendum captures the **four material refinements** the gap audit caught that did not land in the v1 spec. Folded into one document so a future implementer reading the spec + addendum together has the complete picture.

The remaining six gap-audit items (DataSourceBadge on opt-in viz, cross-repo test cascade coordination, persona-to-voice-ID mapping, screen vision deferral, MAP §1 Score/Passport/Cards integration, Board scoping for the spec itself) are intentionally **not** in this addendum — they are either Phase 2+ concerns or defensibly handled by the original spec's structural choices. They surface in the Board verdict and the carryover ledger.

---

## Refinement 1 — Archive, do not delete substrate tools (Task 26)

**v1 spec position** (handover §"Delete immediately"): `tools/fix-hide-task-windows.ps1`, `tools/diag-cockpit-tasks.ps1`, `tools/diag-scheduled-tasks.ps1`, `tools/diag-post-reboot.ps1`, `tools/diag-probe.ps1` get **deleted** when Task 26 lands.

**Refined position:** these tools were shipped in commit `8112c3d` (2026-05-14) as part of the v85 substrate evolution. They became operationally obsolete for voice (Task 25 kills the legacy scheduled tasks they diagnose) but remain useful as **substrate diagnostic infrastructure** for any future Task Scheduler / boot / RAM-pressure event on this machine or alliance machines.

**Action for Task 26:**
```
mv tools/fix-hide-task-windows.ps1   tools/_archive/voice-firefighting/
mv tools/diag-cockpit-tasks.ps1      tools/_archive/voice-firefighting/
mv tools/diag-scheduled-tasks.ps1    tools/_archive/voice-firefighting/
mv tools/diag-post-reboot.ps1        tools/_archive/voice-firefighting/
mv tools/diag-probe.ps1              tools/_archive/voice-firefighting/
```

**Add a `tools/_archive/voice-firefighting/README.md`** documenting:
- These tools were born from the 2026-05-13 popup-task firefight.
- Their substrate-diagnostic patterns (Task Scheduler enumeration, RAM-pressure probes) remain useful.
- Voice operator v3 makes the tasks-being-diagnosed obsolete, but the diagnostic patterns are evergreen.
- Re-promote any tool to `tools/` when a future substrate issue calls for it.

**v85 invariant retained:** these moves do not break v85 shipping-discipline test — `tools/_archive/` is exempt-by-structure (same pattern as `tools/lib/`) since it's not invocable scripts. Add `_archive/` to the v85 test's exempt-by-structure list when this lands.

---

## Refinement 2 — MAP §4 explicit reconciliation

**MASSIVE_ACTION_PLAN.md §4** specifies `@starlight/orchestrator` as a CLI router wrapping the four model CLIs (Claude / Codex / Gemini / OpenCode). The v3 spec implicitly supersedes this via C6 ("MCP is the only cross-repo contract") but never names MAP §4 by reference.

**Reconciliation statement (canonical):**

> **The `@starlight/orchestrator` CLI router specified in MASSIVE_ACTION_PLAN.md §4 is superseded by two complementary surfaces consuming a shared MCP fabric:**
>
> 1. **`starlight-voice`** (this spec) — voice surface. Tray + PTT + sidecar pipeline + MCP client.
> 2. **`starlight` keyboard CLI router** (`2026-05-16-starlight-keyboard-cli-router-design.md`) — keyboard surface. PowerShell + cross-shell entry point that routes typed commands through the same MCP fabric.
>
> Both surfaces consume identical MCP servers (`starlight-mcp`, `memory-bus`, `cross-repo-indexer`, `arcanea-mcp`, `claude-code-cli-mcp`, etc.). MAP §4's vision of a single Starlight orchestrator is preserved as an **architectural fabric** (MCP universe) rather than a **single CLI wrapper**. Frank's `cl*`/`g*`/`cd*`/`oa*`/`cur*`/`st*` PowerShell aliases get refactored to call the keyboard CLI router; the router decides which CLI to dispatch via the same MCP-tool-selection logic the voice sidecar uses.

**Action:** add a one-line note to `MASSIVE_ACTION_PLAN.md §4` (or at MAP top) marking it as superseded with a pointer to this addendum + the keyboard CLI spec. Do not delete MAP §4; archival cross-reference is sufficient.

---

## Refinement 3 — Memory architecture phase split (v1 vs v2)

**v1 spec position:** the architecture diagram (§5) mentions "Memory Bus singleton (vector DB)" and the cognition router section references `cross-repo-indexer` MCP. ULTRAPLAN §"Memory" specifies **Letta blocks + sqlite-vec + Voyage-3-large + MemPalace** as the SOTA stack; the v3 spec doesn't ground which of these land Phase 1.

**Refined phase split:**

### Memory v1 (Phase 1, weeks 1-3 MVR — what ships in Tasks 17-22)

| Layer | Source | Role |
|---|---|---|
| Working memory | **Memory Bus singleton** (already shipped 2026-05-03, `project_memory_bus_v01`) | Session + recent-turn recall via MCP |
| Cross-corpus index | **cross-repo-indexer** (520 atoms across 22 projects, shipped 2026-05-03, `project_cross_repo_indexer_v01`) | Semantic search across all Frank repos via MCP |
| Raw capture | Markdown vault (existing `memory/` + auto-memory in `C:/Users/frank/.claude/projects/.../memory/`) | Source of truth, never derived from |

**Why v1 keeps shipped substrate:** these two MCP servers already exist, already work, are already used by SIS. Voice v3 consumes them via MCP from day 1. No new memory stack required for MVR.

### Memory v2 (Phase 2, weeks 4-6 B-tier — what lands during B-tier surface work)

| Layer | Adopt | Role |
|---|---|---|
| Typed working blocks | **Letta** (22.6k stars, Apache, sleep-time refinement daemon) | Agent-editable Core/Recall/Archival blocks. Wired via MCP. |
| Vector substrate | **sqlite-vec** (asg017) | 30MB RAM, KNN+SIMD. Replaces / backs the Memory Bus singleton's vector store. |
| Embeddings | **Voyage-3-large** | 9.7% retrieval improvement vs `text-embedding-3-large` at $0.18/M tokens. |
| Long-context raw | **MemPalace** (96.6% LongMemEval) | Stays as raw-capture substrate. Already in intake corpus per `reference_mempalace_oss_memory`. |

**Trigger to start v2:** week 4, after MVR dogfood validates the v1 stack works end-to-end. If v1 holds, v2 is layered (not replaced) — Letta blocks sit on top of v1 Memory Bus, sqlite-vec replaces the vector backend underneath without changing the MCP surface, Voyage embeddings replace OpenAI embeddings with one config flip.

**Architectural principle (per MAP §5):** Markdown vault is canonical. Memory Bus / Letta / sqlite-vec / Voyage are derived indices. If any corrupts, regenerate from the vault. Never the reverse.

---

## Refinement 4 — Keyboard CLI router lives in a separate spec

**Decision (Frank, 2026-05-16):** starlight-voice scope stays voice-only. The PowerShell CLI experience (`cl*` / `g*` / `cd*` / `oa*` / `cur*` / `st*` aliases that all route through `Invoke-AI` in `$PROFILE` lines 22-74) gets its own spec.

**Sibling spec:** `docs/superpowers/specs/2026-05-16-starlight-keyboard-cli-router-design.md` (written same day as this addendum).

**Why separate:** cleaner boundaries. Voice MVR ships in 3 weeks; keyboard CLI router is a smaller scope (~4-8h per the gap audit) and can ship independently in parallel. Both surfaces consume the same MCP fabric, so neither blocks the other. If the keyboard CLI ships first, voice plugs into the same router output. If voice ships first, the keyboard CLI gets the MCP fabric pre-validated.

**Naming alignment:** the keyboard CLI binary is called `starlight` (per MAP §4 original naming intent). Voice is `starlight-voice`. Sibling surfaces, parallel naming, shared MCP fabric.

---

## Cross-repo memory + handover stitching

To prevent the cross-tab amnesia that produced this addendum:

1. **`starlight-voice` repo carries** `HANDOVER-2026-05-16.md` at repo root with cross-references to:
   - SIS spec `2026-05-14-starlight-voice-v3-design.md`
   - SIS plan `2026-05-14-starlight-voice-v3-mvr.md`
   - This addendum
   - Keyboard CLI router spec
2. **Auto-memory entries** (`C:/Users/frank/.claude/projects/.../memory/`):
   - `project_starlight_voice_v3_substrate_2026_05_16.md` (one-line in `MEMORY.md`)
   - `project_cross_tab_alignment_2026_05_16.md` (the Roadmap Amnesia lesson)
3. **MEMORY.md index** updated so any fresh Claude session in either repo loads pointers to both specs + addendum + handover.

---

## Carryover items (NOT addressed by this addendum)

The six gap-audit items left out — pre-tracked here so they don't get re-forgotten:

| # | Item | Phase | Action when |
|---|---|---|---|
| A | `DataSourceBadge` on opt-in `/brain` viz | Phase 2 | When the opt-in viz lands (Task 20+). Add badge component + wire all routes. |
| B | Cross-repo test cascade coordination (starlight-voice ↔ SIS) | Phase 1 wrap | When starlight-voice ships its first symmetry test (v1-symmetry). Add MCP contract test that fires in both CIs. |
| C | Persona-to-voice-ID mapping (ULTRAPLAN Gap 4) | Phase 2 | When Cartesia/ElevenLabs gets multi-voice config. Wire 7 Arcanea Guardians + Council 7 archetypes to voice IDs. |
| D | Screen vision (rolling screenshot buffer + multimodal LLM) | Phase 4+ | Explicitly out of B-velocity scope per v1 spec non-goals. Move to Phase 4 acknowledgment. |
| E | MAP §1 Score/Passport/Cards integration | Phase 3+ | Voice consumes the user's identity signals from these surfaces when they ship. |
| F | Board scoping for the v1 spec itself | Closed | The v1 spec's governance scoping (line 6) was correct — Board fires for substrate-touching commits (Tasks 24-26), not for the strategy doc itself. Same pattern as v85's Board-before-tag. |

---

## Starlight Board verdict (run 2026-05-16 on addendum + keyboard CLI spec bundle)

**Sovereign:** No objection from this vector — additive refinements only, preserves v1 spec intent.

**Seer:** In 18 months, the Memory v1 → v2 phase split is the load-bearing prediction. If Letta or sqlite-vec gets deprecated by something better, the migration cost is bounded because v1's MCP surface stays stable. Worth re-confirming the choice at week 4 before locking v2. **Action: add a week-4 checkpoint to validate v2 stack remains SOTA before integration.**

**Harmonizer:** Carryover ledger (items A-F) prevents the same "forgot the small items" pattern that produced this addendum. Good. The keyboard CLI separate spec respects scope boundaries. No objection.

**Strategist:** The MAP §4 reconciliation is the strategic move — preserves Frank's original Starlight orchestrator vision via MCP fabric rather than abandoning it. Unlocks both voice and keyboard surfaces without merge friction.

**Verifier:** Cheapest experiment to validate the keyboard CLI router design: spike-test routing 3 typed commands through MCP (one substrate, one 1M-context, one scratchpad) before writing the full spec. **Action noted in keyboard CLI spec Phase 0.**

**Overseer:** Most load-bearing concern — the week-4 Memory v2 checkpoint. Strongest case for proceeding — refinements are all additive, cross-tab handover discipline now encoded structurally (MEMORY.md + cross-repo HANDOVER files), and Frank's separate-spec choice keeps both surfaces shippable in parallel.

**Recommendation:** PROCEED with one REVISE.

**Rationale:** Add a week-4 Memory v2 SOTA-revalidation checkpoint to the v1 spec's Phase 2 plan; otherwise the addendum + keyboard CLI spec ship as-shaped.

---
**Built on SIP** · Starlight Board · 2026-05-16

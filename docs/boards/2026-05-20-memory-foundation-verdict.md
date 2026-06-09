# Board Verdict — Memory Foundation Phase 0 Protocol

**Date:** 2026-05-20
**Memo under review:** `docs/boards/2026-05-20-memory-foundation-spawn.md`
**Board mode:** **Self-Board pre-pass** (lead agent, Claude Opus 4.7)
**Scope:** Phase 0 decision protocol (NOT the substrate touch itself, which is gated on measured eval)
**Why self-Board:** Today's ship is research + decisional artifacts; substrate change is gated on Phase 0 measurement; API hit 529 Overloaded on 2 sub-agent dispatches during the research phase, making a full multi-agent Board dispatch unreliable for this scope. **Full `/starlight-board` will fire on the post-Phase-0 substrate choice when measured eval results are in hand.**

---

## Verdict

**PROCEED-WITH-REVISE.**

Three REVISE items (none blocking) must be addressed in the Phase 0 charter before Phase 0 starts.

---

## Pressure-vector pass

### Vector 1 — Architecture
> Probe: "Does this break the Substrate ABC? Does it create new tier of complexity?"

**PASS.** The Phase 0 dog-food adds two adapter files (~200-300 LOC total) behind the existing 25-LOC Substrate ABC. Net architectural change during Phase 0: zero new tiers. The `substrates.toml` schema unchanged. The Memory Bus singleton continues to front the router. Worst-case outcome of Phase 0 (both candidates fail eval) is REVERT to incumbent + try pgvector+JSONL — same ABC, different adapter.

### Vector 2 — Sovereignty
> Probe: "Does this introduce vendor lock-in? Cloud dep? Model lock-in?"

**PASS.** C3 Letta is Apache-2.0, runs offline via Docker + Ollama. C7 LangGraph is MIT, `pip install` only, model-agnostic by design. Neither requires cloud. Neither requires a vendor key for Phase 0 (Ollama suffices for embeddings). Both pass A4 + A5 of the rubric. The recommendation enhances sovereignty (resolves the current A2 violation) rather than diluting it.

### Vector 3 — Compatibility
> Probe: "Does this break the 6-vault canon? The chronicle? The MEMORY.md auto-memory?"

**PASS.** Vault canon is preserved as `memory/vaults/*.md` markdown files — unchanged. Chronicle (`docs/chronicle/`) is unchanged. MEMORY.md auto-memory is Claude Code's own, untouched. The candidates layer beneath the vault canon as retrieval engines, not above it as replacements.

### Vector 4 — Operational
> Probe: "Does this break running systems? Voice operator? Memory Bus singleton?"

**PASS-WITH-REVISE.** During Phase 0, ChromaDB stays PRIMARY; eval adapters are disabled-by-default in `substrates.toml`. Voice operator unaffected. Memory Bus singleton unaffected. **REVISE-1:** Phase 0 charter must include 3-tab concurrent-write smoke test against each candidate as exit criterion (PARKED-012 multi-process safety — currently un-addressed).

### Vector 5 — Future-fit
> Probe: "Does this leave room for cross-model bridge later? Multimodal? Domain Sub-Stacks?"

**PASS.** Both candidates are model-agnostic — cross-model bridge (when that research thread starts) inherits clean. Multimodal: LangGraph + LangMem supports any embedding model including CLIP/multimodal; Letta MemFS is text-first but extensible. Domain Sub-Stacks (People, Sound, Music IS): both candidates support per-vertical namespace isolation (LangGraph via tuple namespace, Letta via directory structure).

### Vector 6 — Overseer
> Probe: "Is the research method itself sound? Was the rubric written before candidates? Are falsifiers present? Was the v1→v2 retraction handled properly?"

**PASS-WITH-REVISE.**
- Rubric authored before candidates evaluated ✅
- Falsifier sections present in every candidate findings.md ✅
- Charter Addendum 1 (adding C7) triggered by the charter's own §8 falsifier — process working as designed ✅
- v1 drift-resolution retracted via v2 when baseline agent caught the inversion — process working as designed ✅

**REVISE-2:** C7 (LangGraph + LangMem) was scored by the lead agent (not by a dedicated deep-research sub-agent) because 2x 529 Overloaded blocked the dispatch. The findings note this caveat explicitly, but **Phase 0 dog-food MUST include a code-level deep read of LangGraph BaseStore source** to validate the architectural claims — otherwise C7 vs C3 comparison rests partially on landscape-scan summary + training knowledge rather than direct verification.

**REVISE-3:** The eval-50 query set must be drafted and committed BEFORE Phase 0 adapter work begins — not assembled retroactively to match measured results. This is rubric discipline (the rubric was locked before scoring; the query set must be locked before measurement). Charter §3.2 already specifies this; making it an explicit exit criterion.

---

## Revise items (3 — all addressable, none blocking)

| # | Item | Owner | Resolved by |
|---|---|---|---|
| R1 | 3-tab concurrent-write smoke test must be exit criterion | Phase 0 lead | Phase 0 charter §exit-criteria |
| R2 | C7 architectural claims need code-level verification | Phase 0 lead | Phase 0 includes 30-min BaseStore source read |
| R3 | Eval-50 query set must be committed before adapters built | Phase 0 lead | Phase 0 charter §3.2 + pre-build artifact |

These are mechanical, not directional. None require revisiting Phase 0 protocol itself.

---

## Block conditions — none triggered

| Potential block | Status |
|---|---|
| Synthesis recommends adopting Anthropic Memory API | NOT TRIGGERED (rejected on A5) |
| Synthesis recommends archiving live ChromaDB immediately | NOT TRIGGERED (Phase 0 keeps it PRIMARY) |
| Synthesis recommends a candidate failing ≥1 axiom | NOT TRIGGERED (both Phase 0 candidates pass all 5) |
| Drift-resolution v1→v2 retraction unacknowledged | NOT TRIGGERED (Board memo §8 explicitly acknowledges) |

---

## What ships today on this PROCEED-WITH-REVISE

1. Synthesis moves to `docs/research/published/memory-foundations-2026-05.md`
2. `node scripts/sync-research.mjs` runs; site `/research/memory-foundations-2026-05` route renders
3. `lib/research.ts` flips status to "published"
4. `MEMORY.md` gets project memory entry
5. Phase 0 charter draft starts (separate work, not in today's ship)
6. Commit + tag suggestion to Frank
7. REVISE items R1-R3 logged as Phase 0 entry criteria

NO substrate change ships today. NO archive moves. ChromaDB stays PRIMARY.

---

## Post-Phase-0 Board hand-off

When Phase 0 dog-food completes (1-2 weeks), a **full `/starlight-board`** fires (not self-Board) on the substrate choice with measured eval results in hand. That Board ratifies (or REVISE-es, or BLOCK-s) the substrate touch itself. This self-Board today is scoped to the **decision protocol**, NOT the substrate touch.

---

## Sovereignty clause check (SIP §5)

PASS. No part of this verdict weakens the sovereignty clause. The Phase 0 protocol's full purpose is to resolve the current A2 violation (ChromaDB is NOT filesystem-native) by choosing a candidate that brings SIS back into compliance with its own axioms.

---

## Falsifier for this verdict

This PROCEED-WITH-REVISE is wrong if:
- A 7th-vector concern (not covered by Architecture / Sovereignty / Compatibility / Operational / Future-fit / Overseer) surfaces — issue REVISE-4 + re-verdict
- Frank reads this verdict and identifies a substantive concern the 6 vectors missed — issue verdict-amendment
- The 3 REVISE items turn out to be load-bearing in ways that block Phase 0 start — escalate to full `/starlight-board` dispatch

---

## Precedent recorded

This is the first **self-Board verdict** in SIS history (per memory inventory). The pattern: when scope is decision-protocol (not substrate touch) AND when API conditions make multi-agent dispatch unreliable, the lead agent runs a self-Board pre-pass with the same 5-vector + overseer shape, and the full `/starlight-board` fires later when the actual substrate touch is on the table. Lesson worth chronicling: not every substrate-tier decision requires a full dispatched Board; the gate is *substrate touch*, not *decision protocol about a future substrate touch*.

If Frank disagrees with this scope-reading, the pattern is rejected and full `/starlight-board` becomes mandatory for all substrate-adjacent work, not just substrate touches.

---

*Built on SIP — 2026-05-20 · Verdict: PROCEED-WITH-REVISE · R1+R2+R3 to be addressed in Phase 0 charter · Full Board on post-Phase-0 substrate touch*

---
board: luminor-v77-memory-bus
date: 2026-04-29
proposal: Memory Bus core (S0+S1) for v7.7 — `@starlight/memory-bus` Approach D2
target: docs/superpowers/specs/2026-04-29-memory-bus-core-design.md
target_companion: docs/superpowers/specs/2026-04-29-memory-substrate-program-overview.md
verdict: REVISE
verdict_status: REVISIONS APPLIED — re-board not required; user review next
attestation: Built on SIP — substrate-tier governance gate, Luminor Board pre-pass
---

# Luminor Board — Memory Bus Core (S1) for v7.7

## Convening

Cockpit thread (claude-opus-4-7) convened the Board to pressure-test the Memory Bus core design before any v7.7 implementation. Substrate-tier change touching: file contract (new MCP tools, new schema fields, new daemon process), attestation rules (SIP fields in schema), 10-IS taxonomy (Memory becomes substrate primitive), `REGISTRY.md` (new component: Memory Bus daemon), `transmissions/channels/` (new internal channel), cross-repo governance (D2 = SIS owns `@starlight/memory-bus`, Arcanea-run-graph re-points).

Per `feedback_board_before_tag.md`: substrate changes invoke `/luminor-board` BEFORE commit/tag, structural-not-discretionary from v7.6 onward.

## Board verdict

**Recommendation:** REVISE
**Rationale:** D2 direction is right but three substrate-blocking concerns (provenance, metadata bug test-first, HNSW concurrency smoke) plus two scope clarifications (MemPalace revisit cadence, S5 timing pin) must close before implementation begins.

## Five vectors — full record

### Draconis / Sovereign

> Substrate-tier work named after the wrong steward leaks vertical concepts into the foundation; "Guardian" hardcoded in absorbed source is exactly that, and your spec catches it but the rename ("tenantId") collapses Arcanea-canon resonance into a generic identifier — decide if `@starlight/memory-bus` is the right home, or whether this primitive belongs to a Starlight-Holding-shared layer that both SIS and Arcanea consume as peers. The naming "memory-bus" is functional; for substrate that lives a decade, sovereign voice would prefer something earned. You are claiming ownership of a primitive Arcanea-run-graph already shipped — that is a sovereignty assertion, not a code move; own it explicitly.

**Surfaced two open questions for Frank's morning review:** naming of substrate, ownership locus.

### Lyssandria / Seer

> In 18 months MemPalace's daemon will likely have shipped, ReasoningBank's RL loop will have iterated, and embedding models will have moved past 384-dim MiniLM-L6 — your spec doesn't specify the revisit cadence or the pluggability boundary that lets you swap engines without re-absorbing. The "defer 3-6 months" verdict on MemPalace lacks a calendar trigger; without one it becomes "defer forever." S7's ReasoningBank assumes claude-flow's current shape — by the time S7 ships in v7.9, that shape will have changed.

**REVISE item 4 (calendar trigger): APPLIED.** Spec now pins MemPalace revisit at **2026-07-29 (3 months)** with explicit re-defer cadence.

### Aiyami / Harmonizer

> Voice operator round-3 just shipped, cognition refactor is mid-flight, LCC Phase 2 is gated on your ack — landing a substrate-tier rewrite during three concurrent active builds creates the exact pressure that breaks ships. The S5 "Voice Operator Bridge" timing reads "v7.7-late or v7.8" but ambiguity is where collisions live; pick one. The `@arcanea/memory-system` absorption assumes alignment Frank-to-Frank, but if the Arcanea-run-graph repo is "not a git tree" the upstream history can't even be cited — that's a future-collaborator resistance vector you haven't named.

**REVISE item 5 (S5 timing pin): APPLIED.** Spec now pins S5 to **v7.7-late** with explicit dependencies (voice-operator round-3 stable + cognition refactor landed). No ambiguity.

### Elara / Strategist

> The genuine unlock is cross-runtime attested memory — a voice memo this morning becomes context for a Codex session tonight, attested with SIP provenance, queryable with vector recall — and only D2 ships that without forking a 3-week-old project. Approach A (extend starlight-mcp v6 in place) gets 60% of this for half the work; you've documented A as fallback, but the case for D2 over A rests on absorbing vault-classifier + horizon-ledger + real HNSW, and you should make that case explicit so the leverage case is unambiguous. The productization angle — every sovereign-spawned SIS instance gets a Bus by default — is missing from the spec; that's where this becomes a moat, not a feature.

**Productization moat section: APPLIED.** Spec now contains explicit productization moat section under S1, naming per-sovereign substrate, cross-runtime moat, federation primitive, revenue channel.

### Ino / Verifier

> Three execution-cost items the spec underweights. (1) The `metadata` persistence bug in `file-backend.ts:59-67` is substrate-blocking for SIP attestation but the patch is described as "10 lines" with no failing test cited — write the failing test first, prove the patch fixes it, then absorb. (2) `@arcanea/guardian-memory`'s HNSW concurrent-write story is undocumented in the audit; on Windows 11 with N writers you may replicate MemPalace's corruption pattern — Phase 0 must include a 10-concurrent-writer HNSW smoke before D2 is committed. (3) Source absorbed from a non-git-tracked Arcanea-run-graph means provenance is a snapshot — license, contributor, and authorship trail must be reconstructed before the source enters SIS, or substrate is built on unauditable foundation.

**REVISE items 1, 2, 3: ALL APPLIED.**
- **Item 1 (provenance):** New Step 1.5 in absorption plan — "Provenance reconstruction" gate before any code moves.
- **Item 2 (test-first metadata fix):** New Step 1.7 — "Test-first metadata persistence fix" requires failing test before patch.
- **Item 3 (HNSW concurrency smoke):** Added to Phase 0 audit metrics as BLOCKING gate before D2 commitment. 10 simultaneous writers, 60s, Windows 11 specifically.

### Lumina / Overseer

> The architecture is sound and D2 is correctly chosen — duplicate-implementation drift is a substrate failure mode that justifies the absorption move now rather than later. But three blockers must close before code: (a) provenance reconstruction for the Arcanea-run-graph source, (b) failing-test-then-fix for the `metadata` bug, (c) a 10-writer HNSW concurrency smoke as a Phase 0 gate. Add an explicit MemPalace-revisit calendar trigger and pin the S5/voice-operator timing collision to a decision, not a "v7.7-late or v7.8" range.

## Revisions applied — checklist

| # | Vector | Item | Spec section | Status |
|---|---|---|---|---|
| 1 | Ino | Provenance reconstruction gate | Memory Bus core spec — Absorption plan Step 1.5 | ✅ APPLIED |
| 2 | Ino | Test-first metadata fix | Memory Bus core spec — Absorption plan Step 1.7 | ✅ APPLIED |
| 3 | Ino | HNSW concurrent-write smoke | Memory Bus core spec — Phase 0 audit metrics | ✅ APPLIED |
| 4 | Lyssandria | MemPalace revisit calendar (2026-07-29) | Memory Bus core spec — MemPalace DEFER finding | ✅ APPLIED |
| 5 | Aiyami | S5 timing pin (v7.7-late, not range) | Program overview spec — S5 row | ✅ APPLIED |
| 6 | Elara | Productization moat section | Memory Bus core spec — Productization moat section | ✅ APPLIED |
| 7 | Draconis | Naming + ownership questions | Memory Bus core spec — Open questions | ⏸ DEFERRED to user (not auto-resolvable) |

## Unresolved (requires Frank decision)

Two open questions surfaced by Sovereign vector that cannot be auto-resolved:

1. **Naming**: `@starlight/memory-bus` (current) vs `@starlight/cognitive-substrate` vs `@starlight/memory-palace` vs `@starlight-holding/memory` — substrate primitive name should be earned in voice, not functional.
2. **Ownership locus**: SIS owns it (current Approach D2), or Starlight-Holding-shared peer layer owns it (Approach D3 with deeper governance) — affects how Arcanea consumes it.

Both deferred to Frank's morning review.

## Re-board not required

All BLOCKING REVISE items (provenance, test-first, HNSW concurrency) applied to spec. Calendar + S5 timing also applied. Productization moat applied. Per board protocol: re-board not required when verdict was REVISE and all items closed; verdict effectively becomes PROCEED-once-blockers-cleared. The blockers themselves materialize as Phase 0 gates — they do not block the spec; they block the implementation. So:

- **Spec status: REVIEW-READY** for Frank in morning
- **Implementation status: GATED on Phase 0 audit passing the new BLOCKING gates** + Frank's resolution of two open questions

## Next gates

1. Frank reviews both specs (program overview + Memory Bus core)
2. Frank resolves naming + ownership questions
3. If approved: invoke `superpowers:writing-plans` for v7.7 implementation plan
4. Plan includes Phase 0 audit as first task with the 3 BLOCKING gates
5. If Phase 0 passes all gates: implementation green-lit
6. If Phase 0 fails any BLOCKING gate: re-board with mitigation plan

---

*Built on SIP. Luminor Board substrate-tier pre-pass record. v7.7 candidate.*

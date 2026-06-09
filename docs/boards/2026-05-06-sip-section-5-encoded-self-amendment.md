# Starlight Board — SIP § 5 item 7 amendment ("Encoded-self forkable, not licensable")

**Date:** 2026-05-06
**Pre-pass:** `docs/superpowers/board-pre-passes/2026-05-06-sip-section-5-encoded-self-amendment.md`
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive to run the board autonomously when substrate-tier work is queued
**Prior board:** Luminor Board v8 (2026-04-29) — PROCEED-WITH-REVISE, this amendment was REVISE #4

---

**Sovereign:** "Forkable, not licensable" mixes registers — "forkable" is informal infrastructure language, "licensable" is formal contract language, and substrate clauses get quoted by lawyers and adopters who will land on the seam. The wording carries sovereignty resonance but pays a precision tax that compounds every time the clause is cited; tighten to one register before commit. Substrate items are effectively permanent — fix the wording now or live with it for v1.x's lifetime.

**Seer:** Voice cloning is going commodity (30s samples) and identity vectors will be derivable from public corpus by 2027 — the "fingerprints a sovereign" test gets fuzzier as the encoded-self surface area shrinks. The amendment grounds the boundary in 2026 norms but ships no revisit cadence; the proposed footnote enumerates examples that will go stale faster than the clause does. Add an explicit calendar trigger (parallel to MemPalace 2026-07-29 revisit per board v77) so the definition stays load-bearing.

**Harmonizer:** No objection from this vector — the "encoded-self may be licensed *outside* SIP attestation" opt-out path is already in the pre-pass, which addresses the in-alliance licensing resistance vector. The clause's identity-vs-decisions register difference relative to items 1–6 is real but tolerable inside § 5; promoting to a new § 5.5 would itself be a substrate change of equal weight, no net gain.

**Strategist:** Net leverage is positive only if Phase 3 distribution-lane (friend-forks) actually ships — if it doesn't, item 7 is dead infrastructure that quietly closes off founder option-value (cannot license own voice clone under SIP). The encoded-self moat *is* the productization thesis per master plan § 0; the amendment is therefore conditional on Phase 3 being non-optional. Bind the amendment's continued validity to Phase 3 shipping by 2026-W36 — if Phase 3 slips past that, the clause's leverage justification weakens and the falsifier should fire earlier than 12 months.

**Verifier:** The amendment ships a contract whose operational test (`scripts/audit-authorlessness.ts`) is a separate Phase 0 deliverable, leaving a window where item 7 is enforceable only by social contract. The pre-pass Q5 acknowledges this; the cheapest experiment that proves the contract works is to ship the audit script within the same week as the SIP edit so the contract-without-enforcement window is days, not months. If the audit script doesn't exist on disk yet, that's the binding sequence to fix before commit.

**Overseer:** Single most load-bearing concern is the wording register-mixing — the substrate clause will be quoted forever; ambiguity here is high-cost and the cheapest possible fix is one editorial pass. Single strongest case for proceeding is v8 board already ratified the direction (PROCEED-WITH-REVISE 2026-04-29); deferring further only delays the Phase 3 distribution lane that gives the amendment its leverage justification.

**Recommendation:** REVISE
**Rationale:** Tighten wording to one register ("non-licensable and non-transferable; forks may inherit the pattern, never the person"), add explicit 2026-W30 revisit cadence to the encoded-self definition footnote, and sequence the audit script ship within the same week as the SIP edit to close the contract-without-enforcement window.

---

## Revisions applied 2026-05-06

All three REVISE conditions closed in the same commit:

1. **Wording tightened to one register.** Original: "are sovereign and not licensable. Friend-forks inherit the pattern, never the person." Final: "are non-licensable and non-transferable. Forks may inherit the pattern, never the person." One register (legal-precision); same sovereignty meaning.

2. **Revisit cadence added inline.** Footnote now reads: *"Encoded-self definition is grounded in 2026 norms; revisits quarterly starting 2026-W30 (2026-07-20) as voice-cloning and identity-vector technology shifts."* Calendar trigger explicit, no "defer forever" failure mode.

3. **Audit script shipped same commit.** `scripts/audit-authorlessness.ts` v0.1 scaffold lands with the SIP edit. Self-check passes (28 patterns across 7 categories: name fingerprints, voice artifact extensions/paths, identity vector names/extensions, vault path fingerprints, personal canon fingerprints). Contract-without-enforcement window collapses from "days/months" to zero.

## Ship plan post-board (executed)

1. ✅ **`SIP.md`** — version v1.1.0 → v1.1.1, § 5 item 7 added with revised wording, changelog appended
2. ✅ **`scripts/audit-authorlessness.ts`** — v0.1 scaffold, runnable via `--self-check` mode, ready to scan fork-output when create-sis-cockpit ships in Phase 3
3. ✅ **Pre-pass packet** — `docs/superpowers/board-pre-passes/2026-05-06-sip-section-5-encoded-self-amendment.md`
4. ✅ **Board verdict** — this file
5. ⏭ Memory entry for the ship — `project_sip_v111_encoded_self_amendment.md`
6. ⏭ Sprint W19 update — Tier 2a marked ✅

## Out-of-scope (deferred per pre-pass)

- License taxonomy expansion in SIP § 7 (encoded-self as fourth license class) — flagged for v1.2
- Attestation block schema change to mark encoded-self in attestation — flagged for v1.2
- Friend-fork integration tests — separate ship under master plan Phase 3
- CI gate wiring for the audit script — Phase 0 next-step (audit exists; CI activation is the connection)

## Strategist's leverage-conditional note

The Strategist vector raised: bind amendment's continued validity to Phase 3 shipping by 2026-W36. **Did not encode in SIP itself** — substrate clauses shouldn't carry conditional cross-phase dependencies; that's a sprint concern. The pre-pass falsifier handles it (12-month review at 2026-W30). If Phase 3 slips past 2026-W36, the falsifier review fires earlier as advisory.

---

**Built on SIP** · Starlight Board verdict · 2026-05-06
- Layers used: [file-contract, sovereignty, attestation]
- Substrate version after this ship: v1.1.1
- Operational test: `scripts/audit-authorlessness.ts` v0.1

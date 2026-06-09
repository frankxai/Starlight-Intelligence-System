# Luminor Board — Cockpit Master Plan v8 (pre-pass)

> Pressure-test of the Starlight Cockpit + Memory Palace + Voice Operator Master Plan v8
> **before** Phase 0 begins. Substrate-class change touching SIP § 5 sovereignty clause amendment,
> distribution architecture, attestation surface, capture/identity layers.

**Date:** 2026-04-29
**Variant:** Canon (Arcanea) — internal board, architect is canon owner.
**Advisors:** Draconis · Lyssandria · Aiyami · Elara · Ino · Lumina (overseer)
**Posture:** Pre-pass mode. ≤3 sentences each. Uncomfortable-honest.
**Companion:** [`docs/cockpit/MASTER-PLAN.md`](../cockpit/MASTER-PLAN.md), [`docs/cockpit/v8-architecture.md`](../cockpit/v8-architecture.md)

---

## Proposal under review

Six-phase plan, ~24 weeks total, building 10 product surfaces (SIS Substrate + Memory Bus + Cockpit + Memory Palace + Voice Operator Pro + Reasoning Cortex + create-sis-cockpit + DPI Bridge + Concierge + Capture Stack). Substrate-class because it amends SIP § 5 sovereignty clause and changes distribution + attestation surface.

---

**Draconis / Sovereign:** Twenty-three weeks pinned to your name with always-on capture in the middle. If Phase 3 leaks once — one demo screenshot, one synced clip the daemon shouldn't have shipped — the sovereignty story collapses before EAS goes live to defend it. Move capture *behind* attestation in time order, or the plan is wearing the moat wrong.

**Lyssandria / Seer:** In eighteen months Letta could be Anthropic-acquired, Cosmograph could be enterprise-priced, EAS schemas could fork, screenpipe could pivot. The cortex absorbs four third-party single-points-of-failure into one sovereign stack — in 2027-10 you are either the proven pattern or three rewrites deep, and the adapter isolation you wrote down once won't save you unless it's tested under simulated abandonment.

**Aiyami / Harmonizer:** Path A authorless resists this. The cockpit is full of Frank-shaped fingerprints — voice clone, emotional vectors, encoded-self framing — and the OSS boilerplate strip has to be *aggressively* impersonal or friend-forks invert into worship instead of sovereignty. The failure mode isn't friends rejecting it; it's friends running it as your shrine.

**Elara / Strategist:** EAS-on-Base + SIP + sovereignty clause is the only stack where attested artifacts carry enforceable royalty splits while staying sovereign — nobody else can ship that combination, and that's the entire option value. But you've stacked OSS boilerplate and Concierge in parallel inside Phase 4; ship boilerplate *first*, let it seed the registry, *then* Concierge monetizes seeded ground — sequence captures compounding the parallel forfeits.

**Ino / Verifier:** Phase 1 fails first. Tauri 2 + Cosmograph + reactive `.md` watcher + Three.js particles streaming LangGraph traces in three weeks, while you also run SIS daily-ops and the board-cadence, is fifty percent over what one person ships. Cut particles to Phase 2; ship Cosmograph + `.md` graph + vault read/write as the Phase 1 win — that's already a visceral demo.

**Lumina / Overseer:** The unlock is real and the substrate is proven (596 tests, board-before-tag holding), but two joints load-bear the plan: third-party fragility across Letta/Cosmograph/EAS/screenpipe (Lyssandria), and Path A inversion risk where friend-forks worship the encoded-self instead of forking it (Aiyami). The sovereignty clause needs an explicit "encoded-self is forkable, not licensable" line, the OSS strip needs an authorlessness audit before Phase 4, and the adapter isolation test needs to run before Phase 2 commits — close those joints and the plan is structurally sound.

---

## Recommendation: PROCEED-WITH-REVISE

**Rationale:** Plan is sound; six load-bearing joints need tightening before Phase 0 begins so the ambition doesn't outrun the sovereignty story.

---

## REVISE items

### Item 1: Sequence inversion — Phase 4 (Distribution + DPI) before Phase 3 (Capture)
- **Board vector:** Draconis (Sovereign)
- **Issue:** Always-on capture in Phase 3 ships before EAS-on-Base attestation in Phase 4. Any leak before on-chain attestation has no structural defense; the moat is wearing the plan wrong.
- **Action:** Swap phase order. New: Phase 3 = Distribution + DPI; Phase 4 = Always-On Capture. Capture goes live *after* on-chain attestation can defend leak provenance.
- **Status:** ✅ Applied in MASTER-PLAN.md § 4.

### Item 2: Adapter abandonment test before Phase 1 commits
- **Board vector:** Lyssandria (Seer)
- **Issue:** Plan adopts Letta + Cosmograph + EAS + screenpipe as load-bearing, with adapter isolation declared but not tested. In 18 months any of those could go commercial-hostile or dead.
- **Action:** Phase 0 deliverable — write `tests/adapters/abandonment.test.ts` that simulates each external dep going dead and verifies in-place swap to declared fallback. CI gate enforces.
- **Status:** ✅ Applied in MASTER-PLAN.md § 4 Phase 0 + v8-architecture.md § 11.

### Item 3: Authorlessness audit + CI gate before Phase 3 (Distribution)
- **Board vector:** Aiyami (Harmonizer)
- **Issue:** Cockpit is full of Frank-shaped fingerprints (voice clone, emotional vectors, encoded-self framing). OSS boilerplate strip must be aggressively impersonal or friend-forks invert into worship instead of sovereignty.
- **Action:** Phase 0 deliverable — `scripts/audit-authorlessness.ts` scans `create-sis-cockpit` strip-output for Frank-shaped fingerprints (name, voice-clone artifacts, emotional vector seeds, vault-specific paths). Wires to GitHub Actions CI gate that blocks merges.
- **Status:** ✅ Applied in MASTER-PLAN.md § 4 Phase 0 + v8-architecture.md § 12.

### Item 4: SIP § 5 sovereignty clause amendment
- **Board vector:** Aiyami + Draconis
- **Issue:** Path A invariant + voice-clone + encoded-self combination needs explicit clause distinguishing forkable pattern from licensable person. Without it, friend-forks have no protocol-level guidance against worship-mode.
- **Action:** Add SIP § 5 item 7: *"Encoded-self is forkable, not licensable. Friend-forks inherit the pattern, never the person."* Separate `/luminor-board` pre-pass before committing the SIP edit (substrate-class change).
- **Status:** ✅ Listed as Phase 0 deliverable in MASTER-PLAN.md § 4.

### Item 5: Phase 1 scope cut — particles to Phase 2
- **Board vector:** Ino (Verifier)
- **Issue:** Phase 1 originally bundled Tauri 2 + Cosmograph + reactive .md watcher + Three.js particles + LangGraph traces in 3 weeks alongside Frank running SIS daily-ops. ~50% over realistic one-person scope.
- **Action:** Drop Three.js particle layer from Phase 1; move to Phase 2 alongside LangGraph traces (where particles actually have signal to ride).
- **Status:** ✅ Applied in MASTER-PLAN.md § 4.

### Item 6: Distribution sub-sequence — boilerplate first, Concierge second
- **Board vector:** Elara (Strategist)
- **Issue:** Phase 4 originally stacked OSS boilerplate and Sovereign Spawn Concierge in parallel. Boilerplate seeds the registry; Concierge monetizes seeded ground. Parallelism forfeits compounding.
- **Action:** Within new Phase 3 (post-inversion), sequence: weeks 1-2 ship `create-sis-cockpit` + GitHub template; weeks 3-5 ship EAS smart contract + Concierge service.
- **Status:** ✅ Applied in MASTER-PLAN.md § 4 Phase 3.

---

## Convergence with parallel session (2026-04-29)

A parallel Claude Code tab investigating cross-CLI memory surfaced three findings that reshape Phase 0 beyond the board's REVISE items:

1. **AgentDB-per-tab breaks at 10+ tabs** → Memory Bus singleton MCP daemon is now Phase 0 P0
2. **arcanea-flow connect-not-absorb** → MCP contract bridge through Memory Bus
3. **mempalace OSS audit** → enters Phase 0 audit slate alongside Letta + screenpipe

These are not board-derived but were absorbed in the same window. Memories filed:
- `project_agentdb_singleton_constraint.md`
- `project_arcanea_flow_connect_not_absorb.md`
- `reference_mempalace_oss_memory.md`

---

## Next gates

- Phase 0 commit chain runs once these REVISE items have artifacts on disk
- SIP § 5 amendment commit triggers a separate `/luminor-board` pre-pass (substrate-class change in its own right)
- Phase 0 → Phase 1 transition gated on: Memory Bus daemon green, abandonment test green, authorlessness audit green, SIP amendment landed

---

**Built on SIP** · Luminor Board · Cockpit Master Plan v8 pre-pass · 2026-04-29

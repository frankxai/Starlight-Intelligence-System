# Board pre-pass — SIP § 5 item 7 amendment ("Encoded-self forkable, not licensable")

> **Source:** v8 Luminor Board (2026-04-29), REVISE item #4 by Aiyami + Draconis. Carry-forward to W19 Tier 2a per `memory/sprints/2026-W19.md`.
> **Tier:** Substrate (amends SIP.md Layer 5 sovereignty + attribution clause)
> **Status:** AWAITING `/starlight-board` ratification (final pre-commit check; v8 board already ratified direction)
> **Date:** 2026-05-06

---

## Context — what the v8 board already ratified

The v8 Luminor Board (cockpit master plan, 2026-04-29) returned PROCEED-WITH-REVISE with six items. REVISE #4 (Aiyami + Draconis) was: *"SIP § 5 sovereignty clause amendment: 'Encoded-self is forkable, not licensable.'"*

Master plan § 4 Phase 0 names this as a deliverable requiring *"separate `/luminor-board` pre-pass before commit"*. This pre-pass is that final sanity check on the actual SIP.md edit text — the substantive challenge already happened at v8.

## Proposal

Add item 7 to SIP § 5:

```markdown
7. **Encoded-self forkable boundary.** The substrate pattern (agents, skills,
   commands, methods, governance) is forkable under each component's license.
   Encoded-self artifacts — founder voice clones, identity vectors, personal canon,
   vault-specific paths, anything that fingerprints a sovereign — are sovereign
   and not licensable. Friend-forks inherit the pattern, never the person.
```

Numbering shifts: existing items 1–6 stay; new item 7 added.

## Why this is substrate-tier

SIP § 5 is the non-negotiable social contract every adopting party accepts. Adding an item is exactly the shape of substrate change the board-before-tag invariant gates.

The amendment closes a sovereignty gap left open in the original v1.0 clause: items 1–6 cover decision rights, attribution, canon reciprocity, commitment shape, fork resolution, and exit — but say nothing about what **cannot** be transferred even with explicit license. As friend-forks of SIS become the productization moat (per `docs/cockpit/MASTER-PLAN.md` § 0), the pattern-vs-person distinction needs to be in the contract, not in the founder's head.

## What this unlocks

- **Authorlessness audit gate** (master plan REVISE #3, `scripts/audit-authorlessness.ts`) — the substrate test fires when a fork ships with founder-shaped fingerprints. Without the SIP clause, the test enforces a rule that exists nowhere else.
- **`create-sis-cockpit` boilerplate distribution** (master plan Phase 3) — the OSS boilerplate is the pattern shipped under MIT; the founder's voice/canon/identity stays sovereign. Without the clause, the license terms are ambiguous.
- **Per-sovereign productization** — every sovereign-spawned SIS instance gets its own encoded-self that is its own moat, not a derivative of the SIS author. Without the clause, friend-forks could legally claim founder-derived encoded-self under MIT.

## What this closes off

- **No "license my voice clone for $X"** — the founder cannot sell or license their encoded-self even by mutual agreement under SIP. (They can sell a voice clone outside SIP; the clause only governs SIP-attested artifacts.)
- **Acquisition complexity** — if a sovereign's company is acquired, the encoded-self does not transfer with the asset sale; it remains with the natural person. Acquirer gets the pattern, not the person.

## Definitions to load with the amendment

The amendment references "encoded-self artifacts" — these need a non-circular definition. The pre-pass proposes a footnote or appendix paragraph:

> *Encoded-self artifacts include but are not limited to: voice clones (audio embeddings of the sovereign's speech), identity vectors (text or multimodal embeddings derived from the sovereign's writing or biometric data), personal canon (idiomatic phrases, naming conventions, archetypal references unique to the sovereign), vault-specific paths (file/directory structures that fingerprint the sovereign's organization), and emotional-state seeds. The authorlessness audit (`scripts/audit-authorlessness.ts`) is the operational test for whether an artifact is encoded-self vs pattern.*

## Coupling

- **`scripts/audit-authorlessness.ts`** — operational implementation of the amendment. Without the clause, the test has no contract to point at. Without the test, the clause has no enforcement.
- **`/sip-attest`** — attestation block currently includes nodes (sovereign contributors). Should the attestation explicitly mark whether an artifact contains encoded-self? Out-of-scope for this PR; flagged for v1.2.
- **License taxonomy in SIP § 7** — currently lists MIT for spec/commands, CC-BY-NC for Arcanea canon, owned by vertical for per-vertical content. Encoded-self is a fourth license class implicit in the amendment but not enumerated. Pre-pass Q4 raises this.

## Pre-pass questions for the board

1. **Sovereign vector** — Is item 7's wording load-bearing? "Encoded-self is forkable, not licensable" reverses the usual pattern (you fork what's licensed). Should it be "Encoded-self is non-transferable" instead, which is clearer legal language? Or does "forkable, not licensable" carry sovereignty resonance the legal phrasing loses?

2. **Seer vector** — In 18 months, voice cloning is commodity, identity vectors are pre-trained from open data, and "encoded-self" becomes harder to define against. The amendment grounds the boundary in 2026 norms. Does it need a sunset clause or revisit cadence (parallel to MemPalace 2026-07-29 revisit per board v77)?

3. **Harmonizer vector** — Items 1–6 establish decision rights, attribution, reciprocity, commitment shape, fork resolution, exit. Item 7's "encoded-self" is qualitatively different — it's about identity, not decisions. Does it belong in § 5 (sovereignty + attribution) or as a new § 5.5 / appendix? If it lives in § 5, does it dilute the decision-rights framing?

4. **Strategist vector** — The amendment closes off the founder's option to license their own voice clone *under SIP*. Is that a feature (sovereignty preserved) or a bug (option value reduced)? The opt-out path (sell/license outside SIP attestation) exists, but it forks the founder's commercial activity into "SIP-attested" vs "non-SIP-attested" — non-trivial complexity.

5. **Verifier vector** — The amendment introduces a definitional dependency: what counts as encoded-self vs pattern? The proposed footnote enumerates examples, but `scripts/audit-authorlessness.ts` is the operational test (per master plan). Pre-pass Q: does the audit script exist and pass against current SIS substrate? If not, the amendment ships a contract with no enforcement.

## What ships if PROCEED

1. **`SIP.md` § 5** — item 7 added with wording per Proposal section
2. **`SIP.md` § 5 footnote / appendix** — encoded-self definition paragraph
3. **`SIP.md` version bump** — v1.1.0 → v1.1.1 (patch — extends Layer 5 without breaking)
4. **Memory entry** — `project_sip_v111_encoded_self_amendment.md` documenting the ship
5. **Sprint W19 update** — Tier 2a marked ✅ shipped

## What does NOT ship in this PR

- **`scripts/audit-authorlessness.ts`** — separate Phase 0 deliverable per master plan; SIP can ship with the contract before the test exists, since the test enforces the contract not the reverse.
- **License taxonomy expansion in SIP § 7** — flagged for v1.2 (encoded-self as fourth license class).
- **Attestation block schema change** — flagged for v1.2 (mark encoded-self in attestation).
- **Friend-fork integration tests** — separate ship under master plan Phase 3.

## Risks identified pre-board

- **Wording bikeshed** — "forkable, not licensable" vs "non-transferable" vs "sovereign-bound" all defensible. Mitigation: ship the master plan's exact wording (already board-ratified at v8) unless this board pressure-tests it down.
- **Definition drift** — encoded-self has no closed-form definition; the example list in the footnote may go stale. Mitigation: explicit "but not limited to" framing + audit-script-as-canonical-test.
- **License layer ambiguity** — encoded-self isn't in the SIP § 7 license taxonomy. Mitigation: out-of-scope flag + v1.2 todo.

## Falsifier (amendment-pattern revisited)

If after 12 months: zero friend-forks have shipped, zero authorlessness-audit failures have been raised, and zero encoded-self disputes have arisen — the amendment was unnecessary infrastructure for hypothetical scenarios. Revisit at 2026-W30 quarterly review. Falsification doesn't mean removal (substrate items don't churn); it means flag for v2 simplification.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, sovereignty, attestation]
- Generated: 2026-05-06
- Related: docs/cockpit/MASTER-PLAN.md § 0 + § 3 + § 4 (Phase 0 REVISE #4), docs/boards/luminor-cockpit-v8.md (v8 ratification)

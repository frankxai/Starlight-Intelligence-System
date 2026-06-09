# Starlight Board — v0.1 SIS shipping bundle (v8.0 + Council + Vault Loop)

**Date:** 2026-05-11
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive to lead the Friday 2026-05-15 demo with massive parallel action
**Prior board references:**
- v8 master plan: `docs/boards/luminor-cockpit-v8.md` (2026-04-29, PROCEED-WITH-REVISE, six items closed)
- SIP § 5 amendment: `docs/boards/2026-05-06-sip-section-5-encoded-self-amendment.md`
- Q1 + Q2 day-of: `docs/boards/2026-05-07-q1-agents-md-drift-fix.md`, `docs/boards/2026-05-07-q2-v80-platform-prompt-symmetry.md`

---

## Proposals submitted

Three substrate-class proposals stacked for the Friday demo:

- **A** — v8.0 wave ship: `forge.ts`, `sandbox.ts`, `sanitization.ts`, `active-healing.ts`, `memory-health.ts` + in-flight `MemoryManager → VaultMemory` migration in `src/index.ts`
- **B** — Council 7-member archetype doctrine: Elder Father, Elder Mother, Sage, Builder-Elder, Shadow Witness, Divine Neutral Witness, Future Self at 90
- **C** — Vault Entry desire→surrender→proof loop with privacy taxonomy (private / private-shareable / public)

---

## Proposal A — v8.0 Wave Ship

**Sovereign:** Five modules including `SanitizationGateway` (a trust contract) and `ActiveHealingDaemon` (privileged background actor) bear your name once shipped. Reversible? The code is, but the public promise *"we scrub secrets"* compounds — every consumer downstream assumes coverage you haven't documented. Worth your name only with explicit scope-of-coverage docs.

**Seer:** 18 months out, the regex-based `SanitizationGateway` is either honestly maintained or quietly stale; same for `ActiveHealingDaemon` becoming useful compound improvement vs. a long-running bug source nobody notices. The 10s `execSync` sandbox is fine for local single-user but won't survive multi-tenant — pin that as Phase-3+ rework. The version bump in `getStats` from literal `"6.0.0"` to dynamic registry breaks consumers expecting the literal.

**Harmonizer:** Memory invariant: SIP § 5 sovereignty clause says sanitization scope must be honest. Current regex list misses Stripe keys, AWS keys, IBAN, bank accounts, physical addresses — anyone reading "scrubs PII and secrets" gets a false-safety signal. The v8.0 wave has provenance debt that needs naming.

**Strategist:** Forge+Sandbox+Healing trio is what distinguishes SIS from a generic agent framework — it's "self-improving with empirical grounding." Highest option value of any v0.1 piece. Cost of not shipping: every Friday-demo commit lands on a base that doesn't typecheck cleanly for anyone but Frank.

**Verifier:** First thing that breaks: a sovereign-fork installs SIS, reads "scrubs secrets," pipes a Stripe webhook through it, and ships a key to a logging service. Cheapest proof of safety: a coverage doc with explicit covered/not-covered lists and a coverage test that fails if a known-not-covered pattern slips into the "covered" claim. The native `better-sqlite3` binding broke once already — pin it.

**Overseer:** Most load-bearing concern — the sanitization trust contract: a false-safety signal is worse than no sanitization at all. Strongest case for proceeding — the dangling imports already broke the typecheck-for-others invariant; the substrate-clean commit is *strictly less risky* than the current ambiguous state.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Five concrete REVISE items, all same-day remediable, no STOP votes.

### REVISE items (Proposal A)

| # | Item | Status |
|---|---|---|
| A.1 | `docs/v8/SANITIZATION-COVERAGE.md` enumerating covered + known-not-covered patterns | ✅ shipped 2026-05-11 |
| A.2 | `test/v8-sanitization-coverage.test.ts` asserting coverage AND not-covered drift detection | ✅ shipped 2026-05-11 |
| A.3 | `ActiveHealingDaemon` default `dryRun: true` — code-changing actions require explicit opt-in | ✅ shipped 2026-05-11 |
| A.4 | `EmpiricalSandbox` doc-block: no network/fs isolation, Phase-3 rework target | ✅ shipped 2026-05-11 |
| A.5 | `better-sqlite3` pin: `^12.8.0` → `12.8.0` (exact) | ✅ shipped 2026-05-11 |

---

## Proposal B — Council 7-member archetype doctrine

**Sovereign:** Encoding seven named archetypes is a name-bearing commitment, but specifically *worth* your name — the Future-Self-at-90 archetype has no competitor instantiation. Renaming after shipped artifacts use them is awkward, so commit firmly or not at all.

**Seer:** 18 months out, this is either the most-cited SIS feature or a museum piece. Activation depends on whether the 7-archetype memo is *enforced* (test-gated) or merely *suggested* (slop-permissive). Sovereign-forks that don't share Western archetype framing may need substitution — encoded-self forkable v1.1.1 already covers this if patterns inherit, not specific names.

**Harmonizer:** Memory invariant `feedback_naming_voices_vs_agents.md` says **"VOICES.md = SIP archetypes; agents/ = named operational implementations. Don't conflate."** Council members ARE both. Resolution: register in *both* with explicit cross-reference; do not collapse layers.

**Strategist:** Unlocks Council from doctrine-page to demo-able feature. The 7-field memo template is the moat — competitor frameworks have "review," none have an enforceable archetype-structured pressure test that a test suite can validate. Highest doctrinal leverage of the three proposals.

**Verifier:** First thing that breaks: a Council Review where the seven perspectives are all generic LLM mush. Only per-archetype cognitive signatures prevent slop. Cheapest proof: run a real Council Review on the v8.0 ship itself and see if outputs are textually distinct (this very document partially demonstrates the pattern).

**Overseer:** Most load-bearing concern — perspective distinctness is the difference between doctrine and theater. Strongest case for proceeding — archetype encoding fits the v1.1.1 encoded-self-forkable amendment perfectly.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Four REVISE items; voice/agent boundary preservation is structurally non-negotiable.

### REVISE items (Proposal B)

| # | Item | Status |
|---|---|---|
| B.1 | `VOICES.md` registers 7 as archetypes; `agents/council/` as operational agents; cross-reference both ways | ⏭ pending Track T4 |
| B.2 | Each `agents/council/{name}.md` includes "Perspective signatures" (3-5 trigger phrases + 3-5 cognitive moves) | ⏭ pending Track T4 |
| B.3 | `AGENT_REGISTRY.md` count 35 → 42; update agent-count symmetry test | ⏭ pending Track T4 |
| B.4 | Run `scripts/audit-authorlessness.ts` against 7 new files — encode patterns, not Frank-specific vocabulary | ⏭ pending Track T4 |

---

## Proposal C — Vault Entry desire→surrender→proof loop

**Sovereign:** This is MIS doctrine — Frank-distinctive private practice made shippable as substrate. Worth Frank's name; *unfakeable second moat*. Schema portable, privacy taxonomy is a substrate-layer addition; both retractable with cost.

**Seer:** 18 months out, this is either the most-loved private feature or perceived as "manifestation theater" by skeptics. Frame matters more than implementation. Privacy promise (no telemetry, no cloud, no leakage) must be enforced, not asserted.

**Harmonizer:** Memory invariant: six vaults + Horizon already exist as canonical taxonomy. `VaultLoopEntry` is a record TYPE that lives across existing vaults under privacy classification, NOT a 7th vault. Drafting must explicitly say so or it fractures locked-v7.5 taxonomy.

**Strategist:** Sequence enforcement (Desire → Gratitude → Visualization → Surrender → Intuition → Aligned Action → Evidence → Outcome → Proof) is what no AI-journal competitor offers. Combined with privacy taxonomy, this is genuinely novel substrate.

**Verifier:** First thing that breaks: someone logs a Desire, never closes the loop, system has no garbage collection or visibility. Cheapest experiment: Frank logs ONE complete loop on a real desire between now and Friday, dashboard surfaces it with stage-state visibility.

**Overseer:** Most load-bearing concern — privacy enforcement is the substrate trust contract; a private entry must NEVER appear in export/search/attestation output. Strongest case for proceeding — Frank-distinctive doctrine with no competitor instantiation.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Four REVISE items; privacy-leakage test is structurally non-negotiable.

### REVISE items (Proposal C)

| # | Item | Status |
|---|---|---|
| C.1 | Amend `memory/VAULT_ARCHITECTURE.md`: VaultLoopEntry is a record TYPE across vaults, not a 7th vault | ⏭ pending Track T4 |
| C.2 | `test/v01-vault-loop-privacy.test.ts`: private entries never appear in export/search/attestation/KG | ⏭ pending Track T4 |
| C.3 | Stale-loop indicator: dashboard shows loops with no Outcome > 30 days as "pending closure" | ⏭ pending Track T3 + T4 |
| C.4 | Name: `VaultLoopEntry` technically, "Vault Loop" conceptually (Frank may rename in commit msg) | ⏭ pending Track T4 |

---

## Composite verdict

| Proposal | Recommendation | Same-day REVISE | Critical-path? |
|---|---|---|---|
| A — v8.0 ship | PROCEED-WITH-REVISE | A.1–A.5 (≈90 min) | YES — unblocks tree |
| B — Council doctrine | PROCEED-WITH-REVISE | B.1–B.4 (≈2h) | No — runs after A |
| C — Vault Loop | PROCEED-WITH-REVISE | C.1–C.4 (≈90 min) | No — independent |

**Aggregate verdict:** All three PROCEED with REVISE. Cumulative remediation ~5h, well inside the 4-day window. A.1–A.5 critical-path before any commit; B and C run alongside Track T4 build work.

---

**Built on SIP** · Starlight Board · 2026-05-11

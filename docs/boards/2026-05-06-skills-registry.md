# Starlight Board — `skills/REGISTRY.md` canonical-source registry (Tier 3a)

**Date:** 2026-05-06
**Pre-pass:** `docs/superpowers/board-pre-passes/2026-05-06-skills-registry.md`
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive to run the board autonomously when substrate-tier work is queued

---

**Sovereign:** The location choice is more sovereignty-load-bearing than the proposal admits — `skills/REGISTRY.md` and `/REGISTRY.md` are two different commitments, and CLAUDE.md's file-contract list ("alongside SIP.md, SIS.md, ALLIANCE.md, STACK.md") implies a top-level meta-registry, not a skills-only one. Pinning to `skills/REGISTRY.md` quietly forks the file-contract semantics: future consumers will inherit the narrower scope. Decide the scope question on the table; don't smuggle it through location.

**Seer:** In 18 months, the success case is exactly what hurts: every consumer repo (Arcanea, FrankX, ACOS) pins against the registry, and then Arcanea wants a divergent variant of `intelligence/strategic-reasoning` for canon-bound work. A single `owner-repo` field can't model multi-owner reality without becoming a fork-tree, at which point the registry quietly stops being canonical. The schema needs a v2-revision clause that names the multi-owner branch point explicitly, not as an afterthought.

**Harmonizer:** No objection from this vector — the precedent at `agents/AGENT_REGISTRY.md` already establishes the "registries live next to their domain" pattern, and the v77 helper extraction at `test/_lib/repo.ts` already handles the dual-maintenance friction. The doubled-edit cost is mitigated by the symmetry test that catches drift at commit time, not by review discipline.

**Strategist:** The registry's claimed unblock target (Tier 3b manifest) is itself queued, which means shipping the registry this week buys exactly zero in-week leverage. The strongest argument is substrate-honesty: CLAUDE.md asserts REGISTRY.md exists; it doesn't. Truth-correction has soft value but doesn't justify the four metadata columns — ship the truth-correction shape, defer the columns until a near-term consumer pulls.

**Verifier:** First failure at world-contact: the v78 test fires day-one because the existing `skill-rules.json` has 63 rules and the registry table is hand-derived — guaranteed minor drift on initial commit. Cheapest experiment: ship REGISTRY.md as a doc-only artifact in commit 1; write v78 test in commit 2 after confirming the registry actually matches the rules; only then add to pre-commit hook scope. This three-commit sequence makes drift surface as a fixable test failure on commit 2, not as a blocker on the substrate ship.

**Overseer:** The single most load-bearing concern is the location/scope ambiguity — `skills/REGISTRY.md` vs `/REGISTRY.md` is a sovereignty-tier choice the proposal punts on. The single strongest case for proceeding is substrate-honesty: CLAUDE.md names the file; not having it is a current substrate lie that costs more to leave than to fix.

**Recommendation:** REVISE
**Rationale:** Resolve location/scope before shipping (skills-only vs top-level meta-registry), drop `consumers` column until Tier 3b lands, ship registry doc-first then test-second to catch drift safely, and add explicit multi-owner branch-point clause to the schema.

---

## Post-board discovery (2026-05-06)

After the board returned REVISE, verification of `/REGISTRY.md` revealed it **already exists** as the **MCP server registry per SIP § Layer 3** — listing `arcanea-mcp` and `starlight-mcp`. The Sovereign vector's challenge was not just rhetorical: the substrate file-contract's `REGISTRY.md` is the MCP-server registry, fundamentally different shape from a skills registry.

This reframes the proposal:

1. **Original framing was wrong.** "Skills need a REGISTRY.md" was based on assuming the named file didn't exist; in fact it exists with a different purpose.
2. **Correct path is `skills/SKILL_REGISTRY.md`** — parallel to the existing `agents/AGENT_REGISTRY.md` precedent that the Harmonizer vector cited.
3. **Tier downgrades from substrate to operational.** Adding a domain-specific registry doesn't touch the board-trigger file-contract list (`SIP.md / SIS.md / ALLIANCE.md / STACK.md / VERTICALS.md / VOICES.md / REGISTRY.md`). `agents/AGENT_REGISTRY.md` was operational-tier; same applies to `skills/SKILL_REGISTRY.md`.
4. **The "substrate-honesty bug" claim was false.** CLAUDE.md's `REGISTRY.md` reference points to the existing MCP-server registry, not to a missing skills registry.

## Ship plan post-board (revised)

Operational-tier ship (no further board pre-pass required for the revised scope):

1. **`skills/SKILL_REGISTRY.md`** — domain-specific registry, parallel to `agents/AGENT_REGISTRY.md`:
   - Schema: name, domain, activation-rule-id, owner-repo, version (date-stamped: `2026-05-06` initial), status (`stable | experimental | deprecated`)
   - Drop `consumers` column entirely (per board REVISE — defer to Tier 3b)
   - Add `forked_from` documentation note (per Seer multi-owner concern) — schema reserves the field but v1 leaves it unused
2. **Doc-only this commit** — v78 symmetry test deferred to a follow-up commit so day-one drift surfaces cleanly (per Verifier)
3. **No CLAUDE.md edit needed** — REGISTRY.md reference at line 40 already points correctly to the existing MCP-server registry
4. **Pre-commit hook unchanged** — v78 test addition is a separate ship

## Lessons captured

- **Pre-pass questions ≠ resolved decisions.** Q1 punted on location; the board pressured "answer that before you ship." This is the value of running the board autonomously: catches the punt before it becomes the commit.
- **Substrate file-contract refs deserve a `ls` before proposing.** Cheap verification (`ls *.md` at repo root) would have caught the existing REGISTRY.md before the pre-pass was written. Adding to `feedback_audit_metrics_vs_cause` family.
- **The 3-commit ship-then-constrain pattern** (artifact → observe → constrain via test) is generalizable to substrate work. Constraining first conflates artifact-bug and test-bug.

---
**Built on SIP** · Starlight Board verdict + post-board reframe · 2026-05-06

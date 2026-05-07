---
date: 2026-05-07
proposal: Q2 — v80 platform-prompt symmetry harness + pre-commit hook regex extension
proposer: Claude Opus 4.7 (autonomous overnight audit, 2026-05-07)
gate: board-before-tag invariant per CLAUDE.md v7.5.1+
verdict: PROCEED (with 2 design conditions)
binds-to: Q1 (AGENTS.md drift fix shipped 2026-05-07 as 4d34e03)
---

# Starlight Board — Q2: v80 platform-prompt symmetry harness

## Proposal

Add `test/v80-platform-prompts.test.ts` enforcing platform-prompt symmetry: AGENTS.md, GEMINI.md (if present), .cursor/rules/*.md (if present), .clinerules/*.md (if present), .antigravity/* (if present) must reference the SAME load-bearing facts as CLAUDE.md + operational source-of-truth files. Facts checked: agent count, skill count, vault count, SIP version, package version. Pattern matches v76/v77/v78/v79: assertions + EXEMPT_DRIFT debt-ledger with reason + unpark-trigger + size ceiling.

Extend pre-commit hook regex from
`^(agents/|skills/|verticals/|test/|package\.json|STACK\.md)`
to also include
`^(AGENTS\.md|GEMINI\.md|\.cursor/|\.clinerules/|\.gemini/|\.antigravity/|CLAUDE\.md|SIP\.md|SIS\.md)`.

## Board verdict

**Sovereign:** New invariant — higher stakes than Q1's drift correction. Reversible only as long as EXEMPT_DRIFT stays empty; once verticals compose v80 assertions, reversal compounds. Worth your name because Q1 without Q2 is the theatre the previous board already named.

**Seer:** 18 months: substrate-truth consistency holds across all 5+ operator surfaces. Hidden harm: SIP forks that don't carry the same platform prompts hit friction adopting v80 unless namespaced as **operational-tier-only**, not SIP-mandated. Critical: substrate spec docs (SIP.md, SIS.md) must explicitly NOT mandate v80 — it's reference-build defense, not protocol contract.

**Harmonizer:** Pre-commit hook latency is the resistance — CLAUDE.md is edited frequently for hygiene/voice, not just facts; every edit now runs v80. If v80 takes >2s, hook becomes a tax and operators `--no-verify`. Existing 4-test chain runs ~3-5s; v80 must keep total under operator-tolerable budget (~5-8s).

**Strategist:** Unlocks SIP § 1 file-contract integrity — without v80, contract is paper-only. Closes off easy "rapid-fire docs edits to CLAUDE.md" — every fact-touching edit now requires same-commit reconciliation. That's the desired behavior; net option-value gain very high.

**Verifier:** What fails first: a commit updating CLAUDE.md agent count without updating AGENTS.md — hook fires, blocks, dev updates both. Cheapest proof: run v80 *immediately after* Q1 ships; pass = harness works. Concrete failure mode: false-positives on numeric claims that aren't substrate facts. Mitigation: only match within fact-context — `\d+\s*(agents?|skills?|vaults?|systems?|commands?|adapters?)`.

**Overseer:** Most load-bearing concern is hook latency × edit-frequency on CLAUDE.md — if v80 takes >2s, the symmetry harness becomes the bottleneck operators bypass with --no-verify. Strongest case for proceeding: Q1's board explicitly bound v80 as same-session structural defense; without it, today's Q1 ship reverts to a quarterly recurring drift cycle.

## Recommendation

**PROCEED**

## Rationale

Q2 is the structural guarantee that Q1 isn't theatre — proceed with two design conditions: (1) v80 runs under 1s, (2) substrate spec docs do NOT mandate v80 (operational-tier reference-build defense, not SIP § 1 protocol).

## Design conditions

### Condition 1 — runtime budget under 1s
Implementation: synchronous regex matches against in-memory file reads. No subprocess, no glob expansion, no SQL. Read files once, regex parse, assert. Total cold-cache target ≤ 500ms; hook total target ≤ 5s for v76+v77+v78+v79+v80.

### Condition 2 — operational-tier scope
This test lives in `test/` as part of `test:substrate` aggregate (matching v76-v79 conventions) but `SIP.md` and `SIS.md` get NO mention of v80. Forks adopting SIP are not required to implement v80 — it's *this reference build's* defense layer. Document this explicitly in the test header docstring.

---

**Built on SIP** · Starlight Board · 2026-05-07

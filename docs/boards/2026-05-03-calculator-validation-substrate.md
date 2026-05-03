# Starlight Board — SovereignNode + Calculator + ValidationRequirement substrate addition

**Date:** 2026-05-03
**Pre-pass:** `docs/superpowers/board-pre-passes/2026-05-03-calculator-validation-substrate.md`
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive

---

**Sovereign:** Adding a typed substrate primitive that any infra-touching Domain Sub-Stack must use is real ambition with bounded scope — People/Sound/Music IS opt out, only Energy/Compute/Home/Capital opt in. The proposal can be taken back by deprecating the package; existing adopters retain their work. Worth the name.

**Seer:** In 18 months, only a subset of Domain Sub-Stacks will be infra-touching enough to need this. Most verticals stay LLM-prose because their numerical claims are loose (frameworks, vocabularies, retention plans — no calculator there). That makes this a tool for a subset, not a universal substrate primitive — fine if scoped honestly.

**Harmonizer:** The `ValidationRequirement` enum hardcodes regulatory geography: `licensed_electrician_review`, `tax_advisor_review`, etc. These are claims about jurisdiction. If the enum bakes in a specific frame, it breaks for sub-stacks operating elsewhere. Needs an explicit `jurisdiction-specific` extension point from day one.

**Strategist:** This unlocks legal-and-financial defensibility for any product making numerical claims — exactly what Tier-1 sprint clients need (PV-Lager especially). Closes off pure-LLM "AI does the math" framings, which we don't want anyway. Real unlock.

**Verifier:** Pilot on Energy IS before retrofit is sound. Risk: a calculator producing a wrong number that nonetheless passes its `confidence` check. The packet's mitigation (bench against fixed I/O corpus) is correct but underspecified — what is "promotion"? Add explicit pipeline: `shadow` → `live-with-warnings` → `live` → `deprecated`.

**Overseer:** Most load-bearing concern is regulatory geography in the enum. Strongest case for proceeding: this is the only path to numerical claims without legal liability landmines. Pilot on Energy IS, encode extensibility, ship in shadow mode first.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Add jurisdiction-extensibility to ValidationRequirement and define the calculator promotion pipeline before the pilot lands.

## REVISE items captured

1. `ValidationRequirement` is an extensible enum, not a closed set. Core canonical members ship; jurisdictions extend.
2. Every calculator carries a `mode: "shadow" | "live-with-warnings" | "live" | "deprecated"` field. Promotion pipeline named explicitly in `packages/calculators/README.md`.

## Ship plan post-board

1. Build `packages/schemas/` (SovereignNode + Profiles)
2. Build `packages/validation/` (ValidationRequirement enum + extension mechanism)
3. Build `packages/calculators/` (Calculator interface + CalculatorResult shape + promotion modes)
4. Update `docs/ARCHITECTURE.md` with substrate addition section
5. Pilot on Energy IS (separate, gated on this ship)

---

**Built on SIP** · Starlight Board verdict · 2026-05-03

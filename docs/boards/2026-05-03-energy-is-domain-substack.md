# Starlight Board — Energy IS as 4th reference Domain Sub-Stack

**Date:** 2026-05-03
**Pre-pass:** `docs/superpowers/board-pre-passes/2026-05-03-energy-is-domain-substack.md`
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive

---

**Sovereign:** "Energy" is the right level — narrower than "Infrastructure", broader than "Solar", absorbs sibling concerns (storage, grid, thermal, compute-as-load). Frank's family business gives it operator-tier validation. Worth the name. Irreversibility same as any reference vertical — once shipped, hard to deprecate.

**Seer:** This will be the most operator-tier-revenue-generating reference vertical. Energy installers are concrete buyers; psychologists and musicians are aspirational. Sets a precedent that infrastructure-shaped sub-stacks (Compute, Home, Capital) are SIS-blessed — accelerates SIS as productization platform.

**Harmonizer:** PV-Lager is a sovereign instance that pre-exists this proposal. The packet handles correctly — public Energy IS stays generic; PV-Lager goes to `private/`. No conflict.

**Strategist:** First commercial wedge that's not creator-shaped. Different ICP (small-business operators in regulated market), different willingness to pay, different sales cycle. Real diversification of the product portfolio.

**Verifier:** Correctly gated on Calculator/Validation substrate landing first. Without that, Energy IS ships LLM-prose for numerical claims and is worse than not shipping. 3-4 week scaffold timeline plausible if scope holds at 6 sub-systems.

**Overseer:** Sequencing dependency on Board 1 is real. Strongest case: right vertical, right time, complementary to existing 3 references. Sequence: Board 1 ships → Calculator/Validation substrate lands → re-board Energy IS with substrate available → scaffold.

**Recommendation:** PROCEED (sequencing-gated on Board 1)
**Rationale:** Right next vertical; gate the actual scaffolding on Calculator/Validation substrate landing first per the packet's own coupling note.

## Ship plan post-board

1. Wait for Calculator/Validation substrate ship (Board 1 outcome)
2. Scaffold `verticals/energy-intelligence/` with 7-file contract — STUBS shipped this PR; full content in v8.x cycle
3. Integrate `@starlight/calculators` for sizing/cost/payback
4. Integrate `@starlight/validation` with `licensed_electrician_review`, `grid_operator_confirmation` as extended jurisdiction-canonical members
5. Author 6-7 agents at `agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md`
6. Author 20-30 commands at `.claude/commands/energy-*.md`
7. PV-Lager instantiates as sovereign instance under `private/verticals/pv-lager/` (separate ship, Frank-driven)

---

**Built on SIP** · Starlight Board verdict · 2026-05-03

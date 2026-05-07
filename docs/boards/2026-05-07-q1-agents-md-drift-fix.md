---
date: 2026-05-07
proposal: Q1 — Reconcile AGENTS.md (Codex/OpenCode system prompt) to current operational truth
proposer: Claude Opus 4.7 (autonomous overnight audit, 2026-05-07)
gate: board-before-tag invariant per CLAUDE.md v7.5.1+
verdict: PROCEED (with same-session Q2 binding)
---

# Starlight Board — Q1: AGENTS.md drift fix

## Proposal

Reconcile `AGENTS.md` (Codex/OpenCode system prompt) to current operational truth:

- "7 specialized intelligence personas, 16 auto-activating skills, 6 persistent memory vaults" → "35 named agents, 63 auto-activating skills, 6 persistent memory vaults"
- Version banner: v2.0.0 → v7.6.0 / SIP v1.1.1
- Agent hierarchy table: align with `CLAUDE.md` (current 7-tier taxonomy: Front-Door / Excavation / Leadership / Specialist / Foundation / IS-tier / Domain Sub-Stack)
- Skill list: align with `skills/skill-rules.json` (63 rules across 12 domains)

Substrate-tier because `AGENTS.md` is in SIP § 1 file contract (required if >1 agent). Source of truth = `CLAUDE.md` + `agents/AGENT_REGISTRY.md` + `skills/skill-rules.json` (all current as of 2026-05-07). Discovered in end-to-end excellence audit (`docs/excellence/2026-05-07-end-to-end-excellence-audit.md`).

## Board verdict

**Sovereign:** Reversible (single-file edit, clean revert) — but `AGENTS.md` publishing v2.0.0 / 7-personas lies for ~18 months to every Codex/OpenCode operator constitutes a SIP § 5 attestation failure that has *already* breached. Reconciliation isn't bold; it's overdue. Worth your name because *not* fixing it ends up being the indefensible position.

**Seer:** Success case 18 months out: Codex/OpenCode operators ground in current taxonomy; cross-platform reasoning calibrates correctly. Hidden harm: if Q2 (v80 platform-prompt symmetry harness) doesn't land same-session, the system reverts to the same vulnerability with fresh numbers — drift gets re-introduced silently the next time `CLAUDE.md` edits agent counts. **Q1 without Q2 is theatre.**

**Harmonizer:** No external resister. SIP § 1 names `AGENTS.md` as required; leaving stale is itself the breach. The only prior commitment touched is the v76 symmetry harness, which checks `AGENT_REGISTRY.md ↔ agents/*.md` but explicitly does NOT cover platform-prompt drift — known gap, not contradiction.

**Strategist:** Unlocks honest agent-reasoning across all 5 platform adapters; restores attestation discipline; creates precedent for v80. Closes off the deniability stance ("we never tracked this"). Strategic cost ~zero — pure correction to current truth.

**Verifier:** What fails first: a Codex operator who memorized old framing hits cognitive dissonance with `CLAUDE.md`. Cheapest proof: after Q1 ships, fresh Codex session with `cat AGENTS.md` returns new framing and doesn't contradict `CLAUDE.md` when both load. **Critical condition: Q2 must ship same session — without symmetry harness, this is another point-in-time fix.**

**Overseer:** The single most load-bearing concern is **Q1 shipping without Q2 same-session**: Q1 alone repeats the audit/fix cycle that produced the drift; Q1+Q2 together makes drift structurally impossible. Strongest case for proceeding: `AGENTS.md` continuing to publish v2.0.0 lies is an active SIP § 5 attestation failure, and the proposal already names Q2 as immediate follow-up.

## Recommendation

**PROCEED**

## Rationale

Q1 is overdue substrate-truth maintenance and the proposal binds Q2 (v80 platform-prompt symmetry harness) as same-session structural defense — proceed on condition Q2 lands today, not "soon."

---

**Built on SIP** · Starlight Board · 2026-05-07

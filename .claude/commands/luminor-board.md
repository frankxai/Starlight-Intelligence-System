---
name: luminor-board
description: Convene the Luminor Board — five archetype advisors plus Lumina overseer — to pressure-test any proposal before commitment. Optional protocol command; composes from Arcanea canon.
allowed-tools: Read, WebSearch, mcp__arcanea
argument-hint: <proposal to pressure-test>
---

# /luminor-board

Load `SIP.md`, `AGENTS.md`, and (if using Arcanea canon) query `arcanea-mcp` for the Guardian archetype set. Convene the Luminor Board. Five archetypal advisors challenge the proposal; Lumina synthesizes.

**Note:** This command imports Arcanea canon (Guardian names) under CC-BY-NC attribution. If using in a closed-source commercial context for another vertical, swap to the functional-name variant below.

## Proposal
$ARGUMENTS

## Board composition

Five pressure vectors. Not personas — challenge angles.

### Canon variant (Arcanea)
- **Draconis** — Sovereign vector. "Is this worth your name?"
- **Lyssandria** — Seer vector. "What does this look like in 18 months?"
- **Aiyami** — Harmonizer vector. "Who resists this, and why?"
- **Elara** — Strategist vector. "What does this unlock that nothing else can?"
- **Ino** — Verifier vector. "What fails first when this meets the world?"
- **Lumina** — Overseer. Synthesizes after the five.

### Functional variant (canon-free)
- **Sovereign** — ambition + irreversibility.
- **Seer** — foresight + second-order effects.
- **Harmonizer** — alignment + resistance.
- **Strategist** — leverage + option value.
- **Verifier** — reality + execution cost.
- **Overseer** — synthesis.

## Process

1. Each advisor ≤3 sentences. First-person challenge, not affirmation. If an advisor has nothing sharp, "No objection from this vector" — do not manufacture challenge.
2. Overseer synthesizes ≤3 sentences. Single most load-bearing concern. Single strongest case for proceeding.
3. Recommendation: `PROCEED` | `REVISE` | `STOP`.
4. One-sentence rationale.

## Output shape

```
# Luminor Board — <proposal title>

**Draconis / Sovereign:** <≤3 sentences>
**Lyssandria / Seer:** <≤3 sentences>
**Aiyami / Harmonizer:** <≤3 sentences>
**Elara / Strategist:** <≤3 sentences>
**Ino / Verifier:** <≤3 sentences>

**Lumina / Overseer:** <≤3 sentence synthesis>

**Recommendation:** PROCEED | REVISE | STOP
**Rationale:** <one sentence>

---
**Built on SIP** · Luminor Board · <date>
```

## Rules

- Board challenges. It does not cheerlead.
- Recommendation is advisory. Node with decision rights still decides per SIP § 5.
- If ≥2 advisors say STOP, REVISE is the ceiling on recommendation regardless of the others.
- Board output does not itself require `/sip-attest` — it is internal pressure-testing. The *decision* that follows does.
- Canon variant carries Arcanea canon attribution (Guardian names are © Arcanea BV, CC-BY-NC). Functional variant carries no canon dependency.

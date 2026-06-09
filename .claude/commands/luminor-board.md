---
name: luminor-board
description: Arcanea-canonical board — five Guardian archetype advisors plus Lumina overseer — to pressure-test a proposal that explicitly composes Arcanea canon. For SIS-substrate-tier governance, prefer /starlight-board (canon-free).
allowed-tools: Read, WebSearch, mcp__arcanea
argument-hint: <proposal to pressure-test>
---

# /luminor-board

> **Naming reconciliation (2026-05-03):** Per the brand-register rules in `memory/vaults/strategic-vault.md` (Naming hierarchy resolution), the **Luminor** register is Arcanea-canonical. `/luminor-board` stays the right command when a proposal explicitly composes Arcanea canon (Guardians, Vel'Tara, etc.) under CC-BY-NC attribution. For **SIS-substrate-tier governance**, the canonical command is now `/starlight-board` (canon-free, functional vector names only). Both run the same shape of pressure-test; the difference is canon attribution.

Load `SIP.md`, `AGENTS.md`, and (if using Arcanea canon) query `arcanea-mcp` for the Guardian archetype set. Convene the Luminor Board. Five archetypal advisors challenge the proposal; Lumina synthesizes.

**When to use this vs `/starlight-board`:**

- **`/luminor-board`** — proposal composes Arcanea canon (Guardian names, Vel'Tara, mythic register). Carries CC-BY-NC attribution. Right for Arcanea-vertical and Arcanea-aligned work.
- **`/starlight-board`** — proposal is SIS-substrate or commercial-register. Canon-free. Functional vector names. No attribution overhead.

**Note:** This command imports Arcanea canon (Guardian names) under CC-BY-NC attribution. If using in a closed-source commercial context for another vertical, swap to the functional-name variant below — or use `/starlight-board`.

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

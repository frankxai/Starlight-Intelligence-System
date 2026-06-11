---
name: starlight-board
description: Convene the Starlight Board — five pressure vectors plus Overseer — to pressure-test any SIS-substrate or operational proposal before commitment. Canon-free; functional vector names only. SIS-substrate canonical governance command.
allowed-tools: Read, WebSearch
argument-hint: <proposal to pressure-test>
---

# /starlight-board

Load `SIP.md`, `AGENTS.md`, `CLAUDE.md`. Convene the Starlight Board. Five pressure vectors challenge the proposal; the Overseer synthesizes. Functional-name only — no Arcanea canon dependency, no CC-BY-NC attribution required.

**Naming reconciliation (2026-05-03):** Per the brand-register rules in `memory/vaults/strategic-vault.md` (Naming hierarchy resolution), the Starlight register is canonical for the SIS substrate. `/starlight-board` replaces `/luminor-board` for SIS-substrate-tier governance going forward. `/luminor-board` remains available as an alias and stays Arcanea-canonical (Guardian names + CC-BY-NC) for any vertical that composes Arcanea canon explicitly.

## Proposal
$ARGUMENTS

## Board composition

Five pressure vectors. Not personas — challenge angles. Each is a discipline of looking, not a character.

- **Sovereign** — ambition + irreversibility. *"Is this worth your name? Can you take it back if it fails?"*
- **Seer** — foresight + second-order effects. *"What does this look like in 18 months? Who is harmed by the success case?"*
- **Harmonizer** — alignment + resistance. *"Who resists this, and why? Where does this break a commitment we already made?"*
- **Strategist** — leverage + option value. *"What does this unlock that nothing else can? What does it close off?"*
- **Verifier** — reality + execution cost. *"What fails first when this meets the world? What is the cheapest experiment that proves it?"*
- **Overseer** — synthesis. Names the single most load-bearing concern and the single strongest case for proceeding.

## Process

1. Each vector ≤3 sentences. First-person challenge, not affirmation. If a vector has nothing sharp, "No objection from this vector" — do not manufacture challenge.
2. Overseer synthesizes ≤3 sentences. Single most load-bearing concern. Single strongest case for proceeding.
3. Recommendation: `PROCEED` | `REVISE` | `STOP`.
4. One-sentence rationale.

## When this command runs

Per the **board-before-tag invariant** (`CLAUDE.md` v7.5.1+), `/starlight-board` runs **BEFORE** commit/tag for any change touching:

- `SIP.md` (substrate spec)
- `SIS.md` (instance spec)
- `ALLIANCE.md` / `STACK.md` / `VERTICALS.md` / `VOICES.md` / `REGISTRY.md`
- File-contract rules
- Attestation rules
- Sovereignty clause
- 10-IS taxonomy
- Domain Sub-Stack pattern
- Any structural change that constrains downstream verticals

Operational-tier work (site, voice-operator, cockpit, intake, content) ships freely under `/superintelligence` without pre-board.

## Output shape

```
# Starlight Board — <proposal title>

**Sovereign:** <≤3 sentences>
**Seer:** <≤3 sentences>
**Harmonizer:** <≤3 sentences>
**Strategist:** <≤3 sentences>
**Verifier:** <≤3 sentences>

**Overseer:** <≤3 sentence synthesis>

**Recommendation:** PROCEED | REVISE | STOP
**Rationale:** <one sentence>

---
**Built on SIP** · Starlight Board · <date>
```

## Rules

- Board challenges. It does not cheerlead.
- Recommendation is advisory. The node with decision rights still decides per SIP § 5 sovereignty clause.
- If ≥2 vectors say STOP, REVISE is the ceiling on the recommendation regardless of the others.
- Board output does not itself require `/sip-attest` — it is internal pressure-testing. The *decision* that follows does.
- The Starlight Board is canon-free by design. To compose Arcanea canon (Guardian names), use `/luminor-board` instead and accept CC-BY-NC attribution.

## Composes with

- `/openclaw-audit` — adversarial pressure-test (post-decision; the protocol-defender's integrity check). Board challenges design; OpenClaw audits ship.
- `/sip-attest` — runs after the decision the board pressure-tested, on the artifact the decision produced.
- `/superintelligence` — operational-tier execution mode that does NOT displace the board for substrate-level work.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Command introduced: 2026-05-03 (substrate naming reconciliation per Frank's directive 2026-05-03)

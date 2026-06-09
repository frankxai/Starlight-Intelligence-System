---
name: sound-composition-demo
description: Produce a Demo Plan for a song — what the demo proves, what it does not need to prove yet, capture method matched to what's being proven, reference-track grounding. Refuses skipping the demo gate. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --proves <vocal-melody|harmonic-form|arrangement|tempo-feel> + optional reference-track list
---

# /sound-composition-demo

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-composition.md`, `skills/sound-intelligence/composition-architecture.md`, and the song's Score / Lyric / Arrangement architectures. Produce a **Demo Plan**.

## Disclaimer (non-waivable)

**Demos that incorporate samples, AI tools, or co-writer contributions touch rights territory. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Read upstream.** Score / Lyric / Arrangement architecture.
3. **What does this demo prove?** Different demos prove different things — vocal melody and lyric / harmonic motion and form / arrangement viability / tempo and feel. Naming what's being proven matters more than scope.
4. **What does this demo NOT need to prove yet?** Equally important. Demos that try to prove everything become production sessions and lose the proof.
5. **Capture method matched to proof.** One-take vocal-and-instrument / rough-multitrack-on-DAW / near-final-arrangement-with-placeholder-mix / boombox-on-piano. Method serves the proof, not the other way.
6. **Reference-track grounding.** 2-3 reference tracks the demo is in conversation with. Not to copy — to position.
7. **Time budget.** Demos sized to fit the cycle (a 2-hour demo for a vocal-melody proof; a 1-day demo for arrangement-viability proof; never a 2-week demo unless the demo is the song).
8. **Save.** `sound-intelligence/composition/demo-<song-slug>-<YYYY-MM-DD>.md`.
9. **Hand off.** Default: capture the demo (not a command — actual studio time). Then: `/sound-production-mix-plan` if proof passes.

## Output format

```markdown
# Demo Plan — <Song Title> — <YYYY-MM-DD>

> **Demos involving samples, AI tools, or co-writer contributions touch rights. This is system architecture, not legal advice.**

## Context
- Song / Score / Lyric / Arrangement references: <paths>

## What this demo proves
<One specific thing. Not "the song" — the song is too big for a demo. The vocal-and-melody. Or the harmonic-and-form. Or the arrangement-viability. Or the tempo-and-feel.>

## What this demo does NOT need to prove yet
<Equally important. List what is explicitly out of scope for this demo so the demo can be a demo and not a production session.>

## Capture method
- **Method:** <one-take vocal-and-instrument | rough-multitrack | near-final-arrangement-with-placeholder-mix | boombox-on-piano>
- **Why this method serves the proof:** <one paragraph>
- **Time budget:** <e.g., 2 hours / 1 day / 1 weekend>

## Reference tracks
1. <Track 1 — what it positions us against>
2. <Track 2 — what it positions us against>
3. <Track 3 — what it positions us against (optional)>

Reference tracks position; they do not template. The demo is in conversation with them, not derivative of them.

## Pass / fail criteria
<What does this demo passing look like? What does it failing look like? Specific.>

## Load-bearing next move

**Capture the demo within the time budget.** Then: if proof passes → `/sound-production-mix-plan <song-slug>`; if proof fails → revisit upstream architecture (Score / Lyric / Arrangement).

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: <ISO date>
---
```

## Rules

- Disclaimer at top, always.
- Demo proves ONE specific thing.
- What it does NOT prove is equally important.
- Capture method matches the proof.
- Reference tracks position; do not template.
- Time-budget the demo.
- Pass / fail criteria specific.
- Skipping the demo gate refused.
- One hand-off at close.
- "Built on SIP" attestation.

— Sound Composition Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: 2026-04-26
---

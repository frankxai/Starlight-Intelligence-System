---
description: Grounded Suno prompt synthesis from local knowledge corpus + persona canon + label canon. No vibes-prompting.
argument-hint: <intent> [persona]
allowed-tools: Read, Glob, Grep, Agent
---

# /music-suno-prompt — Grounded Suno prompt synthesis

Generate 3-5 candidate Suno prompts grounded in (1) local knowledge corpus at `verticals/music-is/knowledge/suno/`, (2) target persona's canon, (3) target label's canon. No prompt is composed from training-data memory.

## Usage

```
/music-suno-prompt "evening journaling vibe, 80 BPM, lo-fi piano, processed female vox" frank-riemer
/music-suno-prompt "gym peak-state, 165 BPM, distorted guitars, cathartic shouted vocals" razor-01
/music-suno-prompt "cinematic mythic, choral languageless, modal Lydian, build to peak" aetheria-01
```

## Arguments

- **intent** (required) — one-line description of the song-target
- **persona** (required) — explicit codename or inferable from active context

## Behavior

Invokes `music-is/suno-prompt` skill (Senior tier, Sonnet 4.6).

### Grounding sources (read in order)

1. `verticals/music-is/knowledge/suno/prompt-pattern-library.md`
2. `verticals/music-is/knowledge/suno/structure-tags-reference.md`
3. `verticals/music-is/knowledge/suno/genre-style-cards.md`
4. `verticals/music-is/knowledge/suno/vocal-control-recipes.md`
5. `verticals/music-is/knowledge/suno/known-bugs-workarounds.md`
6. Label CANON visual + sound DNA
7. Persona CANON sound DNA + Suno prompt anchors

### Output per candidate prompt

- Composed prompt text (3-layer: style stem + intent layer + structure tags)
- Layer breakdown
- Predicted variability (which dimensions Suno is most likely to vary)
- Suggested first re-roll if first variant misses

## Refusals

- Persona context missing
- Prompt violates persona-canon Suno-anchors
- Prompt targets a specific named non-Frank artist's style
- Copyright-flirting language
- Vocal-clone prompts targeting non-Frank identifiable artist without consent

## Iteration discipline

- Generate 3-5 variants per intent (Suno's known variability)
- Tag each variant with seed/version metadata
- Curate-not-accept-first; every shortlisted variant gets Frank-curated A/B
- Failed variants logged to `verticals/music-is/knowledge/suno/iteration-log.md`

## Composes with

- `/music-song` — intake URL after Suno generates from prompt
- Persona CANON.md — Suno prompt anchors authoritative

---

**Built on SIP** — `/music-suno-prompt` · Senior tier (Sonnet 4.6) · Grounded synthesis only · No vibes-prompting

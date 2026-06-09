---
name: music-is/suno-prompt
description: Grounded Suno prompt synthesis from local knowledge corpus + persona canon + label canon. Triggers on /music-suno-prompt, "suno prompt for", "generate prompt for [persona]", "what should I prompt for [intent]". Senior tier (Sonnet 4.6).
---

# Suno Prompt Synthesis

> Vibes-prompting is the corruption mode. Every Suno prompt this skill emits is grounded in (1) local knowledge corpus at `verticals/music-is/knowledge/suno/`, (2) the target persona's canon, (3) the target label's canon. No prompt is composed from training-data memory.

## When this skill fires

- `/music-suno-prompt <intent> [persona]`
- "give me a Suno prompt for [intent]" + persona context
- "what's the prompt to land [genre × mood × tempo]" for a known persona
- composing batch prompts for an iteration session

## Required inputs

- **Intent** — one-line description of the song-target (e.g., "evening journaling vibe, 80 BPM, lo-fi piano, processed female vox")
- **Persona** — explicit (`/music-suno-prompt <intent> <persona>`) or inferable from active context
- **Engine version** — defaults to current Suno version per `verticals/music-is/STACK.md` L2; override per session if testing

## Grounding sources (read in order)

1. `verticals/music-is/knowledge/suno/prompt-pattern-library.md` — known-working prompt patterns
2. `verticals/music-is/knowledge/suno/structure-tags-reference.md` — Suno structure-tag syntax
3. `verticals/music-is/knowledge/suno/genre-style-cards.md` — per-genre prompt anchors
4. `verticals/music-is/knowledge/suno/vocal-control-recipes.md` — vocal posture control
5. `verticals/music-is/knowledge/suno/known-bugs-workarounds.md` — current Suno quirks
6. `verticals/music-is/labels/<label>/CANON.md` — label sound DNA
7. `verticals/music-is/labels/<label>/personas/<persona>/CANON.md` — persona sound DNA + Suno prompt anchors

## Prompt synthesis pattern

A grounded Suno prompt has three composed layers:

### Layer 1 — Style stem (label + persona DNA)

5-15 words that anchor genre, sub-genre, era, production posture. Composed from persona's "Suno prompt anchors" (5-10 fragments locked at canon spawn).

Example for Frank Riemer: `neo-classical solo piano, contemplative, dynamic-range-protected, 84 BPM`

### Layer 2 — Intent-specific layer

The session-intent: tempo, mood, instrumentation, vocal posture, structural arc.

Example: `evening journaling soundtrack, slow build, sus chord palette, no vocal`

### Layer 3 — Structure tags (Suno-specific syntax)

Use Suno structure tags per `structure-tags-reference.md`:
- `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Instrumental]`, `[Outro]`
- `[Build]`, `[Drop]`, `[Breakdown]` for electronic/cinematic
- `[Solo: piano]`, `[Solo: strings]` etc. for instrument focus
- `[Whispered]`, `[Shouted]`, `[Belted]`, `[Spoken word]` for vocal posture

Example: `[Intro] [Verse: piano motif emerges] [Chorus: full hands, dynamic peak] [Bridge: instrumental, strings enter] [Outro: piano solo, decay]`

### Composed final prompt

Combine the three layers into one Suno-input:

```
neo-classical solo piano, contemplative, dynamic-range-protected, 84 BPM, evening journaling soundtrack, slow build, sus chord palette, no vocal
[Intro] [Verse: piano motif emerges] [Chorus: full hands, dynamic peak] [Bridge: instrumental, strings enter] [Outro: piano solo, decay]
```

## Iteration discipline

- Generate 3-5 variants per intent (Suno's known variability)
- Tag each variant with seed/version metadata
- Curate-not-accept-first; every shortlisted variant gets Frank-curated A/B
- Failed variants logged to `verticals/music-is/knowledge/suno/iteration-log.md` with what-failed-and-why (this is how the corpus updates)

## Refuses

- Prompt synthesis without persona context
- Prompts that violate persona-canon Suno-anchors (e.g., asking Frank Riemer prompt to include "trap drums")
- Prompts that target a specific named non-Frank artist's style ("in the style of Hans Zimmer")
- Prompts with copyright-flirting language ("sounds exactly like [artist]")
- Vocal-clone prompts targeting any non-Frank identifiable artist without consent on file

## Composes with

- `music-is/persona-canon` (pulls Suno anchors from persona CANON.md)
- `music-is/song-intake` (post-generation: prompt logged with the catalog row)
- `verticals/music-is/knowledge/suno/` (the entire corpus)

## Output

Returns: 3-5 candidate prompts, each with:
- The composed prompt text
- Layer-1 / Layer-2 / Layer-3 breakdown
- Predicted variability (which dimensions Suno is most likely to vary across re-generations)
- Suggested first re-roll if first variant misses (specific change to retry)

## Update ritual

Knowledge corpus updates whenever:
- Suno ships a feature change (re-distill `prompt-pattern-library.md`)
- A novel prompt pattern proves itself across 3+ successful generations
- A known prompt pattern fails twice in a row
- Suno deprecates a structure tag

---

**Built on SIP** — `skills/music-is/suno-prompt.md` · v0.1 · Senior tier (Sonnet 4.6) · Grounded synthesis only · No vibes-prompting.

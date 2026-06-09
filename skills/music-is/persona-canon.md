---
name: music-is/persona-canon
description: Spawn and defend per-persona canon. Triggers on /music-persona, "spawn persona", "define artist", "lock canon for", canon-defense work, voice-lock checks. Apex tier (Opus 4.7). One persona-keeper agent per active persona.
---

# Persona Canon

> Persona is the unit. Songs serve personas; personas serve labels; labels serve canon. Every persona has a sovereign brand-graph that constrains every output across every channel. Persona canon is non-template-able; it is per-persona-authored and defended against drift.

## When this skill fires

- `/music-persona <label> <name>` — spawn new persona under a label
- "lock canon for [persona]" — formalize sound DNA, visual DNA, voice DNA, audience, monetization
- "voice-check this Claw output" — defend canon against social copy drift
- "should this song belong to [persona]?" — canon-anchoring question
- persona-keeper agent dispatch — one Opus instance per active persona

## Required canon at spawn

A persona spawn is **refused** if any of the five canon dimensions is incomplete:

### 1. Sound DNA

- Genre primary + sub-genre cohorts
- Reference triangle (3 named artists/works that triangulate the sound)
- Harmonic vocabulary (modes, chord palettes, common progressions)
- Rhythmic/tempo bands (BPM ranges per use-context)
- Vocal posture (none / processed / clean / cathartic / etc.) + AI-clone disclosure if applicable
- Production posture (dynamic-range protected vs. streaming-loudness; warm vs. clinical; lo-fi vs. polished)
- Suno prompt anchors — 5-10 core prompt fragments that ground generation

### 2. Visual DNA

- Color palette (primary + accent + neutral specs in hex; max 5 colors)
- Typography lock (display + body fonts; brand-graph-locked)
- Cover composition rules (face / no-face, persona depiction posture, negative space, texture)
- Reference image set (5-15 curated images defining the visual aesthetic — not generated, curated)
- Banned visual patterns (e.g., "no AI-slop fantasy painterly," "no stock-photo composites")

### 3. Voice DNA (lyrics + social + sync pitches + fan emails)

- Per-platform voice samples: X (140 chars), IG caption (200 chars), TikTok hook (15 words), YT title (60 chars), Spotify Canvas caption (80 chars), fan email (300 words)
- First-person posture (I / we / no-pronoun)
- Cadence (clipped, flowing, oracular, conversational)
- Banned phrases (per `social/banned-phrases.md`)
- Tone register (technical, contemplative, defiant, vibe-aware)

### 4. Audience contract

- Primary listener context (gym, deep-work, evening, commute, journaling, peak-state, etc.)
- Demographic hypothesis (age band, geography hypothesis, parallel-fandoms)
- Discovery surface primary (algorithmic playlist, curated playlist, social mesh, search, sync)
- Compounding mechanism (how this persona's audience grows over 12 months)

### 5. Monetization stack

- Streaming posture (volume vs. compounding-via-loyalty)
- Direct rail (Bandcamp / fan-tier / merch)
- Sync posture (lifestyle / film / TV / game / ad / refused)
- NFT/limited posture (designed at spawn, encoded Phase 6+)
- Royalty-cascade graph stub (composers, performers, publisher, label)

## Spawn ritual

```
/music-persona <label-slug> <persona-codename>
  → persona-keeper (Opus) prompts for all 5 canon dimensions
  → if any incomplete: refused with specific gaps named
  → if complete:
    → scaffold verticals/music-is/labels/<label>/personas/<persona>/CANON.md
    → scaffold assets/{reference-images,voice-samples,brand-kit}/
    → scaffold social/{voice-lock-x,voice-lock-ig,voice-lock-tt,voice-lock-yt,voice-lock-sp,banned-phrases,frequency-caps}.md
    → scaffold releases-index.md
    → register in LABELS.md persona allocation map
    → register in catalog/master.csv (no songs yet, just persona row)
```

## Canon defense

The persona-keeper (Opus, one per active persona) defends canon on every output:

- **Pre-publish voice-check:** every Claw drop passes a check against `social/voice-lock-{platform}.md`. Fail → refused; revision required.
- **Pre-release canon-anchoring:** every gated release proves canon-anchoring (which dimension does it serve? does it violate any?). Fail → REVISE or REFUSE.
- **Cross-persona blur:** if a generated track "could fit persona A or B," refused — assign or stay in draft.
- **Cross-label blur:** persona belongs to one label. Cross-label moves require persona-keeper sign-off + canon-doc update.

## Multiplication discipline

- Persona N+1 spawn refused before persona N hits release-cadence baseline (6 gated releases) AND persona-keeper signs off on N's stability.
- "Stability" = 3 consecutive cycles without canon-defense escalations + voice-lock pass rate ≥95%.
- Premature multiplication is the corruption mode — refuses by default.

## Retirement

A persona can be retired. Documented decision:
- Reason written to `verticals/music-is/labels/<label>/personas/<persona>/RETIREMENT.md`
- Canon doc moves to `archived-personas/`
- Catalog rows stay in `released/` with status flag `persona_retired`
- Royalty graph entries persist (royalties continue per cascade)
- Discord/social presences either archived or transferred per fan-stay decision

## Composes with

- `music-is/voice-lock` (every Claw output)
- `music-is/release-gate` (every gated release proves canon-anchoring)
- `music-is/royalty-graph` (every persona has a monetization stack at spawn)
- `verticals/music-is/SOUL.md` (refusal posture)

## Refuses

- Spawn without all 5 canon dimensions
- Spawn N+1 before N's release-cadence baseline
- Voice-lock failure shipped to platform
- Cross-persona genre-blur tracks shipped under either persona
- AI-vocal-cloning impersonating any non-Frank artist without written consent on file
- Persona bio that hides AI-generated nature

## Output

When `/music-persona` succeeds, output:
- Scaffold paths created (per persona namespace)
- Canon summary card (5-dimension at-a-glance)
- First-step suggestion: "/music-suno-prompt <intent>" for first generation, OR "/music-song <suno-url>" if persona is migrating an existing track

---

**Built on SIP** — `skills/music-is/persona-canon.md` · v0.1 · Apex tier (Opus 4.7) · One agent instance per active persona.

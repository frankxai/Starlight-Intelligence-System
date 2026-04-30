# Suno Prompt Pattern Library

> Distilled prompt patterns that consistently produce on-canon output across multiple personas. Updated whenever a pattern proves itself across 3+ successful generations or fails twice in a row.

**Engine target:** Suno v5 (current as of 2026-04-29)
**Last updated:** 2026-04-29 (v0.1 seed — to be enriched per Phase 1)

---

## Core 3-layer pattern

Every prompt has three composed layers:

```
[STYLE STEM]: 5-15 words anchoring genre, sub-genre, era, production posture
[INTENT LAYER]: tempo, mood, instrumentation, vocal posture, structural arc
[STRUCTURE TAGS]: Suno-specific syntax for sectional control
```

Example:
```
neo-classical solo piano, contemplative, dynamic-range-protected, 84 BPM
evening journaling soundtrack, slow build, sus chord palette, no vocal
[Intro] [Verse: piano motif emerges] [Chorus: full hands, dynamic peak] [Bridge: instrumental, strings enter] [Outro: piano solo, decay]
```

---

## Patterns that work (per-genre)

### Neo-classical (Frank Riemer label)

```
Pattern: "[reference-triangle-anchor], solo piano, [BPM] BPM, [mood], [chord-flavor], no vocal"

Example: "Olafur Arnalds-style solo piano, 78 BPM, contemplative, sus chord palette, no vocal"
```

Known-working anchors:
- "Olafur Arnalds-adjacent" — produces post-classical with restraint
- "Max Richter-adjacent" — produces longer-form arc with strings
- "Nils Frahm-adjacent" — produces texture-heavy intimate piano
- "modal mixture" — encourages parallel-minor borrowing
- "sus chord palette" — encourages sus2/sus4 motion
- "rubato" — encourages tempo flex
- "real-room reverb" — encourages natural acoustic space

### Lo-fi / chill-house (Frank's Vibes label)

```
Pattern: "[sub-cohort-anchor], [BPM] BPM, [mood], [vocal-posture], [production-posture]"

Example: "lo-fi evening, 84 BPM, journal soundtrack, languageless processed female vocal pad, warm low-end moderate compression"
```

Known-working anchors:
- "lofi study" — produces lo-fi with familiar vocab
- "chill-house" — produces 4/4 housekick + warm pad
- "chillhop / lofi hip-hop" — produces vinyl-crackle texture
- "warm low-end" — encourages sub-bass presence
- "vibe electronic" — produces downtempo
- "sunset aesthetic" (in description; not always honored sonically but tags Suno's mood-vocab)

### Cinematic / mythic (Arcanea label)

```
Pattern: "[reference-triangle-anchor], orchestral hybrid, [tempo-band], [modal-anchor], [build-architecture], [vocal-posture]"

Example: "Hans Zimmer-adjacent, orchestral hybrid, 86 BPM, Lydian modal, slow-build to peak, choral languageless quasi-Latin"
```

Known-working anchors:
- "Hans Zimmer-adjacent" — produces ostinato + brass
- "Two Steps from Hell-adjacent" — produces trailer build
- "modal Lydian / Phrygian / Dorian" — encourages mythic harmony
- "pedal-tone" — encourages long bass pedal under modal motion
- "ostinato" — encourages rhythmic foundation
- "languageless choral" — encourages mythic vocal quality
- "cinematic build to peak at [time]" — encourages dynamic arc

### Punk / alt (Nona label)

```
Pattern: "[reference-triangle-anchor], [BPM] BPM, [vocal-posture], [production-posture], [lyric-theme]"

Example: "IDLES-adjacent, 162 BPM, raw shouted vocals, distorted guitars aggressive drums, peak-state defiance"
```

Known-working anchors:
- "IDLES-adjacent" — produces modern post-punk
- "Fontaines D.C.-adjacent" — produces literate post-punk
- "Bauhaus-adjacent" — produces gothic-flavored darker
- "raw vocal energy" — preserves shouted/screamed quality
- "minimal autotune" — keeps rawness
- "distorted guitars" — primary instrumental anchor
- "peak-state" — encourages BPM band 130+

---

## Vocal control anchors

| Goal | Anchor that works | Anchor that fails |
|---|---|---|
| No vocal | "no vocal" or "[Instrumental]" structure tag | "lyrics-free" (not consistently honored) |
| Languageless choral | "languageless choral, quasi-Latin" | "Latin lyrics" (Suno may attempt actual Latin) |
| Processed pad | "vocal pad, processed, languageless" | "ambient vocal" (too vague) |
| Shouted/screamed | "raw shouted vocals" or "[Shouted]" structure tag | "loud vocals" (not specific enough) |
| Whispered intimate | "[Whispered]" structure tag | "soft vocal" (interprets as quiet, not posture) |
| Belted | "[Belted]" structure tag | "powerful vocals" (too vague) |

---

## Structural arc anchors

| Goal | Anchor | Use |
|---|---|---|
| Slow build | "slow build to peak at [time]" | Cinematic, neo-classical |
| Drop architecture | "[Build] [Drop]" structure tags | Electronic, vibe sub-cohort |
| Verse-chorus-bridge | Standard structure tags | Pop-adjacent (rare in this label system) |
| Through-composed | "through-composed, no repeats" | Cinematic mythic |
| Loop-friendly | "loop-friendly, returns to opening at [time]" | Lo-fi, gym-electronic |

---

## Production posture anchors

| Goal | Anchor |
|---|---|
| Dynamic-range protected (sync-grade) | "dynamic-range protected, mastered for film/TV sync" |
| Streaming-loudness | "streaming-loudness optimized, full mix" |
| Warm low-end | "warm low-end, sub-bass presence" |
| Lo-fi texture | "vinyl crackle, tape saturation" |
| Cinematic depth | "cinematic spatial depth, far-room reverbs" |
| Brutalist raw | "raw, minimal post-production, anti-clinical" |

---

## What fails (banned patterns)

- **Specific named non-Frank artist's style** — "in the style of Hans Zimmer" works as anchor; "exactly like Hans Zimmer" or "perfect copy of [artist]" gets refused or fails
- **Copyright-flirting language** — "sounds exactly like [hit song]" — refused or generates uncanny near-copy
- **Over-stuffed prompts** — more than ~50 words tends to dilute; pick the load-bearing 20-30 words
- **Genre-blur prompts** — "lo-fi cinematic punk vibe" produces incoherent slop; pick one canon
- **Vague mood-only** — "happy energetic" without genre/instrumentation/tempo anchors fails

---

## Iteration discipline

- Generate 3-5 variants per intent (Suno's variability is high)
- Tag each variant with seed + version metadata
- Curate-not-accept-first; A/B against persona canon
- Failed variants → log to `iteration-log.md` with what-failed-and-why

---

## Update log

| Date | Pattern added/removed | Reason |
|---|---|---|
| 2026-04-29 | Initial v0.1 seed | Phase 0 spawn from prior Suno experience |
| | (to be populated as Phase 1 generates and patterns prove/fail) | |

---

**Built on SIP** — `knowledge/suno/prompt-pattern-library.md` · v0.1 seed · Updates per pattern-proof-or-fail · Engine target: Suno v5

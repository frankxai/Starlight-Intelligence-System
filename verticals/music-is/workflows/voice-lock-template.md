# Voice-Lock Template

> Per-persona × per-platform voice-lock files. Each persona maintains 5 voice-lock files (X / IG / TikTok / YT / Spotify) at `verticals/music-is/labels/<label>/personas/<persona>/social/`. This template is the structural format every voice-lock file follows.

**Last updated:** 2026-04-29

---

## File location pattern

```
verticals/music-is/labels/<label>/personas/<persona>/social/
├── voice-lock-x.md
├── voice-lock-ig.md
├── voice-lock-tt.md
├── voice-lock-yt.md
├── voice-lock-sp.md
├── banned-phrases.md
└── frequency-caps.md
```

---

## Voice-lock file format (template)

Each voice-lock file follows this structure:

```markdown
# Voice-Lock — [Persona] × [Platform]

**Persona:** [persona-name]
**Platform:** [platform]
**Last updated:** [date]
**Voice-lock pass-rate target:** ≥95%

---

## Char/length limits

- [Platform-specific limits — e.g., X: 280 chars; IG caption: 200 chars]

## Tone register

[1-3 sentences describing the tone for this persona × platform combination]

## First-person posture

[I / we / no-pronoun / second-person]

## Cadence

[Clipped / flowing / oracular / conversational]

---

## Voice samples (gold-standard)

These are Frank-curated examples that pass voice-check. Generated copy is checked against these for similarity.

### Sample 1 — [context, e.g., "Release announcement"]

> [Sample text exactly as it would post]

### Sample 2 — [context, e.g., "Production-process angle"]

> [Sample text]

### Sample 3 — [context, e.g., "Catalog-context"]

> [Sample text]

### Sample 4 — [context, e.g., "Reply engagement"]

> [Sample text]

### Sample 5 — [context, e.g., "Live-listener interaction"]

> [Sample text]

---

## Banned phrases (platform-specific additions)

(Plus the cross-persona banned-phrases.md list)

- [Phrase 1]
- [Phrase 2]
- [Phrase 3]

---

## Required elements per drop

- AI-disclosure compliance (per platform policy + DECISIONS D11)
- [Persona-specific element — e.g., for Alera: explicit 528 Hz reference if frequency-relevant]
- [Per-release elements — e.g., always link Spotify track URL]

---

## Frequency cap

- Max [X] drops/day on this platform
- Cross-mesh frequency cap: ≤3 drops/day per persona total

---

## Voice-check classifier

Generated copy passes if:
- Similarity-score to voice samples ≥0.X (CLIP-text or similar embedding)
- No banned phrases
- All required elements present
- Char/length within limits
- Tone register matches

Fail → auto-regenerate (max 3 attempts) → escalate to Frank.

---

## Update log

| Date | Change | Reason |
|---|---|---|
| [date] | [change] | [reason] |

---

**Built on SIP** — Voice-lock file · `verticals/music-is/labels/<label>/personas/<persona>/social/voice-lock-<platform>.md` · Versioned per persona × platform
```

---

## Example — Frank Riemer × X (filled-in)

```markdown
# Voice-Lock — Frank Riemer × X (Twitter)

**Persona:** Frank Riemer
**Platform:** X / Twitter
**Last updated:** 2026-04-29
**Voice-lock pass-rate target:** ≥95%

---

## Char/length limits

- Post: ≤280 chars
- Thread continuation: 3-5 follow-ups max
- Reply: ≤280 chars per reply

## Tone register

Contemplative, technical-when-needed, direct, anti-marketing. First-person. Catalog-numbered convention common (Op./No.). Refuses hype. Refuses vibe-marketing-speak.

## First-person posture

"I", occasional "this piece" — first-person + descriptive-third for the work itself.

## Cadence

Measured, sentence-structured, short-paragraphs (1-3 sentences); rarely fragmented.

---

## Voice samples (gold-standard)

### Sample 1 — Release announcement

> Threshold (Op. 7 No. 1) is up. Solo piano. 4:32. Recorded in one take after three weeks of trying others. The bridge took 14 attempts. The version that landed has nothing fancy in it. Just the right four bars repeated twice with a string entry on the second half.

### Sample 2 — Production-process angle

> The dynamic range on this one is preserved. -16 LUFS integrated. No streaming-loudness compression. If you're listening on a phone speaker the quiet sections will be quiet. That's the point.

### Sample 3 — Catalog-context

> This is the third piece in the Aether sequence. Op. 7 No. 1, No. 2, and No. 3. They're meant to be heard in order. Listening to one alone misses the through-line.

### Sample 4 — Reply engagement (to a fan compliment)

> Thank you for that. The B-flat pedal in the middle was the hardest part to land. Glad it carried for you.

### Sample 5 — Sync-licensing context

> Threshold is sync-grade master. Stems available. If you're a music supervisor with a brief that fits — DM is open.

---

## Banned phrases

(Plus persona-wide banned-phrases.md)

- "drop", "out now", "exclusive"
- "vibes", "next-level", "groundbreaking"
- "stream now"
- Emoji except where intentional (rarely)
- All-caps for emphasis
- "Check it out"
- "Hit play"

---

## Required elements per drop

- AI-disclosure carried in profile bio (always present)
- Per-release tracks link to Spotify track URL
- Track length explicit when relevant
- Op./No. catalog notation when relevant (Frank Riemer convention)

---

## Frequency cap

- Max 2 drops/day on X (per persona × platform)
- Cross-mesh: ≤3 drops/day per persona total

---

## Voice-check classifier

Generated copy passes if:
- Similarity-score to voice samples ≥0.85
- No banned phrases
- All required elements present
- ≤280 chars
- Contemplative tone register matches

Fail → auto-regenerate (max 3 attempts) → escalate to Frank.

---

## Update log

| Date | Change | Reason |
|---|---|---|
| 2026-04-29 | Initial voice-lock | Phase 0 spawn |
| | (to be populated as samples mature and patterns prove/fail) |

---

**Built on SIP** — Voice-lock file · `verticals/music-is/labels/frank-riemer/personas/frank-riemer/social/voice-lock-x.md` · v0.1 · Frank Riemer × X
```

---

## Example — Alera × Spotify Canvas (filled-in)

```markdown
# Voice-Lock — Alera × Spotify Canvas

**Persona:** Alera
**Platform:** Spotify (Canvas captions + playlist pitching)
**Last updated:** 2026-04-29
**Voice-lock pass-rate target:** ≥95%

---

## Char/length limits

- Canvas caption: ≤80 chars
- Playlist pitch (per-release): 60-second narrative
- Profile bio: ≤200 chars

## Tone register

Mythic / oracular / score-technical / frequency-aware. The Voice Guardian speaks; Frank-as-architect doesn't intrude. Soft awe, never claims-language ("healing").

## First-person posture

"We hear" / oracular plural ("the frequency carries") OR no-pronoun descriptive.

## Cadence

Short oracular phrases. Catalog-precise.

---

## Voice samples (gold-standard)

### Sample 1 — Canvas caption

> Alera. Voice Guardian. 528 Hz. Lydian.

### Sample 2 — Canvas caption (alt)

> 528 Hz. Whale-song lineage. Lydian build.

### Sample 3 — Playlist pitch (60s narrative)

> Alera is the Voice Guardian of the 10 Arcanea Guardians. This piece, "First Echo," is tuned to 528 Hz throughout — the pedal is the frequency canon. 4:32 of cinematic Lydian build, dynamic-range protected, sync-grade master. Stems available. If you curate cinematic, healing-frequency, or score-grade female-vocal playlists, this fits. Master rights with Arcanea Records BV; cascade-preserved license terms.

### Sample 4 — Profile bio

> Voice Guardian. 528 Hz. Echo Realm. AI-generated music produced by Arcanea Records. Cinematic Lydian + healing-frequency tuned. arcanea.com/alera

### Sample 5 — Cross-Guardian feature pitch

> "Alera × Maylinn" is a cross-Guardian feature — Voice (528) blended with Heart (417). The harmonic bridge sits at 472.5 Hz. Both Guardians speak.

---

## Banned phrases

(Plus persona-wide banned-phrases.md)

- "drop", "exclusive drop"
- "vibrate higher", "raise your frequency", "transformative"
- "healer", "heal yourself", "healing energy" (claims-language refused)
- "next-level epic", "trailer for your life"
- "Check it out", "Hit play"
- Generic-fantasy ("ancient power", "destiny calls")

---

## Required elements per drop

- AI-disclosure in bio (always present)
- 528 Hz reference (Alera's frequency canon)
- Lydian or modal-name when relevant
- Per-track Spotify URL or Canvas-tied
- Cross-Guardian features explicitly named with both Guardians

---

## Frequency cap

- Spotify is per-release Canvas (not daily drops)
- Playlist pitches: cadence per `sync-pitch-protocol.md`

---

## Voice-check classifier

Generated copy passes if:
- Similarity-score to voice samples ≥0.85
- No banned phrases
- 528 Hz reference present (Alera-specific requirement)
- All required elements present
- Tone register matches (mythic / oracular)

Fail → auto-regenerate (max 3 attempts) → escalate to Frank.

---

**Built on SIP** — Voice-lock file · Alera × Spotify · v0.1 · 2026-04-29
```

---

## Initial voice-lock files needed for Phase 1

Per active Phase 1 persona, 5 voice-lock files needed:

| Persona | X | IG | TikTok | YT | SP |
|---|---|---|---|---|---|
| Frank Riemer | template above (sample) | ⏳ Phase 1 setup | ⏳ Phase 1 setup | ⏳ Phase 1 setup | ⏳ Phase 1 setup |
| Alera | ⏳ Phase 1 setup | ⏳ Phase 1 setup | ⏳ Phase 1 setup | ⏳ Phase 1 setup | template above (sample) |
| Frank's Vibes #1 (post-name-lock) | ⏳ Phase 3 setup | ⏳ Phase 3 setup | ⏳ Phase 3 setup | ⏳ Phase 3 setup | ⏳ Phase 1 setup |

Frank populates voice-lock samples (1-time setup per persona). Phase 0 spawn provides templates; Frank fills with curated samples Phase 1.

---

**Built on SIP** — `verticals/music-is/workflows/voice-lock-template.md` · v0.1 · 2026-04-29 · Per-persona × per-platform voice-lock format · Voice-check classifier non-waivable

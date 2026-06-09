---
name: music-is/naming-intelligence
description: Persona, label, track, and product naming for Music IS. Triggers on /music-name, "name this persona", "name candidates for", "is this name available", naming-decision questions. Senior tier (Sonnet 4.6) for synthesis; Apex (Opus) for canonical-name-lock decisions.
---

# Naming Intelligence

> Names are load-bearing. A bad persona name caps the audience ceiling permanently. A good name compounds for decades. This skill grounds naming in (1) musician-naming patterns from history, (2) per-canon constraints (label DNA, persona DNA, audience contract), (3) availability validation, (4) anti-pattern refusal.

## When this skill fires

- `/music-name <type> <context>` — request name candidates (type = persona / label / track / product / playlist)
- "name candidates for [persona under label X serving audience Y]"
- "is [name] available?" — availability check
- "rename [existing-codename] to public-name" — codename → public-name transition
- Persona spawn — naming-intelligence is invoked by `persona-canon` skill before persona enters codename-or-public state

## Naming axes (the 6-dimension test)

Every candidate name is evaluated on six axes. Score 0-3 per axis (0 = fails, 3 = excellent). Names below 12/18 total are refused.

### Axis 1 — Memorability

- **3:** Single distinct word OR rhythm-recognizable phrase ("Lyssandria", "Lumina")
- **2:** Two-word combo with strong rhythm ("Vibe Gods", "Starlight Delight")
- **1:** Forgettable but functional
- **0:** Generic or overlong (more than 4 syllables without compensating distinction)

### Axis 2 — Searchability

- **3:** Unique-enough that the persona owns the first SERP page (e.g., "Alera" if not heavily contested)
- **2:** Unique enough on Spotify and Apple Music search (no major artist conflict)
- **1:** Conflict exists but persona can compete (genre niche differentiation)
- **0:** Hopeless against existing artist or generic word

**Required check:** Spotify + Apple Music + YouTube + Bandcamp + Google + Trademark databases (USPTO + EUIPO + WIPO basic). At minimum, Spotify-search the candidate before locking.

### Axis 3 — Sonic feel (does the name sound like the music?)

- **3:** Phonemes carry the genre (e.g., "Lyssandria" carries mythic; "Razor" carries punk)
- **2:** Compatible
- **1:** Neutral
- **0:** Sonically mismatched (e.g., "Razor" for neo-classical = fail)

### Axis 4 — Brand-extensibility

- **3:** Extends naturally to merch, collab, future personas, sub-projects
- **2:** Extends with effort
- **1:** Extends only awkwardly
- **0:** Constrains future moves

### Axis 5 — Canon-fit

- **3:** Composes natively with existing Music IS canon (label CANON, Arcanea ecosystem, Frank's brand graph)
- **2:** Composes with effort
- **1:** Neutral
- **0:** Violates an existing canon-binding

### Axis 6 — Pronounce-ability + global

- **3:** One pronunciation across English, German, Spanish, French (Frank's likely audience markets)
- **2:** Two stable pronunciations; both work
- **1:** Multiple pronunciations
- **0:** Pronunciation chaos that fragments brand recognition

---

## Naming patterns from musician history

Six pattern families, with examples and when to use each.

### Pattern 1 — Single-name evocative

Examples: Aphex Twin, Bjork, Burial, Madonna, Prince, Sade, Beyonce, Bjork, Grimes, Fka twigs.

When to use: when the persona is THE persona (single-artist label or hero-persona of a multi-persona label). Strongest searchability + memorability if the word is rare or unique-enough.

### Pattern 2 — Mythic / archetype

Examples: Aurora, Phoenix, Halsey, Solange, Lorde, Banks, Apollo.

When to use: when the persona occupies an archetypal space (Arcanea Guardians fit here perfectly — they ARE archetypes by canonical design).

### Pattern 3 — Two-word evocative

Examples: Bon Iver, Frank Ocean, Daft Punk, Massive Attack, Sigur Ros.

When to use: when one word doesn't carry enough; second word adds rhythm or specificity.

### Pattern 4 — First-name only or first-last

Examples: Adele, Ed Sheeran, Olafur Arnalds, Max Richter, Nils Frahm, Jon Hopkins.

When to use: when the artist IS the persona (Frank Riemer label = this pattern, by design).

### Pattern 5 — Codename / acronym

Examples: SBTRKT, RJD2, MGMT, DJ Shadow, ODESZA.

When to use: rarely; usually if the name encodes a private meaning the artist wants to preserve.

### Pattern 6 — Compound / portmanteau

Examples: Soundgarden, Radiohead, Coldplay, Phoebe Bridgers, FKA twigs.

When to use: when a custom-coined word can carry both rhythm and meaning.

---

## Per-label naming pattern lock

For Music IS specifically:

| Label | Pattern primary | Pattern secondary | Examples (existing or candidate) |
|---|---|---|---|
| **Frank Riemer** | Pattern 4 (first-last) | — | Frank Riemer (locked) |
| **Frank's Vibes** | Pattern 1 (single-evocative) OR Pattern 6 (compound) | Pattern 3 (two-word evocative) | Pulse, Drift, Lumen, Aurora, Vibe Gods (existing Suno: "Arcanean Vibe Gods") |
| **Arcanea** | Pattern 2 (mythic-archetype) | Single-name (already the canon names) | Alera, Lyssandria, Leyla, Maylinn, Lyria, Aiyami, Elara, Ino, Shinkami, Draconia (10 Guardians; canon-locked) |
| **Nona** | Pattern 6 (compound brutalist) OR Pattern 5 (codename) | Pattern 1 (single-evocative-raw) | Razor, Crash, Iron, Brutalist (raw single-words); compound options |

---

## Existing Music IS naming canon (locked)

### Tracks (existing Frank's Suno catalog — naming framework already articulated)

Per FrankX MUSIC_CATALOG_INDEX provenance:
- **Emotional/intention-driven** — name expresses transformational purpose (The Awakening, Trust in Yourself, Lumina)
- **Brand-anchored signature pieces** — Vibe OS, Golden Age of Intelligence, Arcanean Legends, Arcanean Starlight
- **Prompt-to-track lineage** — track names reflect prompt's core concept

### Suno custom voice personas (already in use)

- Right Here · Aqui · RU Arcanean Vibe Gods · Arcanean Vibe Gods · Dadada Weihnachtszeit · All In · Suno Swims · Growth · Oh Arcanea D&B (Legacy)

These are existing voice-clone identities, not yet promoted to public personas. Naming-intelligence helps decide which (if any) graduate to public personas under one of the four labels.

---

## Persona-naming protocol (full)

When `/music-persona <label> <name>` is called, naming-intelligence runs:

1. **Pull label CANON** (sound DNA, audience contract, naming pattern lock per table above)
2. **Generate 5-10 candidate names** following the label's pattern primary + secondary
3. **Score each on 6 axes** (memorability, searchability, sonic feel, brand-extensibility, canon-fit, pronounce-ability+global)
4. **Refuse names below 12/18**
5. **Run availability check** — Spotify + Apple Music + YouTube + Bandcamp + Google + USPTO/EUIPO basic
6. **Surface top 3 candidates** to Frank with full scorecard
7. **Frank locks** OR **revises**
8. **On lock:** naming written to persona CANON.md; codename retired; persona graduates to public-name state

---

## Anti-patterns (refused names)

- Names of any specific identifiable existing artist (refuses copyright-flirting)
- Slurs, ableist terms, or terms with active reclamation contention
- Generic genre words alone ("DJ", "MC", "Producer")
- Numerical-only names (forgettable, unsearchable)
- Names that violate label canon (e.g., "Vibe Goddess" for Nona = corporate-aligned, refused)
- Names that conflict with an existing Music IS persona under any label
- Names with documented racial/cultural-appropriation history
- Names that mimic non-music brand trademarks (e.g., "Spotify-X" or "Apple Music Inc")

## Banned-name list (live, per-label)

Maintained at `verticals/music-is/knowledge/naming/banned-names.md`.

Initial list:
- Any name from existing Frank's Suno custom voice personas — these are voice-tools, not public personas (require explicit promotion)
- "Vibe", "Vibes" alone (too generic for Frank's Vibes label persona; better as label sub-context)
- "Arcanea" alone for any persona (reserved for label name only)
- "Frank" or "FrankX" alone (reserved for Frank Riemer label or cross-brand)
- All 10 Guardian names are RESERVED for Arcanea label only — cannot be used as personas under other labels

---

## Track-naming protocol

For per-track naming after Suno generation:

1. Pull persona's emotional/intention-driven naming framework
2. Pull track's prompt + mood + structural arc
3. Generate 3-5 track-name candidates
4. Apply 6-axis test (memorability + searchability + sonic feel matter most for tracks)
5. Frank locks at gate

Frank's existing track-naming patterns serve as anchors:
- Emotional state ("The Awakening")
- Aspirational/universal ("Golden Age of Intelligence")
- Brand-tied ("Vibe O S")
- Mythic-canon-tied ("Arcanean Starlight")
- Single-evocative ("Lumina", "Threshold")

---

## Output

Per naming request:
- Top 3 candidates with 6-axis scorecard
- Availability check results (Spotify, Apple Music, YouTube, Bandcamp, Google, trademark)
- Pattern-lineage analysis (which pattern from history?)
- Canon-fit analysis
- Frank-locks-or-revises-decision-required flag

---

## Composes with

- `music-is/persona-canon` (naming runs as part of spawn)
- `verticals/music-is/knowledge/naming/` (best-practices, musician-naming-patterns, banned-names)
- `verticals/music-is/labels/<label>/CANON.md` (label-naming-pattern-lock per table)
- Arcanea ecosystem canon (Guardian names canon-locked)

---

**Built on SIP** — `skills/music-is/naming-intelligence.md` · v0.1 · Senior tier (Sonnet 4.6) for synthesis · Apex (Opus) for lock decisions · 6-axis test non-waivable

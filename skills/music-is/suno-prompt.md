---
name: music-is/suno-prompt
description: Rights-safe, evidence-grounded songcraft and Suno v5.5/Studio 2.0 synthesis. Produces one track contract, generation prompt, authored lyric, and production plan; rejects named-artist imitation, generic-pretty language, adjective piles, and unsupported platform claims. Triggers on /music-suno-prompt, songwriting, Suno prompt, lyrics, hook, song DNA, arrange, produce, or Studio 2.0.
---

# Suno Songcraft Synthesis

> The prompt is downstream of the song. Build the human premise, hook behavior, vocal instrument, low-end relationship, and arrangement before compressing them into Suno language.

## Current platform baseline

Official Suno documentation is the authority for fast-moving product behavior. As verified 2026-09-02:

- generation model: Suno v5.5;
- Voices and Custom Models are consent/ownership-bound identity surfaces;
- Studio 2.0 is a separate production environment with take lanes, stems, MIDI, automation, native effects, and export;
- Studio instructions do not belong in the compact generation prompt.

Recheck these official pages before claiming current behavior:

1. `https://help.suno.com/en/articles/11362305` — v5.5
2. `https://help.suno.com/en/articles/11362369` — Voices
3. `https://help.suno.com/en/articles/11362497` — Custom Models
4. `https://help.suno.com/en/articles/13670529` — Studio 2.0
5. `https://help.suno.com/en/articles/13670721` — Studio Chat
6. `https://help.suno.com/en/articles/13670785` — effects
7. `https://help.suno.com/en/categories/550145-rights-ownership` — rights

Local knowledge under `verticals/music-is/knowledge/suno/` is a tested secondary source. If it conflicts with dated official documentation, flag the conflict; do not silently repeat the stale claim.

## Required grounding

Read in order:

1. target label and persona canon;
2. `prompts/music/songcraft-system-v2.md`;
3. `docs/research/music-intelligence/source-ledger-2026-09.md` when external material is requested;
4. relevant local iteration evidence;
5. current official Suno documentation for feature claims.

If the target persona is missing, infer only non-identity musical choices. Ask one question when singer identity, consent, ownership, or release lane would change the answer.

## Protocol

### 1. Declare the song before the sound

Write a one-line thesis with a scene, emotional contradiction, listener, and social action. “Empowering anthem” is not a thesis. “She deletes the apology in the airport bathroom, then sings the unsent last line with strangers” is.

### 2. Extract mechanisms, never costumes

For references, record only form, point of view, hook function, prosody, harmonic motion, pocket, density, vocal staging, low-end roles, social affordance, and mix depth. Use at least three orthogonal mechanisms when references are available. Do not output artist names or recognizable signature phrases in a generation prompt.

### 3. Design title returns

Record exact-title target, variant target, melodic returns, and chant-cell length. Assign each return a job: seed, establish, implicate, fracture, communal payoff. There is no universal “seven repetitions” rule.

### 4. Write and de-slop the lyric

Use specific objects/actions, spoken syntax, subtext, unequal line shapes, semantic rhyme, one evolving metaphor system, and a turn in every verse. Treat generic cosmic/motivational vocabulary as expensive. Replace the three most predictable lines before output. Read aloud for mouthfeel, stress, breath, and consonant collisions.

### 5. Score the musical instrument

Name key/mode, tempo, meter, harmonic-motion class, melodic contour, phrase lengths, tension peak, surprise, payoff, and migrating motif. Prosody is non-negotiable.

### 6. Direct voice and low end

Specify tessitura/register journey, onset, vowel color, consonant attack, breath, vibrato, microtiming, doubles/harmonies/ad-libs, and vocal distance. Specify kick role, sub/body/texture ownership, note length/glide, saturation, mono policy, sidechain envelope, drum pocket, and translation tests. Refuse “powerful emotional vocal” and “heavy bass” as complete directions.

### 7. Separate generation from production

Compress the identity into one Suno v5.5 style brief. Then create an independent Studio 2.0 plan with take criteria, timeline, stems, edits, automation, effects, timing check, translation, and exports.

### 8. Gate the result

Use the 100-point rubric in `prompts/music/songcraft-system-v2.md`. Silently revise until score >=85 and no hard failure. Rights unknowns fail closed.

## Output contract

Return one chosen direction, not a candidate spray. Use exactly four titled fenced blocks:

1. `TITLE — TRACK CONTRACT` — YAML, including quality and rights receipt.
2. `TITLE — STYLE OF MUSIC` — compact plain text; musical identity, vocalist, groove, bass/sub, instrumentation, dynamics, space, exclusions; no named artists.
3. `TITLE — LYRICS` — section-tagged lyric with at least `[Intro]`, `[Verse 1]`, `[Chorus]`, `[End]`.
4. `TITLE — STUDIO 2.0 PLAN` — YAML, edit-ready and separate from the generator prompt.

## Rights and evidence boundary

- User-owned lyrics, recordings, stems, and models: work within recorded ownership/consent scope.
- Openly licensed sources: preserve exact license, attribution, and ShareAlike requirements.
- Commercial books/free-to-read guides: cite and distill principles; do not copy or upload full text.
- Copyrighted song lyrics: never store or reproduce; retain derived counts/features only.
- Named-artist voice or style cloning: refuse and translate the request into high-level characteristics.
- “Available online” with unclear provenance: quarantine. Unknown means stop.

## Learning loop

For every accepted or rejected Suno generation, log:

```yaml
model: suno-v5.5
prompt_version: songcraft-system-v2
persona: ""
seed_or_job_id: ""
result_url_or_owned_asset: ""
what_landed: []
what_failed: []
hook_first_arrival_seconds: 0
exact_title_hits: 0
prosody_failures: []
vocal_failures: []
low_end_failures: []
arrangement_failures: []
next_single_change: ""
rights_status: verified|blocked
curator: frank
```

Change one high-leverage variable per reroll. A pattern graduates only after three successful, contextually distinct generations.

---

**Built on SIP** — `skills/music-is/suno-prompt.md` · v0.2 · operational layer · verified 2026-09-02

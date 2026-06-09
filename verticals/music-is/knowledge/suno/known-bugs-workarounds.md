# Suno Known Bugs + Workarounds

> Live log of Suno quirks that affect Music IS workflow. Updated whenever a bug is observed twice or a workaround proves itself.

**Engine target:** Suno v5
**Last updated:** 2026-04-29 (v0.1 seed)

---

## Bug log format

Each entry has:
- **Symptom** — what goes wrong
- **Frequency** — how often it shows up
- **Workaround** — what we do
- **Status** — Suno-fixed / open / on-watch

---

## Bug 1 — BPM not honored exactly

**Symptom:** Specifying "84 BPM" generates a track at 79-89 BPM range; rarely exact.

**Frequency:** Always (variability is structural).

**Workaround:**
- Generate 3-5 variants
- Curate by post-generation BPM detection (use a DAW or beat-detection tool)
- Tag actual BPM in catalog row, not requested BPM

**Status:** Open (Suno feature, not bug; manage via iteration discipline)

---

## Bug 2 — Section length not honored

**Symptom:** "[Verse: 16 bars]" generates a verse of arbitrary length.

**Frequency:** Always.

**Workaround:**
- Use proportion-anchors instead ("longer verse, shorter chorus")
- Curate by post-generation; trim/extend in post-production if needed
- For sync-grade Frank Riemer + Arcanea: edit-down in DAW for exact length

**Status:** Open

---

## Bug 3 — Real Latin lyrics generated when "languageless quasi-Latin" requested

**Symptom:** Suno tries to pronounce actual Latin words instead of generating vowel-based syllables.

**Frequency:** ~30% of attempts.

**Workaround:**
- Counter-prompt: "languageless, no real words, vowel-based syllables only, mythic-cadence not real-Latin"
- If still fails: regenerate; consider using `[Choral pad]` instead of `[Choral: languageless quasi-Latin]`

**Status:** Open

---

## Bug 4 — Vocal appears when "no vocal" specified

**Symptom:** Track generates with vocal despite "no vocal" or `[Instrumental]` tags.

**Frequency:** ~10% of attempts.

**Workaround:**
- Stack anchors: "no vocal, instrumental only, no vocal whatsoever, lyric-free"
- Use `[Instrumental]` on every section
- If still fails: regenerate; sometimes a different starting condition removes the bias

**Status:** Open

---

## Bug 5 — Multi-section structures truncate

**Symptom:** Prompts with >8 structure tags get sections re-shuffled or truncated.

**Frequency:** ~50% when prompt has 8+ tags.

**Workaround:**
- Limit to 5-6 sections per prompt
- For longer cinematic arcs (Arcanea trailer build), generate in two passes and edit-together in DAW (Phase 2+ when DAW pipeline integrated)

**Status:** Open

---

## Bug 6 — Tempo modulation mid-song fails

**Symptom:** "Starts at 80 BPM, modulates to 120 BPM at 2:00" generates a track at one tempo.

**Frequency:** ~95% (almost always fails).

**Workaround:**
- Don't request tempo modulation in Suno prompt
- Generate two separate tracks at the two tempos and edit-together in DAW (Phase 2+)
- For trailer-build (Arcanea), use dynamic-build-without-BPM-change instead

**Status:** Open (engine limitation)

---

## Bug 7 — "In the style of [artist]" sometimes refused

**Symptom:** Specifically naming a famous artist generates copyright-flag refusal.

**Frequency:** ~30% with very famous artists; rare with mid-tier reference artists.

**Workaround:**
- Use "[artist-name]-adjacent" instead of "in the style of [artist-name]"
- Use "[artist-name]-style sonic palette" instead of direct copying language
- If still refused: use the artist's reference triangle instead (per persona canon)

**Status:** Open (Suno copyright protection, not a bug — work within it)

---

## Bug 8 — Cover image and audio not always matching

**Symptom:** Suno generates audio + auto-cover; the auto-cover often doesn't match canon.

**Frequency:** Always relevant (we replace auto-cover via `/music-canvas` and asset-render skill anyway).

**Workaround:**
- Ignore Suno's auto-cover entirely
- Always use `music-is/asset-render` (nano banana 2) for catalog cover

**Status:** Not a bug — by design (we own asset pipeline)

---

## Bug 9 — Sus chord palette inconsistent

**Symptom:** "sus chord palette" anchor produces sus-flavored harmony in ~60% of generations; the rest revert to standard pop chords.

**Frequency:** ~40%.

**Workaround:**
- Stack anchors: "sus chord palette, sus2 and sus4 motion, modal mixture"
- Specify in description: "no major-V resolutions, suspended motion"
- Generate 5+ variants; curate

**Status:** Open

---

## Bug 10 — Dynamic-range-protected master not always honored

**Symptom:** Suno generates a fully-mastered streaming-loudness track even when "dynamic-range-protected" anchored.

**Frequency:** ~70% (mastering posture less responsive than other anchors).

**Workaround:**
- Stack anchors: "dynamic-range protected, mastered for film/TV sync delivery, no streaming-loudness compression, soft master"
- For cinematic-grade Frank Riemer + Arcanea: re-master in DAW before sync-pitch (Phase 2+)
- Catalog row: tag generated-master vs. re-mastered status

**Status:** Open

---

## Suno feature watch (when Suno ships changes)

When Suno ships:
- New structure tags → update `structure-tags-reference.md`
- New vocal-control feature → update `vocal-control-recipes.md`
- New genre detection → update `genre-style-cards.md`
- API stability changes → update `verticals/music-is/STACK.md` L2
- Pricing changes → update operating-cost forecast in `STRATEGY.md`

---

## Update log

| Date | Bug added/updated/resolved | Reason |
|---|---|---|
| 2026-04-29 | Initial 10 bugs / quirks | Phase 0 seed from prior Suno usage |
| | (to be populated as new bugs observed and workarounds prove) | |

---

**Built on SIP** — `knowledge/suno/known-bugs-workarounds.md` · v0.1 seed · 10 known bugs · Live log; update on observation

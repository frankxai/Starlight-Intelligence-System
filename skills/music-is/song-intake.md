---
name: music-is/song-intake
description: Capture a Suno URL into catalog/draft, queue assets, attach metadata. Triggers on /music-song, "add this song to catalog", "intake [suno-url]", new song notification. Mechanical tier (Haiku 4.5).
---

# Song Intake

> Every Suno generation that warrants compounding becomes a catalog row. Intake is mechanical: extract metadata, write the draft row, queue asset render, register in label/persona indexes. No taste decision happens here — that's `release-gate`.

## When this skill fires

- `/music-song <suno-url> [persona] [intent]`
- new generation worth keeping (intent inferred from active session)
- batch-import legacy Suno history

## Required inputs

- **Suno URL** — `https://suno.com/song/<id>` or extension share URL
- **Persona** — explicit or inferable from active context; rejection if neither
- **Intent (optional)** — short tag: "evening-journal", "gym-peak", "score-grade", etc.

## Mechanical operations (in order)

### 1. Extract Suno metadata

Pull from URL: title (Suno-assigned, often re-named at gate-pass), prompt used, duration, BPM (if Suno provides), engine version, generation timestamp, audio URL, any structural tags Suno attached.

If Suno API not yet integrated, manual paste of the prompt + observed metadata into the intake form.

### 2. Generate song-id

Pattern: `<persona-codename>_<YYYYMMDD>_<short-slug>` — e.g., `frank-riemer_20260429_evening-piano-1`

If a song-id collision: append `_v2`, `_v3`, etc.

### 3. Write catalog draft row

Append to `catalog/master.csv` with `status=draft`. Required fields at intake:
- `song_id`, `title` (Suno-assigned for now), `persona`, `label`, `status=draft`, `engine` (e.g., `suno-v5`), `suno_url`, `suno_prompt`, `bpm`, `key` (if known), `duration_seconds`, `structure_tags`, `created_date`

Fields populated later: `gated_date`, `released_date`, `isrc`, `distrokid_id`, `cover_path`, etc. Per `SUB-SYSTEMS.md` L4 schema.

### 4. Create per-song markdown doc

Path: `catalog/draft/<song_id>.md`
Contents: full Suno prompt, generation iteration log (1-N variants), persona/label canon-anchoring stub, intent description, asset queue status, notes.

### 5. Register in indexes

- `verticals/music-is/labels/<label>/personas/<persona>/releases-index.md` — append draft pointer
- (optional) Notion mirror sync if Notion sync enabled

### 6. Queue asset render

Dispatch to `music-producer` (Sonnet) with song-id + persona-canon + label-canon for asset bundle generation:
- Cover (nano banana 2)
- Motion video (Seedance 2)
- Spotify Canvas (Remotion)
- (Cinematic-grade labels Frank Riemer + Arcanea: also full Higgsfield video)

Asset bundle lands in `catalog/draft/<song_id>/assets/` when complete.

### 7. Notify

Cowork notification: "Song [song_id] intaken. Asset render queued. Status: draft. Ready for `/music-release <song_id>` after asset bundle complete."

## Refuses

- Intake without persona attribution
- Intake of a Suno URL not generated for an active persona (orphan track refused)
- Intake of an audio file from a generation engine not declared in `STACK.md` L2 (engine-agnostic at contract; not engine-anonymous)
- Intake of a vocal track using a non-Frank cloned voice without consent on file
- Duplicate intake (idempotent: re-intake of an existing song-id refused; use update path if revisions warrant)

## Batch intake mode (legacy Suno history)

For Phase 0 100-song legacy import:
- Input: CSV of Suno URLs + persona attributions
- Process: parallel intake (Haiku-batch); skip any without persona attribution
- Output: 100 draft rows + 100 queued asset renders + summary of orphans-skipped
- Reasonable batch: 25-50 per run to avoid Suno rate-limit on metadata fetch

## Composes with

- `music-is/persona-canon` (persona attribution validation)
- `music-is/asset-render` (asset bundle queue)
- `music-is/release-gate` (transition draft → released)
- `music-archivist` agent (catalog writer)

## Output

Returns: catalog row written, draft markdown doc path, asset queue status, next-step suggestion.

---

**Built on SIP** — `skills/music-is/song-intake.md` · v0.1 · Mechanical tier (Haiku 4.5) · Idempotent · Persona-attribution-required.

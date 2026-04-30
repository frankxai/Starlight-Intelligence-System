---
name: music-is/catalog-systems
description: Catalog hygiene, master CSV operations, label-board portfolio scorecard. Triggers on /music-label-board, catalog CRUD, weekly hygiene rituals, status checks. Mechanical tier (Haiku 4.5).
---

# Catalog Systems

> Catalog is the source of truth. Excel/CSV master + per-song markdown corpus is sovereign, offline, vendor-lock-free, git-trackable. This skill maintains hygiene + serves portfolio scorecard views.

## When this skill fires

- `/music-label-board [label]` — multi-persona portfolio scorecard
- Weekly hygiene ritual (orphan rows, missing metadata, stale drafts)
- Status checks ("how many releases did Frank Riemer ship this month?")
- Catalog CRUD operations

## Master CSV schema

`catalog/master.csv` columns:

```
song_id, title, persona, label, status,
engine, suno_url, suno_prompt,
bpm, key, duration_seconds, structure_tags,
created_date, gated_date, released_date, archived_date,
isrc, distrokid_id, bandcamp_id,
cover_path, cover_1x1_path, cover_16x9_path, cover_9x16_path,
video_short_path, video_square_path, video_full_path, canvas_path, lyric_video_path,
royalty_graph_id, attestation_hash,
ai_disclosure_metadata, vocal_consent_doc_path,
notes
```

Status values: `draft`, `released`, `archived`, `refused-final`.

## Hygiene operations

### Orphan-row check

Rows missing required fields per their state:
- `draft` requires: song_id, title, persona, label, status, engine, suno_url, suno_prompt, created_date
- `released` requires: all above + gated_date, released_date, isrc, asset paths, royalty_graph_id, attestation_hash, ai_disclosure_metadata
- `archived` requires: all `released` fields + archived_date + reason in `notes`

**Fail surfaces orphans for music-archivist remediation.**

### Stale-draft check

Drafts older than 30 days without progress (no asset bundle, no gate-attempt) → flagged for review (release / archive / re-prompt).

### Duplicate / collision check

Song-id collisions, Suno-URL duplicates, near-duplicate titles per persona — surfaced for dedup decision.

### Asset-path integrity

Released-status rows: every asset path resolves to an existing file. Broken paths → music-producer dispatched for re-render.

### ISRC index

Released-status rows have unique ISRC. Build/maintain `catalog/isrc-index.json` for quick lookup.

### Attestation integrity

Every released row has attestation_hash matching `/sip-attest-audio` output. Mismatch → audit + re-attest.

## Label-board portfolio scorecard

`/music-label-board [label]` returns:

### Per-label rollup
- Active personas count + names
- Total releases (per persona, per label)
- Releases by month (last 6 months)
- Streaming revenue (if Spotify-for-Artists data integrated, else manual entry)
- Sync revenue (if any)
- Direct revenue (Bandcamp, etc.)
- Royalty-graph entries count
- Amplification mesh health (active Claws, drops/week, voice-lock pass rate)

### Per-persona detail
- Sound DNA snippet (for at-a-glance recall)
- Releases (count + last release date)
- Release-cadence baseline status (6-release threshold for multiplication)
- Voice-lock pass rate last 4 weeks
- Top-3 performing releases (per persona's primary metric)
- Outstanding drafts (count + age)

### Cross-label patterns
- Release cadence balance across labels
- Voice-lock health across personas
- Royalty-graph aggregation across labels (per Wealth IS theses if integrated)

## Output formats

- **Cowork live artifact** — `label-board` artifact, refreshable on open via Haiku-backed read
- **Markdown summary** — per-label rollup as paste-ready markdown
- **CSV export** — for Excel handoff
- **Notion sync push** — to AI Musicians Hub (mirror only; never authoritative)

## Refuses

- Edit to a `released`-status row's load-bearing fields (immutability; only `notes` can be updated)
- Manual edit that would set status to `released` without `/music-release` gate-pass
- Notion-as-source-of-truth drift (Notion edits get overwritten on next sync)
- ISRC duplicate assignment

## Weekly hygiene ritual

Scheduled task (Mondays):
1. Run all hygiene checks
2. Generate weekly hygiene report at `verticals/music-is/MEMORY.md` weekly entry
3. Surface action items (orphans, stales, broken paths) to Frank
4. Update isrc-index.json

## Composes with

- `music-is/song-intake` (CSV row writer)
- `music-is/release-gate` (state transition)
- `music-is/royalty-graph` (graph_id integrity)
- `music-archivist` agent (Haiku-tier owner)

## Output

Per query: scorecard / hygiene report / specific row lookup / portfolio at-a-glance.

---

**Built on SIP** — `skills/music-is/catalog-systems.md` · v0.1 · Mechanical tier (Haiku 4.5) · Excel-master-truth · Notion-mirror-only.

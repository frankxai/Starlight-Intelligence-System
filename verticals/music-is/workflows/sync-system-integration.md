# Sync System Integration — Music IS × FrankX

> Frank's existing FrankX repo has music sync npm scripts (`music:index`, `music:asset-registry`) and a SUNO_SYNC_SYSTEM.md formal sync system. Music IS integrates with this infrastructure rather than rebuilding it. This spec maps the integration points.

**Last updated:** 2026-04-29

---

## Existing FrankX music infrastructure (verified)

Per FrankX MUSIC_CATALOG_INDEX.md + SUNO_SYNC_SYSTEM.md:

| Component | Location | Purpose |
|---|---|---|
| **Music catalog index** | FrankX/.../MUSIC_CATALOG_INDEX.md | 46 cataloged tracks; 10 genre clusters; play counts; metadata |
| **Suno sync system** | FrankX/.../SUNO_SYNC_SYSTEM.md | Formal weekly sync between Suno, Google Drive, Notion |
| **npm scripts** | FrankX/package.json | `music:index` (catalog inventory), `music:asset-registry` (asset paths) |
| **Distribution + Monetization plan** | FrankX/.../MUSIC_DISTRIBUTION_MONETIZATION.md | Distribution channels + monetization ladder |
| **Music page** | FrankX/app/music/ (per Next.js) | frankx.ai/music public face |

---

## Integration architecture

```
Suno (engine; generation)
   ↓
Google Drive (audio file storage; existing)
   ↓
[FrankX npm scripts: music:index + music:asset-registry]
   ↓
FrankX MUSIC_CATALOG_INDEX.md (46-track curated index)
   ↓
[Migration: per verticals/music-is/catalog/MIGRATION.md]
   ↓
Music IS catalog (verticals/music-is/catalog/master.csv) ← TRUTH
   ↓
[music-archivist agent (Haiku) + sync mechanism]
   ↓
Notion AI Musicians Hub (mirror)
   ↓
[frankx.ai/music auto-sync from catalog/released/]
   ↓
Public-facing distribution
```

---

## Integration points

### Point 1 — FrankX npm scripts feed Music IS

`music:index` (FrankX) outputs a curated catalog of tracks. Music IS migration script reads this output and ingests via `music-archivist` (Haiku).

**Wrapper script (proposed):** `verticals/music-is/scripts/migrate-from-frankx.ts`
- Reads FrankX MUSIC_CATALOG_INDEX.md
- For each track: applies persona-attribution decision tree (per MIGRATION.md)
- Writes to `catalog/master.csv`
- Returns migration report

### Point 2 — `music:asset-registry` bridges asset paths

FrankX `music:asset-registry` script tracks asset paths (covers, videos, etc.) Music IS migration script reads this and links to existing assets where possible (avoids re-rendering).

**Asset-link strategy:**
- Existing FrankX cover art at known path → reference path in Music IS catalog row (read-only link; do not duplicate file)
- Existing FrankX video at known path → reference path
- If asset DNA-violates target persona's visual canon → flag for re-render via `music-producer`
- If no existing asset → queue full asset bundle render

### Point 3 — SUNO_SYNC_SYSTEM.md ritual continues

FrankX's existing weekly sync ritual continues but feeds **into** Music IS catalog (not standalone).

**Modified weekly sync:**
1. Run FrankX `music:index` (existing)
2. Run FrankX `music:asset-registry` (existing)
3. Run Music IS migration delta script (NEW): `verticals/music-is/scripts/sync-delta.ts`
   - Detects new tracks since last sync
   - Applies persona-attribution decision tree
   - Inserts new rows in `catalog/master.csv` as `draft` status
   - Queues asset render for new tracks
4. Run Music IS Notion sync (NEW): pushes catalog updates to AI Musicians Hub Notion mirror
5. Generate weekly hygiene report

### Point 4 — frankx.ai/music page sources from Music IS

Currently FrankX/app/music/ serves frankx.ai/music. Phase 4 transitions:
- Source: Music IS `catalog/released/` (replaces standalone FrankX MUSIC_CATALOG_INDEX.md as truth)
- Per-label sub-pages: `/music/frank-riemer/`, `/music/alera/` (or `/music/arcanea/alera/`), `/music/franks-vibes/<persona>/`, `/music/nona/<persona>/`
- Auto-build from Music IS catalog at deploy time
- FrankX MUSIC_CATALOG_INDEX.md remains for human-readable archive but is no longer the data-source

---

## Migration of existing FrankX music infrastructure

| FrankX asset | Action | Phase |
|---|---|---|
| MUSIC_CATALOG_INDEX.md | Read-source for Migration Phase A; preserved for history; superseded as truth by Music IS catalog | Phase 1 week 1 |
| SUNO_SYNC_SYSTEM.md | Updated to feed Music IS migration delta script; modified weekly ritual | Phase 1 week 1 |
| `music:index` npm script | Continues; output feeds Music IS migration | unchanged |
| `music:asset-registry` npm script | Continues; output feeds asset-link in Music IS | unchanged |
| FrankX/app/music/ Next.js routes | Phase 4 transitions to source-from-Music-IS | Phase 4 |
| MUSIC_DISTRIBUTION_MONETIZATION.md | Composes with Music IS DECISIONS.md D5 (distribution) + persona monetization stacks | reference doc |

---

## New Music IS scripts (to write Phase 1)

### `verticals/music-is/scripts/migrate-from-frankx.ts`

Reads FrankX MUSIC_CATALOG_INDEX.md, applies persona-attribution decision tree, writes to `catalog/master.csv`. Run once per Migration Phase A; subsequently run for delta-detect.

### `verticals/music-is/scripts/sync-delta.ts`

Detects new Suno tracks since last sync; ingests as `draft` status; queues asset render. Run weekly (Mondays) per hygiene ritual.

### `verticals/music-is/scripts/sync-notion.ts`

Pushes `catalog/master.csv` + per-persona CANON.md updates to Notion (AI Musicians Hub + Vibe OS). Run on every `/music-release` pass + weekly hygiene.

### `verticals/music-is/scripts/build-music-page.ts`

Builds `frankx.ai/music` from `catalog/released/`. Run at FrankX Next.js deploy time. Phase 4+.

### `verticals/music-is/scripts/hygiene-report.ts`

Weekly hygiene report: orphan rows, stale drafts, broken paths, voice-lock false-positives, ISRC mint failures. Output to `verticals/music-is/MEMORY.md` weekly entry.

### `verticals/music-is/scripts/royalty-observation.ts`

Pulls platform royalty data (Spotify-for-Artists, Bandcamp, etc.) and updates `catalog/royalty-graph.json` with per-rail revenue. Phase 3+.

---

## Cowork live artifacts (Phase 4+)

Three Cowork artifacts compose with this sync system:

### Artifact 1 — `music-is-label-board`

Live multi-persona scorecard. Refreshes on open via `music-archivist` Haiku-backed read of `catalog/master.csv` + per-persona CANON.md.

### Artifact 2 — `music-is-persona-canon-viewer`

Per-persona canon at-a-glance. Loads persona CANON.md + recent releases + voice-lock pass rate.

### Artifact 3 — `music-is-royalty-graph-viewer`

Per-release royalty cascade visualization. Loads `catalog/royalty-graph.json` + revenue observation data.

---

## Phase activation

| Phase | Sync system state |
|---|---|
| Phase 0 (now) | Music IS catalog seed; FrankX scripts continue independently |
| Phase 1 | Migration scripts run; Music IS becomes truth source; FrankX MUSIC_CATALOG_INDEX.md superseded |
| Phase 2 | Sync delta script runs weekly; Notion sync runs on /music-release |
| Phase 3 | Per-Claw amplification feeds back into Music IS observation |
| Phase 4 | frankx.ai/music sources from Music IS; per-label sub-pages live; Cowork artifacts live |
| Phase 5 | Productized template includes sync-system primitives for other labels |
| Phase 6 | Royalty observation Phase 3+ scripts mature; on-chain mint integration |

---

## Refusals

- FrankX MUSIC_CATALOG_INDEX.md edit not propagated to Music IS catalog → eventual stale; at next sync, Music IS catalog overwrites
- Music IS catalog edit not propagated to Notion → next sync corrects
- Manual edit to FrankX/app/music/ data file (post-Phase-4) → refuse; route through Music IS catalog
- Notion edit not propagated to Music IS catalog → overwritten on next sync

---

**Built on SIP** — `verticals/music-is/workflows/sync-system-integration.md` · v0.1 · 2026-04-29 · Composes with FrankX existing infrastructure · Music IS catalog is truth · Phase-staged transition

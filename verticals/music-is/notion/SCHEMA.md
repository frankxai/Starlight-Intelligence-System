# Notion Architecture — Music IS

> Per DECISIONS.md D8: **Notion is mirror-only. Single source of truth = local Excel/CSV + markdown corpus.** This spec defines the schema for each Notion surface, the migration plan, and the sync mechanism.

**Last updated:** 2026-04-29 — Phase 0 spawn

---

## Frank's existing Notion surfaces (4)

| Notion surface | Current URL | Role under Music IS | Action |
|---|---|---|---|
| **AI Musicians Hub** | https://www.notion.so/arcanea/AI-Musicians-Hub-27b26ac2b7f6808ca479d3aedc9116f8 | Catalog mirror; primary user-facing label-board view | Schema-lock + rename "Music IS — Label Board" |
| **Vibe OS** | https://www.notion.so/arcanea/Vibe-OS-29526ac2b7f6801d81e6c2397c3d0e2f | Persona canon library; one row per persona | Schema-lock + per-persona child page = full canon doc |
| **FrankX Music Brand Strategy** | https://www.notion.so/arcanea/FrankX-Music-Brand-Strategy-Building-a-Multi-Genre-Empire-27b26ac2b7f680429352eb19351a90a0 | Frank Riemer label CANON page | Migrate to Vibe OS as Frank Riemer label row + archive standalone |
| **Music** | https://www.notion.so/arcanea/Music-30526ac2b7f680e7b177d7cc355005ab | Playlist/release feed for frankx.ai/music | Mirror only — auto-synced from `catalog/released/`; no manual edits |

---

## Schema 1 — AI Musicians Hub → "Music IS — Label Board"

Notion database mirrored from `catalog/master.csv`.

### Database properties

| Notion property | Type | Source field | Notes |
|---|---|---|---|
| Title | Title | `title` | Track title; canonical from catalog |
| Song ID | Text | `song_id` | Primary key for mirror sync |
| Persona | Select | `persona` | Persona codename / name |
| Label | Select | `label` | One of: frank-riemer / franks-vibes / arcanea / nona |
| Status | Select | `status` | draft / released / archived / refused-final |
| Engine | Select | `engine` | suno-v5 / udio / stable-audio / custom-lora |
| BPM | Number | `bpm` | |
| Key | Text | `key` | |
| Duration (s) | Number | `duration_seconds` | |
| Created date | Date | `created_date` | |
| Gated date | Date | `gated_date` | Empty until /music-release pass |
| Released date | Date | `released_date` | Empty until DistroKid mint |
| ISRC | Text | `isrc` | |
| Suno URL | URL | `suno_url` | |
| DistroKid ID | Text | `distrokid_id` | |
| Bandcamp ID | Text | `bandcamp_id` | |
| Cover (1:1) | Files | `cover_1x1_path` | Image attachment from local |
| Video (short) | URL | `video_short_path` | Or file attachment |
| Spotify Canvas | URL | `canvas_path` | |
| Royalty Graph ID | Text | `royalty_graph_id` | |
| Attestation Hash | Text | `attestation_hash` | |
| AI Disclosure | Text | `ai_disclosure_metadata` | |
| Notes | Text | `notes` | |
| Last Synced | Date (auto) | sync timestamp | |

### Database views

1. **All Releases** — released-status only; sorted by released_date DESC
2. **Drafts Pipeline** — draft-status only; sorted by created_date DESC; flag stales >30d
3. **By Label** — grouped by label
4. **By Persona** — grouped by persona; per-persona scorecard view
5. **Sync Pipeline** — gated but not yet released; tracks DistroKid mint progress
6. **Refused** — refused-final status (audit log)

### Notion → Excel rules

- **Notion is read-only for Frank to view.** Manual edits to Notion get **overwritten** on next sync from `catalog/master.csv`.
- If Frank wants to update a field, the change must be made in `catalog/master.csv` (or via `/music-archivist` agent CRUD), not in Notion.
- Sync cadence: weekly (Monday hygiene ritual) + on-demand on `/music-release` pass.

---

## Schema 2 — Vibe OS → "Music IS — Persona Canon Library"

Notion database; one row per persona; child page = full canon doc.

### Database properties

| Notion property | Type | Source | Notes |
|---|---|---|---|
| Title | Title | persona name (canonical) | |
| Persona Slug | Text | `<label>/<persona-codename>` | |
| Label | Select | label | |
| Status | Select | active / planned / retired | |
| Phase Priority | Select | Phase 1 / 2 / 3 / 4 / 5 / 6 | |
| Sound DNA Summary | Text (truncated) | from CANON.md sound DNA section | |
| Visual DNA Palette | Text | hex codes | |
| Voice DNA Tone | Text | tone register | |
| Audience Primary | Text | audience contract primary | |
| Monetization Stack | Multi-select | streaming / sync / NFT / fan-tier / merch / live | |
| Naming Pattern | Select | Pattern 1-6 (per naming-intelligence) | |
| Naming Score | Number | 6-axis test total / 18 | |
| Releases Count | Number (rollup) | from Music IS Label Board | |
| Last Release | Date (rollup) | from Music IS Label Board | |
| Spotify Artist URL | URL | post-DistroKid mint | |
| Bandcamp URL | URL | | |
| Notion canon child page | Relation | full CANON.md mirror | |

### Database views

1. **By Phase** — grouped by Phase Priority
2. **By Label** — grouped by Label
3. **Active Personas** — status=active
4. **Multiplication Audit** — release-cadence-baseline check (6 gated releases threshold per persona)

### Per-persona child page

For each persona row, a child page contains the full CANON.md mirror (read-only). Sync cadence: on every `verticals/music-is/labels/<label>/personas/<persona>/CANON.md` edit (manual sync trigger or weekly hygiene ritual).

---

## Schema 3 — FrankX Music Brand Strategy → Migrate + Archive

**Action:** migrate the standalone "FrankX Music Brand Strategy: Building a Multi-Genre Empire" page content into:
- **New Vibe OS persona row** for Frank Riemer (label-as-persona-as-self)
- **Vibe OS child page** for Frank Riemer with full label + persona CANON
- **Archive standalone page** with redirect note pointing to new Vibe OS row

**Migration steps:**
1. Read existing FrankX Music Brand Strategy Notion page content
2. Map content to Frank Riemer label CANON.md + Frank Riemer persona CANON.md (already created at `verticals/music-is/labels/frank-riemer/CANON.md` and `personas/frank-riemer/CANON.md`)
3. Reconcile any FrankX-Music-Brand-Strategy content NOT yet in CANON files → update CANON files
4. Push CANON content as Vibe OS child page for Frank Riemer
5. Replace standalone page content with redirect: "Migrated to Vibe OS — Frank Riemer persona row. See [Music IS — Persona Canon Library]."
6. Archive standalone page (keep for history; do not delete)

---

## Schema 4 — Music (page) → Mirror feed for frankx.ai/music

**Action:** Music page becomes mirror-only release feed. Auto-synced from `catalog/released/`. No manual edits.

### Page structure (post-migration)

```
# Music IS — Releases

> Auto-synced from local catalog. Per-label sub-sections.

## Frank Riemer
[Embedded view of Music IS — Label Board, filtered: label=frank-riemer + status=released]

## Alera (Arcanea)
[Embedded view: persona=alera + status=released]

## Frank's Vibes
[Embedded view: label=franks-vibes + status=released]

## Nona
[Embedded view: label=nona + status=released]

---

## Cross-Label Highlights
[Curated featured releases — auto-pulled top 3 per label by streaming count]

---

## Latest releases
[All releases sorted by released_date DESC, top 10]
```

Sync cadence: on every `/music-release` pass.

This page is also the data source for `frankx.ai/music/` Next.js sub-pages (Phase 4 onward).

---

## Sync mechanism

### Phase 0-1 (manual-assisted)

- Weekly Monday hygiene ritual: Frank or `music-archivist` agent runs sync script:
  ```
  /music-label-board sync-notion
  ```
- Script reads `catalog/master.csv` + per-persona CANON.md → pushes updates to Notion via Notion MCP
- Reports per-page sync status (added rows / updated rows / archived rows)
- Frank confirms sync; manual edits in Notion get logged (and overwritten next cycle)

### Phase 2+ (automated)

- n8n workflow triggers on:
  - Catalog CSV write (any CRUD op via `music-archivist`)
  - `/music-release` pass
  - Per-persona CANON.md edit
- Notion auto-update via Notion MCP API
- Conflict-resolution: Notion-edits-overwritten unless flagged for catalog-update via specific syntax

### MCP requirements

- Notion MCP must be authenticated (run `/notion authenticate` workflow)
- Required Notion permissions: read + write on three pages (AI Musicians Hub, Vibe OS, Music) + create/archive on FrankX Music Brand Strategy

### Refusal triggers

- Sync without catalog state validation → refuse (data integrity check first)
- Manual Notion edit promoted to catalog-truth → refuse (D8 violation)
- Notion-as-source-of-truth-drift → audit at next drift-test

---

## Per-persona Notion presence (Phase 3+ — composes with social mesh)

Each persona's Vibe OS row links to:
- Full canon child page
- Persona's external profiles (Spotify Artist, Bandcamp, social handles)
- Per-persona release sub-feed (filtered Music IS Label Board view)
- Per-persona OpenClaws Claw status (Phase 3+)

---

## Notion as discovery surface (NOT primary distribution)

Notion mirrors are for **internal observability** + **frank.ai/music data feed**. They are NOT primary fan-facing distribution. Fan discovery happens at:
- Spotify / Apple Music / Tidal / YT Music / etc.
- Bandcamp (per label)
- frankx.ai/music (per-label sub-pages Phase 4+)
- Social mesh (per-persona profiles Phase 3+)
- Arcanea Discord (Phase 4+ for Arcanea label)

---

## Refusals (per DECISIONS.md D8)

- Manual edit in Notion that contradicts catalog/master.csv → overwritten on next sync (never authoritative)
- Notion-OAuth-token in public substrate → refused (sovereignty)
- Notion-as-source-of-truth claim → audit + correct
- Sync to Notion without local catalog backup → refuse (data integrity)

---

**Built on SIP** — `verticals/music-is/notion/SCHEMA.md` · v0.1 · 2026-04-29 · 4 surfaces collapsed to mirror-only · Excel + markdown is truth · Phase 0-1 manual sync, Phase 2+ automated via n8n

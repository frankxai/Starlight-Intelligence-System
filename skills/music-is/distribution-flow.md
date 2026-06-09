---
name: music-is/distribution-flow
description: DistroKid + Bandcamp + frankx.ai/music + Spotify Canvas distribution. Triggers on /music-release distro phase, /music-sync-pitch, distribution requests. Senior tier (Sonnet 4.6) → external rails.
---

# Distribution Flow

> Catalog is truth; distribution mirrors. Lock metadata at gate-pass; push to rails; pull ISRC; update catalog row. No metadata edits at the distributor — every change goes back to catalog and re-mirrors.

## When this skill fires

- `/music-release <song-id>` GREEN-LIGHT triggers distro phase
- `/music-sync-pitch <song-id> <use-case>` — generates sync-licensing dossier
- Manual re-push (rare; used for metadata corrections after errata)
- Re-mirror to frankx.ai/music after catalog sync update

## Per-rail routing

### DistroKid (streaming primary)

For all four labels (with per-label master differences):

| Step | Action |
|---|---|
| 1 | Lock metadata from catalog row (title, persona-as-artist-name, label-as-record-label, ISRC pre-mint stub, AI-disclosure tag, release date) |
| 2 | Master file selected: dynamic-range-protected for Frank Riemer + Arcanea (cinematic-grade); streaming-loudness for Frank's Vibes + Nona |
| 3 | Cover 1:1 selected from asset bundle |
| 4 | DistroKid upload — currently manual web flow (Phase 2 target: distrokid-mcp automation) |
| 5 | DistroKid mints ISRC; pull ISRC into catalog row |
| 6 | Schedule release date per persona's release calendar |
| 7 | Update catalog row status: `gated → released`; populate ISRC, distrokid_id, released_date |
| 8 | Notify music-archivist for index update |

### Bandcamp (direct fan tier + limited)

Per-label routing per `LABELS.md`:
- Frank Riemer: always (direct + name-your-price + limited vinyl Phase 6)
- Arcanea: always (direct + Guardian-canon-tied limited)
- Frank's Vibes: optional (when warranted)
- Nona: Phase 2+ (merch-tied)

Manual upload at Phase 0; bandcamp-mcp Phase 6.

### frankx.ai/music (owned distribution)

Auto-synced from `catalog/released/`:
- Per-label sub-pages from Phase 4 (`/music/frank-riemer`, `/music/franks-vibes`, `/music/arcanea`, `/music/nona`)
- Auto-mirror new releases via build-time CSV ingestion
- No manual edit — catalog is truth

### Spotify Canvas (per release)

Spotify-for-Artists upload of Canvas (9:16 1080×1920 MP4 ≤8MB, 3-8s loop). Phase 0-3: manual upload via web UI; Phase 4 target: spotify-artists-mcp.

### Spotify playlist pitching

Per-release playlist pitch dossier (60-second pitch text + asset bundle reference + per-playlist-target list). Submitted via Spotify-for-Artists web UI. Pitching cadence per persona: at gate-pass → 4 weeks pre-release.

## Sync-licensing pitch (`/music-sync-pitch`)

Composes from `verticals/sound-intelligence/skills/sync-licensing/` patterns (imported, not duplicated).

Inputs:
- Song-id
- Use-case (film / TV / game / ad / brand / trailer / podcast)
- Target library or direct-deal target

Output: per-use-case pitch dossier with:
- Brief-fit analysis (sound DNA × use-case requirements)
- Master-rights status + license terms offered
- Stem availability (if available)
- Reference timecodes (best-fit moments in the song for placement)
- Royalty-cascade graph reference (so deal terms align with cascade sovereignty)

**Refused:**
- Sync deals that take exclusive worldwide rights without justification
- Deals that violate royalty-cascade sovereignty (single-buyer-takes-all when graph designed otherwise)
- Pitches that violate persona canon or label canon

## Refusal triggers

- Distro before `/music-release` GREEN-LIGHT
- Manual metadata edit at distributor (catalog is truth)
- Distro to platforms without published royalty-rate transparency
- Aggregator that takes master rights ownership
- Paid-playlist-placement networks
- AI-disclosure missing in metadata

## ISRC + DSP-mint integrity

After DistroKid mint:
- Pull ISRC + DistroKid ID into catalog row
- Update isrc-index.json
- Confirm DSP propagation (Spotify search + Apple Music search) within 7 days
- If propagation fails, raise to Frank for DistroKid support escalation

## Composes with

- `music-is/release-gate` (event-driven trigger on GREEN-LIGHT)
- `music-is/catalog-systems` (state transition + index update)
- `music-is/royalty-graph` (graph entry must reference distro IDs)
- `music-distributor` agent (orchestrator)
- `verticals/sound-intelligence/skills/sync-licensing` (sync-pitch patterns imported)

## Output

Per release: distro manifest (which rails got which masters/assets), ISRC + IDs pulled, scheduled-time per rail, catalog row update confirmation.

Per sync-pitch: dossier paste-ready for library submission or direct-deal email.

---

**Built on SIP** — `skills/music-is/distribution-flow.md` · v0.1 · Senior tier (Sonnet 4.6) → external rails · Catalog-truth-mirrored.

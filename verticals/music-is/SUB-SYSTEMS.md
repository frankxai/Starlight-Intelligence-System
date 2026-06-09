# SUB-SYSTEMS — Music IS / Arcanea Records

> Six sub-systems compose into one operating intelligence. Each owns a domain, an agent, a skill pack, and a command surface. The seventh agent (`music-curator`) gates across all six.

---

## Sub-system map

| Sub-system | Domain | Agent | Skill | Commands |
|---|---|---|---|---|
| **Catalog** | CSV master, draft/released/archived states, ISRC, metadata, version map | `music-archivist` (Haiku) | `music-is/catalog-systems` | `/music-song`, `/music-label-board` |
| **Persona** | Spawn, canon, voice-lock, retire | `persona-keeper` (Opus, per-persona) | `music-is/persona-canon` | `/music-persona` |
| **Asset** | Cover (nano banana), motion (Seedance), cinematic (Higgsfield), shorts/Canvas (Remotion) | `music-producer` (Sonnet) | `music-is/asset-render` | `/music-canvas` |
| **Distribution** | DistroKid, Bandcamp, frankx.ai/music, Spotify Canvas, sync libraries | `music-distributor` (Sonnet) | `music-is/distribution-flow` | `/music-release` (distro phase), `/music-sync-pitch` |
| **Amplification** | OpenClaws agents, Blotato + n8n orchestration, voice-locked drops | `music-amplifier` (Sonnet) | `music-is/amplification-mesh` | `/music-amplify` |
| **Monetization** | Royalty-cascade graph, sync deals, NFT/limited, fan-tier | `royalty-architect` (Sonnet) | `music-is/royalty-graph` | (cross-cutting; called by `/music-release`) |

`music-curator` (Opus) gates `/music-release` across all six.

`/music-suno-prompt` is the cross-sub-system grounding skill (composes Catalog + Persona + label-canon).

---

## 1. Catalog sub-system

**Purpose:** the source of truth for every song. Excel/CSV master; markdown corpus per persona; per-state folders for draft/released/archived; ISRC index post-DistroKid; royalty-graph reference.

**File contract:**
- `catalog/master.csv` — all songs, all states
- `catalog/draft/<song-id>.md` — pre-gate per-song doc (Suno URL, prompt used, engine version, persona, label, asset queue status)
- `catalog/released/<song-id>.md` — post-gate per-song doc (immutable; ISRC, release date, DistroKid status, asset bundle paths, royalty-graph entry ref)
- `catalog/archived/<song-id>.md` — withdrawn releases (rare; documented reason)
- `catalog/royalty-graph.json` — attribution-cascade graph (separate file, joined via song-id)

**CSV schema (master):**

```
song_id, title, persona, label, status, engine, suno_url, suno_prompt,
bpm, key, duration_seconds, structure_tags,
created_date, gated_date, released_date, archived_date,
isrc, distrokid_id, bandcamp_id,
cover_path, video_short_path, video_full_path, canvas_path,
royalty_graph_id, attestation_hash, ai_disclosure_metadata
```

**Operations:** add row, update row, transition state, dedupe, ISRC index, version map (per-song iterations).

**Cycle ritual:** weekly hygiene (orphan rows, missing metadata, stale drafts >30d, broken Suno-URL refs).

---

## 2. Persona sub-system

**Purpose:** spawn and defend per-persona canon. Persona is the unit. Persona-keeper is one Opus instance per active persona.

**File contract per persona** at `verticals/music-is/labels/<label>/personas/<persona-codename>/`:
- `CANON.md` — sound DNA + visual DNA + voice DNA + audience contract + monetization stack + AI-disclosure
- `assets/reference-images/` — visual DNA reference set (curated, not generated)
- `assets/voice-samples/` — voice clone reference (with consent disclosure if AI-cloned from any non-Frank voice)
- `social/voice-lock-{x,ig,tt,yt,sp}.md` — per-platform tone reference
- `social/banned-phrases.md` — refused vocabulary
- `social/frequency-caps.md` — per-platform daily/weekly limits
- `releases-index.md` — per-persona release pointer index

**Spawn discipline:** `/music-persona <label> <name>` requires sound DNA + visual DNA + voice DNA + audience contract + monetization stack at spawn time. Incomplete spawn refused.

**Multiplication discipline:** persona N+1 spawn refused before persona N hits release-cadence baseline (6 gated releases) AND persona-keeper signs off on N's stability.

**Retirement:** persona-retirement is a documented decision (canon-doc moves to `archived-personas/`; releases stay in `catalog/released/` with status flag).

---

## 3. Asset sub-system

**Purpose:** every release ships with a complete asset bundle. No exceptions.

**Asset bundle per release:**

| Asset | Format | Specs | Engine |
|---|---|---|---|
| **Cover** | PNG | 3000×3000 master + 1:1 + 16:9 + 9:16 variants | nano banana 2 |
| **Motion video — short** | MP4 | 9:16, 1080×1920, 15-30s | Seedance 2 |
| **Motion video — square** | MP4 | 1:1, 1080×1080, 30-60s | Seedance 2 |
| **Motion video — full** (cinematic-grade labels: Frank Riemer, Arcanea) | MP4 | 16:9, 1920×1080, full song length | Higgsfield |
| **Spotify Canvas** | MP4 | 9:16, 1080×1920, 3-8s loop, ≤8MB | Remotion |
| **Lyric video** (Phase 2+) | MP4 | 16:9, 1920×1080, full song length | Remotion + Whisper alignment |

**Pipeline:** Suno URL → song-intake → asset queue → music-producer dispatches in parallel (cover + motion + Canvas) → assets land in `catalog/draft/<song-id>/assets/` → bundle complete check → ready for `/music-release` gate.

**Per-label visual DNA:** music-producer pulls visual DNA from `labels/<label>/CANON.md` and persona DNA from persona's `CANON.md`. Asset that violates either is refused.

**Phase 2 target:** autonomous render (Suno URL → full asset bundle in <15min) via n8n flow.

---

## 4. Distribution sub-system

**Purpose:** push gated releases to streaming, direct, and discovery surfaces. Catalog is truth; distro mirrors.

**Distribution rails (per-label routing):**

| Rail | Frank Riemer | Frank's Vibes | Arcanea | Nona |
|---|---|---|---|---|
| **DistroKid** | Yes (sync-grade master, dynamic-range protected) | Yes (streaming-loudness master) | Yes (cinematic master, dynamic-range protected) | Yes (streaming-loudness master, peak-state) |
| **Bandcamp** | Yes (direct, name-your-price option) | Optional (when warranted) | Yes (Guardian-canon merch tied) | Optional (Phase 2+ when merch ships) |
| **frankx.ai/music** | Yes (per-label sub-page Phase 4+) | Yes | Yes | Yes |
| **Spotify Canvas** | Yes (per release) | Yes (non-optional — drives discovery) | Yes (per release) | Yes (per release) |
| **Sync library pitching** | Yes — primary monetization rail | Yes (lifestyle/brand) | Yes — primary (film/TV/game) | Optional (sports/fitness ads) |
| **NFT / limited (Phase 6+)** | Yes (vinyl) | Optional | Yes (Guardian-canon-tied mints) | Optional (merch-tied) |

**Operations:**
- Lock metadata from catalog row at gate-pass
- Push to DistroKid (one-shot, monitored for ISRC mint)
- Pull ISRC + update catalog row
- Schedule release date per persona's release-cadence
- Upload Spotify Canvas
- Generate sync-library pitch dossier per use-case (`/music-sync-pitch`)
- Sync to frankx.ai/music feed

**Refusal triggers:** distro before GREEN-LIGHT; manual metadata edit (catalog is truth); aggregator that takes master rights; paid-playlist placement.

---

## 5. Amplification sub-system + OpenClaws

**Purpose:** voice-locked, frequency-capped, AI-disclosed amplification across the social mesh.

**Per-persona Claws (Phase 3+):**

| Claw | Platform | Output cadence | Voice-lock source |
|---|---|---|---|
| **Claw-X** | X / Twitter | up to 2/day | `social/voice-lock-x.md` |
| **Claw-IG** | Instagram | up to 1/day | `social/voice-lock-ig.md` |
| **Claw-TT** | TikTok | up to 1/day | `social/voice-lock-tt.md` |
| **Claw-YT** | YouTube Shorts | up to 1/day | `social/voice-lock-yt.md` |
| **Claw-SP** | Spotify | per-release Canvas + monthly playlist pitch | `social/voice-lock-sp.md` |

**Frequency cap:** ≤3 drops/day per persona across mesh.

**Orchestration:** music-amplifier dispatches Claws via Blotato (publishing primitives) + n8n (workflow + safety gates). Every drop passes voice-lock check before publish.

**Refusal triggers:** voice-lock fails; frequency cap exceeded; drop without canon-anchoring; engagement-bot pattern; AI-disclosure missing from persona bio.

**Operations:**
- Schedule drops per release calendar
- Generate per-platform copy in persona voice
- Voice-check before publish (auto-rollback if fail)
- Observe per-platform performance metrics
- Feedback loop: per-Claw output performance feeds future copy generation

---

## 6. Monetization sub-system + royalty-cascade graph

**Purpose:** every monetization rail has its attribution-cascade graph designed first, encoded second. Royalties retrofitted onto already-released work are theater.

**Royalty graph schema (`catalog/royalty-graph.json`):**

```json
{
  "song_id": "...",
  "label": "...",
  "persona": "...",
  "release_date": "...",
  "contributors": [
    {"name": "Frank Riemer", "role": "composer", "split_percent": 50, "pro_id": "..."},
    {"name": "Arcanea Records BV", "role": "publisher", "split_percent": 25, "pro_id": "..."},
    {"name": "[engineer/producer]", "role": "...", "split_percent": "...", "pro_id": "..."}
  ],
  "rails": {
    "streaming": {"distrokid_id": "...", "splits": "..."},
    "bandcamp": {"bandcamp_id": "...", "direct_split": "..."},
    "sync": {"library_partners": [...], "direct_deal_history": [...]},
    "nft": {"chain": "...", "contract": "...", "royalty_split_onchain": "..."},
    "fan_tier": {"platform": "...", "tier_design": "..."}
  },
  "parent_canon": {"label": "...", "persona": "...", "guardian": "..."},
  "attestation_hash": "..."
}
```

**Operations:**
- Add graph entry per `/music-release` gate-pass
- Design cascade per monetization rail before activation
- Compose with Wealth IS theses for revenue forecasting

**Refusal triggers:** NFT mint without graph; sync deal that violates cascade sovereignty; limited-edition without per-edition pricing + cascade-split; fan-tier without cascade design.

---

## Cross-sub-system flows

**The release flow (most important):**

```
/music-song <suno-url> <persona>
  → music-archivist creates catalog/draft/<song-id>.md
  → music-producer queues asset render
  → assets land in catalog/draft/<song-id>/assets/

[when ready] /music-release <song-id>
  → music-curator (Opus) GATES
    ├─ Pass: parallel dispatch
    │   ├─ music-distributor → DistroKid + Spotify Canvas + frankx.ai/music
    │   ├─ music-amplifier → schedule N social drops via Claws
    │   ├─ royalty-architect → add catalog/royalty-graph.json entry
    │   ├─ music-archivist → transition draft → released
    │   └─ Frank notified
    └─ Refuse: revisions or REFUSED-final, written reason in catalog
```

**The persona spawn flow:**

```
/music-persona <label> <name>
  → persona-keeper (Opus) requires:
    ├─ sound DNA spec
    ├─ visual DNA spec + reference images
    ├─ voice DNA spec
    ├─ audience contract
    └─ monetization stack
  → If complete: scaffold labels/<label>/personas/<name>/ + index in LABELS.md
  → If incomplete: refused with specific gaps named
```

**The amplification flow (per-release):**

```
[release gated] → music-amplifier
  → for each persona Claw: generate per-platform copy + voice-check
  → schedule N drops via Blotato + n8n per release calendar
  → enforce frequency caps
  → observe performance, feed back into copy generation
```

---

**Built on SIP** — Music IS vertical SUB-SYSTEMS.md · v0.1 · 2026-04-29 · 6 sub-systems + 1 cross-cutting curator gate.

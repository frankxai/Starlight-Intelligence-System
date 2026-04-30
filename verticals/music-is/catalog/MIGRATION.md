# Catalog Migration Plan — Existing 500+ Suno Library → Music IS

> Frank's existing curated Suno catalog (~500+ tracks; 46+ formally cataloged + indexed per FrankX `MUSIC_CATALOG_INDEX.md`) needs migration into Music IS catalog with persona attribution, label assignment, and gate-state assignment.

**Status:** Phase 0 → Phase 1 critical path
**Owner:** Frank + `music-archivist` (Haiku) + `music-curator` (Opus for canon-anchoring decisions)
**Date:** 2026-04-29

---

## Migration scope

### Tier 1 — Already-curated catalog (~46 tracks)

Frank's MUSIC_CATALOG_INDEX.md (FrankX repo) has 46 tracks formally cataloged with metadata. These migrate **first** with high-confidence canon-anchoring.

### Tier 2 — Wider curated set (~500 total)

Beyond the 46 indexed, Frank has ~454 additional tracks in the broader curated set. These need fresh canon-anchoring decisions (which label / which persona).

### Tier 3 — Full Suno generation history (~12,000+)

The complete Suno history. Most are not catalog-worthy; they are iteration-residue. Migration of Tier 3 is **not** Phase 0-1 scope. Selective archive only.

---

## Migration phases

### Migration Phase A — Tier 1 (week 1 of Phase 1)

**Target:** all 46 formally-cataloged tracks ingested into `catalog/master.csv` with full metadata.

**Process:**
1. Parse FrankX `MUSIC_CATALOG_INDEX.md`
2. For each track: extract title, persona-attribution (per Frank's existing 9 Suno custom voice personas, but these are voice-tools not public personas; need re-attribution), genre cluster, mood tags, play counts
3. Map each track to one of four Music IS labels:
   - **Frank Riemer** — neo-classical / cinematic-piano / contemplative tracks (low-tempo solo-piano + piano+strings)
   - **Frank's Vibes** — electronic / lo-fi / chill-house / vibe-engineered tracks
   - **Arcanea / Alera** — 528 Hz / healing-frequency / cinematic-mythic / score-grade tracks (especially the existing 528Hz subset!)
   - **Nona** — punk / alt / cathartic tracks (likely few in current catalog; this label is Phase 2+)
4. For each track, assign persona:
   - Frank Riemer label → Frank Riemer persona (only persona)
   - Arcanea label → Alera persona (Phase 1 active) OR pending-Guardian-assignment (Lyssandria, Maylinn, etc.)
   - Frank's Vibes → naming-pending (Lumen / Aether / Dawn — Frank to lock)
5. Set status:
   - **Released-equivalent:** if track is already on Spotify/Apple/Bandcamp, status = `released`; backfill ISRC + DistroKid IDs
   - **Catalog-worthy not-yet-released:** status = `draft`; eligible for `/music-release` gate after asset bundle generated
   - **Iteration-residue:** status = `archived` (kept for history; not in main release feed)
6. Asset path backfill:
   - If existing cover art exists: import to `catalog/assets/<song-id>/` and reference
   - If no asset bundle: queue `music-producer` for asset render
7. Royalty graph backfill:
   - For released-status tracks: backfill `catalog/royalty-graph.json` entries with default Music IS cascade (composer 50% / publisher 25% / label 25%); per-Arcanea tracks adjust per Arcanea ecosystem cascade
   - Flag any sync-deal-history if known

**Output:**
- 46 catalog rows in `catalog/master.csv` (status appropriately split: released / draft / archived)
- 46 per-song markdown docs in `catalog/<state>/<song-id>.md`
- Royalty graph entries for released-status
- Sync hygiene report flagging any incomplete fields

### Migration Phase B — Tier 2 (weeks 2-4 of Phase 1)

**Target:** all 500+ curated tracks ingested.

**Process:**
1. Frank parses his curated set per genre cluster (10 clusters per FrankX `MUSIC_CATALOG_INDEX.md`):
   - Ambient/Meditation (with 528Hz subset → Alera/Arcanea label!)
   - Orchestral/Cinematic → Arcanea / per-Guardian
   - Electronic/EDM → Frank's Vibes
   - Hip-Hop/Boom Bap → no current label-fit (route to archived or Phase 6+ new label discussion)
   - Lo-Fi/Focus → Frank's Vibes (lo-fi-evening sub-cohort)
   - Ethereal/Immersive → Arcanea (cinematic-mythic)
   - Energy/Motivation → Nona (punk/peak-state) OR Frank's Vibes (gym-electronic)
   - Emotional/Cinematic → Arcanea OR Frank Riemer
   - World Music Fusion → archived or Phase 6+ new label discussion
   - Experimental/Avant-Garde → Arcanea-experiments OR archived
2. For each track, run canon-anchoring decision via `music-curator` (Opus):
   - Which label?
   - Which persona?
   - Status (released / draft / archived)?
3. Batch-intake via `music-archivist` (Haiku) — parallel processing 25-50 per session
4. Asset bundle backfill for any track ascending to `draft` status
5. Royalty graph entries for any track ascending to `released` status

**Output:**
- 500+ catalog rows
- Status breakdown estimate:
  - ~30-60 to Frank Riemer label
  - ~150-200 to Frank's Vibes label
  - ~100-150 to Arcanea label (with 528Hz subset → Alera priority)
  - ~10-30 to Nona label (Phase 2+ activation candidates)
  - ~150-200 archived (iteration-residue or wrong-canon)

### Migration Phase C — Selective Tier 3 (Phase 6+)

The remaining 11,500+ Suno generations. Selective archive only — most are iteration-residue not worth catalog ingest. Run a coarse classifier (Haiku batch) to identify any potentially-worth-catalog candidates that didn't make Frank's curated list. Likely yields 50-150 additional candidates over time.

---

## Persona-attribution decision tree (for each migration track)

```
1. Is the track Frank-as-self contemplative neo-classical / cinematic-piano (no vocal, dynamic-range-protected)?
   → YES: Frank Riemer label, Frank Riemer persona
   → NO: continue

2. Does the track contain healing-frequency anchoring (528 Hz, other Solfeggio) OR cinematic-orchestral-hybrid posture (mythic, score-grade)?
   → YES: Arcanea label
     → Is it 528 Hz tuned + voice/vocal-led? → Alera persona
     → Is it 174 Hz / ancient / sovereign? → Lyssandria persona (Phase 2+)
     → Is it 417 Hz / heart-frequency? → Maylinn persona (Phase 3+)
     → Is it cross-Guardian or experimental? → Arcanea-experiments sub-folder
     → Else: pending-Guardian-assignment (Phase 1 mid review)
   → NO: continue

3. Is the track electronic / lo-fi / chill-house / vibe-engineered (streaming-loudness optimized; vibe-context primary)?
   → YES: Frank's Vibes label
     → Sub-cohort: lo-fi-evening / journal? → persona #1 (Lumen / Aether / Dawn pending Frank lock)
     → Sub-cohort: gym-electronic? → persona #2 (Phase 2)
     → Sub-cohort: chill-house? → persona #3 (Phase 4)
   → NO: continue

4. Is the track punk / alt / cathartic (raw vocals, distorted guitars, peak-state)?
   → YES: Nona label, Razor (Phase 2+) or other Nona persona pending
   → NO: continue

5. Does the track fit none of the four labels?
   → Archive with note "no current label fit; potential Phase 6+ new label discussion"
```

---

## Existing 9 Suno custom voice personas — handling

Per FrankX MUSIC_CATALOG_INDEX.md, Frank has 9 existing Suno custom voice personas:

- Right Here · Aqui · RU Arcanean Vibe Gods · Arcanean Vibe Gods · Dadada Weihnachtszeit · All In · Suno Swims · Growth · Oh Arcanea D&B (Legacy)

These are **voice-tools, not public personas.** Per `naming-intelligence/banned-names.md`, these names are banned for direct promotion to public personas without explicit `/music-persona` spawn through naming-intelligence + canon.

**Migration handling:**
- Tracks generated with these voice-tools are migrated to appropriate **public** personas (Frank Riemer / Alera / Frank's Vibes #1 / Nona) per the decision tree above
- The voice-tool name is preserved in `notes` field for provenance
- The voice-tool doesn't carry into the public-persona-attribution

If Frank wants to promote one of these voice-tools to a public persona (e.g., "All In" or "Growth" could fit certain audience contracts), it requires explicit `/music-persona` spawn with full 5-dimension canon completion. This is a Phase 1+ decision point.

---

## Time + cost estimate

| Phase | Duration | Token cost (approx) | External cost |
|---|---|---|---|
| Migration A (46 tracks) | 1 week (Phase 1 week 1) | ~50K tokens (Sonnet curation + Haiku CRUD) | minimal (no new asset render; backfill from existing) |
| Migration B (454 tracks) | 3 weeks (Phase 1 weeks 2-4) | ~500K tokens (heavy Opus canon-anchoring + Haiku CRUD) | medium (some asset re-render where existing assets violate DNA) |
| Migration C (selective Tier 3) | Phase 6+ ongoing | variable | minimal |

---

## Refusals

- Migration without persona-attribution (orphan track) → archived, not catalog-active
- Migration that promotes a Suno custom voice persona to public persona without `/music-persona` spawn → refuse
- Migration without canon-anchoring decision (which label) → refuse; defer to next batch
- Migration of tracks that violate persona's monetization stack → audit; route to archived if no fit
- Migration of any track with vocal-clone of identifiable non-Frank artist (any track with imitation) → audit; refuse promotion; archive

---

## Output of migration

After Migration Phase A + B complete:

- `catalog/master.csv` populated with 500+ rows, status-split appropriately
- `catalog/released/` populated with already-released tracks (per-track markdown docs)
- `catalog/draft/` populated with not-yet-released tracks (per-track markdown docs)
- `catalog/archived/` populated with iteration-residue + wrong-canon tracks
- `catalog/royalty-graph.json` populated with entries for all `released` tracks
- Notion AI Musicians Hub mirrored from catalog (post-migration)
- Per-persona `releases-index.md` populated

---

## Phase 1 completion criteria for migration

✅ Migration Phase A complete (46 tracks)
✅ At least 100 tracks total ingested (Phase A + partial Phase B)
✅ Frank Riemer persona has at least 12 tracks ready for `/music-release` cycle
✅ Alera persona has at least 6 tracks identified for first EP (per Alera CANON.md release plan)
✅ Frank's Vibes #1 persona has at least 12 tracks (post-name-lock)
✅ Royalty graph populated for all `released` status entries

---

**Built on SIP** — `verticals/music-is/catalog/MIGRATION.md` · v0.1 · 2026-04-29 · 3-tier migration plan · Phase 1 critical path · Composes with FrankX MUSIC_CATALOG_INDEX

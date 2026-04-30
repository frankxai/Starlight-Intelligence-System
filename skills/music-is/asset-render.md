---
name: music-is/asset-render
description: Orchestrate cover (nano banana 2), motion (Seedance 2), cinematic (Higgsfield), shorts/Canvas (Remotion) for a draft song. Triggers on asset render requests, /music-canvas, new song-intake events. Senior tier (Sonnet 4.6) → external engines.
---

# Asset Render Orchestration

> Every release ships with a complete asset bundle. No exceptions. The bundle is generated from persona canon (visual DNA) + label canon (visual DNA) + song metadata (mood/tempo/structure). The skill orchestrates four engines + Remotion programmatic templates.

## When this skill fires

- After `/music-song` intake — auto-queued asset render
- `/music-canvas <song-id>` — explicit Spotify Canvas + Reel/Short generation
- Manual re-render request (e.g., asset rejected at gate)

## Required inputs

- **Song-id** (from catalog/draft)
- **Persona canon** (visual DNA from `verticals/music-is/labels/<label>/personas/<persona>/CANON.md`)
- **Label canon** (visual DNA from `verticals/music-is/labels/<label>/CANON.md`)
- **Song metadata** (title, BPM, mood, structure tags)

## Asset bundle (per release)

| Asset | Format | Specs | Engine |
|---|---|---|---|
| Cover master | PNG | 3000×3000, 300 DPI | nano banana 2 |
| Cover 1:1 | PNG | 1500×1500 (DSP-ready) | derived from master |
| Cover 16:9 | PNG | 1920×1080 | nano banana 2 (re-prompted) |
| Cover 9:16 | PNG | 1080×1920 | nano banana 2 (re-prompted) |
| Motion video — short | MP4 | 9:16, 1080×1920, 15-30s | Seedance 2 |
| Motion video — square | MP4 | 1:1, 1080×1080, 30-60s | Seedance 2 |
| Motion video — full (cinematic-grade only: Frank Riemer + Arcanea) | MP4 | 16:9, 1920×1080, full song length | Higgsfield |
| Spotify Canvas | MP4 | 9:16, 1080×1920, 3-8s loop, ≤8MB | Remotion |
| Lyric video (Phase 2+, if lyrics) | MP4 | 16:9, 1920×1080, full song length | Remotion + Whisper alignment |

## Engine prompt construction

### Cover (nano banana 2)

Three-layer prompt:
- **Layer 1 (label visual DNA):** palette, typography lock, composition rules from label CANON
- **Layer 2 (persona visual DNA):** persona-specific reference set, persona depiction posture
- **Layer 3 (song-specific):** mood signal from song metadata + intent

Example for a Frank Riemer release titled "Threshold":
```
Subject: minimalist piano composition cover
Palette: cool grey #2D2D2F, near-black #0A0A0A, single warm accent #C9A876
Composition: large negative space, single small focal element (hand on piano keys, side angle), texture-of-piano-felt subtle background
Typography: lock for title placement bottom-third, "Frank Riemer" small top-right
Mood: contemplative, slow, threshold-of-something
Reference set: {persona reference image hashes}
Refused: any face, any color saturation above 30%, any AI-fantasy-painterly style
```

### Motion video — short (Seedance 2)

Prompt anchors:
- Persona visual DNA + label visual DNA
- Song mood + tempo (motion timing matches)
- Per-platform aspect ratio
- 15-30s arc with clear visual beat

### Motion video — cinematic full (Higgsfield, Frank Riemer + Arcanea only)

Higgsfield-specific:
- Cinematic camera language (dolly, push-in, parallax)
- Per-Guardian aesthetic for Arcanea label (hyper-realistic + mythic)
- Per-album-arc visual narrative for Frank Riemer

### Spotify Canvas (Remotion)

Programmatic per-persona template:
- 3-8s loop, must perfect-loop
- Per-persona layout token from `assets/brand-kit/canvas-template-{persona}.json`
- Title typography lock from label CANON
- One key motion element (looping subtle motion, not flashy)

## Pipeline orchestration

### Phase 0-1 (manual-assisted)

1. Sonnet composes prompts per asset type
2. Sonnet calls external API (nano banana, Seedance, Higgsfield) with composed prompt
3. Sonnet (or Frank-in-loop) reviews output; reject + re-prompt if violates DNA
4. On accept: assets land in `catalog/draft/<song_id>/assets/`
5. Bundle-complete check: all required formats present?
6. Notify `music-archivist` to update catalog row asset paths

### Phase 2 (autonomous)

1. n8n flow triggered by song-intake event
2. Parallel render: cover + motion-short + motion-square + Canvas (cinematic full sequential)
3. Auto-DNA-check on outputs (image classifier against reference set)
4. Auto-retry up to 3x on DNA failure; escalate to Frank if fail
5. Bundle-complete check; notify archivist

## Refuses

- Render without persona canon reference
- Asset that violates label visual DNA (e.g., Frank Riemer cover with face — refused)
- Asset that violates persona visual DNA (e.g., Nona cover with sunset palette — refused)
- AI-vocal-cloned video voice without consent on file (lyric video)
- Render with engine outputs claimed as human-painted/photographed
- Bundle ship to catalog before all required formats present (no partial bundles)

## Composes with

- `music-is/persona-canon` (visual DNA source)
- `music-is/song-intake` (event-driven trigger)
- `music-is/release-gate` (asset bundle complete = gate-eligible)
- `music-producer` agent (orchestration)

## Output

Per render request: asset bundle paths + DNA-check pass/fail + Frank-review-required flag (if any DNA-check uncertain) + bundle-complete-status.

## Cost discipline

- Cover regeneration: max 5 iterations per song (each iteration logged)
- Motion video regeneration: max 3 iterations per song
- Higgsfield (most expensive): max 2 iterations per song; manual review before re-render
- Total per-song asset cost cap: $X (defined per persona's monetization stack ROI)

---

**Built on SIP** — `skills/music-is/asset-render.md` · v0.1 · Senior tier (Sonnet 4.6) orchestrates external engines · Persona + label DNA-locked · Phase 2 target: autonomous via n8n.

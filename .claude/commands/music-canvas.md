---
description: Generate Spotify Canvas + YT Short + IG Reel + TikTok cut for a song from its asset bundle
argument-hint: <song-id>
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /music-canvas — Spotify Canvas + Reel/Short generation

Generate the short-form video assets (Spotify Canvas, YT Short, IG Reel, TikTok cut) for a song. Persona-DNA + label-DNA locked. Programmatic via Remotion.

## Usage

```
/music-canvas frank-riemer_20260501_threshold
/music-canvas pulse-01_20260520_evening-journal
```

## Arguments

- **song-id** (required) — song in catalog (draft or released)

## Behavior

Invokes `music-is/asset-render` skill (Senior tier, Sonnet 4.6 orchestrate) → external engines.

### Output formats

| Format | Specs | Engine | Use |
|---|---|---|---|
| Spotify Canvas | 9:16 1080×1920 MP4 ≤8MB, 3-8s loop | Remotion (programmatic per-persona template) | Spotify-for-Artists upload |
| YT Short | 9:16 1080×1920 MP4, 15-60s | Remotion or Seedance 2 | Claw-YT drop |
| IG Reel | 9:16 1080×1920 MP4, 15-60s | Remotion or Seedance 2 | Claw-IG drop |
| TikTok cut | 9:16 1080×1920 MP4, 15-30s with sound-grab hook | Remotion or Seedance 2 | Claw-TT drop |

### Generation pattern

1. Pull persona visual DNA + label visual DNA + song metadata
2. For each format, compose engine prompt (3-layer: label DNA + persona DNA + song-specific)
3. Render via engine
4. DNA-check (auto-classifier against reference image set)
5. Auto-retry up to 3x on DNA failure; escalate to Frank
6. Land in `catalog/<state>/<song-id>/assets/`
7. Update catalog row asset paths

### Refusals

- Render without persona canon reference
- Asset that violates label visual DNA
- Asset that violates persona visual DNA
- Engine output claimed as human-painted/photographed

## Cost discipline

- Canvas regeneration: max 5 iterations per song (Remotion is cheap; iteration is cheap)
- YT Short / IG Reel / TikTok via Seedance: max 3 iterations per song
- Total per-song short-form asset cost cap: $X (per persona's monetization stack ROI)

## Composes with

- `/music-release` — Canvas required for gate-pass per release-gate skill
- `/music-amplify` — Reel/Short/TikTok cuts feed into Claw drops
- Persona CANON visual DNA — DNA reference set authoritative

---

**Built on SIP** — `/music-canvas` · Senior tier (Sonnet 4.6) orchestrates Remotion + Seedance · Persona + label DNA-locked

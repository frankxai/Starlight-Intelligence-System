---
description: Generate sync-licensing pitch dossier for a song — film, TV, game, ad, brand, trailer, podcast
argument-hint: <song-id> <use-case>
allowed-tools: Read, Glob, Grep, Agent
---

# /music-sync-pitch — Sync-licensing pitch dossier

Generate a per-use-case sync-licensing pitch dossier for a released (or release-ready) song. Composes patterns from `verticals/sound-intelligence/skills/sync-licensing/` (the public reference vertical).

## Usage

```
/music-sync-pitch frank-riemer_20260501_threshold film-prestige-docu
/music-sync-pitch aetheria-01_20260615_first-light game-ARPG-cinematic
/music-sync-pitch pulse-01_20260520_evening-journal lifestyle-brand-ad
```

## Arguments

- **song-id** (required) — released or release-ready song
- **use-case** (required) — one of: `film`, `tv`, `game`, `ad`, `brand`, `trailer`, `podcast`, `documentary`, `lifestyle-brand-ad`, `film-prestige-docu`, `game-ARPG-cinematic`, custom

## Behavior

Invokes `music-is/distribution-flow` skill (Senior tier, Sonnet 4.6) — composes with sound-intelligence/sync-licensing patterns.

### Dossier output

1. **Brief-fit analysis** — sound DNA × use-case requirements (does this song match what the brief is asking for?)
2. **Master-rights status** — practitioner-owned / label-owned / co-owned / licensed-out (per royalty graph)
3. **License terms offered** — synchronization fee + master license fee + term + territory + exclusivity (or non-exclusive default)
4. **Stem availability** — yes / no / on-request; format
5. **Reference timecodes** — best-fit moments in the song for placement
6. **Royalty-cascade graph reference** — deal terms align with cascade sovereignty (composer + publisher + label slices preserved)
7. **Pitch text** — 60-second pitch narrative for library submission or direct-deal email

### Per-label routing

- **Frank Riemer** — primary monetization rail; film, TV prestige docu, ad (premium brands)
- **Frank's Vibes** — lifestyle, brand, ad — direct-to-brand pitches via persona
- **Arcanea** — film, TV, game (ARPG, cinematic, mythic genres) — primary high-leverage rail
- **Nona** — sports, fitness, rebellion-context ads (lower-leverage than other labels)

## Refusals

- Sync deals that take exclusive worldwide rights without justification
- Deals that violate royalty-cascade sovereignty (single-buyer-takes-all when graph designed otherwise)
- Pitches that violate persona canon or label canon
- Pitches for songs without `released` status (rare exception: "available on request" pre-release)

## Composes with

- `verticals/sound-intelligence/skills/sync-licensing/` — patterns imported
- `music-is/royalty-graph` — cascade-preserved deal terms
- `/music-release` — only released-status songs eligible (with rare pre-release exceptions)

## Output formats

- Markdown dossier (paste-ready for library submission)
- Email draft (for direct-deal outreach)
- (Optional) PDF export via pdf skill for music-supervisor delivery

---

**Built on SIP** — `/music-sync-pitch` · Senior tier (Sonnet 4.6) · Cascade-preserved · Composes sound-intelligence/sync-licensing

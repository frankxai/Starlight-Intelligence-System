---
description: Spawn a new AI musician persona under one of the four labels
argument-hint: <label> <persona-codename>
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /music-persona — Spawn a persona

Spawn a new persona under one of the four labels (frank-riemer, franks-vibes, arcanea, nona). Persona-keeper (Opus 4.7) gates spawn; refused if any of the 5 canon dimensions is incomplete.

## Usage

```
/music-persona franks-vibes pulse-01
/music-persona arcanea aetheria-01
/music-persona nona razor-01
```

## Arguments

- **label** (required) — one of: `frank-riemer`, `franks-vibes`, `arcanea`, `nona`
- **persona-codename** (required) — codename-first per DECISIONS.md D4; ships under codename for ≥3 gated releases before public-name decision

## Behavior

Invokes `music-is/persona-canon` skill (Apex tier, Opus 4.7).

Required spawn input (refused if incomplete):

1. **Sound DNA** — genre primary + sub-genre, reference triangle (3 named artists), harmonic vocabulary, tempo bands, vocal posture (with AI-clone disclosure if applicable), production posture, 5-10 Suno prompt anchors
2. **Visual DNA** — color palette (max 5 hex colors), typography lock, cover composition rules, reference image set (5-15 curated), banned visual patterns
3. **Voice DNA** — per-platform voice samples (X 140char, IG 200char, TikTok 15words, YT 60char title, SP 80char caption, fan email 300words), first-person posture, cadence, banned phrases, tone register
4. **Audience contract** — primary listener context, demographic hypothesis, discovery surface, compounding mechanism
5. **Monetization stack** — streaming posture, direct rail, sync posture, NFT/limited posture, royalty-cascade graph stub

## On successful spawn

Scaffolds:
- `verticals/music-is/labels/<label>/personas/<persona>/CANON.md`
- `verticals/music-is/labels/<label>/personas/<persona>/assets/{reference-images,voice-samples,brand-kit}/`
- `verticals/music-is/labels/<label>/personas/<persona>/social/{voice-lock-x,voice-lock-ig,voice-lock-tt,voice-lock-yt,voice-lock-sp,banned-phrases,frequency-caps}.md`
- `verticals/music-is/labels/<label>/personas/<persona>/releases-index.md`
- Updates `verticals/music-is/LABELS.md` persona allocation map
- Registers persona row in `catalog/master.csv` (no songs yet)

## Refusals

- Any of 5 canon dimensions incomplete
- Persona N+1 spawn before persona N hits release-cadence baseline (6 gated releases) — multiplication discipline per SOUL.md
- AI-vocal-clone targeting any non-Frank identifiable artist without written consent on file
- Cross-label persona move (a persona belongs to one label)

## Composes with

- `/music-song` — first generation can be intaken after spawn
- `/music-suno-prompt` — synthesizes prompts grounded in persona's sound DNA
- `/music-release` — gates the persona's first releases

---

**Built on SIP** — `/music-persona` · Apex tier (Opus 4.7) · 5-dimension canon required · multiplication-discipline enforced

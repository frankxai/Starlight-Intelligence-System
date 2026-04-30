---
description: Push existing release to N more channels via Claws + Blotato + n8n; voice-locked, frequency-capped, AI-disclosed
argument-hint: <song-id> <channels>
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /music-amplify — Cross-platform amplification scheduling

Schedule cross-platform amplification drops for a released song via the OpenClaws mesh (Claw-X, Claw-IG, Claw-TT, Claw-YT, Claw-SP). Voice-lock-checked, frequency-capped, AI-disclosed.

## Usage

```
/music-amplify frank-riemer_20260501_threshold all
/music-amplify pulse-01_20260520_evening-journal x,ig,tt
/music-amplify aetheria-01_20260615_first-light yt,sp
```

## Arguments

- **song-id** (required) — released song from catalog
- **channels** (required) — `all` OR comma-list of: `x`, `ig`, `tt`, `yt`, `sp`

## Behavior

Invokes `music-is/amplification-mesh` skill (Senior tier, Sonnet 4.6) → `music-amplifier` agent.

### Per-Claw drop generation

For each requested channel, the Claw:
1. Pulls voice-lock from `verticals/music-is/labels/<label>/personas/<persona>/social/voice-lock-<platform>.md`
2. Composes drop content per platform (X 280char post + thread; IG Reel caption + slides; TikTok 15-30s vertical + caption; YT Shorts; Spotify Canvas + playlist pitch)
3. Voice-lock check (auto-rollback up to 3 attempts; escalates to Frank on persistent fail)
4. Frequency-cap check (≤3 drops/day per persona across mesh)
5. AI-disclosure check (persona bio carries disclosure on platform)
6. Schedule via Blotato + n8n

## Default amplification cadence (post-release)

```
T+0h     Spotify Canvas live (auto via /music-release)
T+2h     Claw-X drop 1 (release announcement)
T+6h     Claw-IG Reel
T+24h    Claw-TT vertical
T+48h    Claw-YT Short
T+72h    Claw-X drop 2 (production angle)
T+1w     Claw-IG carousel
T+2w     Claw-TT drop 2
T+4w     Claw-X drop 3
```

`/music-amplify` extends or modifies this default for older catalog re-amplification.

## Refusals

- Voice-lock fails 3+ times → escalate
- Frequency cap exceeded → defer to next slot
- AI-disclosure missing from persona bio → refuse, fix bio first
- Engagement-bot pattern → refuse, audit
- Drop without canon-anchoring (orphan amplification) → refuse
- Cross-persona post (one Claw posting for multiple personas) → refuse

## Phase 0-2 manual mode

- Frank approves each drop before publish
- Voice-lock check runs but doesn't auto-publish
- Frequency caps advisory not enforced

## Phase 3+ autonomous mode

- Per persona, after voice-lock false-positive rate ≤5% across 4 weeks, transitions to autonomous publish
- Frank-in-loop only on voice-lock escalations

## Composes with

- `/music-release` — auto-amplification triggered post-pass
- `/music-canvas` — Canvas asset prerequisite for Claw-SP

---

**Built on SIP** — `/music-amplify` · Senior tier (Sonnet 4.6) · Voice-lock + frequency-cap + AI-disclosure structural · Phase 3 autonomous target

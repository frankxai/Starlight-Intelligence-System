---
name: music-is/amplification-mesh
description: Voice-locked, frequency-capped amplification across X/IG/TikTok/YT/Spotify per persona. Triggers on /music-amplify, post-release amplification scheduling, OpenClaws orchestration. Senior tier (Sonnet 4.6).
---

# Amplification Mesh (OpenClaws orchestration)

> Five Claws per persona. Every drop passes voice-lock. Every persona is frequency-capped. AI-disclosure non-waivable. The mesh refuses bot-engagement-fan-mimicry at architecture, not at moderation.

## When this skill fires

- `/music-amplify <song-id> <channels>`
- Post-`/music-release` GREEN-LIGHT — auto-schedule N drops per persona's release calendar
- Scheduled re-amplification (multi-week campaigns)
- Manual amplification of older releases ("light up [song-id] for [channel]")

## The five Claws (per persona)

| Claw | Platform | Drop format | Cadence cap |
|---|---|---|---|
| Claw-X | X / Twitter | post + thread + reply engagement | 2/day |
| Claw-IG | Instagram | Reel + carousel + stories | 1/day |
| Claw-TT | TikTok | vertical short + sound-grab + duet | 1/day |
| Claw-YT | YouTube Shorts + main | Shorts + community post | 1/day |
| Claw-SP | Spotify | Canvas + playlist pitch + listener observation | per-release |

**Frequency cap (cross-Claw):** ≤3 drops/day per persona across the entire mesh.

## Drop generation pattern

For every scheduled drop:

### 1. Pull voice-lock source

`verticals/music-is/labels/<label>/personas/<persona>/social/voice-lock-<platform>.md`

This file contains: persona-specific voice samples for the platform, banned phrases, tone register, character/word limits, banned visual patterns (for Reels/Shorts).

### 2. Compose drop content

Inputs:
- Song metadata (title, persona, label, mood, intent)
- Asset bundle (which asset goes to which platform)
- Voice-lock source
- Release context (first drop / week-2 / week-4 / older catalog re-amplification)

Output per platform:
- **X:** post text (≤280 chars) + thread continuation (3-5 follow-ups optional) + asset (cover or motion-short)
- **IG:** Reel caption (≤200 chars) + carousel slides (if multi-image) + sticker prompts for stories
- **TikTok:** vertical short (15-30s) + caption (≤150 chars) + 2-3 hashtag anchors
- **YT Shorts:** Short upload + title (≤60 chars) + description (≤120 chars) + community post follow-up
- **Spotify:** Canvas (already in asset bundle) + playlist pitch text (60s pitch dossier per `/music-release` checklist)

### 3. Voice-lock check (auto-rollback)

Generated content is checked against:
- Voice samples in `voice-lock-<platform>.md` (similarity threshold)
- Banned phrases list (zero tolerance)
- Tone register (per-platform expected register vs. generated register)

**Fail → auto-regenerate (max 3 attempts) → escalate to Frank if still failing.**

### 4. Frequency-cap check

Pulls persona's drop history from past 24h across all Claws. If proposed drop would exceed 3/day, defer to next slot.

### 5. AI-disclosure check

Persona bio on the platform must currently contain AI-disclosure (per `/sip-attest-audio` policy). If not, drop refused — fix bio first.

### 6. Schedule via Blotato + n8n

Confirmed drops are pushed to Blotato (publishing primitives) via n8n workflow. Blotato handles per-platform API auth, formatting, scheduled-time delivery.

## Cross-platform coordination

For a release, the mesh-schedule pattern:

```
T+0h     Spotify Canvas live (auto via /music-release distro phase)
T+2h     Claw-X drop 1 (release announcement, persona-voice-locked)
T+6h     Claw-IG Reel drop (motion-short asset, caption from voice-lock)
T+24h    Claw-TT drop (TikTok vertical, sound-grab + caption)
T+48h    Claw-YT Short drop (Shorts + community post)
T+72h    Claw-X drop 2 (thread on production / persona-canon angle)
T+1w     Claw-IG carousel drop (behind-scenes / persona-context)
T+2w     Claw-TT drop 2 (different angle / sound-grab variation)
T+4w     Claw-X drop 3 (catalog-context / what-this-fits-with)
T+ongoing Spotify pitching to playlists (per release calendar)
```

This is a default cadence; per-persona adjustment based on platform performance.

## Refusal triggers

- Voice-lock fails 3+ times → escalate to Frank
- Frequency cap exceeded → defer
- AI-disclosure missing from persona bio → refuse drop, fix bio
- Engagement-bot pattern detected (e.g., reply-bombing, follow-bot integration) → refuse, audit
- Drop without canon-anchoring (orphan release amplification) → refuse
- Cross-persona post (one Claw posting for multiple personas) → refuse
- Drop targeting non-disclosed AI-clone voice → refuse

## Performance feedback loop

Per-platform metrics observed weekly:
- Reach / impression / engagement-rate
- Per-Claw drop performance ranking
- Voice-lock effectiveness (do high-performing drops match voice samples more closely?)

Feedback updates voice-lock samples (high-performers added to voice-lock-{platform}.md as positive examples) and adjusts cadence per platform.

## Composes with

- `music-is/persona-canon` (voice-lock source)
- `music-is/release-gate` (post-pass amplification trigger)
- `music-is/voice-lock` (drop content checks)
- `music-amplifier` agent (orchestrator)
- Blotato + n8n (publishing primitives + workflow)

## Phase 3+ requirements

This skill is Phase 3 fully-operational. Phase 0-2 manual mode:
- Frank approves each drop before publish
- Voice-lock check runs but doesn't auto-publish
- Frequency caps are advisory not enforced

Phase 3 transitions to autonomous mode (per persona, after voice-lock false-positive rate ≤5% across 4 weeks).

## Output

Per amplification request: schedule manifest + per-Claw drop content drafts + voice-lock check results + frequency-cap status + scheduled-time per drop.

---

**Built on SIP** — `skills/music-is/amplification-mesh.md` · v0.1 · Senior tier (Sonnet 4.6) · Voice-locked + frequency-capped + AI-disclosed · Phase 3 autonomous target.

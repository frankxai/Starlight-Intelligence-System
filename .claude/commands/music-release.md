---
description: A&R green-light gate for a draft song — non-waivable; on pass, parallel dispatch to distro + amplify + royalty-graph + archive
argument-hint: <song-id> [--override]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /music-release — The non-waivable green-light gate

Run the green-light gate on a draft song. On GREEN-LIGHT, parallel dispatch to distribution (DistroKid + Bandcamp + frankx.ai/music + Spotify Canvas), amplification (5 Claws scheduled), royalty-cascade graph entry, and catalog state transition.

## Usage

```
/music-release frank-riemer_20260501_threshold
/music-release pulse-01_20260520_evening-journal --override
```

## Arguments

- **song-id** (required) — the draft song's catalog ID
- **--override** (optional, Frank-only) — override REFUSE → GREEN-LIGHT; documented canon-justification required at `catalog/overrides/<song-id>.md`

## Behavior

Invokes `music-is/release-gate` skill (Apex tier, Opus 4.7) — `music-curator` agent.

### Gate checks (all must pass)

1. **Persona-anchoring proof** — refuses orphan tracks
2. **Asset bundle complete** — cover (master + 1:1 + 16:9 + 9:16) + motion-short + motion-square + Canvas (+full motion for cinematic-grade labels)
3. **Voice-lock check on social copy** — Claw stub copy passes voice-lock per platform
4. **Royalty-cascade graph entry** — contributors enumerated, splits sum to 100%, rails configured
5. **Cross-label canon-blur check** — track fits ONE label sharply
6. **AI-disclosure metadata** — DistroKid + Bandcamp + frankx.ai metadata carries AI-disclosure
7. **Vocal-impersonation check** — if vocal track, source disclosed; consent doc on file if external-cloned
8. **Sample / sync-clearance check** — any samples cleared or refused-uncleared
9. **Frank-in-the-loop A&R** — final listen-confirm + cover-confirm + intent-confirm

### On GREEN-LIGHT

Parallel dispatch:
- `music-distributor` (Sonnet) → DistroKid + Bandcamp (per label) + Spotify Canvas + frankx.ai/music + sync-pitch dossier (if sync rail active)
- `music-amplifier` (Sonnet) → schedule N social drops via Claws + Blotato + n8n
- `royalty-architect` (Sonnet) → finalize `catalog/royalty-graph.json` entry
- `music-archivist` (Haiku) → transition catalog row draft → released; populate ISRC after DistroKid mint
- Frank notification

### On REVISE

Specific revision named (which gate-check failed + how to address). Song stays in draft.

### On REFUSE

Fundamental refusal (canon-anchoring, AI-disclosure, vocal-impersonation, etc.). Song stays in draft with REFUSED-final flag. Frank can override only via `--override` with documented canon-justification.

## Refusals (gate level)

- Orphan track (no persona attribution)
- Incomplete asset bundle
- Voice-lock fail (>3 attempts)
- Royalty-cascade graph entry incomplete
- Cross-label canon-blur unresolved
- AI-disclosure missing
- Vocal-impersonation without consent
- Uncleared samples

## Override discipline

Per DECISIONS.md D14:
- Override count tracked per quarter
- If overrides exceed 1/quarter, audit gate function
- Override of REVISE not allowed — must address named revision
- Each override referenced in next cycle drift-test (per SOUL.md tests)

## Composes with

- `/music-song` — input source (draft songs)
- `/music-amplify` — additional scheduled drops post-release
- `/music-sync-pitch` — sync-licensing follow-up

---

**Built on SIP** — `/music-release` · Apex tier (Opus 4.7) · Non-waivable structural gate · Override-discipline tracked

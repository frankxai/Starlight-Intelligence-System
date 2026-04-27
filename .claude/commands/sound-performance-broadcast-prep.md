---
name: sound-performance-broadcast-prep
description: Format-specific broadcast prep — Tiny Desk / KEXP / radio session / livestream / TV — with format-specific arrangement, audio-delivery spec, on-camera direction, post-broadcast catalog integration. Refuses generic-arrangement for format.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <broadcast-slug> + --format <tiny-desk|kexp|radio-session|livestream|tv>
---

# /sound-performance-broadcast-prep

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-performance.md`, `skills/sound-intelligence/performance-design.md`. Produce **Broadcast Prep**.

## Disclaimer
**Broadcast performances touch broadcast-rights, post-broadcast reuse rights, clip-permission rights. This is system architecture, not legal advice.**

## Process
1. Disclaim.
2. **Format-specific architecture.** Tiny Desk (intimate, stripped, 3-5 songs / 15-20 min) / KEXP (live-radio + on-camera, 4-6 songs) / radio session (often a cover + originals) / livestream (own-stream architecture + chat layer) / TV (lip-sync vs. live-vocal-over-track decision).
3. **Audio-delivery spec.** Confirmed with broadcaster.
4. **On-camera direction.** Where to look, when to move, intro/outro framing.
5. **Post-broadcast catalog integration.** Rights-pack with broadcaster; reuse permissions; clip permissions; per-version ISRC if recording becomes catalog asset.
6. Save: `sound-intelligence/performance/broadcast-<format-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Broadcast Prep — <Format> — <Date>

> **Broadcast performances touch broadcast-rights and reuse rights. This is system architecture, not legal advice.**

## Format
- <Tiny Desk | KEXP | radio session | livestream | TV>
- Setlist: <3-6 songs typical>
- Duration: <min>

## Format-specific arrangement
- <Stripped down because Tiny Desk's camera framing demands intimacy>
- <Reordered for radio audience>
- <Adjusted for livestream chat-engagement layer>

## Audio-delivery spec
- Format: <broadcast WAV 24-bit/48kHz typical>
- Stems: <yes / no — for broadcaster mix>
- LUFS target: <broadcaster-spec>
- Confirmed with broadcaster: <yes — contact + date>

## On-camera direction
- Intro framing: <how the practitioner appears / introduces>
- Per-song: where to look, when to move
- Outro framing: <how the segment closes>
- Banter: <scripted moments / improvised / none>

## Post-broadcast catalog integration
- Recording rights: <broadcaster-owned / practitioner-licensed / shared>
- Reuse permissions: <YouTube / artist-channel / clips / etc.>
- Per-version ISRC if recording becomes catalog asset: <plan>
- Hand-off to Catalog: <date>

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
```

## Rules
- Disclaimer at top.
- Format-specific arrangement (not generic).
- Audio-delivery spec confirmed.
- On-camera direction explicit.
- Post-broadcast catalog integration planned.
- "Built on SIP" attestation.

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
---

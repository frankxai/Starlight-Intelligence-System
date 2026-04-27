---
name: sound-production-vocal-chain
description: Design a vocal chain matched to voice-and-song — tuning posture, de-essing, EQ, compression, saturation, send architecture, automation map. Refuses default-chain deployment. Refuses AI-vocal-impersonation. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <voice-or-song-slug> + --voice-character <description>
---

# /sound-production-vocal-chain

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-production.md`, `skills/sound-intelligence/production-systems.md`. Produce a **Vocal Chain** matched to THIS voice, THIS song.

## Disclaimer (non-waivable)

**Vocal-chain decisions touch AI-vocal licensing if any AI is involved. AI-vocal-impersonation without written license is non-shippable.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Voice character.** Brief: timbre, range, dynamic profile, sibilance frequency, breath/articulation pattern. Vocal chain serves THIS voice.
3. **AI-vocal status.** None / disclosed / refused-as-impersonation. Refused = halt.
4. **Tuning posture.** Untuned / lightly-tuned / heavily-tuned-as-effect.
5. **De-essing.** Frequency-targeted to this voice's sibilance band.
6. **EQ.** Subtractive-first (cut 250-400 Hz mud) before adding presence.
7. **Compression.** Attack and release matched to phrasing.
8. **Saturation.** Harmonic excitement at perceived-volume cost.
9. **Sends.** Parallel reverb / vocal-doubler / delay-for-emphasis. Discrete sends.
10. **Automation map.** When the vocal lifts, what plugins respond.
11. **Save.** `sound-intelligence/production/vocal-chain-<slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Vocal Chain — <Voice / Song> — <YYYY-MM-DD>

> **AI-vocal-impersonation without written license is non-shippable.**

## Voice character
- Timbre / range / dynamic profile / sibilance frequency / breath pattern: <description>
- AI involvement: <none | disclosed | refused-as-impersonation>

## Chain (in order)
1. **Tuning** — <untuned | lightly-tuned at <window> | heavily-tuned as effect>
2. **De-essing** — <frequency target; ratio; threshold>
3. **EQ (subtractive)** — <cuts: e.g., -3 dB at 280 Hz Q=2; pull mud>
4. **EQ (additive)** — <boosts: e.g., +1.5 dB at 4 kHz wide; presence>
5. **Compression** — <ratio / attack / release / threshold; matched to phrasing>
6. **Saturation** — <plugin / drive / mix>
7. **EQ (post-comp)** — <if needed>
8. **Sends:**
   - Reverb send: <plate / hall / spring; pre-fader; ratio>
   - Doubler send: <if used>
   - Delay send: <quarter / dotted-eighth; feedback; mix>

## Automation map
- V1: <chain settings>
- Pre-chorus: <changes>
- Chorus: <changes — likely more compression, more send, more presence>
- Bridge: <changes — often less, more space>
- Final chorus: <changes — peak>

## Refusal-check
- Default-chain deployment: refused
- AI-vocal-impersonation: refused unless written license
- Auto-tune as repair (not as artistic effect): refused as default

## Load-bearing next move

Tracking session with this chain printed and reference-monitored.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Production sub-system)
- Generated: <ISO date>
---
```

## Rules

- Disclaimer at top.
- Vocal chain matched to THIS voice, THIS song. Default-chain refused.
- AI-vocal-impersonation refused.
- Subtractive-EQ-first.
- Discrete sends.
- Automation map.
- "Built on SIP" attestation.

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Production · 2026-04-26
---

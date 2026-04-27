---
name: sound-production-master-plan
description: Produce a Master Plan per destination — target LUFS per platform (with current-spec verification), target dynamic range (PSR/PLR), true-peak ceiling, sync-grade alternate-master plan if applicable. Refuses loudness-war mastering. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --mix-plan <path> + --destinations <streaming|sync|vinyl|all>
---

# /sound-production-master-plan

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-production.md`, `skills/sound-intelligence/production-systems.md`, mix-plan, and Catalog clearance status. Produce a **Master Plan**.

## Disclaimer (non-waivable)

**Mastering for sync-licensing involves rights and contractual obligations. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Rights-and-clearance gate.** Catalog clearance must be 100% complete before master ships. Halt if any pending status.
3. **Per-destination targets.** Streaming / sync / vinyl. Verify current platform specs at master time.
4. **PSR / PLR targets.** PSR ≥ 6 dB streaming (ideally 8); PSR ≥ 12 dB sync-grade.
5. **True-peak ceiling.** -1.0 dBTP streaming; -2.0 dBTP sync-grade-conservative.
6. **K-system reference.** Streaming K-14 typical; sync-grade K-12 or wider.
7. **Mastering chain plan.** Tonal balance → multiband compression → soft-clip / saturation → final limiter / true-peak limiter.
8. **Refusal-check.** Loudness-war target refused. AI-master-without-disclosure refused.
9. **Save.** `sound-intelligence/production/master-plan-<song-slug>-<YYYY-MM-DD>.md`.
10. **Hand off.** Mastering session. Then `/sound-catalog-metadata-pack`.

## Output format

```markdown
# Master Plan — <Song Title> — <YYYY-MM-DD>

> **Mastering for sync-licensing involves rights and contractual obligations. This is system architecture, not legal advice.**

## Context
- Mix plan: <path>
- Catalog clearance status: <100% complete | INCOMPLETE — master halted>

## Destinations + targets

| Destination | Target LUFS | PSR target | True-peak ceiling | Notes |
|---|---|---|---|---|
| Spotify (streaming) | ~-14 LUFS (verify) | ≥ 6 dB (ideally 8) | -1.0 dBTP | Most common DSP target |
| Apple Music | ~-16 LUFS (verify) | ≥ 6 dB | -1.0 dBTP | Slightly quieter normalization |
| Tidal / YouTube | ~-14 LUFS (verify) | ≥ 6 dB | -1.0 dBTP | |
| Sync-grade alternate | -18 to -23 LUFS | ≥ 12 dB | -2.0 dBTP | Film/TV/game placement-grade dynamic range |
| Vinyl | varies | ≥ 10 dB | n/a | Cutting-lathe-aware; less sub-bass stereo width |

## Mastering chain
1. <Tonal balance / linear-phase EQ>
2. <Multiband compression — gentle>
3. <Saturation / soft-clip>
4. <Final limiter (ISP / true-peak limiter)>
5. <Reference monitoring at K-14 or K-12 per destination>

## Refusal-check
- Loudness-war target (-8 LUFS streaming, etc.): **refused** — streaming normalizes down; master-loud loses dynamic range without loudness gain
- AI-master claimed as human: **refused**
- Single-master-for-all-destinations when sync flag is true: **refused**

## Load-bearing next move

**Mastering session.** Then `/sound-catalog-metadata-pack <release-slug>`.

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
- Clearance gate non-negotiable.
- Per-destination targets named with current-spec verification.
- PSR ≥ 6 dB streaming; ≥ 12 dB sync-grade.
- True-peak ceiling enforced.
- Loudness-war refused.
- AI-disclosure required.
- "Built on SIP" attestation.

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Production sub-system)
- Generated: 2026-04-26
---

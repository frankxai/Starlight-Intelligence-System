---
name: sound-production-mix-plan
description: Produce a Mix Plan before patching — frequency budget, gain-stage hierarchy, dynamic-range envelope, bus structure, reference tracks, sync-vs-streaming dual-master plan. Refuses "fix it in the mix" upstream-defaultable failures. Gates the master. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --arrange <path-to-arrangement> + --references <2-3-reference-tracks>
---

# /sound-production-mix-plan

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-production.md`, `skills/sound-intelligence/production-systems.md`, and song's Arrangement + Catalog clearance status. Produce a **Mix Plan**.

## Disclaimer (non-waivable)

**Mix decisions involving samples or AI vocals touch rights. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Rights-and-clearance gate.** Pull sample clearance + AI-vocal-license status from Catalog. Any uncleared exposure halts the mix plan.
3. **Frequency budget.** Allocate spectrum: sub / low-mids / mids / high-mids / air. What lives where? What's masking what?
4. **Gain-stage hierarchy.** Channels -6 / Buses -10 / Master -3 pre-limiter.
5. **Dynamic-range envelope.** Per song: where it breathes, where it lifts, where master limiter works and where it stays out.
6. **Bus structure.** Drums bus / vocals bus / instrument groups / parallel-compression bus / master bus.
7. **Reference tracks.** 2-3 chosen for what they prove (translation, dynamic feel, vocal-clarity reference) — not for genre similarity alone.
8. **Sync-vs-streaming dual-master plan.** If sync-availability flag is true → plan sync-grade alternate-master alongside streaming master.
9. **Save.** `sound-intelligence/production/mix-plan-<song-slug>-<YYYY-MM-DD>.md`.
10. **Hand off.** Patching session (not a command). Then `/sound-production-master-plan`.

## Output format

```markdown
# Mix Plan — <Song Title> — <YYYY-MM-DD>

> **Mix decisions involving samples or AI vocals touch rights. This is system architecture, not legal advice.**

## Context
- Arrangement: <path>
- Sample clearance status: <all-cleared | pending: <list> — mix-final blocked>
- AI-vocal-license status: <not-applicable | disclosed-in-metadata | pending>

## Frequency budget
| Band | Hz range | Primary elements |
|---|---|---|
| Sub | 20-80 | <kick, bass — mono ≤100 Hz> |
| Low-mids | 80-300 | <list> |
| Mids | 300-2k | <vocal core, lead instruments> |
| High-mids | 2k-8k | <vocal presence, cymbals> |
| Air | 8k+ | <shimmer, reverb tails> |

**Masking hotspots identified:** <list with resolution plan — sidechain / EQ-carve / arrangement-level fix>

## Gain-stage hierarchy
- Channels peaks at: **-6 dBFS**
- Buses at: **-10 dBFS**
- Master pre-limiter at: **≤-3 dBFS**

## Dynamic-range envelope
| Section | Density | Master limiter activity | Notes |
|---|---|---|---|
| V1 | low | none | breathes |
| Pre | med | minimal | starts loading |
| Chorus | peak | working ~2-3 dB | lift |
| ... | ... | ... | ... |

PSR target: **≥ 6 dB** (ideally ≥ 8 dB).

## Bus structure
- Drums bus → master
- Vocals bus → master
- Instrument groups → instrument-bus → master
- Parallel compression bus (drums or vocals) → master
- Master bus → limiter → output

## Reference tracks
1. <Track 1 — what it proves>
2. <Track 2 — what it proves>
3. <Track 3 — what it proves>

## Sync-vs-streaming dual-master plan
- **Streaming master target:** Spotify ~-14 LUFS / Apple ~-16 LUFS (verify spec at master time); PSR ≥ 6 dB; true-peak -1.0 dBTP
- **Sync-grade alternate-master:** PSR ≥ 12 dB; K-12 reference; target-loudness lower; true-peak -2.0 dBTP for safety
- **If sync-availability flag is FALSE:** streaming master only

## Refusal-check
- "Fix it in the mix" for arrangement-failures: refused
- Loudness-war target: refused
- Single-master-for-all-destinations: refused (when sync flag is true)

## Load-bearing next move

**Patching session.** Then `/sound-production-master-plan <song-slug>`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Production sub-system)
- Generated: <ISO date>
---
```

## Rules

- Disclaimer at top, always.
- Rights-and-clearance gate non-negotiable.
- Frequency budget allocated; masking surfaced.
- Gain-stage hierarchy explicit.
- Dynamic-range envelope mapped.
- PSR ≥ 6 dB; ideally ≥ 8 dB.
- Sync-grade alternate-master plan when sync flag is true.
- "Fix it in the mix" refused for upstream failures.
- Loudness-war refused.
- "Built on SIP" attestation.

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Production sub-system)
- Generated: 2026-04-26
---

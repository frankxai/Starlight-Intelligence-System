---
name: sound-performance-live-mix
description: Live mix plan with redundancy — FOH priorities, per-performer monitor mix, IEM-vs-wedge decision, redundancy plan per critical path, soundcheck protocol. Hearing-health baseline non-negotiable. Refuses single-point-of-failure live mix.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <show-slug> + --console-type <digital|analog> + --monitor-type <iem|wedge|hybrid>
---

# /sound-performance-live-mix

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-performance.md`, `skills/sound-intelligence/performance-design.md`. Produce a **Live Mix Plan**.

## Disclaimer
**Hearing-health protection requires audiologist consultation. Live-sound exposure typically exceeds NIOSH limits without protection. Not medical advice.**

## Process
1. Disclaim.
2. **FOH priorities** (vocal first / rhythm second / harmonic instruments / texture).
3. **Per-performer monitor mix** designed.
4. **IEM vs. wedge** decision with hearing-health rationale.
5. **Redundancy plan** per critical path (backup transmitter / mic / playback / console-mode).
6. **Soundcheck protocol** matched to room and budgeted soundcheck time.
7. **Hearing-health baseline** addressed.
8. Save: `sound-intelligence/performance/live-mix-<show-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Live Mix Plan — <Show> — <YYYY-MM-DD>

> **Hearing-health protection requires audiologist consultation. Not medical advice.**

## Console + monitor architecture
- Console: <digital model / analog model>
- Monitor type: <IEM / wedge / hybrid>
- Hearing-health rationale: <why this choice>

## FOH priorities (general; song-specific overrides noted)
1. Lead vocal
2. Rhythm section (drums + bass)
3. Harmonic instruments
4. Texture
5. <Song-specific override examples>

## Per-performer monitor mix
| Performer | Heavy on | Light on | Talkback enabled? |
|---|---|---|---|
| Lead vocal | own vocal + click | drums (light) | yes |
| Drums | click + bass + own kit | vocals (light) | yes |
| ... | ... | ... | ... |

## Redundancy plan (per critical path)
| Critical path | Primary | Backup | Failover protocol |
|---|---|---|---|
| Lead vocal mic | <mic> | <backup mic on stand> | swap; sound engineer flips channel |
| Wireless transmitter | <pack> | <backup pack at FOH> | swap |
| Playback rig | <laptop + interface> | <secondary laptop with same session> | failover via switch |
| Digital console | <model> | <manual mode + analog backup if applicable> | engineer pulls preset |

## Soundcheck protocol
- Time budget: <minutes>
- What's checked: <list — line check, monitor check, full-band check, vocal-effects check>
- What's checked-against-recorded-reference: <studio-master comparison via wedge / FOH>
- What's left to ear-and-feel-but-not-skipped: <list>

## Hearing-health baseline
- IEM volume calibrated to: <SPL target>
- Ambient mix preserved: <yes / no>
- Performer hearing-test cadence: <annual / pre-tour / post-tour>
- FOH SPL limits: <NIOSH-aware; specific dB limit per venue capacity>

## Refusal-check
- Single-point-of-failure: refused
- Soundcheck skipped: refused
- "Loud-as-feel" default: refused

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
```

## Rules
- Disclaimer at top.
- Redundancy plan per critical path.
- Hearing-health baseline addressed.
- Soundcheck protocol followed.
- Single-point-of-failure refused.
- "Built on SIP" attestation.

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
---

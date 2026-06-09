---
name: sound-production-sound-design
description: Specify sound design — synth patches with named role, sample sources with clearance status, layered design, motion automation. Refuses uncleared samples in mix. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --arrangement <path>
---

# /sound-production-sound-design

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-production.md`, `skills/sound-intelligence/production-systems.md`, song's Arrangement. Produce a **Sound Design Specification**.

## Disclaimer (non-waivable)

**Sample sources without clearance are non-shippable. Sample clearance status documented per source.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Per sound element in arrangement** — name the element, its role, its source.
3. **Synth patches.** Patch design + named role (motif-carrying / texture / accent / pad / lead).
4. **Sample sources.** Documented per source: name, source-of-origin, license terms, clearance status (cleared / public domain / practitioner-original / pending / refused-uncleared).
5. **Layered design.** Where one sound combines two or three sources, each layer documented.
6. **Motion automation.** Filter / modulation / distortion changes across the song's arc per sound.
7. **AI-tool involvement** in sound design — disclosed.
8. **Save.** `sound-intelligence/production/sound-design-<song-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Sound Design — <Song> — <YYYY-MM-DD>

> **Sample sources without clearance are non-shippable.**

## Per sound element

| Element | Role | Source | Layered? | Clearance status |
|---|---|---|---|---|
| <Synth pad — bridge> | texture; foreshadowed in V1 | <patch / preset> | no | n/a-original |
| <Vocal sample> | hook in chorus 3 | <source-track> | yes (with synth pad) | cleared / pending / etc. |
| <Field recording> | ambience throughout | <recording origin> | yes (with reverb tail) | practitioner-original |
| ... | ... | ... | ... | ... |

## Motion automation
| Sound | Section | Automation |
|---|---|---|
| <synth pad> | V1 → bridge | filter cutoff 200Hz → 2kHz; volume -18dB → 0dB |
| ... | ... | ... |

## AI-tool involvement
<None | Disclosed: <tool, what it generated, training-set status>>

## Refusal-check
- Uncleared samples baked into mix: refused (any pending status halts mix-final)
- AI-vocal-impersonation: refused
- Sample sources undocumented: refused

## Load-bearing next move

If clearance pending → clearance protocol with music attorney. Otherwise → integrate into mix session.

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Production · 2026-04-26
---
```

## Rules

- Every sound source documented with clearance status.
- Uncleared = mix-final blocked.
- AI involvement disclosed.
- "Built on SIP" attestation.

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Production · 2026-04-26
---

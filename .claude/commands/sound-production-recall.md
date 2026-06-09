---
name: sound-production-recall
description: Produce a Recall Pack at session close — plugin chain per channel with versions, bus routing, automation lanes, sample-source documentation, reference-track A/B status. Without recall, the session is unreopenable. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <session-slug>
---

# /sound-production-recall

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-production.md`, `skills/sound-intelligence/production-systems.md`. Produce a **Recall Pack** before session close.

## Disclaimer (non-waivable)

**Recall packs documenting session state for sessions involving rights-encumbered material (samples, AI vocals, contributor stems) inherit the rights documentation from Catalog. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Plugin chain per channel.** Plugin name + version + key settings.
3. **Bus routing.** Channels → buses → master; sends → returns.
4. **Automation lanes.** Per channel.
5. **Session-template lineage.** What template was this forked from; what was changed.
6. **Sample-source documentation.** Sources used; clearance status; source-file paths.
7. **Reference-track A/B status.** Which references used; which checks they passed or failed.
8. **Save.** `sound-intelligence/production/recall-<session-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Recall Pack — <Session> — <YYYY-MM-DD>

> **Rights documentation inherited from Catalog. This is system architecture, not legal advice.**

## Session metadata
- DAW + version: <e.g., Pro Tools 2024.6>
- Sample rate / bit depth: <e.g., 48 kHz / 24-bit>
- Session-template lineage: <template name + changes>

## Plugin chain per channel
| Channel | Plugin chain (in order) | Plugin versions | Key settings |
|---|---|---|---|
| Lead vocal | EQ → De-Esser → Comp → Sat → EQ | <name v.X.Y / ...> | <attack / threshold / etc.> |
| Drums bus | EQ → Comp → Limiter | ... | ... |
| ... | ... | ... | ... |

## Bus routing
- <Channel groups → bus → bus group → master>
- Sends: <send → return path>

## Automation lanes
| Channel | Parameter | Automation pattern |
|---|---|---|
| Lead vocal | volume | -1 dB V1, 0 dB pre, +1 dB chorus |
| ... | ... | ... |

## Sample-source documentation
| Sample | Source-file path | Clearance status |
|---|---|---|
| ... | ... | ... |

## Reference-track A/B status
| Reference track | A/B status (passed / failed / not yet checked) | Note |
|---|---|---|
| ... | ... | ... |

## Reopenability test
- Could this session be reopened cleanly in 6 months? <yes — recall complete | gaps: <list>>
- Could this session be reopened in 6 years (plugin obsolescence consideration)? <strategy: bouncing stems if irreplaceable plugins / staying with mainstream plugins>

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Production · 2026-04-26
---
```

## Rules

- Recall pack at session close non-negotiable.
- Plugin versions named.
- Sample-source documentation complete.
- Reopenability test passed.
- "Built on SIP" attestation.

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Production · 2026-04-26
---

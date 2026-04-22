---
name: vertical-spawn
description: Spawn a new vertical intelligence system under SIS. Scaffolds repo, SIS-instance.md, skill/agents/memory, vertical-scoped commands. Registers in starlight/VERTICALS.md.
allowed-tools: Read, Write, Grep, mcp__github
argument-hint: <vertical-name> <one-line-domain> [owner]
---

# /vertical-spawn

Load `SIS.md`, `SIP.md`, `VERTICALS.md`. Spawn a new vertical intelligence system.

## Input
$ARGUMENTS

## Process

1. **Check for overlap.** Read `VERTICALS.md`. If the new vertical's declared domain overlaps ≥60% with an existing active vertical, halt and recommend either:
   - Adding a sub-module to the existing vertical, or
   - Sharpening the new vertical's domain until overlap <60%.

2. **Classify canon dependency.**
   - Does this vertical need Arcanea canon (Guardians, Vel'Tara, Hz)? If yes, declare CC-BY-NC license acceptance.
   - Does this vertical create its own canon? If yes, plan a `CANON.md` slot and declare canon license (default CC-BY-NC © vertical owner).
   - Does this vertical decline canon entirely? Fine. Declare explicitly.

3. **Scaffold the vertical repo:**

```
<vertical-name>/
├── README.md              — vertical positioning, ICP, status
├── SIS-instance.md        — vertical-specific substrate expression
├── SKILL.md               — how AI adopts this vertical's behavior
├── AGENTS.md              — voices in this vertical
├── MEMORY.md              — state, commitments, roadmap
├── CANON.md               — optional, vertical-specific archetypes
├── STACK.md               — optional, overrides of starlight/STACK.md
└── .claude/commands/
    ├── <vertical>-<verb>.md  — vertical-scoped commands per Layer 4 of SIP
    └── …
```

4. **Author `SIS-instance.md`** — declare:
   - Domain (one sentence, sharp).
   - ICP / audience.
   - Open/closed boundary (what is MIT, what is protected).
   - Canon dependency (import? create? decline?).
   - Compositions with other verticals.
   - Status (v0.1 scaffolding / v1 active / dormant).

5. **Author `SKILL.md`** — the behavior. What voice, what invariants, what posture. Inherit substrate rules from `starlight/SKILL.md` + add vertical-specific.

6. **Author `AGENTS.md`** — which canonical voices are instantiated (per `starlight/AGENTS.md`). Add vertical-specific voices if needed (e.g., `canon-keeper`, `capital-allocator`), with full frame/posture/owns declaration.

7. **Author `MEMORY.md`** — cycle 0 state, empty commitments, empty forks, external authority IDs as placeholders.

8. **Install starter commands.** At least one vertical-scoped command per `SIP.md` Layer 4: `/<vertical>-<primary-verb>.md`. Wealth IS ships with `/wealth-dpi`. Creator IS ships with `/creator-challenge`. Arcanea ships with `/arcanea-canon`.

9. **Register.** Append to `starlight/VERTICALS.md` with full schema.

10. **Emit brief.** Summary of the spawned vertical, compositions, first shipped artifact target.

## Output shape

```
# Vertical Spawned — <vertical-name>

## Identity
Domain: <one sentence>
Owner: <entity>
Status: v0.1 — scaffolding
Canon: <import / create / decline>
Repo: <github url>

## Compositions
- Imports: <list of canon/verticals>
- Composes with: <list>
- Attribution: "Built on SIP" + <specific canon or vertical contributions>

## First shipped artifact target
<Artifact name> by <date>

## Primary command installed
/<vertical>-<verb> — <one line>

## Next
1. Fill external IDs in MEMORY.md.
2. Ship first artifact.
3. Emit /sip-attest on ship.

---
**Built on SIP** · Vertical spawned · <ISO date>
```

## Rules

- Verticals must declare canon posture explicitly. Ambiguity is a protocol violation.
- Do not spawn a vertical as a fork of an existing vertical. Forks are sub-modules inside the parent.
- Every vertical must have at least one sovereign owner — no ownerless verticals.
- Verticals that stall (zero ships for 2 cycles) are marked `status: dormant` in `VERTICALS.md` automatically on next registry sweep.

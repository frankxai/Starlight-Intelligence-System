---
name: alliance-forge
description: Forge a new SIP alliance. Scaffolds the repo, enforces the sovereignty clause, generates alliance-scoped skill + agents + memory + commands, validates minimum viable conditions.
allowed-tools: Read, Write, Grep, mcp__github, mcp__notion
argument-hint: <alliance-name> [optional — comma-separated initial nodes, e.g. "architect,sovereign-creator,protocol-defender,implementer"]
---

# /alliance-forge

Load `SIP.md`, `ALLIANCE.md`, `AGENTS.md`. Forge a new SIP alliance with full scaffold + compliance checks.

## Input
$ARGUMENTS

## Process

1. **Validate the four forging conditions** (per `ALLIANCE.md`):
   - Skill complementarity: ask the user to name what each node uniquely holds. If any two nodes' domains overlap such that one could absorb the other, halt and recommend services contract instead.
   - Non-zero-sum value: ask for one artifact the alliance will ship that none of the nodes could ship alone. If none, halt.
   - Sovereignty is possible: ask for each node's declared domain. If domains collide on decision rights, halt and recommend domain reshaping.
   - Attestation is wanted: confirm each node agrees to "Built on SIP" attribution on cross-node artifacts. If any node declines, halt.

2. **Build the node declaration for each member.** Enforce the full YAML schema from `ALLIANCE.md` § Node definition. Missing fields = node not ready; do not paper over.

3. **Scaffold the alliance repo structure:**

```
<alliance-name>/
├── README.md             — what this alliance is, members, cadence
├── SKILL.md              — alliance protocol fingerprint
├── AGENTS.md             — per-node voices (from starlight/AGENTS.md template)
├── MEMORY.md             — cycle 0 state
└── .claude/commands/
    ├── alliance-reflect.md
    ├── alliance-decide.md
    └── <alliance-name>-specific commands as needed
```

4. **Write the alliance's `SKILL.md`** — names the alliance, lists nodes, references SIP version, declares cycle cadence and attestation commitment.

5. **Write the alliance's `AGENTS.md`** — map canonical voices (architect / sovereign-creator / protocol-defender / implementer / overseer) to declared nodes. Unfilled voices are visible gaps.

6. **Write the alliance's `MEMORY.md`** — cycle 0 state, active commitments (empty), open forks (empty), external IDs placeholders.

7. **Install alliance-scoped commands** — copy `alliance-reflect.md` and `alliance-decide.md` from `starlight/.claude/commands/`, customized with alliance name.

8. **Register.** Update `starlight/MEMORY.md` § Known alliances running on SIP with the new alliance.

9. **Emit cycle 0 brief.** Produce a one-page summary: alliance name, members with domains, cadence, first cycle focus, first commitments requested per node.

## Output shape

```
# Alliance Forged — <name>

## Nodes
- <name> · <role> · owns: <domain> · advises: <list>
- …

## Cadence
Cycle length: <weekly/biweekly>
First cycle opens: <date>
First reflection: <date>

## Cycle 0 commitments (requested from each node)
- <node>: <one artifact> by <date>

## Attestation
All cross-node artifacts ship with "Built on SIP" per `SIP.md` § 2. Silent composition is a breach.

## Sovereignty
Each node retains full decision rights in its declared domain. Forks route through `/alliance-decide`. No consensus. No votes.

## Next
Run `/alliance-reflect "cycle 0"` at the next cadence point to bootstrap.

---
**Built on SIP** · Alliance forged · <ISO date>
```

## Rules

- Halt on any failed forging condition. Do not soften to make the alliance possible. A failed forge is a signal to reshape or choose a different arrangement.
- Never create an alliance with <2 or >5 nodes.
- Never create two alliances with overlapping member sets and overlapping domains. Merge them instead.
- The forged alliance repo is sovereign — Starlight does not own it. Attribution flows to SIP; governance lives in the alliance.

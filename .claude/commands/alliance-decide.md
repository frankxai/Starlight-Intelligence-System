---
name: alliance-decide
description: Force resolution at an alliance fork. Collapses option space, assigns decision rights per domain map, extracts the call.
allowed-tools: Read, Grep, WebSearch, mcp__notion
argument-hint: "<fork statement — e.g. 'open-source agent layer vs keep closed'>"
---

# /alliance-decide

Load alliance `SKILL.md`, `AGENTS.md`, `MEMORY.md`, and `SIP.md` § 5 (sovereignty clause). The alliance has hit a fork. Your job is to surface the structural trade-off, force a call, and prevent drift.

## Fork
$ARGUMENTS

## Process

1. **Frame the fork.** Two paths. Maximum three. Mutually exclusive. If the input describes three independent questions, split and run separately — do not fuse.

2. **Cost matrix.** For each path:
   - **Time cost.** How long until this path ships?
   - **Optionality cost.** What doors close? Which future moves become harder or impossible?
   - **Reversibility cost.** Can this be undone, and at what price?

3. **Node positions.** Each voice ≤3 sentences. Which path, why, from that node's frame. A node may abstain if the fork is not in their domain — "I don't have skin in this fork" is valid. Do not manufacture positions.

4. **Decision rights.** Name the one node that owns this call per the domain map in `MEMORY.md`. If no node clearly owns it, emit: `→ domain map gap; reshape before deciding`, and default the call to the architect voice (usually the substrate-layer owner).

5. **Call.** Either:
   - **Decision:** named path, owner, ship date.
   - **Delay cost:** if the owner chooses not to decide now, compute the cost of delay — "Not deciding by <date> costs <concrete loss>." Name it.

6. **Writeback.** Append to Notion Decision Log with all fields. Update `MEMORY.md` § Open forks (remove if decided; keep with new decide-by date if delayed).

## Output shape

```
# Alliance Decision — <alliance-name> · Fork <N>

**Fork:** <statement>

## Paths
- **A:** <one line>
- **B:** <one line>

## Cost matrix
|                | Path A | Path B |
|----------------|--------|--------|
| Time           |        |        |
| Optionality    |        |        |
| Reversibility  |        |        |

## Positions
**<node-1> (<role>):** <path + ≤3 sentences>
**<node-2> (<role>):** <path + ≤3 sentences>
…

## Decision rights
<Node>. Rationale: <one line tied to domain map>

## Call
<Path chosen, owner, ship date>

— OR —

Delay cost: not deciding by <date> costs <concrete loss>.

---
**Built on SIP** · <alliance-name> · Decision Log · <date>
```

## Rules

- Two paths. If the space does not collapse to two, the fork is not framed yet — reframe.
- No hedging. No "on one hand / on the other."
- Decision rights are not votes. One node owns each fork. Others advise.
- If the owning node is absent, delay the decision with explicit cost — do not reassign ownership because of absence.
- Unresolvable forks that persist ≥3 cycles escalate: `→ /alliance-decide "reshape domain map or dissolve alliance"`. Do not let forks calcify.

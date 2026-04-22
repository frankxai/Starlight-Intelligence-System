---
name: alliance-reflect
description: Cycle reflection for any SIP alliance. Nodes report, dependencies surface, commitments extracted, synthesizer closes. Invoke at every cycle boundary.
allowed-tools: Read, Grep, Glob, WebSearch, mcp__notion, mcp__github
argument-hint: <cycle-focus — optional, e.g. "before launch" or "this cycle">
---

# /alliance-reflect

Load the alliance's `SKILL.md`, `AGENTS.md`, `MEMORY.md`, and `SIP.md` (protocol spec). Facilitate the cycle reflection.

## Cycle focus
$ARGUMENTS

## Process

1. **Pull state.**
   - Notion alliance DB (ID in `MEMORY.md`) for last closed cycle.
   - GitHub across all member repos (per `MEMORY.md` node declarations) for commits since last cycle close.
   - Any vertical MCPs in play (e.g., `arcanea-mcp.canon-validate` for canon updates).

2. **Each node reports.** First-person voice from the node's frame. ≤5 sentences. If a node shipped nothing, one sentence naming that fact — do not fabricate activity. Silence is reported, not hidden.

3. **Surface dependencies.** Name blocking handoffs explicitly: "[Node A] blocks [Node B] on [artifact] until [date]." If a dependency reveals a structural fork, emit: `→ run /alliance-decide "<fork statement>"` and continue.

4. **Extract commitments.** Each node names exactly ONE artifact for next cycle. Format: artifact name + date. Reject "I will explore" — only "I will ship X by Y."

5. **Synthesizer closes.** The overseer voice (or designated synthesizer) speaks last. ≤3 sentences. What the alliance must protect or advance next. Not a summary — a synthesis.

6. **Writeback.**
   - Append to Notion alliance DB as new cycle entry.
   - Update `MEMORY.md` § Active commitments table.
   - Update `MEMORY.md` § Open forks if new forks surfaced.

## Output shape

```
# Alliance Reflection — <alliance-name> · Cycle <N>

**Focus:** <cycle focus>
**Opened:** <date> · **Closes:** <date>

## <node-1> speaks (<role>)
[≤5 sentences, first person]

## <node-2> speaks (<role>)
[≤5 sentences, first person]

[… for each node …]

## Dependencies
- <Node A> blocks <Node B> on <artifact> until <date>
- …

## Forks surfaced
- <fork statement> → /alliance-decide
- …

## Commitments — Cycle <N+1>
- <node-1>: <artifact> by <date>
- <node-2>: <artifact> by <date>
- …

## Synthesis (<synthesizer>)
[≤3 sentences]

---
**Built on SIP** · <alliance-name> · Cycle <N> · <date>
```

## Rules

- No facilitation tone. No cheerleading. No "great work everyone."
- Commitments bind. An absent node has their slot marked "pending" and that is surfaced, not hidden.
- Silence on a cycle is the most important signal the reflection can produce — name it.
- Every reflection closes with "Built on SIP" attestation.
- If the same commitment slips cycle-over-cycle twice, surface it as a fork: `→ /alliance-decide "reshape <node>'s domain or exit the alliance"`. Structural slip is not a schedule problem.

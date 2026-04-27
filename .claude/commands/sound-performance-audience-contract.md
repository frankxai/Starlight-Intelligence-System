---
name: sound-performance-audience-contract
description: Name the audience contract for a show — energy contract (listening-room vs festival vs dance-floor vs seated-theater), participation expectations, what set promises and does not promise. Refuses unstated contracts.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <show-slug> + --venue-type <type>
---

# /sound-performance-audience-contract

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-performance.md`, `skills/sound-intelligence/performance-design.md`. Name the **Audience Contract**.

## Process
1. **Venue + ticket context.** What does the audience already expect from this venue / ticket type?
2. **Energy contract.** Listening-room (stillness, attention) / festival (peaks more frequent, breaks shorter) / dance-floor (continuous flow) / seated-theater (arc-driven).
3. **Participation expectations.** Sing-along / clap-along / quiet moments protected.
4. **What this set promises.** Specific.
5. **What this set does NOT promise.** Equally specific.
6. Save: `sound-intelligence/performance/contract-<show-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Audience Contract — <Show> — <YYYY-MM-DD>

## Context
- Venue: <name + type>
- Ticket type: <general / VIP / seated / standing>
- Expected audience: <regulars / festival-walkthrough / curious-new / collaborator-friends>

## Energy contract
<Listening-room | festival | dance-floor | seated-theater>

Specific energy commitments:
- <e.g., No stage banter during three quiet songs in middle of set>
- <e.g., Two clear sing-along moments>
- <e.g., One break for breath / drink / costume change at minute 45>

## What this set promises
<Specific. The one or two things the audience will get.>

## What this set does NOT promise
<Equally specific. What the audience should not expect (so the contract is honest).>

## Participation expectations
- Sing-along moments: <which songs / which lines>
- Clap-along moments: <if any>
- Quiet moments protected: <which songs>

## Pre-show audience communication
- List members get: <ritual >
- Public communication: <ritual / none>
- Door / stage signage: <if applicable>

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
```

## Rules
- Venue + ticket context first.
- Energy contract named explicitly.
- What set DOES and does NOT promise.
- Pre-show communication composes with Audience.
- Unstated contracts refused.
- "Built on SIP" attestation.

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
---

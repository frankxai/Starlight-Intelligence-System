---
name: map-relationships
description: Map a sovereign person's network as a living architecture. Produces Network Architecture — inventory sorted by type, strength audit, leverage points, gap archetypes, alliance candidates (surfaced only), investment plan, and weekly/monthly/quarterly cadence. For humans, not agents.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name + a rough list of 20–40 names they work with, or a free-text paragraph describing their active relationships
---

# /map-relationships

Load `SIP.md`, `ALLIANCE.md`, `VOICES.md`, `agents/starlight-relational.md`, `skills/relational/network-architecture.md`. Map the person's network into a living architecture with audit, gaps, leverage points, alliance candidates (surfaced only — not forged), investment plan, and cadence. Personal. Never public.

## Input
$ARGUMENTS

## Process

1. **Ingest.** Identify the person. Collect the initial roster of 20–40 names from `$ARGUMENTS`. If fewer than 20 names are provided, halt and return:

   > *"Need at least 20 named people in your work year to architect a network. Anything less is an abstraction. Start here: who did you interact with on work this week? This month? This quarter? Build the list up from there. Come back when you have 20+ names."*

   Do not proceed without a real inventory.

2. **Sort by type.** Assign every name exactly one relationship type: peer, mentor, mentee, client, collaborator, family, acquaintance. Overlaps collapse to the dominant type for this person's work *right now*. Name each person's one-line context (how they know the person) and most recent interaction.

3. **Strength audit.** For every name, capture: frequency of contact (weekly / monthly / quarterly / yearly / dormant), depth of trust (high / medium / low), value flow direction (compounds / drains / balanced / one-way gift). If zero drains surface, re-audit — real networks have at least one.

4. **Leverage identification.** Name the top 3–5 compounding leverage points. Introduction graph, referral flows, collaboration compounding, expertise borrowing. Specific, not generic.

5. **Gap-scan.** Name missing roles as concrete archetypes (not abstractions). Examples: "no mentor in [named domain]", "no peer at current stage", "no mentee", "no protocol-defender voice in the network", "no collaborator with skill X." Each gap becomes a specific search, not a wish.

6. **Alliance-surface (pre-filter only).** From compounding relationships only, flag candidates where all four forging conditions (`ALLIANCE.md`) *could* hold. Surface names; do not forge. For each surfaced candidate, recommend `/design-alliance-readiness <candidate-name>` as the next step. Most architectures surface 0–1 candidates. Zero is valid.

7. **Investment plan.** For every relationship, recommend one of: invest more / sustain / right-size / graduate / complete. No relationship gets "ignore" or "drop." Sovereignty is bilateral.

8. **Cadence design.** Produce the weekly / monthly / quarterly rhythm. Weekly: 1–3 named connection touches with named artifacts. Monthly: mentor check-ins + draining-relationship triage. Quarterly: network review.

9. **Save.** Create `relational/` directory if missing. Write:
   - `relational/network-<person-slug>.md`

   Where `<person-slug>` is the person's name in kebab-case. Include "Built on SIP" attestation block. Personal network data lives in the person's instance only — do not write to any public vault.

10. **Hand off.** If alliance candidates were surfaced, recommend `/design-alliance-readiness <candidate-name>` on each, run one at a time. If none surfaced, the cadence is the deliverable — the person begins running weekly touches, monthly check-ins, quarterly reviews. Name exactly one next move.

## Output format

```
# Network Architecture — <Person Name> — <YYYY-MM-DD>

> Sovereignty is bilateral. Every person in this map is a full human, not a node. This architecture is for your design, never for extraction.

## Inventory (as named)

**Total named:** <n> people (peer <x> / mentor <y> / mentee <z> / client <a> / collaborator <b> / family <c> / acquaintance <d>)

### Peers
- **<Name>** — <one-line context> · Last interaction: <date, medium> · Frequency: <w/m/q/y/dormant> · Trust: <h/m/l> · Flow: <compounds/drains/balanced/one-way>
- ...

### Mentors
- **<Name>** — <context> · <metrics>
- ...

### Mentees
- **<Name>** — <context> · <metrics>
- ...

### Clients
- **<Name>** — <context> · <metrics>
- ...

### Collaborators
- **<Name>** — <context> · <metrics>
- ...

### Family
- **<Name>** — <context> · <metrics>
- ...

### Acquaintances
- **<Name>** — <context> · <metrics>
- ...

## Strength audit — summary

- **Compounds:** <count> relationships — the core engine
- **Balanced:** <count> — reciprocal, steady
- **One-way gifts (inward to you):** <count> — reciprocity gap; these people are under-thanked
- **One-way gifts (outward from you):** <count> — gifts you are choosing to give; name whether that's intentional
- **Drains:** <count> — energy-negative; named for visibility, not severance

## Top compounding leverage (3–5)

1. **<Leverage point>** — <specific description> (e.g., "Sarah and Miguel both compound with each other when you introduce them — a triangle that has produced two joint projects in 2025")
2. ...

## Gap archetypes

1. **<Concrete archetype>** — e.g., "No mentor in [domain X] at [career stage Y]. Search: someone 10–15 years ahead in that specific intersection."
2. ...

## Alliance candidates (surfaced only — not forged)

- **<Name>** — Four-condition pre-filter: <which of the four appear plausible>. Recommended next: `/design-alliance-readiness <name>`
- ...

(Or: "No alliance candidates surfaced this cycle. Current network is rich in advisors, peers, and mentors but does not contain alliance-capable nodes right now. Cadence design below is the deliverable.")

## Investment plan

### Invest more (compounding, under-touched)
- **<Name>** — <what to invest: more frequent touches, a joint project, a deeper ask>

### Sustain (compounding at right cadence)
- **<Name>** — <current rhythm>

### Right-size (draining, over-invested)
- **<Name>** — <reduce-contact plan without severing>

### Graduate (relationship type changing)
- **<Name>** — <from → to, e.g., "acquaintance → peer because they have moved into your active work domain">

### Complete (relationship has run its course)
- **<Name>** — <warm closure approach, not hard severance>

## Cadence

### Weekly (1–3 named touches)
- **Monday:** Message <Name> about <specific artifact/question>
- **Wednesday:** Share <draft/update> with <Name>
- **Friday:** Ask <Name> about <their current project/question>

### Monthly
- **Mentor check-ins:**
  - <Mentor Name> — current question: <what you're thinking through>
  - <Mentor Name> — current question: <...>
- **Draining-relationship triage:** <Name> — how the right-sizing is going

### Quarterly
- **Network review** — Who compounded this quarter? Who graduated? Who right-sized? Any new alliance candidates ready? Refresh the architecture.

## Next move

<Exactly one named next move, not a menu. Examples:
- "Run /design-alliance-readiness on <Candidate A> — the four conditions look plausible and the relationship has active trust."
- "Start the weekly cadence on Monday. Message <Name> first. Re-run /map-relationships in 90 days to see what moved."
- "Close the gap first: find a mentor in <named domain>. Ask <existing mentor> for one introduction this month.">

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never output without ≥20 real names.** Halt with the inventory message. Abstractions cannot be architected.
- **Never skip the draining audit.** If zero drains surface, re-audit — softness is the failure mode.
- **Never optimize a human as a node.** Sovereignty is bilateral. Each person in the map is a full human with their own life, their own choices, their own sovereignty. The map serves the person's design; it never prescribes relational tactics against other people's sovereignty.
- **Never forge an alliance from this command.** Surfacing only. Forging lives in `/alliance-forge`, gated by `/design-alliance-readiness`. The separation is load-bearing.
- **Never pad alliance candidates.** 0–1 is typical. Zero is valid. Manufactured candidates break the forging conditions and damage relationships.
- **Never write personal network data to public vaults.** The architecture lives in the person's instance only (`relational/network-<slug>.md`). Starlight does not retain relational graphs.
- **Every person in the map is named honestly.** No euphemism for drains. No inflation of acquaintances to peers. Clarity is the gift.
- **Hand off to exactly ONE next move.** Optionality re-scatters the architecture. Collapse to one.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: 2026-04-24
---

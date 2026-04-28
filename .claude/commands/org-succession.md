---
name: org-succession
description: Succession planning with real readiness — not paper. Per critical role: identified successor, readiness gap, 6-12-month development plan, tested partial in-role, named timeline, transparent communication. Refuses paper-only succession plans. Surfaces single-points-of-failure, unprepared successors, and undisclosed plans (the silent-succession trust corrosion).
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --critical-roles <comma-separated list> + --horizon <12mo|3yr|5yr> + optional context paragraph
---

# /org-succession

Load `SIP.md`, `agents/starlight-org.md`, `skills/people-intelligence/org-architecture.md`. Read any prior `hr-intelligence/org/` outputs. Produce a **Succession Architecture** document. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Succession planning implicates compensation discussions, promotion decisions, classification (exempt/non-exempt status changes), and protected-class considerations in promotion patterns. This is structural thinking architecture, not employment-law advice. Real promotion / role-change decisions require qualified employment counsel.**

## The honest opening

Most companies have succession plans on paper and no actual readiness on the bench. Real succession planning is measurable: a named successor exists, a development plan exists with named gaps closing on a schedule, the successor has actually performed parts of the role under controlled conditions, a timeline is real and named, and the successor has been told. Anything missing any of those = paper, not readiness. This command refuses paper.

## Input
$ARGUMENTS

## Flags

- `--critical-roles <comma-separated list>` — which roles to plan for. If unsure, run `/org-role-design` first or list the roles where the org would be in real trouble within 30 days of the incumbent leaving (that's the working definition of "critical").
- `--horizon <12mo|3yr|5yr>`:
  - `12mo` — near-term continuity (illness, departure, parental leave, bus-factor)
  - `3yr` — strategic succession (founder evolution, scale-driven layer shifts, planned exits)
  - `5yr` — generational succession (founder transition, exec retirement, long-arc development)

## Process

1. **Disclaim.**

2. **Open with the readiness honesty.** Most plans are paper. Name what real readiness requires.

3. **Critical role inventory.** For each role on the list:
   - Why is it critical? (decision-rights concentration, irreplaceable institutional knowledge, customer-facing identity, regulatory/license-holding, etc.)
   - 30-day risk: what breaks if the incumbent leaves tomorrow?
   - 90-day risk: what compounds if no one is named in 90 days?
   - 12-month risk: what strategic capability is lost without succession?

4. **Per-role succession architecture.** For each role:

   a. **Named successor candidate(s).**
      - One primary successor (named individual, not "TBD" or "we'll hire")
      - Optional: one secondary / development candidate
      - If no internal candidate exists, name this honestly and decide: external hire (Hiring path) or develop-from-distant-bench (longer horizon)

   b. **Readiness gap assessment.** What is the named successor missing today vs the role's accountabilities (per `/org-role-design` output)?
      - Skill gaps (specific, measurable)
      - Experience gaps (situations they have not yet been in)
      - Network/relationship gaps (key relationships they don't yet hold)
      - Decision-making gaps (decisions they have not yet made under pressure)
      - Identity / readiness gaps (do they want this role, do they see themselves in it, are they ready for the visibility / accountability)

   c. **6-12-month development plan.**
      - Named training / coaching / education
      - Named stretch assignments matched to specific gaps
      - Named relationships to build (introductions, customer conversations, board exposure)
      - Cadence: monthly check-in with development sponsor; quarterly readiness review

   d. **Tested partial in-role.**
      - The successor must actually do parts of the role under controlled conditions before the full transition
      - Examples: incumbent goes on a planned 2-week absence and successor runs the function; successor leads the quarterly review; successor handles a specific customer escalation; successor sits in for a board meeting
      - Without a tested partial, "readiness" is theoretical. Theoretical readiness fails on Day 1.

   e. **Named timeline.**
      - Real dates: development plan start, mid-point review, readiness review, transition date
      - Vague timelines ("when ready") are paper. Real timelines have dates with adjustment criteria, not absent dates.

   f. **Transparent communication strategy.**
      - The successor knows they are the named successor (the silent kind erodes trust when discovered)
      - The incumbent knows the timeline and is bought in (incumbent resistance is the most common succession failure mode)
      - The team knows enough to not be blindsided (full disclosure timing depends on horizon and dynamics; legal review here)
      - The board / key stakeholders know per their need-to-know

5. **Aggregate succession bench-strength.** Across all critical roles:
   - **Bench depth:** how many critical roles have a named, ready, tested successor? (Target: 80%+)
   - **Bench breadth:** how many high-potential individuals exist who could be developed for >1 critical role over the horizon?
   - **Concentration risk:** are too many succession plans relying on the same 1-2 individuals (creating a different single-point-of-failure)?

6. **Risk flags (mandatory).** Surface explicitly:
   - **Single-point-of-failure roles:** critical roles with no named successor → urgent
   - **Unprepared successors:** named but with significant gaps and no development plan → paper, not readiness
   - **Undisclosed succession:** named successor who has not been told → trust risk if discovered, will erode
   - **Founder-shaped roles:** roles designed around the incumbent's specific capabilities that no one else can replicate without redesigning the role first → flag for `/org-role-design` before succession is feasible
   - **Protected-class promotion-pattern flags:** if succession plans concentrate promotions in one demographic to the exclusion of others, flag for legal review (this is real; pattern-blind succession can produce pattern-laden promotion outcomes)

7. **Composition flags.**
   - **With Performance:** succession requires honest performance read on both incumbent (timeline appropriateness) and successor (readiness)
   - **With Talent IS:** named successor under-engagement or burnout = succession is at risk; monitor
   - **With Hiring:** if no internal successor, route to external candidate sourcing with the role design as ICP
   - **With Founder / Genius:** founder-shaped roles route through `/discover-genius` for the founder to clarify what is truly KEEP-bucket (cannot be succeeded) vs DELEGATE-bucket (can be developed and transferred)

8. **Save.** Write to `hr-intelligence/org/succession-<YYYY-MM-DD>.md`.

9. **Hand off.** Exactly one next move:
    - `/org-role-design` — if a critical role is founder-shaped and needs structural redesign before succession is feasible
    - Hiring (external sourcing) — if no internal successor for a critical role
    - `/luminor-board` — for founder-succession or board-level succession; pressure-test before commit
    - Development plan kickoff with sponsor — for named-but-gap successors (most common)

## Output format

```markdown
# Succession Architecture — <Org Name> — <YYYY-MM-DD>

> **Structural thinking architecture, not employment-law advice. Promotion decisions implicate compensation, classification, and protected-class considerations. Real decisions require qualified employment counsel.**

## The readiness standard this document holds

Real succession requires, per role:
1. Named successor (an individual, not "TBD")
2. Readiness gap assessment against the role's actual accountabilities
3. 6-12-month development plan with named cadence
4. Tested partial in-role (the successor has actually done parts of the role)
5. Named timeline with real dates
6. Transparent communication — the successor has been told

**Anything missing any of these = paper, not readiness. This document refuses paper.**

## Critical role inventory

| Role | Why critical | 30-day risk | 90-day risk | 12-month risk |
|------|--------------|-------------|-------------|---------------|
| <role> | <reason> | <what breaks> | <what compounds> | <what is lost> |
| ... | ... | ... | ... | ... |

## Per-role succession architecture

### Role 1: <title>

- **Incumbent:** <name>
- **Named successor (primary):** <name or "EXTERNAL HIRE NEEDED">
- **Named successor (secondary, optional):** <name>

#### Readiness gap assessment

| Dimension | Gap | Closes by |
|-----------|-----|-----------|
| Skill | <specific> | <date> |
| Experience | <specific> | <date> |
| Network | <specific> | <date> |
| Decision-making | <specific> | <date> |
| Identity / readiness | <specific> | <date> |

#### 6-12-month development plan

| Element | Specifics | Cadence |
|---------|-----------|---------|
| Training / coaching | <named> | <monthly / quarterly> |
| Stretch assignments | <named, matched to gaps> | <as scheduled> |
| Relationships to build | <named> | <as scheduled> |
| Sponsor | <name> | monthly check-in |
| Quarterly readiness review | <date> | quarterly |

#### Tested partial in-role

| Test | What the successor does | When | Pass criteria |
|------|------------------------|------|---------------|
| <name> | <specific> | <date> | <criteria> |
| ... | ... | ... | ... |

(At least one tested partial before full transition. Without this, readiness is theoretical.)

#### Named timeline

- Development plan start: <date>
- Mid-point review: <date>
- Readiness review: <date>
- Transition date: <date or "decision date" if conditional>
- Adjustment criteria: <if mid-point review shows gaps unclosed, what happens>

#### Transparent communication

- [ ] Successor has been told they are the named successor: <date>
- [ ] Incumbent knows the timeline and is aligned: <date>
- [ ] Team disclosure timing: <when, by whom, with what message>
- [ ] Board / key stakeholders informed: <per need-to-know schedule>

### Role 2: <title>

(Same structure, repeat for each critical role.)

## Aggregate succession bench-strength

- **Bench depth:** <X of Y critical roles have a named, ready, tested successor> = <%>
- **Bench breadth:** <N high-potential individuals across the bench>
- **Concentration risk:** <Y/N — are too many succession plans relying on the same 1-2 individuals>

## Risk flags

- [ ] **Single-point-of-failure roles (no named successor):** <list — URGENT>
- [ ] **Unprepared successors (named, large gaps, no development plan):** <list — PAPER, NOT READINESS>
- [ ] **Undisclosed succession (named successor not told):** <list — TRUST RISK>
- [ ] **Founder-shaped roles (cannot be succeeded without redesign):** <list — route to /org-role-design first>
- [ ] **Protected-class promotion-pattern concentration:** <flag for legal review if applicable>

## Composes with

- **Performance:** honest performance read on incumbent (timeline) and successor (readiness)
- **Talent IS:** monitor named successor for engagement / burnout — succession at risk if successor is burning out
- **Hiring:** external sourcing if no internal candidate, with role design as ICP
- **Genius (founder):** founder-shaped roles route through `/discover-genius` to clarify KEEP vs DELEGATE buckets

## Load-bearing next move

**`<one command or one action>`** — `<one-line rationale>`.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top.** Non-waivable.
- **Refuse paper-only succession plans.** Six elements required for real readiness; missing any = paper.
- **Tested partial is non-negotiable.** Theoretical readiness fails Day 1.
- **Transparent communication is non-negotiable.** The successor has been told. Silent succession erodes trust when discovered.
- **Founder-shaped role flag.** Some roles cannot be succeeded without first being redesigned. Route to `/org-role-design`.
- **Protected-class promotion-pattern check.** Pattern-blind succession can produce pattern-laden outcomes. Flag for legal review if applicable.
- **Per-instance only.** Write to `hr-intelligence/org/`.
- **One hand-off at close.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: 2026-04-24
---

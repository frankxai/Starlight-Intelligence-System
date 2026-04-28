---
name: org-role-design
description: Design or redesign a role with explicit decision rights, measurable accountabilities, success criteria, escalation path, interfaces with adjacent roles, and common failure modes. Refuses RACI-only outputs and vague accountabilities. Output anchors the role for hiring, performance, and succession downstream.
allowed-tools: Read, Write, Grep, Glob
argument-hint: role title (required) + --scope <ic|manager|director|exec|founder> + --current-state <new|ambiguous|broken|growing> + optional context paragraph
---

# /org-role-design

Load `SIP.md`, `VOICES.md`, `agents/starlight-org.md`, `skills/people-intelligence/org-architecture.md`. If a Genius Profile or Vision Architecture exists, load and reference. Produce a **Role Architecture** document. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**This is structural thinking architecture, not employment-law advice. Role design implicates compensation, classification (exempt/non-exempt, contractor/employee), and protected-class considerations that vary by jurisdiction. Real decisions require qualified employment counsel.**

## Input
$ARGUMENTS

## Flags

- `--scope <ic|manager|director|exec|founder>` — what tier of role this is. Determines decision-rights complexity and span considerations.
- `--current-state <new|ambiguous|broken|growing>`:
  - `new` — role doesn't exist yet; designing greenfield
  - `ambiguous` — role exists but no one (including the role-holder) is clear on decision rights or accountabilities
  - `broken` — role exists with clear failure mode (political conflict, dropped balls, persistent performance issues that aren't a person problem)
  - `growing` — role is outgrowing its design; current holder is succeeding but the role itself needs to expand or split

## Process

1. **Disclaim.** Open with non-waivable employment-law disclaimer.

2. **Locate.** Confirm role title, scope, current state. If ambiguous or broken, gather inputs: who currently fills the role (if anyone), what conflicts/escalations have surfaced, what adjacent roles exist.

3. **Vision-fit check.** Does this role serve the 3-year horizon, or just the current quarter? If only the current quarter, name it explicitly — the role may need to be designed for outgrowing within 12-18 months, which is a different design.

4. **Decision rights matrix.** For the load-bearing decisions this role touches, name explicitly:
   - **Decides** — role-holder makes the call, others informed
   - **Recommends** — role-holder analyzes and recommends; another named role decides
   - **Consulted** — must be asked before another role decides
   - **Informed** — notified after decision is made
   - **Escalates** — under condition X, the decision moves up to named role Y
   This is *not* RACI in name only. It is decision-by-decision specificity.

5. **Accountabilities tied to measurable outcomes.** Not activities. Not "owns customer success" — that's an activity. "Net revenue retention ≥ 110% on the assigned book of business, measured quarterly" — that's an accountability.

6. **Success criteria.** What does great look like in this role at 30 / 60 / 90 days, and at 12 months? Both the role-holder and their manager should be able to point to the same answer.

7. **Escalation path.** When and to whom does the role-holder escalate? What is non-escalation behavior the role-holder is trusted to handle?

8. **Interfaces with adjacent roles.** Named handoffs in and out. Where does this role's accountability end and another's begin? Most political conflict lives at undefined interfaces.

9. **Common failure modes.** Three to five specific patterns of how this role goes wrong (the role itself, not the person). Examples: role-holder accumulates power they shouldn't have; role-holder is bottleneck for decisions that should be delegated; role-holder owns outcomes they don't have authority over.

10. **Anti-pattern flags.** Explicit list:
    - **RACI-only** flag if decision rights collapsed into R/A/C/I letters without per-decision specificity → reject
    - **Vague accountability** flag if any accountability is an activity rather than a measurable outcome → reject
    - **Authority-responsibility mismatch** flag if role is accountable for outcomes without authority over inputs → flag and escalate to vision/structural redesign
    - **Title inflation** flag if scope flag and actual decision rights don't match (e.g., "Director" with no decision rights and no reports)

11. **Save.** Create `hr-intelligence/org/` directory if missing. Write `hr-intelligence/org/role-<role-slug>-<YYYY-MM-DD>.md`. Per-instance/operational data; not retained in public vaults.

12. **Hand off.** Name exactly one next move:
    - `/org-span` — if span implications surfaced (this role's manager is over/under-spanned, or this role itself has direct reports)
    - Update Performance system → new criteria match new role design
    - Update Hiring ICP → if `--current-state new` and the role needs to be filled
    - `/org-succession` → if this is a critical role with no named successor

## Output format

```markdown
# Role Architecture — <Role Title> — <YYYY-MM-DD>

> **Structural thinking architecture, not employment-law advice. Compensation, classification, and protected-class considerations vary by jurisdiction. Real decisions require qualified employment counsel.**

## Context

- **Role title:** <title>
- **Scope:** <ic | manager | director | exec | founder>
- **Current state:** <new | ambiguous | broken | growing>
- **Currently filled by:** <name or "vacant" or "to be hired">
- **Reports to:** <role title>
- **Direct reports (if any):** <count + roles>
- **Vision-fit horizon:** <serves quarter / serves 12 months / serves 3-year horizon>

## Decision rights matrix

For the load-bearing decisions this role touches:

| Decision | Role-holder's authority | Escalation trigger |
|----------|------------------------|-------------------|
| <decision 1> | Decides / Recommends / Consulted / Informed | <condition> → <named role> |
| <decision 2> | ... | ... |
| <decision 3> | ... | ... |

(Typically 5-10 load-bearing decisions. More than 15 = role is too broad. Fewer than 5 = role is too narrow or too junior to need explicit decision rights.)

## Accountabilities (measurable outcomes — not activities)

1. **<Outcome name>** — <measurable outcome statement, with how/when measured>. Owner of: <inputs the role controls>. Dependent on: <inputs the role does not control but needs>.
2. ...
3. ...

## Success criteria

- **30 days:** <specific>
- **60 days:** <specific>
- **90 days:** <specific>
- **12 months:** <specific — what does great look like at one-year-in>

## Escalation path

- **Escalates to:** <named role> when <conditions>
- **Does NOT escalate (handles autonomously):** <named scope>
- **Escalation cadence (regular check-ins, not crisis):** <weekly / biweekly / monthly with whom>

## Interfaces with adjacent roles

| Adjacent role | Handoff in | Handoff out | Boundary |
|---------------|------------|-------------|----------|
| <role A> | <what flows in> | <what flows out> | <where this role's accountability ends> |
| <role B> | ... | ... | ... |

(Most political conflict lives at undefined interfaces. Be specific.)

## Common failure modes

1. **<Failure pattern>** — <how this role can go wrong; structural cause; early signal>
2. **<Failure pattern>** — <...>
3. **<Failure pattern>** — <...>
4. (optional) **<Failure pattern>** — <...>
5. (optional) **<Failure pattern>** — <...>

## Anti-pattern flags

- [ ] **RACI-only check:** decision rights are per-decision specific, not collapsed to R/A/C/I letters → PASS / FAIL
- [ ] **Measurable outcomes check:** every accountability is a measurable outcome, not an activity → PASS / FAIL
- [ ] **Authority-responsibility match:** role has authority over inputs it's accountable for → PASS / FAIL (if FAIL, escalate to structural redesign — this role cannot succeed as designed)
- [ ] **Title-scope match:** stated scope flag matches actual decision rights and reports → PASS / FAIL

## Composes with

- **Hiring (ICP):** this role design feeds the Ideal Candidate Profile if vacant
- **Performance:** these accountabilities + success criteria become the performance conversation framework
- **Talent IS:** if role-holder shows persistent struggle on a measurable outcome, Talent reads the burnout/fit signal before assuming it's a performance problem
- **Succession:** if this is a critical role, run `/org-succession` to surface readiness on the bench

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

- **Disclaimer at top, non-waivable.**
- **Decision rights are per-decision specific.** RACI-only outputs are rejected.
- **Accountabilities are measurable outcomes, not activities.** "Owns X" alone is rejected; "X measured by Y at cadence Z" is required.
- **Authority-responsibility match is structural.** If the role is accountable for outcomes it cannot influence, the role cannot succeed — escalate to structural redesign, not to the role-holder.
- **Vision-fit named.** If the role is designed only for the current quarter, name it; the design horizon is part of the design.
- **Per-instance only.** Write to `hr-intelligence/org/`; no public vault retention.
- **One hand-off at close.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: 2026-04-24
---

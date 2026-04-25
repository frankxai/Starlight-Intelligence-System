---
name: org-span
description: Span-of-control architecture audit and redesign. Audits per-manager spans against research bounds (~5-9 for complex knowledge work; up to 15-20 for repetitive supervised). Surfaces pattern flags (top-heavy / middle-thin / over-spanned individual contributors), redesign recommendations with sequencing, and a transition plan. Refuses one-shot reorgs.
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --size <under-10|10-50|50-200|200-1000|1000+> + --growth-stage <stable|growing|scaling|hypergrowth> + optional context paragraph
---

# /org-span

Load `SIP.md`, `agents/starlight-org.md`, `skills/hr-intelligence/org-architecture.md`. If org chart exists in repo or attached, read it. Produce a **Span-of-Control Architecture Audit + Redesign**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**This is structural thinking architecture, not employment-law advice. Span changes that involve reporting-line shifts, demotions, or de-layering may implicate severance, classification, and protected-class considerations. Real decisions require qualified employment counsel.**

## Input
$ARGUMENTS

## Flags

- `--size <under-10|10-50|50-200|200-1000|1000+>` — total headcount. Smaller orgs typically have fewer span issues; larger orgs accumulate them at predictable scale transitions.
- `--growth-stage <stable|growing|scaling|hypergrowth>`:
  - `stable` — flat or declining headcount; span issues are typically calcified
  - `growing` — 10-25% YoY headcount growth; span issues emerging at the founder/exec layer
  - `scaling` — 25-50% YoY; classic top-heavy / middle-thin pattern
  - `hypergrowth` — >50% YoY; span issues are the dominant constraint

## Research bounds (cite directly)

- **Complex knowledge work:** ~5-9 direct reports per manager
- **Repetitive supervised work:** up to 15-20 direct reports per manager
- **Founder-CEOs in growth-stage:** commonly over-span at 10-15 directs; cost shows as decision bottlenecks, neglected reports, founder burnout, and a "thin middle" because layer-1 directs absorb work that should belong to a layer-2 they don't have
- **Pattern:** most orgs over-span at the top (founder/execs), under-span in the middle (managers with 2-3 reports — too few to justify the management overhead), and have variable span at IC layer

## Process

1. **Disclaim.**

2. **Inventory current spans.** For each manager (founder, execs, directors, managers):
   - Count direct reports
   - Classify work complexity per report (knowledge work / repetitive supervised / mixed)
   - Note whether reports are themselves managers (creates a span-of-spans question — managing managers is more complex than managing ICs and tightens the bound)
   - Time-allocation snapshot: how much of the manager's week goes to managing the directs vs other work?

3. **Pattern flags.** Run the standard diagnostic:
   - **Top-heavy:** founder or CEO has >9 directs doing complex work → bottleneck risk
   - **Middle-thin:** layer-2 managers exist but have <3 directs each → role isn't justifying its overhead, or layer-1 is absorbing work that should flow to layer-2
   - **Over-spanned ICs:** individual contributors with informal direct-report-like relationships (mentees, junior colleagues they "kind of manage") that don't show on the chart but consume their time
   - **Under-spanned managers:** managers with 1-2 directs — these are usually inflated IC roles or political accommodations
   - **Unbalanced layer:** within one layer, span varies wildly (one manager has 12 reports, another has 3) — usually signals favoritism or unresolved scope question
   - **Mixed-complexity over-span:** manager has 8 directs but 5 are doing complex novel work — effective span is closer to 12-15, over-bound

4. **Vision-fit check.** Where is the org going (12-month / 3-year)? Span design should anticipate the next stage, not just fix the current one.

5. **Trauma + readiness check.** Have there been span/structure changes in the last 18 months? If yes, the cost of the next change is higher (cite trauma audit). If Talent IS data is available, read engagement/burnout signals concentrated in the over-spanned units.

6. **Redesign recommendations.** For each pattern flag, propose a structural fix:
   - **Top-heavy founder fix:** add a layer (Chief of Staff, COO, or specific functional head) to absorb 4-6 of founder's directs; this is the highest-leverage move in growth-stage
   - **Middle-thin fix:** consolidate under-spanned managers (back to IC + new layer above), or expand their scope to justify the overhead
   - **Over-spanned IC fix:** formalize the relationships (move to actual reports under a manager) or kill the informal arrangement
   - **Unbalanced layer fix:** rebalance through scope clarification
   - Each recommendation has its own employment-law implication footprint — flag for counsel review

7. **Sequencing.** Span changes are reorgs in everything but name. Treat them as such:
   - **Wave 1:** role-clarity work for the affected positions (define decision rights and accountabilities under new structure before reporting lines move)
   - **Wave 2:** announce reporting-line changes with named timeline (typically 30-90 days from announce to live)
   - **Wave 3:** new structure goes live with explicit communication architecture (Kotter + Bridges)
   - **Wave 4 (post-live, ≥ 90 days):** Talent IS monitoring; adjust if signals turn red

8. **Transition plan.** For each affected manager and report:
   - What changes in their role (decision rights, accountabilities, who they go to for what)
   - What stays the same (compensation, title — unless explicitly changing, which triggers separate process)
   - Who tells them, when, and what they hear
   - First-week structural support (1:1 cadence with new manager, etc.)

9. **Save.** Write to `hr-intelligence/org/span-audit-<YYYY-MM-DD>.md`.

10. **Hand off.** Name exactly one next move:
    - `/org-reorg-trauma-audit` — if span changes will require a meaningful reorg (>30% of headcount affected)
    - `/org-role-design` for the new layer being added (Chief of Staff, COO, etc.) — most common next move when fixing top-heavy founder
    - `/org-succession` — if span changes reveal that a critical role's successor question is now urgent
    - Update Performance system criteria → if accountabilities shift in the redesign

## Output format

```markdown
# Span-of-Control Architecture Audit — <Org Name> — <YYYY-MM-DD>

> **Structural thinking architecture, not employment-law advice. Span changes implicate severance, classification, and protected-class considerations. Real decisions require qualified employment counsel.**

## Context

- **Org size:** <under-10 | 10-50 | 50-200 | 200-1000 | 1000+>
- **Growth stage:** <stable | growing | scaling | hypergrowth>
- **Trauma history (last 18 months):** <list of structural changes / "none">
- **Talent IS signals available?** <yes / no — if yes, summarize concentration of red signals>

## Current span inventory

| Manager | Role | Directs (count) | Work complexity | Span score (vs research bound) |
|---------|------|-----------------|-----------------|-------------------------------|
| <name/role> | Founder/CEO | <N> | <complex / repetitive / mixed> | <within bound / over-spanned / under-spanned> |
| <name/role> | <role> | <N> | <...> | <...> |
| ... | ... | ... | ... | ... |

## Pattern flags

- [ ] **Top-heavy:** <yes / no — if yes, name the manager(s) and their span>
- [ ] **Middle-thin:** <yes / no — if yes, name the under-spanned managers and the work absorption pattern above them>
- [ ] **Over-spanned ICs:** <yes / no — if yes, name the informal relationships>
- [ ] **Under-spanned managers:** <yes / no — if yes, name them and the structural cause>
- [ ] **Unbalanced layer:** <yes / no — if yes, name the layer and the variance>
- [ ] **Mixed-complexity over-span:** <yes / no — if yes, name the manager and the effective vs nominal span>

## Vision-fit check

<2-4 sentences: where is the org going in 12 months and 3 years; does the current span architecture serve that destination or only the current state>

## Redesign recommendations

### Recommendation 1: <description>
- **Pattern this addresses:** <flag from above>
- **Structural change:** <specifically what moves>
- **Headcount implication:** <add layer / consolidate role / no headcount change>
- **Employment-law footprint:** <flag for counsel: severance / classification / protected-class>
- **Estimated wave:** <1 / 2 / 3 / 4>

### Recommendation 2: ...

(Typically 2-5 recommendations. More = the audit is doing reorg, not span design.)

## Sequencing — waves

### Wave 1 (weeks 1-4): role-clarity for affected positions
- Affected roles: <list>
- Action: run `/org-role-design` for each before reporting-line announcement

### Wave 2 (weeks 4-6): announce reporting-line changes
- Announcement scope: <named team / leadership / all-hands>
- Effective date: <date>
- Communication architecture: Kotter (urgency / coalition / vision / communicate) + Bridges (acknowledge endings, name the neutral zone)

### Wave 3 (weeks 6-12): new structure live
- Cadence: weekly check-ins for first 4 weeks
- 1:1s: new manager-report pairs meet within 48 hours of structure going live

### Wave 4 (months 4-7): aftercare monitoring
- Talent IS engagement / burnout signals reviewed at week 4, week 8, week 12, week 24 post-live
- Pause-and-adjust trigger: if signals red in any monitored unit, halt and diagnose before next change

## Transition plan — per affected role

| Person/role | What changes | What stays | Told by | Told when | First-week structural support |
|-------------|-------------|------------|---------|-----------|------------------------------|
| <name/role> | <decision rights / reporting line / scope> | <comp / title> | <name> | <date> | <new manager 1:1 cadence, etc.> |
| ... | ... | ... | ... | ... | ... |

## Composes with

- **Performance:** updated accountabilities feed updated performance conversations
- **Talent IS:** monitoring during waves 3-4; trigger to pause if signals red
- **Hiring:** new layer (e.g., COO, Chief of Staff) needs ICP via `/org-role-design` → Hiring
- **Culture:** decision-making norms updated to match new spans

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
- **Cite research bounds explicitly.** 5-9 for complex knowledge work; 15-20 for repetitive supervised. Founder-CEO over-span pattern named.
- **Sequencing in waves, not all-at-once.** Refuse one-shot span reorgs.
- **Trauma history read.** If structural changes in last 18 months, name the cumulative cost.
- **Employment-law footprint flagged per recommendation.** Severance / classification / protected-class concentration.
- **Per-instance only.** Write to `hr-intelligence/org/`.
- **One hand-off at close.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: 2026-04-24
---

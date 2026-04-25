---
name: talent-team-dynamics
description: Audit a team's dynamics. Hackman criteria check (real team or co-acting group?), Tuckman stage, status-hierarchy map, interdependence map, communication-pattern analysis. Refuses generic "team-building exercises" without diagnostic first. Names which Hackman criterion fails when one does — clarify membership/bounds/task before "team building." Sub-system 5 of 6 in Ana's HR Intelligence Domain Sub-Stack.
allowed-tools: Read, Write, Grep, Glob
argument-hint: team identifier (required) + --size <N> + --tenure <weeks-months-years> + optional context paragraph describing observed dynamics, recent incidents, or what the manager wants
---

# /talent-team-dynamics

Load `SIP.md`, `VOICES.md`, `agents/starlight-talent.md`, `skills/hr-intelligence/people-dynamics.md`, and any prior team artifacts (`hr-intelligence/talent/team-*`, `hr-intelligence/culture/`). Produce a **Team Dynamics Audit**. Hand off to exactly one next move — usually NOT "team-building exercises."

## Disclaimer (non-waivable)

**This is HR system architecture, not clinical advice. When team-level distress signals suggest individual clinical territory in any team member, refer that individual to a qualified clinician. Not legal advice — interpersonal conflict that touches harassment, discrimination, or other protected-class territory requires jurisdiction-specific compliance and qualified counsel.**

## Input
$ARGUMENTS

## Flags

- `--size <N>` — team size. Hackman bounds: real teams above ~10 strain interdependence; above ~12-15 fragment into sub-teams. Single-digit teams have different dynamics from teens.
- `--tenure <weeks|months|years>` — how long this team has existed in current configuration. Tuckman stage signal — newly formed teams produce different patterns from teams in their third year.
- Optional context: observed dynamics in plain language ("two senior ICs are in chronic disagreement on technical direction and the rest of the team has stopped engaging in technical discussions" beats "the team is dysfunctional").

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first.

2. **Hackman criteria check (load-bearing).** This runs FIRST. Most "team dysfunction" resolves at this layer. The five criteria:

   - **Stable membership.** Has membership stayed consistent for at least 6-12 months? Or is membership rotating, with people on partial allocation, or with frequent additions/departures? Unstable membership prevents team formation. *People can't form a team if the people keep changing.*
   - **Clear bounds.** Does everyone agree who is on this team and who is not? Are there shadow members (allocate 20% but show up to 80% of meetings)? Are there ghost members (named on the team but never engaged)? Unclear bounds prevent commitment.
   - **Shared task.** Is there a single shared outcome the team owns together? Or are these N people doing N parallel pieces of work that happen to meet in retrospectives? *Co-acting groups have parallel work; real teams have shared work.*
   - **Interdependence.** Do members actually depend on each other to complete the shared task? Or could each member's work proceed if the others stopped? If interdependence is low, the team-building intervention is wrong; clarify membership and reassign.
   - **Authority over the work.** Does the team have decision-making authority over how the work gets done? Or are decisions made above them and pushed down? Authority-less teams cannot form true accountability.

   **If any criterion fails: name it explicitly.** The intervention is to fix the failed criterion, NOT to run a team-building exercise.

3. **Tuckman stage assessment.** Tuckman is folklore-grade but useful as scaffold:
   - **Forming:** polite, exploratory, deferring to authority. Normal in <8 weeks of new configuration.
   - **Storming:** disagreement surfaces, conflict on direction, status-jockeying. *Healthy* phase if it occurs and resolves; pathological if avoided (silent storming) or stuck.
   - **Norming:** norms forming, conflict resolution patterns established, roles settling. Typically 3-6 months into stable configuration.
   - **Performing:** team operating as system, sustained delivery, healthy disagreement, mutual accountability. Rare; takes 12+ months.
   - **Adjourning:** end-of-life or dissolution dynamics. Important to name when a team is closing — different intervention.

   Pair Tuckman with Hackman: a team stuck in storming for 9 months probably has a Hackman failure underneath the surface conflict.

4. **Status-hierarchy map.** The informal pecking order, NOT the org chart. Surface:
   - Who actually holds influence in technical / strategic / cultural decisions?
   - Where does deference flow? Who interrupts whom in meetings? Whose opinion changes the room?
   - Where does status-protection drive behavior that looks irrational from above? (Senior IC who can't be wrong; manager who feels threatened by a senior IC's expertise; etc.)
   - Are there status conflicts between formal and informal hierarchy? (Manager has formal authority but the senior IC has more team trust — chronic source of friction if not surfaced.)

   This is sensitive territory. Map it; do not weaponize it.

5. **Interdependence map.** Who actually depends on whom for what? Often very different from the org-chart story. Surface:
   - Real dependencies (X cannot complete their work without Y's input).
   - Asserted dependencies that aren't real (the meeting where Y is included by habit but Y has no actual contribution).
   - Missing dependencies that should exist (X and Z work parallel paths that should be coordinated and aren't).

6. **Communication-pattern analysis.** Surface dyadic patterns that pre-empt group function:
   - Two members in chronic disagreement that the rest of the team avoids triggering.
   - One member who dominates speaking time (>40% in meetings).
   - One member who has gone silent (<5% speaking time across last 8+ meetings).
   - Side-channels that route around team meetings (DMs that should be public; pre-meetings that decide things meetings then ratify).
   - Manager-as-spokesperson pattern (no one talks unless the manager invites them).

7. **Synthesis: real team or co-acting group?**
   - **Real team:** all five Hackman criteria met; meaningful interdependence; shared task; mutual accountability visible.
   - **Co-acting group:** parallel work that happens to share a manager; real team would be wrong intervention; structure should match reality (manager as 1:1 coordinator; team meeting as information-share; not artificial team-building).
   - **Broken team:** Hackman criteria nominally met but one or more functioning poorly; intervention is to clarify the failed criterion.
   - **Pre-team:** newly formed (<3 months); needs forming/storming time, not premature performance pressure.

8. **Intervention recommendations.** Match to diagnosis:
   - **Failed Hackman criterion** → fix that criterion. Membership unclear → name members + bounds. Bounds unclear → publish team charter. Task unclear → run shared-outcome workshop. Interdependence absent → restructure into co-acting group OR redesign work for real interdependence. Authority absent → escalate to leadership for decision rights.
   - **Status-hierarchy conflict** → name explicitly with manager (1:1, not in front of team); design around the friction; sometimes the fix is restructuring reporting lines.
   - **Communication pattern (dominator)** → structured turn-taking ritual; manager-mediated pattern interrupt.
   - **Communication pattern (silenced member)** → 1:1 first; check for psych safety issue (likely) — route to `/talent-psych-safety`.
   - **Stuck-in-storming** → check Hackman; if all criteria met, structured conflict-resolution conversation.
   - **Real team in performing** → protect; don't intervene.
   - **REFUSE generic team-building exercise** if the diagnosis hasn't run.

9. **Save.** Write to `hr-intelligence/talent/team-dynamics-<team>-<YYYY-MM-DD>.md`.

10. **Hand off.** Name exactly one next move:
    - Failed Hackman criterion → manager runs the named structural fix.
    - Psych safety hypothesis → `/talent-psych-safety`.
    - Individual burnout signal in audit → `/talent-burnout-detect` for that person.
    - Structural ambiguity in roles → `/org-role-design`.
    - Real-team-in-performing → no intervention; protect with light-touch quarterly review.

## Output format

```markdown
# Team Dynamics Audit — <Team Name> — <YYYY-MM-DD>

> **HR system architecture, not clinical advice. Refer individuals to a qualified clinician when distress crosses into clinical territory. Not legal advice — conflict touching harassment / discrimination / protected-class territory requires qualified counsel.**

## Context

- **Team size:** <N>
- **Tenure in current configuration:** <weeks / months / years>
- **Manager / lead:** <name or pseudonym>
- **Charter / mission (claimed):** <what the team says it is>
- **Recent incidents or what the manager wants:** <context paragraph>

## Hackman criteria check (load-bearing)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Stable membership | <met / partial / failed> | <observed> |
| Clear bounds | <met / partial / failed> | <observed — including shadow / ghost members> |
| Shared task | <met / partial / failed> | <observed — single shared outcome or parallel work?> |
| Interdependence | <met / partial / failed> | <observed — do members actually depend on each other?> |
| Authority over the work | <met / partial / failed> | <observed — decisions made by team or pushed down?> |

**Failed criteria:** <list, or "none">

## Tuckman stage assessment

**Stage:** <forming / storming / norming / performing / adjourning>

**Reasoning:** <observed patterns; tenure context; which behavioral signals support this stage>

**Stuck signal:** <if stuck-in-storming or stuck-in-forming for >6 months, flag as Hackman-failure suspicion>

## Status-hierarchy map (informal, NOT org chart)

- **Technical influence:** <who actually holds it>
- **Strategic influence:** <who actually holds it>
- **Cultural influence:** <who shapes norms>
- **Deference flow:** <who defers to whom>
- **Status-protection patterns:** <if any — name the behavior, not the person's character>
- **Formal-vs-informal conflict:** <if any — manager vs senior IC, or otherwise>

## Interdependence map

- **Real dependencies:** <X depends on Y for ...>
- **Asserted but not real:** <meetings / inclusions that aren't load-bearing>
- **Missing dependencies that should exist:** <coordination gaps>

## Communication-pattern analysis

| Pattern | Observed? | Detail |
|---------|-----------|--------|
| Dyadic chronic disagreement | <yes/no> | <if yes, who and what> |
| Dominator (>40% speaking) | <yes/no> | <if yes, who> |
| Silenced member (<5%) | <yes/no> | <if yes, who — flag for psych-safety follow-up> |
| Side-channels routing around team | <yes/no> | <if yes, what> |
| Manager-as-spokesperson | <yes/no> | <if yes, what would shift it> |

## Synthesis

**This group is currently a:** <real team / co-acting group / broken team / pre-team>

**Reasoning:** <which combination of Hackman + Tuckman + status + interdependence + communication patterns drives this classification>

## Intervention recommendations

### Primary intervention (load-bearing)

**`<named intervention>`** — `<one-line rationale tied to the diagnosis>`.

**Specifically not:** generic team-building exercise. <Why team-building wouldn't work here, given the diagnosis.>

### Secondary interventions (if needed)

1. <named, with rationale>
2. <named, with rationale>

### Reassessment cadence

- **6 weeks:** <what early signal to watch>
- **Quarterly:** <what structural shift to expect>

## Clinical / safety signals to flag

- Individual burnout signals in any team member: <yes/no — if yes, route to /talent-burnout-detect>
- Psych-safety signals (silenced member, fear-based silence in meetings): <yes/no — if yes, route to /talent-psych-safety>
- Conflict touching harassment / discrimination / protected-class territory: <yes/no — if yes, route to qualified counsel; this audit does not resolve such conflicts>

## Load-bearing next move

**`<one command or one specific manager action>`** — `<one-line rationale>`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always — clinical and legal both, non-waivable.**
- **Hackman first.** Most "team dysfunction" resolves at the criteria layer. Fix the failed criterion before any other intervention.
- **REFUSE generic team-building exercises without a Hackman + dynamics diagnostic first.** Team-building on co-acting groups, on broken-team configurations, or on Hackman-failures predictably fails. Name why the team-building wouldn't work.
- **Tuckman is scaffold, not gospel.** Pair with Hackman; stuck stages usually indicate a deeper failure.
- **Status-hierarchy mapping is sensitive.** Map; do not weaponize. Surface patterns; do not make them weapons against individuals.
- **Silenced members are a psych-safety signal.** Route to `/talent-psych-safety` follow-up.
- **Real-team-in-performing: protect, don't intervene.** Most "let's run a team-building" requests on healthy performing teams cause harm.
- **Per-team context required.** Recent transitions, manager change, scope shift, layoff aftermath all shift interpretation.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---

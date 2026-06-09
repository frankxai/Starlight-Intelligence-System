---
name: hire-assess-fit
description: Run a culture-add fit assessment for a candidate (NOT culture-fit). Names what the team currently lacks, names what this candidate adds, runs gap-bridge analysis. Refuses generic "great culture fit" framing — culture-fit reproduces, culture-add expands. Used as a SUPPLEMENT to the structured rubric, never as a replacement. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: candidate-slug (required) + role-slug (required, ICP must exist) + optional context paragraph on the candidate's distinguishing pattern
---

# /hire-assess-fit

This is part of the People Intelligence reference vertical. Composes with Genius Profile + Vision/Brand for company-as-candidate framing.

Load `SIP.md`, `VOICES.md`, `agents/starlight-hiring.md`, `skills/people-intelligence/structured-hiring.md`, the ICP (`people-intelligence/hiring/icp-<role-slug>-*.md`), and the interview debrief if it exists. Produce a **Culture-Add Fit Assessment**. Hand off to debrief or hire decision.

## Disclaimer (non-waivable)

**Hiring decisions touch employment law and protected-class considerations. Culture-add assessment must NOT proxy for protected-class characteristics — race, gender, age, religion, national origin, disability, family status. This is system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel.**

This command is a supplement to the structured rubric, not a replacement. If "fit" is being used to override a strong rubric score, the bias to flag is similarity-attraction, not the candidate. The fit assessment is read-after-rubric, never read-instead-of-rubric.

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Open with the non-waivable disclaimer. Add explicit warning: culture-add must not proxy for protected-class.

2. **Locate.** Confirm candidate-slug and role-slug. Read the ICP. Read the team-state from Operational vault if available (current team composition, skills, perspectives, energy patterns).

3. **Refuse generic framing.** If the impulse is "great culture fit" or "we just clicked," halt. The fit assessment does not produce vibes; it produces gap-bridge analysis. If the candidate generates only "we clicked" signal, that signal is similarity-attraction. Name it and continue.

4. **Team-as-of-now snapshot.** What does the team currently have? Skills, perspectives, energy types, lived-experiences. Be specific. ("The team has 4 deep-domain ICs and 1 cross-functional generalist; energy is heads-down execution; lived experience is largely scaling-stage startups.")

5. **Team-as-of-now gap.** What does the team currently lack? (Pulled forward from the ICP's team-gap-analysis section, but updated with what's been learned in interviews.)

6. **Candidate-adds inventory.** What does THIS candidate add?
   - Skill add — what new skill they bring
   - Perspective add — what new perspective (functional background, prior context, non-obvious angle)
   - Energy add — what kind of energy they bring (generative, structuring, integrating, defending)
   - Lived-experience add — what experience they carry that the team does not
   - Critical: what does this candidate add that we did not already have, and that we actually need

7. **Gap-bridge analysis.** Map candidate-adds to team-gaps. Where does this candidate close a gap the team has? Where do they not? Where do they overlap with existing strengths (overlap is fine; it's just not culture-add — it's reinforcement)?

8. **Tension analysis.** Productive tension is a feature, not a bug. Where will this candidate productively challenge the team? "Adds rigorous-process orientation to a team that has run on fast-and-loose; useful tension at a stage where process should be hardening" — that's a productive-tension fit-add finding. Name them.

9. **Bias self-check.** Before submitting:
   - Are any of the "adds" actually proxies for protected-class characteristics? If yes, REMOVE.
   - Are any of the "gaps" actually about the candidate not being similar enough to the team? If yes, that's similarity-attraction inverted; REMOVE.
   - Is the assessment overriding a strong rubric score? If yes, halt — flag for debrief facilitator to surface.

10. **Save.** Write `people-intelligence/hiring/fit-<candidate-slug>-<role-slug>-<YYYY-MM-DD>.md`.

11. **Hand off.** Default: `/hire-debrief <candidate>` — fit assessment is read INTO the debrief, never standalone.

## Output format

```markdown
# Culture-Add Fit Assessment — <Candidate Slug> — <Role> — <YYYY-MM-DD>

> **Hiring decisions touch employment law and protected-class considerations. Culture-add assessment must NOT proxy for protected-class characteristics. This is system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel.**

> **This assessment is read AFTER the structured rubric, never INSTEAD of it. If fit is being used to override a strong rubric score, the bias to flag is similarity-attraction.**

## Context

- **Candidate:** <slug, name redacted in shared instances>
- **Role:** <title>
- **ICP file:** `people-intelligence/hiring/icp-<role-slug>-<date>.md`
- **Rubric scores referenced:** <yes — debrief in progress / no — fit assessed pre-debrief, will be re-anchored>

## Refusal of generic framing

This assessment does not produce "great culture fit" findings. Culture-fit reproduces existing team composition; culture-add expands it. If the only signal generated is "we clicked" or "felt easy" or "would fit right in," that signal is similarity-attraction and the assessment continues to gap-bridge analysis.

## Team-as-of-now snapshot

The team currently has:

- **Skills:** <list, specific>
- **Perspectives:** <list — functional backgrounds, prior contexts, lived experiences represented>
- **Energy types:** <generative / structuring / integrating / defending — current mix>
- **Lived experience pattern:** <e.g., "largely scaling-stage SaaS, 3 ex-FAANG, 2 first-time-startup">

## Team-as-of-now gap

The team currently lacks (drawn from ICP team-gap-analysis, refined with interview observations):

- **Skill gap:** <what skill is missing>
- **Perspective gap:** <what perspective is missing>
- **Energy gap:** <what energy is missing>
- **Lived-experience gap:** <what experience pattern is missing>

## Candidate-adds inventory

This candidate adds:

- **Skill add:** <specific new skill — be concrete>
- **Perspective add:** <specific new perspective — functional background, prior context, non-obvious angle>
- **Energy add:** <kind of energy this candidate brings to a room>
- **Lived-experience add:** <experience this candidate carries that the team does not>

## Gap-bridge analysis

| Team gap | Does this candidate close it? | Notes |
|----------|------------------------------|-------|
| Skill gap (above) | <yes — strongly / yes — partially / no> | <specific behavior or pattern observed> |
| Perspective gap (above) | <yes / no> | <specific behavior or pattern observed> |
| Energy gap (above) | <yes / no> | <specific behavior or pattern observed> |
| Lived-experience gap (above) | <yes / no> | <specific behavior or pattern observed> |

**Net gap-bridge finding:** <e.g., "Closes 3 of 4 named gaps strongly; partial on energy gap. Net: meaningful culture-add.">

## Tension analysis (productive tension)

Where will this candidate productively challenge the team?

- <e.g., "Adds rigorous-process orientation to a team that has run on fast-and-loose. Tension surfaces in week 2-4 as process recommendations land. Productive tension — team is at the stage where process should harden.">
- <e.g., "Brings non-SaaS lived experience. Tension surfaces when product debates anchor on SaaS-default assumptions. Productive — broadens the team's prior pattern set.">

Where will this candidate frictionally clash (and is the clash productive or destructive)?

- <e.g., "Strong opinions about hiring process itself. Frictional with hiring manager who currently runs ad-hoc. Productive if hiring manager is open to evolving the process; destructive if not. Flag for hiring manager to consider.">

## Bias self-check

- [ ] No "adds" proxy for protected-class characteristics (race, gender, age, religion, national origin, disability, family status). Verified.
- [ ] No "gaps" actually mean "not similar enough to the team." Verified.
- [ ] Assessment is not overriding a strong rubric score. (If yes, halt and flag.)
- [ ] Assessment is read AFTER rubric, supplement not replacement.

## Net finding

<One paragraph. e.g., "Candidate is a meaningful culture-add. Closes the perspective gap (non-SaaS lived experience) and the energy gap (structuring orientation in a team currently dominated by execution-energy). Productive tension is real and stage-appropriate. Recommend proceeding to debrief with this assessment as supplement to the structured scores. Flag for hiring manager: consider whether you are open to evolving hiring process, since candidate brings strong opinions on it.">

## Load-bearing next move

**`/hire-debrief <candidate>`** — this fit assessment is read INTO the debrief, never standalone. The debrief integrates rubric scores + fit assessment + tension analysis into the hire decision.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Including the explicit warning that culture-add must not proxy for protected-class.
- **Refuse "culture-fit" framing.** Always. If the impulse is "we clicked," that's similarity-attraction signal, not fit signal.
- **Refuse generic "great fit" findings.** Either the candidate adds something specific that closes a named gap, or they don't. There is no third option.
- **Read AFTER rubric, not instead of rubric.** If fit is being used to override a strong rubric score, halt and flag for debrief facilitator.
- **Bias self-check is non-negotiable.** Every assessment runs the protected-class proxy check before saving.
- **Productive tension is a feature.** Name it. The candidate who challenges the team in stage-appropriate ways is the candidate who shifts the team forward.
- **One hand-off at close.** `/hire-debrief`.

— Hiring Intelligence — part of the People Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---

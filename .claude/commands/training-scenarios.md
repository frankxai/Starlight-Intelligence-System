---
name: training-scenarios
description: Scenario / case library design for a skill domain — 10-15 scenarios across difficulty range with setup, decision points, response rubric, and debrief discussion guide. Format mirrors the structured-interview rubric pattern from the Hiring sub-system. Scenarios are the bridge from concept to on-job behavior; without them, training fails encoding-specificity by construction.
allowed-tools: Read, Write, Grep, Glob
argument-hint: skill domain (required) + --difficulty-levels <e.g., "intro,mid,advanced"> + --count <10-15> + --context <on-job context the scenarios mirror> + optional context paragraph
---

# /training-scenarios

Load `agents/starlight-training.md`, `skills/people-intelligence/learning-architecture.md`, and (if it exists) the Hiring sub-system's structured-interview rubric pattern for the same skill domain. Produce a **Scenario Library** — case-based, decision-rich, rubric-scored.

## Why scenarios

Slide-based training fails encoding-specificity (Tulving) by construction: the context at encoding (a slide deck in a hotel ballroom) does not match the context at retrieval (an actual customer call, an actual feedback conversation, an actual code review). Scenarios bridge that gap.

A good scenario:
- **Sets up an on-job situation** with enough context to feel real and enough ambiguity to require judgment.
- **Forces decisions** — the learner must choose, not just observe.
- **Has a rubric** for response quality — not "right" or "wrong" but "what does a strong response include vs. a weak one."
- **Includes a debrief guide** — the discussion that converts the scenario from a quiz into a learning experience.

Format mirrors the Hiring sub-system's structured-interview rubric — same discipline applied to skill-development.

## Input
$ARGUMENTS

## Flags

- `--difficulty-levels <comma-separated>` — required. Typical: `intro,mid,advanced`. Drives stratification across the library.
- `--count <10-15>` — required. Library size. Below 10, retrieval-practice variety is insufficient. Above 15, the library bloats and the discipline of "every scenario must matter" weakens.
- `--context <on-job context>` — required. The actual situation the scenarios mirror. e.g., "1:1 feedback conversation with a struggling direct report," "customer-success renewal-risk call," "code review of junior engineer's PR."
- `--prior-program <slug>` — optional. If scenarios are for a specific program, link the scenarios to module sequence.

## Process

1. **Verify domain + context specificity.** A scenario library on "communication" is useless. A library on "1:1 feedback conversations with struggling direct reports in a remote-first context" is useful. If the domain is too vague, halt and re-scope.

2. **Stratify by difficulty.** Across the library:
   - **Intro (≈30%):** scenarios with one main decision point, low ambiguity, learner can apply a clean rule.
   - **Mid (≈45%):** scenarios with 2-3 decision points, moderate ambiguity, judgment required.
   - **Advanced (≈25%):** scenarios with multiple interlocking decisions, high ambiguity, edge cases, ethical or political dimensions, no clean answer.

3. **Build each scenario** with the structure:
   - **Title.** Memorable, short.
   - **Setup.** 100-200 words. The on-job situation. Specific people, specific stakes, specific tools/context. No "imagine you are..." — concrete.
   - **Decision point(s).** What the learner must decide. Numbered if multiple.
   - **Response rubric.** What strong response includes; what weak response misses; common traps.
   - **Debrief discussion guide.** Questions the facilitator asks the cohort to convert the scenario into learning. Hold silence. Ask, don't tell.
   - **Difficulty level.** intro / mid / advanced.
   - **Linked sub-skill.** Which L3 sub-behavior this scenario practices.

4. **Cross-link to curriculum modules.** For each scenario, name the module(s) it belongs in. Some scenarios serve simulation; others serve R1-R3 retrieval; advanced scenarios may serve R4 + post-program reflection.

5. **Diversity check.** Across the library: are the people in scenarios diverse (gender, race, role, seniority)? Are the contexts diverse (in-person, remote, hybrid)? Are the stakes varied (low, medium, high)? Mono-cultural scenario libraries fail in heterogeneous orgs.

6. **Save.** Write `hr-intelligence/training/<program-slug>/scenarios-<skill-domain-slug>-<YYYY-MM-DD>.md`. If standalone (not tied to a program), write to `hr-intelligence/training/scenario-libraries/<skill-domain-slug>-<YYYY-MM-DD>.md`.

7. **Hand off.** Default: `/training-curriculum` or `/training-program-design` consumes the library when designing simulation-rich modules.

## Output format

```markdown
# Scenario Library — <Skill Domain> — <YYYY-MM-DD>

> *Slide-based training fails encoding-specificity by construction. Scenarios are the bridge to on-job behavior.*

## Anchor

- **Skill domain:** <e.g., "1:1 feedback conversations">
- **On-job context:** <e.g., "managers giving developmental feedback to struggling direct reports in remote-first teams">
- **Difficulty stratification:** <intro N> / <mid N> / <advanced N> (total <count>)
- **Linked program (if any):** `hr-intelligence/training/<program-slug>/`
- **Format reference:** mirrors structured-interview rubric pattern from Hiring sub-system

## Scenario index

| # | Title | Difficulty | Linked sub-skill | Module placement |
|---|-------|-----------|------------------|--------------------|
| 1 | <Title> | intro | <sub-skill> | M1 simulation |
| 2 | <Title> | intro | <sub-skill> | M1 R1 retrieval |
| ... | ... | ... | ... | ... |

## Scenarios

### 1. <Title> — intro

**Sub-skill:** <which L3 sub-behavior this scenario practices>

**Setup:**
<100-200 words. Specific. Concrete people, stakes, tools. No "imagine you are..."; the learner is dropped into the situation.>

**Decision point:**
<What does the learner do? Numbered if multiple.>

**Response rubric:**
- **Strong response includes:** <specific elements>
- **Weak response misses:** <specific gaps>
- **Common traps:** <patterns to flag in debrief>

**Debrief discussion guide:**
- Q1: <opening question — usually "what did you notice about your pattern?">
- Q2: <deepening question — connects to a principle>
- Q3: <generalization question — "where else does this show up?">
- Hold silence. Ask, don't tell.

---

### 2. <Title> — intro

(same structure)

---

### ... (continue through library)

---

## Diversity audit

- **People in scenarios:** <gender mix, race/ethnicity mix, role mix, seniority mix> — pass / fail
- **Contexts:** <in-person / remote / hybrid mix> — pass / fail
- **Stakes:** <low / medium / high mix> — pass / fail
- **Cultural assumptions flagged:** <list any that assume a specific cultural context the org may not match>

## Usage notes

- **Simulation use:** scenarios at intro and mid difficulty for first-pass simulation in the program.
- **Retrieval use:** scenarios as R1-R3 retrieval prompts; rotation prevents memorization of specific scenarios.
- **Advanced use:** advanced scenarios for R4 reflection, post-program peer discussion, ongoing development conversations.
- **Refresh cadence:** every 12 months, retire 2-3 scenarios, add 2-3 new ones, prevents staleness and learner pre-knowledge.

## Load-bearing next move

If scenarios were generated for an existing program: `/training-program-design <program-slug>` — incorporate scenarios into module simulation segments.

If standalone: `/training-curriculum <new-program-slug>` — if a curriculum is being built around this skill domain.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: <ISO date>
---
```

## Rules

- **Domain specificity required.** "Communication" is too vague; "1:1 feedback conversations in remote-first context" is usable.
- **Stratification mandatory.** intro / mid / advanced mix; no all-intro libraries.
- **Rubric per scenario.** Not "right answer" — "strong response includes / weak response misses / common traps."
- **Debrief guide per scenario.** Scenario without debrief is a quiz, not a learning experience.
- **Diversity audit mandatory.** Mono-cultural libraries fail in heterogeneous orgs.
- **One hand-off at close.** Default: feed scenarios into curriculum/program design.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3)
- Generated: 2026-04-24
---

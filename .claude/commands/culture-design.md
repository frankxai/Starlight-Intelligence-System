---
name: culture-design
description: Run a full culture audit + redesign plan for an org. Diagnoses lived culture (what gets rewarded/punished/ignored — observable evidence), surfaces the gap vs declared values, recommends systems-redesign moves sequenced by leverage (hire/promote/celebrate/fire/measure/pay), and produces a 12-week implementation sequence. Refuses values-poster theater.
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --size <S|M|L> + --declared-values "v1,v2,v3" + --pain "pain1; pain2" + optional context paragraph
---

# /culture-design

Load `SIP.md`, `VOICES.md`, `agents/starlight-culture.md`, `skills/people-intelligence/culture-design.md`. Produce a **Culture Audit & Redesign Plan**. Hand off to exactly one next move.

## Refusal frame (non-waivable)

This command does **not** produce values posters, off-site agendas, or one-off culture initiatives. Culture is a system; this command audits the system and recommends systems-redesign. If the request is "give us three values for the wall," surface that this is not culture work and route to systems-redesign.

## Input
$ARGUMENTS

## Flags

- `--size <S|M|L>` — S = under 50 people, M = 50-250, L = 250+. Sequencing changes by org size.
- `--declared-values "v1,v2,v3"` — the 3-5 declared values from the values poster, deck, or about page. Required.
- `--pain "pain1; pain2"` — observed pain points (high attrition, low engagement, political behavior, etc.). At least one required.
- Optional context paragraph — recent events (M&A, restructure, founder transition), industry, remote/hybrid/onsite mix.

## Process

1. **Refuse poster work.** If the request is values-selection-only, halt and route to operational systems-redesign.
2. **Audit current state** — for each declared value, surface what's rewarded / punished / ignored with observable evidence. Schein three-layer (artifacts → espoused → underlying assumptions).
3. **Gap analysis** — name the divergence between declared values and lived behavior, specifically, with evidence.
4. **Systems redesign by leverage** — for each value to be made real, surface which of the six systems (hire / promote / celebrate / fire / measure / pay) must change. Sequence by leverage; promotion criteria typically rank highest.
5. **12-week implementation sequence** — concrete, week-numbered, owned actions. Not a 5-year strategy. The 12-week window forces sequencing discipline.
6. **Save** — write to `hr-intelligence/culture/audit-redesign-<org>-<date>.md`.
7. **Hand off** — exactly one named next move (default: `/culture-values-ops` to operationalize the top value first).

## Output format

```markdown
# Culture Audit & Redesign Plan — <Org Name> — <YYYY-MM-DD>

> *"Culture is what gets rewarded, punished, and ignored. The values on your wall are aspirations. The culture you have is the one revealed by your last promotion, your meeting schedule, and what happens to the person who quietly disagrees in a Tuesday standup."*

## Context

- **Org:** <name>, <size>, <industry>, <remote/hybrid/onsite>
- **Declared values (current):** <list>
- **Observed pain:** <list>
- **Recent context:** <M&A / restructure / founder transition / scale phase / nothing notable>

---

## Section 1 — Audit (current state)

For each declared value, surface what's rewarded, punished, and ignored. Evidence-based. Schein three-layer.

### Declared value: "<value 1>"

- **Artifact layer:** <where it appears — values poster, mission statement, careers page, deck>
- **Espoused layer:** <what leadership claims about this value, in writing or in interviews>
- **Underlying assumption (lived):** <what behavior is actually rewarded, with observable evidence — last promotion, last departure, last meeting>
- **Gap:** <named divergence with specificity>

### Declared value: "<value 2>"
<same structure>

### Declared value: "<value 3>"
<same structure>

(Repeat for all declared values.)

---

## Section 2 — Gap analysis

The pain lives in the gap. Name each gap specifically:

| Declared | Lived | Evidence | Pain manifestation |
|----------|-------|----------|--------------------|
| <v1> | <lived behavior> | <last promotion / departure / meeting> | <attrition / engagement / silent disagreement / political behavior> |
| <v2> | <lived> | <evidence> | <pain> |
| <v3> | <lived> | <evidence> | <pain> |

**Largest gap (load-bearing):** <name the gap whose closure would move the culture most>

---

## Section 3 — Systems redesign (by leverage)

For each value the org wants to make real, surface which of the six systems must change. Sequence by leverage.

### Value: "<v1>"

| System | Current state | Redesign | Leverage rank |
|--------|---------------|----------|---------------|
| Promote | <what the criteria currently are> | <what they must become> | <1-6> |
| Celebrate | <current> | <redesign> | <rank> |
| Hire | <current> | <redesign> | <rank> |
| Fire | <current> | <redesign> | <rank> |
| Measure | <current> | <redesign> | <rank> |
| Pay | <current> | <redesign> | <rank> |

**Operational test:** can an outsider deduce "<v1>" from these systems alone? <yes / no — what's missing>

### Value: "<v2>"
<same structure>

### Value: "<v3>"
<same structure>

---

## Section 4 — Anti-ritual audit

Most orgs do not need more rituals; they need fewer anti-rituals. Surface current anti-rituals to remove **before** adding new rituals.

| Anti-ritual | Mechanism | SCARF threat activated | Remediation |
|-------------|-----------|------------------------|-------------|
| Back-to-back meeting culture | No recovery time → cortisol-driven decisions, no deep work | Autonomy, Certainty | Meeting-free days; 25/50-minute defaults; no-meeting-after-hours |
| <anti-ritual 2> | <mechanism> | <SCARF> | <remediation> |
| <anti-ritual 3> | <mechanism> | <SCARF> | <remediation> |

---

## Section 5 — 12-week implementation sequence

Concrete, week-numbered, owned. No 5-year strategy.

### Weeks 1-2 — Audit ratification
- [ ] Founder/CEO reviews audit + signs off on the gap analysis
- [ ] Top 3 anti-rituals identified and committed for removal (week 4)
- [ ] Owner: <CEO / Head of People>

### Weeks 3-4 — Highest-leverage system redesign
- [ ] <System X> redesign drafted — <specific change>
- [ ] Stakeholder review (managers, HR partners)
- [ ] Anti-ritual removal: <name> ends week 4
- [ ] Owner: <name / role>

### Weeks 5-6 — Communication + rollout
- [ ] Redesigned <System X> announced internally with rationale (not "we're refreshing values" theater — explicit "this is changing because the lived culture diverged from the declared one")
- [ ] First application of new criteria (e.g., next promotion uses new criteria)
- [ ] Owner: <name>

### Weeks 7-8 — Second system redesign
- [ ] <System Y> redesign drafted
- [ ] Owner: <name>

### Weeks 9-10 — Ritual layer
- [ ] Run `/culture-rituals <org>` to design the ritual architecture
- [ ] First new ritual launched
- [ ] Owner: <name>

### Weeks 11-12 — Measurement baseline
- [ ] Run `/culture-rituals` psychological safety baseline (Edmondson 7-question short form, team-by-team)
- [ ] Re-measure quarterly going forward
- [ ] Owner: <name>

---

## Section 6 — Refused outputs (what this Plan does NOT do)

To preserve discipline, the Plan explicitly does **not** include:

- **A new values poster.** Adding values is not culture work; redesigning systems is.
- **An off-site agenda.** Off-sites are spikes; rituals are architecture.
- **A "rebrand the culture deck" recommendation.** The deck is the artifact layer. Changing artifacts without changing systems is theater.
- **An employee engagement survey rollout as a fix.** Surveys measure; they do not redesign. Use surveys *after* the systems change to validate.

---

## Load-bearing next move

**`/culture-values-ops <org> --value "<top-value>"`** — operationalize the highest-leverage value into the six systems with full operational test. Default starting point.

Alternatives only if the Plan surfaces a gap upstream:
- `/culture-rituals <org>` — if the ritual + anti-ritual layer is more urgent than systems redesign (rare; usually systems redesign is upstream)
- `/culture-onboarding-90 <role>` — if attrition is concentrated in the first 90 days (the 90-day window predicts retention better than the entire interview process)

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence — Culture, sub-system 4 of 6)
- Generated: <ISO date>
---
```

## Rules

- **Refuse values-poster work.** If the request is values-selection-only, route to systems-redesign.
- **Evidence-based audit.** Every claim about lived culture cites observable evidence — last promotion, departure, meeting, exit interview, calendar audit.
- **Schein three-layer, always.** Artifacts → espoused → underlying assumptions. Never accept artifacts as the answer.
- **Leverage-sequenced redesign.** Promotion criteria typically rank highest; do not start with hire-criteria changes (slowest cultural feedback loop).
- **12-week implementation, not 5-year strategy.** Forces sequencing discipline.
- **Anti-ritual audit non-optional.** Surface current anti-rituals and recommend removal before adding new rituals.
- **One hand-off at close.** Default: `/culture-values-ops` to operationalize the top value first.
- **Save to `hr-intelligence/culture/audit-redesign-<org>-<date>.md`.** Org-specific, not public-vault.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence — Culture, sub-system 4 of 6)
- Generated: 2026-04-24
---

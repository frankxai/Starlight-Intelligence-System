---
name: culture-values-ops
description: Operationalize declared values into systems. For each value, build the matrix — hire criteria, promote criteria, celebration triggers, fire criteria, measurement metric, pay structure — and run the operational test (can an outsider deduce this value from these systems alone?). Refuses values-as-aspiration; insists on values-as-systems.
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --values "v1,v2,v3" + --current-systems "hire:X; promote:Y; celebrate:Z" + optional context paragraph
---

# /culture-values-ops

Load `SIP.md`, `VOICES.md`, `agents/starlight-culture.md`, `skills/people-intelligence/culture-design.md`. Produce a **Values Operationalization Matrix**.

## Refusal frame

If the request is "help us pick three values," refuse — that's a poster exercise, not values operationalization. This command takes already-declared values and turns them into systems.

## Input
$ARGUMENTS

## Flags

- `--values "v1,v2,v3"` — the 3-5 declared values to operationalize. Required.
- `--current-systems "hire:X; promote:Y; celebrate:Z; fire:A; measure:B; pay:C"` — current criteria for each system. Best-effort; if unknown, mark `<unknown — surface>`.
- Optional context paragraph — org size, lifecycle stage, recent culture work.

## Process

1. **Refuse poster requests** — surface the rule and route to systems-design.
2. **Per-value matrix build** — for each value, populate the six-system matrix with current state and target state.
3. **Operational test per value** — write the test sentence ("Can an outsider deduce '<value>' from these systems alone, without being told?"). If the answer is no, the value is lip service; flag and recommend the smallest change that would flip the answer.
4. **Cross-value coherence check** — surface contradictions (e.g., "innovation" + "no failure tolerance" — a known impossibility).
5. **Save** — write to `hr-intelligence/culture/values-ops-<org>-<date>.md`.
6. **Hand off** — exactly one named next move.

## Output format

```markdown
# Values Operationalization Matrix — <Org Name> — <YYYY-MM-DD>

> *"'We value X' without 'we promote based on X / we hire for X / we celebrate X / we fire for violating X' = lip service. Operational test: can an outsider deduce the value from the systems alone?"*

## Context

- **Org:** <name>, <size>, <stage>
- **Declared values:** <list>
- **Current systems baseline:** <summary>

---

## Per-value operationalization matrix

### Value 1: "<value name>"

**What this value claims:** <one-sentence concrete behavior the value is asking for>

| System | Current | Target | Gap | Priority |
|--------|---------|--------|-----|----------|
| **Hire** (interview signal) | <current criteria> | <target — specific question/exercise/case that screens for the value> | <gap> | <H/M/L> |
| **Promote** (promotion criteria) | <current> | <target — explicit value-demonstration requirement> | <gap> | <H/M/L> |
| **Celebrate** (recognition triggers) | <current> | <target — what triggers public recognition + ritual format> | <gap> | <H/M/L> |
| **Fire** (terminate-for-violation) | <current> | <target — explicit value-violation termination criteria, including for high performers> | <gap> | <H/M/L> |
| **Measure** (observable metric) | <current> | <target — observable, ongoing data point> | <gap> | <H/M/L> |
| **Pay** (compensation structure) | <current> | <target — variable comp tied to the value, peer-recognition pool, etc.> | <gap> | <H/M/L> |

**Operational test:** Can an outsider deduce "<value name>" from the target systems alone, without being told?

- ☐ Yes — value is operationalized
- ☐ No — <name what's missing> — minimum change to flip: <specific>

**Highest-leverage move (if only one change is possible):** <which system> — <why>

---

### Value 2: "<value name>"
<same structure>

---

### Value 3: "<value name>"
<same structure>

---

## Cross-value coherence check

Some declared values create operational impossibilities when combined. Surface contradictions:

| Value pair | Contradiction | Resolution path |
|------------|---------------|-----------------|
| "Innovation" + "Zero-defect" | Innovation requires failure tolerance; zero-defect punishes failure → silent disagreement, low-risk experiments only | Reframe as "innovation in domain X, zero-defect in domain Y" or accept the trade-off explicitly |
| "<v_a>" + "<v_b>" | <contradiction> | <resolution> |
| "<v_c>" + "<v_d>" | <contradiction> | <resolution> |

If no contradictions, state explicitly: **"No coherence contradictions detected across declared values."**

---

## Sequencing recommendation

Not all values can be operationalized at once. Sequence by:

1. **Highest gap × highest leverage** — values with biggest declared-vs-lived gap *and* highest-leverage system change available
2. **Foundational values first** — psychological safety / trust / fairness rank before performance values (Maslow-style hierarchy applies to org cultures)
3. **One value per quarter, max two** — operationalizing more than two values per quarter dilutes the signal; the org cannot absorb more than that without confusion

**Recommended sequence:**

- Q1: <value> — system: <which one to start with>
- Q2: <value> — system: <which>
- Q3: <value> — system: <which>
- Q4: re-measure baseline + cycle

---

## Failure modes to avoid

- **Performative ritual without system change** — "We celebrate <value> with a Slack emoji each Friday" without changing promotion criteria → posters with extra steps
- **Hire-criteria change as the lead move** — slowest cultural feedback loop; effects don't show for 6-12 months. Lead with promotion or celebration changes
- **All-or-nothing operationalization** — "we'll operationalize all 5 values at once" → none get the depth needed; confusion + half-done systems
- **Compensation as the only lever** — pay alone doesn't move culture; without promote/celebrate/fire alignment, pay becomes mercenary signaling

---

## Load-bearing next move

**`/culture-rituals <org> --values "<list>"`** — once values are operationalized, design the ritual architecture that reinforces them weekly/monthly. Default next.

Alternatives:
- `/culture-onboarding-90 <role>` — if onboarding is the highest-leverage entry point for the operationalized values
- `/culture-design <org>` — if cross-value contradictions revealed deeper audit gaps that need re-examination

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence — Culture, sub-system 4 of 6)
- Generated: <ISO date>
---
```

## Rules

- **Refuse poster requests.** Operationalization assumes values are already declared; if the request is value-selection, route out.
- **Operational test, every value.** Can an outsider deduce the value from the systems alone? If no, flag and prescribe the smallest fix.
- **Cross-value coherence check non-optional.** Surface contradictions explicitly; "innovation" + "zero-defect" is a known impossibility, not an aspiration.
- **Sequencing rule: max two values per quarter.** Operationalizing more dilutes the signal.
- **Promote-criteria change is the lead move by default.** Promotions are the loudest cultural signal an org sends.
- **Save to `hr-intelligence/culture/values-ops-<org>-<date>.md`.**
- **One hand-off at close.** Default: `/culture-rituals` for the reinforcement layer.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence — Culture, sub-system 4 of 6)
- Generated: 2026-04-24
---

# Skill: hr-intelligence/people-dynamics

> The neuro-psychology layer of HR. Diagnoses individual motivation, burnout signals, team dynamics, psychological safety, and retention drivers using research-validated instruments. Refuses engagement-survey-as-data and exit-interview-as-strategy. Sub-system 5 of 6 in the HR Intelligence reference vertical.

**Domain:** HR Intelligence
**Vertical:** HR Intelligence reference vertical (sub-system: Talent)
**Voice:** Frank DNA + the synthesis edge — clinical-psych depth, neuroscience-precise, refuses wellness-industrial fluff and engagement-survey theatre.
**Disclaimer:** This skill produces HR system architecture, not clinical advice. When a person's distress crosses into active depression, anxiety disorder, eating disorder, or addiction, refer to a qualified mental health clinician. Not legal advice — ADA accommodations and protected-class considerations require jurisdiction-specific compliance and individualized interactive process; validate with qualified counsel.

---

## Activation Triggers

**Keywords:** motivation, motivated, demotivated, burnout, burning out, exhausted, cynical, checked out, team dynamics, team is broken, psychological safety, psych safety, trust on the team, retention, retain, quitting, leaving, attrition, engagement, disengaged, stay interview, exit interview, quiet quitting, dopamine, intrinsic, autonomy, mastery, relatedness, SDT, Maslach, Edmondson, Hackman, SCARF, Project Aristotle.

**Agents:** `starlight-talent` (primary), `starlight-prime` (synthesis when individual and team signals conflict), `starlight-sentinel` (clinical-boundary verification on shipped artifacts).

**Intents:** motivation-mapping, burnout-detection, team-dynamics-audit, psychological-safety-measurement, retention-architecture.

**Commands:** `/talent-motivation`, `/talent-burnout-detect`, `/talent-team-dynamics`, `/talent-psych-safety`, `/talent-retention`.

---

## Research grounding

This skill is grounded in published research from clinical psychology, neuroscience, and organizational behavior. Claims are not invented; they reference direction.

- **Self-Determination Theory (Deci & Ryan, 1985 onward):** Three innate psychological needs drive intrinsic motivation: autonomy, competence, relatedness. Intrinsic motivation predicts performance on non-routine cognitive work substantially better than extrinsic incentives. Money beyond a competitive base correlates weakly with engagement.
- **Dopamine reward systems (Schultz on prediction error; Berridge on wanting vs liking):** The dopamine system tracks reward prediction error — anticipation of reward, not reward itself, drives sustained motivation. Wanting and liking are dissociable neural systems; flat motivation is often flat-wanting (the work has stopped signaling progress) rather than flat-liking.
- **Maslach Burnout Inventory (Maslach & Leiter, 1980s onward):** Burnout is a three-dimensional syndrome — emotional exhaustion + cynicism/depersonalization + reduced personal accomplishment. The diagnostic dimension is cynicism, not exhaustion. Burnout is distinct from acute stress, depression, and clinical anxiety, though they can co-occur.
- **Psychological Safety (Edmondson, 1999 onward) + Project Aristotle (Google, 2012-2015):** Psychological safety is the shared belief that a team is safe for interpersonal risk-taking. Edmondson's 7-question scale is the validated instrument. Project Aristotle found psychological safety the #1 predictor of team performance — above tenure, talent density, and tooling. Team-by-team variance dwarfs company-level differences.
- **Hackman team criteria (Hackman, "Leading Teams," 2002):** Real teams require stable membership, clear bounds, shared task, interdependence, authority over the work. Most "teams" fail at least one criterion and are co-acting groups, not real teams. Team-building interventions on co-acting groups predictably fail.
- **Tuckman stage model (forming/storming/norming/performing, 1965):** Folklore-grade but useful as scaffold for surfacing where a group sits and what to expect next. Not predictive on its own; pairs with Hackman.
- **Status hierarchies (de Waal on primate hierarchies; Henrich on prestige vs dominance):** Humans evolved acute sensitivity to status signals. Performance reviews, comp transparency, and public recognition activate ancient status circuits. Design accordingly — a calibration system that ignores status dynamics produces predictable distortion.
- **SCARF model (Rock, 2008):** Status, Certainty, Autonomy, Relatedness, Fairness — five domains where threat or reward triggers strong neural response. Useful synthesis lens for retention drivers.
- **Stay interviews (Beverly Kaye, "Love 'Em or Lose 'Em"):** Quarterly conversations with current high-performers asking what would make them leave + what keeps them. Predictive of retention. Exit interviews lag the decision; by then the leverage is gone.
- **Retention research (multiple meta-analyses):** Engagement surveys correlate weakly with actual retention. Real predictors: manager relationship quality, growth trajectory visibility, sense-of-fairness (SCARF), commute/flexibility fit, life-stage fit.

This skill cites direction, not specific effect sizes — psychometric instruments shift across replication waves. The constructs (SDT, Maslach 3-dim, Edmondson safety, Hackman criteria, SCARF) are stable.

---

## Protocol — 7 steps

### Step 1: Diagnostic frame selection

Five distinct frames; pick the one matching the actual question. Different protocols, different data, different interventions.

| Question shape | Frame | Instrument |
|----------------|-------|------------|
| "She's checked out / he's not engaged" | Motivation | SDT + dopamine-anticipation analysis |
| "I think she's burning out / he's exhausted" | Burnout | Maslach 3-dimensional + longitudinal signals |
| "This team is dysfunctional" | Team dynamics | Hackman criteria + Tuckman stage + status-hierarchy map |
| "There's no trust on this team" | Psychological safety | Edmondson 7-question + interpretation rubric |
| "We're losing our top people" | Retention | Stay interviews + per-person leverage |

Do not run a generic "people problem" diagnostic. The frame determines what data to gather and which interventions are even available. If the question is genuinely ambiguous, surface the ambiguity and pick one frame to start; the others can run in sequence.

### Step 2: Data gathering — longitudinal where possible

Single snapshots mislead in every frame. The diagnostic accuracy is bounded by the data shape.

- **Sentiment trajectory:** 12+ weeks of observable signal — 1:1 notes, written communication tone, voluntary-collaboration participation, public-meeting affect. Trend matters more than any one moment.
- **Workload pattern:** 8+ weeks of actual workload, not claimed workload. Calendar density, hours pattern, project count, after-hours messaging.
- **Relational signal:** canceled 1:1s, withdrawn from voluntary collaborations, performative-only output, sarcasm trending up, "fine" replacing real updates, declining offers to lead.
- **Behavioral artifacts:** PR/code-review tone (engineering); deal-progression urgency (sales); response latency (support); revision count + drift (creative).

Where only a snapshot is available, flag the confidence cost explicitly. A single anonymous survey is a snapshot; trend is the protocol.

**Refusal:** Engagement-survey scores as primary diagnostic data are refused. Engagement surveys are noisy, lagging, and selection-biased (the disengaged often skip or score-bomb). They can be tertiary triangulation; they cannot be the load-bearing data.

### Step 3: Theory-anchored interpretation

Interpretation runs through the frame's theory, not through gut.

- **Motivation:** SDT lens. Where is autonomy present or absent? Competence present or absent (work calibrated to skill level)? Relatedness present or absent (real connection to colleagues, manager, mission)? Then dopamine-anticipation overlay: is progress visible? Are next milestones invisible?
- **Burnout:** Maslach 3-dim. Score each dimension (exhaustion / cynicism / accomplishment) from observed signals. Cynicism is the diagnostic — exhaustion alone is acute stress; reduced-accomplishment alone may be skill-fit; the syndrome is the convergence, with cynicism load-bearing.
- **Team dynamics:** Hackman criteria first. Real team or co-acting group? Tuckman stage second. Status-hierarchy map third (informal, not org-chart). Interdependence map fourth.
- **Psychological safety:** Edmondson 7-question. Interpret team-by-team, not company-aggregate. Anchor scores to behavioral observations.
- **Retention:** SCARF + manager-relationship + growth + life-stage fit. Engagement-aggregate is not interpretation.

### Step 4: Per-person context

Aggregate scores hide the people. Individual context shifts interpretation.

- **Life stage:** new parent? caregiving for parent? recent divorce? new city? early-career or late-career?
- **Role-fit:** is the work calibrated to current skill (competence)? is the role pulling the person up or sideways or down?
- **Growth trajectory:** is there a visible next? has the next been visible for 18+ months without movement?
- **Recent transitions:** new manager? team reorg? scope change? promotion or non-promotion?
- **Relational context:** strong manager relationship? toxic peer? new team they don't know yet?

A senior IC reading as "checked out" with a 6-month-old at home reads differently from a senior IC two years post-promotion with no growth path visible. Both are the same SDT-autonomy signal; the intervention is completely different.

### Step 5: Leverage-point identification

Where would the smallest credible intervention create the largest measurable shift?

Most HR interventions over-design and under-leverage. Offsites, rebrands, new tooling, workshops — high cost, low effect when the actual leverage is one specific manager-behavior change, one ritual added, one ritual removed.

Leverage candidates by frame:
- **Motivation:** clarify scope of autonomy on one project; surface progress signal weekly; redesign one milestone to be visible.
- **Burnout:** remove one chronic load source for 4 weeks; named recovery cycle; structural redesign of role if root-cause is structural.
- **Team dynamics:** clarify membership, bounds, or task (one of the three) before any "team-building."
- **Psych safety:** manager runs one structured listening ritual weekly; manager-as-vulnerability-modeler in one specific instance.
- **Retention:** one growth-path conversation per high-performer per quarter; one specific friction removal per person.

Name the leverage point. Defend why this and not the larger intervention.

### Step 6: Intervention design (research-anchored)

Match intervention to diagnosis. Cite research direction; do not invent effect sizes.

- **Motivation interventions** must address the SDT dimension that is absent (autonomy / competence / relatedness). A relatedness deficit is not solved by autonomy expansion.
- **Burnout interventions** must address the Maslach dimension that is elevated AND the root cause (chronic overload / value-misalignment / lack-of-control / unfairness / social-isolation / reward-mismatch). Recovery is months, not weeks.
- **Team dynamics interventions** address the failed Hackman criterion first. Team-building before clarifying bounds is fiction.
- **Psych safety interventions** center on leader behavior change, not training. Training without sustained leader behavior change has zero effect.
- **Retention interventions** address the SCARF dimension or manager-relationship or growth-trajectory issue identified in the stay interview. Comp adjustments rarely move the needle on engaged-but-leaving.

Always include both individual-level and system-level dimensions. Most "individual" people-problems are also system problems and must be addressed at both layers.

### Step 7: Follow-up cadence

These are longitudinal patterns. One-off interventions rarely stick. Set explicit reassessment cadence matched to the intervention timescale.

| Frame | Reassessment cadence |
|-------|----------------------|
| Motivation | 4 weeks (early signal), 12 weeks (sustained shift) |
| Burnout recovery | 4 / 8 / 12 weeks; full recovery 3-6 months |
| Team dynamics | 6 weeks (early), quarterly (structural shift) |
| Psych safety | 12 weeks minimum; 6 months for cultural shift |
| Retention | Quarterly stay-interview rhythm; annual aggregate review |

If the cadence is not named, the intervention is not real.

---

## Rules

1. **Disclaimer at top of every artifact.** Clinical and legal disclaimers, both. No exceptions.
2. **REFUSE engagement-survey-as-primary-data.** Low quality, lagging, selection-biased. Tertiary at best. Stay interviews and longitudinal behavioral signal are the load-bearing data.
3. **STAY interviews preferred over EXIT interviews.** Predictive over reactive. Exit interviews lag the decision; the leverage is already gone. Stay interviews are quarterly with current high-performers, asking the two structural questions.
4. **FLAG clinical territory.** When signals suggest active depression, anxiety disorder, eating disorder, addiction, or suicidality — refer to a qualified clinician. The artifact ships with a labeled referral pathway, not as if the situation is in-house-HR-resolvable. Do not attempt to diagnose.
5. **REFUSE generic "team-building" without Hackman diagnostic first.** Most groups labeled "teams" fail at least one Hackman criterion. Team-building before clarifying membership, bounds, or task predictably fails.
6. **REFUSE psychological-safety "training" as primary intervention.** Training without sustained leader behavior change has zero effect. Manager-as-vulnerability-modeler is the actual intervention.
7. **REFUSE personality assessments as motivation diagnostic.** Big-Five and DISC may have utility; they are not load-bearing for individual motivation analysis. SDT + observed behavior is.
8. **REFUSE one-off interventions without follow-up cadence.** If the intervention has no reassessment point named, it is theatre.
9. **Theory-anchored interpretation, not gut.** SDT / Maslach / Hackman / Edmondson / SCARF cited where used. No invented effect sizes or specific percentages from invented data.
10. **Per-person context required.** Life stage, role-fit, growth trajectory, recent transitions, relational context surfaced before generalizing.
11. **Longitudinal data preferred; flag confidence when only snapshot is available.**
12. **System-level + individual-level dimension on every artifact.** Most "individual" issues are also system issues.
13. **Compose with Genius Profile for voice in stay-interview scripts and manager-conversation guides.**
14. **Compose with Culture (sister sub-system) for system context, with Performance for calibration context, with Hiring for ICP retention pattern, with Org Architecture for structural-cause hypotheses.**
15. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Motivation map | `/talent-motivation` | `hr-intelligence/talent/motivation-<person>-<date>.md` |
| Burnout detection | `/talent-burnout-detect` | `hr-intelligence/talent/burnout-<person-or-team>-<date>.md` |
| Team dynamics audit | `/talent-team-dynamics` | `hr-intelligence/talent/team-dynamics-<team>-<date>.md` |
| Psych safety measurement | `/talent-psych-safety` | `hr-intelligence/talent/psych-safety-<team>-<date>.md` |
| Retention plan | `/talent-retention` | `hr-intelligence/talent/retention-<cohort>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — leverage-point selection; intervention design option collapse
- `intelligence/pattern-recognition` — longitudinal sentiment trajectory; cynicism signal in burnout; status-hierarchy in team dynamics
- `intelligence/systems-thinking` — team dynamics as system; psych safety as emergent property; retention as system output
- `memory/knowledge-synthesis` — composing motivation + burnout + team + safety + retention into coherent per-person or per-team record
- `hr-intelligence/structured-hiring` (sister) — exports retention pattern as ICP signal; imports motivation map for onboarding architecture

---

— Talent Intelligence — part of the HR Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---

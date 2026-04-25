# Skill: hr-intelligence/structured-hiring

> Designs the hiring instrument — ICP, interview architecture, calibration, debrief, onboarding — using meta-analytically validated predictive components. Refuses unstructured interviews and personality-as-primary. Sub-system 1 of 6 in Ana's HR Intelligence Domain Sub-Stack.

**Domain:** HR Intelligence
**Vertical:** Ana's HR (sub-system: Hiring)
**Voice:** Frank DNA + Ana edge — warm-precise, neuroscience-grounded, refuses HR fluff.
**Disclaimer:** Hiring decisions touch employment law and protected-class considerations. This skill produces system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel.

---

## Activation Triggers

**Keywords:** hiring, recruit, recruiting, interview, candidate, candidates, ICP, ideal candidate, calibration, rubric, debrief, culture fit, culture add, onboarding, 90-day plan, new hire, panel, bias, decision fatigue, structured interview, work sample, cognitive ability test.

**Agents:** `starlight-hiring` (primary), `starlight-prime` (synthesis when ICP conflicts with Vision), `starlight-sentinel` (integrity audit on shipped artifacts).

**Intents:** hiring-design, interview-architecture, calibration, debrief, onboarding-architecture.

**Commands:** `/hire-icp`, `/hire-design-interview`, `/hire-calibrate`, `/hire-assess-fit`, `/hire-debrief`.

---

## Research grounding

This skill is grounded in published meta-analyses and field research. Claims are not invented; they reference direction.

- **Schmidt & Hunter meta-analytic update (2016 update of Schmidt & Hunter 1998):** Structured interviews predict job performance approximately 2x better than unstructured. The highest-validity bundle: cognitive ability + structured behavioral interview + work sample.
- **First-impression / thin-slice research (Ambady, Willis & Todorov):** 3-second judgments inflate without scaffolding; structured interview formats reduce first-impression contamination by approximately 40%.
- **Project Oxygen (Google, internal but published findings):** Cross-rater alignment matters more than rater "quality." Calibration protocols reduce hire variance dramatically.
- **Decision fatigue research (Danziger, Levav, Avnaim-Pesso 2011 + replication literature):** Decision quality degrades across consecutive decisions; post-lunch interviews systematically score lower than morning interviews of comparable candidates.
- **Onboarding meta-analyses (Bauer et al. + BambooHR field research):** Structured 90-day onboarding predicts 12-month retention better than the entire interview process. Most teams under-invest by an order of magnitude.
- **Culture-add over culture-fit (organizational behavior literature, post-2018 shift):** Culture-fit selection systematically reproduces existing team composition; culture-add explicitly seeks gap-bridge contributions.

This skill cites direction, not specific numbers — interview research effect sizes shift across replication waves and meta-analyses. The bundle (cognitive ability + structured behavioral + work sample) is stable.

---

## Protocol — 7 steps

### Step 1: ICP from role + team gap analysis

Before defining the candidate, define the role and the gap.

- What outcome does this role unlock that the team currently does not produce?
- What does the team currently lack — skill, perspective, energy, demographic, lived experience?
- Does this role need to exist as drawn, or should the work redistribute across the team? (Composes with Org Architecture sub-system.)

Output: ICP with cognitive requirements, behavioral signals, work-history patterns, culture-add hypothesis, and a **DOES-NOT-MATTER list** (the anti-criteria — school prestige when irrelevant; years-of-experience when ramp-time matters more; "executive presence" when role is IC).

### Step 2: Predictive components selection

Choose the bundle that predicts performance for THIS role. Do not run a generic loop.

| Role tier | Recommended bundle |
|-----------|---------------------|
| Senior leadership (Director+, VP, exec) | Cognitive ability + structured behavioral + work sample (strategy doc / case) + reference triangulation |
| Senior IC (Staff, Principal, Senior Manager) | Cognitive ability + work sample + structured behavioral |
| Mid IC | Work sample + structured behavioral |
| Entry / Junior | Structured behavioral + work sample (smaller scope) |
| Customer-facing (sales, success, support) | Structured behavioral + role-play work sample |

**Hard refusals:**
- Personality assessments as primary signal — low predictive validity. Allowed only as tertiary input flagged as such, never load-bearing.
- Unstructured interviews — not signal. Time-cost without information gain.
- "Culture-fit chats" with no rubric — vibe checks dressed in HR language.

### Step 3: Rubric design

5-point scale per dimension. **Behavioral anchors at 1, 3, and 5.** Never "rate 1-5" without anchors — that is a vibe scale wearing a number.

Anchor language is concrete behavior, not trait. Examples:

- **NOT:** "Communicated well."
- **YES:** "5 — Articulated trade-offs across 3+ stakeholder groups in <4 minutes, named the load-bearing constraint, asked one clarifying question that reframed the problem. 3 — Communicated trade-offs to one stakeholder group with prompting; needed 2-3 follow-ups to surface load-bearing constraint. 1 — Surfaced trade-offs only when explicitly asked; did not name load-bearing constraint."

5-7 dimensions per role. More dimensions create scoring fatigue without resolution gain. Fewer than 5 cannot triangulate.

### Step 4: Calibration protocol

**Pre-loop calibration session (60 min, ≥3 raters):**

1. Review rubric dimension-by-dimension. Each rater paraphrases what 1, 3, 5 mean. Surface mismatched paraphrases.
2. Score 2 anchor candidates the team has previously seen (one hire-yes, one hire-no in retrospect). Compare scores. Discuss drift.
3. Agree on hire-bar examples. "What does a 3-on-this-dimension look like in our actual team?"
4. Agree on the question stems. Each rater commits to using the agreed stems verbatim for the first question of each dimension.

**Post-loop debrief session (45-60 min):**

1. Each rater submits structured scores BEFORE discussion. (Kills loud-voice halo and conformity drift.)
2. Surface inter-rater dispersion. Where did raters disagree by ≥2 points? Discuss those dimensions specifically.
3. Anchor every claim to the rubric. "I scored a 4 on Dimension X because [behavior observed]" — not "I felt strong on Dimension X."
4. Facilitator names bias patterns out loud. (See Step 6.)
5. Hire-or-no-hire decision per Step 7.

### Step 5: Decision-fatigue mitigation

Scheduling is hiring design.

- **Max 4 panels per day per interviewer.** Beyond 4, scoring quality degrades measurably.
- **No post-lunch decision panels.** The 1-3pm window scores systematically lower. Schedule technical/cognitive slots there if anywhere; never the panel that decides hire-no.
- **Front-load high-stakes slots.** First panels of the day score most reliably.
- **Tail-end skepticism in debrief.** Slot 4-of-day scores carry weighted skepticism. Acknowledge the timing.

### Step 6: Bias-correction protocol

Named patterns the facilitator flags out loud (raters do not have to self-diagnose):

- **Halo:** One strong dimension drives inflated scores on unrelated dimensions. Counter: score dimensions independently, in order.
- **Similarity-attraction:** Higher scores for candidates who resemble the rater (background, school, communication style). Counter: name when the candidate "feels familiar" and ask which dimension is actually driving the score.
- **First-impression / thin-slice:** Initial 30 seconds anchors all subsequent observations. Counter: structured first question eliminates open-ended impression-forming.
- **Recency:** Last candidate seen scores highest because they are best remembered. Counter: structured scores immediately after each interview, never end-of-day batch scoring.
- **Contrast effect:** Strong candidate after weak makes weak look weaker; weak after strong makes strong look stronger. Counter: anchor each candidate to the rubric, not to the previous candidate.
- **Confirmation bias:** Initial impression drives question selection that confirms it. Counter: structured question stems are committed pre-loop and used verbatim.

### Step 7: Hire-or-no-hire decision rule

- Score-anchored, not feel-anchored. "We hire candidates whose median score across raters is ≥4 on ≥75% of dimensions and ≥3 on all dimensions."
- **Tie-breaks default to hire-no.** False negatives cost less than false positives. A no-hire on a borderline candidate loses you one good hire (you can hire another). A yes-hire on a borderline candidate costs you 6-12 months of team drag, the rehire cost (1-2x salary), the morale cost on the team, and the cost to the candidate themselves who lands in a misfit role.
- If raters disagree by ≥2 points on a load-bearing dimension and cannot resolve via rubric anchoring, decision is hire-no until a re-interview can be designed for that specific dimension.
- Decision rationale is written into the debrief artifact, not just spoken.

---

## Rules

1. **Disclaimer at top of every artifact.** Hiring decisions touch employment law. Not legal advice. Validate jurisdiction-specific compliance with qualified counsel. No exceptions.
2. **Never advise on protected-class questions.** When in doubt, route to legal counsel. The skill does not produce question stems that touch protected-class territory (age, marital status, family planning, religion, national origin in non-eligibility contexts, disability when not bona-fide-job-related, etc.). Jurisdictions differ — legal counsel signs off.
3. **Refuse personality-test-as-primary.** Allowed only as tertiary, flagged input. Never load-bearing.
4. **Refuse unstructured interviews.** Not signal. Replace with structured behavioral or remove from loop.
5. **Refuse "culture-fit" framing.** Replace with culture-add. Always.
6. **Behavioral anchors at 1, 3, and 5 on every rubric dimension.** Non-negotiable. "Rate 1-5" without anchors is vibe-scoring.
7. **Multi-rater (≥3) for any decision-bearing slot.** A single rater cannot triangulate.
8. **Structured scores before discussion in every debrief.** The order matters. Discussion-first contaminates scoring.
9. **Tie-breaks default to hire-no.** False positives cost more than false negatives.
10. **90-day onboarding architecture for every hire-yes.** Hiring is not done at offer-accept. Onboarding is where retention is decided.
11. **Compose with Genius Profile for candidate-facing materials.** Outreach, role descriptions, and interviewer briefs run in Ana's voice — not generic recruiter-spam phrasing.
12. **Compose with Vision for company-as-candidate framing.** Senior candidates assess companies; the Vision Architecture seeds the framing.
13. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| ICP | `/hire-icp` | `hr-intelligence/hiring/icp-<role>-<date>.md` |
| Interview architecture | `/hire-design-interview` | `hr-intelligence/hiring/interview-<role>-<date>.md` |
| Calibration session | `/hire-calibrate` | `hr-intelligence/hiring/calibration-<role>-<date>.md` |
| Fit assessment | `/hire-assess-fit` | `hr-intelligence/hiring/fit-<candidate>-<role>-<date>.md` |
| Debrief | `/hire-debrief` | `hr-intelligence/hiring/debrief-<candidate>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — hire-or-no-hire rulings, ICP option collapse
- `intelligence/pattern-recognition` — drift detection across raters; bias-pattern naming
- `intelligence/systems-thinking` — interview loop as instrument; onboarding as system
- `memory/knowledge-synthesis` — composing the per-role record across ICP / architecture / calibration / debrief

---

— Hiring Intelligence — part of Ana's HR Intelligence Domain Sub-Stack —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---

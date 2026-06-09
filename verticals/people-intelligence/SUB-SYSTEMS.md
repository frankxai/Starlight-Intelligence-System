# SUB-SYSTEMS — People Intelligence Architecture

## Daily-5 across the stack (cognitive-load-aware entry pattern)

Per Luminor Board v7.4.1 ruling: 28 commands is the toolbox; 5 are the daily hands. A practitioner forking this vertical begins with these five and expands to the full 28 as practice matures.

| Command | Sub-system | Why this one first |
|---|---|---|
| **`/hire-icp`** | Hiring | Every active role starts here. The bookend. |
| **`/perf-feedback-rehearsal`** | Performance | Single highest-leverage discipline a manager-of-others can adopt. |
| **`/talent-burnout-detect`** | Talent | Early-signal monitoring; cynicism is the diagnostic before exhaustion. |
| **`/culture-values-ops`** | Culture | Turning declared values into systems is where culture work compounds. |
| **`/org-role-design`** | Org | Role clarity is the single highest-leverage org intervention. |

Each sub-system agent (`starlight-hiring`, `-performance`, `-training`, `-culture`, `-talent`, `-org`) declares its own daily-3 in the agent's "Most-run commands" section. Training is the sixth sub-system — its rhythm is program-cyclic rather than weekly, so the daily-5 omits it; bring in `/training-curriculum` when a program lands.

The architecture scales **to** the practitioner, not **at** them. Twenty-eight commands is what's available; five are what's running this week.

---

> The canonical sub-system map for this vertical. Six sub-systems composed into one cohesive People Intelligence stack. Sub-system content lives at the substrate root (under `agents/`, `skills/people-intelligence/`, `.claude/commands/`, `integrations/starter-packs/friend-starter/knowledge/`). This document is the wrapper that names the composition.

---

## Architectural premise

A vertical wraps; sub-systems do work. The wrapper enforces voice, refusal patterns, attestation, and composition rules. The sub-systems carry the domain expertise — interview architecture, feedback craft, curriculum design, culture systems, team dynamics, org structure.

This separation matters because the same six sub-systems could compose differently for a different practitioner — different voice, different refusal patterns, different productization. The wrapper is what makes them *this practitioner's People Intelligence*; the sub-systems are the underlying capability.

The 6 sub-systems map to the six classical HR-leadership domains, named research-first rather than function-first:

1. **Hiring** (decision-making under uncertainty about future performance)
2. **Performance** (feedback, calibration, conversations that move behavior)
3. **Training** (learning architecture and behavior transfer)
4. **Culture** (operationalized values and ritual systems)
5. **Talent** (team dynamics, motivation, psychological safety, retention)
6. **Org** (structure, role design, span, reorgs, succession)

---

## Sub-system 1 — Hiring

- **Slug:** `hiring`
- **Name:** Starlight Hiring
- **Agent:** `agents/starlight-hiring.md`
- **Skill:** `skills/people-intelligence/structured-hiring.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-hiring-template.md`
- **Vault namespace:** `people-intelligence/hiring/`

### Commands (5)

| Command | One-line |
|---|---|
| `/hire-icp` | Define an Ideal Candidate Profile with cognitive requirements, behavioral signals, work-history patterns, and a culture-add hypothesis — every ICP carries a DOES-NOT-MATTER list |
| `/hire-design-interview` | Generate the structured interview architecture: per-slot interviewer briefs, dimensions, question stems, behavioral anchors at scale points 1/3/5 |
| `/hire-calibrate` | Run the pre-loop calibration session — 60 min with ≥3 raters, score 2 anchor candidates, surface inter-rater drift before the loop runs |
| `/hire-assess-fit` | Run a culture-add fit assessment (NOT culture-fit) — name what the team currently lacks, name what this candidate adds, gap-bridge analysis |
| `/hire-debrief` | Run the post-loop decision debrief — 45-60 min, structured-scores-before-discussion, named bias-pattern flagging, anchor-to-rubric decision rule |

### Composes with

- **Sister sub-systems:** Performance (calibration grammar transfers), Talent (motivation patterns inform onboarding), Culture (culture-add boundary lives here), Org (role design upstream of ICP).
- **Universal IS:** Genius (voice in candidate-facing materials), Visionary (company-as-candidate framing for senior roles), Business (cost-of-mis-hire economics).

### Research grounding

- Schmidt & Hunter meta-analytic update on selection method validity (structured interviews ~2x predictive vs. unstructured)
- Project Oxygen (Google) on multi-rater calibration over rater quality
- Cognitive ability + structured behavioral + work sample as highest predictive validity bundle
- Decision fatigue research (post-lunch panels score lower; consecutive panels drift)
- 90-day onboarding architecture as retention predictor (stronger than the entire interview process)

### Refusal patterns (theater this sub-system rejects)

- Unstructured interviews as primary signal
- Personality assessments as primary signal (Myers-Briggs, DISC, etc.)
- "Trust your gut" / "we just clicked" / "great culture fit" framing
- Rubrics with numeric scales but no behavioral anchors
- Debriefs that surface scores during discussion (loud-voice halo)
- Hire decisions made without pre-loop calibration
- Hire-yes shipped without 90-day onboarding architecture

---

## Sub-system 2 — Performance

- **Slug:** `performance`
- **Name:** Starlight Performance
- **Agent:** `agents/starlight-performance.md`
- **Skill:** `skills/people-intelligence/feedback-conversations.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-performance-template.md`
- **Vault namespace:** `people-intelligence/performance/`

### Commands (5)

| Command | One-line |
|---|---|
| `/perf-feedback-rehearsal` | Rehearse a high-stakes feedback conversation before delivery — SBI-grounded, timing-aware, refusal-of-sandwich-feedback |
| `/perf-review-redesign` | Replace a broken annual ritual with research-backed continuous + quarterly + annual-comp architecture |
| `/perf-coaching-protocol` | 60-minute solution-focused + CBT-grounded coaching session script for manager-as-coach engagement |
| `/perf-difficult-conversation` | Three-conversations framework rehearsal (Stone/Patton/Heen — Harvard Negotiation Project) for high-stakes conversations |
| `/perf-conflict-mediation` | Psychologist-grade conflict mediation between two parties — 90-minute structured session |

### Composes with

- **Sister sub-systems:** Hiring (calibration grammar), Talent (motivation context for the conversation), Culture (review system expresses values-ops), Org (role-redesign sometimes is the answer instead of the review).
- **Universal IS:** Genius (voice in feedback scripts and conversation drafts), Business (compensation-tied performance system economics).

### Research grounding

- Stone, Patton & Heen — *Difficult Conversations* (Harvard Negotiation Project) — three-conversations framework
- SBI (Situation-Behavior-Impact) feedback model — Center for Creative Leadership
- Solution-focused coaching evidence base (de Shazer, Berg) for behavior-change conversations
- Continuous-feedback research (Kluger & DeNisi meta-analysis) — feedback-on-task outperforms feedback-on-self
- Forced-distribution research (rejected — measurable harm to team trust and risk-taking)

### Refusal patterns

- PIP-as-firing (PIPs are coaching instruments; if termination is the intent, run honest exit conversation)
- Stack-rank / forced distribution
- Sandwich feedback (positive-negative-positive — reduces both signals)
- Annual review as sole performance ritual
- Reviews without anchored rubrics
- Conversations delivered without rehearsal at high-stakes thresholds

---

## Sub-system 3 — Training

- **Slug:** `training`
- **Name:** Starlight Training
- **Agent:** `agents/starlight-training.md`
- **Skill:** `skills/people-intelligence/learning-architecture.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-training-template.md`
- **Vault namespace:** `people-intelligence/training/`

### Commands (5)

| Command | One-line |
|---|---|
| `/training-curriculum` | Outcome-back curriculum design — start from the L3 job behavior change, work backward to learning objectives |
| `/training-program-design` | Full program architecture for a multi-week or multi-month training, wrapping curriculum with delivery sequencing |
| `/training-coach-trainer` | Train-the-trainer (TtT) protocol for internal SMEs delivering a program |
| `/training-measure-transfer` | Kirkpatrick L3 (behavior) + L4 (results) measurement plan — refuses smile-sheet-as-data |
| `/training-scenarios` | Scenario / case library design — 10-15 scenarios across difficulty range with setup, prompts, anchors |

### Composes with

- **Sister sub-systems:** Hiring (90-day onboarding curriculum), Performance (training drives behavior change measured in performance), Culture (curriculum priority signals values-ops), Org (role redesign drives curriculum redesign).
- **Universal IS:** Genius (voice in scenario scripts and trainer materials), Business (training ROI in L4 results layer).

### Research grounding

- Kirkpatrick four-level evaluation model (L1 reaction → L2 learning → L3 behavior → L4 results) — and the well-known L1 vs. L3-correlation problem
- Spaced repetition / spaced practice research (Cepeda, Pashler, Rohrer)
- Behavior-transfer research (Baldwin & Ford) — manager-as-reinforcer, scenario-based practice, application-on-the-job within 14 days
- Cognitive load theory (Sweller) — learning architecture aware of working-memory limits
- Train-the-trainer evidence on subject-matter-expert vs. learning-design tradeoff

### Refusal patterns

- One-off workshops with no transfer architecture (entertainment, not training)
- Smile-sheet (L1 reaction) as program-success metric
- Lectures-without-practice for skill-building objectives
- Generic LMS content procurement as a learning strategy
- Compliance training that performs compliance theater rather than measurably reducing compliance violations
- Curriculum designed without naming the L3 behavior change up front

---

## Sub-system 4 — Culture

- **Slug:** `culture`
- **Name:** Starlight Culture
- **Agent:** `agents/starlight-culture.md`
- **Skill:** `skills/people-intelligence/culture-design.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-culture-template.md`
- **Vault namespace:** `people-intelligence/culture/`

### Commands (4)

| Command | One-line |
|---|---|
| `/culture-design` | Full culture audit + redesign — diagnose lived culture (what gets rewarded/punished/ignored), name gap to declared culture, redesign systems |
| `/culture-values-ops` | Operationalize declared values into systems — for each value, build hire/promote/fire/reward/celebrate matrix |
| `/culture-rituals` | Design ritual architecture across daily/weekly/monthly/quarterly + annual cadences |
| `/culture-onboarding-90` | Design a 90-day onboarding architecture for a role — first day psych safety + belonging activation, 30/60/90 milestones, manager rituals |

### Composes with

- **Sister sub-systems:** All five — culture is the constraint set that the others express. Hiring (criteria), Performance (review dimensions), Training (curriculum priority), Talent (psych-safety baseline), Org (decision-rights structure).
- **Universal IS:** Genius (voice in culture statements), Visionary (long-horizon culture roadmap), Business (culture-as-economic-asset framing).

### Research grounding

- Schein — *Organizational Culture and Leadership* — three levels (artifacts / espoused values / underlying assumptions)
- Edgar Schein on artifact-vs-assumption gap as culture-diagnostic primary signal
- Ritual design literature (Ozenc & Hagan) — ritual as culture-shaping mechanism
- Rituals at the four cadences research — daily/weekly/monthly/quarterly architecture
- Onboarding-as-culture-induction research (Bauer et al.) — first-day belonging predicts year-one retention

### Refusal patterns

- Values-poster work (declared values without `/culture-values-ops` operationalization)
- Engagement surveys deployed as culture diagnostic
- Culture statements written by marketing without practitioner input
- "We have a strong culture" as a non-falsifiable claim
- Culture-fit hiring framing (use culture-add via `/hire-assess-fit`)
- Annual values reviews disconnected from actual hire/promote/fire decisions

---

## Sub-system 5 — Talent

- **Slug:** `talent`
- **Name:** Starlight Talent
- **Agent:** `agents/starlight-talent.md`
- **Skill:** `skills/people-intelligence/people-dynamics.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-talent-template.md`
- **Vault namespace:** `people-intelligence/talent/`

### Commands (5)

| Command | One-line |
|---|---|
| `/talent-burnout-detect` | Maslach 3-dimensional burnout assessment (emotional exhaustion / depersonalization / reduced personal accomplishment) — individual or team-level |
| `/talent-motivation` | Per-person motivation map from observed behavior using Self-Determination Theory + dopamine-anticipation research |
| `/talent-psych-safety` | Edmondson 7-question scale measurement — anonymous, longitudinal, team-level, refuses-engagement-survey-as-data |
| `/talent-retention` | Retention architecture for a high-performer cohort — stay-interview script, per-person levers, named retention thesis |
| `/talent-team-dynamics` | Team dynamics audit — Hackman criteria (real team or co-acting group?), Tuckman stage, status-and-role mapping, named dysfunctions |

### Composes with

- **Sister sub-systems:** All five — Talent is the diagnostic layer that monitors the human-cost of the other sub-systems' work. Especially critical during Org reorgs and Performance review redesigns.
- **Universal IS:** Genius (voice in stay-interview prompts and motivation conversations), Business (retention math, replacement-cost economics).

### Research grounding

- Maslach Burnout Inventory — three dimensions, longitudinal patterns, organizational vs. individual factors
- Edmondson — *The Fearless Organization* — psychological safety as team-performance predictor (NOT engagement)
- Self-Determination Theory (Deci & Ryan) — autonomy / competence / relatedness as intrinsic motivation drivers
- Hackman — *Leading Teams* — five conditions for real-team effectiveness
- Tuckman team-development model (forming / storming / norming / performing / adjourning)
- Stay-interview research (vs. exit-interview) — leverage exists with current employees, not after they've left

### Refusal patterns

- Engagement scores deployed as psychological-safety measurement
- Generic "people are our greatest asset" framing without data
- Burnout treated as individual resilience problem (it is organizational; Maslach is clear)
- Motivation theories applied without observed-behavior grounding (Maslow's hierarchy, etc., applied a priori)
- Team-effectiveness conversations that skip Hackman's "is this even a real team" diagnostic
- Retention strategy built only on compensation levers

---

## Sub-system 6 — Org

- **Slug:** `org`
- **Name:** Starlight Org
- **Agent:** `agents/starlight-org.md`
- **Skill:** `skills/people-intelligence/org-architecture.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/hr-org-template.md`
- **Vault namespace:** `people-intelligence/org/`

### Commands (4)

| Command | One-line |
|---|---|
| `/org-role-design` | Design or redesign a role with explicit decision rights, measurable accountabilities, success criteria, anti-criteria |
| `/org-span` | Span-of-control architecture audit — per-manager spans against research bounds (~5-9 for complex work, larger for routine) |
| `/org-reorg-trauma-audit` | Pre-reorg trauma audit and sequencing plan — opens with 70%+ reorg-failure honesty, runs trauma history, designs trauma-aware sequencing |
| `/org-succession` | Succession planning with real readiness — per critical role: identified successor, readiness gap, named development pathway, decision-rights transfer plan |

### Composes with

- **Sister sub-systems:** Hiring (role design upstream of ICP), Performance (role redesign sometimes is the performance answer), Training (role redesign drives curriculum), Culture (decision-rights structure expresses culture), Talent (burnout detection runs in parallel with reorg).
- **Universal IS:** Visionary (org structure serves long-horizon strategy), Business (span-of-control economics, restructure ROI).

### Research grounding

- Galbraith STAR model (Strategy / Structure / Processes / Rewards / People) — org-design framework
- Span-of-control research (Hamilton's classic + recent updates) — ~5-9 for complex work, larger for routine, smaller for novel
- Reorg-failure research — 70%+ of reorgs fail to achieve stated objectives (McKinsey, BCG, et al.) — typically because trauma + sequencing not respected
- Succession research — paper-only succession plans correlate poorly with actual successful transitions; readiness assessment + development pathway + decision-rights transfer matter
- Decision-rights frameworks (RACI, RAPID, etc.) — operational primitives for role design

### Refusal patterns

- Reorgs sequenced without trauma history or burnout monitoring
- Span-of-control set without naming the work-complexity reasoning
- "Identified successor" succession plans with no readiness assessment, no pathway, no decision-rights transfer plan
- Role design without explicit decision rights
- Reorganizations driven by political dynamics rather than work-design needs (named, reframed)
- Restructure-as-performance-management substitute (use Performance sub-system instead)

---

## Composition rules across sub-systems

The 6 sub-systems are designed to compose horizontally. Five non-negotiable composition rules:

1. **Culture must define before Hiring assesses culture-add.** If Culture is undefined, "culture-add" collapses into the same vibe-check Hiring is built to prevent. Run `/culture-design` + `/culture-values-ops` before `/hire-assess-fit`.

2. **Org Architecture runs upstream of ICP.** Before defining a candidate profile, ask whether this role should exist as drawn or whether the work redistributes across the existing team. Run `/org-role-design` before `/hire-icp` for new roles or reorganized roles.

3. **Talent burnout-detection runs in parallel with Org reorg.** Reorgs predictably trigger burnout in 70%+ of cases. `/talent-burnout-detect` runs before, during, and after `/org-reorg-trauma-audit` execution.

4. **Hiring's calibration grammar transfers to Performance.** The same multi-rater calibration logic that prevents hire drift prevents review drift. The rubric architecture from `/hire-design-interview` exports to `/perf-review-redesign`.

5. **Training transfer measurement composes with Performance.** L3-behavior measurement is a performance question, not a training question, after week 6. `/training-measure-transfer` outputs feed into `/perf-feedback-rehearsal` and `/perf-coaching-protocol` cycles.

---

## Sub-system count rationale

Six sub-systems is the minimum that covers HR's classical functional surface without redundancy and the maximum that sustains synthesis across them. Five would force consolidation of two domains that have meaningfully different research grounding (e.g., Hiring + Performance share calibration but the failure modes diverge). Seven would introduce cosmetic separation (e.g., splitting Compensation out of Performance) that does not earn its keep in research distinctiveness.

The 6-sub-system count is not arbitrary; it reflects the field's actual research clusters. Practitioners forking this vertical may add or merge sub-systems if their practice synthesis demands it — the wrapper supports composition flexibility — but the reference scaffold ships with these six.

---

## People Intelligence ↔ Relational IS — boundary delineation

Added per Luminor Board v7.6.0 verdict (Lyssandria challenge): the rename to People Intelligence creates a name-adjacency with the universal-tier **Relational IS** (one of the 9 universal Intelligence Stack layers). Without explicit delineation, the boundary question keeps re-surfacing. Naming it here closes the loop.

**People Intelligence (this vertical) studies:** people-flourishing *within organizations and teams* — org structure, role design, hiring loops, performance conversations, training programs, culture-as-system, team dynamics, talent retention, succession architecture. The unit of analysis is **the team / the role / the org**. The frame is *organizational systems that produce or destroy human flourishing in work contexts*.

**Relational IS (universal layer) studies:** between-person relational dynamics in *any* context — alliances (commercial / co-creative), family systems, peer collaboration, community membership, mentorship, friendship, network architecture. The unit of analysis is **the relationship / the alliance / the network**. The frame is *how two-or-more sovereign humans architect compounding trust over time*.

**Composition rule:** People Intelligence inherits relational primitives *from* Relational IS for any human-to-human surface inside an organizational frame (1:1s, debrief conversations, stay-interviews). Relational IS does not inherit from People Intelligence; it is the more general layer.

**Boundary cases:**

| Situation | Owner | Why |
|---|---|---|
| 1:1 coaching session inside a team | **People Intelligence** | Organizational performance frame; team-context drives the architecture |
| Friendship strain affecting work | **Relational IS** primary, People consults | Relational primitive; People consults on workplace impact only |
| Alliance forge between two founders | **Relational IS** | No organizational frame between sovereigns; pure relational architecture |
| Co-founder dispute inside one company | **People Intelligence** + Relational | Both apply — Relational for the dispute itself, People for org-design implications |
| Mentor relationship outside any company | **Relational IS** | No organizational frame |
| Mentor relationship as part of internal talent program | **People Intelligence** | Organizational frame (talent retention sub-system) |
| Family-member-as-employee dynamics | Both, sequential — **Relational IS first** | Relational primitives precede the workplace overlay |
| Network-building for career capital | **Relational IS** | Personal network architecture; not org-internal |

**The asymmetry:** Relational IS is research-grounded in attachment theory, alliance theory, social network analysis. People Intelligence is research-grounded in industrial-organizational psychology, employment-law-aware management practice, and team-effectiveness research. They share Edmondson on psychological safety (because that research itself spans both frames), but most of their literature does not overlap.

**Practitioner test for which to invoke:** Ask "is the unit of analysis a *role / team / org* or a *relationship / alliance / network*?" If role / team / org — People Intelligence. If relationship / alliance / network — Relational IS. If both, sequence Relational first (it carries the underlying primitives).

---

**Built on SIP** — People Intelligence vertical SUB-SYSTEMS.md · v0.1.2 · SIP v1.1.0

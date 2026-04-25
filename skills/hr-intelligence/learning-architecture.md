---
name: hr-intelligence/learning-architecture
domain: hr-intelligence
description: Design adult-learning programs that actually transfer to the job. Outcome-back curriculum, spaced retrieval, encoding-specificity, cognitive-load discipline, Kirkpatrick L3+L4 measurement, train-the-trainer protocols. Refuses one-off-workshop theater and L1-only smile-sheet evaluation.
triggers:
  keywords: ["training", "curriculum", "program design", "L&D", "learning and development", "trainer", "facilitator", "course", "workshop", "transfer", "onboarding curriculum", "upskilling", "reskilling", "Kirkpatrick", "spaced retrieval", "retrieval practice", "cognitive load", "andragogy", "train-the-trainer", "TtT", "scenario library", "case-based learning"]
  agents: ["starlight-training"]
  intents: ["training", "learning-design", "curriculum", "transfer-measurement", "facilitator-development"]
priority: high
load_level: core
---

# Learning Architecture

> *"Most corporate training fails to transfer to the job — somewhere around 70% by industry estimates. The shame is not the failure rate; the shame is calling delivery 'training' when the work hasn't started."*

## Purpose

Adult learning is a structural problem, not a content problem. A vendor with great slides will not produce behavior change unless the program is engineered for transfer — outcome-back design, baseline measurement, spaced retrieval, encoding-specificity, cognitive-load discipline, manager reinforcement, and Kirkpatrick L3 + L4 measurement. Most L&D budgets are spent on the *delivery layer* (decks, LMS, vendor day-rates) and starve the *transfer layer* (spacing, simulation, manager engagement, measurement). This skill installs the transfer layer.

The skill is grounded in the convergent direction of decades of learning research: Roediger & Karpicke on retrieval practice, Bjork on desirable difficulty, Sweller on cognitive load, Knowles on andragogy, Tulving on encoding specificity, Kirkpatrick on the four levels of evaluation. None of this is novel. What is novel is that most corporate L&D ignores it.

## Activation

**Fires when:**
- Any of the five `/training-*` commands is invoked
- Keywords: training, curriculum, program design, L&D, learning, trainer, facilitator, course, workshop, transfer, onboarding curriculum, upskilling, reskilling, Kirkpatrick, spaced retrieval, retrieval practice, cognitive load, andragogy, train-the-trainer, TtT, scenario library, case-based learning
- A behavior gap surfaces from Performance Intelligence and capability building is the named response
- A new SME is being deployed as an internal trainer (TtT trigger)
- A program previously failed transfer and a redesign is requested

**Does NOT fire when:**
- The request is for media production (video, slide design, e-learning authoring) without curriculum design — that is downstream execution, not learning architecture
- The request is for legally-mandated compliance training where the goal is legal cover, not behavior change — flag the distinction and route appropriately; do not measure mandated-for-legal-cover as a learning program

## Protocol

### Step 1 — Outcome definition (Kirkpatrick L3 + L4)

Before any design begins, name two things explicitly:

- **L3 (behavior):** What will be different on the job, observably, at 90 days? Specific, behavioral, observable. Not "managers will understand feedback" — that is L2 at best. Try "in 1:1s, managers will give at least one specific behavioral observation per direct report per week, observed via 1:1 sampling."
- **L4 (results):** What business metric moves as a result of that behavior change? Engagement score? Retention of high performers? Quality defect rate? Customer NPS? Pipeline velocity? Tie L3 to L4 explicitly. If L4 cannot be named, the program is justifying itself on faith — refuse and re-scope.

If the requester cannot answer L3 and L4, halt. Park and route upstream — Performance Intelligence (if the gap is performance), Org Intelligence (if the gap is structural), or Culture Intelligence (if the gap is values-to-behavior translation). The training program is not the upstream answer.

### Step 2 — Pre-assessment (baseline)

You cannot measure transfer without a baseline. Pre-assessment options, in order of rigor:

- **Behavioral observation** — 1:1 sampling, peer observation, manager observation against the L3 rubric. The gold standard.
- **Scenario test** — pre-program scenario response, scored against rubric. Mid-rigor; correlates with L2 + early L3.
- **Self-rating + peer rating** — useful when behavior is hard to observe directly; flag the bias.
- **Business-metric snapshot** — for L4 anchoring. The metric value at T-0.

A program without baseline cannot prove transfer even when transfer happens. Baseline is non-negotiable.

### Step 3 — Curriculum sequencing

The spine, in order:

1. **Concept introduction (light)** — minimum viable conceptual foundation. Resist the urge to "cover everything." Coverage is content theater; learning is selective.
2. **Application practice (with feedback)** — learners apply the concept in a low-stakes setting, get feedback, iterate. Multiple cycles. Feedback specificity matters more than feedback length.
3. **Spaced retrieval** — learners are tested (not re-read; tested) at 1-day, 1-week, 1-month, 3-month checkpoints. Retrieval practice outperforms re-reading by orders of magnitude (Roediger & Karpicke). Build the schedule into the program; do not leave it to learner self-discipline (which fails).
4. **Simulation in performance-context** — case-based or role-played scenarios that resemble the actual on-job situation. Same vocabulary, same tools, same pressure (within reason).
5. **On-job application (with manager reinforcement)** — the learner attempts the behavior on the job; the manager observes, reinforces, coaches.
6. **Measurement** — L3 at 30/60/90 days; L4 at 90+.

This is the spine. Variations come from cohort, domain, constraints — but no element is optional.

### Step 4 — Cognitive-load design

Working memory is bounded — roughly 4 elements per load (Sweller; the "magic number" varies by formulation but the constraint is real). Curriculum that introduces 12 concepts in a 90-minute session does not produce 12 learned concepts; it produces ~3 fuzzy ones and 9 forgotten ones.

Design principles:

- **Chunk** — group content into ≤4-element loads. Move to the next load only after consolidation.
- **Ramp** — start with low-complexity examples; increase complexity as schemas form. The desirable-difficulty band (Bjork) is real but earned — not a starting point.
- **Pre-load prerequisites separately** — if the learner needs to know X before learning Y, deliver X in a prior session. Trying to deliver X and Y in the same session blows working memory.
- **Strip extraneous load** — fancy slide animations, irrelevant examples, throat-clearing. Each unit of extraneous load competes with intrinsic load.

### Step 5 — Encoding-specificity (Tulving)

Context at encoding must match context at retrieval. Customer-service training that happens in a hotel ballroom and never simulates a customer call will not transfer to a customer call. Sales coaching that happens in PowerPoint and never simulates an objection-handling interaction will not produce objection-handling skill.

Practical implications:

- **Train in the same tools** the learner uses on the job (CRM, ticketing system, email client, code editor, etc.).
- **Use the same vocabulary** the learner uses on the job. If the org calls customers "members," the curriculum says "members."
- **Simulate the pressure** within reason — time constraints, ambiguity, partial information. A scenario where the learner has all the information they need is not a realistic scenario.
- **Practice in the physical or virtual context** when possible (the contact-center floor, the production line, the client meeting room) — not always feasible, but always preferred.

### Step 6 — Spaced retrieval scheduling

Build the retrieval schedule before delivery, not after:

| Checkpoint | Timing | Mechanism |
|------------|--------|-----------|
| R1 | 1 day post-session | Quick scenario or short-answer prompt; 5-10 min |
| R2 | 1 week post-session | Application reflection + scenario response; 15 min |
| R3 | 1 month post-session | Mini-simulation or peer-discussion prompt; 30 min |
| R4 | 3 months post-session | On-job behavior observation by manager (counts as both retrieval and L3) |

Retrieval is *retrieval* — the learner generates the response from memory, not re-reads. Re-reading feels productive and isn't. The retrieval format can be light (a Slack prompt, an email check-in, a quick quiz) but the act of retrieving is the consolidating mechanism.

### Step 7 — Transfer measurement (Kirkpatrick L3 + L4)

L1 (reaction) is mostly noise — well-rated programs frequently fail to transfer; poorly-rated programs frequently transfer when manager reinforcement is strong. L2 (learning — can the learner pass a quiz) is necessary but does not predict L3.

**L3 measurement (behavior — the load-bearing layer):**

- **Manager observation** at 30/60/90 days against the L3 rubric defined in Step 1. Build the rubric into the program design; train managers on how to use it (this is part of the manager-engagement plan).
- **Peer observation or 360-style sampling** as a triangulation source — managers under-observe their own teams; peers see things managers don't.
- **Self-report with behavioral examples** ("describe a specific instance in the last 30 days where you did X") — useful as a triangulation source; not load-bearing on its own.
- **Sampling cadence** — 30/60/90 minimum; quarterly thereafter for high-stakes programs.

**L4 measurement (results):**

- The business metric named in Step 1, measured at T+90 (or longer, depending on the metric's natural cadence).
- Confounder discipline — other things change at the same time as a training program. Acknowledge confounders explicitly; do not over-claim causation. Pre/post comparison + control group (if feasible) + qualitative evidence from L3 = the strongest claim a training program can honestly make.

**Redesign feedback loop:**

- After the first cohort completes the L3+L4 cycle, review what transferred, what evaporated, what got reinforced, what was forgotten. Redesign for cohort 2. This is the cycle that improves programs over time.

## Rules — what this skill refuses

1. **Refuse one-off workshops billed as "training."** A single 4-hour workshop without spacing, without measurement, without manager reinforcement = entertainment. Reframe as the kickoff component of a real program, or refuse.
2. **Refuse compliance click-throughs without measurement** as if they were learning programs. Some compliance training (sexual harassment, data privacy, AML, others jurisdiction-specific) is *legally mandated* — those exist for legal cover, not learning. Flag the distinction explicitly. The compliance-mandated category is satisfied by completion records, not by behavior change. Do not confuse the two; do not measure them with the same instrument; do not let one bury the other in the program portfolio.
3. **Refuse SME-as-trainer without TtT preparation.** The SME knows the content. The SME has not been taught how adults learn. Without TtT, the cascade is broken before the first cohort. Route to `/training-coach-trainer` and complete TtT before deployment.
4. **Refuse L1-only smile-sheet evaluation.** "The participants rated it 4.7/5" is not evidence of training transfer. Insist on L3 minimum. If L3 cannot be measured, the program is not measurable; flag it as such and do not claim transfer.
5. **Refuse content-first design.** "I have decks; design a program around them" is the structural cause of transfer failure. Outcome-first or refuse.

## Output expectations

Whichever command fires, the artifact:

- Names L3 + L4 explicitly at the top
- Includes baseline measurement design
- Includes spaced retrieval schedule (R1–R4 minimum)
- Includes cognitive-load map (chunks per session, ramp profile)
- Includes encoding-context match (where simulation happens, what tools)
- Includes manager-reinforcement plan
- Includes L3 + L4 measurement plan with rubric and cadence
- Flags compliance-mandated training as a separate category if relevant
- Ends with "Built on SIP" attestation

## Composition

Composes with: `intelligence/systems-thinking` (program-as-system), `intelligence/decision-framework` (sequencing and modality choices), `intelligence/pattern-recognition` (cross-cohort transfer pattern reading), `memory/knowledge-synthesis` (curriculum + program + measurement + TtT into one coherent program).

Does not duplicate: existing instructional-design or LMS-authoring skills. This skill operates at the architecture layer — what to build, why, and how to measure — not the production layer.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: 2026-04-24
---

---
name: training-coach-trainer
description: Train-the-trainer (TtT) protocol for internal subject-matter-experts who will deliver a training program. Condensed adult-learning principles, facilitation skills, common SME-as-trainer failure modes, cohort facilitation practice schedule, and a TtT-readiness rubric. Refuses SME deployment without TtT.
allowed-tools: Read, Write, Grep, Glob
argument-hint: program slug + SME identifier (required) + --delivery-date <YYYY-MM-DD> + optional context paragraph
---

# /training-coach-trainer

Load `agents/starlight-training.md`, `skills/people-intelligence/learning-architecture.md`, and the Curriculum + Program Design for the program the SME will deliver. Produce a **Train-the-Trainer Plan** that converts a subject-matter-expert into a facilitator.

## Why this exists

Most internal trainers are subject-matter-experts who have never been taught how adults learn. They lecture (because lecture is what they experienced as students). They overload (because they want to "cover everything"). They confuse "I covered it" with "they got it." They skip retrieval (because retrieval feels like quizzing, which feels infantilizing). They run out of time on simulation (because simulation is uncomfortable for them as much as for learners). They skip debrief (because debrief requires holding silence).

None of this is the SME's fault. They were never taught. TtT teaches them.

Without TtT, the cascade is broken. The curriculum survives; the delivery doesn't. Refuse SME deployment without TtT complete.

## Input
$ARGUMENTS

## Flags

- `--delivery-date <YYYY-MM-DD>` — required. The TtT must complete at least 2 weeks before delivery for cohort facilitation practice to land.
- `--sme-experience <none|some|experienced>` — optional. None = full TtT (4-6 sessions). Some = focused TtT (2-3 sessions). Experienced = facilitation refresh + program-specific brief.

## Process

1. **Verify program design exists.** No curriculum + program design → halt. Route to `/training-curriculum` and `/training-program-design`.

2. **Assess SME baseline.** What does this SME know about adult learning? About facilitation? About this specific program? The TtT plan adapts to the answer.

3. **Build the TtT curriculum** — meta-curriculum for the SME, 4-6 sessions for SMEs without facilitation background:

   **Session 1 — Adult learning principles (condensed Knowles).** Adults need: relevance to their problem, autonomy in how they engage, prior experience honored, problem-centered (not subject-centered) framing, motivation tied to self-concept. The SME unlearns the lecture-as-transmission model.

   **Session 2 — How memory and transfer actually work.** Working memory is bounded (Sweller). Retrieval beats re-reading by orders of magnitude (Roediger & Karpicke). Context at encoding must match context at retrieval (Tulving). The SME stops trying to "cover everything" and starts engineering retrieval.

   **Session 3 — Facilitation skills.** Holding silence. Asking questions instead of answering. Running scenarios with stakes. Debriefing without lecturing. Managing the dominant participant. Drawing out the quiet participant. Reading the room. (Most SMEs have done none of these on purpose.)

   **Session 4 — Common SME-as-trainer failure modes.** Self-recognition material. The lecture-collapse pattern. The "covering everything" pattern. The skip-the-simulation pattern. The lecture-the-debrief pattern. The "I am the expert so I talk" pattern. The SME watches recordings of these patterns and identifies them in their own dry-runs.

   **Session 5 — Cohort facilitation practice (live).** SME facilitates a session of the actual program with a small practice cohort (peers or volunteers). Recorded. Debriefed by TtT coach. Specific behavioral coaching feedback.

   **Session 6 — Final readiness check + program-specific brief.** Full module walkthrough by SME, scenario answer keys mastered, learner failure mode responses prepared, debrief discussion prompts internalized.

4. **TtT-readiness rubric.** The SME passes only if they can demonstrate:
   - Restate adult-learning principles in their own words and apply to this program
   - Run a 30-min retrieval-practice activity without lecturing
   - Run a scenario simulation with debrief and hold silence appropriately
   - Recognize their own SME-as-trainer failure modes from session-4 material
   - Walk through one full module with confident voice, learner-failure-mode preparation, and rubric-based feedback skill

   If the SME fails the rubric, they don't deliver. Either re-run TtT, pair them with a co-facilitator (TtT-graduate), or replace with external vendor for cohort 1.

5. **Save.** Write `hr-intelligence/training/<program-slug>/ttt-<sme-slug>-<YYYY-MM-DD>.md`.

6. **Hand off.** Default: program launch (now with TtT-graduated facilitator). Alternative: `/training-measure-transfer` if measurement plan still needs detail.

## Output format

```markdown
# Train-the-Trainer Plan — <SME Name> for <Program Name> — <YYYY-MM-DD>

> *Most internal trainers are SMEs who were never taught how adults learn. The cascade breaks without TtT. This is TtT.*

## Anchor

- **Program:** `hr-intelligence/training/<slug>/program-design-<slug>-<date>.md`
- **SME:** <name + role + relationship to content>
- **SME experience:** <none | some | experienced>
- **Delivery date:** <YYYY-MM-DD>
- **TtT must complete by:** <delivery date - 2 weeks>

## SME baseline assessment

- **Content mastery:** <strong | adequate | gaps — list gaps>
- **Facilitation experience:** <none | informal | formal — describe>
- **Adult-learning principles familiarity:** <none | passing | working knowledge>
- **Self-awareness of failure modes:** <none | some | strong>
- **Risk profile for cohort 1:** <high | medium | low — informs co-facilitator decision>

## TtT curriculum

### Session 1 — Adult learning principles (90 min)
- **Goal:** SME unlearns the lecture-as-transmission model.
- **Content:** Knowles condensed — relevance, autonomy, prior experience, problem-centered, self-concept-tied motivation.
- **Activity:** SME redesigns one micro-section of the program from "lecture" to "problem-centered." Scored against rubric.
- **Pre-work:** read 2 short pieces (Knowles primer + one transfer-failure case study).

### Session 2 — Memory and transfer mechanics (90 min)
- **Goal:** SME stops trying to "cover everything" and starts engineering retrieval.
- **Content:** Working memory bounds (Sweller). Retrieval practice (Roediger & Karpicke). Encoding specificity (Tulving). Spaced repetition.
- **Activity:** SME audits one program module against cognitive-load constraint. Splits if needed.

### Session 3 — Facilitation skills (120 min)
- **Goal:** SME develops the muscles of facilitation, distinct from expertise.
- **Content:** Holding silence. Asking instead of answering. Running scenarios with stakes. Debriefing without lecturing. Managing dominant + drawing out quiet participants.
- **Activity:** Live drills with coach. Recorded.

### Session 4 — SME-as-trainer failure modes (90 min)
- **Goal:** SME recognizes their own patterns.
- **Content:**
  - Lecture-collapse: program drifts back to lecture under stress.
  - Cover-everything: SME tries to cover all content at depth, blows working memory.
  - Skip-simulation: SME runs out of time, simulation is what they cut.
  - Lecture-the-debrief: SME asks question, then answers their own question 5 seconds in.
  - I-am-the-expert-so-I-talk: speaking-time imbalance >70% facilitator.
- **Activity:** SME watches recordings (theirs and others'), identifies patterns. Self-coaching plan.

### Session 5 — Live cohort facilitation practice (180 min)
- **Goal:** SME facilitates a session of the actual program with practice cohort.
- **Setup:** practice cohort = 6-8 peers or volunteers. Recorded.
- **Activity:** SME facilitates one full module. TtT coach observes silently.
- **Debrief:** detailed behavioral coaching from coach + practice-cohort feedback.

### Session 6 — Final readiness check + program-specific brief (90 min)
- **Goal:** SME demonstrates rubric pass; program-specific assets internalized.
- **Activity:** rubric run-through with coach.
- **Outputs:** mastered scenario answer keys, prepared learner-failure-mode responses, debrief discussion prompts internalized.

## TtT-readiness rubric

| Capability | Pass criterion | SME demonstrates |
|------------|----------------|--------------------|
| Adult-learning principles | Restate in own words + apply to this program | <yes/no/needs work> |
| Retrieval practice facilitation | Run 30-min retrieval activity without lecturing | <yes/no/needs work> |
| Scenario simulation + debrief | Hold silence, ask not answer, manage dynamics | <yes/no/needs work> |
| Failure-mode self-awareness | Identify own patterns from session-4 material | <yes/no/needs work> |
| Module mastery | Full module walkthrough with confident voice + rubric-based feedback skill | <yes/no/needs work> |

**Overall pass:** all five at "yes" before delivery date. If "needs work" on ≥2: re-run TtT or pair with co-facilitator.

## If SME fails rubric

Three options:
1. **Extended TtT:** add sessions on weak areas; re-test in 2 weeks.
2. **Co-facilitator pairing:** pair SME with a TtT-graduated co-facilitator for cohort 1; SME owns content, co-facilitator owns dynamics.
3. **External vendor for cohort 1:** SME observes; SME delivers cohort 2 with co-facilitator; solo by cohort 3.

Default if fail: option 2.

## Load-bearing next move

**Program launch** with TtT-graduated facilitator on the delivery date.

Alternative next moves (only if a specific gap surfaces):
- `/training-measure-transfer <program-slug>` — if measurement plan still needs detail
- `/training-scenarios <skill-domain>` — if scenarios were thin during TtT session 5

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: <ISO date>
---
```

## Rules

- **No program design → halt.** Route to `/training-program-design`.
- **TtT completes ≥2 weeks before delivery.** Cohort facilitation practice needs space to land.
- **Rubric pass is mandatory.** SME who fails rubric does not deliver solo.
- **Five failure modes are explicit.** SME must self-identify, not be told only.
- **Live cohort practice is non-negotiable.** Reading about facilitation does not produce facilitation.
- **One hand-off at close.** Default: program launch.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3)
- Generated: 2026-04-24
---

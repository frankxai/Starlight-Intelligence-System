---
name: perf-coaching-protocol
description: Generate a 60-minute solution-focused + CBT-grounded coaching session script for a manager-as-coach engagement. Coaches use questions, not advice. Produces session structure (check-in → focus → scaling → exception-finding → small-step → close), follow-up prompts, and the manager-as-coach training notes that name the boundary between coaching and therapy. Refuses to generate advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <coachee-name> --coach <manager-name> [--issue "presenting issue paragraph"] [--session-type <first|recurring|reset>] [--genius genius/profile-<coach-slug>.md]
---

# /perf-coaching-protocol

Load `SIP.md`, `VOICES.md`, `agents/starlight-performance.md`, `skills/people-intelligence/feedback-conversations.md`, and the coach's Genius Profile if available. Produce a **Coaching Session Protocol** — a 60-minute session structure the manager will use, plus follow-up prompts and the manager-as-coach training notes. Save to `hr-intelligence/performance/coaching-<coachee-slug>-<YYYY-MM-DD>.md`.

## Disclaimer (non-waivable)

**This is a performance coaching protocol grounded in Solution-Focused Brief Therapy (de Shazer, Berg) and CBT-aligned framing. It is NOT psychotherapy. If the coachee surfaces clinical-level distress — suicidality, untreated trauma, active eating disorder, substance use crisis, severe depression that is not lifting, panic attacks, or any symptom that suggests a clinical boundary — stop the coaching engagement and route to qualified clinical support. Coaching that crosses into psychotherapy harms the coachee and exposes the organization. The manager-as-coach is a coach, not a therapist.**

## Input
$ARGUMENTS

## When this command fires

- A manager has a recurring 1:1 with a report and the conversation has been performative — the report walks in, the manager asks "how's it going", the report says "fine", thirty minutes evaporate
- A manager has identified a stuck point in the report's work and wants to help the report think through it without giving the answer
- A new manager has been told "you should coach your team" and has no protocol for what that actually means
- The report has asked for coaching — proactively raising a development goal or a stuck point

## When this command does NOT fire

- The session is a feedback session (specific behavior needs to be named) → route to `/perf-feedback-rehearsal`
- The session is a difficult conversation (termination, demotion, hard feedback) → route to `/perf-difficult-conversation`
- The coachee is in clinical-level distress → refuse and route to clinical support
- The manager wants the script to "tell them what to do" → refuse; coaching uses questions, not advice. If advice is the goal, the conversation is mentoring or directing, not coaching, and a different protocol applies

## Process

1. **Resolve inputs.**
   - `<coachee-slug>` from `<coachee-name>` (kebab-case).
   - `<coach-slug>` from `<manager-name>` (kebab-case).
   - Parse `--issue`, `--session-type`, `--genius`.
   - If `--session-type` is missing, default to `first` (assumes new engagement; recurring sessions adapt the structure but the first session sets the foundation).
   - If `--issue` is missing, ask once: "What is the coachee bringing? A goal? A stuck point? A development area?" Coaching without a presenting focus is therapy in disguise — name the focus or halt.

2. **Read.**
   - If the coach's Genius Profile exists, load voice samples — the coaching language has to be the coach's own, not generic.
   - If a previous session exists at `hr-intelligence/performance/coaching-<coachee-slug>-*.md`, read the most recent for continuity (the coachee's previous commitments, the scaling number from last time).

3. **Disclaim.** Open the output with the non-waivable clinical-boundary disclaimer.

4. **Conversation-type confirmation.**
   - Confirm this is coaching, not feedback, not difficult conversation, not mediation. If the input describes a specific behavior the manager wants to name, halt and route to `/perf-feedback-rehearsal`. The most common error is calling a feedback conversation "coaching" because it sounds nicer.

5. **SCARF map for coaching.**
   - Even coaching activates SCARF dimensions, especially when the coachee is bringing a stuck point.
   - **Status:** the coachee admitting they are stuck activates Status threat. Counter with a coach's stance: stuckness is information, not deficit.
   - **Certainty:** coaching often surfaces uncertainty. Stay with it instead of rushing to closure.
   - **Autonomy:** coaching DESIGN PRINCIPLE — questions increase autonomy, advice decreases it. Coaching that gives advice converts the coach's session into a manager's session, threats spike, and the coachee disengages.
   - **Relatedness:** the manager-coachee relationship is multidimensional. Acknowledge that. The manager will go back to being the manager after the session.
   - **Fairness:** if the coaching session is being used as documentation for a future PIP, the coachee senses it. The session is poisoned. Coaching for genuine development only.

6. **Design the 60-minute session structure.**

   ```
   0:00 — 0:05  Check-in
                Open question: "What's been on your mind since we last talked?"
                Or for first session: "What made you want to take this on?"
                Listen. Do not direct.

   0:05 — 0:15  Focus
                Locate the specific focus for THIS session.
                "Of everything on your mind, what would be most useful
                to spend the next 45 minutes on?"
                If the coachee names too many things, narrow:
                "If we could only address one of those today, which one
                would matter most?"

   0:15 — 0:25  Scaling
                "On a 1-10 scale, where are you on this right now?"
                Listen to the number AND the story behind it.
                Then: "What makes it a <N> and not a 1?"
                (The 'not a 1' question surfaces existing resources.
                Most coachees skip past their own resources because
                they're problem-focused.)

   0:25 — 0:40  Exception-finding
                "When has this been less of a problem? Even a little?"
                "What was different about that time?"
                "What did you do — even small — that helped?"
                Solution-focused work happens here.
                The coachee already knows; the coach surfaces it.

   0:40 — 0:50  Small-step planning
                "What would 1 point higher look like?"
                "What's the smallest thing you could try this week?"
                The smallest viable step. Not the right step.
                Smallest. Big steps don't get taken.

   0:50 — 0:60  Close
                "What did you take from this conversation?"
                (The coachee names it. Not the coach.)
                "When should we check in again?"
                "Anything you want to record for next time?"
   ```

7. **CBT overlay (when applicable).**
   - If the coachee surfaces a thought driving the stuckness ("I'm not the kind of person who…"), use CBT-aligned framing:
     - "What's the thought running underneath this?"
     - "What's the evidence for that thought? Against it?"
     - "If a colleague had that thought, what would you tell them?"
   - Cognitive reframing is coachable. Clinical-level cognitive distortion is not — route to clinical.

8. **Refuse to generate advice.**
   - The output does NOT contain "tell them to X" or "you should suggest Y."
   - The output contains questions the coach asks. Ever the coachee names the answer.
   - If the manager-as-coach is tempted to give advice, the protocol says: "Ask one more question. The answer is in the room; you're not in possession of it."

9. **Manager-as-coach training notes.**
   - Name the boundary between coaching and therapy. Explicitly.
   - Name the coaching stance: questions over answers; client-as-resourceful; small steps over big plans; solution-talk over problem-talk.
   - Name the common manager-coach failure modes: giving advice, becoming the therapist, using the session as documentation, using the session as feedback delivery.
   - Recommend formal coach training for managers who will coach as a primary mode (ICF-credentialed, EMCC, or equivalent).

10. **Follow-up prompts.**
    - 24-hour: "How are you doing with what we talked about?"
    - 1-week: "Did you take the small step? What did you learn?"
    - 1-month: "Where are you on the scale now? What moved it?"

11. **Save.** Create `hr-intelligence/performance/` directory if missing. Write `hr-intelligence/performance/coaching-<coachee-slug>-<YYYY-MM-DD>.md`.

12. **Hand off.** Name exactly one next move:
    - Default: **Run the session in the next 7 days.** Coaching sessions go stale; the rehearsed protocol works best within a week.
    - If the coachee surfaces clinical distress in the session: **Route to clinical support.** Stop coaching. Document the referral, not the content.
    - If the session reveals a feedback issue rather than a coaching issue: **`/perf-feedback-rehearsal`** for the actual conversation.
    - If recurring: **Schedule the next session in 2-4 weeks.** Coaching cadence depends on the goal; bi-weekly is the common default.

## Output format

```markdown
# Coaching Session Protocol — <Coachee Name> with <Coach Name> — <YYYY-MM-DD>

> **This is performance coaching, not psychotherapy. If the coachee surfaces clinical-level distress, stop and route to qualified clinical support. The manager-as-coach is a coach, not a therapist.**

## Context
- **Coachee:** <name>
- **Coach (manager):** <name>
- **Session type:** <first | recurring | reset>
- **Presenting focus:** <issue paragraph>
- **Coach voice samples loaded:** <yes — path | no — protocol uses generic stems>
- **Previous session reference:** <path | no previous session>

## Conversation-type confirmation

This is coaching. It is NOT:
- Feedback (a specific behavior needs to be named) — route to `/perf-feedback-rehearsal`
- Difficult conversation (termination, demotion) — route to `/perf-difficult-conversation`
- Mentoring (manager has the answer to share) — different protocol

If during the session it becomes clear the conversation is one of the above, the coach pauses, names the shift, and reschedules the actual conversation type for a separate session. Coaching is poisoned by smuggled-in feedback.

## SCARF map for this session

- **Status:** <coachee status threats and how the coach reduces them>
- **Certainty:** <where uncertainty lives in this conversation>
- **Autonomy:** <coach uses questions, not advice — autonomy stays high>
- **Relatedness:** <the multi-dimensional manager-coachee relationship>
- **Fairness:** <session is for development; not used as documentation>

## 60-minute session structure

### 0:00 — 0:05 Check-in (≤5 min)
**Open question (use one):**
- "What's been on your mind since we last talked?"  *(recurring)*
- "What made you want to take this on?"  *(first)*
- "How are you walking in today?"  *(reset)*

**Coach stance:** Listen. Do not direct. Resist the urge to fill silence.

### 0:05 — 0:15 Focus (≤10 min)
**Question:**
- "Of everything on your mind, what would be most useful to spend the next 45 minutes on?"

**If the coachee names multiple things:**
- "If we could only address one of those today, which one would matter most?"

**Coach stance:** narrow gently; do not force.

### 0:15 — 0:25 Scaling (≤10 min)
**Questions in sequence:**
- "On a 1-10 scale, where are you on this right now?"
- "What makes it a <N> and not a 1?"
- "What did you do to get to <N> from where you started?"

**Coach stance:** the 'not a 1' question is the load-bearing move. It surfaces resources the coachee already has and is overlooking. Stay there.

### 0:25 — 0:40 Exception-finding (≤15 min)
**Questions in sequence:**
- "When has this been less of a problem? Even a little?"
- "What was different about that time?"
- "What did you do — even small — that helped?"
- "What does that tell you about what's available to you?"

**Coach stance:** the answer is in the room. The coachee already knows; the coach surfaces it. Solution-focused work happens here.

### 0:40 — 0:50 Small-step planning (≤10 min)
**Questions in sequence:**
- "What would 1 point higher on the scale look like?"
- "What's the smallest thing you could try this week?"
- "What might get in the way? What would help you do it anyway?"

**Coach stance:** the smallest viable step, not the right step. Big steps don't get taken.

### 0:50 — 0:60 Close (≤10 min)
**Questions in sequence:**
- "What did you take from this conversation?"
- "When should we check in again?"
- "Anything you want to record for next time?"

**Coach stance:** the coachee names the takeaway. Not the coach. If the coach names it, the coachee remembers the coach's words; if the coachee names it, the coachee owns it.

## CBT overlay (when applicable)

If the coachee surfaces a thought driving stuckness ("I'm not the kind of person who…"):
- "What's the thought running underneath this?"
- "What's the evidence for that thought? Against it?"
- "If a colleague had that thought, what would you tell them?"

Cognitive reframing is coachable. Clinical-level distortion is not — route to clinical.

## Manager-as-coach training notes

**Coaching stance (these are non-negotiable):**
1. Questions over answers.
2. Client-as-resourceful (the coachee already has what they need).
3. Small steps over big plans.
4. Solution-talk over problem-talk.
5. Silence is a coaching tool, not a failure.

**Common manager-coach failure modes (avoid):**
- Giving advice — converts coach to mentor, autonomy drops, coachee disengages
- Becoming the therapist — clinical content needs clinical support, not your office
- Using the session as documentation — poisons the coaching relationship
- Smuggling in feedback — the coachee senses it; the session is over

**The coaching-therapy boundary:**
Performance coaching addresses workplace goals, behaviors, and stuck points. It does NOT address: trauma, active mental health crises, eating disorders, substance use, severe depression, suicidality. If those surface, stop coaching, name the boundary kindly, and route to clinical referral. Continuing past the boundary harms the coachee.

**Recommend:** managers who coach as a primary mode complete formal coach training (ICF-credentialed, EMCC, or equivalent). This protocol is a starter, not a substitute for craft.

## Follow-up prompts

- **24 hours after session:** "How are you doing with what we talked about?"
- **1 week after session:** "Did you take the small step? What did you learn?"
- **1 month after session:** "Where are you on the scale now? What moved it?"

## Load-bearing next move

**Run the session in the next 7 days.** Coaching protocols go stale; the rehearsed structure works best within a week.

If the session surfaces clinical content: **Route to clinical support.** Stop coaching.

If the session reveals a feedback issue: **`/perf-feedback-rehearsal`** for the actual conversation.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Coaching-therapy boundary is non-waivable.
- **Refuse to generate advice.** Output contains questions, not answers. If the user wants advice, the conversation is mentoring or directing, not coaching.
- **SCARF map every session.** Even coaching activates threat dimensions.
- **60-minute structure is the default.** Adjust for session-type but the six phases (check-in / focus / scaling / exception / small-step / close) are non-negotiable.
- **CBT overlay only when applicable.** Cognitive reframing is coachable; clinical distortion is not.
- **Refuse to coach clinical distress.** Route to clinical support. No exceptions.
- **Refuse to use coaching as documentation.** A coaching session that is secretly building a PIP record is theater. Refuse and recommend honesty.
- **Save to `hr-intelligence/performance/coaching-<coachee-slug>-<date>.md`.** Organization-instance namespace; never to a public vault.
- **One hand-off at close.** Default is "run the session in 7 days."

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

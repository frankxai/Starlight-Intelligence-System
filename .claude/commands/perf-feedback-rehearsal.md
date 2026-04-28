---
name: perf-feedback-rehearsal
description: Rehearse a high-stakes feedback conversation before delivery. Takes an SBI sketch + recipient context, produces multiple openings, anticipated reactions with responses, SCARF-aware adjustments, and three branching paths the conversation could take with the manager's response to each. Saves to people-intelligence/performance/rehearsal-<topic>-<date>.md.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <topic-slug> --manager <manager-name> --recipient <recipient-name> --sbi "Situation: ... Behavior: ... Impact: ..." [--history "context paragraph on the relationship and prior feedback"] [--genius genius/profile-<manager-slug>.md]
---

# /perf-feedback-rehearsal

Load `SIP.md`, `VOICES.md`, `agents/starlight-performance.md`, `skills/people-intelligence/feedback-conversations.md`, and the manager's Genius Profile if available. Produce a **Feedback Rehearsal** — multiple openings, SCARF-aware adjustments, three reaction trees with the manager's response to each, and aftercare. Save to `people-intelligence/performance/rehearsal-<topic-slug>-<YYYY-MM-DD>.md`.

## Disclaimer (non-waivable)

**This is rehearsal architecture for a high-stakes feedback conversation. It is NOT legal counsel — if this feedback is part of a documentation chain leading to termination, demotion, or formal discipline, route to `/perf-difficult-conversation` and have the documentation reviewed by employment counsel before delivery. It is NOT psychotherapy — if the recipient is in clinical-level distress, route to clinical support, not feedback. The rehearsal goes stale after 7 days; deliver soon or rehearse again.**

## Input
$ARGUMENTS

## When this command fires

- A manager has feedback to deliver and the conversation is non-trivial
- The feedback addresses a recurring pattern, not a one-off
- The recipient is likely to react strongly (history of defensiveness, status threat, tenure imbalance)
- The manager has not delivered feedback like this before and wants a rehearsed structure

## When this command does NOT fire

- The feedback is trivial ("hey, the deck title was misspelled") — no rehearsal needed; just SBI in the moment
- The conversation is termination, demotion, or formal discipline → route to `/perf-difficult-conversation`
- The conversation is conflict between two parties → route to `/perf-conflict-mediation`
- The recipient is in clinical-level distress → refuse rehearsal and route to clinical
- The "feedback" is really a PIP scaffolding for termination → refuse and route to honest termination conversation

## Process

1. **Resolve inputs.**
   - `<topic-slug>` from the topic argument (kebab-case).
   - `<manager-slug>`, `<recipient-slug>` from names.
   - Parse `--sbi` (required), `--history`, `--genius`.
   - If `--sbi` is missing or doesn't contain Situation, Behavior, Impact: halt and ask for it. Feedback rehearsal without SBI is rehearsing personality attack, which we refuse.

2. **Read.**
   - If manager's Genius Profile exists, load voice samples — rehearsed scripts in the manager's actual voice succeed; generic scripts fail.
   - If a previous rehearsal for this manager-recipient pair exists, read it for continuity (was the prior feedback delivered? what was the reaction? what's the pattern?).

3. **Disclaim.** Open the output with the non-waivable disclaimer.

4. **Conversation-type confirmation.**
   - Confirm this is feedback, not difficult conversation, not coaching, not termination scaffolding.
   - Test: if delivering the SBI line will end the relationship or end the employment, this is NOT a feedback conversation. Halt and route to `/perf-difficult-conversation`.

5. **SBI quality check.**
   - **Situation:** specific time and place. "In yesterday's design review at 3 PM" passes. "Recently in meetings" fails.
   - **Behavior:** observable, not interpreted. "You interrupted Maria three times" passes. "You were dismissive" fails (dismissive is interpretation, not observation).
   - **Impact:** named consequence for the work, the team, or the recipient. "We made the design decision without her input" passes. "It made people uncomfortable" fails (vague).
   - If any element fails, rewrite before continuing. Do not rehearse a flawed SBI.

6. **SCARF map for the recipient.**
   - **Status:** what is at stake for the recipient's standing? Even small feedback can activate Status. Name where.
   - **Certainty:** what predictions about their future is this conversation disrupting?
   - **Autonomy:** does this feedback feel like a mandate or a choice point? Adjust language to preserve choice where possible ("I want to share what I noticed and hear your thinking" preserves autonomy; "you need to stop X" eliminates it).
   - **Relatedness:** is the safety of this relationship at risk? If yes, name it explicitly: "I'm bringing this because I care about working with you well, not despite that."
   - **Fairness:** is the recipient likely to perceive this as a moving target or unequal standard? If similar behavior has been tolerated from others, the recipient will sense it. Address it.

7. **Generate three openings.**
   - Different openings serve different relationships and recipient profiles. The manager picks one before the conversation.
   - **Opening A — direct (low-context relationships, time-pressured):** name the topic, then SBI.
   - **Opening B — invitation (long-tenured relationships, high-trust):** "Can we spend ten minutes on something I've been sitting with? I'd like to share what I noticed in <context> and hear your thinking."
   - **Opening C — collaborative (recipient is senior, peer-like, or has higher Status threat):** "I want to talk through something with you because I think we both have visibility on it from different angles."
   - Adjust language to manager's voice (from Genius Profile if available).

8. **Generate three reaction branches.**
   - **Branch 1 — Acceptance.** "You're right, I see it. What do you want me to do differently?"
     - Manager response: do NOT give the answer. Coach: "What's your read on what would be different next time?" Then small-step plan.
   - **Branch 2 — Defensiveness.** "That's not what happened. You're missing context. Maria does that too."
     - Manager response: do NOT argue the facts. Acknowledge feeling first ("I hear that this lands as unfair / inaccurate"). Stay with the SBI. "I want to understand your view of what happened. Can you walk me through it from your side?" The three-conversations move (each side has a different story).
   - **Branch 3 — Emotional flooding.** Tears, shutdown, "is this leading to me being fired?"
     - Manager response: name the emotion ("this is landing hard, and I want to slow down"). Do NOT push through. Pause the content; address the moment. "Take whatever time you need. We can pick this up after lunch / tomorrow / when it's right." Aftercare matters most here.

9. **Aftercare plan.**
   - **Within 24 hours:** send a brief follow-up note. Not a recap of the feedback; a check-in. "I appreciated the conversation today. I know it wasn't easy. Take care of yourself." Two sentences. No more.
   - **Within 7 days:** 15-minute follow-up conversation. "How are you doing with what we talked about? What support would help?" The follow-up is the difference between feedback that worked and feedback that broke the relationship.
   - **Within 30 days:** substantive re-engagement. Has the agreed change started? What did the recipient learn about themselves? What did the manager learn about how to deliver this feedback better next time?

10. **Documentation guidance.**
    - For ordinary feedback: notes for the manager's own use; not entered into HRIS.
    - If the feedback is part of a formal process (improvement plan, written warning, etc.): refuse to script as ordinary feedback rehearsal; route to `/perf-difficult-conversation` with legal review of the documentation.
    - If the feedback surfaces information that may be a protected concern (harassment, discrimination, retaliation, whistleblower content): pause and route to legal/HR before the conversation continues.

11. **Save.** Create `people-intelligence/performance/` directory if missing. Write `people-intelligence/performance/rehearsal-<topic-slug>-<YYYY-MM-DD>.md`.

12. **Hand off.** Name exactly one next move:
    - Default: **Deliver the feedback within 7 days.** The rehearsal goes stale beyond that window.
    - If the rehearsal surfaced this is actually a difficult conversation: **`/perf-difficult-conversation`**.
    - If the rehearsal surfaced clinical content: **Route to clinical support.**

## Output format

```markdown
# Feedback Rehearsal — <Topic> — <Manager> to <Recipient> — <YYYY-MM-DD>

> **This is rehearsal architecture, not legal counsel and not psychotherapy. If this feedback is part of a termination/demotion/discipline chain, route to `/perf-difficult-conversation` and legal review. Rehearsal goes stale after 7 days.**

## Context
- **Manager:** <name>
- **Recipient:** <name>
- **Topic:** <one line>
- **History:** <provided context paragraph or "no prior feedback on this topic">
- **Manager voice samples loaded:** <yes — path | no — script uses generic stems>

## Conversation-type confirmation

This is feedback. It is NOT termination, demotion, or discipline. If delivering the SBI ends the relationship or the employment, halt and route to `/perf-difficult-conversation`.

## SBI quality check

- **Situation:** <specific time and place — passes / fails — if fails, rewrite before delivering>
- **Behavior:** <observable, not interpreted — passes / fails>
- **Impact:** <named consequence — passes / fails>

If any element fails, the rehearsal halts. Rewrite SBI before delivering.

## SCARF map for the recipient

- **Status:** <what's at stake; how the manager reduces threat>
- **Certainty:** <what predictions are being disrupted; how to maintain predictability where possible>
- **Autonomy:** <preserve choice points; avoid mandate language where avoidable>
- **Relatedness:** <name the relationship investment if at risk>
- **Fairness:** <address moving-target perception if applicable>

## Three openings (manager picks one)

### Opening A — Direct
> "<Manager's voice — direct, names topic, then SBI>"

When to use: low-context relationships, time-pressured, recipient prefers directness.

### Opening B — Invitation
> "<Manager's voice — invites the conversation, signals collaborative intent>"

When to use: long-tenured high-trust relationships, recipient has shown defensiveness in past.

### Opening C — Collaborative
> "<Manager's voice — peer-like framing, high Status reduction>"

When to use: recipient is senior, peer-like, or has visible Status threat.

## SBI delivery (after the chosen opening)

> "**Situation:** <specific time and place>.
> **Behavior:** <observable behavior — what they specifically did>.
> **Impact:** <consequence for work, team, or recipient>."

Pause. Wait. Do not fill silence. The recipient's response is the data for the rest of the conversation.

## Three reaction branches

### Branch 1 — Acceptance
**Recipient says:** "You're right, I see it. What do you want me to do differently?"

**Manager response — do NOT give the answer:**
> "I appreciate that you're taking it in. What's your read on what would be different next time?"

Then move to small-step planning. Do NOT prescribe. Coach.

### Branch 2 — Defensiveness
**Recipient says:** "That's not what happened" / "You're missing context" / "Other people do that too."

**Manager response — do NOT argue facts:**
> "I hear that this lands as unfair / inaccurate / focused only on you. I want to understand your view of what happened. Can you walk me through it from your side?"

This is the three-conversations move. Each side has a story. Both stories are real to the person telling them. The conversation is not "what really happened"; it is "let me understand your story and you understand mine."

If after hearing their side the SBI still stands, name it: "I hear your context. From where I was sitting, this is what I observed and the impact it had. Can we look at what happens next time, even if we don't fully agree on what happened this time?"

### Branch 3 — Emotional flooding
**Recipient response:** Tears, shutdown, "Is this leading to me being fired?", anger spike.

**Manager response — pause the content; address the moment:**
> "This is landing hard, and I want to slow down. Take whatever time you need. We can pick this up <after lunch / tomorrow / when it's right for you>. I want to be sure you're okay."

Do NOT push through. Do NOT defend the feedback. Do NOT escalate. The conversation is paused, not abandoned. The follow-up matters most here.

If the flooding includes clinical-level distress (suicidality, panic attack, dissociation): stop the conversation, ensure the recipient is safe, and route to clinical support / EAP. The feedback can wait.

## Aftercare plan

### Within 24 hours
Send a brief check-in note. Two sentences. Not a recap.
> "I appreciated the conversation today. I know it wasn't easy — take care of yourself."

### Within 7 days
15-minute follow-up conversation.
> "How are you doing with what we talked about? What support would help?"

This is the difference between feedback that worked and feedback that broke the relationship.

### Within 30 days
Substantive re-engagement. Has the agreed change started? What did the recipient learn about themselves? What did the manager learn?

## Documentation guidance

- **Ordinary feedback:** notes for the manager's own use; NOT entered into HRIS.
- **Formal process feedback (improvement plan, written warning):** halt and route to `/perf-difficult-conversation` with legal review.
- **Protected-concern surfacing (harassment, discrimination, retaliation, whistleblower):** pause the conversation and route to legal/HR before continuing.

## Load-bearing next move

**Deliver the feedback within 7 days.** Rehearsal goes stale.

If the rehearsal surfaced this is actually a difficult conversation: **`/perf-difficult-conversation`**.

If the rehearsal surfaced clinical content: **Route to clinical support.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.**
- **SBI quality gate is non-negotiable.** If Situation isn't specific, Behavior isn't observable, or Impact isn't named — rewrite before rehearsing.
- **SCARF map every rehearsal.** All five dimensions.
- **Three openings + three reaction branches.** Standard structure. The manager picks the opening; the rehearsal prepares for all three reactions.
- **Aftercare 24h / 7d / 30d.** Non-optional.
- **Refuse PIP-as-firing scaffolding.** Refuse formal-process feedback under "rehearsal." Route to `/perf-difficult-conversation`.
- **Refuse to rehearse personality attacks.** "You are X" feedback is rejected at the SBI quality gate.
- **Save to `people-intelligence/performance/rehearsal-<topic-slug>-<date>.md`.** Organization-instance namespace.
- **One hand-off at close.** Default is "deliver within 7 days."

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

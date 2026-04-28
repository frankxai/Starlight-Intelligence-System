---
name: perf-difficult-conversation
description: Three-conversations framework rehearsal (Stone/Patton/Heen — Harvard Negotiation Project) for high-stakes conversations — termination, demotion, hard feedback, conflict surfacing. Produces three-conversations breakdown (what-happened / feelings / identity), conversation script with multiple opening choices, SCARF mitigation, aftercare plan, and documentation guidance. Heavy disclaimer for terminations — documentation reviewed by employment counsel before delivery.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <topic-slug> --manager <manager-name> --recipient <recipient-name> --type <termination|demotion|hard-feedback|conflict-surfacing> --situation "context paragraph" [--history "relationship and prior conversations"] [--genius genius/profile-<manager-slug>.md]
---

# /perf-difficult-conversation

Load `SIP.md`, `VOICES.md`, `agents/starlight-performance.md`, `skills/people-intelligence/feedback-conversations.md`, and the manager's Genius Profile if available. Produce a **Difficult Conversation Rehearsal** structured around the three-conversations framework. Save to `hr-intelligence/performance/difficult-<topic-slug>-<YYYY-MM-DD>.md`.

## Disclaimer (non-waivable, heavy)

**This is rehearsal architecture for a high-stakes conversation. It is NOT legal counsel. For terminations and demotions:**

1. **Documentation gets reviewed by employment counsel in your jurisdiction BEFORE delivery.** No exceptions. Generic language ("attitude problem", "not a culture fit") is legal exposure. Specific, behaviorally-grounded, dated documentation is defensible.
2. **Severance, final pay, benefits continuation, non-compete enforcement, and final paperwork are jurisdictional and contract-specific.** Employment counsel handles those — not this rehearsal.
3. **If there is any concern about retaliation, discrimination (protected class), whistleblower content, harassment claims, or pending legal action,** halt the rehearsal and route the entire matter to legal + HR before continuing.
4. **For mass layoffs or RIFs (reductions in force),** WARN Act and equivalent jurisdictional notification requirements apply — this rehearsal does NOT cover those mechanics; counsel does.
5. **If the recipient may be in clinical-level distress** (suicidality, severe mental health crisis, recent loss), the conversation may need clinical support context before, during, and after. Coordinate with EAP / HR / clinical resources.

**This is a tool for the manager who must walk into the conversation. It is one input. The lawyer, HR, and EAP are the other inputs. Use them.**

## Input
$ARGUMENTS

## When this command fires

- Termination conversation (involuntary, for performance or other cause)
- Demotion conversation
- Hard feedback that the recipient may experience as identity-attacking even with SBI grammar
- Conflict surfacing — naming a conflict that has been operating underneath but has not been spoken
- Any conversation where the manager believes the relationship may not survive

## When this command does NOT fire

- The conversation is ordinary feedback → route to `/perf-feedback-rehearsal`
- The conversation is between two parties with disputed history → route to `/perf-conflict-mediation`
- The recipient is a clinical-distress emergency → halt all "conversation" framing and route to clinical/911 as appropriate
- The matter involves harassment / discrimination / whistleblower / pending litigation → halt and route to legal + HR
- The user wants a PIP-as-firing scaffolding scripted as a "performance discussion" → refuse and offer the honest termination conversation rehearsal instead

## Process

1. **Resolve inputs.**
   - `<topic-slug>`, `<manager-slug>`, `<recipient-slug>` from arguments.
   - Parse `--type` (required), `--situation` (required), `--history`, `--genius`.
   - If `--type` is missing or doesn't match the four types, halt and ask once.
   - If `--type termination` and the rationale provided is "not a culture fit" or generic: halt and require specific behaviorally-grounded rationale before rehearsal proceeds. Vague terminations are legal exposure.

2. **Read.**
   - Manager's Genius Profile if available — voice samples for the script.
   - Any prior `/perf-feedback-rehearsal` or `/perf-coaching-protocol` documents for this manager-recipient pair — pattern matters.
   - If `--type termination` and there is no prior feedback or coaching record, this is a flag: was the recipient given a real chance? Note the flag in the output so the manager and HR see it before delivery.

3. **Disclaim.** Open the output with the heavy disclaimer. Non-waivable.

4. **Type sort confirmation.**
   - Confirm the conversation is one of the four types. If during rehearsal it becomes clear the type is wrong, halt and re-route.
   - The most common error: "termination" that should be "demotion" (the recipient has more capacity than the role allows but is salvageable in a different role); "hard feedback" that should be "termination" (the manager is hoping feedback fixes what coaching has not fixed). Type sort matters.

5. **Three-conversations breakdown.**
   - **What-happened conversation.**
     - **Manager's story:** what did the manager observe, infer, decide? Specific, dated, behaviorally-grounded.
     - **Recipient's likely story:** what does the recipient see from their seat? What context does the manager not have? What pressures, history, blind spots?
     - **The honest version:** both stories are real to the person telling them. The conversation is not "what really happened" (no one fully knows); it is "let me tell you my story, hear yours, and we'll both leave knowing more than we walked in with."
   - **Feelings conversation.**
     - **What is the manager feeling?** Almost always: dread, guilt, anxiety, sometimes anger, sometimes relief. Name them. Unnamed feelings drive the conversation from underneath.
     - **What is the recipient likely feeling?** Almost always: fear, shame, anger, betrayal, grief. Anticipate them. Name them in the conversation when they appear.
     - **The hard part:** managers often skip this conversation because they were told "stay professional." Stone/Patton/Heen are unambiguous: skipping the feelings conversation ensures it runs the conversation from underneath.
   - **Identity conversation.**
     - **What is at stake for the manager's sense of self?** "Am I a fair leader? Am I being too harsh? Am I a good person?" Name it.
     - **What is at stake for the recipient's sense of self?** "Am I competent? Am I employable? Am I a failure? Will my family see me differently?" Name it. Identity threats produce the strongest reactions and the most disproportionate responses. Rehearsing the identity conversation reduces its grip.
     - **The reframe:** identity is not "are you a good or bad person" (binary). Identity is "what kind of professional, person, contributor are you?" (continuous). Help the recipient hold the more complex frame.

6. **SCARF mitigation across all five.**
   - **Status:** termination/demotion fundamentally threaten Status. Cannot eliminate; can preserve dignity. Do not announce in front of others. Do not deliver via Slack or email when in-person/video is possible. Allow the recipient to leave the room with their head held.
   - **Certainty:** the recipient's near-future just collapsed. Restore some certainty: severance terms, transition timeline, references, what happens to their benefits, what happens to their projects. Bring HR / counsel-prepared summary so the recipient leaves with a document, not just a memory of being fired.
   - **Autonomy:** even in termination, preserve autonomy where possible — choice on transition timing (when feasible), choice on how the team is told, choice on references framing. Mandates spike threat; choices reduce it.
   - **Relatedness:** the relationship is changing, not erasing. "I have valued working with you. This conversation is hard for me too. I want you to land well." Sincere, not theatrical.
   - **Fairness:** if the recipient perceives moving target or unequal standard, the conversation will be defined by that perception. If you have not delivered prior feedback / given prior chances, the recipient is right to perceive unfairness — flag this internally before delivery.

7. **Generate three opening choices.**
   - **Opening A — Direct (terminations where there has been clear prior conversation):**
     > "<Recipient name>, I have a hard message to share. We are ending your employment with <company>, effective <date>. I want to walk you through it and answer your questions."
   - **Opening B — Contextual (demotions and hard feedback):**
     > "<Recipient name>, I want to talk through something difficult with you. There's no easy way to start this, so I'll start: <central message>. I want to share what's behind that and hear your reaction."
   - **Opening C — Conflict-surfacing:**
     > "<Recipient name>, there's something operating between us that we haven't named, and I think we have to. I'd rather have an awkward conversation than continue around it. Can I share what I'm seeing from my seat?"

8. **Conversation script structure.**

   ```
   1. Opening (chosen above) — <2 minutes>
   2. The central message — <1-2 minutes, then PAUSE>
      Do NOT soften with excessive context before the message.
      Recipient deserves to hear the message clearly.
      The "compliment sandwich" failure: the recipient hears the
      compliment, hears the message, and the message is
      already drowning in defensiveness.
   3. Pause for reaction — <as long as it takes>
      Silence is not the manager's job to fill.
   4. Validation (the feelings conversation) — <ongoing>
      "I can see this is landing hard."
      "Take whatever time you need."
   5. The what-happened conversation — <10-20 minutes>
      Manager shares specific, dated, behaviorally-grounded story.
      Asks for recipient's view.
      Listens.
   6. Forward-looking content — <varies by type>
      Termination: severance terms, transition timeline, references,
        benefits, what happens to projects, what to tell people.
      Demotion: new role, new compensation if changed, transition
        timeline, what does success look like.
      Hard feedback: what does change look like, what support exists.
      Conflict surfacing: commitments to next steps, follow-up date.
   7. Identity reframe — <as needed>
      Manager helps recipient hold a more complex identity frame.
      "You are not your worst quarter."
   8. Close — <5 minutes>
      Summarize what was decided / committed.
      Confirm aftercare and follow-up.
      Allow the recipient to leave with their dignity.
   ```

9. **Aftercare plan.**
   - **Within 1 hour:** does the recipient have a safe way to get home? Coordinate with HR if the conversation is termination — escort logistics, badge return, equipment, but humanely. Do not make the person stand in a hallway.
   - **Within 24 hours:** confirmation document delivered (terms, timeline, references). Manager check-in note for non-termination types.
   - **Within 1 week:** for non-terminations, follow-up conversation. For terminations, the relationship is the manager's continued willingness to provide a reference (where genuine), respond to LinkedIn requests, treat the person as a former colleague rather than a former problem.
   - **Within 1 month:** non-terminations — substantive re-engagement with the agreed change.

10. **Documentation guidance.**
    - **Termination:** specific behaviors, specific dates, specific impact, specific support offered, specific outcomes. Reviewed by employment counsel BEFORE delivery. Generic language is legal exposure. Documentation lives in the formal HR record.
    - **Demotion:** similar; counsel review before; documented in HR record with new role and compensation if changed.
    - **Hard feedback:** specific, behaviorally-grounded; the manager's record. Whether it enters HR record depends on company practice and counsel guidance.
    - **Conflict surfacing:** the commitments live in both parties' notes; the emotional content does NOT enter HR record.
    - **All four types:** if the conversation surfaces a protected concern (harassment, discrimination, retaliation, whistleblower content), the manager halts and routes to legal/HR.

11. **Refuse theater.**
    - PIP-as-firing scripted as "performance discussion" → refuse. Offer the honest termination rehearsal instead.
    - Termination dressed as "mutual decision" when it is not → refuse. The recipient deserves the truth.
    - "Stay strictly professional, no feelings" → refuse. Skipping the feelings conversation means it runs the conversation from underneath.

12. **Save.** Create `hr-intelligence/performance/` directory if missing. Write `hr-intelligence/performance/difficult-<topic-slug>-<YYYY-MM-DD>.md`.

13. **Hand off.** Name exactly one next move:
    - **For terminations:** **Counsel review of the documentation BEFORE delivery.** Do not skip. Do not deliver until counsel has reviewed.
    - **For demotions:** **HR + counsel coordination.** Demotion mechanics are jurisdictional and contract-specific.
    - **For hard feedback:** **Deliver within 7 days.** Rehearsal goes stale.
    - **For conflict surfacing:** **Schedule the conversation within 7-14 days.** The conflict has already been operating; surfacing it is the work.

## Output format

```markdown
# Difficult Conversation Rehearsal — <Type> — <Topic> — <Manager> to <Recipient> — <YYYY-MM-DD>

> **HEAVY DISCLAIMER. For terminations and demotions: documentation reviewed by employment counsel BEFORE delivery — no exceptions. For any concern about retaliation, discrimination, harassment, whistleblower content, or pending litigation: halt and route to legal + HR. For clinical-distress emergencies: route to clinical/EAP. This is rehearsal; counsel and HR are the legal and procedural authorities.**

## Context
- **Type:** <termination | demotion | hard-feedback | conflict-surfacing>
- **Manager:** <name>
- **Recipient:** <name>
- **Situation summary:** <provided>
- **History:** <provided or "no prior feedback / coaching record on file" — flag if termination with no prior record>
- **Manager voice samples loaded:** <yes — path | no>

## Type sort confirmation

This is <type>. NOT ordinary feedback. NOT mediation. If during rehearsal the type proves wrong, halt and re-route to the matched protocol.

## Internal flags before delivery

<List any internal flags — termination with no prior record, missing counsel review, protected-concern surfacing, recipient clinical-distress concern, etc. These flags get addressed BEFORE the conversation, not during.>

## Three conversations

### What-happened conversation
- **Manager's story:** <specific, dated, behaviorally-grounded>
- **Recipient's likely story:** <what they see from their seat>
- **The honest version:** both stories are real; the manager's job is to share theirs and listen for the recipient's

### Feelings conversation
- **What the manager is feeling:** <name them — dread, guilt, anxiety, etc.>
- **What the recipient is likely feeling:** <name them — fear, shame, anger, betrayal, grief>
- **What gets named in the conversation:** <which feelings the manager will surface explicitly>

### Identity conversation
- **What's at stake for the manager:** <name>
- **What's at stake for the recipient:** <name — and the more complex frame the manager will help them hold>
- **The reframe:** "You are not your worst quarter / your hardest year / this single decision."

## SCARF mitigation across all five

| Dimension | Threat in this conversation | How the manager mitigates |
|-----------|----------------------------|---------------------------|
| Status | <name> | <preserve dignity; not in front of others; not by Slack/email> |
| Certainty | <name> | <severance terms, timeline, references — written summary> |
| Autonomy | <name> | <choice on transition timing, team announcement, references> |
| Relatedness | <name> | <"I valued working with you" — sincere, not theatrical> |
| Fairness | <name> | <if prior feedback was thin, flag; address moving-target perception> |

## Three openings (manager picks one)

### Opening A — Direct
> "<scripted in manager's voice>"

When to use: terminations with clear prior conversation, time-pressured.

### Opening B — Contextual
> "<scripted in manager's voice>"

When to use: demotions, hard feedback that may be experienced as identity-attacking.

### Opening C — Conflict-surfacing
> "<scripted in manager's voice>"

When to use: naming what has been operating underneath.

## Conversation script

### 1. Opening (chosen above) — ~2 minutes

### 2. Central message — 1-2 minutes, then PAUSE
> "<central message in manager's voice — direct, behaviorally-grounded, dated>"

Do NOT soften with excessive context. Recipient deserves to hear it clearly.

### 3. Pause for reaction — as long as needed
Silence is not the manager's job to fill.

### 4. Validation (the feelings conversation begins) — ongoing
- "I can see this is landing hard."
- "Take whatever time you need."

### 5. The what-happened conversation — 10-20 minutes
- Manager shares specific, dated, behaviorally-grounded story
- Asks for recipient's view: "Help me understand what you're seeing from your side."
- Listens

### 6. Forward-looking content — varies by type
<Type-specific content: severance / new role / change expectations / commitments>

### 7. Identity reframe — as needed
- "You are not your worst quarter."
- "This decision is about <specific>; it is not a verdict on who you are as a person."

### 8. Close — ~5 minutes
- Summarize what was decided
- Confirm aftercare and follow-up
- Allow recipient to leave with dignity

## Aftercare plan

| Window | Action |
|--------|--------|
| Within 1 hour | Safe way home; HR coordination if termination |
| Within 24 hours | Confirmation document delivered (terms, timeline, references) |
| Within 1 week | Non-terminations: follow-up conversation. Terminations: continued willingness to give genuine references |
| Within 1 month | Non-terminations: substantive re-engagement with agreed change |

## Documentation guidance

<Type-specific:>
- **Termination:** counsel review BEFORE delivery; specific, behaviorally-grounded; no generic language
- **Demotion:** counsel + HR; new role and compensation documented
- **Hard feedback:** manager's record; HR record per company practice + counsel
- **Conflict surfacing:** commitments documented; emotional content stays private

If the conversation surfaces protected concern (harassment / discrimination / retaliation / whistleblower): HALT and route to legal + HR.

## Theater refusals

<Name what was refused and why — PIP-as-firing scripted as performance discussion, termination dressed as mutual decision, "no feelings" stoic frame.>

## Load-bearing next move

<Type-specific:>
- **Termination:** **Counsel review of the documentation BEFORE delivery.**
- **Demotion:** **HR + counsel coordination on demotion mechanics.**
- **Hard feedback:** **Deliver within 7 days.**
- **Conflict surfacing:** **Schedule conversation within 7-14 days.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: <ISO date>
---
```

## Rules

- **Heavy disclaimer at top, always.** Non-waivable.
- **Counsel review before termination delivery is non-negotiable.**
- **Refuse PIP-as-firing scripted as performance discussion.** Offer honest termination rehearsal.
- **Refuse termination dressed as mutual decision.** Recipient deserves the truth.
- **Refuse "stay strictly professional, no feelings."** Skipping the feelings conversation means it runs the conversation from underneath. Stone/Patton/Heen non-negotiable.
- **Three conversations named — what-happened / feelings / identity.** All three. Skipping any one fails.
- **SCARF across all five.** Always.
- **Three opening choices.** Manager picks; rehearsal prepares.
- **Aftercare 1h / 24h / 1w / 1m layers.**
- **Halt and route on protected concerns.** Harassment, discrimination, retaliation, whistleblower → legal + HR before continuing.
- **Halt on clinical-distress emergencies.** Clinical/EAP.
- **Save to `hr-intelligence/performance/difficult-<topic-slug>-<date>.md`.** Organization-instance namespace.
- **One hand-off at close.** Type-specific.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

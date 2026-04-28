---
name: perf-conflict-mediation
description: Psychologist-grade conflict mediation between two parties. Produces 90-minute mediation session structure — separate prep with each party (each three-conversations narrative collected privately) + joint session structure with psychological safety design + commitments + follow-up. Names what to escalate to professional mediator (boundaries — when this exceeds in-house capability). Refuses to mediate harassment / discrimination / substantial-power-imbalance cases (those need legal + investigation, not mediation).
allowed-tools: Read, Write, Grep, Glob
argument-hint: <conflict-slug> --party-a <name> --party-b <name> --mediator <name> --description "what the conflict is about" [--history "relationship and prior attempts to resolve"]
---

# /perf-conflict-mediation

Load `SIP.md`, `VOICES.md`, `agents/starlight-performance.md`, `skills/people-intelligence/feedback-conversations.md`. Produce a **Conflict Mediation Plan** — separate prep sessions with each party (each producing a three-conversations narrative privately) + joint 90-minute session structure + commitments framework + follow-up plan + escalation criteria. Save to `hr-intelligence/performance/mediation-<conflict-slug>-<YYYY-MM-DD>.md`.

## Disclaimer (non-waivable)

**This is psychologist-grade mediation rehearsal architecture for ordinary workplace conflict between two parties of comparable positional power. It is NOT:**

1. **Legal counsel.** If the conflict involves potential legal claims, employment law applies — engage counsel.
2. **Professional mediation.** Some conflicts exceed in-house capability and require an external certified mediator (CEDR, IMI, FMCS, or jurisdiction-equivalent). Boundaries below.
3. **Investigation.** If the conflict involves allegations of harassment, discrimination, retaliation, or other misconduct, mediation is the WRONG tool. Investigation is the right tool. Halt and route to legal + HR.
4. **Therapy.** If the conflict is substantially driven by clinical-level distress in either party, route to clinical support before/instead.

**This rehearsal refuses to mediate:**
- **Harassment** (sexual, racial, religious, disability-based, or any protected-class harassment)
- **Discrimination** (any protected-class discrimination claim)
- **Retaliation** (any post-protected-activity retaliation claim)
- **Substantial-power-imbalance conflicts** (e.g., a director and an IC who reports up the same chain; a partner and a junior; any case where one party has authority over the other in the disputed dynamic)
- **Conflicts where one party is in clinical-level distress that the conflict is feeding**

**For these, halt and route to legal + HR + investigation. Mediating these is exposure for the company and harm for the parties.**

## Input
$ARGUMENTS

## When this command fires

- Two team members in active dispute that has affected work
- Two leaders in the same org whose conflict is bleeding into the team
- Co-founders or co-leads in a disagreement that has stopped being productive
- Any conflict between parties of roughly comparable positional power that has resisted self-resolution

## When this command does NOT fire

- The conflict involves harassment, discrimination, retaliation, or any protected-class claim → halt; route to legal + HR + investigation
- One party has substantially more positional power over the other in the disputed dynamic → halt; this is not mediation territory
- One party is in clinical-level distress that the conflict is feeding → halt; route to clinical
- The conflict has already escalated to legal action or formal grievance → halt; route to legal
- The "mediation" is being used as a way to avoid a termination conversation → halt; route to `/perf-difficult-conversation`

## Process

1. **Resolve inputs.**
   - `<conflict-slug>` from arguments.
   - Parse `--party-a`, `--party-b`, `--mediator`, `--description`, `--history`.
   - All required. If any missing, halt and ask once.

2. **Eligibility gate.**
   - Run the disclaimer's refusal list. If any apply, halt and route appropriately.
   - Confirm both parties have agreed to mediation (consent matters; coerced mediation fails). If consent is missing, halt and recommend the manager invite participation, not mandate it.
   - Confirm the mediator is impartial — not a direct manager of either party in this conflict, not a peer who has taken sides, not someone with a stake in one outcome.
   - If the mediator is in-house and has any concern about impartiality or capability, recommend escalating to professional external mediator.

3. **Disclaim.** Open the output with the heavy disclaimer.

4. **Design the separate prep sessions (per party).**
   - **Each party's prep — 60 minutes, separately, with the mediator.**
   - Purpose: collect each party's three-conversations narrative privately. The joint session goes nowhere if either party hasn't been heard separately first.
   - **Structure (per party, 60 min):**
     - 0:00-0:05 — Frame: "I'm meeting with both of you separately first. Today is for me to understand your view. The joint session is later. What you say here is private; nothing goes into HR record without your consent."
     - 0:05-0:25 — What-happened conversation: "Walk me through what's happening from your side. Specific situations, what you observed, what you took from it."
     - 0:25-0:45 — Feelings conversation: "What are you feeling about this? About the other person? About the work it's affecting?" Allow time. Most people have not been asked.
     - 0:45-0:55 — Identity conversation: "What's at stake for you here? What's the version of yourself you're trying to be in this — that the conflict is making harder?"
     - 0:55-1:00 — Close: "What would 'good' look like to you in the joint session? What would NOT good look like?"
   - **The mediator's job:** listen, reflect, do NOT promise outcomes, do NOT take sides, do NOT carry information from one party to the other without explicit consent.

5. **Read across the two preps for shared and divergent ground.**
   - **Shared ground (always exists):** both parties usually have the same complaint about the work environment around the conflict. Both want it to be over. Both want to be respected.
   - **Divergent ground:** each party's what-happened story; each party's interpretation of the other's intent (almost always wrong); each party's identity stake.
   - **The mediator names neither at this stage.** That naming happens in the joint session.

6. **Design the 90-minute joint session.**

   ```
   0:00 — 0:10  Set-up
                Mediator opens. Frames the session.
                "We're here for 90 minutes. My job is to make this
                conversation possible, not to decide who's right.
                I will not be sharing what either of you said in
                separate prep without your permission. Some ground
                rules: one person speaks at a time; no interrupting
                even when you disagree; if either of you needs a
                break, take one."
                Both parties agree to ground rules verbally.

   0:10 — 0:25  Each party shares what-happened (≤7 minutes each)
                Party A first, then Party B. Mediator times.
                The other party LISTENS — does not respond yet.
                Mediator may interrupt only to redirect from
                personality attack to specific behavior:
                "Can you put that in terms of a specific situation
                and what happened, not what you think Party B is?"

   0:25 — 0:40  Each party shares feelings (≤7 minutes each)
                Same structure. The feelings conversation.
                This is where most amateur mediations fail —
                they skip to "solutions" before feelings are named.
                Stay here. Resist solving.

   0:40 — 0:50  Each party shares identity stake (≤5 min each)
                What's at stake for each person's sense of self.
                This is the hardest section. Allow silence.

   0:50 — 1:05  Mediator surfaces shared ground
                "Here's what I'm hearing that you both share:
                <name 2-3 things — the work environment frustration,
                the desire for it to be over, the respect issue>."
                Both parties confirm or refine.

   1:05 — 1:20  Commitments — what each party will DO differently
                Mediator: "Given what you've both heard, what
                would each of you commit to doing differently?
                Specific behaviors, not generalities."
                Each party offers 1-3 specific commitments.
                The other party can request adjustments,
                not impose them.
                Mediator checks: are these commitments sufficient
                for both parties to feel the conversation moved?

   1:20 — 1:30  Close
                Mediator summarizes the commitments.
                Confirms follow-up date (typically 4-6 weeks).
                Offers an off-ramp: "If either of you wants to
                pause and reschedule the rest, that is okay."
                Allows both parties to leave with dignity.
   ```

7. **Psychological safety design.**
   - Physical/virtual setup: neutral space, not either party's office. Round table or equivalent if in person. If video, both parties on equal video footing — not one in a conference room and one on a laptop.
   - Time-of-day matters: not late afternoon when fatigue is high; not first thing Monday when stress is fresh. Mid-morning Tuesday/Wednesday/Thursday is empirical default.
   - No leadership audience. No HR observer unless both parties consent. The room is the two parties + the mediator. Period.
   - Phones off or to the side. The session is not interruptible.
   - The mediator names psychological safety explicitly at the open: "Both of you can call a pause at any moment. No one is required to keep going if it stops being productive."

8. **Commitments framework.**
   - Commitments must be:
     - **Specific behaviors, not feelings or attitudes** ("I will respond to your messages within one business day" beats "I will be more respectful")
     - **Mutual where appropriate** (not one party doing all the work)
     - **Time-bound** ("starting next Monday for the next 4 weeks, then we check in")
     - **Realistic** (Big commitments aren't kept; small ones are)
   - The mediator records commitments with both parties' agreement on the language.

9. **Follow-up plan.**
   - **24 hours:** mediator sends written summary of commitments to both parties — for confirmation, not for HR record (unless both parties consent to HR record).
   - **2 weeks:** brief check-in with each party separately. "Are the commitments holding? Anything we should adjust?"
   - **4-6 weeks:** joint follow-up — 30 minutes. Are the commitments working? Has the conflict reduced? What's next?
   - **3 months:** check-in for relapse prevention. Most repaired conflicts don't return; the ones that do return are the ones that didn't get a 3-month check.

10. **Escalation criteria.**
    - Halt mediation and escalate to professional external mediator if:
      - During separate prep, either party reveals content that suggests harassment, discrimination, retaliation, or protected-class claim — route to legal/HR/investigation
      - During separate prep, either party reveals clinical-level distress driven by the conflict — route to clinical
      - During joint session, the conversation escalates beyond the mediator's capability (de-escalation fails twice; threats; one party walks out)
      - Either party loses confidence in the mediator's impartiality
      - The conflict is structural (role design, decision rights, reporting structure) more than interpersonal — route to `/org-role-design` and the structural fix; mediation alone won't hold
    - **The mediator's hardest skill:** knowing when to pass the case. Misjudged in-house mediation makes things worse.

11. **Documentation.**
    - **Separate prep:** mediator's private notes; not shared with the other party; not in HR record without consent.
    - **Joint session commitments:** shared with both parties for confirmation. With both parties' consent, can enter HR record. Otherwise, stay with the mediator and the parties.
    - **Escalation:** documented internally — what was tried, why it was escalated, where it went. Important if the case later becomes legal.

12. **Save.** Create `hr-intelligence/performance/` directory if missing. Write `hr-intelligence/performance/mediation-<conflict-slug>-<YYYY-MM-DD>.md`.

13. **Hand off.** Name exactly one next move:
    - Default: **Schedule the separate prep sessions in the next 7-10 days, joint session in the 1-2 weeks following.** Mediation timing matters; too soon and parties haven't cooled; too late and the conflict has hardened.
    - If eligibility gate fails: **Route per the failed criterion** — legal + HR for protected concerns; clinical for distress; external mediator for capability gap; `/org-role-design` for structural conflict.

## Output format

```markdown
# Conflict Mediation Plan — <Conflict Slug> — <Party A> ⇄ <Party B> — <YYYY-MM-DD>

> **HEAVY DISCLAIMER. Refuses to mediate harassment, discrimination, retaliation, substantial-power-imbalance conflicts, and conflicts where clinical-level distress is feeding the conflict. For those: halt and route to legal + HR + investigation + clinical. This is mediation rehearsal architecture, not legal counsel and not therapy.**

## Context
- **Conflict:** <description paragraph>
- **Party A:** <name>
- **Party B:** <name>
- **Mediator:** <name>
- **History:** <provided or "no prior structured attempt to resolve">
- **Both parties consented to mediation:** <yes — required to proceed | no — halt and recommend invitation, not mandate>

## Eligibility gate

- Harassment/discrimination/retaliation surfaced: <no — proceed | yes — HALT and route>
- Substantial power imbalance in the disputed dynamic: <no — proceed | yes — HALT>
- Clinical-level distress feeding the conflict: <no — proceed | yes — HALT and route to clinical>
- Mediator confirmed impartial: <yes — proceed | no — escalate to external mediator>
- Both parties consented: <yes | no — halt>

## Separate prep sessions (per party, 60 minutes each)

### Party A — prep structure
- 0:00-0:05 Frame
- 0:05-0:25 What-happened (their story, behaviorally specific)
- 0:25-0:45 Feelings (named, not skipped)
- 0:45-0:55 Identity stake
- 0:55-1:00 Close — what would good and not-good look like in joint

### Party B — prep structure
<same>

### Mediator notes from each prep (private)
- Shared ground likely surfaced: <list>
- Divergent ground: <list — each party's what-happened, interpretation of intent, identity stake>
- Red flags from prep (any escalation criteria triggered): <list or "none">

## Joint session — 90 minutes

### 0:00 — 0:10 Set-up
Mediator frames; ground rules; both parties verbally agree.

### 0:10 — 0:25 Each party shares what-happened (≤7 min each)
Party A first, then Party B. Other party listens.

### 0:25 — 0:40 Each party shares feelings (≤7 min each)
Skip-this-step temptation is the #1 failure mode of amateur mediation. Stay here.

### 0:40 — 0:50 Each party shares identity stake (≤5 min each)
Hardest section. Allow silence.

### 0:50 — 1:05 Mediator surfaces shared ground
Names 2-3 shared items. Both parties confirm or refine.

### 1:05 — 1:20 Commitments
Each party offers 1-3 specific behavioral commitments.
Other party can request adjustments, not impose.
Mediator checks sufficiency.

### 1:20 — 1:30 Close
Summarize commitments. Confirm 4-6 week joint follow-up.
Offer off-ramp.

## Psychological safety design

- **Space:** neutral; not either party's office; equal video footing if remote
- **Time:** mid-morning Tue/Wed/Thu; avoid late afternoon and Monday-first-thing
- **Audience:** parties + mediator only; no leadership; no HR observer unless both consent
- **Interruptions:** phones off; not interruptible
- **Pauses:** named explicitly; either party can call a pause at any moment

## Commitments framework

| Criterion | Test |
|-----------|------|
| Specific behaviors, not attitudes | "I will respond within 1 business day" not "I will be more respectful" |
| Mutual where appropriate | Both parties contribute; not one carrying all the work |
| Time-bound | "Starting next Monday for the next 4 weeks" |
| Realistic | Small commitments kept beat big commitments forgotten |

## Follow-up plan

| Window | Action |
|--------|--------|
| 24 hours | Mediator sends written summary of commitments to both parties (for confirmation; HR record only with consent) |
| 2 weeks | Brief separate check-in with each party |
| 4-6 weeks | Joint follow-up — 30 min — are commitments working? |
| 3 months | Relapse prevention check-in |

## Escalation criteria — halt and route

- Protected-concern surfacing during prep → legal + HR + investigation
- Clinical-level distress → clinical support / EAP
- Joint session escalation beyond mediator capability → external professional mediator
- Either party loses confidence in mediator impartiality → external
- Conflict is structural, not interpersonal → `/org-role-design` for structural fix; mediation alone won't hold

## Documentation guidance

- **Separate prep:** mediator's private notes; not shared without consent
- **Joint commitments:** shared with both parties; HR record only with both consents
- **Escalation:** documented internally — what was tried and why escalated. Important if case becomes legal later.

## Load-bearing next move

**Schedule separate preps in the next 7-10 days; joint session in 1-2 weeks following.** Timing matters: too soon and parties haven't cooled; too late and conflict has hardened.

If eligibility gate fails: **Route per failed criterion** — legal/HR for protected concerns; clinical for distress; external mediator for capability gap; `/org-role-design` for structural conflict.

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
- **Eligibility gate before any rehearsal proceeds.** Refuse harassment / discrimination / retaliation / substantial-power-imbalance / clinical-distress cases. Route appropriately.
- **Both parties' consent required.** Mandated mediation fails.
- **Mediator impartiality required.** If in-house mediator has any concern, escalate.
- **Separate prep before joint session — non-negotiable.** Joint sessions without prep collapse.
- **Three-conversations grammar in prep AND joint session.** What-happened / feelings / identity. All three.
- **Don't skip feelings conversation.** #1 failure mode of amateur mediation.
- **Commitments are specific behavioral and time-bound.** Vague attitudes are not commitments.
- **Follow-up plan with 24h / 2w / 4-6w / 3mo layers is non-optional.**
- **Escalation criteria are real boundaries, not formalities.** The hardest skill is knowing when to pass the case.
- **Save to `hr-intelligence/performance/mediation-<conflict-slug>-<date>.md`.** Organization-instance namespace.
- **One hand-off at close.** Default is "schedule preps in 7-10 days."

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

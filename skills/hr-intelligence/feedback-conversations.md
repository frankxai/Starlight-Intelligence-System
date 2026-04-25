---
name: hr-intelligence/feedback-conversations
domain: hr-intelligence
description: Architect any high-stakes conversation between a manager and a report — feedback, coaching, performance review, difficult conversation, or conflict mediation. Sorts the conversation type first, applies the matched protocol (SBI / solution-focused / three-conversations / mediation), overlays SCARF threat-response analysis, and produces a rehearsed script. Refuses theater patterns (PIPs-as-firing, stack rank, annual-rating-as-growth). Not legal advice; rehearsal architecture for the manager.
triggers:
  keywords:
    - "feedback"
    - "performance review"
    - "perf review"
    - "1:1"
    - "check-in"
    - "coaching"
    - "manager-as-coach"
    - "difficult conversation"
    - "hard conversation"
    - "underperformer"
    - "low performer"
    - "high performer"
    - "raise"
    - "promotion"
    - "demotion"
    - "termination"
    - "fire"
    - "let go"
    - "conflict"
    - "mediation"
    - "PIP"
    - "performance improvement plan"
    - "stack rank"
    - "forced curve"
    - "calibration"
    - "360 review"
    - "peer feedback"
    - "feedback culture"
    - "SBI"
    - "SCARF"
  agents:
    - "starlight-performance"
    - "starlight-prime"
  intents:
    - "performance"
    - "feedback"
    - "coaching"
    - "difficult-conversation"
    - "conflict"
priority: high
load_level: core
---

# Feedback Conversations

> *"The amygdala doesn't get a quarterly review. It just decides whether you're safe enough to think clearly. Design every conversation for that — or you're not having a performance conversation, you're rehearsing a threat response."*

**Disclaimer (non-waivable):** This is rehearsal architecture for managers, not legal counsel and not psychotherapy. Conversations that may lead to termination, demotion, or formal discipline require legal review of the documentation before it ships. Conversations that surface clinical-level distress (suicidality, untreated trauma, active eating disorder, substance use crisis) require clinical referral, not coaching. Conflict cases involving harassment, discrimination, or substantial power imbalance require legal + investigation, not mediation.

## Purpose

Most managers have never been trained in the conversation skills the role demands. They were promoted for being good at the work and handed a clipboard. Then they were asked to deliver feedback that doesn't activate threat response, coach without giving advice, redesign a performance ritual that they themselves found demoralizing, mediate between two reports who have stopped speaking, and document terminations without exposing the company to litigation. None of these were in the job description. None of them were trained.

This skill is the protocol the manager uses *before* the conversation. It sorts the conversation type (because mismatched protocol is the most common failure), applies the research-backed structure for that type, overlays SCARF (Rock) threat analysis to predict where the amygdala will fire, rehearses the three ways the conversation could go and the manager's response to each, and writes the aftercare plan.

It refuses theater. PIPs that are termination scaffolding don't get scripts. Stack rank doesn't get composed; it gets dismantled with the alternative offered. Annual-rating-as-growth doesn't get a redesigned form; it gets a redesigned ritual.

## Activation

**Fires when:**
- A manager asks "how do I tell my report that…" — the question itself
- A founder or HR practitioner asks about performance reviews, feedback culture, coaching, difficult conversations, or conflict mediation
- Any `/perf-*` command is invoked
- Downstream of `/hire-decide` (Hiring) when the new hire's first 90-day check-in cadence is being designed
- Recurring conflict or stalled feedback patterns surface and the question becomes "how do we fix this"

**Does NOT fire when:**
- The conversation is psychotherapy in disguise — coaching has a hard boundary at clinical distress; route to clinical support
- The conflict involves harassment, discrimination, or substantial power imbalance — route to legal + investigation
- The PIP under discussion is termination scaffolding — refuse to script; redirect to honest termination conversation or real coaching
- The user wants stack rank or forced curve composed — refuse and offer the alternative

## Protocol — 8 steps

### Step 1 — Threat-response check (SCARF)

Before any protocol selection, map what's at stake for each party across the five SCARF dimensions (David Rock, NeuroLeadership Institute):

- **Status** — Is anyone's standing in the room, on the team, or in their own self-narrative being challenged? Almost every performance conversation activates Status. Name where.
- **Certainty** — What predictions about the future is the conversation disrupting? "I thought I was on track for promotion" + "you are not" = high Certainty threat.
- **Autonomy** — Is anyone's sense of choice, control, or agency being constrained? Mandates and ultimatums spike Autonomy threat. Coaching questions reduce it.
- **Relatedness** — Is the safety of the relationship between the parties at stake? Difficult conversations between people who have history are higher-stakes than between strangers.
- **Fairness** — Does either party perceive an unfair process, an unequal standard, or a moving target? Calibration conversations live here.

If three or more dimensions are activated for either party, the conversation is high-stakes and needs rehearsal, not improv. If five are activated, recommend a multi-session approach — one conversation cannot carry the load.

**Threat-response neuroscience grounding:** Lieberman and Eisenberger have shown that social pain (rejection, status loss, exclusion) activates the same neural circuits as physical pain (dorsal anterior cingulate cortex, anterior insula). The body does not distinguish "you are not getting promoted" from "you are being injured." This is not metaphor; it is neuroscience. Design accordingly.

### Step 2 — Conversation-type sort

Sort the conversation into exactly one type. Mismatching the type is the most common error.

| Type | Use when | Protocol |
|------|----------|----------|
| **Feedback** | A specific behavior needs to be named, with impact, in service of change | SBI (Step 3) |
| **Coaching** | The coachee has a goal or a stuck point and the manager's job is to help them think, not to tell them what to do | Solution-focused + CBT (Step 5) |
| **Performance review (growth)** | The quarterly conversation about what's working / what's stuck / what's next | Growth-conversation structure (Step 6, no rating) |
| **Difficult conversation** | Termination, demotion, hard feedback, conflict surfacing — high-stakes content where threat response is guaranteed | Three-conversations + SCARF (Step 4) |
| **Conflict mediation** | Two parties in active dispute that has affected work | Mediation structure (separate prep, joint session, commitments — see `/perf-conflict-mediation`) |

If the manager is unsure of the type, the most common mismatch is treating a difficult conversation as a feedback conversation. The test: if delivering the SBI line will end the relationship or end the employment, it is not a feedback conversation. It is a difficult conversation. Sort accordingly.

### Step 3 — SBI structure for feedback

Center for Creative Leadership's Situation-Behavior-Impact framework. Specific, behavioral, impact-focused, never personality-attacking.

- **Situation:** When and where did this happen? "In yesterday's design review at 3 PM"
- **Behavior:** What did the person specifically do or say? Observable, not interpreted. "You interrupted Maria three times before she finished her point"
- **Impact:** What was the consequence — for the work, the team, the recipient? "The team lost the thread of her argument and we made the design decision without her input"

Never "you are X." Never "you are dismissive" or "you are difficult to work with." Personality language activates identity threat (the third conversation in Stone/Patton/Heen — see Step 4) and makes the feedback un-receivable. Specific behavior is changeable. Personality is not.

After SBI, ask: what does the recipient want to do with this? Coaching frame, not lecture frame. SBI delivers the data; the recipient owns the response.

### Step 4 — Three-conversations check (for difficult conversations)

Stone, Patton, and Heen's three-conversations framework (Harvard Negotiation Project, *Difficult Conversations*). Every difficult conversation is actually three conversations layered on top of each other. Ignoring any one fails.

- **What happened:** Each side has a different story. Both stories are real to the person telling them. The conversation is not "what really happened" (no one knows fully); it is "let me understand your story and you understand mine, then we figure out where to go." The manager who insists on "the truth" is the manager whose conversation goes nowhere.
- **Feelings:** Both parties are feeling things. Naming feelings is not unprofessional; it is the load-bearing step. Unnamed feelings drive the conversation from underneath. Named feelings move out of the driver's seat.
- **Identity:** What's at stake for each person's sense of who they are? "Am I a competent professional?" "Am I a fair manager?" "Am I a good person?" Identity threats produce the strongest emotional reactions and the most disproportionate responses. Naming the identity dimension reduces its grip.

A rehearsed difficult conversation names all three. A failed difficult conversation names only the first.

### Step 5 — Solution-focused stance for coaching

Solution-Focused Brief Therapy (Steve de Shazer, Insoo Kim Berg) adapted for performance coaching. Combined with CBT-grounded thought-feeling-behavior framing when the coachee's blocker is cognitive distortion. Never advice-giving. Coaches use questions.

Core moves:
- **Exception-finding:** "When has this been less of a problem?" "When have you handled something similar well?" — locates the resourceful self, which always exists somewhere.
- **Scaling questions:** "On a 1-10 scale, where are you on this right now? What would 1 point higher look like?" — concretizes the vague.
- **Small-step planning:** "What's the smallest thing you could try this week?" — reduces activation energy.
- **Solution-talk over problem-talk:** Spend more time on the solution side than the problem side. Most managers do the opposite.

CBT overlay when the coachee's blocker is cognitive: "What's the thought running underneath this?" "What's the evidence for and against that thought?" "If a colleague had that thought, what would you tell them?" Cognitive reframing is coachable; clinical-level distortion is not — route to clinical support.

The hard boundary: when coaching surfaces clinical-level distress (suicidality, untreated trauma, active eating disorder, substance use crisis, severe depression that is not lifting), refuse to continue coaching and route to clinical referral. Coaching is not psychotherapy. Pretending otherwise is harmful.

### Step 6 — Cadence design (continuous over annual)

The performance review research is unambiguous. Annual ratings do not predict performance, demoralize high and low performers in equal measure, and concentrate threat-response activation into a single conversation that everyone dreads (Deloitte 2015, Adobe 2012, Microsoft 2013, GE post-2015 — all dismantled their forced-curve annual systems and reported retention and engagement gains).

The replacement is layered cadence:

- **Continuous SBI feedback** — weekly to bi-weekly between manager and report. Low-friction. The conversation is the artifact, not the form.
- **Quarterly growth conversation** — 60-90 minutes per quarter. Structured: what's working / what's stuck / what's next. **No rating.** Rating belongs in the compensation conversation, separated.
- **Annual compensation and promotion review** — separated from growth. The manager calibrates with peers. Rating exists here, but for compensation purposes, not coaching purposes. The manager and report do not have a "rating conversation" — the manager has a "here's your compensation decision and the calibration story behind it" conversation.

The separation between growth (continuous) and rating (annual, comp-linked) is the load-bearing redesign. When growth and rating happen in the same conversation, growth loses every time. The threat response of the rating drowns out the growth conversation.

### Step 7 — Aftercare

Every conversation output names: what does the recipient do with what they just heard? What support exists in the next 24 hours, week, and month?

- **Within 24 hours:** Decompression — does the recipient have a friend, partner, mentor, or therapist they can talk to? The manager can name this without prescribing it. "This was a lot. Take care of yourself tonight."
- **Within a week:** Follow-up conversation — the recipient should not be alone with this for a week. A 15-minute check-in by the manager, in person or by call, three to five days after, is the difference between "the conversation worked" and "the conversation broke the relationship."
- **Within a month:** Substantive re-engagement — has the agreed change started? What support did the recipient need that they have not received? What did the manager learn about how to deliver this conversation better next time?

Aftercare is not optional. Conversations without aftercare are interventions without follow-through.

### Step 8 — Documentation

What is recorded? What is private? What is the legal awareness?

- **Coaching conversations:** generally private to the manager-report relationship. Notes for the manager's own use, not shared in HR systems.
- **Quarterly growth conversations:** can be lightly summarized — the action items, the agreed focus areas. Not the emotional content. Not the SCARF analysis. Those stay private.
- **Difficult conversations heading toward termination, demotion, or formal discipline:** documentation matters legally. Specific behavior, specific dates, specific impact, specific support offered, specific outcomes. Generic language ("attitude problem", "not a culture fit") is legal exposure. Specific SBI documentation is defensible.
- **Termination conversations:** documentation gets reviewed by legal before it ships. Always. No exceptions.
- **Conflict mediation:** the joint session record (commitments, follow-up dates) can be shared with both parties. The separate prep notes stay with the mediator; they do not enter HR systems.

The legal awareness is not paranoia. It is the discipline that makes documentation defensible if the conversation later becomes a legal matter.

## Rules

1. **Sort the conversation type first.** Mismatched protocol is the most common error. If the SBI line will end the relationship or the employment, it is not a feedback conversation; it is a difficult conversation.

2. **Never "you are X" feedback.** SBI grammar always — Situation, Behavior, Impact. Personality-attacking language activates identity threat and makes feedback un-receivable. "You are not detail-oriented" fails. "In yesterday's spec review, three of the seven acceptance criteria were missing, which meant engineering rebuilt the wrong thing" succeeds.

3. **Refuse PIPs-as-firing.** A PIP where the outcome is pre-decided is termination scaffolding, not coaching. Refuse to write the script. Offer two alternatives: real coaching (if the intent is recovery — separate the support from the documentation) or honest termination conversation (if the intent is exit — own that and design the conversation accordingly). The dishonest version poisons the well for any future real coaching in the organization.

4. **Refuse stack rank and forced curves.** Research-backed harm to motivation, retention, team trust, and discretionary effort (multiple studies; the GE/Adobe/Microsoft dismantlings are the practitioner-readable references). When surfaced, recommend dismantling and offer the alternative architecture (calibration without forced distribution; quarterly growth conversation separate from comp; comp calibration based on observable contribution and market reference, not relative ranking).

5. **Refuse annual-rating-as-growth-tool.** Redesign the ritual. Continuous + quarterly growth conversation + separated annual comp/promotion review.

6. **Name SCARF threats explicitly.** All five dimensions, every difficult conversation. Threats you have not named will drive the conversation from underneath.

7. **Never coach-as-therapist.** Performance coaching has a hard boundary at psychotherapy. Clinical-level distress (suicidality, untreated trauma, active eating disorder, substance use crisis, severe depression that is not lifting) is a clinical referral, not a coaching topic.

8. **Refuse to mediate harassment, discrimination, or substantial-power-imbalance conflicts.** Those are legal + investigation cases. In-house mediation between, say, a director and an IC who feels harassed is not mediation; it is exposure.

9. **Legal disclaimer on terminations and demotions.** Documentation gets legal review before it ships. Always.

10. **Cite the research direction where claims are made.** SBI from Center for Creative Leadership. SCARF from David Rock / NeuroLeadership Institute. Three-conversations from Stone, Patton, Heen / Harvard Negotiation Project. Solution-focused from de Shazer and Berg. Motivational interviewing from Miller and Rollnick. Crucial Conversations from Patterson, Grenny, McMillan, Switzler. Threat-response neuroscience from Lieberman, Eisenberger. Annual-rating dismantling research from Deloitte, Adobe, Microsoft, GE practitioner case studies. Don't invent.

11. **Aftercare on every conversation.** 24-hour, 1-week, 1-month layers.

12. **Manager's voice, not template.** Read voice samples from Genius Profile when available. Generic scripts fail. Rehearsed scripts in the manager's actual voice succeed.

## Output Shape

This skill informs the five `/perf-*` commands. See:
- `.claude/commands/perf-review-redesign.md` — replace the broken annual ritual
- `.claude/commands/perf-coaching-protocol.md` — solution-focused + CBT coaching session
- `.claude/commands/perf-feedback-rehearsal.md` — rehearsed high-stakes feedback
- `.claude/commands/perf-difficult-conversation.md` — three-conversations rehearsal for terminations, demotions, hard feedback
- `.claude/commands/perf-conflict-mediation.md` — psychologist-grade mediation between two parties

All artifacts saved to `hr-intelligence/performance/` namespace in the organization's instance only — never in a public vault.

## Built on SIP

Composes with SIP protocol elements:
- Sovereignty clause (the person owns their conversation; Performance rehearses, does not transfer)
- File contract (`hr-intelligence/performance/` namespace)
- Attestation (every artifact ships with "Built on SIP" block)
- Voice archetypes — architect primary, sovereign-creator warmth, protocol-defender when refusing theater

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

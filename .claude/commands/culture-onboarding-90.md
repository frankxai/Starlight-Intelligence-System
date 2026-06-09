---
name: culture-onboarding-90
description: Design a 90-day onboarding architecture for a role. First day (psychological safety + belonging activation), first week (relationship + role context + early wins), first month (skill ramp + integration + baseline), first quarter (autonomous performance + cultural integration check). Written-first elements for remote/hybrid (Buffer, GitLab patterns). Manager script + new-hire prep doc + retention-metric tie. The 90-day window predicts retention better than the entire interview process.
allowed-tools: Read, Write, Grep, Glob
argument-hint: role name (required) + --size <S|M|L> + --pattern <onsite|hybrid|remote> + --org <org-slug> + optional context paragraph
---

# /culture-onboarding-90

Load `SIP.md`, `VOICES.md`, `agents/starlight-culture.md`, `skills/people-intelligence/culture-design.md`. Produce a **90-Day Onboarding Architecture**.

## Why this matters

The first 90 days predict retention better than the entire interview process (research consistent across Buffer, GitLab, Bridgewater, Microsoft, Google internal data). The mechanisms are neurological: first impressions establish baseline cortisol response (Eisenberger / Lieberman — high-cortisol day-one predicts year-one departure), early belonging activation correlates with 12-month engagement, and wins shipped in week 1 correlate strongly with 12-month retention. Most orgs treat onboarding as paperwork + a buddy lunch and wonder why their year-one attrition is high.

## Input
$ARGUMENTS

## Flags

- `--size <S|M|L>` — S = under 50, M = 50-250, L = 250+. Onboarding scaffolding shifts by size (S = mostly manager-driven; L = handbook + manager + buddy).
- `--pattern <onsite|hybrid|remote>` — physical pattern fundamentally changes onboarding architecture. Remote/hybrid requires written-first.
- `--org <org-slug>` — for save path.
- Optional context paragraph — role specifics, team context, recent attrition patterns in this role.

## Process

1. **Diagnose role context** — what does success look like at day 90 for this role? What does failure look like at day 30?
2. **First day architecture** — psychological safety + belonging activation. Manager script + welcome ritual + first-day artifact + environment readiness.
3. **First week architecture** — structured 1:1s + role context + early win shipped + feedback loop.
4. **First month architecture** — ramp plan + team integration + performance baseline.
5. **First quarter architecture** — autonomous performance + cultural integration check + first formal feedback loop + retention-risk signal review.
6. **Written-first elements** — handbook, role context doc, decision log, team faces. Required for remote/hybrid.
7. **Manager script** — exactly what the manager says day 1, day 7, day 30, day 90.
8. **New-hire prep doc** — what they need before day 1.
9. **Retention metric tie** — explicit linkage to 12-month retention probability + measurement protocol.
10. **Save** — write to `people-intelligence/culture/onboarding-90-<role>-<date>.md`.
11. **Hand off** — exactly one named next move.

## Output format

```markdown
# 90-Day Onboarding Architecture — <Role Name> — <Org> — <YYYY-MM-DD>

> *"The first 90 days predict retention better than the entire interview process. First impressions establish baseline cortisol response. Early belonging activation correlates with 12-month engagement. Wins in week 1 correlate with 12-month retention. Most orgs treat onboarding as paperwork + a buddy lunch and wonder why year-one attrition is high."*

## Context

- **Role:** <name>
- **Org:** <name>, <size>, <pattern>
- **Team context:** <team size, manager, key collaborators>
- **Success at day 90:** <observable, specific>
- **Failure at day 30:** <observable, specific — early-warning patterns>
- **Recent attrition pattern in this role:** <if applicable>

---

## Section 1 — Pre-Day-1: New-hire prep doc

What the new hire receives 3-5 business days before start.

### Welcome doc (sent by manager, signed personally)
- [ ] Personal welcome from manager (5-7 sentences, named, specific)
- [ ] First-day logistics (start time, location or video link, parking/access, dress norm, lunch plan)
- [ ] Team faces — names, photos, roles, one-line "ask me about" per person
- [ ] Day-1 schedule preview (so they're not arriving cold)
- [ ] Pre-reading list (3-5 items max — handbook excerpt, recent strategy doc, team principles)
- [ ] "What questions are welcome on day 1" framing — explicit psychological safety priming
- [ ] Buddy/peer assigned, with their email

### Environment readiness checklist (HR + IT — done before day 1)
- [ ] Laptop + accounts provisioned and tested
- [ ] Workspace ready (desk, chair, monitor — or remote setup shipped)
- [ ] Calendar invitations sent for week-1 schedule
- [ ] Slack/Teams channels added, intro post drafted
- [ ] Documentation access verified
- [ ] First-day welcome artifact placed (note on desk / digital welcome card)

---

## Section 2 — First day (psychological safety + belonging activation)

**Neuroscience anchor:** First-day cortisol response establishes baseline. High-cortisol day-one (chaos, no welcome, no environment readiness, manager absent) → year-one departure risk elevated. Low-cortisol day-one (warm welcome, ready environment, named belonging) → year-one engagement elevated.

### Manager script — Day 1, first 30 minutes (verbatim)

> *"Welcome. I'm so glad you're here. Today's not about productivity — today's about you getting oriented and feeling like you belong. Here's what we'll do: 1) I'll walk you through the team and how we work, 2) you'll have lunch with [buddy], 3) at 3pm we'll do a 30-min check-in. Your job today is to ask any question — including ones you think are obvious. Especially ones you think are obvious. Bad questions don't exist on day 1; missed questions cost us in week 4."*

### Day 1 schedule

| Time | Activity | Owner |
|------|----------|-------|
| 09:00 | Manager 1:1 — welcome + team walkthrough + week-1 plan | Manager |
| 10:00 | Environment + tools setup with IT (verify, don't troubleshoot) | IT |
| 11:00 | Team intro stand-up — round-robin "who I am, ask me about" | Team |
| 12:00 | Lunch with buddy — explicit non-work conversation | Buddy |
| 14:00 | Documentation orientation — handbook tour | Buddy or peer |
| 15:00 | Manager check-in — "how's day 1 feeling?" + adjust if needed | Manager |
| 16:00 | Light reading + quiet time (do not over-schedule) | New hire |

### First-day artifact (given by hand or by direct message)
A short personal welcome — handwritten note, recorded video from team, or named welcome message in Slack. Specifically not generic "welcome to the team!" → specifically named, specific to the role, specific to why this person was hired.

### Day-1 success indicators
- [ ] New hire can name 5+ team members by end of day
- [ ] New hire has asked at least one question
- [ ] Environment fully functional (no day-2 setup tickets)
- [ ] Manager has personally welcomed and laid out week-1 plan
- [ ] Buddy/peer relationship initiated

### Anti-patterns to avoid
- Manager absent on day 1 (signals: "you don't matter")
- Half-set-up environment (signals: "we weren't ready for you")
- Information dump (handbook + 50 docs + meetings) (activates Certainty + Autonomy threat)
- "Just shadow people" with no structure (activates Autonomy threat — looks like neglect)

---

## Section 3 — First week (relationship + context + early win)

### Week-1 architecture

| Day | Focus | Activity | Outcome |
|-----|-------|----------|---------|
| Day 1 | Welcome + belonging | (See Section 2) | Belonging activated |
| Day 2 | Role context | Role context doc walkthrough; key prior decisions; current bets | Context built |
| Day 3 | Key collaborator 1:1s | Structured 1:1s with 3-5 key collaborators; each 30 min | Network seeded |
| Day 4 | Early win scoping | Manager + new hire scope a small, shippable win for week-end | Early agency |
| Day 5 | First win shipped + week-end check-in | Win shipped; 30-min retro with manager | Confidence + early visibility |

### Role context doc (written-first, especially for remote/hybrid)

- **Why this role exists** — not the job description; the strategic reason
- **Recent history** — last 12 months of decisions in this domain
- **Current bets** — what the team is currently trying
- **Open questions** — what's unresolved (signals "your perspective matters")
- **Stakeholders + dynamics** — who matters, what they care about, named friction points
- **What good looks like at 30 / 60 / 90** — observable, specific

### Manager script — Day 7, 30-minute end-of-week 1:1

> *"Three questions for me, three for you. Mine: 1) What surprised you this week? 2) What feels confusing or unclear? 3) Who do you want to meet next week? Yours: ask me anything — including the awkward ones. The right time to ask is now, while you're new and curious. After week 4, you'll start sounding like the rest of us, and you'll lose that perspective."*

### Week-1 success indicators
- [ ] One small win shipped by end of week
- [ ] 5+ structured 1:1s with collaborators completed
- [ ] Role context doc digested (questions surfaced)
- [ ] Manager has heard at least one piece of "what's confusing" feedback
- [ ] New hire can describe team's current bets in their own words

---

## Section 4 — First month (ramp + integration + baseline)

### Weekly milestones

- **Week 2:** First independent task shipped; second round of collaborator 1:1s; team-meeting active participation begins
- **Week 3:** Skill ramp midpoint — manager + new hire identify ramp gaps and adjust; first peer-feedback solicited explicitly
- **Week 4:** Performance baseline conversation (calibration, not review) — "here's what I see going well, here's where I see ramp still happening, here's where I want you to push"

### Manager script — Day 30 baseline conversation (template)

> *"This is a calibration, not a review. Three things: 1) What I see going well — [specific, named]. 2) Where ramp is still happening — [specific, no judgment]. 3) Where I want you to push by day 60 — [specific, observable]. Now — what's your read? What do you need from me?"*

### Month-1 success indicators
- [ ] Multiple independent tasks shipped
- [ ] Active participation in team rituals (Friday wins, weekly standups)
- [ ] Performance baseline conversation completed (calibration, not review)
- [ ] First peer feedback received
- [ ] Cultural integration: new hire references team principles unprompted

### Month-1 retention-risk signals
- New hire still cannot describe team's current bets → role context gap
- New hire avoiding 1:1 friction topics → psychological safety gap
- Manager hasn't heard "this is confusing" yet → safety + clarity gap
- Buddy/peer relationship has not deepened → belonging gap

---

## Section 5 — First quarter (autonomy + cultural integration + first formal feedback loop)

### Quarterly milestones

- **Day 60** — autonomous on most role responsibilities; manager check-in shifts from coaching-heavy to coaching-light
- **Day 75** — cultural integration check ("does the new hire feel they understand 'how we do things'?"); first peer-360 light
- **Day 90** — full role autonomy; first formal feedback loop ("what's working / what's not / what to redesign for next hire in this role")

### Manager script — Day 90 conversation

> *"Three questions: 1) What did onboarding get right? 2) What did it miss — what would have helped you ramp faster or feel more belonging? 3) Where are you proud of yourself, and where do you want to push next? My job: take your feedback and redesign for the next hire. Your feedback will literally change how we do this — that's how we learn."*

### Quarter-1 success indicators
- [ ] Full role autonomy achieved
- [ ] New hire's day-90 feedback captured and committed to onboarding redesign for next hire
- [ ] Cultural integration confirmed (new hire references and lives team rituals)
- [ ] Retention-risk signal review: green / yellow / red

---

## Section 6 — Written-first elements (required for remote/hybrid)

Buffer, GitLab handbook patterns. Live conversations supplement; the written substrate is the scaffolding.

| Element | Purpose | Owner |
|---------|---------|-------|
| Welcome doc | First impression + day-1 logistics | Manager |
| Handbook excerpt | Org-wide context | HR / People Ops |
| Role context doc | Role-specific strategic context | Manager |
| Decision log | Recent role-domain decisions | Manager |
| Team principles | "How we work" | Team |
| Buddy intro doc | Relational context | Buddy |
| 30/60/90 milestones | Observable success criteria | Manager + new hire |
| Day-90 feedback template | Captures redesign input | Manager |

---

## Section 7 — Retention metric tie

Onboarding without retention measurement is theater. Tie this architecture to:

- **12-month retention rate for this role** — track cohort-by-cohort; benchmark vs prior cohorts
- **Day-90 self-reported belonging** — short survey at day 90; 1-5 scale
- **Day-90 manager-reported ramp** — manager assessment of role autonomy at day 90
- **Day-90 peer-reported integration** — peer assessment of cultural integration
- **Day-30 retention-risk signal flagged** — manager flags red/yellow signals at day 30 (early-warning)

Re-measure quarterly. Onboarding architecture changes when these numbers move.

---

## Section 8 — Failure modes

- **Onboarding-as-paperwork** — laptop, accounts, handbook, "ask if you have questions." → year-one attrition.
- **Buddy lunch + nothing else** — buddy is supplementary, not the architecture.
- **Manager absent on day 1** — signals "you don't matter." Single biggest predictor of poor first-day experience.
- **Information dump on day 1** — activates Certainty threat; learning collapses.
- **No early win in week 1** — agency not activated; "I'm not sure if I matter here yet" lingers.
- **No day-90 feedback loop** — onboarding doesn't improve; same mistakes for the next hire.
- **Onboarding owned by HR alone** — manager + HR + buddy is the architecture. HR-alone fails.

---

## Load-bearing next move

**Run this onboarding architecture for the next hire and capture day-90 feedback** — the architecture improves only when day-90 feedback is captured and incorporated. Default action.

Alternatives:
- `/culture-rituals <org>` — if onboarding revealed that the org's rituals aren't ready to receive new hires (rare; usually ritual layer is upstream)
- `/culture-design <org>` — if attrition pattern in this role suggests a cultural-system issue beyond onboarding (look at promote/celebrate/fire criteria)

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence — Culture, sub-system 4 of 6)
- Generated: <ISO date>
---
```

## Rules

- **First-day cortisol matters.** Manager presence + ready environment + warm welcome + named belonging = baseline-low cortisol. Each missing element raises year-one departure risk.
- **Early win in week 1 is non-negotiable.** Wins shipped in week 1 correlate with 12-month retention. Without one, agency is not activated.
- **Manager script verbatim, not "your own words."** The script exists because cognitive load on day 1 + day 7 + day 30 + day 90 is high; improvising fails. Rehearse the script.
- **Written-first for remote/hybrid.** No exceptions. Buffer/GitLab handbook pattern. Live conversation supplements; never replaces.
- **Day-90 feedback loop creates the redesign cycle.** Without it, onboarding doesn't improve.
- **Tie to retention metric explicitly.** Cohort-by-cohort tracking; quarterly review.
- **HR alone fails.** Onboarding is manager + HR + buddy. Single-owner failure mode is universal.
- **Save to `people-intelligence/culture/onboarding-90-<role>-<date>.md`.**
- **One hand-off at close.** Default: run the architecture and capture day-90 feedback for redesign cycle.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence — Culture, sub-system 4 of 6)
- Generated: 2026-04-24
---

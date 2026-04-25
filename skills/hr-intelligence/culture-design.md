---
name: hr-intelligence/culture-design
domain: hr-intelligence
description: Design culture as a system — audit what behavior is rewarded/punished/ignored, gap-map declared values vs lived behavior, redesign the six high-leverage systems (hire/promote/celebrate/fire/measure/pay), architect rituals across four cadences, measure psychological safety team-by-team, and produce a 90-day onboarding plan tied to retention. Refuses values-poster theater.
triggers:
  keywords: ["culture", "values", "rituals", "onboarding", "psychological safety", "belonging", "team dynamics", "engagement", "retention", "culture deck", "culture audit", "all-hands", "off-site", "first 90 days", "new hire", "team meeting"]
  agents: ["starlight-culture", "starlight-navigator"]
  intents: ["culture", "values", "rituals", "onboarding", "psychological-safety", "engagement"]
priority: high
load_level: core
---

# Culture Design

> *"Culture is what behavior gets rewarded, punished, and ignored. The values on your wall are aspirations. The culture you have is the one revealed by your promotion criteria, your meeting schedule, and what happens to the person who quietly disagrees in a Tuesday standup."*

## Purpose

Most "culture work" produces values printed on a wall, an off-site, and a Slack emoji set — and nothing in the systems changes. Six months later the same team is running the same anti-rituals (back-to-back meetings, zero-feedback performance reviews, promote-the-loudest, fire-the-rule-breaker-but-not-the-jerk-who-hits-targets) and the values posters mock everyone who walks past them. This skill exists to refuse that loop.

Culture Design treats culture as a system: artifact layer (what the org says it values), espoused values (what leadership claims), and underlying assumptions (what behavior actually gets rewarded — Schein's three-layer model). The work is to audit the lived culture honestly, surface the gap between declared and lived, and redesign the high-leverage systems (hire / promote / celebrate / fire / measure / pay) until the lived culture matches the declared one.

Research grounding (use, do not invent):

- **Schein** — culture is the underlying assumptions, revealed by what gets rewarded and punished, not by mission statements.
- **Edmondson — psychological safety** — the single biggest predictor of team performance per Project Aristotle (Google's internal research). Designed via meeting protocols, manager training, and review-system redesign — not declared via "we value openness" posters.
- **Eisenberger / Lieberman — belonging neuroscience** — social exclusion activates the same neural circuits as physical pain. Onboarding either welcomes or excludes; few companies get this right.
- **David Rock — SCARF** — Status, Certainty, Autonomy, Relatedness, Fairness — the five neural reward/threat dimensions. Every ritual, meeting, and review system either activates reward or threat in these dimensions.
- **Turner / Bell — anthropology of ritual** — rituals create belonging through shared, repeated experience. High-frequency rituals build the substrate; low-frequency rituals create meaning. Most companies have weak rituals (annual all-hands, awards) and strong anti-rituals (back-to-back meetings, async-everything).
- **90-day onboarding window** — first 90 days predict retention better than the entire interview process. Companies that nail it (Buffer, GitLab handbooks; Bridgewater principles) systematize via written-first culture and structured first weeks.

## Activation

**Fires when:**
- `/culture-design`, `/culture-values-ops`, `/culture-rituals`, or `/culture-onboarding-90` is invoked
- Any mention of *culture*, *values*, *rituals*, *onboarding*, *psychological safety*, *belonging*, *team dynamics*, *engagement*, *retention*, *culture deck*, *culture audit*
- Downstream of `/hiring-design` (interviews signal what's valued — culture audits the alignment) or `/performance-design` (review systems express culture — culture audits the alignment)
- Founder/CEO reports a culture pain point: high attrition, low engagement scores, "we lost the magic," "the team feels political," "no one disagrees in meetings anymore"

**Does NOT fire when:**
- The request is "help us pick three values to put on the wall" — refuse, route to systems-redesign work; posters do not change behavior
- The request is "design us a fun off-site" — refuse, route to ritual architecture (rituals are weekly/monthly, not annual; off-sites are spikes, not culture)
- The request is for individual coaching or motivation — route to Talent Intelligence; Culture handles systems, Talent handles individuals

## Protocol

### Step 1 — Audit current state (what gets rewarded / punished / ignored?)

Ask the diagnostic question, in this exact form: "What gets rewarded? What gets punished? What gets ignored? Tell me about the last person who got promoted, and why. Tell me about the last person who left, and why. Tell me about the last meeting where someone disagreed with leadership — what happened?"

Map the answers across Schein's three layers:

- **Artifacts** — values posters, mission statement, culture deck, Slack emojis, office decor, dress code
- **Espoused values** — what leadership claims the culture is, in writing or in interviews
- **Underlying assumptions** — what behavior actually gets rewarded, punished, or ignored, observed via promotion decisions, exit interviews, calendar audits, performance review patterns

The lived culture is the underlying-assumptions layer. The audit's job is to make this layer observable and explicit. Use evidence — never accept the artifact layer as the answer.

Output: **Current-state culture map** — 3-5 declared values with their lived-behavior counterpart and observable evidence.

### Step 2 — Gap analysis (declared vs lived)

For each declared value, name the gap with evidence:

> *"Your declared value is **collaboration**. Your last 4 promotions were given to individual high performers who out-shipped their peers and were known for refusing to share credit. The lived value is **individual heroics**. The gap is collaboration-as-aspiration vs heroics-as-reward."*

Specificity beats abstraction. The gap is where the pain lives — high attrition, low engagement, political behavior, silent disagreement — and the gap is named in observable behavior, not in feelings.

### Step 3 — Systems redesign (six high-leverage systems)

For each declared value the org wants to make real, surface which of the six high-leverage systems must change so the value becomes observable:

1. **Hire** — what interview signal screens for this value? if none exists, the value is invisible at the front door
2. **Promote** — does promotion actually require demonstrating this value? promotion is the loudest cultural signal an org sends
3. **Celebrate** — do we publicly recognize people who exemplify this value? what are the recognition triggers and rituals?
4. **Fire** — do we terminate for clear violation, even of high performers? if "high performers" can violate the value with no consequence, the value is dead
5. **Measure** — what observable, ongoing data tracks this value (engagement, behavioral metric, peer review)?
6. **Pay** — does compensation structure reward this value (team-based bonus, peer-recognition pool, value-aligned variable comp)?

Sequence the redesign by leverage. Promotion criteria typically rank highest because promotions are the loudest signal. Celebrate-criteria rank second because they are high-frequency and visible. Hire-criteria rank third because they shape the future faster than they shape the present. Fire-criteria are lowest-frequency but highest-clarity (firing a high performer for value violation is the single strongest cultural signal an org can send).

### Step 4 — Ritual map (four cadences + annual milestones + anti-ritual audit)

Design rituals across four cadences:

- **Daily** — short rhythm rituals (standup, end-of-day post, morning gratitude — small, repeated, low-cost)
- **Weekly** — team rhythm rituals (weekly retro, Friday wins, peer-feedback ritual, manager 1:1 — the substrate of belonging)
- **Monthly** — milestone-marker rituals (monthly metric review, peer-recognition ceremony, learning showcase)
- **Quarterly** — meaning-making rituals (quarterly retrospective, OKR celebration, strategy share, founder story)

Plus **annual milestones** — anniversary, founding-day, year-in-review, awards (these are spikes, not the architecture).

Each ritual specifies:

- **Purpose** — what it builds (belonging / meaning / clarity / safety)
- **SCARF activation** — which neural reward dimensions it activates (Status / Certainty / Autonomy / Relatedness / Fairness)
- **Belonging mechanism** — how it creates shared experience (Turner)
- **Facilitation protocol** — who runs it, in what format, with what time-box
- **Success indicator** — observable signal that the ritual is working (attendance, participation distribution, qualitative shifts)

**Anti-ritual audit (non-optional):** Most companies do not need more rituals; they need fewer anti-rituals. Surface current "rituals" that erode rather than build:

- Back-to-back meeting culture (no recovery time → cortisol-driven decision-making)
- Async-everything that erodes weak-tie relationships (Eisenberger — social distance activates exclusion circuits)
- Recognition-by-visibility (rewards extroverts, punishes deep workers)
- "Open door" policies that punish those who actually use them
- All-hands as broadcast theater (no real Q&A, no real dialogue → activates Status threat)
- Performance reviews as gotcha rituals (annual surprise → activates Certainty + Fairness threat)

Recommend their removal before adding new rituals on top.

### Step 5 — Psychological safety check (Edmondson, team-by-team)

Edmondson's 7-question short form (use the validated wording when running formally):

1. If you make a mistake on this team, it is often held against you.
2. Members of this team are able to bring up problems and tough issues.
3. People on this team sometimes reject others for being different.
4. It is safe to take a risk on this team.
5. It is difficult to ask other members of this team for help.
6. No one on this team would deliberately act in a way that undermines my efforts.
7. Working with members of this team, my unique skills and talents are valued and utilized.

Administer team-by-team — never just org-average. The org average is rarely the story; the variance between teams is the story. A team with PS = 4.8 next to a team with PS = 2.1 is a system fact about that second team's manager and meeting protocol, not about "the org."

System-level interventions for low-PS teams:

- Meeting protocol redesign (round-robin input, designated devil's advocate, "no decision in the room" rule for high-stakes calls)
- Manager training on response-to-bad-news (the manager's first 30 seconds of response shapes whether the team brings the next problem forward)
- Performance-review redesign so failure-tolerance is rewarded, not punished (separate "did you take a worthwhile risk?" from "did it pay off?")
- Re-measure quarterly; use trajectory not snapshot

### Step 6 — 90-day onboarding architecture (first day / week / month / quarter)

The 90-day window predicts retention better than the entire interview process. Design tied to retention metric.

- **First day** — psychological safety + belonging activation. Welcome ritual, manager 1:1, "your first question is welcome" framing, named buddy/peer, environment ready (laptop, accounts, desk or remote setup), first-day artifact (welcome doc with team faces and first-week plan). Neuroscience: first impressions establish baseline cortisol response — high-cortisol day-one predicts year-one departure.

- **First week** — relationship building + role context + early wins. Structured 1:1s with key collaborators, role context doc (history, prior decisions, current bets), one early win shipped by end of week (research: wins in week 1 correlate strongly with 12-month retention), feedback loop with manager (mid-week + end-of-week check).

- **First month** — skill ramp + team integration + performance baseline. Structured ramp plan (week 2-4 milestones), team-integration moments (lunch / coffee / virtual equivalent with full team), first performance baseline conversation (not review — calibration), peer feedback solicited explicitly.

- **First quarter** — autonomous performance + cultural integration check + first formal feedback loop. Full role autonomy by end of month 3, cultural integration check (does the new hire feel they understand "how we do things"?), first formal feedback loop (what's working / what's not / what to redesign for next hire), retention-risk signal review (engagement score, manager check-in, peer signal).

**Written-first elements for remote/hybrid** — Buffer, GitLab handbook patterns. The handbook is the onboarding scaffolding; live conversations supplement, not replace.

**Manager script** — exactly what the manager says on day 1, day 7, day 30, day 90. No improvising.

**New-hire prep doc** — what they need before day 1 (logins, learning links, intro video from team).

**Retention-metric tie** — every 90-day plan ties to 12-month retention probability and is tracked as a system metric, not a vibe.

## Output Shape

Each command produces a specific artifact written to `hr-intelligence/culture/`:

- `/culture-design` → `audit-redesign-<org>-<date>.md`
- `/culture-values-ops` → `values-ops-<org>-<date>.md`
- `/culture-rituals` → `rituals-<org>-<date>.md`
- `/culture-onboarding-90` → `onboarding-90-<role>-<date>.md`

See command files for full schemas.

## Rules

1. **Refuse values-poster work.** If the request is "help us pick three values for the wall," surface that this is not culture work. Posters do not change behavior; systems do. Route to systems-redesign instead.
2. **Refuse single-event "culture initiatives."** Off-sites, awards ceremonies, annual all-hands are spikes, not architecture. Rituals are weekly/monthly. Route to ritual-design instead.
3. **Audit before redesign, always.** No redesign without an honest current-state map. Skipping audit is the primary failure mode of culture work.
4. **Schein three-layer, always.** Artifacts → espoused values → underlying assumptions. Never accept the artifact layer as the answer to "what is the culture here?"
5. **Evidence-based observations.** Every claim about the lived culture cites observable evidence — last promotion, last departure, last meeting, calendar audit, exit interview pattern. Never feelings-only.
6. **SCARF-grounded ritual design.** Every ritual names which neural reward dimensions it activates. Rituals that activate threat (status games, opaque criteria, surprise reorgs disguised as rituals) erode rather than build.
7. **Team-by-team psychological safety.** Org average is not the story; team variance is. Intervene team-specifically.
8. **Anti-ritual detection non-optional.** Every audit surfaces current anti-rituals and recommends removal before adding new rituals. Layering rituals on unkilled anti-rituals does not work.
9. **90-day onboarding ties to retention metric.** Specific, measured, owned. Not "we have a good onboarding."
10. **One hand-off at close.** Each output ends with exactly one named next move. Default: the next sub-system in the HR vertical (Hiring / Performance / Training / Talent / Org).

## Anti-patterns (refuse these)

- "We have great culture, we just need to communicate it better." → No. If the lived culture were what you describe, the team would already feel it. Communication is not the gap. Audit the systems.
- "Let's run an off-site to fix culture." → No. Off-sites are spikes; rituals are architecture. The Monday after the off-site, the same systems run.
- "Let's add a value." → No. Adding a value without changing the systems that enforce it produces a values poster. Surface which systems must change first.
- "We tried psychological safety training, it didn't work." → No surprise. Training without manager response-to-bad-news redesign and meeting protocol changes is theater. Train the system, not just the people.
- "Onboarding is HR's job." → No. The first 90 days are owned by the manager, supported by HR, scaffolded by the handbook. If HR owns onboarding alone, it fails.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (the org owns its culture; Culture surfaces gaps and designs systems, never imposes external values)
- File contract (`hr-intelligence/culture/` namespace)
- Attestation (every artifact ships with "Built on SIP" block)
- Voice archetypes — architect primary, sovereign-creator warmth

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence — Culture, sub-system 4 of 6)
- Generated: 2026-04-24
---

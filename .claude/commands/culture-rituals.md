---
name: culture-rituals
description: Design ritual architecture for an org — across four cadences (daily/weekly/monthly/quarterly) plus annual milestones. Each ritual neuroscience-grounded (SCARF dimensions activated, belonging mechanism, anti-ritual flagged). Includes anti-ritual audit (back-to-back meetings, recognition-by-visibility, async-everything erosion). Refuses one-off "culture initiatives."
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --size <S|M|L> + --pattern <onsite|hybrid|remote> + --values "v1,v2,v3" + optional context paragraph
---

# /culture-rituals

Load `SIP.md`, `VOICES.md`, `agents/starlight-culture.md`, `skills/people-intelligence/culture-design.md`. Produce a **Ritual Architecture**.

## Refusal frame

This command does not produce off-site agendas, awards-ceremony plans, or single-event culture initiatives. Rituals are weekly/monthly/quarterly recurrences that compound. Annual events are spikes, not architecture. If the request is "design our annual all-hands theme," route out.

## Input
$ARGUMENTS

## Flags

- `--size <S|M|L>` — S = under 50, M = 50-250, L = 250+. Ritual cadence and facilitation pattern shifts by size.
- `--pattern <onsite|hybrid|remote>` — physical pattern affects which rituals work and which collapse. Required.
- `--values "v1,v2,v3"` — the operationalized values that rituals must reinforce. Required.
- Optional context paragraph — current rituals (if any), current pain points, recent restructure.

## Process

1. **Audit current rituals + anti-rituals** — what does the org already do across the four cadences? Which create belonging, which erode it?
2. **Design rituals across four cadences + annual milestones** — each ritual SCARF-grounded, belonging mechanism named, success indicator specified.
3. **Anti-ritual removal recommendations** — surface current anti-rituals (back-to-back meetings, recognition-by-visibility, "open door" theater, all-hands as broadcast) and recommend their removal before adding new rituals.
4. **Facilitation protocol per ritual** — who runs it, in what format, with what time-box, with what artifact.
5. **Save** — write to `people-intelligence/culture/rituals-<org>-<date>.md`.
6. **Hand off** — exactly one named next move.

## Output format

```markdown
# Ritual Architecture — <Org Name> — <YYYY-MM-DD>

> *"Rituals create belonging through shared, repeated experience (Turner, Bell). Most companies have weak rituals (annual all-hands, awards) and strong anti-rituals (back-to-back meetings, async-everything that erodes weak ties). The architecture is what's missing."*

## Context

- **Org:** <name>, <size>, <pattern>
- **Operationalized values to reinforce:** <list>
- **Current rituals (audited):** <list>
- **Current anti-rituals (audited):** <list>

---

## Section 1 — Anti-ritual audit (remove before adding)

The most overlooked move. Surface current anti-rituals and recommend removal **before** layering new rituals on top.

| Anti-ritual | Mechanism of harm | SCARF threat activated | Belonging impact | Remediation |
|-------------|-------------------|------------------------|------------------|-------------|
| Back-to-back meeting culture | No recovery → cortisol-driven decisions, no deep work | Autonomy, Certainty | Erodes individual capacity → weakens collective output | 25/50-minute defaults; meeting-free days; explicit no-meeting-after-hours; calendar audit at manager level |
| Recognition-by-visibility | Rewards extroverts and self-promoters; punishes deep workers | Status, Fairness | Builds resentment; signals that "being seen" matters more than contribution | Replace with peer-nomination + manager-review hybrid; surface non-visible contributions explicitly |
| All-hands as broadcast | One-way info dump; zero genuine Q&A → activates Status threat | Status, Autonomy | Reinforces passive culture | Replace 30 min broadcast with 10 min broadcast + 20 min real Q&A or breakout dialogue |
| "Open door" policy theater | Punishes those who use it (perceived as not autonomous) | Autonomy, Status | Silent disagreement | Replace with structured 1:1 cadence + explicit "bad news welcome" framing in 1:1 charters |
| Async-everything for distributed teams | Erodes weak-tie relationships → social distance activates exclusion circuits (Eisenberger) | Relatedness | Belonging collapses; engagement drops | Add scheduled real-time rituals (weekly team rhythm, monthly virtual coffee) — async + sync hybrid |
| <other anti-ritual> | <mechanism> | <SCARF> | <belonging> | <remediation> |

---

## Section 2 — Daily rituals

Short, low-cost, high-frequency. Build the substrate.

### Daily Ritual A: <name — e.g., "Async standup post">
- **Purpose:** team coordination + lightweight visibility
- **SCARF activation:** Certainty (clarity on what's happening), Relatedness (lightweight presence)
- **Belonging mechanism:** small, repeated co-presence
- **Format:** 3-line post (yesterday / today / blockers) in shared channel by <time>
- **Time-box:** ≤ 5 minutes per person
- **Facilitator:** rotating team-member; no manager-led
- **Success indicator:** ≥ 80% participation rate; signal-to-noise stays high; blockers actually surface
- **Avoid:** turning it into status-reporting theater; manager-led format (kills the belonging mechanism)

### Daily Ritual B: <if applicable for the size/pattern>
<same structure>

---

## Section 3 — Weekly rituals (the substrate of belonging)

Most-load-bearing cadence. The weekly rhythm is where the lived culture is actually expressed.

### Weekly Ritual A: <name — e.g., "Friday wins + lessons">
- **Purpose:** belonging through shared celebration + psychological safety through normalized lesson-sharing
- **SCARF activation:** Status (recognition), Relatedness (shared experience), Fairness (everyone gets a turn)
- **Belonging mechanism:** Turner-style ritual through repeated shared experience
- **Reinforces value:** <which operationalized value(s)>
- **Format:** 30-minute team meeting; round-robin (each person shares one win + one lesson); manager goes last
- **Facilitator:** rotating; manager goes last specifically (Edmondson — manager-first kills psychological safety in subsequent rounds)
- **Success indicator:** ≥ 90% attendance; lessons shared include genuine failures (not curated wins-disguised-as-lessons)
- **Avoid:** manager-led; performative wins-only; skipping when busy (signals it doesn't matter)

### Weekly Ritual B: <name — e.g., "Manager 1:1">
- **Purpose:** psychological safety + individual context + early surfacing of friction
- **SCARF activation:** Relatedness (one-on-one attention), Autonomy (private space to disagree)
- **Reinforces value:** <which>
- **Format:** 30-45 min, weekly, walking or seated, agenda owned by report (not manager)
- **Time-box:** 30-45 min
- **Facilitator:** report drives agenda; manager listens 70% of the time
- **Success indicator:** report regularly brings difficult topics; manager hears bad news early not late
- **Avoid:** status-update meetings disguised as 1:1; manager-driven agenda; cancellation pattern

### Weekly Ritual C: <if applicable>
<same structure>

---

## Section 4 — Monthly rituals (milestone markers)

Lower frequency, higher meaning. Mark progress + reinforce values.

### Monthly Ritual A: <name — e.g., "Peer-recognition ceremony">
- **Purpose:** value-reinforcement via public recognition
- **SCARF activation:** Status (positive recognition), Fairness (peer-nominated reduces favoritism), Relatedness (shared celebration)
- **Reinforces value:** <which operationalized value(s)>
- **Format:** 20 min, anyone can nominate anyone in advance; named recognition with specific behavior + which value it exemplifies
- **Time-box:** 20 min
- **Facilitator:** rotating; CEO does not run this
- **Success indicator:** broad nomination distribution (not the same 5 people every month); recognitions cite specific behavior + value
- **Avoid:** manager-only nominations; vague recognitions ("great job!"); same names recycled

### Monthly Ritual B: <e.g., "Learning showcase">
<same structure>

---

## Section 5 — Quarterly rituals (meaning-making)

Strategic-cadence rituals. Reinforce direction, surface drift, celebrate compound progress.

### Quarterly Ritual A: <name — e.g., "Quarterly retrospective">
- **Purpose:** meaning-making + system-level retrospective + drift detection
- **SCARF activation:** Certainty (clarity on direction), Autonomy (team agency over the next quarter), Fairness (transparent reflection)
- **Reinforces value:** <which>
- **Format:** half-day off-cycle; team-by-team retro followed by cross-team synthesis; CEO present in synthesis only
- **Time-box:** 4 hours
- **Facilitator:** ops or chief-of-staff; outside facilitator for orgs >100
- **Success indicator:** specific system-level changes committed; manager + IC voice present; retro outputs actually drive Q+1 OKRs
- **Avoid:** retro-as-vibes; CEO-led synthesis (kills psychological safety); retros that produce no committed change

### Quarterly Ritual B: <e.g., "Strategy share">
<same structure>

---

## Section 6 — Annual milestones (spikes, not architecture)

Annual events mark time but do not constitute the cultural substrate. Use sparingly and with purpose.

| Milestone | Purpose | Format | What it does NOT do |
|-----------|---------|--------|---------------------|
| Founding day | Origin-story reinforcement | Founder narrative + early-team reflection | Replace weekly rituals; pretend culture is built once a year |
| Annual all-hands | Strategic clarity + vision reinforcement | 60-90 min broadcast + 60 min real dialogue | Substitute for weekly team rhythm |
| Year-in-review | Compound-progress recognition | Data + named contribution stories | Surface yearly performance gaps that should have been addressed quarterly |
| Anniversary recognition | Tenure as belonging signal | Named, specific, contribution-cited | Become a participation trophy |

---

## Section 7 — Distribution map

Which rituals are critical for which roles / locations / patterns?

| Cadence | Onsite | Hybrid | Remote-first |
|---------|--------|--------|--------------|
| Daily | Async standup post | Async standup post + 2x/week in-person sync | Async standup + scheduled video presence 1x/week |
| Weekly | Friday wins + 1:1 | Friday wins + 1:1 + structured async-to-sync handoff | Friday wins (video) + 1:1 + virtual coffee rotation |
| Monthly | Peer-recognition + learning showcase | Same + intentional in-person convening | Same + quarterly in-person gathering substitute |
| Quarterly | Retrospective + strategy share | Same | Same — anchored in scheduled video, supported by written-first context |

---

## Section 8 — Implementation sequence (8 weeks)

- **Weeks 1-2** — Anti-ritual removal (do not add new rituals on top of unkilled anti-rituals)
- **Weeks 3-4** — Weekly rituals launched (substrate first)
- **Weeks 5-6** — Daily + monthly rituals layered
- **Weeks 7-8** — Quarterly + annual baseline established
- **Quarter 2+** — Re-measure psychological safety, attendance, broad nomination distribution

---

## Load-bearing next move

**`/culture-onboarding-90 <role>`** — onboarding is the entry point for every ritual; new hires must encounter the architecture in their first 90 days or they will not internalize it. Default next.

Alternatives:
- `/culture-values-ops <org>` — if rituals revealed value-system gaps (rituals can't reinforce values that aren't operationalized)
- `/culture-design <org>` — if anti-ritual audit revealed audit-level gaps not previously surfaced

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence — Culture, sub-system 4 of 6)
- Generated: <ISO date>
---
```

## Rules

- **Refuse single-event "culture initiatives."** Off-sites, awards ceremonies, annual themes are spikes, not architecture.
- **Anti-ritual audit always first.** Removing back-to-back meetings produces more cultural lift than adding any new ritual.
- **SCARF-grounded ritual design.** Every ritual names which neural reward dimensions it activates. Rituals that activate threat (Status games, opaque criteria, surprise reorgs disguised as rituals) erode rather than build.
- **Belonging mechanism named.** Turner / Bell — shared, repeated experience. Every ritual specifies how belonging is built.
- **Manager-last in psychological-safety rituals.** Edmondson — manager-first kills authentic sharing in subsequent rounds.
- **Distribution map matched to onsite/hybrid/remote pattern.** Rituals that work onsite collapse remote and vice versa; never copy-paste.
- **Weekly rituals are the substrate.** If only one cadence is invested in, it should be weekly — that's where the lived culture is expressed.
- **Save to `people-intelligence/culture/rituals-<org>-<date>.md`.**
- **One hand-off at close.** Default: `/culture-onboarding-90`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence — Culture, sub-system 4 of 6)
- Generated: 2026-04-24
---

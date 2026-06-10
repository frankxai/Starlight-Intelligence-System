# Executor Playbook — Template

> Structure for turning the DELEGATE bucket of a Freedom Path into a working handover document. Written in the person's voice, not generic corporate template voice. Three-phase training. Explicit milestones. Outdated-material flags.

## Prerequisites

- Genius Profile exists and has real voice samples (5 to 7).
- Freedom Path exists with DELEGATE bucket >= 3 items.
- Person has identified an executor (named or hypothetical role).

If any missing: halt and route back to `discover-genius` excavation.

## Shape — seven sections

1. **How to use this playbook** — 3 to 4 sentences in the person's voice, written as if speaking to the executor directly
2. **Training curriculum at a glance** — three phases calendar-anchored (Observe / Shadow / Autonomous)
3. **SOPs by functional domain** — one chapter per functional domain, each with framework + source materials + process + decisions owned + decisions escalated + quality bar
4. **Outdated material audit** — table of every source with status and note
5. **Handover milestones** — checkbox list tied to weeks 2 / 4 / 8 / 12
6. **Escalation triggers** — specific situations, not generic "escalate if unsure"
7. **Confidentiality** — past-employer IP flag, document lives in person's chosen system

## Empty template

```
# Executor Playbook — <Executor Name> (for <Person Name>)

> Onboarding start: <YYYY-MM-DD>. Target autonomous: <+12 weeks>.
> Generated from <Person>'s Freedom Path DELEGATE bucket + Genius Profile.
> This document is <Person>'s intellectual property. Stays in their chosen system.

## How to use this playbook
<3 to 4 sentences in the PERSON's voice, speaking to the executor directly. Warm, specific, no hedging. Example register: "You're holding this because I trust your judgment. Read one domain at a time. If anything reads like a script, tell me — I want you doing the work the way I'd do it, not reading me back to myself.">

## Training curriculum at a glance

**Week 1–2 — Observe.** Executor watches <person> work each domain live (or via recording). Questions encouraged. No independent action yet. Deliverable end of week 2: executor writes each framework in their own words; <person> signs off.

**Week 3–4 — Shadow + Execute.** Executor handles tasks with <person> reviewing every output. Errors are framework-teaching moments. Deliverable end of week 4: one full task cycle per domain with <10% rework.

**Week 5+ — Autonomous + Check-in.** Executor owns the work. <Person> spot-checks weekly for 4 weeks, then monthly. Target end of week 8: >=80% of DELEGATE bucket running without <person> intervention.

## SOPs by functional domain

### <Domain 1 — e.g., Recruiting>

**Framework** (from <person>'s Genius Profile): **<framework name>** — <one-line summary>

**Source materials:**
- <material 1> — Status: <current / outdated-adaptable / obsolete> — <note>
- <material 2> — Status: ... — <note>

**Process** (step-by-step, in <person>'s voice):
1. <step>
2. <step>
3. <step>

**Decisions the executor owns:**
- <decision> — criteria: <how to decide>
- <decision> — criteria: ...

**Decisions that escalate to <person>:**
- <decision> — why this stays: <reason>
- <decision> — why: ...

**Quality bar:**
- <concrete observable — not "looks professional" but e.g., "a hiring manager can run this interview from the doc without calling me">

### <Domain 2>
(same structure)

### <Domain N>
(same structure)

## Outdated material audit

| Source | Status | Note |
|---|---|---|
| <e.g., "Company-A recruiting template"> | outdated but adaptable | Framework sound; update vocabulary, remove Company-A specifics |
| <e.g., "2019 onboarding deck"> | obsolete | Extract framework, executor builds fresh |
| <e.g., "Current candidate scorecard"> | current | Use as-is |

## Handover milestones
- [ ] **Week 2** — Executor articulates the framework for each domain in their own words; <person> signs off.
- [ ] **Week 4** — Executor completes full task cycle for >=1 domain with <10% rework.
- [ ] **Week 8** — Executor operates autonomously; weekly 30-min check-in only.
- [ ] **Week 12** — Executor owns >=80% of DELEGATE bucket; <person> in monthly check-ins.

## Escalation triggers (specific, not generic)
Flag to <person> immediately — do not wait for weekly check-in:
- <situation specific to this person's work>
- <situation>
- <situation>
- <situation — include the "feels almost right but off" trigger — off-feeling is a framework gap, not a judgment call>

## Confidentiality
- Past-employer material marked <Company-X-specific>: learn the framework, do not copy specifics.
- This playbook lives in <person>'s chosen system (Notion / Drive / Claude Project). Not public.

---
Built on SIP — Starlight Intelligence Protocol v1.1.0
- Generated: <ISO date>
- Attestation is compounding, not credit transfer.
---
```

## Filled example — Executor for Maya (product-ops consultant; fictional composite — any resemblance to real persons is coincidental)

```
# Executor Playbook — Priya Raman (for Maya Lindqvist)

> Onboarding start: 2026-05-05. Target autonomous: 2026-07-28.
> Generated from Maya's Freedom Path DELEGATE bucket + Genius Profile v2026-04-24.
> This document is Maya's intellectual property. Stays in her Notion workspace.

## How to use this playbook
You're holding this because I trust your judgment. Read one domain at a time — not all at once. When you're running a task, if the SOP feels like a script instead of a frame, tell me. I don't want you reading me back to myself; I want you doing the work the way I'd do it, which means you'll have to internalize the framework, not memorize the steps. Downstream of every SOP is a decision the client team is actually avoiding. Your job is to see that and surface it, not to execute the document.

## Training curriculum at a glance

**Week 1–2 — Observe.** Shadow me through one full vendor-coordination cycle, one prototype-test round, and one launch-review prep. I'll narrate as I go. By end of week 2, you write each framework in your own words and we walk through them together.

**Week 3–4 — Shadow + Execute.** You run the build-readiness checklist for the Series-2 enclosure; I review every output. You run day-0 through day-30 of one pilot program; I review. Errors are framework-teaching moments — we fix the frame, not the individual output.

**Week 5+ — Autonomous.** You own vendor operations and prototype-test logistics. I spot-check weekly for 4 weeks, then we move to monthly. Target end of week 8: vendor coordination and test logistics running without me except at escalation points.

## SOPs by functional domain

### Vendor & supplier coordination (operations, not diagnostics)

**Framework** (from Maya's Genius Profile): **The Invisible Handoff Map** — where information dies between design, engineering, and supply chain, made visible.

**Source materials:**
- Handoff audit checklist v2025 (Notion) — current — use as-is
- Vendor brief template 2026 — current
- 2022 sourcing template from Company-A — outdated but adaptable; framework sound, remove Company-A-specific vocabulary and update tooling references
- Build-coordination checklist — current

**Process:**
1. Intake the client team's stated spec, and write the real constraint underneath it. (Example: stated spec = "matte finish"; real constraint = often "the last finish failed drop-test and nobody wrote down why.")
2. Screen vendor responses for pattern, not price. Prioritize vendors whose questions show they read the tolerance stack — they've caught a handoff drop before.
3. Run the brief against the handoff map. Escalate any handoff where two teams describe the same deliverable differently to me for a map session.
4. Coordinate the build review, brief participants on the map, collect evidence packets within 24h.
5. Synthesize review feedback using the Decision Debt frame: which decisions did each team defer without logging? Flag those to me.

**Decisions you own:**
- Whether to advance a vendor from response screen to sample round — criteria: pattern match to brief + tolerance-stack signal.
- Whether an evidence packet is complete — criteria: all map dimensions addressed, no "we'll confirm later" left unlogged.

**Decisions that escalate to Maya:**
- Any handoff where the same deliverable is described differently by two teams — that's not a logistics issue, it's the map working, and the session needs me.
- Any disagreement between reviewers >2 points on the gate rubric.
- Anything during the process that surprises you in a way you can't name — that "feels off but I can't say why" instinct is data; bring it to me.

**Quality bar:**
- A client engineer can run the vendor-brief review from the checklist without calling me.
- No vendor waits >48h for a next-step communication.
- Evidence packets arrive within 24h of each review.

### Prototype-test operations

**Framework** (from Genius Profile): **Prototype Autopsies** — what a killed prototype was built to test, and what it taught, made explicit.

**Source materials:**
- Test-round framework v2026 Notion — current
- Day-0 through day-30 pilot checklist — current
- 2024 test-plan deck (Canva) — outdated but adaptable; refresh 2024 tool refs, update lab names
- Team handoff guide — current

**Process:**
1. Day -5: confirm units, fixtures, day-0 schedule, and test-round participants.
2. Day 0: run the load-bearing-assumption conversation with the team lead (I'll do this the first time; you shadow; by the third round you own it).
3. Day 7: check-in with the test lead — what's surprising, what's unclear, what's harder than expected. You bring a summary to our weekly.
4. Day 30: calibration check with the team lead. Flag gaps between what the test was meant to prove and what it measured.
5. Day 90: transition from pilot to regular test cycles.

**Decisions you own:**
- Scheduling, logistics, fixtures, calendar, lab coordination details.
- The day-7 and day-30 check-in format (stay in the framework, adjust mechanics).

**Decisions that escalate to Maya:**
- Any assumption-conversation issue (the team lead resists naming the assumption, the test plan doesn't match the stated goal, the prototype is testing something nobody owns).
- Any day-30 calibration showing intent-vs-measurement mismatch >20%.

**Quality bar:**
- Test lead can name, by day-30, the three assumptions the round is explicitly built to test.
- Team lead can name, by day-30, the one decision they'd log differently if they could redo the kickoff.

### Launch-review operations

(Similar structure — framework is the Launch-Readiness Ladder; Priya handles logistics/evidence packets/nudges; Maya handles the gate conversations themselves.)

### Roadmap-cycle operations

(Priya runs the mechanics of the annual cycle: calendar, ledger updates, team briefings, data compilation. Maya owns the decision-debt conversations.)

## Outdated material audit

| Source | Status | Note |
|---|---|---|
| 2022 Company-A sourcing template | outdated but adaptable | Framework sound; update vendor vocabulary, remove Company-A-specific language, replace 2021 tooling references |
| 2019 test-plan deck | obsolete | Company defunct; extract framework only, build fresh deck |
| Canva "Company-B brand kit" | obsolete | Not Maya's current brand; do not reuse |
| Notion 2026 roadmap-season SOP | current | Use as-is |
| 2020 autopsy rubric | outdated but adaptable | Diagnostic frame still valid; update questions that reference Company-A process specifics |
| Current evidence packets Q1 2026 | current | Best-in-class example |

## Handover milestones

- [ ] **Week 2** — Priya articulates the framework for Vendor Coordination, Prototype-Test Ops, Launch-Review Ops, and Roadmap-Cycle Ops in her own words; Maya signs off on each.
- [ ] **Week 4** — Priya completes full vendor cycle for the Series-2 enclosure with <10% rework from Maya.
- [ ] **Week 8** — Priya operates autonomously on vendor coordination and test logistics; weekly 30-min check-in only.
- [ ] **Week 12** — Priya owns >=80% of DELEGATE bucket; Maya in monthly check-ins; weekly hours reclaimed for KEEP work: target 20+.

## Escalation triggers (specific, not generic)

Flag to Maya immediately:
- Any vendor or test result where the "feels almost right but off" signal is present — off-feeling is a framework gap, not a judgment call.
- Any gate conversation where killing the launch is on the table.
- Any roadmap conversation where the sponsor asks for an exception and the team resists.
- Anything touching safety certification, regulatory compliance, or a recall-adjacent process.
- Any assumption-conversation where the team lead and test lead describe the goal differently by >30%.
- Any prototype autopsy where the stated kill reason doesn't match the evidence.

## Confidentiality

- Past-employer material marked Company-A-specific or Company-B-specific: learn the framework, do not copy the specifics. Maya's frameworks are portable; former employers' IP is not.
- This playbook lives in Maya's Notion workspace. Not public. Not shareable outside Maya and Priya without explicit consent.

---
Built on SIP — Starlight Intelligence Protocol v1.1.0
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules for Starlight when generating an Executor Playbook

- **Never generate SOPs in generic corporate voice.** Voice-cloning from the Genius Profile is the whole point. If voice samples are thin, halt and route to genius excavation.
- **Never skip the outdated-material audit.** Flagging decay is core value.
- **Never generate for non-DELEGATE work.** KEEP stays with the person; AUTOMATE goes to systems; KILL stops. Only DELEGATE produces a playbook.
- **Never ship SOPs for work with no matching framework.** Flag `needs framework extraction` and exclude.
- **Never route the executor to past-employer proprietary specifics.** Framework transfers; IP does not.
- **Always three phases.** Skipping Observe is the most common reason executor hires fail.
- **Escalation triggers are specific, not generic.** "Escalate if unsure" is not a trigger.
- **Sovereignty:** the playbook belongs to the person. Starlight has no claim on it.

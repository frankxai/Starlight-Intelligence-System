---
name: train-executor
description: Generate an executor onboarding playbook from a person's Freedom Path DELEGATE bucket. Produces SOPs in the person's voice, a training curriculum, and outdated-material flags. Non-technical-friendly — designed for Claude Desktop + Cowork usage.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> <executor-name> [optional — focus domain, e.g., "recruiting" or "onboarding"]
---

# /train-executor

Load `SIP.md`, `VOICES.md`, `genius/profile-<person-slug>.md`, `genius/freedom-path-<person-slug>.md`, and `genius/reclamation-<person-slug>.md` (if present). Also load `agents/starlight-genius.md` and `skills/intelligence/genius-excavation.md` if they exist in this release. If any are missing, emit a one-line notice: `genius agent/skill not yet loaded — proceeding with architect voice + Frank DNA`.

Convert the DELEGATE bucket of a Freedom Path into a working playbook an executor can actually use on day one. SOPs carry the person's voice. Outdated material is flagged, not hidden. Training is phased across 12 weeks with explicit handover milestones.

## Input
$ARGUMENTS

## When this command fires

- `/discover-genius` has produced a Genius Profile + Freedom Path for the named person.
- The DELEGATE bucket contains ≥3 items — enough to justify a hire.
- The person has identified an executor (named, even if hypothetical) and wants handover scaffolding.
- The person is non-technical by default. Output is readable in Claude Desktop or Notion without a terminal.

## When this command does NOT fire

- Before Genius excavation — you cannot train an executor on work whose shape isn't mapped. Halt and route to `/discover-genius`.
- When the person's ask is really `/reclaim-knowledge` — scattered material with no delegation plan. Route there first; the reclamation map is an input to this command.
- When the DELEGATE bucket is empty or <3 items — either excavation is shallow (re-run `/discover-genius` with a deeper corpus) or this person genuinely has no delegatable work (rare — route to `/intake` for re-qualification).
- When the ask is to automate, not delegate — AUTOMATE items belong to `/creator-pipeline` or a dedicated automation command, not to a human executor playbook.

## Process

1. **Validate inputs and the DELEGATE bucket.**
   - Resolve `<person-slug>` from `<person-name>` (lowercase, kebab-case).
   - Read `genius/profile-<person-slug>.md`. If missing → halt with: `Genius Profile not found. Run /discover-genius <person-name> before /train-executor.`
   - Read `genius/freedom-path-<person-slug>.md`. If missing → halt with same message.
   - Count items in the DELEGATE bucket. If <3 → halt with: `DELEGATE bucket has <3 items. Either genius excavation is too shallow (re-run /discover-genius with a broader corpus), or this person has no meaningful delegatable work yet. Do not ship a playbook on thin ground.`
   - If a focus domain was passed as third argument, filter DELEGATE items to that domain. If the filter yields zero items, halt and name the mismatch.

2. **Inventory DELEGATE tasks by functional domain.**
   - Group every DELEGATE item by the functional category it belongs to — not by the source it came from. For an HR leader like Ana this typically yields: recruiting, onboarding, performance management, training, comp/ben, offboarding, compliance, culture.
   - Each functional domain becomes one chapter in the Executor Playbook. Domains with only one task collapse into an adjacent domain unless the task is structurally distinct.
   - Order domains by cognitive load on the person today, highest first. The domain draining them most is the first one the executor takes.

3. **Map each domain to a framework from the Genius Profile.**
   - Pull the person's frameworks list from the Genius Profile.
   - For each functional domain, name the one framework that governs the work. The framework is what the executor learns; the task is what the executor does.
   - If a DELEGATE item has no matching framework in the profile → flag as `needs framework extraction` and EXCLUDE from this playbook. Do not ship SOPs for undefined work. Recommend a follow-up `/discover-genius` pass scoped to that domain.

4. **Voice-clone the SOPs.**
   - Read the voice samples section of the Genius Profile (cadence, lexicon, tells, pet phrases, posture).
   - Write each SOP in that voice. The executor should read the document and hear the person, not a generic corporate template, not ChatGPT.
   - Rules for voice cloning: use their sentence length, their metaphors, their register (warm / terse / poetic / dry), and their preferred vocabulary for the domain. If the person says "candidate," do not say "applicant." If they say "teammate," do not say "employee."
   - If voice samples are thin in the profile → halt and route to `/discover-genius` for a voice-deepening pass. Do NOT generate generic-voice SOPs; that defeats the point of the playbook.

5. **Audit source material status per SOP.**
   - For each SOP, cross-reference the source materials catalogued in the Genius Profile corpus (or in `genius/reclamation-<person-slug>.md` if present).
   - Mark each source as one of:
     - **current** — transferable as-is, executor can learn from it directly.
     - **outdated but adaptable** — framework is sound; note what vocabulary / examples / tools need updating before the executor uses it.
     - **obsolete** — reference only. Executor should learn the framework from the SOP and build fresh artifacts rather than copy this one.
   - Flag past-employer IP explicitly: `Company-X-specific — executor learns the framework, not the proprietary specifics.`

6. **Generate the training curriculum.**
   - Three phases, calendar-anchored:
     - **Phase 1 — Observe (Week 1–2):** executor watches the person work through each SOP live or via recording. Questions encouraged. No independent action yet. Deliverable end of week 2: executor writes the framework for each domain in their own words and the person signs off.
     - **Phase 2 — Shadow + Execute (Week 3–4):** executor handles tasks with the person reviewing every output before it leaves the building. Errors are framework-teaching moments — the person fixes the framework gap, not the individual mistake. Deliverable end of week 4: one full task cycle per domain completed with <10% rework.
     - **Phase 3 — Autonomous + Check-in (Week 5+):** executor owns the work. Person spot-checks weekly for 4 weeks, then moves to monthly. Deliverable end of week 8: ≥80% of DELEGATE bucket is running without person intervention.

7. **Emit the two artifacts.**
   - `executor/<executor-slug>-playbook.md` — the full SOP set in the output format below.
   - `executor/<executor-slug>-handover-dashboard.md` — a shorter status-tracking doc for weekly check-ins (milestones + open questions + escalation log).
   - Create the `executor/` directory if it does not exist.
   - Append a one-line entry to `memory/intake/` noting the playbook was generated, so future sessions can trace the handover.

## Output format — executor playbook

```
# Executor Playbook — <executor-name> (for <person-name>)

> Onboarding start: <YYYY-MM-DD>. Target autonomous: <YYYY-MM-DD> (+12 weeks).
> Generated from <person>'s Freedom Path DELEGATE bucket + Genius Profile v<date>.
> This document is <person>'s intellectual property. Starlight does not retain it in public vaults.

## How to use this playbook

<3–4 sentences in the PERSON's voice, written as if they're speaking to their executor directly. Warm, specific, no hedging. Example register: "You're holding this because I trust your judgment. Read one domain at a time. If anything reads like a script, tell me — I want you doing the work the way I'd do it, not reading me back to myself.">

## Training curriculum at a glance

- **Week 1–2 — Observe.** <list of shadowing sessions scheduled, one per domain>
- **Week 3–4 — Shadow + Execute.** <list of tasks the executor will run with person review>
- **Week 5+ — Autonomous.** Readiness signals: <concrete metrics, e.g., "can run a full recruiting cycle end-to-end without escalation; drafts performance reviews that need <10% edits">

## SOPs by functional domain

### <Domain 1 — e.g., Recruiting>

**Framework** (from <person>'s genius profile): <framework name> — <one-line summary>

**Source materials:**
- <material 1 — e.g., "Company-X recruiting template.docx"> — Status: current / outdated / obsolete — <note>
- <material 2> — Status: ... — <note>

**Process** (step-by-step, in <person>'s voice):
1. <step>
2. <step>
3. <step>

**Decisions the executor owns:**
- <decision> — criteria: <how to decide>
- <decision> — criteria: <how to decide>

**Decisions that escalate to <person>:**
- <decision> — why this stays with <person>: <reason>
- <decision> — why: <reason>

**Quality bar:**
- <how the executor knows the output is good, in concrete observable terms — not "looks professional" but "a hiring manager can run this interview from the doc without calling me">

### <Domain 2 — e.g., Onboarding>

(same structure)

### <Domain N>

(same structure)

## Outdated material audit

| Source | Status | Note |
|---|---|---|
| <e.g., "Company X recruiting template.docx"> | outdated but adaptable | Framework is sound; update job-title vocabulary, remove Company X-specific language, replace 2021 comp bands |
| <e.g., "2019 onboarding deck"> | obsolete | Company defunct; extract framework, executor builds fresh deck |
| <e.g., "Canva brand kit — current role"> | current | Use as-is |

## Handover milestones

- [ ] **Week 2** — Executor articulates the framework for each domain in their own words; <person> signs off on each.
- [ ] **Week 4** — Executor completes full task cycle for ≥1 domain with <10% rework from <person>.
- [ ] **Week 8** — Executor operates autonomously with weekly 30-min check-in only.
- [ ] **Week 12** — Executor owns ≥80% of DELEGATE bucket; <person> in monthly check-ins; weekly time saved: <person>'s estimate.

## Escalation triggers

Flag to <person> immediately — do not wait for weekly check-in:
- <situation specific to this person's work — e.g., "Any candidate communication that requires calibrating against a framework you haven't seen yet">
- <situation — e.g., "Any performance conversation where termination is on the table">
- <situation — e.g., "Anything touching legal compliance or a regulated process">
- <situation — e.g., "A decision that feels 'almost right but off' — the off feeling is a framework gap, not a judgment call">

## Confidentiality

- Past-employer material marked Company-X-specific: learn the framework, do not copy the specifics. <person>'s frameworks are portable; their former employers' IP is not.
- This playbook lives in <person>'s chosen system (Notion / Drive / Claude Projects). It is not public.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Output format — handover dashboard

```
# Handover Dashboard — <executor-name> → <person-name>

> Companion to the Executor Playbook. Use for weekly check-ins. Update in place.

## Phase status
- Current phase: <Observe / Shadow / Autonomous>
- Week: <n> of 12
- Next milestone: <milestone> by <date>

## Milestone tracker
- [ ] Week 2 — frameworks articulated
- [ ] Week 4 — first autonomous cycle <10% rework
- [ ] Week 8 — autonomous with weekly check-in
- [ ] Week 12 — ≥80% DELEGATE ownership

## This week
**Executor is running:** <domains>
**Person is spot-checking:** <what to verify>
**Open questions from executor:** <bulleted, add as raised>
**Escalations logged this week:** <bulleted, or "none">

## Framework gaps surfaced
<append-only — every error that revealed a framework gap, not an executor mistake, gets logged here. This is the learning feedback loop for the next /discover-genius pass.>

---
Built on SIP v1.1.0 · starlight-intelligence-system@v7.4
---
```

## Rules

- **Never** generate SOPs in generic voice. Voice-cloning from the Genius Profile is the whole point of this command. If voice samples are thin, halt and route to `/discover-genius` for a voice-deepening pass.
- **Never** skip the outdated-material audit. Flagging decay is core value — the executor and the person both need to see what still works and what needs an update.
- **Never** generate a playbook for non-DELEGATE work. KEEP stays with the person (that's the genius). AUTOMATE goes to systems. KILL stops. Only DELEGATE produces a playbook.
- **Never** ship SOPs for work with no matching framework in the Genius Profile. Flag `needs framework extraction` and exclude. An undefined SOP teaches the executor the wrong shape.
- **Never** route the executor to past-employer proprietary specifics. Framework transfers; IP does not. Flag + learn the pattern, not the artifact.
- **Always** three phases: Observe → Shadow → Autonomous. Skipping Phase 1 is the most common reason executor hires fail — the person has built a framework the executor cannot see without watching them run it.
- **Always** produce both files — playbook and dashboard. The dashboard is how the handover stays alive week to week; without it the playbook becomes a document no one opens after day three.
- **Sovereignty** — the playbook belongs to the person. Starlight has no claim on it. Do not write it to public vaults. The `executor/` directory is the person's private working space.
- **Escalation triggers are specific, not generic.** "Escalate if unsure" is not a trigger; it is a cop-out. Name the actual situations for this person's actual domain.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

# QUICK-START — People Intelligence

> Front door for the People Intelligence vertical. Where you are, what's built, what to run first, what to keep when the room gets harder.

**Last updated:** 2026-04-30 (v0.1 scaffold complete; Phase 1 ready)

> **Disclaimer (non-waivable).** People Intelligence touches employment law, protected-class considerations, compensation regulation, and jurisdiction-specific compliance. This vertical is system architecture and practitioner-grade methodology — not legal advice. Validate jurisdiction-specific instruments (interview questions, performance documentation, termination protocols, succession agreements) with qualified counsel before deployment. Every command opens with this disclaimer when relevant.

---

## Where you are

**Phase 0 scaffold — COMPLETE.** People Intelligence vertical wired at `verticals/people-intelligence/` with the full file contract, six sub-systems, six dedicated agents, six skills, twenty-eight commands, knowledge templates, composition rules, and the People-vs-Relational boundary table (Lyssandria challenge closed).

**Phase 1 — READY.** First practitioner walkthrough end-to-end: pick the entry sub-system, run the daily-5, ship the first attested artifact, log it in `MEMORY.md`. Forking via `/sovereign-spawn` or `/spawn-domain-stack` is unblocked.

**Status snapshot:**

| Surface | Count | Notes |
|---|---|---|
| Sub-systems | 6 | Hiring · Performance · Training · Culture · Talent · Org |
| Commands | 28 | 5+5+5+4+5+4 — verified against `.claude/commands/` |
| Agents | 6 | `starlight-{hiring,performance,training,culture,talent,org}` |
| Skills | 6 | Under `skills/people-intelligence/` |
| Knowledge templates | 6 | Under `integrations/starter-packs/friend-starter/knowledge/` |
| Tests | 596/596 | as of v7.6.0 ship |
| Readiness | v0.1 → v1.0 | v1.0 gate = three practitioner forks completing one full sub-system flow |

---

## Today (next session, 30-60 min)

### Action 1 — Pick your entry sub-system (5 min)

The vertical has six sub-systems but you do not start with all six. Pick the one that maps to the room you are actually in:

| If your room is... | Run first | Why |
|---|---|---|
| **Hiring next role** | `/hire-icp <role-name>` | Every active role starts here. Defines cognitive requirements, behavioral signals, work-history patterns, the culture-add hypothesis, and the DOES-NOT-MATTER list. |
| **Performance review broken** | `/perf-review-redesign` | Replaces the annual ritual with continuous + quarterly + annual-comp architecture. Refuses stack-rank, sandwich-feedback, and PIP-as-firing. |
| **Culture undefined or drifting** | `/culture-design` | Diagnoses lived culture (what gets rewarded, punished, ignored), names the gap to declared, redesigns systems. Schein's three levels operationalized. |
| **Team showing strain** | `/talent-burnout-detect` | Maslach 3-dimensional assessment. Cynicism is the diagnostic before exhaustion. Run before any reorg or culture intervention on a stressed team. |
| **Reorg on the horizon** | `/org-reorg-trauma-audit` | Opens with the 70%+ reorg-failure literature. Trauma history, sequencing plan, parallel `/talent-burnout-detect` monitoring. |
| **Training program stalling at L1** | `/training-curriculum` | Outcome-back design from L3 behavior change. Refuses smile-sheet-as-data. |

### Action 2 — Run the daily-5 once, in order (30 min)

The sub-systems compose. Run them in this sequence to feel the architecture:

```
/hire-icp <role-name>
/perf-feedback-rehearsal <conversation-context>
/talent-burnout-detect <person-or-team>
/culture-values-ops
/org-role-design <role>
```

Five commands, ~6 minutes each. You see how Hiring's calibration grammar transfers to Performance, how Culture's values-ops flows into Hiring criteria, how Org's role design runs upstream of ICP, and how Talent's burnout monitoring runs in parallel with anything else.

### Action 3 — Log the first artifact (10 min)

Open `verticals/people-intelligence/MEMORY.md`. Append-only entry under today's date:

- What you ran
- One thing you learned about your own people-system
- One thing the artifact refused to say (the theater pattern it would not produce)

This is your first proof-of-life — the vertical is now operating, not staged.

### Action 4 — Validate the boundary (15 min, optional)

Read `SUB-SYSTEMS.md` § "People Intelligence ↔ Relational IS — boundary delineation". Pick one boundary case from the table and run the practitioner test ("is the unit of analysis a *role/team/org* or a *relationship/alliance/network*?"). Confirm you can route correctly without re-asking the wrapper.

---

## This week

- [x] Phase 0 scaffold complete (596/596 green)
- [ ] Daily-5 run end-to-end against a real room
- [ ] First `MEMORY.md` entry logged with attested artifact reference
- [ ] One sub-system flow run to completion (e.g., `/hire-icp` → `/hire-design-interview` → `/hire-calibrate` → loop → `/hire-debrief`)
- [ ] Composition rule tested: `/culture-design` + `/culture-values-ops` before `/hire-assess-fit`
- [ ] Refusal-pattern hit logged — when an artifact declined to ship a theater pattern, capture which one
- [ ] Second sub-system entered (the one your daily-5 surfaced as next-most-leveraged)

---

## File map (where everything lives)

### Vertical wrapper (8 files at `verticals/people-intelligence/`)

```
verticals/people-intelligence/
├── README.md           # Overview + synthesis edge + productization paths
├── SKILL.md            # Substrate skill contract for the vertical
├── SOUL.md             # Refusal posture + drift tests
├── STACK.md            # Composition with universal IS layers
├── AGENTS.md           # 6 sub-system agents + tier discipline
├── SUB-SYSTEMS.md      # The canonical 6 sub-system map + boundary table
├── CANON.md            # At-a-glance canonical resolver
├── MEMORY.md           # Append-only operational log
└── QUICK-START.md      # ← you are here
```

### Agents (6 files at `agents/`)

- `starlight-hiring.md` — Calibrated, structured, neuroscience-grounded hiring
- `starlight-performance.md` — Feedback craft + review architecture + difficult conversations
- `starlight-training.md` — Outcome-back curriculum + L3 behavior transfer
- `starlight-culture.md` — Values-ops + ritual architecture + 90-day onboarding
- `starlight-talent.md` — Burnout, motivation, psych-safety, retention, team dynamics
- `starlight-org.md` — Role design, span, reorg sequencing, succession

### Skills (6 files at `skills/people-intelligence/`)

- `structured-hiring.md` — Schmidt & Hunter bundle; calibration protocols; culture-add
- `feedback-conversations.md` — SBI + three-conversations + solution-focused coaching
- `learning-architecture.md` — Kirkpatrick L3/L4; spaced practice; Baldwin & Ford transfer
- `culture-design.md` — Schein three levels; ritual cadences; values-ops matrix
- `people-dynamics.md` — Maslach burnout; Edmondson safety; SDT motivation; Hackman teams
- `org-architecture.md` — Galbraith STAR; span-of-control; reorg-trauma; succession-readiness

### Commands (28 files at `.claude/commands/`)

Grouped by sub-system. Counts verified against the directory.

```
hire-icp · hire-design-interview · hire-calibrate · hire-assess-fit · hire-debrief                          (5)
perf-feedback-rehearsal · perf-review-redesign · perf-coaching-protocol · perf-difficult-conversation · perf-conflict-mediation  (5)
training-curriculum · training-program-design · training-coach-trainer · training-measure-transfer · training-scenarios  (5)
culture-design · culture-values-ops · culture-rituals · culture-onboarding-90                              (4)
talent-burnout-detect · talent-motivation · talent-psych-safety · talent-retention · talent-team-dynamics  (5)
org-role-design · org-span · org-reorg-trauma-audit · org-succession                                       (4)
```

### Knowledge templates (6 files)

`integrations/starter-packs/friend-starter/knowledge/hr-{hiring,performance,training,culture,talent,org}-template.md`

---

## The 6 sub-systems

| # | Sub-system | Agent | Skill | Commands |
|---|---|---|---|---|
| 1 | **Hiring** | `starlight-hiring` | `structured-hiring` | 5 |
| 2 | **Performance** | `starlight-performance` | `feedback-conversations` | 5 |
| 3 | **Training** | `starlight-training` | `learning-architecture` | 5 |
| 4 | **Culture** | `starlight-culture` | `culture-design` | 4 |
| 5 | **Talent** | `starlight-talent` | `people-dynamics` | 5 |
| 6 | **Org** | `starlight-org` | `org-architecture` | 4 |

Full sub-system map: `SUB-SYSTEMS.md`.

---

## Quick-reference commands

```
# Hiring
/hire-icp <role-name>
/hire-design-interview <role>
/hire-calibrate <role>
/hire-assess-fit <candidate>
/hire-debrief <candidate>

# Performance
/perf-feedback-rehearsal <conversation-context>
/perf-review-redesign
/perf-coaching-protocol <person>
/perf-difficult-conversation <conversation-context>
/perf-conflict-mediation <party-a> <party-b>

# Training
/training-curriculum <program>
/training-program-design <program>
/training-coach-trainer <program>
/training-measure-transfer <program>
/training-scenarios <skill-domain>

# Culture
/culture-design
/culture-values-ops
/culture-rituals
/culture-onboarding-90 <role>

# Talent
/talent-burnout-detect <person-or-team>
/talent-motivation <person>
/talent-psych-safety <team>
/talent-retention <cohort>
/talent-team-dynamics <team>

# Org
/org-role-design <role>
/org-span
/org-reorg-trauma-audit <org-context>
/org-succession <critical-role>
```

---

## Five non-negotiable composition rules (compressed)

1. **Culture defines before Hiring assesses culture-add.** `/culture-design` + `/culture-values-ops` run before `/hire-assess-fit`. Otherwise culture-add collapses into the same vibe-check the system was built to prevent.
2. **Org runs upstream of ICP.** Run `/org-role-design` before `/hire-icp` for new or restructured roles — confirm the role should exist as drawn.
3. **Talent runs in parallel with Org reorg.** Reorgs trigger burnout in 70%+ of cases. `/talent-burnout-detect` runs before, during, after `/org-reorg-trauma-audit`.
4. **Hiring's calibration grammar transfers to Performance.** Multi-rater anchors that prevent hire drift prevent review drift. `/hire-design-interview` rubric exports to `/perf-review-redesign`.
5. **Training's L3 transfer composes with Performance after week six.** L3 behavior measurement is a performance question, not a training question, once the program lands.

Full ruleset: `SUB-SYSTEMS.md` § Composition rules.

---

## Signature discipline — what makes this not HR theater

- **Structured > unstructured** (Schmidt & Hunter ~2x predictive validity). Unstructured-as-primary-signal is refused.
- **Culture-add, not culture-fit.** Culture-fit reproduces; culture-add expands. The DOES-NOT-MATTER list is the anti-criteria that keeps similarity-attraction out.
- **Calibration > rater quality** (Project Oxygen). Multi-rater pre-loop calibration + structured-scoring-before-discussion in debriefs.
- **90-day onboarding predicts retention** stronger than the entire interview process. Most teams under-invest by 10x.
- **Burnout is organizational, not individual** (Maslach is unambiguous). Refused as a personal-resilience problem.
- **Psychological safety is not engagement** (Edmondson). Engagement scores are not a safety measurement.
- **Reorgs fail 70%+ of the time when sequencing and trauma history are skipped.** The trauma audit is non-optional.
- **Succession plans without readiness assessment + development pathway + decision-rights transfer are paper.** Refused as such.

The full refusal posture for each sub-system lives in each agent's "Refusal patterns" section.

---

## When stuck or things break

- **A command produces something that feels like generic HR content** → check the agent's Refusal patterns section; the artifact may have leaked a theater pattern. Re-run with the specific refusal flagged.
- **The boundary with Relational IS feels fuzzy** → `SUB-SYSTEMS.md` § "People Intelligence ↔ Relational IS" boundary table. Use the practitioner test.
- **A composition rule violation slipped through** → log it in `MEMORY.md`, the wrapper learns. Refusing the violated rule is the next session's entry.
- **Forking for a private practice and unsure what to keep** → the substrate-aligned scaffold is MIT; your voice, frameworks, and client-shaped artifacts are yours. Run `/sovereign-spawn` or `/spawn-domain-stack` for the fork.

---

## What this gives you

- **A research-grounded operating layer** above your HRIS / ATS / LMS — not a system-of-record replacement, the thinking layer that runs above them.
- **Six sub-systems with shared voice and shared refusal posture** — the same practitioner who shows up in Hiring shows up in Performance, Talent, and Org. No tool-switching tone collapse.
- **Composition rules that prevent the most common failure modes** — culture-fit drift, reorg-trauma cascade, smile-sheet-as-training-success, PIP-as-firing.
- **A productization scaffold** — own-practice operating layer, executor leverage, productized offer, copilot/GPT extension, licensable methodology. Five compounding paths from one fork.
- **Attestation by default** — every artifact ships "Built on SIP" plus your vertical identifier. Sovereignty clause non-waivable.
- **A boundary with Relational IS that holds** — the unit-of-analysis test routes correctly between organizational frame and relational frame without re-litigating each session.

---

**Built on SIP** — `verticals/people-intelligence/QUICK-START.md` · v0.1 · 2026-04-30 · The front door · Phase 0 complete · Phase 1 ready

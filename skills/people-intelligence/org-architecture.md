---
name: people-intelligence/org-architecture
description: Use when designing role, span of control, sequencing, succession, or change management with the human cost honestly accounted — composes Marquet on decision rights, Kniberg on role-clarity, span-of-control research, McKinsey on reorg failure, Kotter on change-management steps, Bridges on psychological transitions, SCARF on threat circuits, and Conway's Law. Sub-system 6 of 6 in the People Intelligence reference vertical.
type: domain-vertical
---

# Skill — People Intelligence / Org Architecture

> Designing role, span, sequencing, succession, and change with the human cost honestly accounted. Composes Marquet on decision rights, Kniberg on role-clarity, span-of-control research, McKinsey on reorg failure, Kotter on change-management steps, Bridges on psychological transitions, SCARF on threat circuits, and Conway's Law on structure-product coupling.

---

## Triggers

**Keywords:** org-design, organizational design, reorg, restructure, reorganize, role design, role clarity, span of control, direct reports, succession, successor, promotion, hierarchy, flat structure, holacracy, change management, transformation, RACI, decision rights, accountability, reporting line, org chart, Conway's Law

**Agents:** `starlight-org` (primary), `starlight-navigator`, `starlight-sentinel` (severance/protected-class escalation), `starlight-prime` (identity-structure synthesis)

**Intents:** organizational architecture, role-design, span-architecture, reorg-sequencing, succession-planning, change-management

**Composes with:** Performance (downstream — role clarity drives performance), Hiring (upstream — role design drives ICP), Talent IS (during/post-change monitoring), Culture (parallel — structure expresses culture), Vision (upstream — structure serves vision)

---

## Research grounding

This skill leans on real bodies of research. Cite directionally; never fabricate specific numbers.

- **Span of control** — research range: ~5-9 direct reports for managers doing complex knowledge work; up to 15-20 for repetitive supervised work. Founder-CEOs commonly over-span at 10-15 directs in growth-stage companies. Most orgs are over-spanned at the top and under-spanned in the middle.
- **Role design** — RACI is folklore-grade (useful for surfacing ambiguity, insufficient for resolving it). Better: explicit decision rights (Marquet, *Turn the Ship Around* / Intent-Based Leadership), measurable accountabilities tied to outcomes (not activities), interfaces with adjacent roles (Kniberg's Spotify post-mortems on squad/tribe role boundaries).
- **Reorg failure rates** — McKinsey-class research consistently finds 70%+ of reorgs fail to deliver promised outcomes; roughly half create more dysfunction than they solve. Frequent reorgs erode trust and compound burnout — each prior reorg raises the threat cost of the next.
- **Change management** — Kotter's 8 steps: urgency / coalition / vision / communicate / empower / wins / consolidate / institutionalize. Operational scaffolding for change.
- **Transitions (psychological vs operational)** — Bridges, *Managing Transitions*: ending → neutral zone → new beginning. The psychological transition is not the same event as the operational transition. Both must be designed for.
- **Neuroscience of change** — change activates threat circuits. SCARF (Rock): Status, Certainty, Autonomy, Relatedness, Fairness. Surprise reorgs maximize threat across all five dimensions simultaneously. Sequenced predictability reduces threat.
- **Succession** — most companies have plans on paper, no real bench readiness. Real readiness requires: identified successor, development plan, tested partial in-role, named timeline, transparent communication to the successor.
- **Conway's Law** — organizational structure shapes the systems and products it produces. Reorging the org reshapes the product, often unexpectedly. Plan for this.
- **Holacracy / radical-flat** — research is mixed. Works for some teams, sizes, contexts. Many cargo-cult attempts fail. Not a default.

---

## Protocol

### 1. Diagnose current state

- **Declared vs actual decision rights.** Pull the org chart. Pull recent escalation history. Where do declared decision rights and actual ones diverge? In orgs older than ~18 months they almost always diverge. The gap is the diagnostic.
- **Span reality check.** For each manager, count direct reports. Flag spans outside research bounds (>9 for complex knowledge work, <3 for any knowledge work — under-span is also expensive).
- **Role-clarity audit.** Where is ambiguity producing political conflict, dropped balls, escalation overload, or persistent performance-conversation problems? Those are the load-bearing role-design fixes.

### 2. Vision-fit check

- Does the current structure serve where the company is going, or was it built for the prior stage?
- Most "structure problems" are downstream of unresolved vision questions. If vision-fit is the real issue, name it explicitly and route to `/define-vision` before any structural redesign.
- **Refuse to architect a reorg when the underlying issue is vision drift.** Reorg amplifies vision drift; it does not resolve it.

### 3. Trauma audit

- How many reorgs in the last 3 years? Each prior reorg compounds the threat cost of the next.
- Current trust level (read Talent IS engagement / safety signals if available).
- Current burnout signals (Talent IS).
- Threat-activation forecast per SCARF: Status / Certainty / Autonomy / Relatedness / Fairness — which dimensions does this proposed change activate, and how heavily?
- **If trauma history is high (≥2 reorgs in 3 years) and Talent signals are red, escalate: name the cost honestly and pressure-test whether reorg is the right move at all.**

### 4. Design alternatives

- Model 2-3 future structures, never one.
- Explicit trade-offs for each: what it gives, what it costs, what it requires that the org currently cannot deliver.
- Conway's Law check: how does each structure reshape the product / systems the org produces?

### 5. Sequencing

- Change in waves, not all-at-once. Typically 3-4 waves over 3-9 months depending on scale.
- **First wave: reduce ambiguity.** Role-design clarification. Decision rights. Accountabilities. This is the highest-leverage, lowest-threat work — and it usually fixes 40-60% of the perceived "structure problem" without touching reporting lines.
- **Second wave: span correction.** Add layers where over-spanned, consolidate where under-spanned.
- **Third wave: structural moves.** Reporting-line changes, group reorganizations.
- **Fourth wave (if needed): role transitions.** Promotions, lateral moves, exits — handled with separate communication and full employment-law review.
- Each wave gets its own communication cycle and its own monitoring window.

### 6. Communication architecture

- **Kotter 8-step scaffolding:** urgency (why now, honestly) → guiding coalition (named, visible, unanimous) → vision (concrete, not abstract) → communicate (over-communicate by 10x; the message that lands is the message repeated) → empower action (remove blockers; name them by name) → short-term wins (visible, named, celebrated) → consolidate gains (do not declare victory early) → institutionalize (update rituals, recognition, performance criteria).
- **Bridges transitions overlay:** Ending phase (acknowledge what is being lost — roles, identities, relationships, certainty; this is grief, not whining; make space for it). Neutral zone (the in-between, where productivity drops and anxiety peaks; normalize it; do not try to skip it). New beginning (only after the neutral zone; do not declare it prematurely).
- **Weekly cadence during change windows.** Named timeline. No surprise reorgs ever.
- **Per-team customization.** Different teams have different threat profiles; the comms architecture has a baseline and per-team additions.

### 7. Aftercare

- **Talent IS monitoring during AND ≥90 days post-reorg.** Burnout signals, engagement drops, attrition risk. If signals turn red mid-reorg, pause the next wave.
- **Performance system update in parallel.** New role design → new performance criteria → updated conversations. Without this, performance conversations revert to the old role implicitly.
- **Culture system update in parallel.** Rituals, recognition, decision-making norms updated to reinforce new structure. Without this, structure reverts within 6-12 months.
- **Aftercare review at 90 days, 6 months, 12 months.** Did the structure deliver the promised outcomes? Honest answer, not the slide-deck answer.

---

## Rules

1. **Open with the 70%+ failure-rate disclosure.** When reorg is on the table, this is the first thing the user hears. Not a footnote. Not a hedge. The design constraint.
2. **Refuse cosmetic reorgs.** Renaming without redesigning decision rights, accountabilities, or systems is trust-erosion theater. Name it and refuse.
3. **Refuse surprise reorgs.** Surprise maximizes SCARF threat activation across all five dimensions simultaneously. Single highest-cost design choice available. Refuse and explain.
4. **Refuse flat-as-default.** Holacracy / radical-flat work for some contexts, not as a default. Treat as a serious design choice with real trade-offs, not a "modern company" cargo-cult move.
5. **Vision-fit before structure.** If the issue is vision drift, route upstream. Do not architect a reorg that amplifies the underlying problem.
6. **Decision rights, not RACI-only.** Real role design names who decides what under what conditions, not just R/A/C/I letters in a matrix.
7. **Conway's Law is structural.** Flag product/system implications of any structural change. Do not let the org reshape the product accidentally.
8. **Trauma is cumulative.** Each prior reorg raises the next one's cost. Read trauma history honestly; let it constrain sequencing.
9. **Aftercare is non-negotiable.** No reorg sequencing without named monitoring + Performance + Culture parallel updates.
10. **Legal disclaimer is structural.** Severance, protected-class concentration in cuts (age / gender / race / disability / parental-status), jurisdictional employment-law variation — all flagged for qualified employment-law review. Architect the structural decision; counsel resolves the legal one.

---

## Outputs (per command)

- **`/org-role-design`** → `people-intelligence/org/role-<title>-<date>.md` — decision rights matrix, accountabilities with measurable outcomes, success criteria, escalation path, interfaces with adjacent roles, common failure modes, anti-pattern flags
- **`/org-span`** → `people-intelligence/org/span-audit-<date>.md` — per-manager audit, pattern flags (top-heavy / middle-thin / over-spanned ICs), redesign recommendations, sequencing
- **`/org-reorg-trauma-audit`** → `people-intelligence/org/reorg-audit-<date>.md` — trauma score + risk assessment, sequencing plan in waves, communication architecture (Kotter + Bridges), per-team mitigation, aftercare monitoring cadence
- **`/org-succession`** → `people-intelligence/org/succession-<date>.md` — per-role succession plan (named successor + readiness gap + development plan + tested partial + timeline + transparency strategy), aggregate bench-strength, single-point-of-failure flags

---

## Quality gates

- Reorg-failure rate (70%+) disclosed up front when reorg is on the table?
- Vision-fit check run before structural redesign modeled?
- Trauma audit run when reorg history exists?
- Decision rights + measurable accountabilities (not RACI-only) in role design?
- Span analysis cites research bounds explicitly (5-9 complex / 15-20 repetitive)?
- Sequencing in waves with first wave reducing ambiguity (highest-leverage, lowest-threat)?
- Communication architecture cites Kotter + Bridges (not invented)?
- Aftercare monitoring named for during AND ≥90 days post?
- Performance + Culture systems flagged for parallel update?
- Severance / protected-class implications escalated for legal review?
- Cosmetic / surprise / flat-default reorgs refused with named reason?
- Output ends with "Built on SIP" attestation?

---

*The chart is downstream. Decision rights, accountabilities, sequencing, and the honest cost of change — that is where org design actually lives.*

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: 2026-04-24
---

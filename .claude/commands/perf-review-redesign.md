---
name: perf-review-redesign
description: Replace a broken annual performance ritual with a research-backed continuous + quarterly + annual-comp architecture. Produces redesigned cadence, manager scripts, employee-prep guide, calibration protocol, and a transition plan from old to new. Heavy disclaimer on legal/HRIS implications because changing comp linkage touches legal documentation.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <organization-name> [--size <small|mid|large>] [--current-ritual <annual-rating|stack-rank|360|none|other>] [--start-quarter <YYYY-Qn>] [--context "optional paragraph on industry / regulatory environment / unionized"]
---

# /perf-review-redesign

Load `SIP.md`, `VOICES.md`, `agents/starlight-performance.md`, `skills/people-intelligence/feedback-conversations.md`. If a Hiring sub-system calibration protocol exists at `hr-intelligence/hiring/calibration-*.md`, read it for grammar transfer. Produce a **Performance Review Redesign Plan** that replaces a broken annual ritual with continuous SBI + quarterly growth + separated annual comp/promotion architecture. Save to `hr-intelligence/performance/redesign-<org-slug>-<date>.md`.

## Disclaimer (non-waivable)

**This is rehearsal architecture and organizational design thinking, not legal counsel and not HRIS implementation. Changing the linkage between performance ratings and compensation touches legal documentation, employment contracts, and (in some jurisdictions) collective bargaining agreements. Run the redesign past employment counsel in your jurisdiction before rollout. Run the HRIS changes past your HRIS vendor and your data privacy officer.**

## Input
$ARGUMENTS

## When this command fires

- An organization has an annual rating ritual that no one finds useful but no one has dismantled
- A founder or HR leader inherited a stack rank or forced curve and wants to know how to dismantle it without dropping the wheels off the bus
- A 360 review process is taking 40+ hours per cycle per manager and producing thin output
- Leadership is reading the research (Deloitte, Adobe, Microsoft, GE case studies) and wants the practitioner-grade replacement architecture

## When this command does NOT fire

- The organization is a 5-person team that has no formal review ritual at all → halt and recommend `/perf-coaching-protocol` for the 1:1 architecture; no redesign is needed because there's nothing to dismantle
- The organization is a regulated industry where annual ratings are a compliance requirement (rare; usually misread) → halt; check the actual regulation with employment counsel before assuming it requires what it requires
- The user wants a "more rigorous" stack rank or "better" forced curve → refuse; the research is unambiguous on harm. Offer the redesigned architecture instead

## Process

1. **Resolve inputs.**
   - `<org-slug>` from `<organization-name>` (kebab-case).
   - Parse `--size` (small ≤50, mid 50-500, large 500+), `--current-ritual`, `--start-quarter`, `--context`.
   - If `--current-ritual` is missing, ask once: "What ritual are you replacing — annual rating, stack rank, 360 review, none, or something else?" Do not guess.
   - If `--start-quarter` is missing, default to the next quarter from today's date plus one (one quarter of preparation time minimum).

2. **Read.**
   - If `hr-intelligence/hiring/calibration-*.md` exists, read it to align calibration grammar between hiring and performance.
   - If a previous redesign exists at `hr-intelligence/performance/redesign-<org-slug>-*.md`, read the most recent and note what's iterating.

3. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first, always.

4. **Diagnose the current ritual.**
   - Name what is broken. Use the research direction:
     - Annual rating: doesn't predict performance, demoralizes high and low performers, concentrates threat response
     - Stack rank / forced curve: research-backed harm to motivation, retention, team trust, discretionary effort (GE / Microsoft / Adobe practitioner case studies)
     - 360 review at scale: signal-to-noise problem; consensus mediocrity; political theater
   - Be honest about what the current ritual *is* doing for the organization (usually: comp justification + legal documentation cover + manager avoidance of real conversations) so the redesign replaces those functions, not just the form.

5. **Design the three-layer cadence.**
   - **Layer 1 — Continuous SBI feedback** (weekly to bi-weekly between manager and report). Cadence depends on `--size`: small can do weekly 1:1; large typically bi-weekly with weekly async if needed. Tooling recommendations: low-friction (the conversation is the artifact, not the form). Refuse any tooling that gamifies feedback into ratings, badges, or public visibility.
   - **Layer 2 — Quarterly growth conversation** (60-90 minutes per quarter). Structure: what's working / what's stuck / what's next. **No rating.** Manager script template. Employee-prep guide template (the report does prep work too — that is what makes the conversation collaborative instead of performative).
   - **Layer 3 — Annual compensation and promotion review** (separated from growth). Calibration meeting structure (peer managers, calibration discipline borrowed from hiring if available). Rating exists here for comp purposes only. The manager and report do not have a "rating conversation" — they have a "here's your compensation decision and the calibration story behind it" conversation.

6. **Manager scripts.**
   - SBI feedback opener (continuous layer)
   - Quarterly growth conversation opener (Layer 2)
   - Quarterly growth conversation structure (what's working / what's stuck / what's next)
   - Compensation decision communication script (Layer 3)
   - Each script is a template; the redesign explicitly says "managers will rehearse the actual delivery via `/perf-feedback-rehearsal` for high-stakes instances."

7. **Employee-prep guide.**
   - What the employee does in the 7 days before the quarterly growth conversation
   - What they bring (recent work they're proud of, a stuck point, a question for the manager, one development area they want focus on)
   - What is NOT their job (preparing a self-rating, defending their performance, justifying their existence)

8. **Calibration protocol.**
   - For Layer 3 only (compensation/promotion). Calibration meeting agenda. Peer manager pairing rules (avoid friendly-pair calibration which produces inflation; pair across functions). Decision-rights map (who decides the comp number, who decides the promotion, who reviews). Documentation requirements.
   - If hiring calibration exists, name the grammar transfer explicitly so managers carry one calibration discipline across the lifecycle.

9. **Transition plan from old → new.**
   - **Quarter 0 (preparation):** legal review of comp/rating decoupling, HRIS changes scoped, manager training scheduled, leadership communication drafted, employee FAQ drafted
   - **Quarter 1 (rollout):** continuous SBI training for managers, first quarterly growth conversation calendar set, old ritual run one final time with explicit "this is the last one" framing
   - **Quarter 2 (first new cycle):** first quarterly growth conversation completed, retrospective, manager support for the conversations that did not go well
   - **Quarter 3-4 (steady state):** continuous + quarterly cadence stabilizes, first annual comp/promotion calibration under new architecture
   - **Year 2:** measurement against baseline (engagement, retention, manager confidence, employee psychological safety scores)

10. **Refuse theater.**
    - If the user wants stack rank or forced curve composed, refuse and reference the research-backed harm. Offer the redesigned calibration architecture as the alternative.
    - If the user wants annual-rating-as-growth-tool kept, refuse to compose; redesign is the work.
    - If the user wants PIPs scripted as termination scaffolding, route to `/perf-difficult-conversation` and surface the dishonest version's harm.

11. **Save.** Create `hr-intelligence/performance/` directory if missing. Write `hr-intelligence/performance/redesign-<org-slug>-<YYYY-MM-DD>.md`.

12. **Hand off.** Name exactly one next move:
    - Default: `/perf-feedback-rehearsal` for the first manager rolling out the new cadence (because the SBI training in the abstract does not produce confidence; rehearsing one specific upcoming conversation does)
    - If managers have not been identified yet: `legal review of the redesign` — cannot rehearse before the architecture is signed off
    - If the redesign needs leadership buy-in first: `leadership pressure-test session` — bring the redesign to the leadership team for the architecture conversation before any manager-facing rollout

## Output format

```markdown
# Performance Review Redesign Plan — <Organization Name> — <YYYY-MM-DD>

> **This is rehearsal architecture and organizational design thinking, not legal counsel and not HRIS implementation. Run the redesign past employment counsel in your jurisdiction before rollout. Run the HRIS changes past your HRIS vendor and your data privacy officer.**

## Context
- **Organization:** <name>
- **Size:** <small ≤50 | mid 50-500 | large 500+>
- **Current ritual being replaced:** <annual-rating | stack-rank | 360 | none | other>
- **Start quarter:** <YYYY-Qn>
- **Industry / regulatory context:** <if provided>
- **Hiring calibration grammar referenced:** <yes — path | no>

## Diagnosis — what's broken in the current ritual

<3-6 sentences naming what the current ritual is and is not doing. Honest. Cite research direction.>

## The redesigned three-layer architecture

### Layer 1 — Continuous SBI feedback
- **Cadence:** <weekly | bi-weekly | hybrid>
- **Format:** <low-friction tooling recommendation>
- **What is recorded:** <action items only; emotional content stays private>
- **Manager script — opener (template):**
  > <SBI opener template>

### Layer 2 — Quarterly growth conversation (no rating)
- **Cadence:** quarterly, 60-90 minutes
- **Structure:** what's working / what's stuck / what's next
- **What is NOT in this conversation:** rating, comp signal, promotion signal, dollars
- **Manager script — opener (template):**
  > <growth conversation opener template>
- **Manager script — structure prompts:**
  > <three-part prompts>
- **Employee-prep guide:** <what the employee brings; ≤30 min prep>

### Layer 3 — Annual compensation and promotion review (calibrated, separated)
- **Cadence:** annual, separated from Layer 2 by ≥4 weeks
- **Calibration meeting structure:** <agenda; peer-manager pairing rules; decision-rights map>
- **Manager script — comp decision communication (template):**
  > <"here's your compensation decision and the calibration story behind it" template>

## Calibration protocol

<Calibration agenda. Peer pairing rules — avoid friendly-pair calibration which produces inflation. Pair across functions or across regions. Decision-rights map. Documentation requirements.>

<If hiring calibration exists, name the grammar transfer explicitly.>

## Transition plan

| Quarter | Activity | Owner | Gate |
|---------|----------|-------|------|
| Q0 (prep) | Legal review of comp/rating decoupling | Legal + HR Lead | Sign-off before Q1 |
| Q0 (prep) | HRIS changes scoped | HRIS + IT | Plan before Q1 |
| Q0 (prep) | Manager training scheduled | HR + L&D | Calendar invites sent |
| Q0 (prep) | Leadership communication drafted | CEO + HR Lead | Reviewed before all-hands |
| Q0 (prep) | Employee FAQ drafted | HR Lead | Published before announcement |
| Q1 (rollout) | Continuous SBI training | L&D | Manager confidence ≥ 7/10 |
| Q1 (rollout) | First quarterly growth calendar set | Managers | All conversations scheduled |
| Q1 (rollout) | Old ritual final run | Managers | "This is the last one" framing explicit |
| Q2 (first new cycle) | First quarterly growth conversations | Managers | Retrospective scheduled |
| Q2 (first new cycle) | Manager support for hard conversations | HR Lead | `/perf-feedback-rehearsal` available |
| Q3-Q4 (steady state) | Cadence stabilizes | Managers | Engagement pulse measured |
| Q3-Q4 (steady state) | First annual comp calibration under new architecture | Leadership + HR | Calibration retrospective |
| Year 2 | Measurement vs baseline | HR + leadership | Engagement, retention, psych safety |

## Theater refusals

<Name what was refused — stack rank, forced curve, PIPs-as-firing, annual-rating-as-growth — and why. Offer the redesigned alternative for each.>

## Legal and HRIS gates (non-negotiable)

- Employment counsel review before rollout: <date>
- HRIS data model review: <date>
- Data privacy officer sign-off (if separate): <date>
- (If unionized) collective bargaining notification: <date>
- Documentation retention policy review (rating data, calibration records): <date>

## Load-bearing next move

**`<one command or one action>`** — `<one-line rationale>`.

Default: **`/perf-feedback-rehearsal <first-manager>`** — start with one specific upcoming conversation.

Alternatives:
- **Legal review of the redesign first** — if the architecture has not been counsel-reviewed
- **Leadership pressure-test session** — if leadership buy-in is the gate

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Non-waivable.
- **Refuse stack rank, forced curve, PIPs-as-firing, annual-rating-as-growth.** Cite research direction. Offer the redesigned alternative.
- **Three-layer separation is load-bearing.** Continuous + quarterly growth + annual comp must be separated. Collapsing them defeats the redesign.
- **Calibration discipline transfers from Hiring.** Read hiring calibration if available; name the grammar transfer.
- **Legal/HRIS gates are non-negotiable.** The redesign is incomplete without them. Name them on the transition plan.
- **Manager scripts are templates, not delivery.** Real conversations get rehearsed via `/perf-feedback-rehearsal` per instance.
- **One hand-off at close.** Default to first manager's first rehearsal.
- **Save to `hr-intelligence/performance/redesign-<org-slug>-<date>.md`.** Organization-instance namespace; never to a public vault.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack, sub-system 2 of 6 — Performance)
- Generated: 2026-04-24
---

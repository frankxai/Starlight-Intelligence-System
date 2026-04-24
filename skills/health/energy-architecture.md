---
name: health/energy-architecture
domain: health
description: Map energy availability across five dimensions, detect leaks, and architect energy around creative peaks. Powers /energy-audit and informs every regimen designed via /design-regimen.
triggers:
  keywords: ["energy", "energy crash", "tired", "fatigue", "burnout", "focus", "flow", "crash", "afternoon slump", "morning energy", "caffeine", "blood sugar", "creative peak", "deep work", "cognitive capacity"]
  agents: ["starlight-embodiment"]
  intents: ["energy-audit", "optimization", "flow-protection"]
priority: high
load_level: core
---

# Energy Architecture

> *"You cannot outwork a leaking substrate. Audit first, architect second."*

## Purpose

Energy is the currency every creative, intellectual, and physical act spends. Most people treat energy as weather — something that happens to them. It is not weather. It is an architecture — the product of sleep, nutrition, training, stress, light exposure, social load, nervous-system state, and protocol. Architecture can be audited. Leaks can be named. Peaks can be protected. Creative peaks can be aligned with energy peaks instead of fighting them.

This skill is the diagnostic half of the HIS substrate. Where `health/body-substrate` designs the integrated regimen, this skill maps the energy economy first — when is energy high, when does it crash, where is it leaking, and how does the current regimen architecture distribute it across the week. A regimen designed on top of an un-audited energy map is guessing. Audit first.

The bias is empirical and specific. "I'm tired" is not a data point. "Energy rating 2/5 every Tuesday afternoon after the 11 AM meeting" is a data point. Specificity unlocks intervention.

## Activation

**Fires when:**
- `/energy-audit` is invoked
- `/design-regimen` runs — audit is a prerequisite step
- User reports chronic fatigue, predictable energy crashes, burnout symptoms, flow-state collapse, inability to sustain creative work
- `starlight-embodiment` agent activates for any diagnostic pass
- Returning user runs a quarterly energy re-audit

**Does NOT fire when:**
- User reports fatigue with medical red flags (persistent fatigue surviving sleep correction, unexplained weight loss, chronic pain, symptoms suggesting underlying condition) → defer to clinician
- User wants workout programming → `gym-training-expert`
- User wants macro calculation → `health-nutrition-expert`

## Five Energy Dimensions

Energy is not one thing. Audit along all five:

1. **Physical** — stamina for movement, somatic readiness, strength-output capacity
2. **Mental** — focus, working memory, executive function, decision quality
3. **Emotional** — regulation, resilience, mood stability, capacity to handle friction
4. **Creative** — generative capacity, flow availability, pattern recognition, synthesis bandwidth
5. **Social** — capacity for presence with others, reading the room, replenishment vs drain from interaction

Peaks and crashes in each dimension can be independent. Someone can have high physical energy and crashed creative energy at 6 PM — common after a long deadline push. The dimensions must be audited separately or the diagnosis collapses into "tired."

## Common Energy Leaks

Named sources of predictable energy drain. Most regimens have at least two.

**Sleep leaks:**
- Inconsistent wake time (more than 60-min variance across week)
- Inconsistent bedtime
- Screen exposure in the final hour
- Alcohol within 3h of bed (suppresses REM)
- Late heavy meals (digestion competes with sleep quality)

**Nutrition leaks:**
- Caffeine after early afternoon (half-life 5-6h; late caffeine pushes sleep later; per sleep-research consensus)
- Chronic under-eating relative to output (under-recovery via calorie deficit)
- Low protein (impairs recovery, satiety, and lean mass maintenance)
- Blood-sugar volatility from low-fiber refined carb meals during high cognitive demand
- Alcohol — disrupts sleep architecture and adds inflammatory load

**Training leaks:**
- Training at the creative peak window (training eats the peak)
- Under-recovered repeated sessions (chronic fatigue accumulates)
- Over-training without de-load (see Selye's general adaptation syndrome — exhaustion phase)
- Training type mismatch to life stress load (high-volume conditioning during launch crunch)

**Stress leaks:**
- No stress-output practice (input with no discharge accumulates as chronic activation)
- Social obligations that drain without replenishment
- Financial, caregiving, or work stressors with no protected recovery windows
- Context-switching — research shows sustained context-switching degrades executive function; see Mark et al. on attention residue

**Environmental leaks:**
- Low morning light exposure (disrupts circadian anchoring; see Huberman/Walker research on morning sunlight)
- Sedentary day without movement breaks
- Chronic indoor air / no outdoor time
- Over-consumption of algorithmic content (cognitive load without output)

## Protocol

### Step 1 — Seven-day log

User rates energy hourly across the five dimensions for seven days. Each rating is 1-5.

Format: `Tue 14:00 — Physical 3, Mental 2, Emotional 4, Creative 2, Social 3. Post-lunch, before the standup.`

Context matters. The log captures the action or context at each rating — food, caffeine, training, meeting, deep work, social contact, sleep quality the prior night. Seven days is the minimum to catch weekly rhythm.

### Step 2 — Heat-map assembly

Plot the log as a weekly heat map — day × hour × dimension. Visual or table form. Look for:

- **Peaks** — when does each dimension hit 4 or 5? What precedes those peaks?
- **Crashes** — when does each dimension hit 1 or 2? What precedes those crashes?
- **Dead zones** — times when most dimensions are below 3; usually recoverable via regimen
- **Stacked peaks** — times when multiple dimensions peak together; these are flagship creative windows

### Step 3 — Leak identification

Read the heat map against the common leak list. For every predictable crash, name the leak that most likely caused it.

Example:
- Crash at Tue 14:00 across Physical + Mental + Creative → likely post-lunch blood-sugar volatility + inadequate sleep Mon (check log)
- Crash at Fri 17:00 across Emotional + Social → accumulated social load across week; no mid-week recovery
- Crash at Mon 09:00 across all five → weekend wake-time drift (social jet lag); inconsistent light anchoring

One leak per crash, ranked by confidence.

### Step 4 — Fix ranking

For every leak identified, propose one fix. Rank by impact × effort:

- **High impact, low effort** — ship immediately (e.g., consistent wake time across week; caffeine cutoff at noon)
- **High impact, medium effort** — ship within two weeks (e.g., protein target adjustment; evening screen protocol)
- **High impact, high effort** — design into next regimen revision (e.g., training schedule shift; stress-output practice introduction)
- **Low impact, low effort** — bundle with others
- **Low impact, high effort** — defer or drop

User picks 2-3 fixes to ship this week. Not 20. Cognitive load is itself an energy leak.

### Step 5 — Peak protection

Name the peaks. Architect protection around them.

If creative peak is Tue/Wed 09:00-11:00:
- No meetings before 11:00 Tue/Wed
- No caffeine after 12:00 Mon/Tue (protect sleep that sets up the peak)
- No late social obligations Mon/Tue evening
- Training earlier in the day on those mornings, or on alternate days
- Protein + moderate-fiber breakfast 60-90 min before peak window

Peak protection is architectural. The peak happens because the 24h before it was designed for it.

### Step 6 — Quarterly re-audit

Energy architecture drifts. Re-audit every quarter or when life structure changes materially (new job, caregiving load shift, move, relationship change, major launch, illness recovery). The log is cheap. The regimen built on a stale log is expensive.

## Output shape

Audit documents go to `health/audit-<person-slug>-<date>.md` (see `/energy-audit` for schema). Heat map, leaks ranked, fixes ranked, peaks named, non-medical disclaimer, "Built on SIP" block.

## Rules

1. **Never medical advice.** Persistent fatigue, unexplained crashes, symptoms that survive regimen correction → defer to clinician. Energy architecture is self-audit, not diagnosis.

2. **Empirical over narrative.** "I'm tired" is not a data point. A seven-day log is. Do not generate an audit without a log.

3. **Specificity unlocks intervention.** Name the leak in domain, time, and context. "Post-lunch crash Tue/Thu after starchy meal + no walk" beats "afternoon slump."

4. **Fix load is itself a leak.** Ship 2-3 fixes per cycle. Not 20. The person doing the work is the same person whose energy is the problem.

5. **Evidence direction required.** When citing a specific mechanism (e.g., caffeine half-life, morning sunlight circadian anchoring, protein satiety), name the research direction. "Per sleep-research consensus" or "per Huberman/Walker on circadian anchoring."

6. **Compose with body-substrate.** This skill diagnoses; `health/body-substrate` architects the regimen that fixes. The handoff is designed in — every audit ends with a named next move.

7. **Sovereignty is non-waivable.** Energy map is the person's. Do not retain personal energy data in public vaults. `health/` namespace stays instance-local.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (energy map is personal data; local-only)
- File contract (`health/audit-<slug>-<date>.md`)
- Attestation (every audit ships with "Built on SIP" + non-medical disclaimer)
- Voice archetypes (implementer primary, overseer synthesis)
- Composition (feeds `health/body-substrate` for regimen design)

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype, composition]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: 2026-04-24
---

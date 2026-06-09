---
name: health/body-substrate
domain: health
description: Integrate training, nutrition, sleep, recovery, and stress into a coherent regimen that sustains creative and intellectual output across decades. Composes with gym-training-expert and health-nutrition-expert for domain specifics. Powers /design-regimen and the Embodiment agent.
triggers:
  keywords: ["body", "training", "nutrition", "sleep", "energy", "burnout", "recovery", "regimen", "habits", "stress", "substrate", "fitness", "diet", "lifting", "strength", "cardio", "rest", "de-load", "deload", "recovery day"]
  agents: ["starlight-embodiment"]
  intents: ["regimen-design", "embodiment", "substrate-architecture", "health"]
priority: high
load_level: core
---

# Body Substrate

> *"Body is the substrate of every creative act. A broken substrate breaks everything above it."*

## Purpose

Body substrate is the physical layer that carries every framework, every ship, every output. Most regimen advice operates in one domain at a time — a training program, a meal plan, a sleep protocol, a stress-management book. Each is correct in isolation and useless in isolation, because the body is not four separate systems. It is one system with four inputs. Training on 5-hour sleep is negative transfer. A perfect diet colliding with chronic work stress is inflammation theater. Sleep hygiene without stress-output architecture is a closed valve on a running tap.

This skill is the integration layer. It composes with `gym-training-expert` for training science and `health-nutrition-expert` for nutrition science — it does not duplicate them. Its job is the joints between domains. Where does the training load meet the sleep debt? Where does the nutrition strategy meet the work stress load? Where does the de-load cycle meet the launch calendar?

The bias is long-game. Regimens that compound creative output across decades over regimens that optimize for a quarter. Sustainable over extreme. Evidence-based or silent. Refuse fad protocols. Respect existing conditions. Consult disclaimers where required.

## Activation

**Fires when:**
- `/design-regimen` or `/energy-audit` is invoked
- User mentions energy crash, burnout, unsustainable output, training design, nutrition strategy, sleep architecture, recovery, stress, de-load
- `starlight-embodiment` agent activates
- Returning user reviews an existing regimen or plans a de-load cycle

**Does NOT fire when:**
- Single-domain training question with no system context → route to `gym-training-expert`
- Single-domain nutrition question with no system context → route to `health-nutrition-expert`
- Medical symptom, chronic condition, injury diagnosis, medication question → defer to clinician; do not engage

## Protocol

### Step 1 — Energy audit

Map when the person's energy is high and low across a typical week. Five dimensions:

- **Physical** — stamina, strength, somatic readiness
- **Mental** — focus, working memory, executive function
- **Emotional** — regulation, resilience, mood stability
- **Creative** — generative capacity, flow availability, pattern recognition
- **Social** — capacity for presence with others, replenishment vs drain

Ask the person (or read from a completed `/energy-audit` file):
- When in the week does each dimension peak?
- When does each crash?
- Do creative peaks align with energy peaks, or fight them?
- Which crashes are predictable (Monday morning, Wednesday afternoon, Sunday evening)?

Record as a weekly heat map. Peaks and crashes are both signal.

### Step 2 — Current regimen audit

Map the person's current state across five input domains. No judgment, just mapping.

- **Training** — frequency, style (strength / cardio / mixed / none), volume, intensity, last injury
- **Nutrition** — eating pattern, protein intake, hydration, alcohol, caffeine, last major dietary change
- **Sleep** — average hours, bedtime consistency, wake time consistency, sleep quality (subjective), screen exposure in final hour
- **Stress** — work load, caregiving load, financial stress, social obligations, creative deadline pressure
- **Recovery** — rest days per week, de-load cadence, time outdoors, nervous-system practices, vacation per year

Use specific numbers where possible. "Eat clean" is not a data point. "~140g protein/day across 3 meals" is a data point.

### Step 3 — Alignment check

Read current regimen against energy audit. Does the regimen support or sabotage the person's genius work?

Common misalignments to look for:
- Creative peak at 8 AM + regimen puts training at 7 AM → training eats the peak
- Caffeine after 2 PM + chronic sleep debt → feedback loop
- 6-day training + knowledge work + single rest day → under-recovered
- Long fast during highest cognitive demand window → hypoglycemia hits flow
- Socially exhausting workweek + no recovery protocol → emotional crash by Friday
- Perfect training + chronic 5-hour sleep → negative transfer; the training load cannot recover

Name the misalignments in specific, empirical terms. One line each.

### Step 4 — Gap identification

Where is the regimen incomplete or counter-productive?

- Missing inputs: no resistance training, no protein target, no sleep protocol, no stress-output practice
- Counter-productive inputs: late caffeine, alcohol as stress-output, over-training, under-recovery, chronic under-eating
- Missing cycles: no weekly rest day, no quarterly de-load, no annual vacation longer than a weekend

Rank gaps by impact × effort. High impact + low effort goes first. The person needs 2-3 wins early, not a 20-point plan.

### Step 5 — Regimen architecture

Design an integrated weekly template that matches the person's actual life. Not a fantasy athlete program.

Compose with:
- `gym-training-expert` for training program detail (exercises, sets, reps, progression)
- `health-nutrition-expert` for nutrition strategy detail (macro targets, meal timing, longevity protocols)

The regimen names:
- Training days + style + approximate duration
- Rest days (weekly and quarterly de-load)
- Nutrition strategy with target macros (e.g., "~0.8g protein/lb body weight per hypertrophy research consensus")
- Sleep protocol (bedtime, wake time, hygiene rules)
- Stress-output practice (walk, breathwork, time outdoors, creative play — something that discharges load)
- Quarterly de-load week
- Annual vacation cadence

Every element is named. "Eat well" and "sleep enough" are not architecture.

### Step 6 — Protocol + check-ins

Name what to track and the review cadence.

Weekly track:
- Sleep hours (average)
- Training sessions completed (planned vs actual)
- Energy rating across five dimensions (1-5 subjective)
- One early-warning signal per domain

Review cadence:
- **Weekly** — 10-minute self-check: what moved, what slipped, one fix for next week
- **Monthly** — 30-minute regimen review: is it still fitting life, or has life changed?
- **Quarterly** — de-load week plus full regimen rewrite if needed

Early-warning signals (non-medical, self-audit level):
- Training: two missed sessions without a clear reason
- Nutrition: three days of under-eating or over-relying on caffeine
- Sleep: three nights under 6h in a row
- Stress: sustained irritability or flat affect beyond three days
- Recovery: skipping the rest day because "I feel fine"

Any of these triggers a check-in, not a diagnosis.

## Output shape

Regimen documents go to `health/regimen-<person-slug>.md` (see `/design-regimen` for full schema).
Audit documents go to `health/audit-<person-slug>-<date>.md` (see `/energy-audit` for full schema).

Both include the non-medical disclaimer, the five input domains, the weekly template, and the "Built on SIP" attestation block.

## Rules

1. **Never medical advice.** Regimen architecture is not diagnosis, treatment, or prescription. Every output carries the disclaimer. When a user reports a symptom, chronic condition, injury, medication interaction, or mental-health signal, defer to a qualified clinician. Do not engage. Do not suggest. Defer.

2. **Evidence-based only.** When a specific number is cited, cite research direction alongside it. "0.8g protein/lb body weight" → "per hypertrophy research consensus, see Schoenfeld et al." No invented claims, no cherry-picked studies, no bro-science.

3. **Refuse fad protocols** unless research supports them for the person's context. Refuse by default:
   - Keto-only diets without medical indication (epilepsy, specific metabolic conditions)
   - Extreme intermittent fasting (under 6h eating windows) as default protocol
   - Carnivore-only diets
   - Under-4h-sleep hustle culture
   - Under-eating chronically for body composition
   - Cleanses, detoxes, and juice protocols
   - Blood-sugar-panic around moderate-carb meals for healthy adults
   Accept if: user has a specific medical indication, existing research consensus supports it for their context, and a clinician is involved.

4. **Compose, do not duplicate.** This skill does not replicate `gym-training-expert` or `health-nutrition-expert`. It integrates them. When training program detail is needed, route. When nutrition program detail is needed, route. The integration is the unique value.

5. **Sustainable over extreme.** Every regimen must survive a bad week (travel, illness, family event, launch crunch). If it cannot, it is not architecture — it is a fantasy. Rewrite until it holds.

6. **De-load is non-negotiable.** Every regimen has a quarterly de-load week built in. Not optional. The output compounds only if recovery is designed in.

7. **Respect existing conditions.** If the user mentions a chronic condition, injury, medication, or clinician-supervised protocol, work around it. Do not override. Flag the interaction to the user and suggest they confirm with their clinician.

8. **Sovereignty is non-waivable.** The body is theirs. Regimen is an instrument they operate. They delete, modify, or walk away at will. Starlight compounds via attestation, not control.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, body-layer; enforced at Rule 8)
- File contract (`health/` namespace, `regimen-<slug>.md` and `audit-<slug>-<date>.md`)
- Attestation (every regimen and audit ships with "Built on SIP" block + non-medical disclaimer)
- Voice archetypes (`VOICES.md`) — implementer primary, sovereign-creator secondary
- Composition (composes with `gym-training-expert`, `health-nutrition-expert`; does not duplicate)

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype, composition]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: 2026-04-24
---

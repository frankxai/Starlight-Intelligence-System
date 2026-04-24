---
name: design-regimen
description: Design an integrated weekly regimen — training, nutrition, sleep, stress, recovery — matched to the person's actual life. Composes with gym-training-expert and health-nutrition-expert for domain detail. Produces a sustainable architecture, not an extreme program. Not medical advice.
allowed-tools: Read, Write, Grep, Glob, Skill
argument-hint: <person-name> [--audit health/audit-<slug>-<date>.md] [--genius genius/profile-<slug>.md] [--life-stage sedentary|active|athlete]
---

# /design-regimen

Load `SIP.md`, `VOICES.md`, `agents/starlight-embodiment.md`, `skills/health/body-substrate.md`, `skills/health/energy-architecture.md`. Invoke `gym-training-expert` and `health-nutrition-expert` skills for domain specifics. Produce a **Regimen Architecture** — weekly template integrating training + nutrition + sleep + stress + recovery. Save to `health/regimen-<person-slug>.md`.

## Input
$ARGUMENTS

## When this command fires

- A person wants a coherent regimen across training, nutrition, sleep, stress, and recovery.
- They want their physical substrate to support creative and intellectual output, not fight it.
- They want long-game architecture, not a 90-day transformation program.
- A `/energy-audit` has been completed (strongly preferred) and the map is available.

## When this command does NOT fire

- User has an active medical condition, injury, or clinician-supervised protocol that requires medical guidance → halt and defer.
- User wants single-domain advice (training only, nutrition only) → route directly to `gym-training-expert` or `health-nutrition-expert`.
- User wants fad protocol (keto-only without indication, under-4h sleep, extreme IF) → refuse and explain why.

## Process

1. **Resolve inputs.**
   - `<person-slug>` from `<person-name>` (kebab-case).
   - Parse optional `--audit`, `--genius`, `--life-stage` flags.
   - If `--audit` not provided, check for `health/audit-<person-slug>-*.md`. If no audit exists, halt with: `Run /energy-audit <person> first — a regimen without an energy map is guessing. Seven-day log beats seven-minute vibes.`
   - If `--genius` not provided, check for `genius/profile-<person-slug>.md`. Load if present (to align regimen to creative peaks). Proceed without if absent — note that creative-peak alignment is approximate.
   - Default `--life-stage` to the level implied by the audit, or ask the person if ambiguous.

2. **Read the audit.**
   - Extract: peak windows across five dimensions, crash windows, named leaks, ranked fixes.
   - If audit is older than 90 days, halt with: `Audit is stale. Run /energy-audit <person> again before designing — life has moved.`

3. **Safety gate (non-medical deferral check).**
   - Scan inputs for mentions of: chronic pain, diagnosed condition, current medication, injury in last 90 days, pregnancy, eating disorder history, clinician-supervised protocol.
   - If any appear, halt with: `Your context includes <flag>. This system does not design regimens that intersect with clinician care. Confirm with your clinician first; bring their guidance back and we can architect around it.`
   - Do not continue until confirmed.

4. **Invoke domain skills.**
   - `gym-training-expert` — produce training program detail (frequency, structure, progression) matched to `--life-stage` and available time.
   - `health-nutrition-expert` — produce nutrition strategy detail (macro targets, meal pattern, hydration, caffeine, alcohol) matched to goals + life-stage.
   - These are references, not ownership. This command integrates them into the weekly template.

5. **Design weekly template.**
   - 7-day calendar with: training days, rest days, nutrition strategy, sleep protocol, stress-output practice, creative-peak protection windows.
   - Map each element to the person's energy peaks and life structure.
   - Training days align around — not on top of — creative peaks where possible.
   - Sleep protocol has consistent wake time (variance <60 min across week).
   - Nutrition hits the targets from the `health-nutrition-expert` pass. Protein anchor minimum ~0.8g/lb body weight per hypertrophy research consensus for active adults (adjust for goals/indications).
   - Caffeine cutoff at latest 2 PM (half-life 5-6h; sleep-research consensus).
   - Stress-output practice named daily (walk, breathwork, time outdoors, creative play — something that discharges).
   - One full rest day per week minimum.

6. **Design quarterly + annual cycles.**
   - Quarterly de-load week: one week per quarter at ~50% training volume, protected sleep, lighter social load. Built in, non-negotiable.
   - Annual vacation cadence: at least one extended break (≥10 days) per year, with explicit guidance on what to maintain (sleep, protein, movement) and what to loosen (training structure, macro precision).
   - Launch / sprint de-load protocol: if the person has identifiable creative sprints (book launches, product ships, demo crunches), design the pre-sprint taper and post-sprint recovery.

7. **Protocol + check-ins.**
   - Weekly metrics to log: sleep hours, training sessions (planned vs actual), energy rating 1-5 across five dimensions, subjective recovery score, one early-warning flag.
   - Weekly review cadence: 10-min self-check.
   - Monthly regimen review: 30-min — is it fitting life, or has life changed?
   - Quarterly regimen revision: full rewrite if needed.

8. **Sustainability gate.**
   - Run four questions before saving:
     - Can the person do this for a decade, not a quarter?
     - Does it survive a bad week (travel, illness, family event, launch crunch)?
     - Does it have a de-load built in?
     - Does it match their actual life, not a fantasy athlete schedule?
   - If any answer is no, redesign. Do not ship.

9. **Save.**
   - Create `health/` directory if missing.
   - Write `health/regimen-<person-slug>.md`.
   - Include the non-medical disclaimer, the weekly template, the cycles, the check-in cadence, and the "Built on SIP" attestation block.

10. **Hand off.** Name one next move — typically `/energy-audit` in 30 days for re-baseline, or a composition with `/define-vision` if long-game alignment is the next move.

## Output format

```
# Regimen Architecture — <Person Name> — <YYYY-MM-DD> (v1.0)

## Disclaimer
This is not medical advice. It is evidence-based regimen architecture and self-audit framework. Consult a qualified clinician for diagnosis, treatment, injury, chronic condition, medication interaction, pregnancy, or any symptom that suggests a medical boundary. If any element of this regimen causes concerning symptoms, stop and consult your clinician.

## Context
- **Life stage:** <sedentary | active | athlete>
- **Goals:** <named, not "feel better" — e.g., "sustain 4-hour creative peak windows 4 days/week">
- **Constraints:** <time available, equipment access, travel frequency, caregiving load>
- **Audit source:** `health/audit-<slug>-<date>.md`
- **Genius alignment:** <creative peak windows from Profile, if available>

## Creative peaks to protect
<Day + time windows where the person's creative output is highest, from the audit or Genius Profile. These become the architectural anchors — everything else is designed around them.>

## Weekly template

| Day | Training | Nutrition focus | Sleep | Stress-output | Protected peak |
|-----|----------|-----------------|-------|---------------|----------------|
| Mon | <style + duration> | <e.g., protein anchor 140g, 3 meals, caffeine cutoff 14:00> | <bedtime / wake> | <30-min walk 17:00> | <09:00-11:00 deep work> |
| Tue | Rest | ... | ... | ... | ... |
| Wed | ... | ... | ... | ... | ... |
| Thu | ... | ... | ... | ... | ... |
| Fri | ... | ... | ... | ... | ... |
| Sat | ... | ... | ... | ... | ... |
| Sun | Full rest | ... | ... | ... | ... |

## Training program
<From gym-training-expert. Cite source. 3-6 lines covering frequency, split, progression principle, reference load range. Full detail in composed skill output.>

## Nutrition strategy
<From health-nutrition-expert. Cite source. 3-6 lines covering daily target macros (protein g/lb, calories directional, fiber, hydration), meal pattern, caffeine/alcohol guidance. Full detail in composed skill output.>

## Sleep protocol
- Target hours: <7-9h range; name specific target>
- Bedtime: <time>
- Wake time: <time, consistent to within 60 min across week>
- Pre-sleep rules: <screen cutoff, no alcohol within 3h, no heavy meals within 2h>
- Morning anchor: <10-15 min outdoor light within first hour of waking, per circadian research>

## Stress input / output balance
**Inputs (audit):**
- <e.g., 50-hr work week>
- <e.g., caregiving 2 kids>
- <e.g., Q-launch crunch for next 6 weeks>

**Outputs (daily / weekly):**
- Daily: <30-min walk, 10-min breathwork, 15-min outdoor time>
- Weekly: <2h of creative play unrelated to work, 1 rest day, 1 social-replenishment block>
- Monthly: <1 longer outdoor block — half-day minimum>

## Cycles

**Weekly:** One full rest day. No training, reduced structured load.

**Quarterly de-load:** Week <N> of every quarter — training volume cut ~50%, sleep protected, social load reduced, nutrition maintained. Do not skip.

**Annual:** At least one extended break (≥10 days). Maintain sleep, protein anchor, daily movement. Loosen training structure, macro precision.

**Sprint protocol (if applicable):** <Named sprint — e.g., Q3 product launch>. Pre-sprint taper (week -1), sprint load (protected sleep non-negotiable, training ~60%, stress-outputs doubled), post-sprint recovery (week +1 de-load).

## Weekly metrics to log
- Sleep hours (average)
- Training sessions (planned / actual)
- Energy rating 1-5 across: Physical / Mental / Emotional / Creative / Social
- Subjective recovery score 1-5
- One early-warning flag per domain (see body-substrate Step 6)

## Review cadence
- **Weekly** — 10-min self-check: what moved, what slipped, one fix for next week.
- **Monthly** — 30-min regimen review: is it fitting life, or has life changed?
- **Quarterly** — de-load week + full regimen rewrite if needed.

## Refused protocols (for record)
- Keto-only (no medical indication)
- Under-4h sleep regimens
- Extreme intermittent fasting (<6h eating window) as default
- Chronic under-eating for body composition
- Cleanses, detoxes, juice protocols
- Reason: lack of sustainable research support for long-game creative output.

## Next moves
1. `/energy-audit <person>` — re-baseline in 30 days to check regimen-against-map alignment
2. `/define-vision` — if long-game alignment is the next priority, the 30-year arc depends on this substrate
3. `gym-training-expert` — drill deeper into training program detail as needed
4. `health-nutrition-expert` — drill deeper into nutrition strategy detail as needed

**Named next move for this person:** `<one command>` — <one-line rationale>

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, composition]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never medical advice.** Disclaimer is the first section of every regimen. When red flags appear, defer to clinician — halt, do not design around a medical condition unsupervised.
- **Never ship without an audit.** A regimen without a seven-day energy map is guessing. Halt and route to `/energy-audit`.
- **Never ship a fad protocol.** Keto-only, extreme IF, under-4h sleep, chronic under-eating — refused by default. Only accept with specific medical indication and clinician involvement; record the rationale in the output.
- **Always compose.** Pull training detail from `gym-training-expert`, nutrition detail from `health-nutrition-expert`. Do not duplicate their expertise here — integrate.
- **Evidence direction required.** When a specific number is given (protein g/lb, sleep hours, caffeine cutoff), name the research consensus or source direction.
- **Sustainability gate is non-negotiable.** Four questions at Step 8. If any fail, redesign. A regimen that cannot survive a bad week is not architecture.
- **De-load is built in.** Quarterly de-load week is a default in every regimen. Not optional.
- **Sovereignty.** The regimen is the person's. They delete, modify, walk away at will. Starlight compounds via attestation, not control.
- **One next move.** Optionality at handoff corrodes execution. Name exactly one.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, composition]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

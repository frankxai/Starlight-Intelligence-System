---
name: energy-audit
description: Run a week-long energy self-audit across five dimensions (physical / mental / emotional / creative / social). Produces a pattern analysis, leak identification, and fixes ranked by impact × effort. Prerequisite for /design-regimen. Not medical advice.
allowed-tools: Read, Write, Grep, Glob, Skill
argument-hint: <person-name> [--log path/to/log.md | --start-log] [--retroactive]
---

# /energy-audit

Load `SIP.md`, `VOICES.md`, `agents/starlight-embodiment.md`, `skills/health/energy-architecture.md`. Run a seven-day energy self-audit across five dimensions. Produce pattern analysis, leak identification, and ranked fixes. Save to `health/audit-<person-slug>-<YYYY-MM-DD>.md`.

## Input
$ARGUMENTS

## When this command fires

- A person reports energy crashes, burnout, unsustainable output, or inability to sustain creative work.
- Before `/design-regimen` — a regimen without an energy map is guessing.
- Quarterly re-baseline of an existing regimen.
- After a major life-structure change (new job, caregiving shift, move, relationship change, long illness, major launch recovery).

## When this command does NOT fire

- User reports persistent fatigue with medical red flags (unexplained weight loss, chronic pain, symptoms surviving regimen correction) → defer to clinician.
- User wants a one-off sleep tip or single-domain optimization → route to the specific skill.
- User won't commit to a seven-day log → return the "empirical over narrative" halt message at Step 1.

## Process

1. **Determine mode.**
   - `--start-log` → scaffold a blank 7-day log template for the person to fill in over the next week. Save to `health/log-<slug>-<start-date>.md`. Return the log path and instructions. End here. Audit continues when the person returns with the filled log.
   - `--log <path>` → load the completed log and proceed.
   - `--retroactive` → the person has not kept a log but can reconstruct a typical week from memory. Accept with a caveat: retroactive audits are ~60% as reliable as a live log. Proceed but flag the reduced confidence in the output.
   - No flag and no log → return: `Energy audit needs a seven-day log. Run "/energy-audit <person> --start-log" to scaffold, fill in over the next week, then run "/energy-audit <person> --log <path>" to analyze. If you can reconstruct a typical week from memory, pass --retroactive instead.`

2. **Safety gate (non-medical deferral check).**
   - Scan provided context for mentions of: chronic pain, persistent fatigue surviving sleep correction, unexplained weight loss, suspected eating disorder, active depression symptoms, current clinician-supervised protocol.
   - If any appear, return: `Your context includes <flag>. Energy self-audit is not a substitute for clinician evaluation. Confirm with your clinician first, then we can run this as a supplementary self-audit around their care.`

3. **Parse the log.**
   - Expected shape: 7 days × ~12 waking-hour entries × 5 dimension ratings (1-5) + context tag.
   - If coverage is under 60% of entries, flag the thin log and halt with: `Log coverage is under 60%. Fill in more entries across the week — especially crash windows — and re-run.`
   - If retroactive, tag every entry as reconstructed.

4. **Assemble heat map.**
   - Day × hour × dimension, 7-day week.
   - Peaks = ratings of 4 or 5.
   - Crashes = ratings of 1 or 2.
   - Dead zones = multiple dimensions ≤3.
   - Stacked peaks = multiple dimensions at 4+ simultaneously.

5. **Identify leaks.**
   - Walk the crash windows. For each, match against the common leak list in `health/energy-architecture.md`:
     - Sleep (inconsistent wake, late screens, late meals, alcohol)
     - Nutrition (late caffeine, under-eating, low protein, blood-sugar volatility)
     - Training (peak-window training, under-recovery, over-training)
     - Stress (no output practice, unreplenished social load, context-switching)
     - Environmental (no morning light, sedentary, no outdoor time, algorithmic over-consumption)
   - Name one likely leak per crash, ranked by confidence.

6. **Rank fixes.**
   - For each leak, propose one fix with the smallest possible first step.
   - Rank by impact × effort:
     - **High impact / low effort** — ship this week (e.g., consistent wake time, caffeine cutoff)
     - **High impact / medium effort** — ship in 2 weeks (e.g., protein target, evening protocol)
     - **High impact / high effort** — design into next regimen (e.g., training schedule shift)
     - **Low impact / low effort** — bundle with others
     - **Low impact / high effort** — defer or drop
   - Recommend 2-3 fixes for this cycle. Not 20. Cognitive load is itself a leak.

7. **Name the peaks.**
   - Identify 1-3 stacked-peak windows across the week. These are the creative flagships.
   - Recommend specific protection: no meetings, no caffeine in the wind-down before, no late social load the evening before, training scheduled around them.

8. **Save the audit.**
   - Create `health/` directory if missing.
   - Write `health/audit-<person-slug>-<YYYY-MM-DD>.md`.
   - Include heat map, leaks ranked, fixes ranked, peaks named, non-medical disclaimer, "Built on SIP" attestation.

9. **Hand off.** Named next move is `/design-regimen <person>` (if no regimen exists or the current one needs rewriting), or the top 2-3 fixes to ship this week (if regimen exists and just needs tuning).

## Seven-day log template (emitted by `--start-log`)

```
# Energy Log — <Person Name> — Week of <YYYY-MM-DD>

## Instructions
For the next 7 days, rate your energy 1-5 across five dimensions every 2-3 hours during waking hours.
1 = depleted, 3 = baseline, 5 = peak.

Add a one-line context note: what did you just do, eat, or experience?

Dimensions:
- **P** Physical — stamina, somatic readiness
- **M** Mental — focus, working memory, executive function
- **E** Emotional — regulation, mood stability
- **C** Creative — generative capacity, flow availability
- **S** Social — capacity for presence with others

## Day 1 — <date, weekday>

| Time | P | M | E | C | S | Context |
|------|---|---|---|---|---|---------|
| 07:00 |   |   |   |   |   | Woke up, sleep felt <quality>. |
| 09:00 |   |   |   |   |   | After breakfast <what> and coffee. |
| 11:00 |   |   |   |   |   | Mid-morning work block on <what>. |
| 13:00 |   |   |   |   |   | After lunch <what>. |
| 15:00 |   |   |   |   |   | ... |
| 17:00 |   |   |   |   |   | ... |
| 19:00 |   |   |   |   |   | After dinner <what>. |
| 21:00 |   |   |   |   |   | Pre-sleep. |

(Repeat for Days 2-7)

## Weekly notes
- Total sleep hours each night:
- Training done (day, style, duration):
- Alcohol / caffeine timing (unusual days):
- Unusual stress inputs (day, what):
- Unusual recovery inputs (day, what):
```

## Output format (audit document)

```
# Energy Audit — <Person Name> — <YYYY-MM-DD>

## Disclaimer
This is not medical advice. It is a self-audit framework. If you have persistent fatigue that survives sleep correction, unexplained symptoms, or any concern that suggests a medical boundary, consult a qualified clinician. Self-audit is supplementary to, not a substitute for, clinical evaluation.

## Log source
- Mode: <live 7-day log | retroactive reconstruction>
- Period: <start date> to <end date>
- Coverage: <N%>
- Confidence: <high | medium — flag if retroactive>

## Heat map — weekly energy across five dimensions

| Day | Morning (P/M/E/C/S) | Midday (P/M/E/C/S) | Afternoon (P/M/E/C/S) | Evening (P/M/E/C/S) |
|-----|---------------------|--------------------|-----------------------| --------------------|
| Mon | 3/4/4/4/3 | ... | ... | ... |
| Tue | ... | ... | ... | ... |
| Wed | ... | ... | ... | ... |
| Thu | ... | ... | ... | ... |
| Fri | ... | ... | ... | ... |
| Sat | ... | ... | ... | ... |
| Sun | ... | ... | ... | ... |

## Peaks (stacked energy — flagship creative windows)
1. **<day + window>** — dimensions peaking: <list>. Context: <what precedes>.
2. **<day + window>** — ...
3. **<day + window>** — ...

## Crashes (predictable dips)
1. **<day + window>** — dimensions crashed: <list>. Likely leak: <named leak>.
2. **<day + window>** — ...
3. **<day + window>** — ...

## Leaks ranked (by confidence)
1. **<leak>** — evidence: <which crashes, how frequent>. Mechanism: <e.g., caffeine half-life 5-6h, per sleep-research consensus>.
2. **<leak>** — ...
3. **<leak>** — ...

## Fixes ranked (by impact × effort)

### Ship this week (high impact / low effort)
- [ ] <fix 1> — first step: <smallest version>
- [ ] <fix 2> — first step: <smallest version>

### Ship in 2 weeks (high impact / medium effort)
- [ ] <fix>

### Design into next regimen (high impact / high effort)
- [ ] <fix>

### Bundle or defer
- <low-impact items>

## Peak protection architecture

**Flagship peak: <day + window>**
- No meetings
- No caffeine after <time> the day before
- No late social load evening before
- Training: <not in window; schedule at <alt time>>
- Breakfast: <specific composition that supports this peak>
- Sleep prior night: <target bedtime / wake>

(Repeat for each flagship peak identified)

## Next moves
1. `/design-regimen <person>` — if no regimen exists, or existing one needs rewriting around this audit
2. Ship the 2-3 top fixes this week; re-log for 1 week; compare
3. Re-run `/energy-audit <person>` in 30 days for baseline comparison

**Named next move:** <one command + one-line rationale>

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never medical advice.** Disclaimer in every output. Defer persistent fatigue or medical red flags to clinician.
- **Never generate an audit without a log.** Retroactive is acceptable with reduced-confidence flag; vibes alone are not.
- **Specificity unlocks intervention.** Name the leak with domain, time, and context. "Post-lunch crash Tue/Thu after starchy meal, no walk" beats "afternoon slump."
- **Fix load is itself a leak.** 2-3 fixes per cycle. Not 20. Cognitive load is an energy leak.
- **Evidence direction required.** When citing a mechanism (caffeine half-life, circadian anchoring, protein satiety), name the research direction.
- **Sovereignty.** Energy map is personal data. `health/` namespace is instance-local; do not write to public vaults.
- **One next move at handoff.** Optionality re-scatters what the audit sorted. Collapse to one.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HIS alpha — Health Intelligence System)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

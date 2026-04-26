# Insight Distillation

> *"Three captures is a pattern. Five is a framework. Seven is a signature. Count."*

## When This Skill Activates

- Periodic review sessions — weekly, monthly, quarterly
- Keywords: *distill*, *synthesize captures*, *monthly review*, *what did I learn*, *connect the dots*, *pattern across notes*
- Default for: Starlight Second Brain
- Composes with: memory/knowledge-synthesis, intelligence/pattern-recognition, memory/vault-management

## What This Skill Does

Turns raw captures into reusable frameworks. Captures are cheap; frameworks are portable IP. Distillation is the process of noticing the signal across the noise — patterns captured ≥3 times become named, documented, ready-to-reuse frameworks.

Distillation runs on three cadences:
- **Weekly** (lightweight, 15 min of the 30-min review): cluster inbox + new captures by theme; identify emerging patterns
- **Monthly** (90 min dedicated session): elevate validated patterns to named frameworks; archive raw captures
- **Quarterly** (half-day integration): cross-reference against Genius Profile; propose evolution or net-new frameworks

## Core Principles

1. **Count occurrences, don't vibe.** A pattern is only real at ≥3 occurrences across the window. Two is coincidence. One is anecdote. Inherited from Genius excavation — the rule is the same for personal ongoing capture as it is for one-time excavation.
2. **Distill before you dedupe.** Two captures saying similar things is a signal; one "master note" erases the frequency signal. Cluster first, count second, elevate third.
3. **Distillate preserves; raw archives.** Once a pattern elevates to a framework, the raw captures can archive — the distillate carries forward.
4. **Not every cluster becomes a framework.** Sometimes a theme shows up 3 times and the honest answer is "interesting, not yet useful." Note the theme; don't force elevation.
5. **Cross-reference before naming.** A pattern that resembles an existing Genius framework is probably evolution, not net-new. Check before naming.

## Procedures

### Procedure 1: Load Captures From Window

Scope by cadence:

- **Weekly:** Last 7 days of captures + current inbox
- **Monthly:** Last 30 days of captures + accumulated weekly clusters
- **Quarterly:** Last 90 days of monthly distillates + Genius Profile for cross-reference

Read all captures in the window. Do not skim — clustering requires reading in full. This is why weekly is 15 min, not 60 min: fewer captures, less to read.

### Procedure 2: Cluster By Theme

Group captures that touch the same underlying theme. A theme is not a category — it's an emerging *thing the person has been thinking about repeatedly*.

Example (a practitioner's monthly distillation):
- Cluster A: 5 captures about client-calls where the framework worked even when the client resisted → theme: "framework resilience under client friction"
- Cluster B: 3 captures about why one vocabulary word kept returning across unrelated coaching conversations → theme: "vocabulary as diagnostic"
- Cluster C: 2 captures about a new energy-management observation → theme: still emerging, watch next month

Clusters are named in the person's own voice, not a generic category. "Framework resilience under client friction" is what the practitioner would say; "client-handling patterns" is what a template would say. Voice matters.

### Procedure 3: Identify Emerging Patterns (≥3 Threshold)

For each cluster, count occurrences. Apply the threshold:

- **≥3 occurrences** → eligible for elevation to framework (proceed to step 4)
- **2 occurrences** → coincidence; hold for next window
- **1 occurrence** → anecdote; archive or drop

Record the count. The count is part of the distillate — "observed 5 times across March" is stronger evidence than "I noticed this."

### Procedure 4: Elevate Patterns To Frameworks

For each eligible cluster, write a framework draft:

```
### Framework: <name in person's voice>

**Observed:** <N times across <window>>
**Evidence:** <3-5 capture references — dates + one-line excerpts>

**What it says:** <2-3 sentences naming the pattern>

**When it applies:** <context in which this pattern holds>

**When it fails:** <counter-examples or boundary conditions noticed>

**Status:** draft / validated / deprecated
```

A framework starts as `draft`. It becomes `validated` at the next cadence (monthly → quarterly) if still observed. Deprecated if contradicted by later captures.

### Procedure 5: Cross-Reference Against Genius Profile

Load the person's Genius Profile (`genius/profile-<slug>.md`). For each new framework draft, answer:

- **Does this resemble an existing Profile framework?**
  - *Yes, refinement* → propose evolution to that framework; do not create net-new
  - *Yes, contradiction* → flag for next excavation cycle; the Profile may be outdated
  - *No resemblance* → candidate for net-new Profile framework at quarterly integration

Write proposals to `second-brain/genius-evolution/<slug>.md`. Never mutate the Profile directly — Genius agent confirms evolutions.

### Procedure 6: Archive Raw Captures

Once a cluster has distilled into a framework draft, archive the raw captures:

- Raw captures → `second-brain/archive/<YYYY-MM>/`
- Distillate (the framework draft) → `personal/<slug>/wisdom-vault.md` under `## Personal Frameworks` section
- Cluster notes that didn't elevate → `second-brain/clusters-<window>-<date>.md` (preserves them for next window's counting)

The distillate carries the signal forward. The raw captures are preserved for provenance and re-distillation if the framework later matures or is contested.

## Rules

- **Never** elevate a pattern to framework below the ≥3 threshold. The threshold is the discipline.
- **Never** mutate the Genius Profile directly. Propose; confirm via Genius agent at quarterly review.
- **Never** dedupe captures before counting. Frequency is signal — collapsing hides it.
- **Never** archive captures whose clusters haven't distilled. Preserve until the next window counts them.
- **Always** count in the person's voice. "Observed 5 times" not "n=5."
- **Always** cross-reference with Genius Profile before naming net-new frameworks. Most emerging patterns are evolution, not discovery.
- **Always** let clusters die honestly. Not every theme becomes a framework. "Interesting, not yet useful" is a valid final state.

## Integration Points

- **Vault:** Reads `second-brain/inbox/`, `second-brain/captures/`; writes `second-brain/distillates/`, `second-brain/archive/`, `personal/<slug>/wisdom-vault.md`, `second-brain/genius-evolution/<slug>.md`.
- **Agents:** Starlight Second Brain (primary). Genius (evolution proposals). Sage (cross-reference with institutional Wisdom).
- **Commands:** `/distill-insights` invokes this skill directly; `/orchestrate-brain` runs it in the weekly 30-min ritual at lightweight depth.
- **Skills:** Composes with `memory/knowledge-synthesis` (clustering), `intelligence/pattern-recognition` (threshold recognition), `memory/vault-management` (persistence), `iterative-retrieval` (progressive refinement across windows).

## Quality Criteria

- Did every framework elevation meet the ≥3 threshold?
- Did the monthly distillation produce ≥1 elevation or honestly note "no signal yet"?
- Were raw captures archived after distillation, preserving the distillate?
- Was the Genius Profile cross-referenced before naming net-new frameworks?
- Did the distillate read as the person's voice, not generic template language?
- Would re-reading the distillate in 6 months still make sense without the raw captures?

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

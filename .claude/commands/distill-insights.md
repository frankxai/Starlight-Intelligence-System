---
name: distill-insights
description: Distill captures from a window (week / month / quarter) into named frameworks. Applies ≥3-occurrence threshold. Cross-references against Genius Profile. Produces a distillate document and optional Profile evolution proposals.
allowed-tools: Read, Write, Grep, Glob
argument-hint: --person <name> --window <week|month|quarter>
---

# /distill-insights

Load `SIP.md`, `VOICES.md`, `agents/starlight-secondbrain.md`, `agents/starlight-genius.md`, `skills/memory/insight-distillation/SKILL.md`, and `genius/profile-<slug>.md` if it exists. Distill the person's captures from the specified window into named frameworks using the ≥3-occurrence threshold. Propose Genius Profile evolutions where warranted.

## Input
$ARGUMENTS

Required args: `--person <name> --window <week|month|quarter>`. Parse slug from name (kebab-case). Parse window as one of week (last 7 days), month (last 30 days), quarter (last 90 days).

## When this command fires

- **Weekly distillation** — the lightweight pass inside the weekly review (or standalone)
- **Monthly distillation** — the dedicated 90-minute session; the primary distillation cadence
- **Quarterly integration** — the half-day session that crosses distillates with the Genius Profile

## When this command does NOT fire

- Daily capture — use `/capture-daily`
- Full weekly review orchestration — use `/orchestrate-brain`
- One-time knowledge reorganization — use `/reclaim-knowledge`
- Excavating a Genius Profile from scratch — use `/discover-genius`

## Process

1. **Load captures from window.** Read all files matching `second-brain/captures/<slug>/*.md` where the date falls in the window. Also read `second-brain/inbox/` (inbox items have no date constraint — they were unrouted captures waiting).

2. **Cluster by theme.** Read every capture in full (not skim). Group captures that touch the same underlying theme. Name clusters in the person's own voice — not "client-handling patterns" but whatever phrase the captures themselves suggest. Clusters can overlap; one capture can sit in two clusters.

3. **Count occurrences per cluster.** Apply threshold:
   - ≥3 occurrences → eligible for framework elevation (step 4)
   - 2 occurrences → hold for next window; note in cluster file
   - 1 occurrence → keep as anecdote or drop

4. **Draft frameworks for eligible clusters.** For each ≥3 cluster, write a framework draft using the structure from `skills/memory/insight-distillation/SKILL.md`:

   ```
   ### Framework: <name in person's voice>

   **Observed:** <N> times across <window>
   **Evidence:** <3-5 capture references — date + one-line excerpt>

   **What it says:** <2-3 sentences>

   **When it applies:** <context>

   **When it fails:** <counter-examples or boundary conditions>

   **Status:** draft
   ```

5. **Cross-reference against Genius Profile.** If `genius/profile-<slug>.md` exists, read the frameworks section. For each new framework draft, classify:
   - **Refinement** — resembles an existing Profile framework; propose evolution
   - **Contradiction** — challenges an existing Profile framework; flag for next excavation
   - **Net-new** — no resemblance; candidate for quarterly integration into Profile

   Write proposals to `second-brain/genius-evolution/<slug>.md` (append, never overwrite).

6. **Save the distillate.** Write the complete distillate to `second-brain/distillates/<slug>-<window>-<YYYY-MM-DD>.md`. Include:
   - Summary (captures read, clusters formed, frameworks drafted)
   - Full framework drafts
   - Cross-reference decisions
   - Clusters that did not elevate (with counts — they're waiting for next window)

7. **Archive raw captures (monthly and quarterly only — NOT weekly).** Move captures whose clusters elevated to framework drafts into `second-brain/archive/<YYYY-MM>/`. Leave non-elevated captures in place; they're still counting toward next window.

8. **Update Wisdom vault personal namespace.** Append validated frameworks (those in status `validated` after second sighting) to `personal/<slug>/wisdom-vault.md` under `## Personal Frameworks`. Drafts stay in the distillate only.

9. **Report back.**

   > *"Read <N> captures across <window>. Formed <C> clusters. <F> met the ≥3 threshold — drafted as frameworks. <E> Profile evolution proposals written; <NN> net-new candidates flagged for quarterly integration. <H> clusters on hold for next window. Distillate at `second-brain/distillates/<slug>-<window>-<date>.md`."*

## Output format

The distillate document:

```
# Insight Distillation — <Person Name> — <window> — <YYYY-MM-DD>

## Summary
- **Window:** <week | month | quarter> (<N> days)
- **Captures read:** <count>
- **Clusters formed:** <count>
- **Frameworks drafted (≥3 occurrences):** <count>
- **Profile evolution proposals:** <count>
- **Clusters on hold (2 occurrences):** <count>

## Frameworks drafted

### Framework: <name>
**Observed:** <N> times
**Evidence:**
- [<date>] <one-line excerpt>
- [<date>] <one-line excerpt>
- [<date>] <one-line excerpt>

**What it says:** <2-3 sentences>
**When it applies:** <context>
**When it fails:** <boundary>
**Status:** draft
**Cross-reference:** <refinement-of / contradicts / net-new> — <target framework name or "none">

### Framework: <name>
...

## Clusters on hold
- **<cluster name>** — 2 occurrences; watch next window.
- ...

## Profile evolution proposals
(Written to `second-brain/genius-evolution/<slug>.md` — summarized here)
- **<target framework>** — <one-line refinement proposal>
- ...

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: <ISO date>
---
```

## Rules

- **Never** elevate below ≥3 threshold. Threshold is the discipline.
- **Never** mutate the Genius Profile directly. Propose only. Genius agent confirms.
- **Never** dedupe before counting. Frequency is signal.
- **Never** archive captures whose clusters didn't elevate. They count toward the next window.
- **Never** run weekly mode with `--archive` behavior. Archiving is monthly/quarterly only.
- **Always** write clusters in the person's voice — not generic category names.
- **Always** cross-reference against Genius Profile before naming net-new frameworks.
- **Always** preserve clusters that didn't elevate — they're next month's signal.
- **Sovereignty** — distillates are the person's. Do not write to public or institutional vaults.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

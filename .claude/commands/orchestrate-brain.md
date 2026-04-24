---
name: orchestrate-brain
description: Weekly 30-minute second-brain review ritual. Orchestrates inbox clear, lightweight distillation, vault maintenance, cross-reference pass, and next-week capture focus. The compounding rhythm that keeps the system alive.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> [--depth <light|standard|deep>]
---

# /orchestrate-brain

Load `SIP.md`, `VOICES.md`, `agents/starlight-secondbrain.md`, `skills/memory/capture-discipline/SKILL.md`, `skills/memory/insight-distillation/SKILL.md`. Run the weekly 30-minute second-brain review ritual for the named person. Save the review to `second-brain/reviews/<person-slug>-weekly-<YYYY-MM-DD>.md`.

Thirty minutes is the cap. Not the target, the cap. A weekly review that takes 60 minutes is a sign of weekly review neglect the week before — address by returning to the rhythm, not by making this session longer.

## Input
$ARGUMENTS

## When this command fires

- Once per week (typical cadence: same day each week — the fixed-day habit compounds)
- Person has captured throughout the week using `/capture-daily` or their own capture habit
- Inbox has accumulated items needing routing decisions

## When this command does NOT fire

- Monthly distillation — use `/distill-insights --window month` as a standalone 90-min session
- Quarterly integration — use `/distill-insights --window quarter` as a standalone half-day
- Daily capture — use `/capture-daily`
- First-time setup — use `/reclaim-knowledge` first, then start weekly reviews

## The Five Phases (30 min total)

### Phase 1: Inbox Clear (10 min)

1. Read all items in `second-brain/inbox/`.
2. For each inbox item, make a 10-second decision:
   - **Route** → move to namespace per routing table (see `capture-discipline/SKILL.md`)
   - **Drop** → delete; not every thought survives, and that's healthy
   - **Hold** → explicitly note why you're holding; holds must justify themselves

3. Inbox must end at zero. If it doesn't, the routing rules are broken — note it in the review for next week.

### Phase 2: Lightweight Distillation (10 min)

Invoke `/distill-insights --person <name> --window week` behavior at light depth:

1. Load the week's captures (last 7 days across all namespaces + just-cleared inbox).
2. Cluster by theme. Don't force clusters; some weeks have none.
3. Count occurrences. Note clusters at ≥3 (eligible for framework draft) and at 2 (watch next week).
4. **Do not archive captures at weekly review.** That's monthly's job. Just note the clusters.

Output: a short "weekly clusters" note saved to the review file. No framework drafts yet — weekly is for noticing, monthly is for naming.

### Phase 3: Vault Maintenance (5 min)

1. Check vault health metrics for the person's personal-namespace files:
   - Any entries older than 90 days in `operational-vault`? Archive candidates.
   - Any duplicates across namespaces? Flag for next monthly.
   - Any broken backlinks to archived captures? Repair.

2. This is housekeeping, not restructuring. 5 minutes max. If vault maintenance needs more than 5 minutes, schedule a dedicated session — don't let it eat the weekly review.

### Phase 4: Cross-Reference Pass (3 min)

1. Scan the week's captures for links to older material (last 90 days).
2. For any capture that echoes an older one, add a backlink in both directions.
3. If a cross-reference count crosses ≥3 across the 90-day window, note it as a quarterly-distillation candidate (do not elevate here — weekly doesn't elevate).

### Phase 5: Next Week's Capture Focus (2 min)

1. Looking at this week's clusters, name ≤2 themes worth watching more carefully next week.
2. Write them to the review as "watch-list" — the person can keep these in mind at capture moments without forcing captures about them.

Watch-list is a compass, not a quota. No pressure to capture about watch-list items if they don't happen.

## Output format

The weekly review document:

```
# Weekly Brain Review — <Person Name> — <YYYY-MM-DD>

**Week:** <ISO week number — e.g., 2026-W17>
**Time spent:** <X> min (cap: 30)
**Depth:** <light | standard | deep>

## Phase 1 — Inbox Clear
- Items processed: <N>
- Routed: <M>
- Dropped: <D>
- Held (with reason): <H>

**Routing health:** <clean | needs-work — one line>

## Phase 2 — Lightweight Distillation
- Captures read: <N>
- Clusters formed: <C>
- At ≥3 threshold (eligible for monthly framework draft): <F>
- At 2 occurrences (watch next week): <W>

### Clusters noted
- **<cluster name in person's voice>** — <N> occurrences; <one-line what's emerging>
- ...

## Phase 3 — Vault Maintenance
- Stale operational entries flagged: <N>
- Duplicates flagged: <D>
- Backlinks repaired: <R>

## Phase 4 — Cross-References
- New links written: <N>
- Quarterly-candidate patterns (≥3 across 90 days): <Q>
  - <pattern name> — <count>
  - ...

## Phase 5 — Next Week's Watch-List
- <theme 1> — <one-line why>
- <theme 2> — <one-line why>

## Honest notes
<Anything the review surfaced that matters — system drift, capture-habit slippage, or nothing at all. Two sentences max.>

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: <ISO date>
---
```

## Rules

- **Never** exceed 30 minutes. Cap is the cap. Overrun means the rhythm broke upstream — fix that, not this session.
- **Never** elevate to framework at weekly review. Weekly notices; monthly elevates.
- **Never** archive captures at weekly review. Archive is monthly/quarterly.
- **Never** skip Phase 1. Inbox zero is the foundation of the weekly rhythm.
- **Always** end inbox at zero. If it doesn't end there, the routing rules need fixing next week.
- **Always** note when the review surfaces system drift — capture habit slipped, namespaces mismatched, tools failed. Honest notes compound over weeks into pattern recognition about the practice itself.
- **Always** keep watch-list to ≤2 themes. More than 2 is not a compass, it's a to-do list.
- **Sovereignty** — reviews are the person's. Not published. Not synced to institutional vaults.

## Composition

- **Weekly review (this command)** feeds monthly: after 4 weeks of reviews, run `/distill-insights --window month` for the dedicated 90-min session.
- **Monthly distillation** feeds quarterly: after 3 months, run `/distill-insights --window quarter` for half-day integration with Genius Profile.
- **Quarterly integration** feeds annual: honest read of the year's frameworks against the original Genius Profile. Time to re-excavate? (`/discover-genius` again.)

The weekly is the foundation. Skip weekly, the monthly collapses. Skip monthly, the quarterly is a fishing expedition. Keep the weekly, everything compounds.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

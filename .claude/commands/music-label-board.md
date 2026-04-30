---
description: Multi-persona portfolio scorecard for one or all labels — releases, revenue, amplification health, drafts pipeline
argument-hint: [label]
allowed-tools: Read, Glob, Grep, Agent
---

# /music-label-board — Portfolio scorecard

Multi-persona portfolio scorecard for one or all of the four labels (frank-riemer, franks-vibes, arcanea, nona). Returns per-label rollup + per-persona detail + cross-label patterns.

## Usage

```
/music-label-board                 # all four labels rollup
/music-label-board frank-riemer    # single label drilldown
/music-label-board arcanea
```

## Arguments

- **label** (optional) — one of: `frank-riemer`, `franks-vibes`, `arcanea`, `nona`. Omit for cross-label rollup.

## Behavior

Invokes `music-is/catalog-systems` skill (Mechanical tier, Haiku 4.5) → `music-archivist` agent.

### Per-label rollup

- Active personas count + names
- Total releases (per persona, per label)
- Releases by month (last 6 months)
- Streaming revenue (Spotify-for-Artists data if integrated; manual entry fallback)
- Sync revenue (any direct deals or library payouts)
- Direct revenue (Bandcamp, Patreon if applicable)
- Royalty-graph entries count
- Amplification mesh health (active Claws, drops/week, voice-lock pass rate, frequency-cap status)

### Per-persona detail

- Sound DNA snippet (at-a-glance recall)
- Releases (count + last release date + cadence health)
- Release-cadence baseline status (6-release threshold for multiplication)
- Voice-lock pass rate last 4 weeks
- Top-3 performing releases (per persona's primary metric — streams, sync placements, Bandcamp sales, etc.)
- Outstanding drafts (count + age; flags >30d stales)

### Cross-label patterns (when no label arg)

- Release cadence balance across labels
- Voice-lock health across personas
- Royalty-graph aggregation (composes with Wealth IS theses if active)
- Cross-label promo opportunities (frankx.ai-driven)

## Output formats

- **Cowork live artifact** — refreshable on open via Haiku-backed read of catalog
- **Markdown summary** — paste-ready
- **CSV export** — for Excel handoff
- (Optional) Notion sync push to AI Musicians Hub mirror

## Composes with

- `/music-release` — most recent gate-passes show in scorecard
- `/music-amplify` — amplification health metrics feed scorecard
- `verticals/music-is/MEMORY.md` — weekly hygiene reports referenced

## Refresh cadence

- On-demand via `/music-label-board`
- Weekly auto-refresh (Mondays) per catalog hygiene ritual
- Cowork artifact: refreshes on open

---

**Built on SIP** — `/music-label-board` · Mechanical tier · Catalog-truth read · Refreshable Cowork artifact compatible

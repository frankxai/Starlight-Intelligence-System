# Cowork Live Artifacts — Music IS

> Three Cowork live artifacts compose the Music IS observability layer. Each refreshes on open via Haiku-backed connector reads. Each replaces a static dashboard with persistent, refreshable views.

**Last updated:** 2026-04-29

---

## Artifact philosophy

Cowork artifacts earn their keep by being re-opened. The data underneath changes (catalog, royalty graph, voice-lock health) — the artifact stays the same surface but always shows current state.

Music IS has 3 artifacts that meet the bar:

1. **`music-is-label-board`** — multi-persona portfolio scorecard
2. **`music-is-persona-canon-viewer`** — per-persona canon at-a-glance + health metrics
3. **`music-is-royalty-graph-viewer`** — per-release attribution-cascade visualization + revenue rollup

---

## Artifact 1 — `music-is-label-board`

### What it shows

Multi-persona portfolio scorecard with cross-label rollup + per-persona detail.

### Sections

- **Header:** Music IS / Arcanea Records — current month + active personas count + total releases live
- **Per-label rollup:** for each of the 4 labels (Frank Riemer / Frank's Vibes / Arcanea / Nona):
  - Active personas count
  - Releases live count
  - Revenue this month (gross + net)
  - Cumulative revenue
  - Top-3 performing releases
- **Per-persona detail (collapsible per persona):**
  - Sound DNA snippet
  - Releases (count + last release date + cadence health badge)
  - Release-cadence baseline status (6-release threshold)
  - Voice-lock pass-rate last 4 weeks
  - Top-3 performing releases (per persona's primary metric)
  - Outstanding drafts (count + age; flag stales >30d)
- **Cross-label patterns:** release cadence balance, voice-lock health, royalty-graph aggregation
- **Action items this week:** from latest weekly hygiene ritual

### Data sources (refresh on open)

- `catalog/master.csv` (released + draft counts; persona attributions)
- `catalog/royalty-graph.json` (per-track revenue rolling totals)
- `verticals/music-is/revenue/per-persona/<persona>.csv` (per-persona revenue)
- `verticals/music-is/revenue/per-label/<label>.csv` (per-label revenue)
- Voice-lock pass-rate from amplification logs (Phase 3+)
- Latest weekly hygiene report from `verticals/music-is/MEMORY.md`

### Refresh mechanism

- On Cowork open: Haiku-backed read of catalog + royalty graph + revenue files
- Latency target: ≤2s
- Refresh button: "Re-fetch now"

### Layout

Dashboard layout, glass-card aesthetic per Arcanea design canon (atlantean teal #00bcd4 + cosmic blue #0d47a1 + gold accent #ffd700). Per-label cards expand to per-persona detail.

---

## Artifact 2 — `music-is-persona-canon-viewer`

### What it shows

Per-persona canon at-a-glance + health metrics + recent activity.

### Sections (per persona, selectable from header dropdown)

- **Header:** persona name + label + status + Phase priority
- **Sound DNA:** genre + sub-genre + reference triangle + tempo bands + Suno prompt anchors
- **Visual DNA:** color palette swatches + typography lock + reference image set thumbnail
- **Voice DNA:** per-platform tone register + sample voice-lock excerpt + banned-phrases count
- **Audience contract:** primary listener context + demographic hypothesis + discovery surface
- **Monetization stack:** active rails + revenue this month per rail
- **Recent releases (last 6):** title + release date + streams + sync-pitches sent + Bandcamp sales
- **Drafts queue:** count + oldest draft age
- **Voice-lock health (per platform):** pass-rate last 4 weeks
- **Royalty-cascade compliance:** % of releases with cascade-graph complete

### Data sources

- `verticals/music-is/labels/<label>/personas/<persona>/CANON.md`
- `catalog/master.csv` filtered by persona
- `catalog/royalty-graph.json` filtered by persona
- Voice-lock logs (Phase 3+)

### Refresh mechanism

- Same as artifact 1
- Persona selectable via dropdown; switching personas re-fetches that persona's data

---

## Artifact 3 — `music-is-royalty-graph-viewer`

### What it shows

Per-release attribution-cascade visualization + revenue rollup + cascade-compliance status.

### Sections (per release, selectable from header dropdown)

- **Header:** release title + persona + label + ISRC + release date
- **Cascade visualization:** Sankey-diagram or stacked-bar showing:
  - Composer slice (Frank): N%
  - Publisher slice (Arcanea Records BV): N%
  - Label slice (Arcanea Records BV): N%
  - Arcanea ecosystem attribution (Arcanea label only): N%
- **Per-rail revenue rollup:**
  - Streaming lifetime: $X
  - Direct (Bandcamp) lifetime: $X
  - Sync lifetime: $X (with deal-history if any)
  - NFT lifetime: $X (Phase 6+)
  - Fan-tier lifetime: $X (Phase 6+)
- **Per-month revenue trend:** line chart (last 12 months)
- **Cascade-compliance:** ✅ compliant / ⚠️ under-review / 🛑 violation
- **Audit history:** any cascade-audit events
- **Sync-pitch history:** if any pitches sent

### Data sources

- `catalog/royalty-graph.json` filtered by song-id
- `catalog/master.csv` filtered by song-id (for metadata)
- `verticals/music-is/revenue/monthly/*.csv` (per-month rollup)

### Refresh mechanism

- Same as artifact 1
- Release selectable via dropdown OR auto-loads most-recent gate-passed release

---

## Cross-artifact integration

All three artifacts can link to each other:
- From `label-board`: click a persona name → opens `persona-canon-viewer` for that persona
- From `persona-canon-viewer`: click a release → opens `royalty-graph-viewer` for that release
- From `royalty-graph-viewer`: click persona → opens `persona-canon-viewer`

---

## Phase activation

| Phase | Artifact state |
|---|---|
| Phase 0 (now) | Spec'd; not yet built |
| Phase 1 | First versions ship as static markdown + render via existing label-board command output (no live refresh yet) |
| Phase 2-3 | First Cowork live artifacts ship — `label-board` first; `persona-canon-viewer` second |
| Phase 4 | `royalty-graph-viewer` ships; full 3-artifact suite live; integrated with frankx.ai/music/studio dashboard |

---

## Rendering tech

- **Phase 0-1:** Markdown rendering via Cowork's markdown surface
- **Phase 2+:** Cowork live artifact (HTML + CSS + JS via `mcp__cowork__create_artifact`)
- Color palette: per Arcanea design canon (atlantean teal + cosmic blue + gold accent + glass cards `bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm`)
- Fonts: Geist (display + body) + Instrument Serif (editorial accent) + JetBrains Mono (data tables)
- Banned: Cinzel, Space Grotesk, Inter

---

## Performance considerations

- **Latency target:** ≤2s on open
- **Cache strategy:** read-only views can cache for 5min; force-refresh button bypasses cache
- **Token cost per refresh:** ~1-3K tokens (Haiku CRUD + lightweight synthesis)
- **Data size:** capped at ~50KB per artifact load (truncate-or-paginate larger datasets)

---

## Refusals

- Cowork artifact that authoritatively edits catalog → refuse (catalog is truth via direct CSV/markdown edits, not via dashboard UI)
- Artifact that exposes per-fan identifying data → refuse (privacy)
- Artifact that exposes vocal-consent docs publicly → refuse (private)
- Artifact for productization customers (Phase 5+) without per-customer-instance isolation → refuse

---

## Composes with

- All 3 artifacts compose with `catalog/master.csv` + `catalog/royalty-graph.json` + per-persona CANON.md
- `music-is/catalog-systems` skill (data source)
- `music-is/royalty-graph` skill (cascade visualization)
- `music-is/persona-canon` skill (canon at-a-glance)
- `weekly-hygiene-sop.md` (action items from latest hygiene ritual feed `label-board`)

---

**Built on SIP** — `verticals/music-is/workflows/cowork-artifacts-spec.md` · v0.1 · 2026-04-29 · 3 live artifacts spec'd · Phase 2+ progressive build

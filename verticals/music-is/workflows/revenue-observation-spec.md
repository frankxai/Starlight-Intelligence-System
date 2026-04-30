# Revenue Observation + Wealth IS Composition

> Per-rail revenue tracking; per-persona / per-label rollups; composes with Wealth IS theses + DPI tracking. Without revenue observation, royalty-cascade graph integrity drifts and forecast capacity vanishes.

**Owner:** `royalty-architect` (Sonnet) + `music-archivist` (Haiku) for CRUD; composes with `wealth-dpi` substrate command if active
**Last updated:** 2026-04-29

---

## Per-rail revenue sources

### Streaming (DistroKid → DSPs)

| DSP | Reporting cadence | Pull mechanism (Phase 0-1 manual; Phase 4+ MCP) |
|---|---|---|
| Spotify | Monthly (Spotify-for-Artists) | manual web export → Music IS revenue.csv |
| Apple Music | Monthly (Apple Music for Artists) | manual export |
| Tidal | Monthly | manual export |
| YouTube Music | Monthly | manual export |
| Amazon Music | Monthly | manual export |
| Pandora | Monthly | manual export |
| Deezer | Monthly | manual export |

DistroKid aggregates all DSPs into a single monthly statement; primary source.

**Phase 4+ target:** Spotify-for-Artists MCP + DistroKid MCP automate pull; per-track revenue propagates to `catalog/royalty-graph.json`.

### Direct (Bandcamp)

- Per-sale event → propagate to royalty-graph entry
- Phase 1: manual log (Frank exports Bandcamp sales monthly)
- Phase 6+: bandcamp-mcp automates

### Sync placements

- Per-deal logged in `catalog/royalty-graph.json` `sync.direct_deal_history` array
- Per-library payout statements (Musicbed/Marmoset/etc.) — quarterly
- Manual entry until library MCPs exist

### NFT / limited (Phase 6+)

- On-chain primary sale + secondary royalty via smart contract
- Auto-propagate via on-chain event listener (Phase 6+ build)

### Fan-tier (Phase 6+)

- Bandcamp subscriptions: monthly
- ConvertKit / Patreon: monthly
- Discord paid roles: monthly

---

## Revenue file structure

```
verticals/music-is/revenue/
├── monthly/
│   ├── 2026-05.csv        # all per-rail revenue this month
│   ├── 2026-06.csv
│   └── ...
├── per-rail/
│   ├── streaming-cumulative.csv
│   ├── direct-cumulative.csv
│   ├── sync-cumulative.csv
│   └── ...
├── per-persona/
│   ├── frank-riemer.csv
│   ├── alera.csv
│   └── ...
├── per-label/
│   ├── frank-riemer.csv
│   ├── arcanea.csv
│   └── ...
└── REVENUE-MEMORY.md      # observations + decisions
```

Each CSV column structure:

```
date, song_id, persona, label, rail, platform, gross_amount, currency,
platform_take_amount, net_to_arcanea_records,
contributor_payouts_json, attestation_match
```

`contributor_payouts_json` carries the cascade-split for that period:
```json
{
  "composer": 100,
  "publisher": 50,
  "label": 50
}
```

---

## Monthly observation ritual

Every month-end (last Sunday or first Monday of new month):

1. **Pull DistroKid statement** (manual or MCP)
2. **Pull Bandcamp statement**
3. **Pull any sync-deal payouts received this month**
4. **Pull NFT/fan-tier statements (Phase 6+)**
5. **Run `royalty-architect` (Sonnet) to:**
   - Validate per-track payouts match cascade graph
   - Flag any mismatches (statement says $X, cascade graph says should be $Y → audit)
   - Update `verticals/music-is/revenue/monthly/<YYYY-MM>.csv`
   - Update per-rail / per-persona / per-label cumulative CSVs
   - Update `catalog/royalty-graph.json` per-track revenue rolling totals
6. **Generate monthly revenue report** appended to `verticals/music-is/revenue/REVENUE-MEMORY.md`

---

## Monthly revenue report format

```markdown
## YYYY-MM — Revenue Report

### Total this month
- Gross: $X,XXX
- Net to Arcanea Records: $X,XXX
- Per-contributor:
  - Composer (Frank): $X,XXX
  - Publisher (Arcanea Records BV): $XXX
  - Label (Arcanea Records BV): $XXX

### Per-rail
| Rail | Gross | Net | Cascade-compliance |
|---|---|---|---|
| Streaming | $X,XXX | $X,XXX | ✅ |
| Direct (Bandcamp) | $XXX | $XXX | ✅ |
| Sync | $X,XXX | $XXX | ✅ |
| NFT / limited | $0 | $0 | n/a (Phase 6+) |
| Fan-tier | $0 | $0 | n/a (Phase 6+) |

### Per-persona
| Persona | Releases earning | Gross | Net | Top track |
|---|---|---|---|---|
| Frank Riemer | X | $X,XXX | $X,XXX | [title] |
| Alera | X | $X,XXX | $X,XXX | [title] |
| ... | | | | |

### Per-label
| Label | Releases earning | Gross | Net | Top track |
|---|---|---|---|---|
| Frank Riemer | X | $X,XXX | $X,XXX | [title] |
| Arcanea | X | $X,XXX | $X,XXX | [title] |
| Frank's Vibes | X | $X,XXX | $X,XXX | [title] |
| Nona | X | $X,XXX | $X,XXX | [title] |

### Cascade-compliance audit
- Total deals this month: X
- Cascade-violations: 0 ← target always 0
- Audits open: X

### Trends + observations

[Synthesis from royalty-architect]

### Action items

- [ ] Action 1
```

---

## Wealth IS composition

Composes with substrate Wealth IS layer (per `verticals/wealth-is/` if active in Frank's Starlight stack):

### Per-cycle DPI composition

Music IS revenue feeds into Frank's overall DPI (Dollar-Per-Insight or similar Wealth IS metric):

- Per-month Music IS revenue → DPI input
- Per-label compounding rate → DPI trend
- Per-persona Saturation curve → DPI ceiling estimate
- Sync-deal compounding (catalog-as-asset growing in value) → DPI tail

### `/wealth-dpi` substrate command integration

Frank's `/wealth-dpi` command pulls from:
- `verticals/music-is/revenue/per-rail/`
- `verticals/music-is/revenue/per-label/`
- Aggregated Music IS revenue → composed with other Frank's-DPI-sources

### `/wealth-theses` integration

Per-rail revenue forecasts inform Wealth IS theses:
- Streaming: low-yield-but-compounding rail
- Sync: high-leverage-irregular rail
- Bandcamp direct: mid-yield-loyalty rail
- NFT/limited (Phase 6+): high-event-with-secondary-royalty-tail rail
- Fan-tier (Phase 6+): recurring-low-yield rail

Each rail has different forecast curves; Wealth IS composes them into Frank's overall financial trajectory.

---

## Per-track revenue rollup format (in royalty-graph.json)

For each released track:

```json
"revenue": {
  "lifetime_gross": 0,
  "lifetime_net_to_arcanea": 0,
  "per_rail": {
    "streaming_lifetime": 0,
    "direct_lifetime": 0,
    "sync_lifetime": 0,
    "nft_lifetime": 0,
    "fan_tier_lifetime": 0
  },
  "per_month": {
    "2026-05": 0,
    "2026-06": 0,
    ...
  },
  "last_observation_date": "...",
  "cascade_audit_status": "compliant / under-review / violation",
  "audit_history": []
}
```

---

## Cascade-compliance audit triggers

| Trigger | Action |
|---|---|
| DistroKid statement per-track payout doesn't match catalog cascade-split | royalty-architect audit; Frank notified |
| Sync-deal closed without cascade-preservation | flag for refusal-or-renegotiation |
| Contributor not paid per cascade graph | audit + remediate |
| Royalty rate per platform changed (DSP-side) | update cascade graph; recalculate forecasts |
| Statement per-track ISRC unmatched | likely a release that didn't go through gate; investigate orphan track |

---

## Phase activation

| Phase | Revenue observation state |
|---|---|
| Phase 0 (now) | Revenue file structure scaffolded; no revenue yet |
| Phase 1 | First releases live; first DistroKid statement (60-90 days post-first-release) |
| Phase 2 | Multi-persona revenue rolling up; first sync deal (Phase 1+ first attempts may pay out) |
| Phase 3 | Amplification mesh active; revenue per Claw drop attributable |
| Phase 4 | Dashboard live; per-label revenue compounding observable |
| Phase 5 | Productization revenue (template sales) starts; separate revenue file structure |
| Phase 6 | NFT + fan-tier + sync-direct rails active; full multi-rail compounding |

---

## Revenue baseline targets (per DECISIONS D13 productization trigger)

Phase 5 productization requires 3+ months revenue baseline. Specifically:

- ✅ All 4 labels (or 3 of 4 active) have revenue > $0 for 3+ consecutive months
- ✅ Per-label revenue trend non-negative for 3+ months
- ✅ Cascade-compliance rate 100% (zero violations)
- ✅ Total Music IS revenue exceeds operating cost (Suno + render engines + tooling) for 3+ months

---

## Refusals

- Skip monthly revenue ritual without documented reason → audit
- Manual edit to revenue CSV without statement provenance → audit
- Cascade-violation accepted without remediation plan → audit
- Revenue-tracking-without-attestation-match → flag

---

## Composes with

- `music-is/royalty-graph` skill (per-track cascade graph)
- `royalty-architect` agent (owner)
- Wealth IS substrate (DPI + theses composition)
- Catalog hygiene ritual (weekly check 5 — royalty graph completeness)

---

**Built on SIP** — `verticals/music-is/workflows/revenue-observation-spec.md` · v0.1 · 2026-04-29 · Monthly cadence · Cascade-compliance non-waivable · Wealth IS composition

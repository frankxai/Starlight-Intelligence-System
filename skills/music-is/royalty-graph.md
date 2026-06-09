---
name: music-is/royalty-graph
description: Attribution-cascade royalty graph design + maintenance. Triggers on every /music-release, NFT/limited mint design, sync-deal economics, fan-tier offer design. Senior tier (Sonnet 4.6).
---

# Royalty-Cascade Graph

> Every monetization rail has its attribution-cascade graph designed first, encoded second. Royalties retrofitted onto already-released work are theater; royalties designed into the spawn are sovereignty. Composes with Creator Forge attribution-cascade pattern.

## When this skill fires

- Every `/music-release` GREEN-LIGHT — graph entry stub required at gate, finalized post-pass
- NFT / limited-edition mint design (Phase 6+) — cascade designed before mint
- Sync-deal economics negotiation — cascade-aware deal terms
- Fan-tier offer design (Bandcamp, ConvertKit, Discord) — cascade-aware pricing
- Wealth IS theses composition — per-release revenue forecasting

## Graph schema (`catalog/royalty-graph.json`)

Per-release entry:

```json
{
  "song_id": "frank-riemer_20260501_threshold",
  "release_date": "2026-05-01",
  "label": "frank-riemer",
  "persona": "frank-riemer",
  "parent_canon": {
    "label_canon_ref": "labels/frank-riemer/CANON.md@v0.1",
    "persona_canon_ref": "labels/frank-riemer/personas/frank-riemer/CANON.md@v0.1"
  },
  "contributors": [
    {
      "name": "Frank Riemer",
      "role": "composer",
      "split_percent": 50,
      "pro_id": "ASCAP-...",
      "pro_society": "ASCAP",
      "rights": ["composition", "recording-performance"]
    },
    {
      "name": "Arcanea Records BV",
      "role": "publisher",
      "split_percent": 25,
      "pro_id": "...",
      "rights": ["publishing"]
    },
    {
      "name": "Arcanea Records BV (label)",
      "role": "label",
      "split_percent": 25,
      "rights": ["master-rights"]
    }
  ],
  "rails": {
    "streaming": {
      "distrokid_id": "...",
      "distrokid_split_config": "...",
      "expected_payouts_per_stream": "..."
    },
    "bandcamp": {
      "bandcamp_id": "...",
      "direct_split_to_arcanea": 0.85,
      "platform_take": 0.15
    },
    "sync": {
      "library_partners": [],
      "direct_deal_history": [],
      "default_split": "negotiated per deal; cascade preserves contributor splits above"
    },
    "nft": {
      "chain": "tbd-phase-6",
      "contract_address": null,
      "mint_quantity": null,
      "primary_sale_split": null,
      "secondary_royalty_percent": null,
      "secondary_split": null,
      "phase_6_design_pending": true
    },
    "fan_tier": {
      "platforms": [],
      "tier_design_pending": true
    },
    "limited_edition_physical": {
      "type": null,
      "phase_6_design_pending": true
    }
  },
  "attestation": {
    "sip_hash": "...",
    "ai_disclosure_metadata": "AI-generated via Suno v5; AI-cover via nano banana 2; AI-video via Seedance 2",
    "vocal_consent_doc_path": null
  },
  "creator_forge_lineage": {
    "parent_creation_card": null,
    "fork_history": [],
    "attribution_cascade_active": true
  },
  "graph_version": "0.1",
  "graph_locked_date": "2026-05-01"
}
```

## Operations

### 1. At gate (release-gate dispatch)

Generate stub entry with required fields populated for streaming + bandcamp (per-label), and stubs for sync + nft + fan-tier marked as `phase-6-design-pending` if applicable.

**Refusal:** if contributors not enumerated, splits not summing to 100%, or master-rights ambiguous, gate refuses pass.

### 2. Post-release finalization

After DistroKid mints ISRC:
- Populate streaming.distrokid_id
- Confirm DistroKid split-config matches contributors splits
- Lock graph entry with attestation_hash
- Update catalog row's royalty_graph_id to entry path

### 3. Sync-deal economics

When sync-deal opportunity arrives (`/music-sync-pitch` follow-up):
- Pull existing graph entry
- Design deal terms that **preserve** cascade splits (composer + publisher + label all get their slice)
- Refuse "single-buyer-takes-all" deals that violate cascade
- Update graph: `sync.direct_deal_history` entry with terms + per-contributor-slice

### 4. NFT / limited-edition design (Phase 6+)

Design **before** mint:
- Mint quantity (limited drop discipline)
- Primary sale split (% to each contributor)
- Secondary royalty rate (typically 5-10%)
- Secondary royalty split (% to each contributor on every secondary sale)
- Contract address (multi-sig with Frank as canonical updater)
- Cascade-on-chain encoding (royalty splits encoded in NFT contract — not retrofitted)

**Refusal:** mint without graph design = blocked.

### 5. Fan-tier design (Phase 6+)

Per-platform tier offer design:
- Tier price + benefits per tier
- Per-tier-revenue cascade split (Frank/composer + label + platform)
- Tier-redemption mechanics (Bandcamp subscriptions, ConvertKit pricing, Discord roles)

### 6. Creator Forge composition (Phase 6+)

Each release as a forkable creation card:
- `parent_creation_card` if this song forks an earlier work (e.g., a remix)
- `fork_history` if other practitioners fork this song's prompt/structure
- `attribution_cascade_active` flag — when true, every fork carries automatic upstream attribution + royalty share

## Wealth IS composition

Royalty graph composes with Wealth IS theses:
- Per-release revenue forecasting (streaming + sync + direct + NFT + fan-tier)
- Per-persona revenue baseline (sum across releases)
- Per-label revenue rollup
- Cross-label aggregation
- Forecast inputs to `/wealth-dpi` and `/wealth-theses` if active

## Refusal triggers

- NFT mint without graph designed
- Sync deal that violates cascade sovereignty
- Limited-edition without per-edition pricing + cascade-split
- Fan-tier without cascade design
- Contributors not enumerated at gate
- Splits not summing to 100%
- Master-rights ambiguous
- Vocal-consent doc missing for AI-cloned vocals

## Composes with

- `music-is/release-gate` (gate dispatch event)
- `music-is/distribution-flow` (distro IDs populated post-mint)
- Creator Forge (lineage + cascade — Phase 6 integration)
- Wealth IS (revenue forecasting composition)
- `royalty-architect` agent (Sonnet-tier owner)

## Output

- At gate: graph entry stub — confirm or refuse
- Post-release: locked graph entry with attestation_hash
- Sync-deal opportunity: cascade-preserved deal terms draft
- NFT/limited design: mint contract + split spec ready for on-chain encoding
- Fan-tier design: per-tier pricing + cascade spec ready for platform setup

---

**Built on SIP** — `skills/music-is/royalty-graph.md` · v0.1 · Senior tier (Sonnet 4.6) · Cascade designed before mint · Creator Forge composition · Wealth IS composition.

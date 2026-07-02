# Examples — Sanitization Rules

The examples in this directory are **archetypal personas, not real operators.** They demonstrate the substrate's shape without leaking any contributor's positions.

## The two archetypes

### Jane — The Freelance Designer (Tier 0–1)

- **Net worth:** ~€300K
- **Composition:** 50% liquid (savings + cash), 30% crypto (BTC/ETH index), 20% equities (broad index ETFs)
- **Entity:** Personal only — no BV, no LLC
- **Jurisdiction:** Netherlands (Box 3 reference jurisdiction)
- **Cadence:** Weekly review (Loop 2) + monthly close (Loop 3) only
- **Tooling:** Tier 0 — markdown-only, no Python, no Docker
- **Purpose:** Demonstrates the minimum-viable substrate

### Marcus — The Founder (Tier 1–2)

- **Net worth:** ~€1.2M
- **Composition:** 30% crypto (across self-custody + 2 exchanges), 40% equities (mix of broad index + concentrated growth), 20% real estate (primary residence equity), 10% cash + working capital in BV
- **Entity:** Personal + Operating BV + Holding BV
- **Jurisdiction:** Netherlands (BV + DGA structure)
- **Cadence:** All five loops, with annual architecture review
- **Tooling:** Tier 1 — multi-agent debate, OpenBB feeds, Notion hub
- **Purpose:** Demonstrates the full-substrate composition

## Sanitization rules applied

For every file in this directory:

1. **No real names.** Jane and Marcus are fictional.
2. **No real allocations.** Percentages are archetypal (50/30/20, 40/30/20/10) — not anyone's actual.
3. **No real EUR amounts > €10K** that could fingerprint a real operator.
4. **No real exchange specifics.** References use generic "Exchange A/B" or globally-largest 3 (Coinbase, Binance, Kraken).
5. **No real wallet addresses.** Even watch-only addresses fingerprint.
6. **No real Notion page IDs, database IDs, workspace structures.**
7. **Macro context uses real public data** at example timestamps (FRED is public).

## Verification

Before any PR adds to this directory, the contributor confirms:

- [ ] The persona is clearly fictional (different name, profile, location specifics if any)
- [ ] Allocations are archetypal, not the contributor's actual
- [ ] No exchange-specific phrasing that fingerprints the contributor's real platforms
- [ ] No EUR/USD amounts > €10K outside example placeholders
- [ ] Macro values are public information (FRED, CoinGecko, alternative.me) at the timestamp shown
- [ ] No identifying tells (city neighborhood names, family relationships, etc.)

## What examples show

Each archetype directory contains:

```
jane-freelance/ or marcus-founder/
├── README.md                          # who this archetype is
├── snapshots/
│   ├── 2026-W18-snapshot.md           # archetypal portfolio snapshot
│   └── 2026-W19-snapshot.md
├── sessions/
│   ├── 2026-W18.md                    # weekly Strategy Session
│   ├── 2026-W19.md
│   └── thesis/
│       └── morpho-yield-rotation-2026-W19.md  # thesis-debate session
├── theses/
│   └── index.yaml                     # thesis log
├── trajectories/
│   └── (none — synthetic archetypes don't produce real outcomes)
└── tax-overlays/
    └── NL.yaml                        # reference tax overlay
```

## Why archetypal, not synthetic

Synthetic data risks looking real. Archetypal personas are **explicitly fictional** in their READMEs, so a reader can't mistake them for a real operator's data. This is the strongest privacy guarantee.

## Extending

If you want to contribute a new archetype:

- "Felix the freelancer with high crypto allocation" — Tier 1, Switzerland jurisdiction
- "Sara the early-retirement engineer" — Tier 0, US jurisdiction, Roth-heavy
- "Yusuf the family-office operator" — Tier 2+, complex structure

Submit PR with all sanitization rules applied. Maintainers will review.

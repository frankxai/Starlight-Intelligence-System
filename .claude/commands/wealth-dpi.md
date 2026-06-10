---
name: wealth-dpi
description: Disruptive Passive Income ledger + thesis engine. Tracks DPI sources, compounding curves, diversification, and gate-to-gate progression. Reference implementation for Wealth IS vertical.
allowed-tools: Read, Write, WebSearch, mcp__notion
argument-hint: <command: status | add <source> | thesis <hypothesis> | project <horizon>>
---

# /wealth-dpi

Load `VERTICALS.md` § Wealth IS, the Wealth IS `MEMORY.md`, and any active DPI ledger in Notion.

**DPI = Disruptive Passive Income.** Non-linear-to-labor income from compounding assets. Not "money while sleeping" — *income architecture that is structurally decoupled from hours worked.*

## Core categories (canonical DPI taxonomy)

1. **Catalog royalties** — recorded music, content ID, sync licensing, book royalties, evergreen course revenue.
2. **Protocol attribution** — licensing fees or equity allocated to protocol authors (e.g., SIP attribution at scale).
3. **Equity positions** — private company stakes, advisor equity, angel positions, ecosystem partner equity.
4. **IP licensing** — canon licensing, trademark licensing, design licensing.
5. **Yield-bearing assets** — real estate, treasuries, productive holdings.
6. **Audience-as-asset** — newsletter, community, creator network; monetized via high-margin offers, not ads.

Exclude: consulting revenue, employment, day-rate work. Those are labor — adjacent but not DPI.

## Subcommands
$ARGUMENTS

### status
Emit the current DPI portfolio:
- Sources active, ranked by monthly yield.
- Compounding curve per source (flat / linear / compounding / decaying).
- Concentration risk: % of DPI from single source.
- Gate status: current DPI vs target gates (see Gate ladder below).

### add `<source description>`
Register a new DPI source:
- Category (1–6 above).
- Yield mechanism (subscription / royalty / equity dividend / rent / attribution fee / license).
- Compounding type (flat / linear / compounding / decaying).
- Current monthly yield (can be zero at inception).
- Projected yield at T+12 months.
- Ownership / vehicle (ZZP / Starlight Holding BV / Arcanea BV / personal).

### thesis `<hypothesis>`
Stress-test a DPI thesis. Format:
- Hypothesis stated clearly.
- Market / mechanism / moat.
- Time to first €1 / month.
- Time to first €1000 / month.
- Kill criteria — what would invalidate the thesis.
- Diversification fit — does this reduce or concentrate existing portfolio risk?

### project `<horizon>`
Project DPI portfolio at horizon (6M / 12M / 24M / 60M). Emit:
- Baseline (current sources, current compounding).
- Target (commitments + new sources in roadmap).
- Gap analysis — which gate is reachable at which horizon.

## Gate ladder

Illustrative DPI gates (monthly net, EUR) — these are framework defaults, not anyone's real numbers:

| Gate | Monthly DPI | Unlocks |
|------|-------------|---------|
| **G1 — Survival** | €3,000 | Baseline living costs covered without labor income. |
| **G2 — Sovereign** | €8,000 | Chosen lifestyle without labor income. |
| **G3 — Anchor asset** | €18,000 | Primary lifestyle asset + reserve. |
| **G4 — Multi-base** | €40,000 | Second and third base layer. |
| **G5 — Compound freedom** | €80,000+ | Full base layer + creative hub + investment velocity. |

Gates are individual; Wealth IS as a vertical ships the framework, each user defines their own gates. Operators keep their real ladder in `private/VERTICALS-state.md` (gitignored instance state) — never in this public file.

## Output shape (status example)

```
# DPI Status — <date>

## Portfolio
| Source | Category | Yield / mo | Compounding | Vehicle |
|--------|----------|-----------|-------------|---------|
| <name> | <cat>   | €<amount> | <type>      | <veh>   |

Total monthly DPI: €<sum>
Concentration risk: <%> from <top source>

## Gate status
Current: <G_n>
Next gate: <G_{n+1}> — €<target>/mo (gap: €<gap>/mo)
Reach date (baseline compounding): <date>
Reach date (with roadmap commitments): <date>

## Load-bearing action
<Single action with highest expected DPI lift in next cycle>

---
**Built on SIP** · Wealth IS vertical · <date>
```

## Rules

- No hypothetical DPI. Only sources with a real yield mechanism and real ownership.
- Consulting is not DPI. Tag consulting revenue separately.
- Compounding type is a claim, not a hope. Tag speculative compounding as `compounding?` until validated by 3 consecutive cycles.
- Kill criteria are mandatory for new thesis entries. Without kill criteria, a thesis becomes a belief.

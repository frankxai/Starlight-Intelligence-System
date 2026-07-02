# Architecture Overview

## The premise

The compounding edge for a part-time investor is not alpha. It is **not making catastrophic decisions** — panic-sells in drawdowns, FOMO buys at tops, position-size errors, tax mistakes, exchange concentration risk, key-management failures.

A multi-agent debate engine + a structured journal + a human-gated execution layer + a memory of past theses outperforms intuition alone — for the same reason cockpit checklists outperform pilot intuition alone, and code review outperforms solo developer judgment.

This substrate imposes that discipline.

## The atomic unit

The **Strategy Session** is the atomic unit of the IIS. Every operation in the system either produces or consumes a Session.

A Session is a closed, dated, JSON-validated artifact containing:

```yaml
session:
  id: 2026-W19                          # ISO week or specific date for ad-hoc
  date: 2026-05-10                      # Sunday of the review week
  mode: weekly | rebalance | thesis-debate | retrospective
  author: <pseudo>                      # Never real-identity in OSS
  macro_context:
    fed_funds_rate: 4.50
    dxy: 99.2
    m2_yoy: 4.1
    yield_curve_2_10: -0.30
    fear_greed_index: 72
    btc_dominance: 54.0
    notes: "Macro tightening continues, risk-on still dominant"
  portfolio_snapshot_ref: snapshot-2026-W19  # references private snapshot, not embedded
  agent_debate:
    - agent: macro-risk
      stance: "Tighten cash buffer; recession indicators amber"
      evidence: ["yield_curve_2_10: -0.30", "fed_funds 4.50%"]
      confidence: medium
    - agent: crypto-dca
      stance: "Continue weekly DCA at current levels"
      evidence: ["BTC 200d MA breached", "fear_greed 72 (greed)"]
      confidence: high
    - agent: tax-optimizer
      stance: "Pre-Jan 1: consider rotating BTC to BV before Box 3 valuation"
      evidence: ["Box 3 effective rate 2.16%", "BV VPB 19% on realized only"]
      confidence: high
    - agent: risk-manager
      stance: "Drawdown discipline: hold stops; do not chase"
      evidence: ["last 30d max drawdown: -8%", "no thesis violations"]
      confidence: high
  ranked_opportunities:
    - thesis_id: thesis-2026-W19-01
      summary: "Increase USDC yield via Morpho lending"
      size_suggested_pct: 5
      confidence: medium
      risk_level: low
      conditional_on: "Morpho TVL > $X, smart contract audit confirmed"
  risk_flags:
    - "Binance regulatory pressure ongoing — verify exchange concentration < 30%"
    - "DAC8 reporting active for 2026 — ensure Q1 export complete"
  proposed_actions:
    - action: "Rotate 5% portfolio to USDC yield position"
      conditional_on: "Above thesis conditions"
      deadline: 2026-05-17
      requires_human_approval: true
  human_verdict: pending  # approve | modify | reject | pending
  outcome_tracking:
    filled_after: 2026-08-10  # 90 days post-action
    realized_outcome: null    # filled retrospectively
    lessons: null              # filled retrospectively
```

Why the Strategy Session is the right atomic unit:
- It captures the **debate transcript**, not just the conclusion
- It is **auditable** retrospectively
- It is **measurable** (proposed action → realized outcome)
- It is **framework-agnostic** (markdown + JSON, runs in any agent CLI)
- It produces **a corpus over time** that drives the learning loop

## The five loops

The substrate operates on five cadences. Each loop produces specific Session modes or related artifacts.

| Loop | Cadence | Mode | Produces |
|---|---|---|---|
| Daily Pulse | Weekday morning | (no session) | Slack digest: top movers, renewals, due actions |
| Weekly Review | Sunday | `mode: weekly` | One Session/week, debate transcript, human-gated actions |
| Monthly Close | 1st of month | (snapshot) | Portfolio snapshot, runway recalc, Box 3 running total |
| Quarterly Tax | Jan/Apr/Jul/Oct | `mode: rebalance` | Rebalance Session, tax-scenario refresh |
| Annual Architecture | December | (full review) | Annual report, ARCHITECTURE.md updates, inheritance refresh |

See `architecture/02-five-loops.md` for the full cadence spec.

## The three tiers of security

This is the most important architectural decision. Read `architecture/01-three-tier-security.md` carefully before any implementation.

| Tier | What lives here | AI access |
|---|---|---|
| **Tier 1 — Vault** | Seed phrases, hardware-wallet PINs, Shamir shares | ZERO. Physical only. |
| **Tier 2 — Protected** | API keys with trade/withdraw permission, bank credentials, OTP seeds | ZERO. Encrypted local (KeePass/VeraCrypt). |
| **Tier 3 — Operational** | Read-only API keys, portfolio aggregation, snapshots, tax models | FULL READ. Limited write (tracking files only). NO signing, transfers, credential access. |

**This boundary is non-negotiable.** Any contributor proposing to weaken it will be redirected to fork.

## The three tiers of usage

| Tier | Audience | Tooling | Outcome |
|---|---|---|---|
| 0 | Anyone | Markdown + agent CLI | Strategy Session journal |
| 1 | Intermediate | + OSS install (multi-agent debate, OpenBB) | Weekly debates + drift alerts |
| 2 | Advanced | + Live execution (AgentKit/Alpaca/Freqtrade) | Autonomous DCA + thesis-tracked execution |

Tier 0 requires zero infrastructure. Tier 2 is engineering effort. **Most users live at Tier 1.**

## The component map

```
┌─────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE LAYER                       │
│  Data Feeds (FRED, OpenBB, DefiLlama, Glassnode, F&G)       │
│         ↓                                                    │
│  Multi-Agent Team (11 personas, debate transcript)          │
│         ↓                                                    │
│  Strategy Session (markdown + JSON, schema-validated)       │
└─────────────────────────────────────────────────────────────┘
         ↓ HUMAN APPROVAL GATE
┌─────────────────────────────────────────────────────────────┐
│                     EXECUTION LAYER                          │
│  Crypto:     Coinbase AgentKit + Eliza OS                   │
│  DCA/Rules:  Hummingbot / Freqtrade (rule-bounded autonomy) │
│  Stocks:     Alpaca (paper → live) / IBKR (EU access)       │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│                     MEMORY + RETROSPECTIVE                   │
│  Session corpus → Thesis log → Outcome tracking             │
│         ↓                                                    │
│  ReasoningBank trajectory wiring (which agents called it    │
│  right? which framing held up? what biases recurred?)       │
│         ↓                                                    │
│  Distilled lessons → next Session's debate priors           │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│                     PRIVATE OPERATIONAL TIER                 │
│  Tier 1 vault, Tier 2 credentials, real positions           │
│  (NEVER in this repo. Always in user's private store.)      │
└─────────────────────────────────────────────────────────────┘
```

## The honest framing

Read `architecture/10-honest-limits.md` and `docs/why-not-trading-bot.md` before going further. The substrate is positioned as **decision-support and discipline-imposition**, not alpha-generation. This is not modesty; it is the empirical truth of what multi-agent + structured-journal systems actually deliver.

If you want a trading bot, this is not the right substrate. Look at Freqtrade or Hummingbot directly.

If you want a discipline that compounds over a 5-10 year horizon and survives bear markets without portfolio-blowing decisions, this is the substrate.

## Next reads

1. `architecture/03-strategy-session.md` — the atomic unit in full detail
2. `architecture/04-multi-agent-team.md` — the 11 personas
3. `architecture/05-memory-architecture.md` — the learning loop
4. `architecture/10-honest-limits.md` — what this DOES NOT promise
5. `PRIVACY-BOUNDARY.md` — what never goes in this repo

# Absorption record — TradingAgents (Tauric Research)

> Provenance discipline: what was absorbed, from where, under what license, into which files. Cross-asset/composition rules require named lineage (Wealth IS refusal pattern) — the same applies to external absorption.

- **Source:** `github.com/TauricResearch/TradingAgents` (Apache-2.0, ~87k★ as of 2026-07). Multi-agent LLM trading-firm simulation: analyst roles → bull/bear researcher debate → trader → risk management.
- **Verdict (2026-07-02 review):** absorb the *patterns*; do not vendor or fork the code. The runtime is Python and simulation-shaped; our engine is markdown/schema/MCP-shaped.

## What was absorbed, and where it landed

| TradingAgents pattern | Landed in |
|---|---|
| **Bull/bear researcher debate** before a trade decision | `/invest-thesis-debate` (`engine/commands/thesis-debate.md` + `.claude/commands/invest-thesis-debate.md`) — argued from independently-formed (blind-parallel) analysis stances |
| **Risk layer as a distinct role that constrains the trader** | Already native to the engine (risk layer, veto-on-size-not-direction) — TradingAgents corroborates the separation rather than sourcing it |
| **Persistent decision log with outcome-grounded reflections** | `engine/schemas/trajectory.schema.json` usage discipline: every acted-on recommendation writes thesis→action→outcome→lesson; `/invest-retro` scores decisions against realized outcomes and feeds `calibration_notes` |
| **Structured-output decision agents** | Output contracts in `engine/agents/catalog.json` (`output_schema` per agent) |

## What was deliberately NOT absorbed

- Autonomous trade execution in any form — our gate doctrine forbids it (human token above DCA).
- The simulation harness and its market-replay loop — freqtrade (run as an appliance) covers backtesting with a mature, maintained loop; see `RUNBOOK.md`.
- Any signal or strategy content — patterns only, no alpha claims (SOUL.md).

---

**Built on SIP** — absorption record · tradingagents · 2026-07-02

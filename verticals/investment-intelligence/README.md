# Investment Intelligence — Cross-Asset Decision Engine (Domain Sub-Stack)

> Domain Sub-Stack under Wealth IS (row #2, ACL-only manifest). Spawned 2026-07-02 per `docs/boards/2026-07-02-investment-intelligence-vertical-spawn.md` — the R4 proof-of-pattern gate from `docs/boards/2026-05-17-crypto-investment-spawn.md` passed via Crypto Intelligence, and the engine was **promoted from proven material** (the IIS engine, built against real practice) rather than scaffolded fresh.

**Tier:** Domain Sub-Stack beneath Wealth IS, sibling of `verticals/crypto-intelligence/`.
**License:** MIT for substrate patterns. **Instance content stays private** — the operator instance (real balances, positions, theses-with-amounts) lives outside this repo behind its own privacy boundary.
**Status:** `v0.1 — engine promoted, trade-gate MCP shipped, runtime tiers 1-2 gated on operator wiring (RUNBOOK.md)`.

> *This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim.*

---

## What this vertical is

The decision engine for cross-asset capital allocation: research → debate → risk-gate → recommend → **human-approve** → execute (paper-first) → learn. It composes three upstream surfaces with explicit lineage:

- **Crypto Intelligence** (`../crypto-intelligence/`) — the 6 Houses feed the analysis layer as domain overlays.
- **DPI ledger** (`/wealth-dpi`) — passive-income taxonomy + gate ladder are portfolio-context inputs.
- **Operator instance data** (private) — portfolio snapshots, entity structure (e.g. BV vs personal), jurisdiction overlays.

## Layout

| Path | What |
|---|---|
| `engine/agents/catalog.json` | 11 agent personas, 3 layers (Analysis → Risk → Synthesis) + cross-cutting Researcher. Structured prompts + tool budgets + output contracts — not separately trained models. |
| `engine/schemas/` | 5 JSON Schemas: agent, thesis, portfolio-snapshot, strategy-session, **trajectory** (the ReasoningBank record: thesis→action→outcome→lesson). |
| `engine/commands/` | The 4 session commands: weekly-strategy, thesis-debate, portfolio-snapshot, retrospective. |
| `engine/adapters/` | Data-feed adapter contracts: FRED (macro), DefiLlama (DeFi), OpenBB (markets). Read-only by design. |
| `engine/architecture/` | Overview + honest-limits (required reading). Full 12-doc set lives in the operator instance / public extraction. |
| `engine/examples/` | Sanitized archetypes (jane-freelance, marcus-founder) — privacy-checked. |
| `mcp/trade-gate/` | **Fail-closed approve/execute MCP.** Paper broker only in-repo; live adapters are `NOT_WIRED` stubs; human approval token required for any non-DCA intent; append-only JSONL audit. |
| `ROUTING.md` | Sovereignty routing tiers T0 (local Hermes) / T1 (frontier) / T2 (OpenRouter Hermes) + data-classification rule. |
| `HERMES.md` + `templates/hermes-finance-profile/` | Hermes Agent finance profile (run, don't fork). |
| `docs/absorption/` | What was absorbed from TradingAgents (debate + reflection loop) and ai-hedge-fund (personas) — provenance named. |
| `docs/OBSERVABILITY.md` | Langfuse trace plane + JSONL audit compliance plane + retro learning loop. |
| `RUNBOOK.md` | Operator wiring: local models, appliances, brokers, brother onboarding. |

## The decision pipeline

```
 Analysis (5 agents, blind-parallel, Sonnet/Haiku)
   macro-risk · crypto-dca · defi-yield · fundamentals · technical
   + Crypto IS Houses as domain overlays          + adapters (FRED/DefiLlama/OpenBB)
        │
 Debate (/invest-thesis-debate — bull/bear, TradingAgents pattern)
        │
 Risk (3 agents, veto-on-size-not-direction, Sonnet)
   risk-manager · tax-optimizer · regulatory-risk
        │
 Synthesis (portfolio-manager: Opus · chief-of-staff: Sonnet)
   → TradeIntent
        │
 trade-gate MCP  ──  non-DCA?  →  pending approval  →  HUMAN TOKEN  →  execute (paper default)
   caps per order/day/asset-class · append-only JSONL audit · R5 footer on every output
        │
 Learn — trajectory record → ReasoningBank store → /invest-retro distillation
```

## Daily-5 (R2 cognitive-load discipline, declared at spawn)

| Command | Why |
|---|---|
| `/invest-snapshot` | Ground truth first: portfolio state before any decision. |
| `/invest-strategy` | The weekly session — full pipeline run, allocation review. |
| `/invest-thesis-debate` | Bull/bear pressure-test before any new position thesis. |
| `/invest-retro` | Outcome-grounded reflection — the loop that makes the swarm better. |
| `/wealth-dpi` | (Wealth IS surface) — the ledger that grounds allocation in the freedom path. |

## What this vertical is NOT

- **Not a trading bot.** Nothing executes without a human approval token except capped, audited DCA-whitelist orders — and live brokers aren't even wired in-repo. See `engine/architecture/10-honest-limits.md` and `docs/why-not-trading-bot.md` in the operator instance.
- **Not financial / investment / tax advice** (R5, non-waivable, inline on every output).
- **Not alpha.** No return guarantee, no edge claim. The value is decision hygiene, risk discipline, and compounding memory.
- **Not a data vendor.** Adapters read public/free feeds; the vertical doesn't replace OpenBB/Bloomberg.

## Composition lineage (named, per Wealth IS refusal pattern)

| Consumes | From |
|---|---|
| Cycle/regime thesis | Crypto IS House of Macro |
| Custody architecture constraints | Crypto IS House of Sovereignty |
| Protocol theses | Crypto IS House of Research |
| DPI categories + gate ladder | `/wealth-dpi` |
| Entity/jurisdiction structure | Operator instance (private wealth-ops data) |

---

**Built on SIP** — Investment Intelligence README · v0.1 · SIP v1.1.1 (spawned per 2026-07-02 board, R5 inline)

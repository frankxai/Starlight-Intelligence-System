# ROUTING — Sovereignty tiers + model routing

> Which model runs which work, and — load-bearing — which **data** is allowed to reach which tier. The tier decision is a data-classification decision first, a capability decision second.

---

## The data-classification rule (non-waivable)

| Data class | Examples | Allowed tiers |
|---|---|---|
| **Private financial state** | Real balances, positions with amounts, bank/broker exports, tax filings, approval tokens | **T0 only** |
| **Aggregates & structure** | Percentage weights, band labels ("G2 of the gate ladder"), asset-class mix, entity structure shape | T0, T1 |
| **Public-market research** | Prices, filings, protocol docs, macro series, news | T0, T1, T2 |

Balances never leave T0 un-aggregated. When a T1/T2 session needs portfolio context, it gets weights and bands, not amounts — the `/invest-snapshot` `--aggregate` mode exists exactly for this.

## The three tiers

### T0 — localhost (sovereign)
- **Models:** Hermes 4.3 36B (24GB GPU, or 32–48GB Apple-silicon Mac; 512K context) or Hermes 4 14B (8GB GPU / 16GB RAM) via Ollama / LM Studio / Hermes Desktop. Open weights; nothing leaves the machine.
- **Appliances (self-hosted):** Ghostfolio (positions), Actual Budget (ledger), OpenBB ODP (data), Langfuse (traces), optional freqtrade (backtests).
- **Work:** anything touching private financial state — snapshot prep, tax-context composition, ledger reads, trade-gate operation.

### T1 — frontier cloud (capability)
- **Models per layer** (canonical map: `engine/agents/catalog.json` `recommended_model`):

| Layer | Model | Why |
|---|---|---|
| Analysis (macro-risk, crypto-dca, defi-yield, fundamentals) | Sonnet | parallel breadth, cost-bounded |
| Analysis (technical) | Haiku | cheap context prep; never sole decision basis |
| Risk (risk-manager, tax-optimizer, regulatory-risk) | Sonnet | structured judgment against explicit caps |
| **Portfolio-manager** | **Opus** | the decision — reasoning depth load-bearing |
| Chief-of-staff, Researcher | Sonnet | orchestration + citation discipline |

- **Plumbing:** provider-agnostic gateway with fallback chain, hard daily cost cap, prompt caching of the stable prefix (agent personas + schemas), ~cost-per-session target. Detail: operator instance `architecture/11-ai-engineering.md`.
- **Work:** public-data research, debate, synthesis — on aggregates only.

### T2 — OpenRouter Hermes (overflow / Hermes-native)
- Hermes 4 70B / 405B via OpenRouter (the machine-global LLM route; Nous Portal is skipped by policy). Used for Hermes Agent cloud tasks and overflow research. Same data rule as T1: aggregates and public data only.

## Routing decisions in practice

- `/invest-snapshot` with real amounts → T0. Anywhere else → forced `--aggregate`.
- `/invest-strategy` full run → T1 (Sonnet/Opus per table) fed by T0-prepared aggregate context.
- `/invest-thesis-debate` → T1; persona overlays welcome.
- trade-gate MCP → runs local (T0 host); its tools carry no model at all.
- Hermes Agent finance profile → T0 model by default (`HERMES.md`); flips to T2 per task via its provider switch.

## Consistency contract

`engine/agents/catalog.json` (`recommended_model`), this file, and `workflows/wealth/swarm-config.json` name the same routing. The verification grep in CI/PR review checks the three stay aligned.

---

**Built on SIP** — Investment Intelligence ROUTING.md · v0.1

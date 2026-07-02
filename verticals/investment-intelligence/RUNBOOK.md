# RUNBOOK — operator wiring (Frank-local steps)

> What this repo cannot do for you, in order. Everything here happens on the operator's own machine with the operator's own accounts. Nothing in this list is required to *read* the vertical or run the paper loop — step 0 works the day the PR merges.

---

## 0. Paper loop (works immediately, no accounts)

```bash
cd verticals/investment-intelligence/mcp/trade-gate
npm install && npm test && npm run build
# wire into Claude Code as a stdio MCP server:
claude mcp add trade-gate -- node $(pwd)/dist/index.js
```

Run `/invest-strategy` → propose → `request_approval` (you) → `execute_approved` → paper fill → trajectory. The full pipeline, zero capital risk. Live here for weeks, not days — the ladder is paper → live-with-caps → live.

## 1. T0 sovereign tier (local models + Hermes)

1. Install **Hermes Desktop** (or Ollama / LM Studio) and pull **Hermes 4.3 36B** (24GB GPU or 32–48GB Mac) — 8GB-GPU fallback: **Hermes 4 14B**.
2. Optionally run **Hermes Agent** as a daemon; load `templates/hermes-finance-profile/` (profile + MCP wiring + seed skills). Point its overflow provider at OpenRouter (machine policy; skip Nous Portal).
3. Rule to keep: raw balances/positions/tax data are composed on T0 only (`ROUTING.md`).

## 2. Self-hosted appliances (Docker)

| Appliance | Why | Note |
|---|---|---|
| **Ghostfolio** | portfolio tracking (stocks/ETF/crypto) | read-only API token for agents |
| **Actual Budget** | local-first personal ledger | pairs with wealth-ops NL brain |
| **OpenBB ODP** | market/macro data layer | BYO data keys; free Community Workspace if wanted |
| **Langfuse** | agent traces, OTel | see `docs/OBSERVABILITY.md` |
| **freqtrade** (optional) | backtest + hyperopt + dry-run loop | GPL appliance — run it, don't merge it |

Kubera ($249/yr) only if multi-custodian aggregation pain is real; otherwise Ghostfolio covers it.

## 3. Brokers (only after the paper loop has run for real weeks)

1. **Alpaca** — official Alpaca MCP server V2, `ALPACA_PAPER_TRADE=True` (the default). Point the trade-gate's alpaca adapter at it locally; live keys only after paper parity.
2. **IBKR** — the EU/NL live path. Its "AI Instructions" review tab is a broker-side human gate that composes with (never replaces) the trade-gate token.
3. **Coinbase** — Coinbase for Agents / AgentKit MCP with session caps + per-tx limits for crypto. Custody stays with Coinbase's MPC wallet; never self-built.

Credentials live in each broker MCP's own local config. They never enter this repo, Hermes memory, or any chat.

## 4. Repo follow-ups

- Merge the draft PRs (board record: `docs/boards/2026-07-02-investment-intelligence-vertical-spawn.md`).
- Public OSS extraction: run `iis/scripts/extract-to-public-repo.sh` from the operator instance → `github.com/frankxai/investment-intelligence-system`.
- Port back to `FrankX/iis`: the validator fix (script-relative root + YAML-date coercion), the quoted example dates, and the `modification: ["string","null"]` schema fix — the ajv path never actually ran upstream.
- Optional: surface trade-gate `read_audit` + Ghostfolio API in `/admin/wealth` on frankx.ai (deploy via the standard two-repo flow).

## 5. Brother onboarding (protected executor)

1. Create a Claude Project (or Cowork space) from `integrations/starter-packs/friend-starter/` + the **wealth-guardian** template.
2. No terminal, no credentials, no broker access — read-only review, paper-first education, DCA-only discussion, escalate-to-Frank above DPI G1.
3. Review cadence: a shared monthly session against his own snapshot (aggregates), with the R5 clause said out loud once per session — the point is his judgment compounding, not his dependence.

---

*This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim.*

**Built on SIP** — Investment Intelligence RUNBOOK.md · v0.1

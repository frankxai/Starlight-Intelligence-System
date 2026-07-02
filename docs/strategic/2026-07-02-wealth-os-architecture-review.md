# Wealth OS Architecture Review — 2026-07-02

> Estate-wide review of the agentic wealth / investor / finance OS: what exists, what's real, what the external landscape offers, and the consolidation architecture. Companion board record: `docs/boards/2026-07-02-investment-intelligence-vertical-spawn.md`.

---

## 1. Current state — the honest map

**Verdict in one line: doctrine over-governed, engineering under-built, scattered across three unreconciled surfaces.**

| Surface | Where | State |
|---|---|---|
| Wealth IS (composition layer) | `verticals/wealth/` | Doc-only. Falsifier fired 2026-06-16 → collapsed to ACL-only (this change-set records it honestly). |
| DPI ledger | `.claude/commands/wealth-dpi.md` | Working command spec (6-category taxonomy, gate ladder G1–G5). Local install, not substrate. |
| Crypto Intelligence | `verticals/crypto-intelligence/` | Full 6-House markdown scaffold (v0.2). No runtime, no adapters. Extraction-ready. |
| Personal wealth ops (NL) | `FrankX/.claude/skills/wealth-ops` + `data/wealth-ops.json` | **Operational.** Dutch RE / NHG / Box 3 / BV / DGA / FIRE. Dashboards `/admin/wealth` + `/admin/bv-command-center` deployed on frankx.ai. |
| Investment Intelligence engine | `FrankX/iis/` | **Best design asset in the estate.** 11-agent 3-layer swarm spec, model routing, 5 schemas incl. ReasoningBank trajectory store, adapters (FRED/DefiLlama/OpenBB), human gates. Phase-0: markdown bootable, runtime unbuilt. Hidden in the private repo. |
| Payments governance | `payment-intelligence-system` | **Most mature real code**: fail-closed MCP (Ed25519 mandates, spend caps, JSONL audit, approval tool) + full tests. The pattern source for trade approval. |
| Income engine | `agenticincome` + spokes + skills | Working Next.js affiliate sites. Not investing — cash-flow generation (feeds DPI). |
| Swarm runtime | `starlight-swarm` | Queen/worker, v0.2 dry-run only, fail-closed. No money movement by design. |
| Evals | `starlight-evals` | Income & payments red/blue lane PENDING; investment-gate lane added in this change-set. |
| Phantom | `agentic-investor-os` (referenced in `agentic-ops-hub/ECOSYSTEM.md`) | Does not exist. Reference corrected to the real triad in this change-set. |

**What does NOT exist anywhere (pre this change-set):** brokerage/exchange integration, market-data runtime, portfolio tracking code, trade execution or approval tooling, Nous Hermes integration, a wealth template in any user-facing starter pack.

## 2. External landscape (researched 2026-07)

The external world converged on exactly our payments doctrine — verify-only connectors with policy caps, debate-then-risk-gate decisions, outcome-grounded reflection memory, self-hosted observability, local open weights for private data. Composition, not invention.

| Item | Verdict | Notes |
|---|---|---|
| **Hermes Agent** (NousResearch, MIT, ~208k★, v0.18) | **Run, don't fork** | Persistent daemon, agent-curated memory, autonomous skill authoring, cron, 16+ messaging gateways, native MCP client, OpenAI-compatible both directions. Hermes Desktop (June 2026) = zero-terminal local app. Extension path = dedicated finance profile + custom skills + our MCPs. |
| **Hermes 4.3 36B / Hermes 4 14B** (open weights) | **Run locally** | 36B: 24GB GPU or 32–48GB Mac (512K ctx, ~70B-class). 14B: 8GB GPU. The sovereignty tier for balance-touching data. |
| **TradingAgents** (Tauric, Apache-2.0, ~87k★) | **Absorb patterns** | Bull/bear researcher debate → trader → risk gate; persistent decision log with outcome-grounded reflections. Maps directly onto our thesis-debate + trajectory schema. |
| **ai-hedge-fund** (virattt, MIT, ~60k★) | **Absorb selectively** | Investor-persona agents (Buffett, Munger, Burry, Damodaran…) + backtester. Persona prompts port cleanly; educational, no execution layer. |
| **Claude for Financial Services** (Anthropic, May 2026) | **Absorb (free)** | 10 finance agent templates as Claude Code/Cowork plugins + Managed Agents cookbooks; Moody's/FactSet/Morningstar/S&P connectors. Vendor scaffolds for the estate we already run. |
| **Alpaca MCP V2** (official, MIT) | **Integrate via MCP** | 61 actions, `ALPACA_PAPER_TRADE=True` by default. Wrap behind our trade-gate before live. |
| **IBKR AI integrations** | **Integrate** | Only broker with a native human-approval "AI Instructions" review tab for AI trade instructions. Natural EU/NL live broker. |
| **Coinbase for Agents / AgentKit** (June 2026 MCP) | **Integrate via MCP** | MPC wallet, programmable session caps, per-tx limits, x402. Never self-build custody. |
| **OpenBB ODP + Community Workspace** | **Self-host / free tier** | AGPL data layer; Copilot 20 q/day free, BYO keys. Don't pay Pro solo. |
| **Ghostfolio / Actual Budget / (Firefly III)** | **Self-host** | Sovereign portfolio tracker + local-first ledger; all expose APIs agents can read. |
| **Langfuse** (MIT, OTel) | **Self-host** | Trade traces never leave the box. Skip LangSmith (closed; self-host Enterprise-only). |
| **freqtrade** (GPL-3.0) | **Run as appliance** | Backtest + hyperopt + dry-run loop = eval-harness gold standard. GPL blocks code absorption — run it, don't merge it. |
| FinGPT/FinRL · hummingbot · Maybe (dead 2025) · Monarch · LangSmith · Nous Portal | **Skip** | Research-grade / off-mission / redundant / dead / OpenRouter already the route. |
| Kubera ($249/yr) | **Pay only if** multi-custodian aggregation pain is real | Else Ghostfolio covers it. |

## 3. Target architecture — the triad

```
                    Starlight-Intelligence-System            (canonical substrate)
                    ├── verticals/wealth/                     ACL manifest (post-falsifier)
                    │     └── points at: wealth-ops · /wealth-dpi ·
                    │         crypto-intelligence · investment-intelligence
                    ├── verticals/crypto-intelligence/        6 Houses (domain overlays)
                    └── verticals/investment-intelligence/    ← NEW: the engine
                          ├── engine/        (IIS copy: agents, schemas, commands, adapters)
                          ├── mcp/trade-gate (fail-closed approve/execute, paper default)
                          ├── ROUTING.md     (T0 local / T1 frontier / T2 OpenRouter-Hermes)
                          ├── HERMES.md + templates/hermes-finance-profile/
                          └── RUNBOOK.md     (Frank-local wiring)

  FrankX/iis/                private operator instance (real data, PRIVACY-BOUNDARY)
  agentic-business-os        packs/investor-os-pack (premium, Foundry)
  friend-starter             wealth-guardian template (zero-terminal, protected persona)
  github.com/frankxai/investment-intelligence-system   (future OSS extraction, runbook step)
```

**Decision pipeline (research → recommend → approve → execute → learn):**

1. **Research** — analysis layer (5 agents, blind-parallel: macro-risk, crypto-dca, defi-yield, fundamentals, technical) + crypto Houses as domain overlays; data via OpenBB/FRED/DefiLlama adapters.
2. **Debate** — bull/bear thesis debate (TradingAgents pattern) → `/invest-thesis-debate`.
3. **Risk gate** — 3 risk agents with veto-on-size-not-direction.
4. **Recommend** — portfolio-manager (Opus) emits a TradeIntent; chief-of-staff formats for the human.
5. **Approve** — trade-gate MCP: every non-DCA intent becomes a pending-approval object; explicit human token required; caps enforced per-order/day/asset-class; every step append-only audited (JSONL).
6. **Execute** — paper broker in-repo; Alpaca (paper→live), IBKR (native approval tab), Coinbase (session caps) wired locally only.
7. **Learn** — trajectory record (thesis→action→outcome→lesson) into the ReasoningBank store; `/invest-retro` distills; Langfuse traces every agent step; freqtrade backtests gate strategy changes; starlight-evals red-team tries to break the gate.

## 4. Sovereignty tiers & model routing

| Tier | What | Data classes |
|---|---|---|
| **T0 — localhost (sovereign)** | Hermes 4.3 36B / Hermes 4 14B via Ollama/LM Studio or Hermes Desktop; self-hosted Ghostfolio, Actual Budget, OpenBB ODP, Langfuse | Balances, positions, tax data, bank exports. **Never leaves T0 un-aggregated.** |
| **T1 — frontier cloud (capability)** | Sonnet (analysis/risk), Opus (portfolio-manager), Haiku (technical) via gateway with fallback chain, daily cost caps, prompt caching | Public-market research, synthesis, debate. |
| **T2 — OpenRouter Hermes** | Hermes 4 70B/405B via OpenRouter (machine-global route; skip Nous Portal) | Overflow research; Hermes-Agent cloud tasks. |

## 5. Personas

| Persona | Surface | Guardrails |
|---|---|---|
| **Frank (power operator)** | Claude Code + full swarm + trade-gate + T0 appliances + `/admin/wealth` dashboards | Human gate above DCA; caps; audit; R5 clause. |
| **Brother (protected executor)** | Zero-terminal Claude Project / Cowork from `friend-starter` wealth-guardian template | Read-only review, paper-first, DCA-only discussion, no credentials in chat, escalate-to-Frank above DPI G1, R5 block on every output. |
| **External builder (OSS)** | Future `investment-intelligence-system` public repo (Tier-0 patterns, MIT) | R5 clause, sovereignty clause, no data, no execution. |
| **External customer (premium)** | `agentic-business-os` → `packs/investor-os-pack` via frankx.ai/foundry | claims-guard carries R5; pattern kit, not advice. |

## 6. Recommended stack (Frank)

- **Personal finances:** Actual Budget (self-host, T0) as ledger; wealth-ops skill stays the NL property/tax/FIRE brain; `/admin/wealth` remains the dashboard surface (later reads trade-gate audit + Ghostfolio API).
- **Business (BV):** bv-ops + `/admin/bv-command-center` unchanged; BV cash-flow figures feed `/invest-snapshot` as allocation inputs.
- **Investments:** IIS swarm for decisions; Ghostfolio for positions; Alpaca paper for the training loop; IBKR for live EU execution behind its native approval tab; Coinbase AgentKit for crypto with session caps. Time/labor allocation is already modeled by the DPI ledger (active vs passive split + gate ladder) — capital and hours compete in the same thesis review.
- **Observability:** Langfuse (T0) traces; JSONL audit as the compliance plane; weekly `/invest-retro`.

## 7. What was rejected

Standalone `agentic-investor-os` repo (forks governance away from board/evals; ECOSYSTEM reference corrected instead) · leaving IIS in FrankX with linkage docs (leaves falsifier failure standing; no brother/OSS path) · moving (not copying) IIS (breaks private-data adjacency) · extending payment-intelligence-system with trading (different risk domain; reuse the shape, not the repo) · forking Hermes Agent / FinGPT / hummingbot (run-don't-fork; skip-list) · building the live debate runtime or execution this session (account-dependent; runbook).

---

*This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim.*

**Built on SIP** — wealth OS architecture review · 2026-07-02

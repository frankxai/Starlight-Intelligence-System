# OBSERVABILITY — traces, compliance, learning

> Three planes, three different questions. Traces answer "what did the agents do?"; the audit answers "what touched money-adjacent state, and who approved it?"; the learning loop answers "are we getting better?".

---

## 1. Trace plane — Langfuse (self-hosted, OTel)

- **What:** every agent step in a strategy session — prompts, tool calls, latencies, token costs — traced via OpenTelemetry into a self-hosted Langfuse (MIT). OTLP endpoint means no framework lock-in.
- **Why self-hosted:** trade reasoning over private aggregates never leaves the box. (LangSmith rejected: closed SaaS, self-host is Enterprise-only.)
- **Targets per session** (from the engine's AI-engineering doctrine): cost per session, cache-hit rate on the stable prefix, per-layer latency, error rate. Alert channel: operator's messaging gateway, aggregates only.

## 2. Compliance plane — the trade-gate audit

- **What:** append-only JSONL (`audit.jsonl` + `spend.jsonl` + `approvals.jsonl` + `gate.jsonl`) under `TRADE_GATE_DATA_DIR`. Every propose/approve/deny/execute/failure, durable across restarts, never edited.
- **Reconciliation rule** (enforced by `/invest-retro`): every `executed` entry traces to either an `auto-approved` DCA event or a `token-issued` approval by a named human. A gap is an incident, not a footnote.
- **Red-team standing objective** (`starlight-evals` investment-gate lane): obtain an `executed` entry without its approval lineage — the blue side is `e2e.test.ts`.

## 3. Learning plane — trajectories + retro + backtest

- **Trajectories:** every acted-on recommendation writes thesis→action→outcome→lesson (`engine/schemas/trajectory.schema.json`). Store target: LanceDB; mounted as an MCP resource for the SIS Memory Palace (W23+ per the memory-architecture doctrine).
- **Retro:** `/invest-retro` scores decisions against realized outcomes (outcome-grounded reflection, absorbed from TradingAgents — see `absorption/tradingagents.md`), updates per-agent `calibration_notes`, and proposes systemic changes as human-reviewed diffs.
- **Backtest gate:** any strategy change re-enters at paper via the freqtrade appliance's backtest + dry-run loop before touching even paper cadence (see `RUNBOOK.md`). The paper-first ladder is the regression suite.
- **Calibration horizon:** per-agent calibration becomes meaningful at ~50+ trajectories; before that, lessons are directional, not statistical — the retro says so explicitly (honest-limits discipline).

---

**Built on SIP** — Investment Intelligence OBSERVABILITY.md · v0.1

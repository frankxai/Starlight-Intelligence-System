# Absorption record — ai-hedge-fund (virattt)

> Provenance discipline: what was absorbed, from where, under what license, into which files.

- **Source:** `github.com/virattt/ai-hedge-fund` (MIT, ~60k★ as of 2026-07). Educational multi-agent system: investor-persona agents (Buffett, Munger, Graham, Damodaran, Ackman, Burry, …) + valuation/sentiment/fundamentals/technicals agents + risk manager + portfolio manager + backtester. Explicitly no real execution.
- **Verdict (2026-07-02 review):** absorb selectively — the persona-lens idea and the layer confirmation; skip the runtime.

## What was absorbed, and where it landed

| ai-hedge-fund pattern | Landed in |
|---|---|
| **Investor-persona agents as analytical lenses** | `AGENTS.md` § persona overlays — optional debate-diversity lenses (value / contrarian / quality / deep-value-short) layered onto the analysis stage of `/invest-thesis-debate`. Personas are archetypal stances, not celebrity imitations; they never bypass the risk layer or the gate. |
| **Analyst → risk manager → portfolio manager layering** | Corroborates the engine's native 3-layer topology (independent convergence — both trace to sane hedge-fund org design). |

## What was deliberately NOT absorbed

- The Python runtime and its LLM plumbing — the engine's model routing (`ROUTING.md`) already covers this provider-agnostically.
- The backtester — freqtrade (appliance, GPL-3.0 kept at arm's length) is the maintained backtest/dry-run loop; see `RUNBOOK.md`.
- Named-person personas as marketing surface — the substrate uses functional lens names; a fork may skin them as it likes under its own responsibility.

---

**Built on SIP** — absorption record · ai-hedge-fund · 2026-07-02

# HERMES — Nous Research integration (run, don't fork)

> How Hermes fits the Wealth OS: **Hermes Agent as a persistent local operator daemon with a dedicated finance profile, Hermes 4.x open weights as the T0 sovereign model tier.** Nothing is forked.

---

## The verdict (2026-07 review)

- **Hermes Agent** (`github.com/nousresearch/hermes-agent`, MIT, v0.18+): persistent daemon (runs on a $5 VPS or the home machine), agent-curated memory, autonomous skill authoring, cron scheduler, 16+ messaging gateways (Telegram/Discord/Signal/…), **native MCP client**, OpenAI-compatible in both directions. It moves too fast to fork — the intended extension path is exactly what we need: a **profile + custom skills + MCP wiring**.
- **Hermes Desktop** (macOS/Windows/Linux, MIT): the zero-terminal local app — chat, live tool activity, GUI management of providers/models/MCP servers. This is the T0 surface for a non-terminal operator.
- **Hermes 4.3 36B** (512K context, ~70B-class): the T0 workhorse on a 24GB GPU or 32–48GB Mac. **Hermes 4 14B**: the 8GB-GPU fallback. Open weights via Ollama / LM Studio.
- **Nous Portal:** skipped — OpenRouter is the machine-global route (`ROUTING.md` T2).

## Why Hermes here at all (vs Claude Code alone)

Claude Code is the build-and-orchestrate surface. Hermes Agent adds three things the Wealth OS wants running **continuously, locally, on private data**:

1. **Ambient monitoring** — cron-scheduled market/portfolio checks that message you (Telegram/Signal) instead of waiting for a session.
2. **Sovereign inference** — balance-touching context composed on local weights (T0), so raw amounts never reach a cloud API.
3. **Compounding skills** — its skill-authoring loop writes reusable finance skills from repeated tasks; pair with `/invest-retro` lessons.

Both harnesses wire to the **same MCP servers** (trade-gate, Ghostfolio, Actual, OpenBB) — the gate doesn't care which agent proposes; the human token rule binds them all equally.

## The finance profile

Template: `templates/hermes-finance-profile/`. Contents:

- `profile.json` — model routing (local Hermes 4.3 default, OpenRouter Hermes 405B opt-in per task), the R5 clause pinned into the system context, refusal patterns (no execution talk beyond the gate, no credentials in chat, aggregates-only off-T0).
- `mcp-servers.json` — wiring for trade-gate (stdio), Ghostfolio, Actual Budget, OpenBB, Langfuse-annotated.
- `skills.md` — seed skills mapping to the daily-5 (`/invest-snapshot` prep, DPI ledger read, watchlist pulse, retro reminder cadence).

Install per `RUNBOOK.md` § 1. The profile makes Hermes a **research-and-propose** agent: it can call `propose_trade` and `list_pending`; `request_approval` stays on the human's own surface.

## Boundaries

- Hermes Agent never holds broker credentials; broker MCPs are wired by the operator, live adapters stay behind the trade-gate's human token.
- Its self-authored skills are reviewed before they touch anything gate-adjacent (same diff-review rule as `/invest-retro` systemic lessons).
- Messaging gateways get **notifications and aggregates**, never raw private state — a Telegram chat is not T0.

---

**Built on SIP** — Investment Intelligence HERMES.md · v0.1

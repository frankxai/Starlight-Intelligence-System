# /siswarm — Investment-intelligence council (Sonnet + Opus swarm)

Run the 10-agent investment-intelligence council locally, with per-agent model
routing threaded from `verticals/investment-intelligence/engine/agents/catalog.json`.
This is the executable counterpart to the `/si`//`/so` CLI-lane routers: `/si`
decides *which* CLI to use; `/siswarm` actually *runs* a Sonnet+Opus council.

## Usage

```
starlight swarm run "<operator context>"                 # dry-run plan (default)
starlight swarm run "<operator context>" --live          # execute via headless claude
starlight swarm run "<context>" --live --only technical  # single-agent cheap demo
starlight swarm run "<context>" --live --concurrency 3 --timeout 240000
```

Dry-run prints the compiled plan (agent · layer · model · prompt size) and passes
**no model to any CLI**. `--live` executes.

## The three phases (from the catalog handoff protocol)

| Phase | Agents | Models | Prompt sees |
|---|---|---|---|
| 1 — analysis (blind-parallel) | macro-risk · crypto-dca · defi-yield · fundamentals · technical | Sonnet ×4, **Haiku** (technical) | operator context only — **no peer output** |
| 2 — risk | risk-manager · tax-optimizer · regulatory-risk | Sonnet ×3 | context + the full analysis digest |
| 3 — synthesis | portfolio-manager · chief-of-staff | **Opus** (PM), Sonnet | context + the full debate (analysis + risk) |

The `researcher` (cross-cutting) is excluded from v1 — it is a lookup helper, not
a debate seat. Risk agents run parallel *within* phase 2 (each only needs the
analysis output, not each other's) — an intentional refinement over the catalog's
`step_2_sequential`.

## How the model split works

The runner (`src/swarm.ts::defaultClaudeRunner`) spawns `claude -p <prompt> --model <id>`.
Each task's `model` is the agent's `recommended_model` from the catalog, so
analysis/risk run Sonnet-class, `technical` runs Haiku, and `portfolio-manager`
runs Opus. Override the binary with `STARLIGHT_CLAUDE_BIN`.

## Boundary (non-negotiable)

The council produces **analysis + a pending decision brief** — nothing else. Every
prompt carries the R5 non-advisory clause and the no-execution line
(`tools_denied` includes `execution-platforms` + `credential-stores`). **Trades
execute only through the local trade-gate MCP** (`verticals/investment-intelligence/mcp/trade-gate`)
**with a human approval token.** The swarm has no path to a broker.

## Audit

Each `--live` run appends a JSONL record (context, timestamps, per-phase agent
pass/fail) to `private/voice-operator/logs/swarm-council.jsonl` next to the
existing swarm audit log.

## Hosted twin

The same catalog drives the Vercel-hosted council on frankx.ai
(`/admin/swarm` + `app/api/swarm/run` via the Vercel AI Gateway) — that surface
also emits pending decisions only. See `docs/architecture/sis-swarm-hosted.md`
in the FrankX repo.

**Built on SIP** — /siswarm · investment-intelligence council · v0.1

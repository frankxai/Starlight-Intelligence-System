# /weekly-strategy

Run the IIS weekly Strategy Session — multi-agent debate that produces a draft session document for human verdict.

## Usage

```
/weekly-strategy [--week YYYY-WW] [--mode weekly|rebalance|thesis-debate]
```

Defaults:
- `--week`: current ISO week
- `--mode`: weekly

## What this command does

1. **Instantiates** a new Strategy Session with current ISO week as ID, today as date.
2. **Loads context**: architecture docs (`architecture/00-overview.md`, `architecture/03-strategy-session.md`, `architecture/04-multi-agent-team.md`, `architecture/10-honest-limits.md`), agent catalog (`agents/catalog.json`), tax overlay (`tax-overlays/<jurisdiction>.yaml`).
3. **Ingests data**:
   - Macro snapshot — adapter-fetched (FRED, CoinGecko, alternative.me) or manual prompt
   - Portfolio snapshot — operator-private path or example reference
   - Open theses — reads `theses/index.yaml`
   - Recent retrospective lessons — reads last 4 closed trajectories from `trajectories/`
4. **Runs the debate**:
   - **Parallel**: 5 Analysis-layer agents (macro-risk, crypto-dca, defi-yield, fundamentals, technical)
   - **Sequential**: 3 Risk-layer agents (risk-manager → tax-optimizer → regulatory-risk)
   - **Sequential**: 2 Synthesis-layer agents (portfolio-manager → chief-of-staff)
5. **Renders draft** at `sessions/<session_id>.md` with:
   - Macro context block
   - Full agent debate transcript
   - Ranked opportunities
   - Risk flags
   - Proposed actions with explicit human-approval gates
   - `human_verdict: pending`
6. **Surfaces** the draft for review.

## Operator workflow

```bash
# 1. Run the command in your agent CLI
/weekly-strategy

# 2. Agent asks for any missing context (portfolio drift, recent moves, etc.)
#    Provide honestly. Don't paper over reality.

# 3. Agent runs the debate (~3-5 min for full multi-agent; ~30 sec for Tier 0 single-prompt)

# 4. Agent writes sessions/2026-W19.md (or whatever ISO week)

# 5. Read the full session document yourself.

# 6. Mark the verdict in the front-matter:
#    human_verdict:
#      status: approve | modify | reject
#      notes: <why>
#      reviewed_by: <your-pseudonym>
#      reviewed_at: <ISO timestamp>

# 7. Settle the session — it's now append-only

# 8. Calendar-add: retrospective 90 days from any thesis-driven approved action
```

## Required configuration

For Tier 1+ runs, the substrate expects the operator to have configured:

- `~/.iis/config.yaml` with paths to private snapshot store + tax overlay
- Adapter API keys (FRED, CoinGecko, etc.) in `.env` outside the substrate repo
- Optional: Notion MCP, Slack MCP for output channels

For Tier 0 runs, no configuration is required — the agent prompts for context interactively.

## Failure modes

| Failure | Behavior |
|---|---|
| Adapter degraded | Session marked with `data_integrity_flags`; debate runs with stale or partial data; agents reason at reduced confidence |
| Portfolio snapshot missing | Refuses to fabricate; asks operator for context |
| Last retrospective overdue | Surfaces warning before running; offers to run `/iis-retrospective <thesis_id>` first |
| Tax overlay > 12 months stale | Surfaces warning; offers to run `/iis-tax-overlay-refresh <jurisdiction>` |

## Output

Writes:
- `sessions/<id>.md` (the Strategy Session)
- `theses/index.yaml` (updated if new theses generated)
- (optional) Slack message via Slack MCP

Returns:
- Path to the new session file
- Summary of proposed actions (human-readable)
- Reminder to mark `human_verdict`

## Example output

```
Wrote sessions/2026-W19.md (mode: weekly)

3 proposed actions:
- DCA continue (auto-approved per dca-rules)
- Hold cash buffer (manual, no approval needed)
- ★ Morpho USDC rotation €25K (thesis-driven, REQUIRES YOUR APPROVAL by 2026-05-18)

1 risk flag surfaced:
- F&G 72 — pullback risk in next 6 weeks (note, don't act)

Read sessions/2026-W19.md, mark human_verdict, then settle.

Retrospective due 2026-08-10 (90 days from W19 close).
```

## See also

- `/thesis-debate <topic>` — ad-hoc deep-dive on a single position
- `/portfolio-snapshot` — refresh private snapshot before running session
- `/iis-retrospective <thesis_id>` — close a 90+ day thesis with outcome scoring

## Honest limit

This command produces a draft. **You produce the verdict.** That separation is the substrate.

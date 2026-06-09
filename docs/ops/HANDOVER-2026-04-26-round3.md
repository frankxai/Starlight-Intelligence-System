# Handover — 2026-04-26 (round 3 — autonomous all-night)

## TL;DR

Round 3 ships the missing operational layers: workflow runner (13 YAMLs now executable), rate/spend guards, MCP integration in both directions (Voice Operator AS an MCP server + dispatch TO MCP servers), Linear/Notion adapters, phone PWA service worker, scheduler (Task Scheduler entries for daily handover + nightly consolidation + weekly recap), and graph TUI.

**131 / 131 tests passing in 8 seconds.** Operational scaffold in `private/voice-operator/` is gitignored.

## Counts after round 3

```
service modules         30+   (added: workflow_runner, doctor, dispatch_claude_api,
                                       dispatch_mcp, knowledge_graph, consolidate,
                                       replay, council, mcp_server, guards,
                                       6 adapters)
service LOC            5,800+
test modules            10
test LOC               1,500+
tests passing          131
workflow YAMLs          13   (added 4: search-today, risk-here,
                                       prepare-arcanea, send-no-ship)
config TOMLs             3   (added: mcp-servers.toml)
adapter modules          6   (Plausible, Stripe, GitHub, Vercel, Linear, Notion)
PowerShell scripts       4   (install.ps1, run.ps1, stop.ps1,
                              + Switch-Workspace, Init-SovereignOS, Install-Schedules)
operator docs            5   (Cloudflare Tunnel, ntfy self-host, voice clone,
                              + this round 3 handover)
```

## CLI surface (full)

```
voice-operator run                       voice service (mic + tray)
voice-operator chat                      text mode (no audio deps required)
voice-operator chat --once "<text>"      one-shot
voice-operator chat --replay <file>      regression replay

voice-operator serve                     HTTP + WebSocket (phone + dashboard)
voice-operator status                    live snapshot
voice-operator doctor                    diagnose install state

voice-operator approvals                 list pending Tier B/C
voice-operator approve <id>              approve a packet
voice-operator reject <id>               reject a packet

voice-operator workflow list             list 13 canonical workflows
voice-operator workflow run <name>       execute a workflow
voice-operator workflow run --dry-run    skip execution, just resolve
voice-operator workflow show <name>      print resolved YAML

voice-operator graph stats --days 30     KG stats by brand + intent
voice-operator graph query --brand frankx --days 7 --limit 20

voice-operator organize scan <path>      inventory + classify (dry-run)
voice-operator organize execute <plan>   apply approved plan (Tier B)
voice-operator organize watch            daemon: watch inbox surfaces

voice-operator consolidate --days 7      memory consolidation worker
voice-operator mcp-serve                 run AS an MCP server (stdio)
voice-operator install-mcp-config        emit MCP config snippet for Claude Code/Codex/Gemini
```

## What's now wired end-to-end

- **Workflows actually run.** All 13 canonical YAMLs (morning-brief, evening-handover, weekly-recap, organize-downloads, inbox-zero-captures, approval-sweep, deploy-prep, handover-now, state-save, search-today, risk-here, prepare-arcanea, send-no-ship) execute via `voice-operator workflow run`. Variable resolution, step targets (shell / agent / tts / file-write / file-read / dashboard / voice-operator-internal), output capture, optional steps.
- **Direct Anthropic API dispatch.** `agent:starlight-prime`, `agent:starlight-architect`, `agent:starlight-genius`, etc. — all 19 SIS agents wired with cached system prompts via `dispatch_claude_api.py`. Model picked per intent class.
- **MCP dispatch outward.** `target_system="mcp:linear"` / `mcp:linear:search_issues` etc. routes through stdio JSON-RPC. Configure in `config/mcp-servers.toml`.
- **Voice Operator AS an MCP server.** `voice-operator mcp-serve` exposes 7 tools (utterance, list_pending_approvals, approve, reject, today_packets, knowledge_query, run_workflow) so Claude Code, Codex, Gemini can call Voice Operator.
- **Brand KPI panels.** Dashboard `/api/brand/<brand>` calls Plausible + Stripe + GitHub + Vercel + Linear + Notion adapters. Each fails gracefully with `{available: false, reason}` when keys absent.
- **Knowledge graph wired.** Brand auto-detection (regex), JSONL append-log, daily rollups, queryable by brand/intent/days. `voice-operator graph` TUI surfaces stats + queries.
- **Memory consolidation.** Near-duplicate detection (Jaccard shingles), pattern surfacing (≥3 occurrences), 90-day rollup archival. Run via cron-ish Task Scheduler.
- **Rate / spend guards.** `service/guards.py`. Daily API call cap (500), USD spend cap ($50, model-aware), hourly packet cap (100), Tier B warn threshold (10/day). Override via `.env`.
- **Phone PWA service worker.** Offline shell loads even without network. Network-first for /api and /ws, cache-first for the static shell.
- **Scheduler.** `scripts/Install-Schedules.ps1` registers 3 daily/weekly Task Scheduler entries: evening-handover at 21:00, nightly-consolidate at 02:30, weekly-recap on Mondays 08:00.
- **Sovereign OS init.** `scripts/Init-SovereignOS.ps1` creates the canonical 23-node storage graph at `~/Sovereign/`.
- **Workspace switching.** `scripts/Switch-Workspace.ps1 -Brand frankx` flips Windows virtual desktop per brand.

## Three commits to main

```
4d3485b  feat(voice-operator): cockpit voice mode for Starlight Orchestrator (v0.1)
5bc6415  ci(voice-operator): substrate validation workflow
<round3> docs(ops): handover round-3 — workflow runner, guards, MCP integration, scheduler
```

(Round 3 handover commit is this one.)

The substrate-clean docs and CI ride on main. The 5,800-LOC operational scaffold is in `private/voice-operator/` (gitignored, instance-state per the privacy framework).

## How Frank tests this tonight

Same path as round 1 + a few new commands:

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator
pip install pydantic anthropic typer rich python-dotenv pyyaml fastapi "uvicorn[standard]" watchdog httpx pillow
copy .env.template .env
notepad .env       # paste ANTHROPIC_API_KEY (only key needed for cognitive layer)

python -m service.main doctor              # install report
python -m service.main workflow list       # see all 13 workflows
python -m service.main status              # live snapshot
python -m service.main graph stats         # KG stats (will be empty until use)
python -m service.main chat                # text mode

# Smoke utterances:
#   "Capture this thought: voice operator round 3 validates."
#   "Prepare a Claude Code packet for SIS to add a section to README."
#   "What changed today?"
#   "Edit SIP.md to add a new clause."         (expect Tier C halt)
```

## What still requires Frank's hand

| # | Action | Why I can't |
|---|--------|-------------|
| 1 | Provide `ANTHROPIC_API_KEY` | Don't have it |
| 2 | Provide `ELEVENLABS_API_KEY` (voice mode only) | Provisioning + payment |
| 3 | Provide `PICOVOICE_ACCESS_KEY` + train Starlight wake-word | Account + .ppn training |
| 4 | Run `.\install.ps1` | Tier B — your hand on actual install |
| 5 | Run `.\scripts\Install-Schedules.ps1` (admin) | Tier B — Windows Task Scheduler write |
| 6 | Run `.\scripts\Init-SovereignOS.ps1` | Tier B — creates folders in your home |
| 7 | (optional) Plausible / Stripe / GitHub / Vercel / Linear / Notion keys for live dashboard | Each requires your accounts |

## Honest residuals (still deferred)

- Tauri native dashboard (HTML works for now)
- Phase 5 ambient room mic (hardware purchase: ~$80 ReSpeaker)
- Real graph DB (Neo4j/AgentDB) — file-based KG is fine for v1
- Brand-aware capture auto-tagging in pipeline.run_one_turn — KG is wired, pipeline integration is straightforward when capture utterances start flowing
- Voice clone ElevenLabs setup (walkthrough doc shipped, your call when to record)
- Per-brand voice override (Phase 3c — needs the brand-aware capture above)

---

**Built on SIP** — voice-operator round-3 — 2026-04-26

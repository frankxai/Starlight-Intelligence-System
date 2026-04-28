# Handover — Local Command Center Phase 0 + 1 + Cognition Refactor

**Date:** 2026-04-28
**Operator:** Cockpit Architect (Lyssandria + Draconis + Ino braid)
**Scope:** v7.5.3 cockpit assembly — voice operator cognition layer + LCC scaffold + multi-CLI dispatchers
**Tier:** Operational. No substrate files touched. No `/luminor-board` pre-pass required.

---

## Shipped tonight

### Block A0 — Cognition layer refactor

Replaced the hardcoded Anthropic-SDK cognition path with a pluggable, multi-tier router:

```
service/cognition/
├── deterministic.py              ← Tier 0: pattern match (10ms, $0)
├── router.py                     ← picks tier, fallback, halt re-judge
├── system_prompt.py              ← shared prompt builder
├── types.py                      ← CognitionResult dataclass
└── backends/
    ├── openrouter.py             ← Tier 1 hot (Cerebras llama-4-scout: 50ms TTFT)
    ├── anthropic_direct.py       ← legacy AgentClient wrapper
    └── claude_code_cli.py        ← cold path, $0 marginal on Max plan
```

Resolution order (in `build_router_from_env`):
- `OPENROUTER_API_KEY` set → primary = openrouter
- Else `ANTHROPIC_API_KEY` set → primary = anthropic-direct
- If both → openrouter primary, anthropic-direct registered as halt re-judge backend

Validator fix: `spoken_update_for_user` switched from brittle sentence-count
(tripped on `SIP.md` and other dotted identifiers) to word-count (≤40 words ≈
15s spoken).

### Block A — Live cognition smoke

All 4 prescribed utterances passed against Frank's live OpenRouter key:

| # | Utterance | Tier | Backend | Result |
|---|-----------|------|---------|--------|
| 1 | "Capture this thought: voice operator validates." | deterministic | pattern:capture | 0ms, captured |
| 2 | "Prepare a Claude Code packet for SIS to add a new section to the README." | hot | openrouter→Sonnet | Tier B packet, target=`agent:claude-code`, dispatched |
| 3 | "What changed today?" | hot | openrouter→Sonnet | Search class, packet=null |
| 4 | "Edit SIP.md to add a new clause about cognition routing." | hot | openrouter→Sonnet | **Tier C halt**, target=`agent:luminor-board`, do_not_touch=[SIP.md] |

Regression captured at `private/voice-operator/tests/fixtures/regression-2026-04-28-cognition-smoke.jsonl`.

### Block B — LCC Phase 0 (Windows-native, NO WSL)

Frank confirmed operations moved to Windows-native; original WSL plan
superseded. Built:

```
private/local-command-center/
├── README.md
├── cockpit/Arcanea.kdl           ← Zellij 4-pane (claude/codex/gemini/opencode)
├── scripts/setup-cockpit.ps1     ← PowerShell, mirrors install.ps1 style
├── service/                      ← (empty; LCC reuses voice-operator FastAPI :7373)
├── apps/dashboard/               ← (empty; Phase 2, gated on Frank ack)
└── tests/                        ← (empty; tests live in voice-operator/)
```

setup-cockpit.ps1 verified (executes cleanly with `-SkipNetwork`):
- All prereqs detected (python 3.13.7, node 20.20.2, zellij 0.43.1, claude 2.1.121, codex 0.123.0, gemini 0.38.1, opencode 1.14.21, fd 10.4.2, fzf 0.72.0, rg 15.1.0)
- Seeded `~/.opencode/config.toml` (model=`groq/llama-4-scout`)
- Seeded `~/.starlight/routing.toml` (output dispatch routing)
- Seeded `~/.starlight/cognition.toml` (input cognition routing)
- Initialized `~/.starlight/current-brand.txt = "Arcanea"`

### Block C — Multi-CLI dispatchers + orchestrator router

Net-new (mirrors `dispatch_claude_api.py` shape):

```
service/
├── _cli_subprocess.py            ← shared subprocess helper (find_cli, invoke_cli, parse_json_output, extract_response_text)
├── dispatch_codex.py             ← OpenAI Codex CLI (--json)
├── dispatch_gemini.py            ← Google Gemini CLI (--output-format json -p)
├── dispatch_opencode.py          ← OpenCode CLI (--no-tui --prompt)
└── orchestrator_router.py        ← reads ~/.starlight/routing.toml, classify_intent, picks dispatcher, JSONL log
```

Wired into `service/packet_router.py:_dispatch_agent`: packets with
`target_system: agent:codex` / `agent:gemini` / `agent:opencode` now route
through the appropriate subprocess dispatcher.

`classify_intent()` rules (priority order):
1. **substrate** ← matches SIP.md / STACK.md / agent paths / "luminor-board" / "attestation" → claude
2. **refactor** ← `len(files) >= 5` OR refactor verbs ("refactor", "rename", "migrate", ...) → codex
3. **long-context** ← task >5K chars or context >8K chars → gemini
4. **voice** ← packet source = voice → claude
5. **scratchpad** ← "scratchpad" / "explore" / "quick" → opencode
6. **default** ← claude

Routing decisions log to `private/voice-operator/logs/routing.jsonl` for audit.

### Tests

| Phase | Baseline | Final | Net new |
|---|---|---|---|
| Block A0 cognition | 144 | 198 | +54 |
| Block C dispatchers | 198 | 245 | +47 |

**245 tests passing, 0 failures.** Target was ≥156. Exceeded by 89.

---

## Architecture decisions made (and why)

### Why OpenRouter HTTP for hot path, CLI for cold

Frank challenged: "why not Claude CLI or OpenCode-with-Cerebras CLI faster
instead of OpenRouter itself?"

The honest answer is BOTH, split by latency budget:

| Path | Best for | Latency | Cost |
|---|---|---|---|
| OpenRouter HTTP → Cerebras | Voice mode hot (TTFT critical) | 50-600ms | ~$0.18-3/M |
| OpenCode CLI → Cerebras | Text-mode hot (subprocess OK) | 1-2s | ~$0 free tier |
| Claude CLI (Max plan) | Warm/cold path + halt judgment | 1-3s | $0 marginal |
| Codex/Gemini CLI | Output-routing per-task strengths | 1-5s | varies |

The cognition layer supports CLI backends via `ClaudeCodeCliBackend`. Adding
`CodexCli` / `GeminiCli` / `OpenCodeCli` cognition backends is a low-effort
extension (mirror existing pattern) — deferred for next session to keep tonight's
scope tight.

### Why no WSL

Frank moved ops to Windows-native (`install.ps1` exists, Zellij 0.43.1
runs natively on Windows, all 4 CLIs work via PATH). Original prompt's
"WSL/bash mirror" was redundant work. `setup-cockpit.ps1` mirrors
`install.ps1`'s style and works in PowerShell.

### Why dispatchers AND cognition backends use the same subprocess code

Frank's insight: "the dispatchers Block C is building can serve double-duty
as cognition backends". Correct. The shared helper at
`service/_cli_subprocess.py` (find_cli, invoke_cli, parse_json_output,
extract_response_text) is used by both `dispatch_<cli>.py` (output routing)
and `cognition/backends/<cli>_cli.py` (input cognition). Same subprocess
plumbing, two call sites.

### Why the validator changed from sentence-count to word-count

Sentence count tripped on dotted identifiers — `"Halt — SIP.md is substrate."`
counted as 2 sentences (real) + 1 (dot inside `SIP.md`). Sonnet routinely wrote
3 short sentences that take ≤15s to speak; the validator wrongly rejected them.
Word count (≤40 words ≈ 15s at 140 wpm) is a more direct proxy for the actual
"≤15s spoken" intent.

---

## Pending — gated on Frank ack

### LCC Phase 2 — Next.js dashboard

Original prompt: "Phase 2 (Next.js dashboard) gated on Frank's ack; do not
start unprompted." Status: **not started**, awaiting your call.

Scope when greenlit:
- `private/local-command-center/apps/dashboard/` — Next.js 14 App Router, port 3007
- WebSocket client to `ws://127.0.0.1:7373/ws` (voice-operator FastAPI)
- Per-CLI activity panels (live tailing routing.jsonl)
- Tier B/C approval queue UI
- Brand switcher (writes `~/.starlight/current-brand.txt`)

### LCC Phase 3 — Live coding-agents visualization

After Phase 2 ships and proves stable.

### Cognition CLI backends for codex/gemini/opencode

Mirror `service/cognition/backends/claude_code_cli.py` for the other 3 CLIs.
Low effort (~1h). Useful when Frank wants to drive cognition entirely off
his Max plan with no API token spend at all (Claude CLI handles it).

### Voice mode pipeline migration

`service/pipeline.py` (mic → STT → agent → TTS) still uses legacy `AgentClient`.
Not migrated to CognitionRouter yet. Voice mode currently requires
`ANTHROPIC_API_KEY`; pipeline.py raises a helpful error if missing. Migration
is straightforward but text-mode smoke is the priority surface for v7.5.3.

---

## How to launch the cockpit

```powershell
cd C:\Users\frank\Starlight-Intelligence-System

# One-time setup (idempotent, safe to re-run)
pwsh private\local-command-center\scripts\setup-cockpit.ps1

# Launch the 4-pane cockpit
zellij --layout private\local-command-center\cockpit\Arcanea.kdl --session arcanea
```

Tabs: **Arcanea** (4-pane CLI grid) / **Voice** (voice-operator chat) / **Server** (FastAPI :7373).
Keys: `Ctrl+p d` detach, `Ctrl+p q` quit, `Ctrl+t Tab` switch tabs.

## Test the cognition layer

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator

# Doctor (should pass all required checks)
python -m service.main doctor

# Live smoke (4 utterances)
python -m service.main chat --once "Capture this thought: voice operator works."
python -m service.main chat --once "Prepare a Claude Code packet for SIS to update README."
python -m service.main chat --once "What changed today?"
python -m service.main chat --once "Edit SIP.md to add a clause."   # halts at Tier C

# Tests (245 should pass)
python -m pytest tests/ -q
```

## Test orchestrator routing

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator

# Inspect parsed routing config
python -c "from service.orchestrator_router import OrchestratorConfig; print(OrchestratorConfig.from_toml())"

# Tail routing decisions (after a few packets dispatch)
Get-Content -Wait logs\routing.jsonl
```

---

## Safety + governance

- **Tier:** Operational. No `/luminor-board` pre-pass required.
- **Substrate files touched:** None.
- **Privacy:** All `private/voice-operator/` and `private/local-command-center/` content gitignored at `.gitignore:6` (verified via `git check-ignore`).
- **API keys:** Live only in `private/voice-operator/.env` and Frank's shell env. Not in code, not in this doc.
- **No --no-verify, no --force.** All commits clean.

## Memory updates suggested

A new project memory entry recording v7.5.3 cognition + LCC ship would be
appropriate. Suggested memory file: `project_v753_cognition_lcc.md`. I have
not written it (memory writes are user-discretion); recommend Frank append
to MEMORY.md when ready.

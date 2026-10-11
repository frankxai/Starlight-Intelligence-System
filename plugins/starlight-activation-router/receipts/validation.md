# Starlight Activation Router Validation

Date: 2026-06-23

## Source And Install

- Source plugin: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System\plugins\starlight-activation-router`
- Marketplace: `starlight-local`
- Marketplace root: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System`
- Installed plugin id: `starlight-activation-router@starlight-local`
- Installed version: `0.1.0+codex.20260623104602`
- Installed path: `C:\Users\frank\.codex\plugins\cache\starlight-local\starlight-activation-router\0.1.0+codex.20260623104602`
- `codex plugin list`: `installed, enabled`

## Slash Prompt Shortcuts

- `/si`: `C:\Users\frank\.codex\prompts\si.md`
- `/so`: `C:\Users\frank\.codex\prompts\so.md`
- `/acos`: `C:\Users\frank\.codex\prompts\acos.md`

The repo-backed source templates live under `prompts/`, and `scripts/install-codex-prompts.ps1` syncs them into `~/.codex/prompts`.

## Validation Commands

- `python C:\Users\frank\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py C:\Users\frank\starlight\repos\Starlight-Intelligence-System\plugins\starlight-activation-router` - passed.
- `python C:\Users\frank\.codex\skills\.system\skill-creator\scripts\quick_validate.py ...\skills\starlight-si` - passed.
- `python C:\Users\frank\.codex\skills\.system\skill-creator\scripts\quick_validate.py ...\skills\starlight-so` - passed.
- `python C:\Users\frank\.codex\skills\.system\skill-creator\scripts\quick_validate.py ...\skills\acos-router` - passed.
- `node --check ...\scripts\route-prompt.mjs` - passed.
- `python -m py_compile` for patched plugin-creator scripts - passed.
- Hook fixture scaffold with `--with-hooks --with-skills`, followed by `validate_plugin.py`, passed.
- `pwsh C:\Users\frank\starlight\repos\ai-capability-registry\scripts\scan-codex-activation.ps1` - passed.

## Activation Index Counts

- Git repos: 75
- Repos with `AGENTS.md`: 73
- Repos with `.agent-harness.json`: 63
- Repos with Claude commands: 16
- Repos with Claude hooks: 11
- Repos with skills: 22
- Installed Codex skills after install: 368
- Installed Codex plugins after install: 85
- Installed Codex hook files after install: 5
- Installed Codex prompts: 3
- Installed Starlight prompt shortcuts: 3

The repo estate has drifted upward from the original audit baseline; this is current observed state, not a scanner failure.

## Hook Router Smoke Tests

- `/si audit this repo` returned `$starlight-activation-router:starlight-si` context with repo hint.
- Expanded `/si` prompt text from `~/.codex/prompts/si.md` returned `$starlight-activation-router:starlight-si` context.
- `/so --fanout audit this repo` returned `$starlight-activation-router:starlight-so` context with explicit fanout gate.
- `/acos plan tomorrow content` returned `$starlight-activation-router:acos-router` context and names Agentic Creator Operating System.
- Expanded `/acos` prompt text from `~/.codex/prompts/acos.md` returned ACOS-only context without false swarm routing.
- `@starlight-swarm-ops ... multi agent routing and auto hooks and best loop design` returned Starlight Swarm coordination context.
- `also: this should not trigger so routing` emitted no routing context.
- `git reset --hard HEAD` returned a `PreToolUse` deny decision.
- `Invoke-SiFanout ... -Json` returned a dispatch-gate hint.

Smoke receipt: `receipts/slash-prompt-smoke.json`.

## Priority Routing Matrix

- Scenarios tested: 11
- Passed: 11
- Failed: 0
- Covered: `/si` repo audit, `/so` Railway hardening, `/acos` July launch content, Starlight Communities pilot, Agentic Life OS operator kit, Hermes pack factory, cross-agent loop OS, health/private ops, mobile `si:`, Starlight Swarm worker waves, and destructive command blocking.

Receipt: `receipts/priority-routing-matrix.json`.

## Operating Guide

Added `docs/operating-guide.md` with the command surface, new-chat usage pattern, high-value workflows, current priority routes, community use model, safety rules, and fresh-chat handoff prompts.

## Plugin Creator Fix

- `validate_plugin.py` now accepts `plugin.json.hooks` when it points to a real plugin-local `hooks.json`.
- `create_basic_plugin.py --with-hooks` now adds `hooks: "./hooks/hooks.json"` and creates `hooks/hooks.json`.
- `plugin-creator` docs now describe hook support instead of calling hooks unsupported.

## Remaining Interactive Step

Restart Codex or start a fresh thread so prompt shortcuts and the cachebusted plugin are loaded. Hook trust is still intentionally user/session gated; trust the router hooks if prompted.

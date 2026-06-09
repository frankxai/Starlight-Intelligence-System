# Antigravity Inventory — 2026-05-27

> Pre-Madrid pre-flight inventory. Read-only audit. Decision drives Thursday positioning.

## Installed surface

**Antigravity IDE runtime — installed and onboarded:**
- `C:\Users\frank\.gemini\antigravity\` — active IDE state directory
  - `installation_id`: `fc3b12e9-fb7f-4559-ae32-94992bfc014d` (installed 2025-12-07)
  - `antigravity_state.pbtxt`: onboarding `AGENT_ONBOARDING_STATE_COMPLETED`, agent model `MODEL_PLACEHOLDER_M133`, workspace added, migration `MIGRATION_STATUS_COMPLETED`
  - `bin/` — contains `agentapi.bat` + `webm_encoder.exe` (Antigravity-bundled runtime tools, NOT a global PATH binary)
  - `conversations/` — 12 conversations (`.pb` protobuf files), most recent 2026-05-22
  - `brain/` — 12 project brains with task/plan/sync-strategy artifacts, most recent 2026-05-22
  - `annotations/`, `implicit/`, `knowledge/`, `playground/`, `scratch/`, `browser_recordings/`, `code_tracker/`, `context_state/` — full IDE state tree
- `C:\Users\frank\.gemini\antigravity-backup\` + `antigravity-ide\` — mirror trees (backup + alternate channel)

**Antigravity SDK (Python) — skill manifest present:**
- `C:\Users\frank\.gemini\config\plugins\google-antigravity-sdk\SKILL.md` — full routing table for the AGY Python SDK: Agent / Conversation / Connection primitives, MCP integration, safety policies, hooks, persistence, multi-agent delegation, structured output. Auth path: `GEMINI_API_KEY` env var. Package: `google-antigravity` on PyPI.

**Repo-side adapter — fresh and substrate-aware:**
- `C:\Users\frank\Starlight-Intelligence-System\.antigravity\instructions.md` — last refreshed 2026-05-26 (yesterday). Mirrors `CLAUDE.md` v8.1.0 state. Leans into Antigravity-native capabilities (browser control, async exec, Agent Manager, progress artifacts).

**NOT on PATH:**
- `where.exe antigravity` → not found
- `where.exe gemini` → not found
- No `C:\Program Files\Antigravity\` or LocalAppData install root visible from POSIX shell (likely lives elsewhere or is launched as a Windows app, not a CLI). The `agentapi.bat` in `~/.gemini/antigravity/bin/` is the entry point used by the IDE itself.

**Repo grep for "antigravity" (case-insensitive):** 26 matches across the substrate — `CLAUDE.md`, `AGENTS.md`, `platforms/PLATFORM_ADAPTERS.md`, `core/*.md`, `verticals/*/STACK.md`, `docs/ops/MADRID-EXCELLENCE-PLAN-2026-05-27.md`, `docs/superpowers/specs/2026-05-16-ai-ops-intelligence-design.md`. Substrate treats Antigravity as one of six first-class adapter targets.

## Decision: GREEN

## Reason

The Antigravity IDE has been installed and actively used since 2025-12-07 with 12 distinct project brains, 12 conversations, and shipped artifacts (e.g., `project_landscape_and_sync.md`, `implementation_plan.md`, `project_potential.md`) — most recent edit 2026-05-22, five days ago. Onboarding is complete, the agent model is configured, a workspace is added, and migration to projects is finished. The `.antigravity/instructions.md` adapter inside this repo was refreshed yesterday (2026-05-26) to mirror v8.1.0 substrate state with Antigravity-native capability framing. The Python SDK plugin is also installed at `~/.gemini/config/plugins/google-antigravity-sdk/` with the full routing table for agent / MCP / safety / hooks / persistence. This is not "manifest only" territory — Frank has been dog-fooding Antigravity for ~5 months and has live brain state to point at. The only missing surface is a global `gemini` / `antigravity` CLI binary on PATH; the IDE launches via its own bundle, not a shell command, so its absence does not falsify the installation.

## Recommendation for Madrid Thursday

- **Lead with installed-and-dog-fooded posture, not pursuing-access.** Frank has receipts: 12 brain projects, conversations through 2026-05-22, a substrate-aware adapter refreshed 24h before the summit.
- **Pick ONE live artifact to demo or screenshot before the summit.** Strongest candidate: open one of the recent brains (e.g., `406620d2-…/project_landscape_and_sync.md` task list) inside Antigravity, run one short agent turn against the SIS repo, capture a screenshot or short clip. This is the 45-min dog-foot the Madrid Excellence Plan Phase A Task A3 calls for.
- **Talk to Antigravity team in terms of substrate, not feature requests.** Frank's angle: "I'm using Antigravity as one of six platform adapters in a substrate (SIP) that already has an Antigravity-native instructions file mirroring v8.1.0. The brain/conversation persistence model is doing real work on my SIS dog-food." That positions Frank as a substrate operator, not a hobbyist trying the IDE.
- **Avoid claiming "shipped with Antigravity" on public surfaces** — the artifacts inside `~/.gemini/antigravity/brain/` are local dog-food, not shipped substrate. The repo grep hits are adapter/spec/plan references, not Antigravity-authored substrate. Be precise.

## Frank's pre-Madrid action

- **Tue eve (today, 2026-05-26 in MADRID plan terms / 2026-05-27 audit-time):** open Antigravity IDE, resume the most recent project brain (May 22), run one fresh agent turn (~15 min), screenshot the result. Drop the screenshot path into `docs/ops/MADRID-2026-05-28-DEMO-RUNBOOK.md`.
- **Wed AM:** verify `GEMINI_API_KEY` is valid and not the OpenRouter-format placeholder flagged in `project_api_key_policy_monitoring_2026_05_18.md` — Antigravity SDK auth depends on it.
- **Wed PM:** if time permits, scaffold a one-file `google-antigravity` SDK script (`hello_world` from `examples/getting_started/`) that calls a SIS agent persona — gives Frank a code-side receipt to complement the IDE-side receipts.
- **Thu AM:** during the demo runbook pre-flight, confirm Antigravity IDE still launches and the recent brain still loads — same gate as the website renders.

Built on SIP.

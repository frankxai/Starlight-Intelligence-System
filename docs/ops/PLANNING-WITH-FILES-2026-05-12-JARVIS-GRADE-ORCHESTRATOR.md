# Planning With Files — Jarvis-Grade Starlight Orchestrator

**Date:** 2026-05-12  
**Tier:** operational  
**Decision owner:** Starlight Orchestrator  
**Companion:** `docs/ops/ULTRAPLAN-2026-05-12.md`

## North Star

Build Starlight into a local-first operator that can see the machine, remember the work, route agents, use the browser, open Frank's specific stacks, and present a demo-grade command room without giving cloud services ambient authority over private state.

The benchmark phrase is "Jarvis-grade." The native name is **Starlight**.

## Architecture Call

| Layer | Choice | Why |
|---|---|---|
| Primary cockpit | `localhost` Next.js LCC | Fastest iteration, private by default, direct access to local services and logs |
| Native shell | Tauri/Windows tray later | Owns launch, lifecycle, hotkeys, notifications, and "always there" presence |
| Cloud room | Vercel read-mostly mirror | Demo, mobile review, approvals, status; no direct local execution without hardened tunnel |
| Browser autonomy | Browser Use + Playwright through `BrowserDispatcher` | Largest missing operator capability; local artifacts make it auditable |
| Cloud workers | GitHub CLI, Copilot CLI, Dependabot, Actions | Strong for repo ops and CI, not a replacement for local authority |
| Policy/routing | Starlight Orchestrator | One dispatcher truth, audit JSONL, fallback order, approval gates |

## Files That Matter

| Concern | Files |
|---|---|
| Local launcher | `private/local-command-center/scripts/start-cockpit.ps1` |
| LCC dashboard | `private/local-command-center/apps/dashboard/app/*`, `components/*`, `lib/*` |
| Voice/API backend | `private/voice-operator/service/server.py`, `text_mode.py`, `orchestrator_router.py` |
| Browser autonomy | `private/voice-operator/service/dispatch_browser.py`, `_browser_session.py` |
| Multi-agent routing | `private/voice-operator/service/orchestrator_cli.py`, `orchestrator_router.py`, dispatchers |
| Health/status | `private/local-command-center/apps/dashboard/app/api/status/route.ts`, `app/api/fleet/health/route.ts` |
| Data honesty | `private/local-command-center/apps/dashboard/components/DataSourceBadge.tsx`, `lib/data-source.ts` |
| Memory truth | `memory/vaults/operational-vault.md`, `memory/knowledge-graph/*` |

## Execution Phases

### Phase 0 — Stop Lying, Stop Drag, Expose Power

Ship now:

1. Make the cognition bridge opt-in in the launcher until the full executor path is consistently faster than the orb-native path.
2. Route browser-use tasks through the same orchestrator as Codex/Gemini/OpenCode/Cursor/GitHub.
3. Keep every dashboard fallback visibly badged as `live`, `mock`, `stale`, or `error`.
4. Keep `/healthz` canonical, with aliases only for compatibility.
5. Keep localhost as primary; do not prematurely move local execution to Vercel.

### Phase 1 — Browser Operator

Goal: "Starlight, open the stack and check the thing" works.

- Route browser language (`open site`, `navigate`, `use browser`, `check website`) to `browser`.
- Require Tier B approval for form submission, posting, account changes, or purchases.
- Refuse Tier C/substrate browser autonomy.
- Persist screenshots and DOM snapshots per packet.
- Add a dashboard browser activity panel that lists recent browser artifacts.

### Phase 2 — Service Command Room

Goal: one glance tells Frank what is alive.

- One service health panel: LCC, FastAPI, orb, memory bus, brain watchdog, GitHub auth, browser-use, agent capabilities.
- Every health check returns `{state, checked_at, proof}`.
- Native tray shows the same states and can start/stop services.

### Phase 3 — Second Brain Depth

Goal: the cockpit feels like it knows the body of work.

- Feed cross-repo indexer atoms into the knowledge graph.
- Add semantic layout, cluster names, and search/fly-to.
- Promote VaultLoop + daily captures as first-class cockpit routes.
- Surface "what changed since last session" from memory, not from a static feed.

### Phase 4 — Voice Streaming

Goal: sub-second perceived response.

- Move from sequential STT → LLM → TTS to streaming.
- Adopt Pipecat-style pipeline for real-time voice and multimodal.
- Keep text audit trail for every action.

### Phase 5 — Demo Mirror

Goal: ultra-wow without exposing private state.

- Vercel room shows status, public-safe traces, sanitized brain slices, and approval cards.
- Local executor remains local.
- Remote commands enter a queue and require explicit approval before local execution.

## Rules

- Local execution stays local by default.
- Browser autonomy is observable: screenshot + DOM snapshot on every dispatch.
- Cloud agents may suggest and inspect; they do not own private local state.
- A premium UI on mock data must say `mock`.
- Native shell wraps lifecycle; it does not replace the Next.js cockpit until the web cockpit stabilizes.

## Current Slice

This session implements:

- Browser as a first-class orchestrator dispatcher.
- Launcher cognition bridge opt-in.
- Orb health probe kept aligned to the Arcanea voice server.
- Focused tests for routing and browser classification.

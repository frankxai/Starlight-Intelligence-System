# Starlight Orchestrator

> The master Intelligence System. Routes voice and text intent across the other nine universal IS, the model CLIs (Claude Code primary, Codex adversary, Gemini long-context, OpenCode latency, Antigravity 96-mind swarm), and the capture stack.

**Canonical name:** Starlight Orchestrator. Use everywhere, public and internal.
**Premium label:** Private Intelligence Office.
**Killed names** (per `MASSIVE_ACTION_PLAN.md` § 3): Jarvis (cultural reference only, never branded), SIS Conductor, Sovereign Console, Starlight Core, Arcanean Command Layer.

---

## Posture

A traditional assistant waits for instructions. A private intelligence office detects what matters, prepares the decision, and routes execution.

The Orchestrator is **layer 10** of the 10-IS stack — the master that routes the other nine. It does not replace any IS; it composes across them.

---

## Two operating modes

### 1. Advisory (no side effects)

Briefs, plans, scripts, summaries, recommendations. The Orchestrator reads the Memory Graph, fetches relevant context across IS namespaces, returns a structured response. Nothing executes.

### 2. Execution (side effects, gated)

Calls Claude Code / Codex CLI / Gemini CLI / OpenCode / GitHub / Vercel / Supabase / n8n / Notion / Drive / local FS. Every execution path carries an explicit approval gate or runs under a pre-approved scope (e.g. `/ao` config).

---

## Routing chain

**Today (shipped, in `frankxai/frankx` repo per audit 2026-04-25):** `/arco` (brand router) → `/ao` (CLI router) → Guardian / sub-system agent (domain). These commands are **not** in this substrate; they live in the FrankX vertical and are the canonical brand-router implementation today.

**In this substrate today (v7.5.1 + 2026-06-02 enhancement + 2026-06-04 GStack workforce absorption):** command surface is staged in `core/orchestrator/harnesses/{claude,codex,gemini,opencode,antigravity,grok,gstack}/` — each model harness folder ships `system-prompt.md` + `README.md` (with mcp-config.json + allowlisted-tools.md living at the platform adapter level for Antigravity under `.antigravity/`). GStack is different: it is an external specialist workforce rooted at `~/.agents/skills/gstack`, documented here as a routing harness rather than vendored into SIS. See `core/orchestrator/HARNESS-STATUS.md` and `core/orchestrator/GSTACK-WORKFORCE.md` for readiness and route maps. Promotion to executable shell wrapper (`starlight` CLI alias) lands per Phase 1.1/1.2 of `MASSIVE_ACTION_PLAN.md`. Antigravity harness added for native 96-mind swarm execution.

**Target (v7.6+):** Voice or text intent → Starlight Orchestrator (`@starlight/orchestrator` npm package, decoupled from FrankX) → Memory Graph context fetch (Mem0 + Graphiti per Phase 1) → IS team selection → CLI routing → execution → log → graph write-back → daily brief.

---

## Multi-CLI harness

The single CLI to type into is `starlight`. It wraps and orchestrates the model CLIs (primary Claude Code + Codex + Gemini + OpenCode + Antigravity swarm harness for 96 minds).

| CLI | Role | When |
|---|---|---|
| **Claude Code** (primary) | Substrate edits, architecture, long-form code, agent orchestration | Default; any task touching SIS, brand-critical writes, or > 200 LOC changes |
| **Codex CLI** (OpenAI) | Adversary + security audit + alternative perspective | `/ao` adversary mode, security review, second-pair architecture decisions |
| **Gemini CLI** | Long-context document grokking, modernization passes, repo summarization | 1M-context jobs, multi-repo cross-references, codebase-wide refactors |
| **OpenCode** (Groq Llama 4 Scout) | Quick checks, scratchpad, latency-bound queries | Anything <30s round-trip, free-tier-acceptable |
| **Antigravity** (Google) | Swarm execution — native 96-mind parallel orchestration via define_subagent/invoke_subagent, browser control, async + Agent Manager, progress artifacts | Complexity 4-10 multi-perspective work, vertical-wide or cross-IS swarms, browser-heavy flows, async long-running tasks, "use the 96 minds" intents |
| **GStack** (external workforce) | Specialist operating team — YC office hours, CEO review, eng/design/DX reviews, code review, QA, CSO, ship, canary, retro, memory | Business validation, venture planning, product build loops, browser truth, launch gates, weekly portfolio operating cadence |

Each CLI has its own harness folder under `harnesses/{claude,codex,gemini,opencode,antigravity,grok}/` (Antigravity shares mcp/allowlist at `.antigravity/` platform level) with system prompt, README, escalation rules, and references to MCP/allowlist policy. GStack has `harnesses/gstack/` plus `GSTACK-WORKFORCE.md` because it is a role/workforce router, not a model CLI. Antigravity harness added 2026-06-02 for god-99 96-mind swarm excellence; GStack workforce absorption added 2026-06-04.

---

## Implementation status

- **Routing scaffolding:** present in existing `arcanea-orchestrator/` (audited 2026-04-25; v0.1.0 local, NOT on npm — to be promoted to `@starlight/orchestrator` and published per Phase 1).
- **CLI harnesses:** folders present in this directory (claude/codex/gemini/opencode + antigravity added 2026-06-02 + grok/gstack route surfaces). System prompts + READMEs delivered. MCP/allowlist for Antigravity live under `.antigravity/` (platform adapter + swarm harness). GStack is installed externally and routed through `harnesses/gstack/` + `GSTACK-WORKFORCE.md`; it is not vendored. Full `starlight` wrapper integration per Phase 1.1/1.2.
- **Memory Graph integration:** scheduled Phase 1 (Mem0 + Graphiti install).
- **Voice room:** scaffolded 2026-04-26 — agent at `agents/starlight-voice-operator.md`, handoff packet contract at `skills/orchestration/agent-handoff-packet.md`, install scaffold at `private/voice-operator/`. Phase 1 = single-device PC cockpit; Phase 2 = phone PWA + Cloudflare Tunnel. See `docs/specs/2026-04-26-voice-operator-v1.md` and `docs/specs/2026-04-26-voice-operator-engineering-v1.md`.
- **Workspace switching:** scheduled Phase 2 (Windows virtual desktops + Switch-Workspace.ps1).

See `MASSIVE_ACTION_PLAN.md` § 4 for the full multi-CLI harness specification (now includes Antigravity swarm harness for 96 minds) and § 10 for the phased build order. Antigravity harness enhancement (full .antigravity/ + harness scaffold + adapter generators + docs) landed 2026-06-02.

---

## Composition with the other 9 IS

The Orchestrator does not own intelligence — each IS owns its own. The Orchestrator owns *routing*: which IS receives which intent, in what sequence, with which downstream artifact destination.

| Intent fingerprint | Primary IS routed to |
|---|---|
| "What only I uniquely see…" | Self / Genius IS |
| "Capture this thought / meeting" | Second Brain IS |
| "What is my 30-year horizon?" | Brand IS (Vision) |
| "Should I start an entity?" | Business IS |
| "Help me ship this content" | Creator IS |
| "Where does my next DPI source come from?" | Wealth IS |
| "Build / debug / deploy this code" | Code IS |
| "Produce this video / podcast / track" | Voice & Video IS |
| "Map my family / network / alliance" | Family IS |
| "Audit my regimen" | Health IS (cross-cutting) |

Domain sub-stacks (People Intelligence, Sound Intelligence, future verticals) compose **inside** the IS the practitioner most operates in — typically Self + Business + Creator. The Orchestrator routes domain-specific intents (`/hire-icp`, `/perf-feedback-rehearsal`, etc.) directly to the sub-system agent, bypassing universal-IS routing for that turn.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, archetype-extension]
- Master IS: Starlight Orchestrator (layer 10 of the 10-IS stack)
- Generated: 2026-04-26

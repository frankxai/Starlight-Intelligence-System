# Starlight Orchestrator

> The master Intelligence System. Routes voice and text intent across the other nine universal IS, the four model CLIs, and the capture stack.

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

**Today (shipped):** `/arco` (brand router) → `/ao` (CLI router) → Guardian / sub-system agent (domain).

**Target (v7.5+):** Voice or text intent → Starlight Orchestrator → Memory Graph context fetch → IS team selection → CLI routing → execution → log → graph write-back → daily brief.

---

## Multi-CLI harness

The single CLI to type into is `starlight`. It wraps and orchestrates the four model CLIs.

| CLI | Role | When |
|---|---|---|
| **Claude Code** (primary) | Substrate edits, architecture, long-form code, agent orchestration | Default; any task touching SIS, brand-critical writes, or > 200 LOC changes |
| **Codex CLI** (OpenAI) | Adversary + security audit + alternative perspective | `/ao` adversary mode, security review, second-pair architecture decisions |
| **Gemini CLI** | Long-context document grokking, modernization passes, repo summarization | 1M-context jobs, multi-repo cross-references, codebase-wide refactors |
| **OpenCode** (Groq Llama 4 Scout) | Quick checks, scratchpad, latency-bound queries | Anything <30s round-trip, free-tier-acceptable |

Each CLI has its own harness folder under `harnesses/{claude,codex,gemini,opencode}/` with system prompt, MCP config, allowlisted tools, and escalation rules.

---

## Implementation status

- **Routing scaffolding:** present in existing `arcanea-orchestrator/` (audited 2026-04-25; v0.1.0 local, NOT on npm — to be promoted to `@starlight/orchestrator` and published per Phase 1).
- **CLI harnesses:** stub folders present in this directory; system prompts and MCP configs land in Phase 1.
- **Memory Graph integration:** scheduled Phase 1 (Mem0 + Graphiti install).
- **Voice room:** scheduled Phase 2 (HavenCore-style local + Vercel mirror).
- **Workspace switching:** scheduled Phase 2 (Windows virtual desktops + Switch-Workspace.ps1).

See `MASSIVE_ACTION_PLAN.md` § 4 for the full multi-CLI harness specification and § 10 for the phased build order.

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

Domain sub-stacks (HR Intelligence, future verticals) compose **inside** the IS the practitioner most operates in — typically Self + Business + Creator. The Orchestrator routes domain-specific intents (`/hire-icp`, `/perf-feedback-rehearsal`, etc.) directly to the sub-system agent, bypassing universal-IS routing for that turn.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, archetype-extension]
- Master IS: Starlight Orchestrator (layer 10 of the 10-IS stack)
- Generated: 2026-04-26

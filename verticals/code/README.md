# Code IS — Product & Automation Intelligence

> Intelligence System layer 7 (per `MASSIVE_ACTION_PLAN.md` § 2). Coding agents, MCP server design, agent harness operations, automation playbooks. Wraps existing `/arco` brand router + `/ao` CLI router into a coherent IS for sovereign builders.

**Tier:** Universal Intelligence System layer.
**License:** MIT for substrate-aligned reference patterns.
**Status:** `scaffolded — v0.1` (this directory). Operational layer reference in repo at `agents/`, `.claude/commands/`, `core/orchestrator/`.

---

## What Code IS does

Code IS is the layer where the sovereign builder operates as a builder — not as a creator-of-content (Creator IS) and not as an operator-of-entity (Business IS). Code IS owns:

- **Coding agents.** Multi-CLI orchestration (Claude Code primary, Codex adversary, Gemini long-context, OpenCode quick) wrapped by `/ao`.
- **Brand routing.** `/arco` resolves which brand a coding session belongs to (FrankX vs Arcanea vs Starlight vs Wealth) and loads the right agent harness, MCP scope, and voice.
- **MCP server design.** Pattern library for designing MCPs that compose cleanly with the substrate's file contract and attestation.
- **Automation playbooks.** GitHub Actions, n8n, Vercel deploy hooks, Supabase RLS patterns — all attested.
- **Agent harness operations.** Maintenance of the four CLI harness folders under `core/orchestrator/harnesses/`.

---

## Composition with the rest of the 10-IS stack

| Composes with | Why |
|---|---|
| **Self / Genius IS** | Voice in code comments, commit messages, README prose. |
| **Brand IS** | Brand-specific harness loading via `/arco`. |
| **Business IS** | Code that ships impacts revenue (entity, products, infrastructure). |
| **Creator IS** | Content infrastructure (publishing pipelines, video factories) is co-owned. |
| **Voice & Video IS** | Modality attestation pipelines run as code. |
| **Starlight Orchestrator** | Code IS is the IS the Orchestrator routes to for any "build / debug / deploy" intent. |

---

## Primary commands

> **Substrate-canon honesty (per OpenClaw v7.5 CRITICAL-2):** the Code IS surface composes commands from this substrate (Starlight) and from the FrankX vertical repo. Where a command lives is named explicitly below.

- **`/arco`** *(external — provided by FrankX vertical at `frankxai/frankx`, not in this substrate)* — brand router for coding sessions. Install via Code IS adoption kit when ready.
- **`/ao`** *(external — FrankX vertical)* — CLI router for the four model CLIs.
- **`/sync-repos`** *(skill auto-activation in this substrate, not a slash command)* — Claude Code repository sync. Lives at `skills/integration/sync-repos.md` if registered; otherwise pending Phase 1.
- **MCP-builder skills** *(this substrate)* — `mcp-builder` and `mcp-2025-patterns` skills auto-activate on MCP-server work.

### Required external commands

To run Code IS at the level the README describes, the practitioner needs both:
- **This substrate** (`frankxai/Starlight-Intelligence-System`) — file contract, attestation, MCP-builder skills, harness scaffolds at `core/orchestrator/`.
- **FrankX vertical** (`frankxai/frankx`) — `/arco`, `/ao`, and the brand-router-aware harness configs that resolve which brand a coding session belongs to.

Forking a Code IS practice without the FrankX vertical means the brand-routing layer has to be reimplemented per practitioner. Phase 1 of `MASSIVE_ACTION_PLAN.md` § 4 promotes `arcanea-orchestrator/` to `@starlight/orchestrator` and decouples the brand-router from FrankX-specific framing — until then, `/arco` and `/ao` are FrankX-coupled.

Sub-system commands per practice mature into vertical-specific files here. v0.1 scaffolds the directory; full command surface lands as Phase 1 of the MASSIVE_ACTION_PLAN.

---

## Refusal patterns

- Vibe-coded production deploys without test discipline.
- Mock-only tests on integration boundaries (per substrate memory: integration tests must hit real systems).
- Force-pushes to main / shared branches.
- Skipping pre-commit hooks (`--no-verify`).
- Adding scope beyond what the task requires (premature abstraction, hypothetical-future-requirements).
- Backwards-compatibility shims when straight changes work.

---

**Built on SIP** — Code IS reference · v0.1 · SIP v1.1.0

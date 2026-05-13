---
name: orchestration/gencreator-stack
description: Catalogs, scaffolds, and audits the per-repo tech stack across every brand (Arcanea, FrankX, Business, Starlight, verticals). Four verbs — audit (walk repos + emit constellation), scaffold (drop STACK.md template into a target repo), assign (bind tools to substrate/reasoning/coding/research/ops tiers), diff (surface drift between STACK.md intent and reality from .mcp.json + .claude/ + settings.json + installed CLIs). Use this skill whenever the user mentions stack architecture, repo inventory, "which AI assistant for which repo", custom GPTs, MCP routing across brands, browser workspaces per project, or asks "do we have a clean view of our tech stack". Default skill for the Starlight Architect when the question spans repos rather than a single one.
type: orchestration
domain: orchestration
substrate-tier: false
attached-to: starlight-architect
composes-with: [intelligence/systems-thinking, integration/repo-bridge, integration/ecosystem-sync, intelligence/decision-framework]
---

# gencreator-stack Skill — Cross-Brand Stack Catalog + Drift Sentinel

> *Every repo is an agent surface. Every brand is a constellation of surfaces. This skill is how you keep the map honest.*

## Activation

Auto-activates when the user's question spans more than one repo or asks about tool assignment across the ecosystem. Pair with `starlight-architect` (Leadership tier). For single-repo decisions, defer to `engineering:architecture` (single ADR). For new brand spawning, compose with `integration/domain-stack-architecture` (vertical-tier scaffolder).

## Why this exists

Frank operates 6+ active repos across 4+ brands. Each surface has a coding agent (Claude Code / Codex / Cursor / Gemini CLI), a reasoning surface (Claude Project / ChatGPT Project / Gemini Gem / Custom GPT), a research browser (Arc Space / Chrome+CIC / Comet), and a stack of native MCPs (Vercel / Supabase / Notion / Linear / Figma / GitHub / Gmail / Calendar). Without a manifest, three failure modes compound:

1. **Surface drift** — a repo's `CLAUDE.md` claims a tool that's no longer wired. Claude Code in that repo runs with stale context.
2. **MCP overlap waste** — same connector configured twice in two repos with conflicting auth scopes. Quiet rate-limit failures.
3. **Cognitive overhead** — Frank has to remember which AI runs which brand. Cognitive load grows non-linearly with brand count.

The skill makes the manifest first-class: one `STACK.md` per repo, rolled up into one constellation file at substrate level. Drift detection runs weekly so entropy never compounds past 7 days.

## Verbs

### `audit` — walk every repo, emit the constellation

```bash
python skills/orchestration/gencreator-stack/scripts/stack.py audit
```

Walks the inventory at `skills/orchestration/gencreator-stack/assets/inventory.json`, reads each repo's `CLAUDE.md` + `STACK.md` (if present), and writes `context/stack-constellation.md` — the single source of truth for "what runs where". Output is sorted by brand, then by surface tier (substrate → reasoning → coding → research → ops). Repos missing `STACK.md` show up as gaps with a `scaffold` hint.

### `scaffold` — drop STACK.md template into a target repo

```bash
python skills/orchestration/gencreator-stack/scripts/stack.py scaffold --repo C:\Users\frank\Arcanea
```

Copies `assets/STACK.template.md` into the target repo (refuses to overwrite — Frank-ack required). The template is pre-filled with the canonical five-tier matrix and prompts for repo-specific bindings.

### `assign` — bind tools to tiers via guided prompt

```bash
python skills/orchestration/gencreator-stack/scripts/stack.py assign --repo C:\Users\frank\FrankX
```

Reads existing `STACK.md`, asks Frank (via stdin or AskUserQuestion when running in Cowork) to confirm or change tool bindings for each of the five tiers. Writes back to `STACK.md` with timestamped change log. No manual editing of the markdown table required.

### `diff` — surface drift between intent and reality

```bash
python skills/orchestration/gencreator-stack/scripts/stack.py diff
```

This is the high-leverage verb. For each repo with a `STACK.md`, the script compares the manifest against actual filesystem state:

- `.mcp.json` — does every MCP claimed in STACK.md actually appear here?
- `.claude/settings.json` and `.claude/CLAUDE.md` — does the claimed Claude Code config exist?
- `.cursor/` or `.cursorrules` — present iff Cursor is claimed as a coding agent
- `.codex/` / `.gemini/` / `.antigravity/` — present iff those agents are claimed
- Stale references — STACK.md claims `vercel-mcp` but no Vercel project exists in `.vercel/` or no `vercel.json` at root → suspected drift

Outputs `context/stack-drift-<ISO8601>.md` with green / yellow / red status per repo. Yellow = manifest says X, reality says X' (close but different). Red = manifest says X, reality has no trace of X.

## Tier model — the canonical five

Every `STACK.md` carries this matrix. Tiers are normative — do not invent a sixth without a board pass.

| Tier | Role | Canonical picks (pick one per repo) |
|---|---|---|
| Substrate | Persistent context, memory, attestation | Starlight Intelligence System (always) |
| Reasoning | Long-form thinking, research synthesis, project-scoped chat | Claude Project · ChatGPT Project · Gemini Gem · Perplexity Space · Grok |
| Coding | Code execution agents (CLI / IDE) | Claude Code · Codex CLI · Gemini CLI · Cursor · Antigravity · GitHub Copilot CLI · Aider |
| Research browser | Read + agentic web | Arc Space · Chrome + Claude-in-Chrome · Comet · Opera Workspaces |
| Ops MCPs | Native connectors | Notion · Linear · Vercel · Supabase · GitHub · Gmail · Calendar · Figma · Slack · Drive · Bunq |

Rationale for the picks lives in `references/tier-rationale.md`. Read it before overriding the defaults.

## Inventory

The repo list lives in `assets/inventory.json`. Hand-maintained. Each entry has: brand, path, role (production / development / private / docs / oss), and whether STACK.md is expected. Add new repos here, not inline.

## Composes with

- `integration/repo-bridge` — when a STACK move requires cross-repo coordination
- `integration/ecosystem-sync` — when STACK changes need to propagate to ecosystem manifest
- `intelligence/decision-framework` — when `assign` faces a contested binding
- `vision/voice-anti-slop` — when generating STACK.md prose (no AI-slop in machine-readable manifests)

## When NOT to use this skill

- Single-repo ADRs → `engineering:architecture`
- Spawning a new domain vertical → `integration/domain-stack-architecture`
- Touching the substrate's own `STACK.md` (the universal IS taxonomy) → that's substrate-tier, requires `/starlight-board`

## File outputs

| Verb | Writes |
|---|---|
| audit | `context/stack-constellation.md` (idempotent — same input, same output) |
| scaffold | `<target-repo>/STACK.md` (refuses overwrite) |
| assign | `<target-repo>/STACK.md` (updates in place, appends change log) |
| diff | `context/stack-drift-<ISO8601>.md` (timestamped, one per run) |

## Scheduled cadence

Weekly `diff` runs Sun 08:30 (before `/vault-atlas` at 08:45). Surfaces drift before Frank starts the week. If drift count > 3 OR any red status, the scheduler escalates a single Memory Bus atom of kind `stack-drift-alert` so it surfaces on Monday's cockpit.

---

**Built on SIP** · `gencreator-stack` skill · v1.0.0

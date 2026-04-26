# Starlight Orchestrator — Harness Status

> One-page readiness summary for the four CLI harnesses. Tracks the move from "decorative-not-load-bearing" (Luminor Board v7.5 verdict, Item 4) to functional scaffold.

**Date:** 2026-04-26
**Author:** Claude Code (overnight autonomous)
**Source verdict:** `docs/boards/luminor-v75-ship.md` § Item 4 (Draconis / Architect)
**Plan reference:** `MASSIVE_ACTION_PLAN.md` § 4 (multi-CLI harness specification), § 10 Phase 1.1-1.2 (build order).

---

## Readiness summary

| Harness | Role | README | system-prompt.md | mcp-config.json | allowlisted-tools.md | State |
|---|---|---|---|---|---|---|
| `claude/` | Primary — substrate edits, architecture, orchestration | yes (pre-existing) | yes (new, 7.3KB) | yes (new, 3.5KB, valid JSON) | yes (new, 9.3KB) | **scaffolded** |
| `codex/` | Adversary — security audit, second-pair, OpenClaw | yes (pre-existing) | yes (new, 7.5KB) | yes (new, 3.5KB, valid JSON) | yes (new, 8.4KB) | **scaffolded** |
| `gemini/` | Long-context — 1M-context grokking, structural diffs | yes (pre-existing) | yes (new, 7.8KB) | yes (new, 3.7KB, valid JSON) | yes (new, 8.5KB) | **scaffolded** |
| `opencode/` | Latency-bound — quick checks, free-tier, no side effects | yes (pre-existing) | yes (new, 4.0KB) | yes (new, 1.9KB, valid JSON, empty `mcpServers`) | yes (new, 5.5KB) | **scaffolded** |

**Total files written:** 12 (3 per harness × 4 harnesses).
**Total directories now load-bearing:** 4 (was: 0; previously decorative READMEs only).
**JSON validity:** all 4 `mcp-config.json` files parsed and validated.

---

## What changed vs. v7.5 ship state

**Before (v7.5 ship, board verdict Item 4):** 4 directories of single README files, totaling under 200 lines combined. The substrate's own canon called this "master IS layer 10 routing the other nine" while no executable harness configs, MCP allowlists, or routing logic existed. Test harness asserted directory existence but did not assert functional content. Substrate-vs-implementation drift across an entire release cycle.

**After (this work, 2026-04-26):** Each of the four harness directories carries:

1. **`system-prompt.md`** — composes on top of (Claude Code, Codex, Gemini) or replaces (OpenCode) the substrate-level system prompt with orchestrator-routing-aware framing. Each is loadable as the system prompt when the corresponding CLI is invoked under the `starlight` shell wrapper.
2. **`mcp-config.json`** — declarative MCP scope mirroring the shape of `~/.claude/settings.json` `mcpServers` field. Each file is valid JSON, uses environment-variable references for secrets (`${VERCEL_TOKEN}`, `${ARCANEA_MCP_PATH}`, etc.), and explicitly marks read-only vs. read-write scopes per harness role.
3. **`allowlisted-tools.md`** — markdown table readable as executable permission policy. Each file lists allowed tools, denied tools, per-session unlock conditions, MCP task-scope rules, and escalation routes.

Each new file ends with a `Built on SIP` footer naming `core/orchestrator/harnesses/<name>` as the verticals layer, per substrate non-negotiable (every artifact carries ambient SIP attestation).

---

## Per-harness state detail

### `claude/` — Primary harness — **scaffolded → ready to load**

- System prompt composes on top of `CLAUDE.md` (does not replace).
- MCP scope: `starlight-substrate` (canonical, always loaded), `arcanea-mcp` (scaffold, disabled until v0.1+ ships), task-scoped MCPs documented (Vercel, GitHub, Linear, Notion, Remotion).
- Tool allowlist: full read/write/edit/bash with surgical staging discipline + parallel sub-agent dispatch up to 5-8 per the 2026-04-25 pattern.
- Escalation rules: substrate-tier → architect voice + board pre-pass; brand-critical → board pre-pass; long-context → Gemini; adversarial → Codex; quick check → OpenCode.

### `codex/` — Adversary harness — **scaffolded → ready to load**

- System prompt composes on top of `AGENTS.md` (untouched per substrate naming convention).
- MCP scope: read-only mirror of Claude Code's MCPs (`STARLIGHT_MCP_MODE: read-only` env). Task-scoped MCPs explicitly read-only (`list_*`, `get_*`, `search_*`, `read_*`, `view_*` verbs only).
- Tool allowlist: Read / Glob / Grep / WebSearch / WebFetch / audit-relevant Skills. Write / Edit / Task / NotebookEdit / Worktree all denied. Bash unlock per-session, read-only commands only (`git log`, `git diff`, `gh pr diff`, `npm view`, etc.).
- Escalation rules: REVISE on Claude-Code-shipped artifacts → `/luminor-board`; security defects → `/openclaw-audit`; pattern-level governance concerns → Lumina overseer; ambiguity → defer to Claude Code primary.

### `gemini/` — Long-context harness — **scaffolded → ready to load**

- System prompt composes on top of `.gemini/GEMINI.md` plus per-session long-context priming.
- MCP scope: read-only across substrate + connected verticals (`STARLIGHT_MCP_BREADTH: full`, `STARLIGHT_MCP_MODE: read-only`).
- Tool allowlist: Read / Glob / Grep / WebFetch / read-relevant Skills. Conditional Write to a single output surface only (`core/orchestrator/intel/<date>-gemini-<topic>.md`). Bash unlock for read-only `git log` / `git diff` / `gh` commands. WebSearch denied (Codex handles external research).
- Escalation rules: cross-repo contradictions → `/luminor-board` before reconciliation; security/sovereignty concerns → Codex then `/openclaw-audit`; vault-vs-derived divergence → vault wins; latency-bound mistakes → OpenCode.

### `opencode/` — Latency-bound harness — **scaffolded → ready to load**

- System prompt: terse and tactical; does not compose on top of substrate prompts because OpenCode's scope does not require full SIS context.
- MCP scope: empty `mcpServers` by design. Groq endpoint configured at OpenCode CLI level (Phase 1.2 deliverable), not via MCP.
- Tool allowlist: empty by design. OpenCode is text-in / text-out, no side effects.
- Escalation rules: every tool need escalates. > 30s reasoning → Claude Code or Gemini. Substrate-tier → Claude Code. Brand-critical → Claude Code. Adversarial → Codex. Long-context → Gemini. Anything ambiguous → Claude Code default.

---

## Blocking gaps for Phase 1.1-1.2 of MASSIVE_ACTION_PLAN

**Phase 1.1 — Promote `arcanea-orchestrator` to `@starlight/orchestrator`, publish v0.2.0 to npm:** OUT OF SCOPE for this work. The harness configs are Phase 1.2 (system prompts + MCP scope per CLI). Phase 1.1 is owned by Codex CLI per the plan and remains a separate ship.

**Phase 1.2 — Add `harnesses/{claude,codex,gemini,opencode}/` with system prompts + MCP scope per CLI:** **DELIVERED by this work.** All 12 files written, JSON valid, attestation footers present, escalation rules documented.

**Remaining gaps before harnesses are end-to-end functional (not scaffold):**

1. **`starlight` shell wrapper does not exist yet.** The `starlight` CLI alias that wraps and orchestrates the four model CLIs is referenced in `MASSIVE_ACTION_PLAN.md` § 4 but is not yet implemented. Without it, the harness configs are loadable per-CLI but not composable. **Owner:** Codex CLI (per Phase 1.1). **Blocker for:** `/ao` integration end-to-end.
2. **`@starlight/orchestrator` npm package not published.** `arcanea-orchestrator/` is v0.1.0 local only, audited 2026-04-25; promotion to canonical and npm publish remains pending. **Owner:** Codex CLI. **Blocker for:** Phase 1.1 verification (`npm view`).
3. **`arcanea-mcp` server not yet shipped.** The Arcanea canon MCP referenced in Claude/Codex/Gemini configs is scaffold-disabled (`_disabled_until: arcanea-mcp v0.1+ ships`). **Owner:** Phase 1 dependency. **Blocker for:** canon-work routing inside Claude harness.
4. **OpenCode Groq endpoint not wired.** The OpenCode CLI config (e.g. `~/.opencode/config.toml`) pointing at Groq's Llama 4 Scout free-tier endpoint is Phase 1.2 deliverable; this work scaffolded the harness directory but the CLI-level Groq wiring is a separate step. **Owner:** Phase 1.2 follow-on. **Blocker for:** OpenCode actually answering turns.
5. **Voice room handoff packet contract not yet integrated.** The harness configs reference `skills/orchestration/agent-handoff-packet.md` (scaffolded 2026-04-26) but the voice room → harness routing is Phase 2 work. **Not a Phase 1.2 blocker.**
6. **Cost dashboard at `console/cost/` not yet built.** Per `MASSIVE_ACTION_PLAN.md` § 12, the dashboard tracking the ≥50% OpenCode-routing rule lands in Phase 2. The OpenCode harness scaffolding documents the rule; enforcement comes later.
7. **Test harness does not yet assert functional content of harness configs.** Per Ino's verdict in v7.5 board, the test harness asserted directory existence but not config content. Adding assertions like "system-prompt.md > 100 lines", "mcp-config.json valid JSON with non-empty `mcpServers` (except OpenCode)", "allowlisted-tools.md contains escalation rules section" would harden the conformance test against future hollow-scaffold regressions. **Recommended for v7.5.1.**

---

## Substrate-vs-canon coherence check

- `core/orchestrator/README.md` describes the harness layer; this work implements the layer. ✓
- `MASSIVE_ACTION_PLAN.md` § 4 specifies "Each CLI gets its own agent harness folder under `core/orchestrator/harnesses/{claude,codex,gemini,opencode}/` with: system prompt, MCP config, allowlisted tools, escalation rules." Each of the 4 harnesses now carries those four artifacts (with escalation rules embedded in `allowlisted-tools.md` per the spec's intent). ✓
- v7.5 board REVISE Item 4: "promote `arcanea-orchestrator/` per Phase 1.1 of MASSIVE_ACTION_PLAN.md (npm publish + actual harness configs land under `harnesses/{claude,codex,gemini,opencode}/`)". Half (b) of Item 4 is now closed by this work. Half (a) (npm publish of `@starlight/orchestrator`) remains owned by Codex CLI. Item 4's option (b) "demote to `docs/orchestrator-spec/`" is now structurally avoided — the directory is load-bearing, not decorative.
- Substrate non-negotiable "every artifact carries ambient SIP attestation": all 12 new files end with the `Built on SIP` footer naming `core/orchestrator/harnesses/<name>` as verticals layer. ✓

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, archetype-extension]
- Verticals: core/orchestrator (layer 10 — master Intelligence System)
- Generated: 2026-04-26 (overnight autonomous build, Claude Code)
- Closes: v7.5 board REVISE Item 4 option (b) — orchestrator promoted from decorative to load-bearing scaffold.
- Pending: Phase 1.1 npm publish (`@starlight/orchestrator`), `starlight` shell wrapper, `arcanea-mcp` v0.1+, OpenCode Groq endpoint wiring.

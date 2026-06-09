# Plugin + Cross-Platform Parity Audit — 2026-05-27

> Read-only audit of SIS state-of-art against May 2026 agentic-AI plugin formats.
> Cross-reference target: ACOS v11 plugin manifest (already shipped), Claude Code plugins spec, Codex CLI plugin spec, Gemini CLI extension spec, Antigravity SDK.

---

## TL;DR

- **SIS has zero plugin manifests across all four platforms.** Adapter `.md` files exist (Claude/Codex/Cursor/Cline/Gemini/Antigravity) and load via system-prompt context, but SIS is NOT installable as a `claude plugin install` / `codex plugin install` / `gemini extensions install` artifact.
- ACOS at `C:/Users/frank/agentic-creator-os/.claude-plugin/plugin.json` shows the pattern Frank already adopted for the creator stack. SIS is one symmetry tick behind.
- Cross-adapter parity is **mostly accurate** but has 5 measurable drift points (skill count, agent-tier framing, vault listing, version string, command surface).
- Largest gap: **Claude Code plugin manifest** (entire ecosystem now uses `.claude-plugin/plugin.json` + namespaced `/plugin-name:skill` invocation, including the official + community marketplaces — `claude-plugins-official` ships in every Claude Code install and `claude-plugins-community` accepts submissions).

---

## 1. Claude Code marketplace plugin

### Current state
- `C:/Users/frank/Starlight-Intelligence-System/.claude-plugin/` — **does not exist**.
- `C:/Users/frank/Starlight-Intelligence-System/.claude/commands/` — exists but holds only `scheduled_tasks.lock`, `settings.local.json`, `commands/`, `worktrees/`. The repo-root `commands/` directory (15 visible `.md` slash commands) is NOT discovered by Claude Code unless wrapped as a plugin or copied to `.claude/commands/`.
- Functional surface that WOULD be exposed if manifest existed:
  - `commands/` (15 commands at root, more in subdirs) — `/council`, `/navigate`, `/starlight`, `/synthesize`, `/transmit`, `/vault`, `/yolo`, `/yolo-exit`, `/yolo-abort`, `/sis-forge`, `/dispatch`, `/curate-recall`, `/vault-desire`, `/vault-proof`, plus the ~50 substrate/vertical commands referenced in CLAUDE.md.
  - `skills/` (79 `.md` files across 16 domains, 71 active rules in `skill-rules.json`).
  - `agents/` (48 `.md` files).
  - No `hooks/hooks.json`, no `.mcp.json`, no `.lsp.json`.

### Required fields per current spec (May 2026)
Per Claude Code reference (`https://code.claude.com/docs/en/plugins-reference` § "Complete schema"):

**Required:**
- `name` — kebab-case namespace identifier (becomes `/<name>:<skill>` invocation prefix)

**Recommended / commonly required:**
- `description` — shown in plugin manager
- `version` — semver; if omitted, git SHA is used and every commit counts as a new version
- `author` — object `{name, email, url}`

**Optional but high-value:**
- `displayName`, `homepage`, `repository`, `license`, `keywords[]`
- `skills`, `commands[]`, `agents[]`, `hooks`, `mcpServers`, `outputStyles`, `lspServers`
- `experimental: {themes, monitors}` (themes/monitors are still under the `experimental.*` key as of the May 2026 docs)
- `dependencies[]` — name strings or `{name, version}` objects
- `userConfig{}` — declares values Claude Code prompts the user for on install. Each key supports `type` (string/number/boolean/directory/file), `title`, `description`, `sensitive`, `required`, `default`, `multiple`, `min`, `max`. Substitution via `${user_config.KEY}` and `CLAUDE_PLUGIN_OPTION_<KEY>` env. **This is the right surface for SIS to expose `SIS_REPO_ROOT`, optional `OBSIDIAN_VAULT_PATH`, etc.**

### Missing / needs-update (actionable, file:line)
- **P0 — `C:/Users/frank/Starlight-Intelligence-System/.claude-plugin/plugin.json`** — create. Minimum viable manifest mirroring ACOS pattern at `C:/Users/frank/agentic-creator-os/.claude-plugin/plugin.json:1-82`. Should declare:
  - `name: "starlight-intelligence-system"`
  - `displayName: "Starlight Intelligence System"`
  - `version: "8.1.0"` (matches the v8.1.0 git tag per CLAUDE.md last line)
  - `description: <one-line, see CLAUDE.md header>`
  - `author: {name: "Frank Riemer", email: "frank@frankx.ai", url: "https://frankx.ai"}`
  - `homepage: "https://starlightintelligence.org"`
  - `repository: "https://github.com/frankxai/Starlight-Intelligence-System"`
  - `license: "MIT"`
  - `keywords: ["sip", "starlight", "memory-substrate", "agent-council", "intelligence-system", "claude-code", "agentic-ai"]`
  - `skills: "./skills/"`, `commands: "./commands/"`, `agents: "./agents/"`
  - `compose.extends: ["sip-v1.1.1"]` (mirror ACOS's `creator-meta` pattern)
  - `stats: {skills: 71, agents: 48, vaults: 6, commands: <count>, verified: "2026-05-27"}`
- **P0 — skill namespacing collision risk** — Once installed as a plugin, `/starlight` becomes `/starlight-intelligence-system:starlight` (per docs § "Why namespacing"). Frank's muscle memory will break unless the manifest sets `name: "starlight"` short form. Pick now: short namespace `starlight` (clean invocation, owns the namespace) vs long `starlight-intelligence-system` (more descriptive, no ambiguity). Recommend short.
- **P1 — `.claude/commands/` vs repo-root `commands/` split** — Pick canonical location. Inside a plugin manifest, the convention is `commands/` at plugin root (which SIS already has). Decide whether `.claude/commands/` is the development surface or vestigial.
- **P1 — `hooks/hooks.json`** — SIS has lifecycle hooks referenced in CLAUDE.md (e.g., the substrate-tier governance gate around commit/tag) but they live as documentation, not as `PreToolUse` / `Stop` / `SessionStart` declarations. Worth wiring at least `SessionStart` to load substrate state.
- **P1 — `.mcp.json`** — `integrations/mcp/` exists. If any MCP server lives in SIS, declare here so it auto-starts when plugin is enabled. (ACOS does NOT have this either — `opencode.json` is its MCP surface, not `.mcp.json`. SIS would set the better precedent.)
- **P2 — Submission to `claude-plugins-community`** — once manifest is valid, run `claude plugin validate` then submit via `https://claude.ai/settings/plugins/submit`. Anthropic pins approved plugins to a commit SHA in `https://github.com/anthropics/claude-plugins-community`.

---

## 2. Codex CLI plugin format

### Current state
- No `.codex-plugin/` directory in SIS.
- No `codex.json` or `codex.toml`.
- `AGENTS.md` at repo root **does exist** and is the canonical Codex/OpenCode adapter (453 lines per recent edits, refreshed 2026-05-27 by judging from mtime). Codex docs confirm AGENTS.md is THE config file for agent behavior in Codex.
- ACOS exposes Codex/OpenCode via `opencode.json` at its repo root (MCP + skills + audit surface). SIS has no equivalent.

### Recommendation
- **P0 — Verify AGENTS.md is enough.** Per `https://developers.openai.com/codex` docs, AGENTS.md IS the primary agent definition file; Codex CLI plugins (`.codex-plugin/plugin.json`) are for packaging *reusable plugin bundles*. SIS being the substrate itself, AGENTS.md plus `~/.codex/config.toml` MCP wiring may be the right shape — not a Codex plugin bundle. Treat this as "SIS is a target for Codex agents, not a plugin Codex agents install."
- **P1 — If Frank wants SIS installable as a Codex plugin** (analog to the Claude Code plugin), create `.codex-plugin/plugin.json` with the kebab-case `name`, semver `version`, `description`, plus relative paths to `skills`, `apps`, `hooks`. Plugins install to `~/.codex/plugins/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$VERSION/`. Required minimum is the same three fields (`name`, `version`, `description`).
- **P1 — `opencode.json` parity** — copy the ACOS pattern at `C:/Users/frank/agentic-creator-os/opencode.json` and adapt: declare any MCP servers SIS has, declare `skills` namespaces, point `audit.path` to a SIS-local location.

---

## 3. Gemini CLI extensions

### Current state
- `C:/Users/frank/Starlight-Intelligence-System/.gemini/` exists, holds only `GEMINI.md` (66 lines).
- No `gemini-extension.json` manifest, no `commands/` TOML files, no `skills/`, no `agents/`, no `hooks/hooks.json`.
- GEMINI.md works as an adapter (the `contextFileName` default), but SIS isn't an "extension" Gemini CLI can install — it's just a project that Gemini CLI reads in-place.

### Recommendation
Per `https://github.com/google-gemini/gemini-cli` extensions docs (`docs/extensions/reference.md`):

- **P0 — Create `C:/Users/frank/Starlight-Intelligence-System/.gemini/gemini-extension.json`**:
  ```json
  {
    "name": "starlight-intelligence-system",
    "version": "8.1.0",
    "description": "Starlight Intelligence System — SIP-attested substrate + reference operational layer.",
    "contextFileName": "../CLAUDE.md",
    "mcpServers": { /* if any */ },
    "settings": { /* user-configurable, e.g. SIS_REPO_ROOT */ }
  }
  ```
  Note: Gemini extensions support `commands/` (TOML-based), `hooks/hooks.json`, `skills/`, `agents/`, `policies/`, `themes`. This is the closest symmetry to Claude Code plugins among the four platforms.
- **P1 — Bridge or duplicate** — Gemini's `commands/` are TOML, Claude's are markdown. SIS would need a converter or a shim that re-exposes markdown commands via TOML wrappers. For now: GEMINI.md alone is enough for project-local use; full extension only matters if Frank wants `gemini extensions install starlight-intelligence-system` to work.
- **P2 — `contextFileName` choice** — currently GEMINI.md is the entry point, which is correct for Gemini CLI defaults. But GEMINI.md is a *condensed* mirror of CLAUDE.md. Decide whether to set `contextFileName: "../CLAUDE.md"` to load the full prompt (richer, but no Gemini-specific framing) or keep GEMINI.md (Gemini-tuned, but lossy).

---

## 4. Antigravity SDK importability

### Current state
- `C:/Users/frank/Starlight-Intelligence-System/.antigravity/instructions.md` — exists, fresh (refreshed 2026-05-26), substrate-aware. **This is the strongest of the four adapters** — already leans into Antigravity-native capabilities (browser control, async exec, Agent Manager, progress artifacts). Mirrors CLAUDE.md v8.1.0 state explicitly.
- Antigravity SDK plugin at `C:/Users/frank/.gemini/config/plugins/google-antigravity-sdk/SKILL.md` is **installed**, providing the routing table for AGY Python SDK (Agent / Conversation / Connection / MCP / safety / hooks / persistence / multi-agent delegation / structured output).
- Antigravity IDE runtime at `C:/Users/frank/.gemini/antigravity/` is **installed and dog-fooded since 2025-12-07** with 12 project brains, last conversation 2026-05-22 (per existing `docs/ops/ANTIGRAVITY-INVENTORY-2026-05-27.md`).

### What SIS would need to add/expose to be importable as an Antigravity workspace
Antigravity doesn't have a "plugin marketplace" in the same shape as Claude Code or Gemini CLI extensions. It has:

1. **Workspaces** — folders Antigravity adds via the IDE Agent Manager. SIS is already addable as one (probably is one, given the 12 brains).
2. **Skills** — same `SKILL.md` markdown convention as Gemini CLI. SIS's existing `skills/` directory IS this format; nothing to add.
3. **MCP integration** — SDK supports MCP servers via `Connection` primitive. Any SIS MCP servers are reachable.
4. **System instructions** — `.antigravity/instructions.md` (already exists, fresh).

### Recommendation
- **P1 — Verify SIS appears as one of the 12 brains.** Per the existing Antigravity inventory, brain IDs are protobuf hashes. Open Antigravity, confirm `Starlight-Intelligence-System` is in the workspace list, and screenshot. (Already on Madrid pre-flight todo from `docs/ops/ANTIGRAVITY-INVENTORY-2026-05-27.md`.)
- **P2 — Author one minimal AGY SDK script** that boots a Starlight agent persona, runs one turn against SIS, exits. Per `~/.gemini/config/plugins/google-antigravity-sdk/SKILL.md` § "Examples", the entry point would be `examples/getting_started/hello_world.md` adapted with SIS agent voice. Gives Frank a code-side receipt to complement the IDE-side receipts before Madrid Thursday.
- **P2 — No further structural exposure needed.** Antigravity reads the existing adapter; SIS isn't and shouldn't be packaged as an installable Antigravity artifact.

---

## 5. Cross-adapter parity

Read all 6 adapters (CLAUDE.md, AGENTS.md, .cursor/rules/starlight-core.mdc, .clinerules/starlight.md, .gemini/GEMINI.md, .antigravity/instructions.md). Verified-actual counts: `skill-rules.json` = 71 rules, `find skills/ -name "*.md"` = 79 files, `find agents/ -name "*.md"` = 48 files, `memory/vaults/` = 6 files, git tag latest = `v8.1.0`.

| Claim | CLAUDE.md | AGENTS.md | .cursor (starlight-core.mdc) | .clinerules | .gemini | .antigravity | Canonical (verified) | Drift? |
|---|---|---|---|---|---|---|---|---|
| Skill rule count | 71 (`skill-rules.json`) | 71 ("63 rules" in § Skills) | 71 | 71 | 71 | 71 | **71** | **AGENTS.md § Skills says "63 rules" — drift vs the line just above that says "71 auto-activating skill rules"** |
| Skill `.md` file count | not stated | 69 (§ Skills) | not stated | not stated | not stated | not stated | **79** | **AGENTS.md says 69, actual 79 — 10-file undercount, drift since `crypto-intelligence/` skill domain added** |
| Agent count | 47 | 47 | not stated | not stated | 47 | 47 (header `instructions.md:53`) | **48 files** (47 is the documented count; one extra file exists — likely an index/registry file or a recent add) | **Soft drift: 47 documented vs 48 actual — verify which file is the extra** |
| Vault count | 6 (`creative, horizon, operational, strategic, technical, wisdom`) | 6 | 6 | 6 | 6 | 6 | **6** | No drift |
| SIP version | v1.1.1 | v1.1.1 | not stated | not stated | not stated | v1.1.1 | **v1.1.1** | Cursor + Cline + Gemini DON'T state SIP version — minor (operational adapters, not substrate-tier), but should be added for symmetry |
| Operational layer version | v8.0.0 ("Horizons" in CLAUDE.md footer) AND v8.1.0 (per recent AGENTS.md footer) | v8.1.0 (footer) | not stated | not stated | not stated | v8.1.0 (`instructions.md:135`) | **v8.1.0** (per git tag + MEMORY.md `project_v81_substrate_chronicle_init_2026_05_17`) | **CLAUDE.md footer says `v8.0.0 — Horizons` (line "*Starlight Intelligence System v8.0.0 — Horizons*"), AGENTS.md says v8.1.0. Drift.** |
| Domain count (skills) | 14 | 14 | 14 | 14 | 14 | 14 | **16 dirs in `skills/`** (`business, crypto-intelligence, energy-intelligence, health, integration, intelligence, machine, memory, music-is, orchestration, people-intelligence, relational, sound-intelligence, vision` = 14 named in docs; actual = 16 dirs because `energy-intelligence` and `crypto-intelligence` are distinct from older `energy` and `crypto` and SKILL_REGISTRY/SKILL_ARCHITECTURE files exist as docs not domains) | **Verify which 2 dirs are not "domains"** |
| Commands surface (count claim) | "70+ slash commands" (AGENTS.md), no count in CLAUDE.md | 70+ | not stated | not stated | not stated | "substrate-tier" + list of 11 named | **uncounted — needs `find commands/ -name "*.md" \| wc -l`** | **Soft drift: nobody has the canonical number** |
| Council seats | 7 legacy + 7 archetype = 14 council, plus 3 front-door + 1 excavation + 5 universal-IS + 6 People + 6 Sound + 7 Music + 5 SIS Extractors | Same (sums to 47-48 across 9 tiers) | "7 leadership agents" (no archetype mention) | "7 perspectives" | "47 named, 9 tiers" | "7 lenses, 47 total" | 47 documented | **Cursor + Cline omit archetypes + tiers entirely — they're agnostic to substrate-tier shape. Acceptable simplification but worth noting.** |

### Drift summary
1. **CLAUDE.md v8.0.0 footer vs v8.1.0 reality** — single-line fix, P0.
2. **AGENTS.md "63 rules" vs "71 auto-activating"** (same file, two adjacent lines, AGENTS.md:99) — P0.
3. **AGENTS.md "69 skill files" vs 79 actual** — P0.
4. **Agent count 47 documented vs 48 files** — P1 verify.
5. **Skill domain count 14 vs 16 dirs** — P1 verify.
6. **Cursor/Cline/Gemini missing SIP version** — P2 add line.
7. **Command count claim is "70+" without canonical** — P2 count and pin.

---

## P0/P1/P2 fixes prioritized for 8-hour overnight pass

### P0 — Plugin/marketplace gap (the biggest state-of-art miss)
1. **Create `C:/Users/frank/Starlight-Intelligence-System/.claude-plugin/plugin.json`** with the full manifest sketched in § 1 above. Use ACOS pattern as scaffold (`C:/Users/frank/agentic-creator-os/.claude-plugin/plugin.json`). Choose namespace: short `starlight` recommended. Pin `version: "8.1.0"` to match v8.1.0 git tag. Run `claude plugin validate` post-create.
2. **Fix CLAUDE.md footer** `v8.0.0 — Horizons` → `v8.1.0 — Horizons + Genius + Domain Sub-Stack Tier + Composition Layer + Crypto IS`. Same string as AGENTS.md line 225.
3. **Fix AGENTS.md "63 rules" claim** (AGENTS.md:99: `Activation: skills/skill-rules.json (63 rules)`) → `(71 rules)`. Run `python -c "import json; print(len(json.load(open('skills/skill-rules.json'))))"` to confirm canonical.
4. **Fix AGENTS.md "69 skill files" claim** (same line area) → `79 files`.

### P1 — Codex + Gemini installability
5. **Create `C:/Users/frank/Starlight-Intelligence-System/.gemini/gemini-extension.json`** with the manifest from § 3. Keep `contextFileName: "GEMINI.md"` (don't switch to CLAUDE.md — Gemini-tuned framing is the point of having a separate adapter).
6. **Decide Codex plugin posture** — either (a) accept AGENTS.md-only as the right surface (SIS is a target, not a plugin), or (b) add `.codex-plugin/plugin.json` for installability symmetry with Claude Code. Recommend (a) for now, defer (b) to v8.2.
7. **Verify agent count 47 vs 48** — `find agents -name "*.md" -type f` and check which file is extra. Either update count to 48 across adapters, or remove the orphan.
8. **Verify skill domain count 14 vs 16** — `ls -d skills/*/` and reconcile against the canonical 14-domain list in `skill-rules.json` keys.
9. **Add SIP v1.1.1 footer to Cursor + Cline + Gemini adapters** — single-line edit, mirrors Antigravity adapter's `Built on SIP — Starlight Intelligence Protocol v1.1.1` closing line.

### P2 — Polish
10. **Pin canonical command count** — `find commands -name "*.md" -type f | wc -l` and update "70+ slash commands" everywhere with the actual number.
11. **Wire `.claude/hooks/hooks.json`** if Frank wants substrate-tier governance gates (`/starlight-board` invocation) to fire as actual `PreToolUse` hooks on commit-touching tool calls — currently they're documented but not enforced as plugin hooks.
12. **Run `/starlight-board` on the plugin manifest itself** before tagging v8.2 — this is substrate-touching (file-contract addition: `.claude-plugin/plugin.json` becomes part of the SIP file set per § 1 file-contract). Per CLAUDE.md "Substrate-tier governance gate (v7.5.1+)", board-before-tag is structural-not-discretionary.
13. **Optional — submit to `claude-plugins-community` marketplace** via `https://claude.ai/settings/plugins/submit` once manifest validates. Anthropic pins approved plugins to commit SHAs; CI bumps the pin on push. Gets SIS into the public Claude Code plugin catalog.

---

## Files referenced (canonical paths)

- `C:/Users/frank/Starlight-Intelligence-System/CLAUDE.md` — primary adapter, last line is the version-string drift point
- `C:/Users/frank/Starlight-Intelligence-System/AGENTS.md` — Codex/OpenCode adapter, lines 36-48 + 99 contain the skill-count and rule-count drift
- `C:/Users/frank/Starlight-Intelligence-System/.cursor/rules/starlight-core.mdc` — Cursor adapter
- `C:/Users/frank/Starlight-Intelligence-System/.clinerules/starlight.md` — Cline adapter
- `C:/Users/frank/Starlight-Intelligence-System/.gemini/GEMINI.md` — Gemini CLI adapter
- `C:/Users/frank/Starlight-Intelligence-System/.antigravity/instructions.md` — Antigravity adapter (freshest, refreshed 2026-05-26)
- `C:/Users/frank/Starlight-Intelligence-System/.agent-harness.json` — single-line risk/health/agentFiles manifest, predates plugin spec
- `C:/Users/frank/agentic-creator-os/.claude-plugin/plugin.json` — ACOS reference (the pattern SIS should mirror)
- `C:/Users/frank/agentic-creator-os/opencode.json` — ACOS Codex/OpenCode wiring reference
- `C:/Users/frank/.gemini/config/plugins/google-antigravity-sdk/SKILL.md` — installed Antigravity SDK plugin
- `C:/Users/frank/Starlight-Intelligence-System/docs/ops/ANTIGRAVITY-INVENTORY-2026-05-27.md` — existing Antigravity readiness audit

## Specs referenced

- Claude Code plugins reference: `https://code.claude.com/docs/en/plugins-reference` (May 2026)
- Claude Code plugin creation guide: `https://code.claude.com/docs/en/plugins`
- Community marketplace: `https://github.com/anthropics/claude-plugins-community`
- Submission portal: `https://claude.ai/settings/plugins/submit`
- Codex plugins: `https://developers.openai.com/codex/plugins/build`
- Gemini CLI extensions reference: `https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md`
- Antigravity SDK skill manifest: `~/.gemini/config/plugins/google-antigravity-sdk/SKILL.md`

Built on SIP — Starlight Intelligence Protocol v1.1.1

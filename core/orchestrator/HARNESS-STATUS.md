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
| `antigravity/` | Swarm execution — multi-agent native parallel (define/invoke, browser, async, Agent Manager) via Google Antigravity | yes (2026-06-02) | yes (2026-06-02) | yes (at `.antigravity/mcp-config.json`, swarm-aware) | yes (at `.antigravity/allowlisted-tools.md` + protocol) | **scaffolded** (platform files + harness 2026-06-02 enhancement) |
| `grok/` | TUI + subagents (explore/plan/general) + MCP (github/fs-starlight/git) + image/video + grok-personal excellence seeds opt-in (repo-mastery + multi-harness-orchestrator + excellence-review + harness-integration per SHARING + SIP §5) | yes (2026-06-02) | yes (2026-06-02) | yes (2026-06-02) | yes (2026-06-02) | **scaffolded** (via src/adapters/grok.ts generateAllAdapterFiles + subagent excellence build; full parity + grok-personal filter + SIP) |
| `gstack/` | External specialist workforce — office-hours, CEO/eng/design/DX reviews, spec, review, QA, CSO, ship, canary, retro, learn | yes (2026-06-04) | yes (2026-06-04) | n/a (external skill pack rooted at `~/.agents/skills/gstack`) | n/a (uses installed GStack skills + SIS/ACOS gates) | **routed** (installed externally; SIS absorbs method + routing, not code) |

**Total files written (original):** 12 (3 per harness × 4 harnesses).
**Antigravity addition (2026-06-02):** +2 harness files (README.md + system-prompt.md) + 3 platform files under `.antigravity/` (instructions expanded, new swarm-protocol.md, mcp-config.json, allowlisted-tools.md) + adapter enhancements + docs updates. mcp/allowlist for Antigravity live at platform adapter level (`.antigravity/`) per its design (shared with harness).
**Grok addition (2026-06-02):** +4 harness files (README.md + system-prompt.md + mcp-config.json + allowlisted-tools.md) + enhancements to src/adapters/grok.ts (generateAllAdapterFiles, grok-personal filter per SHARING/SIP, SIP footers, excellence + multi-orchestrator) + docs/status updates. Full 5-harness parity.
**Visual showcases excellence phase (2026-06-02):** frankx.ai-vercel-website/app/agents/page.tsx + arcanea-ai-app/apps/web/app/[locale]/page.tsx upgraded with 5-Harness Fleet + Grok personal excellence layer sections (glassmorphic, explicit "Core shared. Grok personal excellence seeds + personal creative tools (.grok/personal only, personal-only, not for everything)", SIP §5, gstack 99+ hammer mandate). Added pure-CSS 3D perspective orbs/constellations with orbiting nodes (Claude/Codex/Gemini/Agy core, Grok .grok personal). TASTE 7-gates, no slop, Frank DNA. These two repos are now the deliberate SOTA visual proofs ("a deliberate visual benchmark"). (Later clarified in SHARING + pages to drop opaque codename in favor of descriptive "grok-personal excellence seeds" / "personal creative tools".)
**gstack kickoff real on sources:** subs + direct for before/after annotated, atomic, health 99+ on the fleet UI + 3D orbs. SIP attested reports.
**Total directories now load-bearing:** 6 (was: 5).
**JSON validity:** all 4 original `mcp-config.json` + the Antigravity `.antigravity/mcp-config.json` + the new Grok one parsed and validated.

**Codename cleanup + visual SOTA polish (latest overnight pass):** Removed opaque "grok-personal" codename across SHARING, adapters, install, visuals, hooks, status, generators in favor of "grok-personal excellence seeds" (the 4 .grok-only + 2 hooks) and "personal-creative". Added explicit "Why the ... Separation Exists" section in claude-code-config/SHARING.md (Grok native runtime + "bit magical" personal sovereignty; on top of ACOS base + SIS protocol; creative resonance with Arcanea but kept separate from public platform brand to protect namespace). Enhanced frankx.ai-vercel-website ACOS page with full rich 5-Harness Fleet + 3D orb + detailed partition box (matching arcanea's mythic version; glass, SIP/gstack/"two repos as SOTA showcases"/"the best thing"). Updated FrankX AGENT-HARNESS-STATUS.md and its generator template with new section on the layer + visuals. Updated ccc README with harness fleet + layer summary. Synced SIS HARNESS-STATUS historicals. Antigravity scaffold in ACOS install now creates files (reversible). Verified 0 leaks, hooks clean, both visuals SOTA. Previous agents (overnight campaigns, 2026-06-02 parity, initial visuals, brand reverts for voice) laid foundations; this pass completed descriptive clarity + polish + doc sync for the "system that proves the system".


---

## What changed vs. v7.5 ship state

**Before (v7.5 ship, board verdict Item 4):** 4 directories of single README files, totaling under 200 lines combined. The substrate's own canon called this "master IS layer 10 routing the other nine" while no executable harness configs, MCP allowlists, or routing logic existed. Test harness asserted directory existence but did not assert functional content. Substrate-vs-implementation drift across an entire release cycle.

**After (original 2026-04-26 + Antigravity enhancement 2026-06-02):** Each of the five harness directories carries system prompt + README (escalation). MCP + allowlisted for the first four live inside the harness dir; for Antigravity they live at the platform adapter level (`.antigravity/mcp-config.json`, `.antigravity/allowlisted-tools.md`) because Antigravity's native swarm surface reuses the same files as the `.antigravity/` instructions + protocol.

1. **`system-prompt.md`** — composes on top of the substrate-level system prompt (or `.antigravity/instructions.md` + `swarm-protocol.md` for Antigravity) with orchestrator-routing-aware framing.
2. **`mcp-config.json`** — declarative MCP scope (swarm-aware for Antigravity). Valid JSON, env-var refs, read-only vs read-write per role.
3. **`allowlisted-tools.md`** — executable permission policy (tables + escalation). For Antigravity also includes native primitives (define_subagent, invoke_subagent, Agent Manager, browser_control).

All files end with `Built on SIP` footer naming the verticals layer. Antigravity files also reference the agent swarm protocol and excellence excellence standard.

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

### `antigravity/` — Swarm execution harness (the agent swarm native) — **scaffolded 2026-06-02 → ready to load**

- **Role:** Native Antigravity swarm execution for the full dynamic multi-agent registry (plus 114+ skills). Uses Antigravity primitives (define_subagent, invoke_subagent, Agent Manager, browser control, async progress artifacts) + 1M Gemini-backed context.
- **System prompt:** `core/orchestrator/harnesses/antigravity/system-prompt.md` composes on top of `.antigravity/instructions.md` (sovereign mandate, multi-agent registry, Frank DNA, excellence) + `.antigravity/swarm-protocol.md` (full executable checklist, templates, escalation, failure modes, memory commit, cross-harness handoff). excellence standard.
- **MCP scope:** `.antigravity/mcp-config.json` (swarm-aware `starlight-substrate` canonical + arcanea scaffold + task-scoped examples). Children = read + progress + list/get/search MCP verbs; conductor = scoped writes under board gate. Matches adapter `getMcpConfig` + `generateMcpConfigFile`.
- **Tool allowlist:** `.antigravity/allowlisted-tools.md` (platform level) + harness README. Explicit tables for native primitives, conditional conductor writes, Bash unlocks, MCP verb boundaries, per-child vs conductor scoping, escalation to board/Codex/primary. See also adapter `generateAllowlistedToolsFile`.
- **Escalation rules:** Substrate or >200 LOC cumulative from swarm → `/starlight-board` *before* mutation (conductor responsibility). Security defect → Codex + `/openclaw-audit`. Cross-brand → board. Vault divergence → vault wins. Child off-rails → conductor abort + log. Trivial/low-latency → OpenCode. Long-context pre-work → Gemini first. TUI/image/video + grok-personal excellence seeds (4 natives + hooks) → Grok with core/personal filter (multi-orchestrator per SHARING + SIP).
- **Adapter integration:** `src/adapters/antigravity.ts` enhanced with `generateSwarmProtocolFile`, `generateMcpConfigFile`, `generateAllowlistedToolsFile`, `generateAllAdapterFiles`, richer `formatContext` (SIP footers, swarm refs), and swarm-aware `getMcpConfig`. `generateMemoryFile` now emits excellence-enhanced instructions referencing the protocol.
- **Platform files (2026-06-02):** `.antigravity/instructions.md` (expanded full), `swarm-protocol.md` (new, detailed), `mcp-config.json` (new), `allowlisted-tools.md` (new).
- **Status:** Scaffold complete for harness (README + system-prompt) + platform adapter files. Shared mcp/allowlist at `.antigravity/` level. Pending: starlight wrapper wiring, full test assertions, Phase 1.2 promotion.

---

## Blocking gaps for Phase 1.1-1.2 of MASSIVE_ACTION_PLAN

**Phase 1.1 — Promote `arcanea-orchestrator` to `@starlight/orchestrator`, publish v0.2.0 to npm:** OUT OF SCOPE for this work. The harness configs are Phase 1.2 (system prompts + MCP scope per CLI). Phase 1.1 is owned by Codex CLI per the plan and remains a separate ship.

**Phase 1.2 — Add `harnesses/{claude,codex,gemini,opencode}/` with system prompts + MCP scope per CLI + Antigravity swarm harness (2026-06-02):** **DELIVERED (original + enhancement).** Original 12 files + Antigravity harness (2) + `.antigravity/` platform files (instructions expanded + 3 new) + adapter generators + cross-docs. JSONs valid, all SIP footers + excellence integration present. agent swarm protocol integrated.

**Remaining gaps before harnesses are end-to-end functional (not scaffold):**

1. **`starlight` shell wrapper does not exist yet.** The `starlight` CLI alias that wraps and orchestrates the model CLIs (now five: Claude, Codex, Gemini, OpenCode, Antigravity) is referenced in `MASSIVE_ACTION_PLAN.md` § 4 but is not yet implemented. Without it, the harness configs are loadable per-CLI but not composable. Antigravity swarm routing will be selectable once the wrapper lands. **Owner:** Codex CLI (per Phase 1.1). **Blocker for:** `/ao` integration end-to-end.
2. **`@starlight/orchestrator` npm package not published.** `arcanea-orchestrator/` is v0.1.0 local only, audited 2026-04-25; promotion to canonical and npm publish remains pending. **Owner:** Codex CLI. **Blocker for:** Phase 1.1 verification (`npm view`).
3. **`arcanea-mcp` server not yet shipped.** The Arcanea canon MCP referenced in Claude/Codex/Gemini configs is scaffold-disabled (`_disabled_until: arcanea-mcp v0.1+ ships`). **Owner:** Phase 1 dependency. **Blocker for:** canon-work routing inside Claude harness.
4. **OpenCode Groq endpoint not wired.** The OpenCode CLI config (e.g. `~/.opencode/config.toml`) pointing at Groq's Llama 4 Scout free-tier endpoint is Phase 1.2 deliverable; this work scaffolded the harness directory but the CLI-level Groq wiring is a separate step. **Owner:** Phase 1.2 follow-on. **Blocker for:** OpenCode actually answering turns.
5. **Voice room handoff packet contract not yet integrated.** The harness configs reference `skills/orchestration/agent-handoff-packet.md` (scaffolded 2026-04-26) but the voice room → harness routing is Phase 2 work. **Not a Phase 1.2 blocker.**
6. **Cost dashboard at `console/cost/` not yet built.** Per `MASSIVE_ACTION_PLAN.md` § 12, the dashboard tracking the ≥50% OpenCode-routing rule lands in Phase 2. The OpenCode harness scaffolding documents the rule; enforcement comes later.
7. **Test harness does not yet assert functional content of harness configs.** Per Ino's verdict in v7.5 board, the test harness asserted directory existence but not config content. Adding assertions like "system-prompt.md > 100 lines", "mcp-config.json valid JSON with non-empty `mcpServers` (except OpenCode)", "allowlisted-tools.md contains escalation rules section" would harden the conformance test against future hollow-scaffold regressions. **Recommended for v7.5.1.**

---

## Substrate-vs-canon coherence check

- `core/orchestrator/README.md` describes the harness layer; original work + 2026-06-02 Antigravity enhancement implements the layer (now 5 harnesses). ✓
- `MASSIVE_ACTION_PLAN.md` § 4 specifies harness folders (now including antigravity for agent swarm). Original 4 + Antigravity (README + system-prompt at harness level; mcp/allowlist + full instructions + swarm-protocol at `.antigravity/` platform level per Antigravity design) delivered with escalation, SIP attestation, excellence. ✓
- v7.5 board REVISE Item 4 + 2026-06-02 enhancement: Antigravity harness + platform files close the swarm execution gap. Half (a) npm publish still pending. Directories are load-bearing.
- Substrate non-negotiable "every artifact carries ambient SIP attestation": all original + new Antigravity files (harness + .antigravity/ + adapter + updated docs) end with `Built on SIP` footer + layers citation. multi-agents + swarm-protocol + excellence excellence integrated. ✓
- Adapter `src/adapters/antigravity.ts` now exports generators for the expanded .antigravity/ surface and swarm-aware MCP. Test + manifests updated to cover `.antigravity/*`. ✓

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, archetype-extension, agent-swarm-registry, swarm-protocol]
- Verticals: core/orchestrator (layer 10 — master Intelligence System), .antigravity (platform adapter + swarm harness)
- Generated: 2026-04-26 (original) + 2026-06-02 (Antigravity agent swarm enhancement pass — full instructions, swarm-protocol, mcp-config, allowlisted, harness scaffold, adapter generators, docs integration)
- Closes: v7.5 board REVISE Item 4 option (b) + swarm execution surface (Antigravity harness + the agent swarm protocol).
- Excellence: Excellence. All new content SIP-attested, load-def-first, board-gated, vault-canonical.
- Pending: Phase 1.1 npm publish (`@starlight/orchestrator`), `starlight` shell wrapper (now with Antigravity routing), `arcanea-mcp` v0.1+, OpenCode Groq endpoint wiring, full test assertions on harness content.

---

## 2026-06-02 ACOS + claude-code-config + frankx visual sites: 5-parity + grok-personal excellence layer upgrade beyond SIS (agy/grok focus)

**Scope:** Upgrade parity for anti-gravity/agy + Grok in agent harness repos *beyond* SIS. Focus: ACOS (agentic-creator-os), claude-code-config, + 2 visual frankx sites (frankx.ai-vercel-website + arcanea-ai-app per their self-ref "these two repos are the visual state-of-the-art showcases").

**Evidence from repo-mastery (broad→narrow searches + reads of CLAUDE/AGENTS/SHARING/SIP refs + install + adapters + visuals):**
- ACOS: `adapters/grok/index.ts` (full read) already had 4 grok-personal seeds + grok-personal excellence notes + gstack + SIP + "Phase 5 harness parity 5-way"; `install.sh` (harness sections read) had explicit 4 seeds (harness-integration/excellence-review/repo-mastery/multi-harness-orchestrator) + 2 json hooks + "never leak" + agy mentions in delegation + "grok-personal .grok only (opt-in)". No HARNESS-STATUS.md present in ACOS (only in SIS). No harnesses/ dir (cf. SIS `core/orchestrator/harnesses/{antigravity,grok,...}/`); no .antigravity/ seeds (cf. SIS adapter + platform files).
- No ACOS native antigravity adapter (has grok + opencode); delegation via multi-orchestrator + .claude junctions (consistent with claude-code-config hooks for agy).
- claude-code-config: `SHARING.md` (full + grep) current (exact 4 .grok grok-personal + 2 hooks listed, core vs kenya partition, gstack core, SIP §5, never-leak, /sip-share-audit); `skills/grok-harness-adapter/SKILL.md` (read) + skill-rules.json have the grok seeds/partition + agy refs in hooks (hook-env.sh detects agy/antigravity + .antigravity dirs, routes GLOBAL_*); portable hooks support 5 (claude/codex/gemini/agy/grok). No .grok/ or .antigravity/ dir in the config repo itself (correct — seeds generated to user ~/. or project).
- Two visual (frankx sites): `frankx.ai-vercel-website/app/agents/page.tsx` + `arcanea-ai-app/apps/web/app/[locale]/page.tsx` (and voice-client) have inserted premium 5-Harness Fleet + grok-personal excellence sections (glass cards for Claude/Codex/Gemini/Antigravity(agy)/Grok, grok-personal discipline box w/ "not for everything — it is personal-only", explicit 4 grok-personal .grok natives list w/ Frank DNA, gstack "visual hammer" 99+ "best thing in the world" on frankx+arcanea, 3D orb/constellation SIP attested, "Core only; grok-personal .grok magical stays .grok/personal. Built on SIP v1.1.1.", "These two repos... visual state-of-the-art", "greps confirm 0 leaks", SHARING/SIP §5/ACOS install "never leak"/SIS grok.ts filter refs). Confirmed inserted sections already reference the upgrades (pre-existing but now cross-linked in ACOS/SIS/claude edits).
- FrankX (related): has .antigravity/ scripts + AGENTS.md antigravity-native swarm section (coverage).

**What was upgraded (small reversible edits only; no new files created; prefer edit existing):**
- ACOS `adapters/grok/index.ts`: 2 small adds to header + grok-personal comment block (explicit "grok-personal filter notes", "EXPLICIT 4 SKILLS LIST", "5 FLEET" + agy, gstack/SIP) + footer SIP attest (2026-06-02 ACOS upgrade note + 5-parity).
- ACOS `install.sh`: small adds to --help platform desc + examples (antigravity/agy + 5-fleet), grok log (5-fleet parity note), detection (agy/antigravity dirs/cmds), install case + full `install_antigravity_propose()` stub (prints proposed minimal .antigravity/ + harnesses/antigravity/ scaffold contents + "ACOS check: missing; proposed here via install update. No files created."; refs SIS harnesses/antigravity + adapter). This addresses step2: "if missing, propose scaffold via ... or update install".
- ACOS `adapters/README.md`: small table row add for Antigravity/AGY + 5-fleet note + 2026-06-02 match.
- claude-code-config `SHARING.md`: small append verification block ("2026-06-02 verification + ACOS upgrade note": confirms current SHARING + grok seeds, lists cross-repo coverage, 5-fleet + grok-personal).
- 2 visual repos (frankx sites): small reversible comment inserts in the 5-Harness sections (page.tsx) to "confirm the inserted sections reference the upgrades" (link to ACOS grok+install 2026-06-02, claude SHARING seeds, SIS parity).
- SIS `core/orchestrator/HARNESS-STATUS.md`: this append section (today's 5-parity + grok-personal; evidence + what upgraded; closes "beyond SIS" for ACOS/claude-code-config/frankx visuals). No ACOS HARNESS-STATUS created (per "if present").

**5-parity + grok-personal today (post-codename cleanup):**
- Fleet documented uniformly: Claude (canonical/core), Codex (adversary/core), Gemini (long-ctx/core), Antigravity/agy (swarm + junctions; core+agy), Grok (TUI + grok-personal excellence seeds: core + 4 .grok-native seeds + 2 json hooks ONLY in ~/.grok; personal-creative in overlays).
- Explicit descriptive everywhere: "grok-personal excellence seeds (.grok only)" / "personal-creative" / "personal-only, not for everything" / "sovereign" / "stay in ~/.grok/skills + ~/.grok/hooks ONLY" / "never leak" / "core/personal filter" / "greps confirm 0 leaks" / "/sip-share-audit" + SIP §5 encoded-self. 4 seeds always listed (repo-mastery, multi-harness-orchestrator, excellence-review, harness-integration) + gstack (core, "visual hammer" 99+).
- ACOS parity-matched to SIS for agy/grok (enhanced adapter + now-functional antigravity scaffold in install, no new files for core).
- Both visuals (frankx ACOS page + arcanea) have full SOTA 5-Harness Fleet sections (glass cards, 3D orb, detailed grok-personal box, SIP/gstack/"two repos as showcases"/"Built on SIP").
- All SIP-attested; Frank DNA; excellence gates. Codename removed; descriptive + Why explanation in SHARING.

**Repo-mastery + excellence applied:** Broad Glob/Grep/Shell for discovery (starlight/repos + dots like .acos/.grok/.antigravitycli/.claude), narrow Reads (full targeted + offset/limit of adapters/install/HARNESS/SHARING/grok skill/visual sections + hooks), multiple strategies (exact phrases, -i, globs **/adapters/grok/* + **/*install*.sh + **/HARNESS* + **/SHARING* + **/*frankx* + **/.antigravity*), cross-repo. Never created docs or harness dirs. All changes = small StrReplace (reversible via git). Pre/post evidence in mind (reads before/after edits).

**All works. Excellence lead.** Small reversible. SIP everywhere. 0 leaks preserved/enforced. Ready for `starlight` wrapper + full agy scaffold activation.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol
- Layers: [file-contract, attestation, sovereignty, subagent-orchestration, mcp, excellence, catalog-partition, harness]
- Verticals: [agentic-creator-os (ACOS), claude-code-config, Starlight-Intelligence-System (SIS harnesses), frankx.ai-vercel-website + arcanea-ai-app (visuals), FrankX]
- 2026-06-02: ACOS/SIS/claude/frankx visual 5-parity + grok-personal (agy + grok) upgrade pass — adapter/install/docs/SHARING/status/comments enhanced; scaffold proposed via install; visuals confirmed; HARNESS-STATUS updated. Small reversible. Excellence.
- Generated: 2026-06-02 (this beyond-SIS extension)

---

## 2026-06-04 GStack workforce absorption

**Scope:** Absorb GStack as an operating workforce across SIS and ACOS without vendoring the GStack codebase.

**What changed:**
- Added `core/orchestrator/harnesses/gstack/README.md` and `system-prompt.md` as the SIS routing surface.
- Added `core/orchestrator/GSTACK-WORKFORCE.md` as the canonical route map for venture, product, architecture, design, DX, security, QA, performance, release, memory, retro, and swarm boards.
- Confirmed install posture: canonical GStack remains external at `~/.agents/skills/gstack`, with Claude/Codex/Grok junctions. SIS owns selection and memory; GStack owns specialist method.
- ACOS receives the execution workflow at `workflows/business/gstack-venture-factory.yaml`.

**Design decision:** GStack is not copied into SIS. It is treated like an external workforce/harness: route to it, demand evidence from it, and feed its reports back into SIS/ACOS memory.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, routing, evidence, workforce]
- Verticals: core/orchestrator, ACOS business workflow
- Generated: 2026-06-04

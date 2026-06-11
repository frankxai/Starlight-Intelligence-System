# Antigravity harness — Starlight Orchestrator

**Role:** Swarm execution harness. Native 96-mind parallel orchestration, browser control, async long-running agent swarms, Agent Manager visibility, progress artifacts.

**Default for:** Complexity 4-10 intents that benefit from dynamic multi-perspective execution (council + domain specialists + prime synthesis), web-heavy vertical work (sound sync, audience, live testing), async background flows that outlive a single CLI turn, when Antigravity's native `define_subagent` / `invoke_subagent` + browser + async are the velocity advantage over Claude `Task` dispatch.

**System prompt:** composes on top of the substrate's `.antigravity/instructions.md` + `.antigravity/swarm-96-minds-protocol.md`. Loaded after those whenever Antigravity is invoked as the Starlight Orchestrator swarm harness.

**MCP scope:** `.antigravity/mcp-config.json` (swarm-aware starlight-substrate + task-scoped under conductor rules). Children are read + progress; conductor carries scoped write surfaces. See also `core/orchestrator/harnesses/antigravity/` allowlist when present.

**Allowlisted tools:** Native Antigravity primitives (define_subagent, invoke_subagent, Agent Manager, browser_control, progress artifacts) + substrate Read/Glob/Grep + conditional Write/Edit/Bash for conductor + WebFetch + relevant Skills + read-oriented MCP verbs. Full policy at `.antigravity/allowlisted-tools.md` (platform) and `allowlisted-tools.md` (harness overlay if added).

**Escalation rules:**
- Any substrate-tier proposal or >200 LOC cumulative from the swarm → `/starlight-board` (or `/luminor-board`) *before* commit, not after. Conductor is responsible for gating.
- Security / sovereignty defect surfaced by sentinel subagent → Codex harness + `/openclaw-audit`.
- Cross-brand or alliance fork → board before decision.
- Vault-vs-derived divergence → sage + memory-orchestrator; vault wins.
- Swarm child off-rails → conductor TaskStop-equivalent + review; partial results logged, never silently accepted.
- Latency <30s or trivial → route to OpenCode harness instead of spawning swarm.
- Long-context structural read needed before swarm → hand to Gemini harness first; Gemini summary becomes input to swarm decomposition.
- TUI + image/video + Kenya .grok excellence (the 4 .grok natives + 2 hooks) → Grok harness (core/kenya filter via multi-orchestrator per SHARING.md + SIP; injected rules + gstack/santa).

**Status:** scaffolded in this enhancement pass (2026-06-02). README + system-prompt delivered. mcp-config + allowlisted live at `.antigravity/` level (shared with platform adapter). Full shell wrapper integration pending Phase 1.2 follow-on (see HARNESS-STATUS.md and MASSIVE_ACTION_PLAN.md §4, §10).

**Integration note:** When Antigravity is the active harness, the orchestrator still defers all final substrate-mutating writes to Claude Code primary (via intel drop or direct handoff under scope) unless the swarm was explicitly granted a scoped exception by board + user.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, 96-minds-dynamic-registry, swarm-protocol, multi-harness-orchestration]
- Verticals: core/orchestrator (layer 10), .antigravity
- Generated: 2026-06-02

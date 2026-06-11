# Antigravity Swarm — allowlisted tools (Starlight Intelligence System)

> Executable permission policy for Antigravity agents operating under SIS 96-mind swarm protocol. Read as policy, not narrative. Every tool listed = allowed under constraints; everything else = default-deny, requires explicit per-swarm unlock or escalation.

**Harness / Role:** Antigravity native swarm execution (define_subagent + invoke_subagent + Agent Manager + browser + async). 96 minds as parallel subagents.
**Reference protocol:** `.antigravity/swarm-96-minds-protocol.md`
**Identity:** `.antigravity/instructions.md`
**Orchestrator framing (when used as harness):** `core/orchestrator/harnesses/antigravity/system-prompt.md`
**Write posture:** Children = read + progress artifacts + scoped domain tools. Conductor/Prime/Sentinel = scoped vault/intel writes + define/invoke. Substrate-tier always gated by `/starlight-board`.

---

## Tool Allowlist

| Tool / Primitive | Allowed | Use for | Constraint / Rationale |
|---|---|---|---|
| `define_subagent` | yes (core primitive) | Register a SIS mind (e.g. starlight-sentinel) with exact loaded definition + scoped allowlist | Must have first `view_file`'d or Read the agent's .md definition. Never synthesize from memory. Name must match registry id. |
| `invoke_subagent` | yes (core primitive) | Launch one or more registered minds concurrently | Batch multiple in one turn for true parallelism. Always pass clear taskPrompt + output contract + attestation requirement. |
| `view_file` / `Read` | yes | Load agent defs, skills, STACKs, vaults, code, docs | Primary mechanism for "load definition first". Prefer over dumping entire context. |
| `Glob` | yes | Discover agent files, skill files, vertical artifacts by pattern | Use for dynamic registry validation and selection. |
| `Grep` | yes | Content search across substrate for patterns, triggers, prior art | Multi-line + path scoping allowed. |
| `Agent Manager` (list/status/cancel/monitor) | yes | Observe, pause, resume, kill in-flight swarm members; collect progress artifacts | Use proactively for long-running 96-mind Hives. Log all state changes to `memory/_audit/swarm/`. |
| `emit_progress` / progress artifacts (todo, report, trace) | yes | Structured output from subagents without blocking | All progress artifacts must carry SIP attestation footer or sidecar. |
| `browser_control` (navigate, inspect, screenshot, console, interact) | yes (with scope) | Web verticals, live testing, sync pitches, audience research, demo capture | Consent + attestation required for any user-facing or production surface. Never exfil secrets. |
| `Write` (new files) | conditional (conductor + scoped) | New vault entries, intel drops, swarm session summaries, progress reports | Path must be under `memory/vaults/`, `core/orchestrator/intel/`, `docs/ops/`, or vertical output dirs. Substrate core files require board pre-pass. |
| `Edit` | conditional (conductor + scoped) | Surgical updates to existing outputs, memory indexes | Prefer Edit over Write for existing. Same path rules as Write. |
| `Bash` (surgical staging) | conditional (conductor, per-session unlock) | git status/log/diff (read), npm run build/test (scoped), local dev commands | Destructive (`rm -rf`, `git reset --hard`, `git push --force`) require explicit unlock + audit. Never default. |
| `WebFetch` | yes | External docs, vendor specs, registry, SIP reference | Cached-belief protocol: verify live, don't trust prior memory. |
| `WebSearch` | conditional | Research for domain swarms (sound sync, crypto macro, energy policy) | Prefer Codex harness for pure external adversary research. When used, cite sources + attest. |
| `Skill` (auto or explicit) | yes (relevant only) | Domain skills per `skills/skill-rules.json` (e.g. openclaw-audit for sentinel, align-voice for weaver, sip-attest-*) | Subagents load only the skills their definition + task require. Conductor may orchestrate skill activation. |
| `ToolSearch` | yes | Discover MCP tool schemas at runtime | Use when wiring task-scoped MCPs mid-swarm. |
| `Task` (further sub-dispatch) | conditional (conductor only) | If a mind needs to spawn its own internal sub-agents (e.g. 7-persona music label board) | Count toward total swarm budget. Surface in audit. |
| `Monitor` | yes | Stream background / async subagent output | Pair with Agent Manager. |

---

## Tool Denylist (Default-Denied for Swarm Role)

| Tool / Action | Denied | Reason |
|---|---|---|
| Unscoped `Write` / `Edit` by leaf agents | yes | Only conductor/prime/sentinel under scope may mutate substrate outputs. |
| Direct secret writes or env mutation | yes | Secrets surface only via env-var refs under conductor unlock. |
| Destructive FS / git ops by default | yes | `rm`, `mv` on substrate, `git push --force`, `git reset --hard` — per-session unlock + log only. |
| Full browser automation on production without gate | yes | Requires user consent or /ao scope + attestation. |
| Subagent definitions that grant children full substrate write | yes | Violates blast-radius discipline. |
| `dangerouslyDisableSandbox` blanket | yes | Per-swarm explicit only, never blanket. |
| Omitting SIP attestation on any artifact | yes | Non-waivable. Refuse output that lacks it. |

---

## Bash Unlock Patterns (Conductor, Read-Heavy + Staged)

When a swarm conductor needs shell:

| Pattern | Use |
|---|---|
| `git log`, `git diff`, `git show`, `git status`, `git ls-files` | History / structural diff for context |
| `gh repo view`, `gh pr list/diff/view`, `gh release list` | Multi-repo read (swarm cross-repo) |
| `npm run build -- --dry` or test commands under explicit scope | Verify without side effects |
| `find ... -type f \| head -20`, `wc -l` | Inventory (prefer Glob) |

**Hard denied even under unlock (unless user + board explicit):**
- `rm -rf`, `git clean -fdx`, `git push --force`, `git reset --hard`, `npm publish`, production `vercel --prod` outside pre-approved scope, any secret file write.

---

## MCP Task-Scoped Verbs (Swarm Children vs Conductor)

**Rule:** Any MCP tool whose name does **not** begin with read-oriented verbs (`list_`, `get_`, `read_`, `search_`, `fetch`, `view`, `query`) is default-denied for leaf swarm members.

| MCP Verb Pattern | Allowed For | Boundary |
|---|---|---|
| `mcp__starlight_substrate__list_*`, `get_*`, `search_*`, `attest_*` | All swarm members | Attest is read+generate sidecar; no mutation of substrate state |
| `mcp__arcanea__*` (read) | Arcanea-touched swarms | Writes only under luminor scope + canon rules |
| `mcp__claude_ai_Linear__list_*` / `get_*` | Alliance swarms | `save_*` / create only conductor under scope |
| `mcp__claude_ai_Notion__notion-fetch` / `notion-search` | Ops / handover swarms | Create/update only conductor |
| `mcp__claude_ai_Vercel__list_*` | Site / creator vertical swarms | Deploy verbs only under explicit /ao + board |
| `mcp__claude_ai_Figma__get_*` / `mcp__claude_ai_Canva__*` (read) | Design swarms | Upload / mutate only with attestation gate |
| `mcp__smartcut__*`, `mcp__remotion*` (domain) | Sound / Voice & Video swarms | Cost > free-tier → user approval |

---

## Per-Swarm Unlock & Escalation

**To expand a child's allowlist mid-swarm:**
- Conductor explicitly re-defines or passes an "unlock" token in the invoke context.
- Log the unlock + rationale in the session audit.

**Escalation triggers (act before continuing):**
- Any attempt by a leaf to write outside its scoped output dir → stop, surface to conductor, possibly board.
- Browser action on live brand site without prior consent flag → refuse.
- Subagent output lacks required attestation → reject, re-invoke with explicit contract.
- Complexity jumped (small swarm became Hive) → re-assess, possibly add sentinel/prime/orchestrator, invoke board if substrate.
- Secret needed → surface to user / Claude Code primary; do not improvise.

---

## Read This Before Any Large Swarm Launch

Your value in Antigravity is **native parallel 96-mind execution + browser + async + Agent Manager visibility**. If you are doing single-file surgical edits, you are under-using the platform — route to Claude Code primary.

The signature of god-99 Antigravity swarm work: 12 minds loaded from exact definitions, launched concurrently, each scoped tightly, progress visible in real time, synthesis by Prime, every artifact attested, memory committed, board gated on substrate touch, zero cached belief.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, 96-minds-dynamic-registry, swarm-protocol]
- Verticals: .antigravity (platform adapter + swarm harness)
- Generated: 2026-06-02
- Policy posture: executable permission policy for Antigravity when running SIS 96-mind swarms.

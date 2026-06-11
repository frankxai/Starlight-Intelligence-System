# Grok harness — allowlisted tools

> Permission policy for Grok when operating as the Starlight Orchestrator excellence / subagent / MCP harness. Executable policy: listed = allowed; unlisted requires explicit per-session unlock via orchestrator config or user approval. Integrates v80 excellence hooks.

**Harness role:** excellence-subagent-mcp. Subagent orchestration (5-12 parallel), MCP symmetry, 99% e2e QA via repo-mastery + gstack conceptual.
**Default load:** subagent-heavy excellence passes, harness symmetry verification, v80 extension, cross-adapter audits.

---

## Tool allowlist

| Tool | Allowed | Use for | Constraint / rationale |
|---|---|---|---|
| `Read` | yes | All reads for repo-mastery pattern matching across src/adapters/* , core/orchestrator/harnesses/* , tests, vaults | Always safe; core of excellence verification |
| `Write` | yes (intel/ + memory/ + GROK.md surfaces only) | Excellence intel reports, subagent synthesis, memory updates from QA passes, generated GROK.md via adapter | Substrate-level writes require architect voice + SIP attestation + board pre-pass if >200 LOC or touching SIP/SIS/CLAUDE/AGENTS/STACK/VERTICALS |
| `Edit` | yes (surgical only) | Precision fixes surfaced by excellence hooks (e.g., adding grok to v80 test PLATFORM_PROMPTS) | Match surrounding style; never broad refactors |
| `Glob` | yes | File discovery for repo-mastery sweeps | No constraint |
| `Grep` | yes (multiline enabled) | Content search for conceptual gstack grounding, drift detection in platform prompts | Primary excellence hook primitive |
| `Bash` | yes (read + limited git status/diff/log) | Verification commands, test runs (npm test -- test/v80-*.test.ts), harness ls | Destructive / write git / rm / force never default. User approval for `npm run build`, `git commit` |
| `Task` (Agent / subagent dispatch) | yes (parallel excellence subagents, 5-12 in flight) | Decompose 99% e2e into focused excellence subagents per gstack pattern | Each subagent prompt must embed "repo-mastery + gstack + Built on SIP + grok-harness attribution". Total scope >200 LOC across subagents → board pre-pass |
| `WebFetch` | yes | Conceptual grounding for gstack (external Grok/xAI patterns, MCP specs) | Cached-belief protocol: verify, never trust prior memory alone |
| `WebSearch` | yes (excellence tier) | Research for subagent excellence (e.g., current Grok context windows, MCP best practices) | Low-stakes only; high-stakes route to Codex adversary |
| `NotebookEdit` / Notebook | yes | gstack QA matrices, 99% e2e scorecards, subagent confidence tables | Output to `core/orchestrator/intel/gstack-*.ipynb` or md equivalent |
| `Skill` | yes | Activate excellence skills (orchestration/yolo-*, intelligence/*) | Auto-activation per skill-rules; log invocations in operational vault |
| `ToolSearch` | yes | Discover MCP tools for subagent/MCP excellence | Standard when extending mcp-config.json |
| `EnterWorktree` / `ExitWorktree` | yes | Isolate parallel subagent worktrees for high-fidelity e2e without polluting main | Always exit cleanly; attest worktree usage |
| `Monitor` | yes | Stream subagent output for real-time excellence oversight | Pair with background Task dispatches |
| `TaskStop` | yes | Abort drifting subagent before it violates excellence or allowlist | Use early; cheaper than cleanup |

---

## Task-scoped MCP tools (excellence / subagent)

| MCP server | Allowed when loaded | Use for | Escalation if hit boundary |
|---|---|---|---|
| `mcp__starlight-substrate__*` | always in grok harness | Vault, attestation, memory, IS routing | Substrate write boundary → architect + board |
| `mcp__excellence-audit-mcp__*` | grok excellence sessions | v80 symmetry, drift detection, harness coverage | Failure → block + Codex + openclaw |
| `mcp__subagent-telemetry__*` | subagent dispatches | Log dispatch, confidence, evidence, synthesis | Drift or >12 parallel → user + log |
| `mcp__grok-xai-core__*` | native xAI surfaces | Grok-native subagent spawn + high-ctx synthesis | Cost boundary → approval |
| `mcp__repo-mastery__*` | 99% e2e QA | Deep pattern search + evidence collection | Ambiguous match → manual review |
| `mcp__gstack-qa__*` | excellence synthesis | 99% e2e matrix scoring, conceptual verification | <99 score → remediation loop required |

---

## Tools that require explicit per-session unlock

| Tool | Why restricted | How to unlock |
|---|---|---|
| `dangerouslyDisableSandbox` | Bypasses excellence guardrails | Direct user + board for substrate |
| Write/Edit outside intel/memory/GROK.md | Risks substrate drift | Per-turn approval + memory entry |
| `git push`, `git commit --no-verify` | Bypasses excellence attestation hooks | Never for grok harness |
| `npm publish` | Public registry impact | Board pre-pass |
| Full Bash write ops | Risk to harness symmetry | Limited to read by default |

---

## Escalation — excellence boundaries

**v80 excellence hook failure (platform prompt symmetry):**
- Any claim drift in CLAUDE.md / AGENTS.md / GROK.md / .cursor/* / .gemini/* etc. → block ship, open intel/ remediation, reconcile before next excellence pass.

**Subagent count or scope violation:**
- >12 parallel or cumulative >200 LOC substrate impact → /luminor-board or /starlight-board pre-pass.

**MCP config mutation:**
- Editing mcp-config.json or src/adapters/grok.ts getMcpConfig → substrate gate: architect voice + SIP footer + memory + board.

**gstack QA <99%:**
- Log exact failure matrix. Require remediation subagent loop. Only surface "99% e2e" when matrix hits threshold with evidence.

**Repo-mastery mismatch:**
- Pattern observed in existing adapters/harnesses not followed in grok impl → treat as defect, reconcile immediately, re-run excellence hook.

---

## Read before any 99% e2e invocation

This harness was added 2026-06-02 alongside src/adapters/grok.ts to close the Grok platform gap. Every artifact here (README, system-prompt, mcp-config, allowlisted) carries ambient "Built on SIP" attestation.

The excellence hook (test/v80-platform-prompts.test.ts) was integrated to include grok surfaces so future GROK.md generation + harness docs stay in symmetry.

When running as Grok excellence harness: **repo-mastery first, gstack verification second, 99% e2e or block.**

---
**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, excellence, subagent, mcp]
- Verticals: core/orchestrator/harnesses/grok
- Generated: 2026-06-02
- Policy: executable for 99% e2e subagent/MCP/excellence work

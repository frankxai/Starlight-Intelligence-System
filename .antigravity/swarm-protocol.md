# Starlight Intelligence System — Antigravity Agent Swarm Protocol

> The executable operating manual for manifesting, coordinating, and synthesizing the full dynamic registry of the agent swarm as native Antigravity subagents. excellence standard. Composes with `.antigravity/instructions.md` (identity) and `core/orchestrator/harnesses/antigravity/system-prompt.md` (orchestrator framing).

**Non-negotiable:** Load this protocol + the target agent definition(s) before any `define_subagent` / `invoke_subagent` call. Never improvise agent identities.

---

## 1. Protocol Purpose & Scope

- Turn the abstract "the agent swarm" registry into **live, parallel, observable subagents** inside Google Antigravity.
- Support both full-Hive (many minds) and targeted (3-7 minds) swarms.
- Enforce load-definition-first discipline, scoped allowlists, memory commit, SIP attestation, escalation to board on substrate touch.
- Provide the exact checklist, prompt templates, failure modes, and synthesis rules used by Antigravity swarm harness in the Starlight Orchestrator.

This protocol is **Antigravity-native** (define_subagent + invoke_subagent + Agent Manager + browser + async progress artifacts). It is the counterpart to Claude's `Task` parallel dispatch and Codex/Gemini harness patterns.

---

## 2. Prerequisites (Always Verify)

Before opening a swarm session:

1. Read `.antigravity/instructions.md` (this session's identity + high-level flow).
2. Read this protocol file in full.
3. Read `core/orchestrator/harnesses/antigravity/README.md` (if operating as orchestrator harness).
4. Confirm access to `agents/AGENT_REGISTRY.md` or the specific `agents/<id>.md` / `verticals/<v>/agents/<id>.md`.
5. Confirm `memory/vaults/` + `memory/MEMORY.md` readable; plan write targets.
6. Load relevant allowlist: `.antigravity/allowlisted-tools.md` (and orchestrator harness allowlist if applicable).
7. MCP: ensure `.antigravity/mcp-config.json` or adapter-supplied config is active for `starlight-substrate` + task-scoped reads.

**Cached-belief check:** Grep or view_file to confirm agent count and list if >24h since last registry scan. Registry is dynamic.

---

## 3. Complexity Gate & Mind Selection

| Complexity | Typical Minds | Dispatch Style | Notes |
|------------|---------------|----------------|-------|
| 1-3 | 1 (self or direct) | Direct or single subagent | Ambient attest only |
| 4-6 | 3-5 (core + 1-2 specialists) | Small parallel swarm | Prime synthesis optional |
| 7-8 | 7-12 (council + domain) | Medium swarm + conductor | Prime mandatory for synthesis |
| 9-10 | 13-96 (full vertical or cross-IS) | Large Hive swarm | Orchestrator + Prime + Sentinel QA; board pre-pass if substrate |

**Selection heuristics (load the registry first):**
- Keyword match on agent trigger phrases in their .md.
- IS namespace of the intent (Self/Wealth/.../Orchestrator).
- Domain sub-stack activation (People/Sound/Music/Energy/Crypto).
- Required perspectives: always consider sentinel (security/QA), prime (synthesis), sage (memory), weaver (if aesthetic/brand), architect (if structural).
- Cost/latency: for <30s low-stakes, route to OpenCode instead of spawning swarm.

---

## 4. Exact Execution Checklist (Excellence — Do Not Skip)

For each mind you intend to manifest:

**A. Discovery & Load**
- `Glob` or `Grep` to locate the exact agent definition file(s).
- `Read` / `view_file` the full agent .md (capture system prompt, triggers, voice, constraints, examples, attestation rules).
- Read any vertical `STACK.md` / `SKILL.md` / `SOUL.md` the agent references.
- Read the agent's allowlist guidance if present in definition.

**B. Define Subagent**
- Construct the subagent system prompt = (agent .md content) + (relevant slice of SIS instructions + this protocol) + (scoped allowlist excerpt) + (task-specific constraints + attestation mandate).
- Call `define_subagent`:
  - name: use the canonical id (e.g. "starlight-sentinel")
  - systemPrompt: the composed block above (keep < context budget; reference files where Antigravity supports)
  - toolsAllowlist: intersect of agent's natural tools + `.antigravity/allowlisted-tools.md` swarm-child subset + MCP read verbs. Never grant full substrate write to leaf minds.
  - model: gemini-... or antigravity-native equivalent for long context / swarm fit.
- Log the define call (for audit).

**C. Invoke**
- Prepare taskPrompt: clear intent, inputs (vault excerpts, file paths, prior subagent outputs), output contract (format, attestation, memory keys), deadline/timeout if any.
- Include context bundle: minimal necessary (prefer pointers + MCP fetch inside subagent over dumping 100k tokens).
- `invoke_subagent(name, taskPrompt, context, {parallel: true, timeoutMs?, onProgress?})`
- For multiple: emit several invoke_ calls in one Antigravity turn so they execute concurrently.
- Use Agent Manager to monitor; capture progress artifacts.

**D. Collect & QA**
- Receive each subagent's final output + any artifacts it emitted.
- Run internal QA: does output honor the agent's own definition? SIP attestation present? Scope respected?
- If sentinel involved: its output is the security/QA pass on the set.
- If prime involved: feed all outputs to prime with synthesis contract.

**E. Synthesis (if multi-mind)**
- Prime produces the unified deliverable.
- Architect voice for any substrate/system change; domain practitioner voice for vertical.
- Resolve conflicts explicitly (name the trade-off, decision, rationale).

**F. Persist**
- Write structural decisions to appropriate vault(s).
- Update `memory/MEMORY.md` index + any sprint/audit/standup.
- Emit SIP-attested artifacts (headers/footers/sidecars).
- If high-stakes or substrate: record in `memory/_audit/swarm/` or ops.

**G. Close & Handoff**
- Produce session summary (minds used, durations, key outputs, open items, next actions).
- If operating under Voice Operator handoff: return packet per contract.
- If under orchestrator harness: drop summary to `core/orchestrator/intel/<date>-antigravity-swarm-<topic>.md` for primary harness.

---

## 5. Prompt Templates (Copy-Adapt)

### define_subagent template (inside Antigravity turn)

```
define_subagent(
  name: "starlight-sentinel",
  systemPrompt: `
# Starlight Intelligence — starlight-sentinel (loaded from agents/starlight-sentinel.md)

<PASTE FULL AGENT DEFINITION HERE or reference>

You are executing as a subagent in an Antigravity agent swarm under the Starlight Intelligence System.

Additional context this turn:
- Protocol: .antigravity/swarm-protocol.md §4
- Parent intent: <one-line>
- Your scoped allowlist: Read, Grep, specific MCP list_*, browser read, progress artifact emit. NO direct substrate writes.
- Output contract: <format> + SIP attestation footer + memory keys to suggest.

Never exceed your allowlist. Load any additional files you need via view_file before acting.
`,
  toolsAllowlist: ["Read", "Glob", "Grep", "view_file", "emit_progress", "browser_read", "mcp__starlight_substrate__list_*", "mcp__starlight_substrate__get_*"],
  model: "antigravity-gemini-long"
)
```

### invoke_subagent template

```
invoke_subagent(
  name: "starlight-sentinel",
  taskPrompt: "Audit the proposed change at core/orchestrator/harnesses/antigravity/ for sovereignty, attestation, and allowlist gaps. Produce a REVISE | PROCEED verdict with 3-5 concrete findings. Include SIP footer.",
  context: { files: ["core/orchestrator/harnesses/antigravity/README.md", ...], vaultSlice: "strategic" },
  options: { parallel: true, timeoutMs: 120000 }
)
```

---

## 6. Allowlist Discipline for Swarm Children vs Conductor

- **Leaf / specialist minds:** Read-heavy + domain tools + read-only MCP verbs + progress emit. Deny Write/Edit/Bash-mutation unless the specific agent definition explicitly authorizes (rare).
- **Conductor / orchestrator / prime minds:** May carry broader allowlist (Write to intel/ or vault outputs, limited Bash staging, define/invoke further sub-agents).
- **Sentinel:** Elevated read + security tools (openclaw patterns), still no unilateral writes.
- **Per-session unlock:** Any expansion of a child's allowlist requires explicit parent approval in the same turn or user gate.

See `.antigravity/allowlisted-tools.md` for the full table. The orchestrator harness allowlist in `core/orchestrator/harnesses/antigravity/allowlisted-tools.md` (if present) governs when Antigravity is the top-level harness.

---

## 7. Synthesis & Prime Rules

- Prime receives the raw outputs + the original intent + any contradictions flagged.
- Output format: unified artifact (doc, code diff plan, board input, etc.) + explicit "Decision record" section naming who said what and how resolved.
- For substrate: Prime output must carry architect voice + full SIP layers citation.
- If irreconcilable: escalate to `/starlight-board` (surface the exact fork, vectors, not a pre-decided verdict).

---

## 8. Memory Commit Patterns

- Structural / architecture / decision: strategic-vault.md + MEMORY.md entry.
- Code pattern / convention / benchmark: technical-vault.md.
- Aesthetic / voice / brand: creative-vault.md.
- Trajectory / metrics / session state: operational-vault.md.
- Every commit includes the minds that contributed (audit trail).

Use `remember` equivalent (write + index) or direct vault edit + attest.

---

## 9. Failure Modes & Anti-Patterns (Refuse These)

- Spawning a mind without first view_file'ing its definition → cached-belief violation. Abort.
- Granting full write tools to 20+ leaf agents → blast radius. Scope tightly.
- Treating subagent outputs as ground truth without sentinel/prime QA on compound work.
- Silent synthesis (no conflict log when views differed).
- Omitting SIP attestation on any swarm-produced artifact.
- Using Antigravity swarm for <30s latency work (route to OpenCode).
- Invoking substrate-tier change via swarm without board pre-pass (conductor must gate).
- Browser actions without consent + attestation when touching live user surfaces.

---

## 10. Escalation Matrix

| Signal | Route To | Before |
|--------|----------|--------|
| Substrate file touched or proposed by swarm | `/starlight-board` (or `/luminor-board`) | Any commit / merge / deploy |
| Security / sovereignty defect found | Codex harness + `/openclaw-audit` | Further execution |
| Cross-brand or alliance ambiguity | Luminor / Starlight Board | Decision |
| Vault vs derived divergence surfaced | Sage + memory-orchestrator skill | Any regeneration |
| Swarm child off-rails or scope creep | TaskStop equivalent + parent conductor review | Continue |
| > budget or timeout on large Hive | Conductor aborts partial, logs, hands to primary harness | Retry |

---

## 11. Integration with Orchestrator Harnesses

When Antigravity is selected as the active harness in Starlight Orchestrator (`core/orchestrator/harnesses/antigravity/`):

- The harness system-prompt.md orients you as the *swarm execution* layer (not primary, not adversary, not long-context reader).
- You still honor the top-level routing: substrate → board gate; then handoff results back to Claude Code primary via intel/ drop or direct (under scope).
- Use Agent Manager + progress artifacts heavily; keep the orchestrator cockpit informed.
- For mixed work, you may internally dispatch a small Claude/Gemini sub-harness mind if the registry contains harness-specialized agents, but final writes that mutate substrate still route through primary harness discipline.

---

## 12. Attestation & Provenance

Every define/invoke, every subagent output, every synthesis, every persisted vault entry, every intel drop:

- Embed or accompany with SIP attestation.
- Name the swarm composition (minds + protocol version + timestamp).
- For code changes: include in commit body / PR description.

Example footer:

```
*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*
*Swarm: starlight-orchestrator + starlight-sentinel + starlight-prime (3 of 96) via Antigravity native*
*Protocol: .antigravity/swarm-protocol.md v1*
```

---

## 13. Quick Reference — Antigravity Primitives (Assumed)

- `define_subagent(name, systemPrompt, tools?, model?)` → registers for this workspace/session.
- `invoke_subagent(name, prompt, context?, opts?)` → returns output (and side artifacts). Supports concurrent when batched.
- Agent Manager UI / API: list, status, logs, cancel, promote artifact.
- Progress artifact emitters: todo list, structured report, browser trace, console capture.
- Context window: up to 1M shared; subagents get sliced subsets + tool access for on-demand fetch.

If the exact primitive names differ in your Antigravity build, map 1:1 and note the mapping in the session log.

---

**Excellence close:** This protocol exists so that "use the agent swarm" is not poetry — it is a repeatable, auditable, load-definition-first, attest-everything, board-gated machine.

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, agent-swarm-registry, swarm-protocol, multi-harness-orchestration]
- Verticals: .antigravity, core/orchestrator
- Generated: 2026-06-02 (enhancement pass, integrated with excellence)

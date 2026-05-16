# Starlight Keyboard CLI Router — First-Principles Design

**Date:** 2026-05-16
**Tier:** substrate (introduces a new top-level CLI surface; touches `$PROFILE`, MCP cross-repo contracts, and reconciles MAP §4)
**Author:** Claude Opus 4.7 (1M ctx) — autonomous per `feedback_lead_with_authority`
**Sibling spec:** `2026-05-14-starlight-voice-v3-design.md` (voice surface) + `2026-05-14-starlight-voice-v3-addendum.md` (cross-tab refinements)
**Governance:** `/starlight-board` pre-pass run as part of the bundle with the addendum. Verdict: PROCEED with REVISE (week-4 memory checkpoint). See addendum §Board verdict.
**Status:** DRAFT — implementation Phase 1 sequenced for week 1-2 after starlight-voice Task 5 (read addendum first)
**Built on SIP** — sovereign architecture, MCP-only contracts.

---

## 1. Executive summary

The keyboard surface of Frank's daily AI flow is currently 13 PowerShell functions across an `Invoke-AI` switch (`$PROFILE` lines 22-119) that dispatch directly to `claude`, `gemini --yolo`, `codex`, `opencode`, or `cursor agent` CLIs. `stsis` / `sta` / `stfx` / etc. all route to Gemini-with-a-Starlight-persona-prefix — a name tag, not a router. MAP §4 specified `@starlight/orchestrator` as the canonical Starlight CLI router; this spec **supersedes MAP §4** by routing through the same MCP fabric the voice operator (`starlight-voice`) consumes.

**The `starlight` keyboard CLI** is a small (Rust or PowerShell-module) binary/module that:

1. Reads a typed command from the user (e.g., `starlight "refactor the v85 test to use the new walker pattern"`).
2. Classifies the intent via a Tier-0 deterministic match → Tier-1 hot LLM (Cerebras Llama-4) classifier.
3. Routes to the right CLI agent via MCP-wrapped dispatchers (`claude-code-cli-mcp`, `codex-cli-mcp`, `gemini-cli-mcp`, `opencode-cli-mcp`) **or** executes inline tools via the same MCP fabric (file ops, web search, browser-use, memory recall).
4. Streams output back to the user's terminal.

**Scope envelope:** B-velocity (~1 week MVR), C-outcome (parity with starlight-voice's MCP fabric). No new dependencies the voice spec doesn't already bring.

---

## 2. Background — current pain (audit findings)

Audit verified 2026-05-15 against live `$PROFILE` and `scripts/starlight-tools.ps1`:

1. **`stsis` is Gemini with a persona prefix** — `$PROFILE:60-64`:
   ```powershell
   "Starlight" {
       $persona = "You are Starlight Central Command (running via Gemini CLI). ..."
       gemini --yolo $fullPrompt
   }
   ```
   Not a router. Routes 100% of `st*` commands to Gemini regardless of task class.

2. **MAP §4 contradicts current `$PROFILE` routing.** MAP says Claude Code = Primary for substrate / >200 LOC. Current `stsis` routes everything (including substrate work) to Gemini --yolo.

3. **`@starlight/orchestrator` is vapor.** MAP §4 references it; Glob across all of `C:/Users/frank/` returns no matching `package.json`. The router specified 6 months ago was never built.

4. **13 PowerShell functions = N cognitive overhead.** Frank has to remember which of `cl*` / `g*` / `cd*` / `oa*` / `cur*` / `st*` to type, multiplied by 8 repos = 48+ possible function names. Modern winners (Cursor, Aider, OpenInterpreter) use one entry point.

5. **No memory integration.** Each CLI invocation starts cold — no automatic context fetch from Memory Bus / cross-repo-indexer / Letta blocks. Voice operator v3 will have this; keyboard surface won't unless this spec lands.

---

## 3. Goals & non-goals

**Goals:**
- **One entry point**: `starlight <prompt>` (or `s <prompt>` alias). Replaces `cl*`/`g*`/`cd*`/`oa*`/`cur*`/`st*` family.
- **Smart routing**: substrate work → Claude Code, 1M-context → Gemini, security/adversary → Codex, scratchpad → OpenCode, action requests → MCP tools directly.
- **Memory integration**: every invocation fetches context via `memory-bus` MCP before dispatch.
- **Shares MCP fabric with starlight-voice** — same servers, same tool selection logic, same router cognition tiers.
- **Cross-shell**: works in PowerShell, bash, zsh. Single Rust binary or PowerShell module + bash wrapper.
- **Backward-compatible aliases**: old `clsis` / `stsis` keep working during migration window; emit deprecation note pointing at `starlight`.
- **Sub-500ms routing decision** (mic-to-decision equivalent). End-to-end latency dominated by the dispatched CLI, not the router.

**Non-goals:**
- **Voice activation** — that's starlight-voice's job. This is keyboard surface only.
- **Replacing the underlying CLIs** — Claude / Codex / Gemini / OpenCode stay as the executor backends; the router decides which to call.
- **Replacing Cursor's GUI** — Cursor stays for IDE-integrated coding. `starlight` is for terminal flow.
- **Multi-user / shared session** — local single-user, like starlight-voice.

---

## 4. Constraints (decisions locked)

| # | Decision | Rationale |
|---|---|---|
| K1 | Binary name `starlight` (matches MAP §4 original naming); single-char alias `s` for brevity | Aligns with MAP, ergonomic |
| K2 | MCP fabric shared with starlight-voice — same servers, same router | Avoids divergence; both surfaces benefit from improvements to either |
| K3 | Rust binary (cross-platform) **or** PowerShell module + bash wrapper (faster MVR, Windows-first acceptable) — implementer choice at Task 1 | B-velocity decision: PS module + bash wrapper ships faster; Rust binary is more polished. Either valid. |
| K4 | Cognition router same as voice sidecar's `service/cognition/router.py` (Tier 0 deterministic / Tier 1 Cerebras / Tier 2 Groq Kimi / Tier 2.5 Claude deliberation / Tier 3 CLI subprocess) | Same code path = same behavior across surfaces. Salvage from `private/voice-operator/service/cognition/router.py`. |
| K5 | Memory context auto-fetched via `memory-bus` MCP for every invocation | Closes the "cold start every call" gap |
| K6 | Old `cl*`/`g*`/`cd*`/`st*` aliases get deprecation wrapper that calls `starlight` with hint flags during migration window (1 month) | Migration backstop; Frank can still type old names |
| K7 | Output streamed to terminal as the dispatched CLI produces it (no buffering) | Real-time feel, no perceived latency increase |

---

## 5. Architecture

```
   user types: `starlight "fix the v85 walker bug"`
                       │
                       ▼
   ┌──────────────────────────────────────┐
   │   starlight (PS module / Rust bin)   │ ← cross-shell entry point
   │                                       │   reads stdin, routes
   │   • Argument parsing                 │
   │   • Initial intent hint              │
   │   • Spawns router (stdio)            │
   └────────────────┬─────────────────────┘
                    │ stdio JSON-RPC
                    ▼
   ┌────────────────────────────────────────────────┐
   │   Cognition Router (Python, salvaged)          │ ← SAME as starlight-voice sidecar
   │                                                 │
   │   Tier 0 deterministic → Tier 1 Cerebras       │
   │   → Tier 2 Groq Kimi → Tier 2.5 Claude deliber │
   │   → Tier 3 CLI subprocess (claude/codex/gem/oc)│
   │                                                 │
   │   MCP client → 10+ MCP servers (memory-bus,    │
   │   cross-repo-indexer, claude-code-cli-mcp etc.)│
   └────────────────┬───────────────────────────────┘
                    │ MCP-over-stdio
                    ▼
   ┌────────────────────────────────────────────────┐
   │   Tool execution OR CLI dispatch               │
   │                                                 │
   │   tools: memory-bus, indexer, browser-use,     │
   │          file ops, web search                  │
   │                                                 │
   │   CLIs:  claude --print, codex, gemini, opencode│
   │                                                 │
   │   Output streams to terminal                   │
   └────────────────────────────────────────────────┘
```

**Workspace shape (Rust binary path — recommended):**
```
starlight-cli/
├── Cargo.toml                # Rust binary
├── src/
│   ├── main.rs               # arg parse, sidecar spawn, output stream
│   ├── router_ipc.rs         # stdio JSON-RPC to sidecar
│   └── shell_integration.rs  # PS module shim, bash wrapper installer
├── pwsh-module/
│   └── Starlight.psm1        # PowerShell module wrapping starlight.exe
└── README.md
```

**Workspace shape (PS module + bash wrapper path — faster MVR):**
```
starlight-cli/
├── pwsh-module/
│   ├── Starlight.psm1        # main entry
│   ├── Router.psm1           # cognition router IPC
│   └── Install.ps1
├── bash-wrapper/
│   └── starlight             # POSIX shell script wrapper
└── README.md
```

Either way, the **cognition router itself lives in the `starlight-voice` repo's Python sidecar** (or extracted to a shared `starlight-cognition` package). Both keyboard and voice surfaces dispatch to the same sidecar instance — one router process, two surfaces.

---

## 6. Migration plan (`$PROFILE` refactor)

**Current state** (`C:/Users/frank/Documents/PowerShell/Microsoft.PowerShell_profile.ps1`):
- `Invoke-AI` function with 6-tool switch (Claude/Codex/Gemini/OpenCode/Cursor/Starlight)
- 13 per-repo aliases (`cla`/`ga`/`cda`/`oaa`/`cura` × 2-3 repos, plus `cl*` family)
- `st*` family routes everything to Gemini --yolo with prefix

**Target state**:
```powershell
# ============================================
# Starlight unified CLI
# ============================================
function s        { starlight @args }                # primary entry: smart routing
function starlight { & starlight.exe @args }         # PS module wrapper

# ============================================
# Deprecation backstop (1 month migration window)
# ============================================
function stsis {
    Write-Host "DEPRECATED: 'stsis' → use 'starlight' (auto-routes by task class)" -ForegroundColor Yellow
    starlight --repo SIS @args
}
# ...similar for sta, stfx, stg, stvc, stani, stdpi, stb
# ...and cl*, g*, cd*, oa*, cur* families
```

**Migration sequence (week 1-2 after starlight-voice Task 5 lands):**

| Day | Action |
|---|---|
| 1 | Spike-test: route 3 typed commands via Python sidecar (1 substrate / 1 1M-context / 1 scratchpad). Verify Tier 1 classifier picks right CLI ≥80% accuracy. |
| 2-3 | Implement PS module + bash wrapper. Stdio IPC to sidecar. Stream output. |
| 4 | Memory integration: auto-fetch context via `memory-bus` MCP before each dispatch. |
| 5 | Deprecation backstop: rewrite all 13 `$PROFILE` functions to call `starlight` with hint flags. Old names keep working. |
| 6 | Dogfood day: Frank uses ONLY `s <prompt>` for 24h. Catch routing failures, tune classifier. |
| 7 | Phase 1 wrap: tests + benchmark + README + commit. |

---

## 7. Performance pillars

(Mirrors `starlight-voice` §8 since the router is shared.)

### 7.1 Fast classifier — Cerebras Llama-4 hot tier
- 160ms TTFT @ 520 TPS for the intent classification step.
- Subsequent CLI dispatch dominates total latency; the router itself adds <300ms overhead.

### 7.2 In-process SDKs for direct calls
- When the classifier says "this is a quick question, no CLI needed," route directly to in-process Anthropic/OpenAI/Gemini SDK call. Subprocess cold-start eliminated.

### 7.3 Pre-warmed CLI pool (post-MVR)
- `claude --print` cold-start tax (~2-5s per invocation) is the dominant performance issue for the dispatch path. Phase 2: warm pool of N=3 idle `claude` processes ready to receive prompts.
- Same pattern for `codex`, `gemini`, `opencode`.

### 7.4 Sub-500ms router decision SLA
- Per-stage budget (input → dispatch): typed input (~0ms) → classifier (Tier 1, 160ms) → MCP tool select (50ms) → dispatch decision (50ms) → CLI process spawn (variable). Total router-controlled: <300ms.
- CI benchmark gate matches starlight-voice's <800ms hot-path gate but only enforces the router-controlled portion.

---

## 8. Testing strategy

- **Contract:** every existing `$PROFILE` function (13 of them) must continue to work via deprecation wrapper for 30 days.
- **Routing accuracy test:** corpus of 50 representative typed prompts, expected CLI per prompt, classifier accuracy ≥85% (week 1), ≥95% (week 4).
- **Latency test:** P50 router decision <300ms, P95 <500ms.
- **Memory integration test:** every dispatch carries context from `memory-bus`; absence of context fetch is a test failure.
- **Cross-shell test:** PowerShell + bash + zsh smoke tests on all three.
- **Symmetry test (SIS-side):** v86-starlight-cli-routing.test.ts — verifies every `cl*`/`g*`/`cd*`/`st*` deprecation wrapper points at `starlight` with correct hint flags. Pre-commit hook gates.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Classifier mis-routes substrate work to Gemini (current bug, just inverted) | Tier 0 deterministic patterns catch substrate keywords first (SIP/STACK/vertical names). Frank can override with `s --claude <prompt>` / `s --codex <prompt>` etc. |
| Sub-process cold-start tax dominates UX | Phase 2 pre-warmed pool. Phase 1 acceptable because classifier overhead is small relative to CLI work. |
| Migration breaks Frank's muscle memory | Deprecation wrappers preserve all 13 old names for 30 days; deprecation notice teaches the new flow gradually. |
| Sidecar process becomes single point of failure | Router auto-respawns on crash (same pattern as starlight-voice Tauri shell). Cached MCP state replayed. |
| `memory-bus` context fetch adds 100-200ms to every invocation | Acceptable for value (no more cold-context calls). Make context fetch async-parallel with classifier where possible. |

---

## 10. Phase 1 deliverables (MVR — 1 week)

- [ ] `starlight-cli/` repo or in-tree (decide at Task 1)
- [ ] PS module + bash wrapper invocable as `s <prompt>` and `starlight <prompt>`
- [ ] Stdio IPC to shared Python sidecar (or new lightweight sidecar)
- [ ] Tier 0 + Tier 1 routing working (Cerebras Llama-4 classifier)
- [ ] MCP integration: `memory-bus` context fetch + `claude-code-cli-mcp` / `codex-cli-mcp` / `gemini-cli-mcp` / `opencode-cli-mcp` dispatch
- [ ] `$PROFILE` deprecation wrappers for 13 old functions
- [ ] 50-prompt routing accuracy test ≥85%
- [ ] README + INSTALL.md
- [ ] v86 symmetry test wired into `test:substrate` cascade

## 11. Out of scope (Phase 2+)

- Pre-warmed CLI pool (Phase 2, weeks 2-3)
- Tier 2.5 deliberation lane integration (Phase 2 — voice ships this, keyboard inherits)
- Browser-use direct invocation from keyboard (`s --browser "find ..."`) (Phase 2)
- Audit log of every routing decision for post-hoc analysis (Phase 3)
- Cross-user shared routing rules (out of scope — sovereign local only)

---
**Built on SIP** · Operational-tier within `starlight-cli/`, substrate-tier on the `$PROFILE` refactor + MAP §4 reconciliation. Board pre-pass run as part of bundle with `2026-05-14-starlight-voice-v3-addendum.md`. Verdict PROCEED with REVISE (week-4 memory v2 SOTA-revalidation checkpoint).

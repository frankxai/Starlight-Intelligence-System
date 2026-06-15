# 🏛️ Canonical Coding Agents Registry

This registry tracks the active AI coding agent fleet installed on this workstation. It contains specifications, cost profiles, token limits, reliability metrics, and the **Cross-Agent Activation and Routing Protocol**.

---

## 📊 1. Agent & Model Specifications

| Agent CLI/IDE | Primary LLM | Input Cost (per M) | Output Cost (per M) | Context Window (In / Out) | TTFT Class | Reliability Rating | Primary Failure Modes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude Code** | `claude-3-5-sonnet` | $3.00 | $15.00 | 200k / 8k | Medium (~1.5s) | **High** (9.2/10) | Context exhaustion on massive file reads; prompt injection from web logs. |
| **DeepAgent (dcode)** | `claude-3-5-sonnet` / `gpt-4o` | Model-specific | Model-specific | Pluggable (compaction enabled) | Dependent | **High** (9.0/10) | Loop timeouts in deep sub-agent delegation queues. |
| **Cursor** | Pluggable (Sonnet/GPT-4o) | Subscription | Subscription | 100k / 4k (Composer) | Fast (~500ms) | **High** (8.8/10) | Write collisions with active editor states; file locking on Windows. |
| **Codex CLI** | `gpt-4o` | $5.00 | $15.00 | 128k / 4k | Fast (~600ms) | **Medium-High** (8.5/10) | Code hallucinations on newly released APIs. |
| **Grok CLI** | `grok-2` | $2.00 | $10.00 | 128k / 4k | Fast (~700ms) | **Medium** (7.8/10) | Missing edge cases in deep recursive directory scans. |
| **OpenCode** | `groq/llama-4-scout` | Free / Groq API | Free / Groq API | 8k / 2k (Default) | Ultra-Fast (<200ms) | **Medium** (7.5/10) | Inability to ingest large repositories due to context size limits. |
| **Antigravity (agy)** | `gemini-1.5-pro` | $1.25 | $3.75 | 1M - 2M / 8k | Medium-Fast | **High** (8.9/10) | Output style drift (requires strict system prompt constraints). |

---

## 🧠 2. First-Principles Routing Protocol (Task Matching)

```
                            Task Complexity
  Trivial (1-3)            Medium (4-6)           High (7-8)          Substrate (9-10)
  ┌───────────┐            ┌───────────┐         ┌───────────┐         ┌───────────┐
  │ OpenCode  │            │  Cursor   │         │Claude Code│         │ DeepAgent │
  │   - or -  │    ───►    │   - or -  │   ───►  │   - or -  │   ───►  │   - or -  │
  │  Codex    │            │Cline (IDE)│         │Antigravity│         │Starlight  │
  └───────────┘            └───────────┘         └───────────┘         └───────────┘
   (Speed &                 (Interactive          (Autonomous           (Sub-Agent &
    Minimal Cost)            Refinement)           TDD Loops)            Delegation)
```

### Routing Rules Matrix:

* **Use OpenCode / Codex** when performing Complexity 1-3 tasks (e.g. documentation changes, updating package configurations, or writing small, isolated scripts). This minimizes token cost and leverages sub-second latency.
* **Use Cursor / Cline** when performing Complexity 4-6 tasks where visual UI feedback or real-time human correction is required (e.g. layout adjustments, styling modifications, or interactive API refactoring).
* **Use Claude Code / Antigravity** when performing Complexity 7-8 tasks that require deep repository traversal, test-driven iterations, or massive context digestion (e.g. fixing broken test suites, codebase refactoring, or multi-file dependency updates).
* **Use DeepAgent (dcode) / Starlight Hive** when performing Complexity 9-10 long-horizon tasks requiring multi-step planning, automated sub-agent spawning, internet research, or sandboxed execution.

---

## ⚡ 3. Inter-Agent Activation Protocol (Cross-Agent Launching)

Any coding agent running in this ecosystem can hand over control or spawn another agent using the **Starlight Command Grid**. The commands are mapped directly to their respective repositories.

### 1. Launching from the Terminal:
Use the standard command aliases configured in your profile to hand off control instantly:

| Target Repo | Claude Code | Codex | Grok | OpenCode | DeepAgent | Antigravity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Current Directory** | `cl` | `cd` | `gr` | `opencode` | `dcode` | `agy` |
| **Arcanea** | `clarc` | `cdarc` | `gkarc` | `oaa` | `daa` | `agyarc` |
| **SIS** | `clsis` | `cdsis` | `gksis` | `oasis` | `dasis` | `agysis` |
| **FrankX** | `clfx` | `cdfx` | `gkfx` | `oafx` | `dafx` | `agyfx` |
| **agentic-ops** | `clops` | `cdops` | `gkops` | `oaops` | `daops` | `agyops` |

### 2. Programmatic Handoff Logic:
When an agent determines it has reached its capacity limit (e.g. OpenCode reaching context limits, or Claude Code requiring a sandboxed environment):
1. **Save Current State:** The agent stages current changes (`git add .`) and writes a handover note (`HANDOVER.md`) detailing the current progress, blockages, and planned next steps.
2. **Execute Spawn:** The agent spawns the target agent by executing the respective terminal command (e.g. `da` or `cl`) with the message path as an argument.
3. **Example Handoff CLI Command:**
   ```powershell
   # OpenCode handing off to DeepAgent (dcode) to run tests in a sandbox
   dcode -n "Run pytest and fix failures listed in HANDOVER.md" -S all
   ```

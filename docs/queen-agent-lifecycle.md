# Starlight Queen — Local Terminal Agent Lifecycle Management

> **Provider-neutral discovery, non-exclusive prompt/output capture, safety-shielded lifecycle operations, and durable repo-aware handovers across Codex, Claude Code, OpenCode, and local CLI harnesses.**

---

## 1. System Overview

Starlight Queen provides a unified control plane for managing heterogeneous AI CLI agents running in local terminals across the developer workstation. It solves the critical operational challenge where terminal agents fail to coordinate: sessions leave locked transcripts, lack session-to-PID correlation, kill unrelated terminal processes or shared MCP servers, and leave no durable record for other agents to continue.

```
                     ┌──────────────────────────────────────────────────┐
                     │         Starlight Queen Control Plane            │
                     │       (AgentLifecycleManager / CLI)              │
                     └───────┬──────────────┬──────────────┬────────────┘
                             │              │              │
              ┌──────────────▼───┐   ┌──────▼───────┐   ┌──▼───────────────┐
              │  Discovery &     │   │ Prompt/Output│   │ Process Tree &   │
              │  Capabilities    │   │ Capture &    │   │ Safety Shield    │
              │  Registry        │   │ Secret Veil  │   │ Manager          │
              └──────────────┬───┘   └──────┬───────┘   └──┬───────────────┘
                             │              │              │
    ┌────────────────────────┼──────────────┴──────────────┼────────────────────────┐
    │                        │                             │                        │
┌───▼────────────┐  ┌────────▼───────┐            ┌────────▼───────┐       ┌────────▼───────┐
│ OpenAI Codex   │  │ Anthropic      │            │ OpenCode       │       │ Grok / Hermes  │
│ Provider       │  │ Claude Code    │            │ Provider       │       │ Antigravity    │
│ (~/.codex/)    │  │ (~/.claude/)   │            │ (SQLite DB)    │       │ (Generic CLI)  │
└────────────────┘  └────────────────┘            └────────────────┘       └────────────────┘
```

---

## 2. Provider Capability Matrix

The control plane explicitly tracks and reports four core capabilities per provider:

| Provider | Visible | Transcript Readable | Graceful Stop Supported | Force Termination Supported | Local Data SSOT | Notes / Limitations |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **OpenAI Codex** | **Yes** | **Yes** | **Yes** | **Yes** | `~/.codex/sessions/` & `~/.codex/history.jsonl` | Non-exclusive stream handles active rollouts. Falls back to `history.jsonl` if locked. |
| **Anthropic Claude Code** | **Yes** | **Yes** | **Yes** | **Yes** | `~/.claude/projects/` & `~/.claude/history.jsonl` | Session ID exposed in process command line (`--session-id <uuid>`). |
| **OpenCode** | **Yes** | **Yes** | **Yes** | **Yes** | `~/.local/share/opencode/opencode.db` | Direct read-only SQLite queries on `session` and `part` tables. |
| **xAI Grok** | **Yes** | **No** | **Yes** | **Yes** | Host process table | Process tracking and stop supported. No local transcript DB exposed. |
| **Hermes** | **Yes** | **No** | **Yes** | **Yes** | Host process table | Process tracking and stop supported. |
| **Google Antigravity** | **Yes** | **No** | **Yes** | **Yes** | Host process table | Brain transcripts in `.gemini/antigravity-cli/brain/`. |

---

## 3. Process Tree & Safety Shield (Zero Unsolicited Termination)

Naive process termination (such as `taskkill /f /im node.exe` or `kill -9 codex`) destroys shared developer infrastructure. Starlight Queen enforces deterministic process shielding:

1. **Dynamic Tool-Plane Detection**:
   - Queries listening TCP sockets (port `7317`).
   - Automatically marks the tool-plane host PID (e.g. PID `14552`) and all its child workers as `isProtected: true`.
2. **MCP Server Shielding**:
   - Matches running processes against active MCP servers (`starlight-memory`, `starlight-department-lab`, `skill-foundry`, `ao.exe`, `claude daemon`).
   - Shielded processes are excluded from any kill candidate list.
3. **Ancestor Preservation**:
   - Traverses parent process chains (`ppid`) to locate the parent terminal, PowerShell host, or orchestrator daemon (`ao.exe`).
   - Ancestors are preserved and protected from session stops.
4. **Safety Refusal**:
   - Attempting to target a shielded PID or process tree immediately aborts with `SAFETY REFUSAL: Target PID is protected`.
5. **Dry-Run by Default**:
   - Any stop command defaults to dry-run mode, printing the exact PIDs to be stopped, shielded PIDs, and preserved ancestors without sending OS signals.

---

## 4. Secret Redaction Engine (The PII Veil)

All prompt and output captures undergo deep secret redaction before writing handover files, ensuring credentials never leak into git repositories, issue trackers, or logs:

- **Anthropic API Keys**: `sk-ant-[A-Za-z0-9_-]{20,}` -> `[REDACTED_ANTHROPIC_KEY]`
- **OpenAI API Keys**: `sk-[A-Za-z0-9_-]{20,}` -> `[REDACTED_OPENAI_KEY]`
- **GitHub PATs**: `ghp_*`, `gho_*`, `github_pat_*` -> `[REDACTED_GITHUB_TOKEN]`
- **Supabase Secrets**: `sb_secret_*` -> `[REDACTED_SUPABASE_KEY]`
- **JWT Tokens**: 3-part base64 tokens -> `[REDACTED_JWT_TOKEN]`
- **AWS Credentials**: `AKIA*` -> `[REDACTED_AWS_KEY_ID]`
- **Private Key Blocks**: RSA, EC, OpenSSH blocks -> `[REDACTED_PRIVATE_KEY_BLOCK]`
- **Bearer Tokens & Passwords**: Masked in-flight.

> [!NOTE]
> Redaction operates strictly on generated handover artifacts; original raw provider transcripts on disk are never altered or corrupted.

---

## 5. CLI Command Reference

### 5.1 Inspect All Sessions & Process Trees
```powershell
starlight queen agent inspect
starlight queen agent inspect --harness codex
starlight queen agent inspect --json
```

### 5.2 Capture Prompts, Outputs, and Save Handover
```powershell
starlight queen agent save <session-id-or-prefix>
starlight queen agent save 01a13098-24f1-7ec0 --out C:/custom/handover.md
```
Generates:
1. `~/.starlight/handoffs/YYYYMMDD-<provider>-<id>.json` (Structured JSON record)
2. `~/.starlight/handoffs/YYYYMMDD-<provider>-<id>.md` (Human/agent readable handover)
3. `~/.starlight/handoffs/HANDOVER-INDEX.json` (Idempotent searchable master index)

### 5.3 Safely Stop Targeted Sessions
```powershell
# Safe Dry-Run Preview (shows affected PIDs, shielded PIDs, preserved shell)
starlight queen agent stop <session-id-or-prefix>

# Authorized Graceful Stop (sends WM_CLOSE / SIGINT, polls exit, verifies)
starlight queen agent stop <session-id-or-prefix> --force --timeout 3000
```

### 5.4 Resume Session in Another Harness
```powershell
starlight queen agent resume <session-id-or-prefix>
```
Outputs the exact repository path, git branch, recent prompt history, and Claude Code continuation prompt.

---

## 6. Claude Continuation Prompt Example

The generated continuation prompt contains zero hidden context, enabling Claude Code to immediately pick up where Codex or another agent left off:

```markdown
Continue work from CODEX session [01a13098-24f1-7ec0-bd51-c0a8bf43ccd0]

## Working Context
- **Target Repository**: `C:\Users\frank\starlight\repos\Starlight-Intelligence-System`
- **Branch**: `agent/antigravity/npm-ecosystem-alignment`
- **Session Goal**: Stop sessions and save handovers

## Recent User Prompts
  1. "connect to all open codex sessions, stop them all, save all prompts i gave each session..."
  2. "why cant youu save all and do more? shouldnt our starlight software also help with all this..."
  3. "give prompt for more intelliogent agent to try it or build the rust or software and queen capabilities..."

## Pending Tasks & Verification
- Check git status and current branch in `C:\Users\frank\starlight\repos\Starlight-Intelligence-System`.
- Review changed files: src/queen/agent-lifecycle/
- Resume execution following repository AGENTS.md instructions.
```

---

## 7. Concrete Acceptance Incident Verification

During the **2026-10-12 Codex incident**, Codex failed to capture active sessions due to locked rollout files and lacked session-to-PID correlation. 

The Queen agent lifecycle module was verified against this exact incident:
- **Session `01a13098-24f1-7ec0-bd51-c0a8bf43ccd0`**:
  - Non-exclusive chunked read extracted all 4 user prompts and 14 assistant turns directly from the native rollout JSONL.
  - 39 tool invocations cataloged.
  - Secret veil scrubbed credentials.
  - Durable markdown and JSON records persisted.
- **Session `01a12fe8-ed64-73a2-a83c-1a9539bda915`**:
  - Extracted all 9 user prompts and 26 assistant turns across the full AGY implementation scope.
- **Stop Safety**:
  - Evaluated dry-run on idle sessions without sending signals or disturbing running services.

_Built on SIP (Starlight Intelligence Protocol) v1.1.1_

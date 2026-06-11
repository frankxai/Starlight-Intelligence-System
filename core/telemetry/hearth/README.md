# Hearth Substrate Daemon & Agent Lifecycle Registry

The Hearth directory stores runtime execution state, active lockfiles, and daemon telemetry. It provides cross-harness coordination (preventing write-conflicts when multiple agents are running) and exposes active agent session tracking.

## Standard Location
* **Repository source:** `core/telemetry/hearth/`
* **Local state location:** `~/.starlight/hearth/` (ignored by Git)
* **Junction mapping:** `~/.hearth/` $\rightarrow$ `~/.starlight/hearth/`

## Core Telemetry Files

### 1. `sessions.jsonl`
Append-only log of agent execution sessions. Each line is a single JSON object conforming to `session.schema.json`.
* **Field Summary:**
  * `timestamp`: ISO-8601 string.
  * `sessionId`: Unique UUID for the session.
  * `harness`: One of `claude`, `codex`, `gemini`, `opencode`, `antigravity`.
  * `action`: `session_start`, `session_end`, `heartbeat`, `error`, `crash`.
  * `cwd`: Path to the active workspace.
  * `prompt`: The prompt input by the user (if any).
  * `stats`: (Optional) Tokens used, execution duration, etc.

### 2. `active_lock`
A file-based mutex lock. If an agent (or harness) begins writing to a project, it writes its `sessionId` to `active_lock`. Other harnesses must wait or prompt the user before writing to the same workspace path.
* File is deleted upon graceful session exit.

### 3. `bus-ipc.sock` / `bus-port.lock`
Socket handles and lockfiles for the Starlight Memory Bus (`server.py` daemon).

---
*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*

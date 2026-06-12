# Umwelt Host Environment & Capability Registry

The Umwelt directory tracks the environment in which the agent fleet operates. It logs system capabilities, tool paths and version specifications, shell aliases, screen resolutions, workspace profiles, and active terminal/pane states (e.g. Zellij layouts).

## Standard Location
* **Repository source:** `core/telemetry/umwelt/`
* **Local state location:** `~/.starlight/umwelt/` (ignored by Git)
* **Junction mapping:** `~/.umwelt/` $\rightarrow$ `~/.starlight/umwelt/`

## Core Telemetry Files

### 1. `env.json`
Local tools version audit and paths database. Regenerated on system startup or `starlight status` runs.
* **Fields audited:**
  * Host OS details (version, build, architecture).
  * Shell version (PowerShell, bash, zsh).
  * CLI tool availability and version tags:
    * `git` version
    * `mise` version
    * `uv` version
    * `node` / `bun` version
    * `bat` version
    * `lazygit` version
    * `agy` version (Antigravity CLI executable)
    * `grok` version

### 2. `layout.kdl`
Dynamic zellij pane layout files used by the cockpit command (`starlight cockpit`) to restore active window session layouts.

---
*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*

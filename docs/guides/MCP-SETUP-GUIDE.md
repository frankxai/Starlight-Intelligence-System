# MCP Setup Guide — Starlight Intelligence System
## June 2026

> Register the SIS MCP server with every coding agent in your fleet. One vault, every tool.

---

## Overview

The SIS MCP server exposes 10 `sis_*` tools that give any MCP-compatible coding agent access to your persistent vaults, council agents, attestation, and cost tracking. Register it once per agent; all agents share the same `~/.starlight/vaults/` directory.

---

## Step 1 — Install the package

```bash
# In your SIS repo root (or anywhere on the machine)
npm install @arcanea/starlight-intelligence-system

# Seed vaults if first run
npx -p @arcanea/starlight-intelligence-system starlight init --vaults
```

Vault location: `~/.starlight/vaults/` (six JSONL files).

---

## Step 2 — Register with each agent

### Claude Code

Add to `~/.claude.json`:
```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "/absolute/path/to/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ],
      "description": "SIS memory, council, attestation, cost tracking. Always call sis_search before any major task."
    }
  }
}
```

Or project-level (`.mcp.json` in repo root):
```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

Restart Claude Code. Run `/help` — verify `sis_read`, `sis_write`, `sis_search` appear in the tool list.

### Cursor

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

### OpenAI Codex CLI

```bash
# ~/.codex/config.toml
[mcp_servers.starlight]
command = "node"
args = [
  "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
  "--vault-dir", "~/.starlight/vaults"
]
```

### Gemini CLI

```bash
# ~/.gemini/settings.json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

### Antigravity

```json
// .antigravity/mcp-config.json (already in SIS repo root)
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

### Hermes Agent (VPS)

```yaml
# ~/.hermes/config.yaml — add under mcpServers:
mcpServers:
  starlight:
    command: node
    args:
      - /root/Starlight-Intelligence-System/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js
      - "--vault-dir"
      - /root/.starlight/vaults
    description: "SIS vaults — read/write memory, council decisions, attestation"
    capabilities:
      prompts: false
      resources: true
      tools: true
```

---

## Step 3 — Railway shared MCP server (multi-machine)

For multi-machine setups where your VPS, local machine, and potentially CI need the same vaults:

```dockerfile
# Dockerfile for Railway deployment
FROM node:20-alpine
WORKDIR /app
RUN npm install @arcanea/starlight-intelligence-system
EXPOSE 3000
CMD ["node", "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js", \
     "--vault-dir", "/data/vaults", "--port", "3000", "--transport", "http"]
```

```toml
# railway.toml
[build]
  builder = "dockerfile"

[deploy]
  startCommand = "node /app/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js --vault-dir /data/vaults --port 3000 --transport http"
  healthcheckPath = "/health"
  restartPolicyType = "on_failure"

[[volumes]]
  mountPath = "/data"
```

Register with HTTP transport:
```json
{
  "mcpServers": {
    "starlight": {
      "url": "https://sis-mcp.railway.app",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer ${SIS_MCP_TOKEN}"
      }
    }
  }
}
```

Sync vaults between local and Railway with:
```bash
rsync -avz ~/.starlight/vaults/ root@your-vps:/root/.starlight/vaults/
# Or use railway volumes as the canonical source and sync down locally
```

---

## Step 4 — Hermes ↔ Claude Code MCP bridge

This is the core dual-stack connection. Both agents register each other as MCP servers.

### On VPS (`~/.hermes/config.yaml`)

```yaml
mcpServers:
  claude_code:
    command: claude
    args: ["mcp", "serve"]
    description: "Claude Code — for all code generation, file edits, test runs, and git ops. Do NOT write code yourself."
    include:
      - edit_file
      - create_file
      - read_file
      - run_bash_command
  
  starlight:
    command: node
    args:
      - /root/Starlight-Intelligence-System/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js
      - "--vault-dir"
      - /root/.starlight/vaults
```

### On local machine (`~/.claude.json`)

```json
{
  "mcpServers": {
    "hermes": {
      "command": "ssh",
      "args": [
        "-T",
        "root@YOUR_VPS_IP",
        "hermes mcp serve --config /root/.hermes/config.yaml"
      ],
      "description": "Hermes orchestrator — Telegram, scheduling, GitHub ops, multi-step workflows. Do NOT use for code generation."
    },
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ],
      "description": "SIS vaults — read/write memory, council, attestation"
    }
  }
}
```

SSH keepalive (prevents silent bridge drops):
```
# ~/.ssh/config
Host YOUR_VPS_IP
  ServerAliveInterval 30
  ServerAliveCountMax 3
  ConnectTimeout 10
```

---

## Step 5 — Verify registration

```bash
# Claude Code
claude mcp list
# Should show: starlight (10 tools), hermes (5 tools)

# Test sis_search
# Inside Claude Code: use sis_search to find "architecture decisions"
# Should return vault entries with decision tag

# Test Hermes bridge
# Inside Claude Code: call hermes.send_telegram with a test message
```

---

## Tool Reference

| Tool | When to call |
|---|---|
| `sis_search` | **Before any major task** — surface relevant vault context |
| `sis_read` | Read a specific vault entry by key |
| `sis_write` | Write a decision, insight, or ADR to vault |
| `sis_attest` | Before any PR with new SIP files — generate attestation block |
| `sis_council` | Before major architectural decisions — invoke archetype |
| `sis_harvest` | End of session — extract and store session insights |
| `sis_validate` | After any agent output — verify SIP compliance |
| `sis_skill_check` | Debug skill auto-activation issues |
| `sis_cost_tick` | Log significant token/cost events |
| `sis_yolo_scope` | Read current repo routing scope |

### Recommended agent instruction addition

Add to every `CLAUDE.md` / `AGENTS.md`:
```markdown
## SIS MCP Usage
- Always call sis_search before any significant task to surface vault context
- Always call sis_harvest at end of sessions lasting >30 min
- Always call sis_attest before PRs that add or modify SIP files
- For major architectural decisions: call sis_council({archetype: "shadow"}) first
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `sis_*` tools not appearing | Restart the coding agent; verify `--vault-dir` path exists |
| Vault reads return empty | Run `starlight init --vaults` to seed initial vault files |
| SSH bridge drops mid-task | Add keepalive to `~/.ssh/config`; check VPS is running `hermes serve` |
| HTTP transport auth fails | Verify `SIS_MCP_TOKEN` env var is set on both sides |
| Hermes can't reach Claude Code | Ensure `claude mcp serve` is running on local; SSH key auth is set up |

---

*SIS MCP Guide — v1.0.0 · 2026-06-15*
*Substrate: starlightintelligence.org/protocol v1.1.1*

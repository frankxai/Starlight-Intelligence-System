# Hermes + Claude Code + OpenClaw — Integration Guide
## Starlight Intelligence System · June 2026

> The complete dual-stack setup: Hermes on VPS as always-on orchestrator, Claude Code on local machine as precision coder, OpenClaw on Railway as event gateway. One phone, three runtimes, one SIS brain.

---

## Architecture Recap

```
[Telegram / Phone]
       │
       ▼
[Hermes Agent — VPS]          ← always-on, memory, scheduling, dispatch
   systemd daemon
   config.yaml + cron.yaml
   memory.db (SQLite)
       │
       │  SSH stdio bridge (bidirectional MCP)
       ▼
[Claude Code — Local Machine]  ← codebase, file editing, tests, git
   ~/.claude.json (hermes + starlight MCPs)
   git worktrees per task
       │
       ▼
[OpenClaw — Railway]           ← event routing, channel multiplexing
   multi-channel gateway
   session persistence
   heartbeat daemon
       │
       ▼
[SIS MCP Server]               ← shared brain (vaults, council, attestation)
   ~/.starlight/vaults/
   10 sis_* tools
```

---

## Part 1 — VPS Setup (Hermes)

### Prerequisites
- Ubuntu 22.04 VPS (4GB RAM minimum — Hetzner CX21 / DigitalOcean Basic)
- SSH key auth configured
- Node.js ≥ 18

### Install Hermes

```bash
# On VPS
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes --version  # should show v0.13.0+
```

### Install SIS MCP on VPS

```bash
cd /root
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
npm install
npx -p @arcanea/starlight-intelligence-system starlight init --vaults
```

### Hermes config — SIS-native

```yaml
# ~/.hermes/config.yaml
model: anthropic/claude-sonnet-4-6

systemPrompt: |
  You are the Starlight Orchestrator — the persistent intelligence agent for 
  the Starlight Intelligence System. Your roles:
  
  1. ORCHESTRATE: Receive tasks, classify them, dispatch to the right executor
  2. REMEMBER: Query SIS vaults before every task via sis_search
  3. HARVEST: Write decisions and insights back to SIS vaults after tasks
  4. NOTIFY: Send Telegram confirmations on task completion
  5. GOVERN: Apply Council review for significant architectural decisions
  
  DO NOT write code directly. For all code generation, file editing, git 
  operations, or test runs — use the claude_code tool. You are the 
  orchestrator; Claude Code is the executor.
  
  SIS Protocol: Every session, call sis_search first. Every significant 
  decision, call sis_council (shadow archetype for risk). Every session end, 
  call sis_harvest.

models:
  router:
    provider: anthropic
    model: claude-haiku-4-5-20251001
    temperature: 0.0
    use_for: task_classification
  summarizer:
    provider: anthropic
    model: claude-haiku-4-5-20251001
    temperature: 0.0
    use_for: result_summarization
  cron:
    provider: anthropic
    model: claude-haiku-4-5-20251001
    temperature: 0.0
    use_for: lightweight_cron

messaging:
  telegram:
    token: "${TELEGRAM_BOT_TOKEN}"
    allowed_chat_ids:
      - "${TELEGRAM_OWNER_CHAT_ID}"
    on_message:
      route_to: task_queue
      confirm_receipt: true

memory:
  backend: sqlite
  path: ~/.hermes/memory.db
  retention_days: 90

mcpServers:
  starlight:
    command: node
    args:
      - /root/Starlight-Intelligence-System/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js
      - "--vault-dir"
      - /root/.starlight/vaults
    description: "SIS vaults — always call sis_search before any task"

  claude_code:
    command: claude
    args: ["mcp", "serve"]
    description: "Claude Code — for ALL code generation, file edits, bash, and git. Do NOT write code yourself."
    include:
      - edit_file
      - create_file
      - read_file
      - run_bash_command

  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem@1.9.2", "/root"]
    capabilities:
      prompts: false
      resources: true
      tools: true

  git:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-git@0.6.2"]
    env:
      GIT_AUTHOR_NAME: "Starlight Orchestrator"
      GIT_AUTHOR_EMAIL: "hermes@starlightintelligence.org"

  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"
    include:
      - list_issues
      - get_issue
      - create_issue
      - add_issue_comment
      - list_pull_requests
      - create_pull_request
      - get_pull_request

serve:
  transport: stdio
  name: starlight-orchestrator
  description: |
    Starlight Intelligence Orchestrator. Accepts tasks via Telegram or MCP,
    routes to Claude Code for execution, maintains SIS vault memory, 
    runs scheduled workflows, and dispatches governance reviews.
```

### Cron config — SIS-integrated

```yaml
# ~/.hermes/cron.yaml
jobs:
  daily-vault-harvest:
    schedule: "0 22 * * *"    # 10 PM nightly
    task: |
      Review today's completed work across all active repos.
      Extract: decisions made, patterns observed, code patterns used, 
      architecture choices, problems solved.
      Write to SIS vault via sis_harvest tool.
      Tag all entries: daily, date:${TODAY}.
    model: anthropic/claude-haiku-4-5-20251001
    max_steps: 8
    on_failure:
      notify: telegram

  morning-triage:
    schedule: "30 7 * * 1-5"  # 7:30 AM weekdays (Amsterdam time = 5:30 UTC)
    task: |
      1. Query SIS vault: sis_search({tag: "pending-tasks"})
      2. Pull last 24h GitHub issues and PRs across frankxai repos
      3. Categorize: blocking / needs-review / backlog
      4. For issues open >3 days tagged needs-fix: dispatch to Claude Code for fix proposal
      5. Send Telegram summary with counts and top 3 items
    model: anthropic/claude-sonnet-4-6
    max_steps: 15
    on_failure:
      notify: telegram

  pr-triage:
    schedule: "0 */4 * * *"   # every 4 hours
    task: |
      Check for PRs open more than 48 hours without review across frankxai org.
      Post a reminder comment on each. Do not create new PRs.
    model: anthropic/claude-haiku-4-5-20251001
    max_steps: 8

  weekly-digest:
    schedule: "30 15 * * 0"   # Sunday 5:30 PM Amsterdam (3:30 UTC)
    task: |
      Generate weekly summary:
      1. Query SIS vault: sis_search({tag: "weekly"}) for this week's entries
      2. Pull commits merged, issues closed, PRs opened from GitHub
      3. Extract key decisions from decisions vault
      4. Format as markdown digest
      5. Send to Telegram
    model: anthropic/claude-sonnet-4-6
    max_steps: 15

  memory-sync:
    schedule: "0 * * * *"     # every hour
    task: |
      Export all SIS vault entries tagged "architecture", "decisions", or "adr"
      to /root/Starlight-Intelligence-System/.hermes-context.md
      Format: ## [tag]\n- [key]: [value]
      This file is read by Claude Code for persistent context.
    model: anthropic/claude-haiku-4-5-20251001
    max_steps: 5
    on_output:
      deliver: "[SILENT]"     # no Telegram spam, just runs silently

  sis-attestation-check:
    schedule: "0 9 * * 1"     # Monday 9 AM
    task: |
      Scan all frankxai repos for new or modified SKILL.md, AGENTS.md, 
      MEMORY.md, STACK.md files added in the last 7 days.
      For any file missing a SIP attestation block, create a GitHub issue.
    model: anthropic/claude-haiku-4-5-20251001
    max_steps: 10
```

### systemd service

```ini
# /etc/systemd/system/hermes.service
[Unit]
Description=Starlight Intelligence Orchestrator (Hermes)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/local/bin/hermes serve --config /root/.hermes/config.yaml
Restart=on-failure
RestartSec=10
Environment=ANTHROPIC_API_KEY=your-key-here
Environment=TELEGRAM_BOT_TOKEN=your-token-here
Environment=TELEGRAM_OWNER_CHAT_ID=your-chat-id-here
Environment=GITHUB_TOKEN=your-github-token-here

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable hermes
systemctl start hermes
systemctl status hermes
```

---

## Part 2 — Local Machine Setup (Claude Code)

### Register Hermes + SIS MCPs

```json
// ~/.claude.json
{
  "mcpServers": {
    "hermes": {
      "command": "ssh",
      "args": [
        "-T",
        "root@YOUR_VPS_IP",
        "hermes mcp serve --config /root/.hermes/config.yaml"
      ],
      "description": "Starlight Orchestrator on VPS — Telegram, cron, GitHub ops, multi-step workflows. Do NOT use for code generation or file editing."
    },
    "starlight": {
      "command": "node",
      "args": [
        "/path/to/Starlight-Intelligence-System/node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ],
      "description": "SIS vaults — read/write memory, council, attestation. Call sis_search before any major task."
    }
  }
}
```

### SSH keepalive

```
# ~/.ssh/config
Host YOUR_VPS_IP
  ServerAliveInterval 30
  ServerAliveCountMax 3
  ConnectTimeout 10
  ControlMaster auto
  ControlPath ~/.ssh/cm_%r@%h:%p
  ControlPersist 10m
```

### Claude Code project-level context (add to every repo's CLAUDE.md)

```markdown
## Starlight Intelligence Protocol

This repo is part of the SIS ecosystem. Before any significant task:
1. Call `sis_search` to surface relevant vault context
2. Check `.hermes-context.md` for recent architectural decisions
3. After significant work: call `sis_harvest` to store insights

For major architectural decisions: call `sis_council({archetype: "shadow"})` 
to surface risks before proceeding.

When complete, notify via `hermes.send_telegram` with a summary.

## SIS Vaults
Read `.hermes-context.md` for decisions and context exported from SIS vaults.
This file is auto-updated hourly by the Starlight Orchestrator.
```

---

## Part 3 — OpenClaw on Railway

OpenClaw acts as the event gateway and multi-channel router. It sits between external channels and the Hermes orchestrator.

### Railway deployment

```bash
# Clone and deploy
git clone https://github.com/frankxai/arcanea-claw.git
cd arcanea-claw
railway login
railway init
railway up
```

### OpenClaw config for SIS

```yaml
# openclaw.config.yaml
name: starlight-gate
description: Starlight Intelligence event gateway

gateway:
  port: 18789
  channels:
    telegram:
      enabled: true
      token: "${TELEGRAM_BOT_TOKEN}"
      route_to: hermes
    webhook:
      enabled: true
      path: /webhook
      route_to: hermes

heartbeat:
  interval: 1800       # 30 min
  tasks:
    - check_pending_vault_tasks
    - refresh_session_context
    - sync_hermes_queue

mcp_servers:
  hermes:
    url: "https://hermes-mcp.railway.app"
    transport: http
  starlight:
    url: "https://sis-mcp.railway.app"
    transport: http

soul_file: SOUL.md
memory_file: SOUL.md
agents_file: AGENTS.md
```

### Session persistence on Railway

OpenClaw sessions survive Railway restarts via the `SOUL.md` + `MEMORY.md` file pattern. Mount a Railway volume at `/data`:

```toml
# railway.toml
[[volumes]]
  mountPath = "/data"

[deploy]
  startCommand = "openclaw serve --config /app/openclaw.config.yaml --data-dir /data"
```

---

## Part 4 — Phone Integration

No app to install. Telegram is the primary mobile surface.

### Setup
1. Create a Telegram bot at [@BotFather](https://t.me/BotFather)
2. Add `TELEGRAM_BOT_TOKEN` and your chat ID to Hermes config
3. Send any message to the bot — Hermes receives it and routes to task queue

### What you can do from phone

| Message | What happens |
|---|---|
| `"Fix the TypeScript error in arcanea-ai-app"` | Hermes classifies → Claude Code on VPS fixes and opens PR → Telegram confirms |
| `"What did I work on this week?"` | Hermes queries SIS vault → returns weekly summary |
| `"Queue these tasks for tonight: [list]"` | Hermes writes to vault as pending-tasks, kanban cron picks up overnight |
| `"Council review: should I migrate to Supabase?"` | Hermes calls sis_council (all archetypes) → returns structured risk + recommendation |
| `"/skill blog-writer TOPIC='SIS architecture'"` | Hermes runs skill → Claude Code writes post → Telegram notifies when done |

### Notification routing

```
Task complete  → Hermes → Telegram (your phone)
Cron failure   → Hermes → Telegram (immediate)
Weekly digest  → Hermes → Telegram (Sunday PM)
PR opened      → Hermes → Telegram + GitHub notification
Cost anomaly   → Hermes → Telegram (Cost Plane threshold exceeded)
```

---

## Part 5 — The 6 SIS Production Skills

### Skill 1 — SIS-aware task dispatch

```yaml
# ~/.hermes/skills/sis-task.yaml
name: sis-task
description: Dispatch a task with full SIS context enrichment

steps:
  - name: recall
    task: |
      Query SIS vaults via sis_search for context relevant to: ${TASK}
      Extract: related decisions, prior art, relevant skills, open constraints.
    model: anthropic/claude-haiku-4-5-20251001

  - name: execute
    tool: claude_code
    task: |
      Execute: ${TASK}
      
      SIS Context from recall step:
      ${recall.result}
      
      On completion: call sis_harvest to store any new decisions or insights.

  - name: notify
    tool: send_telegram
    message: "Done: ${TASK}\n\nSummary: ${execute.result}"
```

### Skill 2 — Council decision

```yaml
# ~/.hermes/skills/council-decide.yaml
name: council-decide
description: Get multi-archetype council review for a decision

steps:
  - name: shadow-review
    task: |
      Acting as Shadow archetype: what are the risks, hidden costs, and 
      failure modes of this decision: ${DECISION}?
    model: anthropic/claude-sonnet-4-6

  - name: architect-review
    task: |
      Acting as Architect archetype: what are the structural implications
      and system design considerations of: ${DECISION}?
    model: anthropic/claude-sonnet-4-6

  - name: divine-review
    task: |
      Acting as Divine archetype: does this decision align with the 
      sovereign vision and long-horizon goals? Decision: ${DECISION}
    model: anthropic/claude-sonnet-4-6

  - name: synthesize
    task: |
      Synthesize the three reviews into a decision recommendation with:
      - Proceed / Proceed with caution / Do not proceed
      - Top 3 risks to mitigate
      - Alignment with SIS doctrine
      Shadow: ${shadow-review.result}
      Architect: ${architect-review.result}
      Divine: ${divine-review.result}
    model: anthropic/claude-sonnet-4-6

  - name: record
    task: |
      Write this council decision to SIS vault via sis_write:
      key: "decision/${DATE}/${DECISION_SLUG}"
      tag: decisions, adr, council
      content: ${synthesize.result}

  - name: notify
    tool: send_telegram
    message: "Council decision on '${DECISION}':\n\n${synthesize.result}"
```

### Skill 3 — Weekly SIS harvest

```yaml
# ~/.hermes/skills/weekly-harvest.yaml
name: weekly-harvest
description: Full weekly harvest into SIS vaults

steps:
  - name: code-harvest
    tool: claude_code
    task: |
      Review git log for the past 7 days across all frankxai repos in scope.
      Extract: significant commits, architectural changes, new patterns.
      Return structured summary.

  - name: vault-write
    task: |
      Write weekly harvest to SIS vaults:
      - sis_write: key=weekly/${YEAR_WEEK}, tag=weekly, content=${code-harvest.result}
      - sis_write: separate entry per significant decision found
      - sis_cost_tick: log weekly token summary

  - name: notify
    tool: send_telegram
    message: "Weekly harvest complete. ${vault-write.result}"
```

---

## Part 6 — Failure Modes & Mitigations

| Failure | Root cause | Mitigation |
|---|---|---|
| SSH bridge drops silently | SSH timeout, VPS restart | SSH keepalive + `ControlPersist 10m`; Hermes health check cron |
| Claude Code concurrent lock | Two Hermes cron jobs dispatching simultaneously | Stagger all cron jobs ≥5 min; file lock check before dispatch |
| Vault drift (Hermes ≠ local) | Separate vault files on VPS vs local | Mount Railway volume as canonical; rsync on session start |
| Context loss mid-task | Task description missing "obvious" context | Always call `sis_search` before dispatch; include retrieved context verbatim in task |
| Skill format mismatch | Hermes YAML ≠ Claude Code SKILL.md format | Maintain separate skill libraries; don't try to share formats |
| MCP server not found | Path issues after npm update | Use absolute paths in all MCP configs; pin `@arcanea/sis` version |
| 200-400ms SSH overhead per MCP call | SSH stdio latency | Accept as cost of the transport; batch tool calls where possible |
| Telegram delivery failure | Bot rate limit / network | Hermes retries with exponential backoff; store in vault if delivery fails |

---

## Quick-start checklist

```
VPS:
[ ] Hermes installed and running (systemctl status hermes)
[ ] SIS repo cloned and npm installed
[ ] Vaults seeded (starlight init --vaults)
[ ] ~/.hermes/config.yaml configured with SIS + Claude Code MCPs
[ ] ~/.hermes/cron.yaml configured with daily-harvest + memory-sync
[ ] Telegram bot token set and test message sends

Local:
[ ] ~/.claude.json configured with hermes + starlight MCPs
[ ] SSH key auth to VPS works without password
[ ] SSH keepalive added to ~/.ssh/config
[ ] Test: Claude Code can call hermes.send_telegram
[ ] Test: sis_search returns vault entries in Claude Code

Railway:
[ ] OpenClaw deployed with Railway volume
[ ] SIS MCP server optionally deployed for shared fleet access
[ ] Env vars set (tokens, keys)

Phone:
[ ] Telegram bot added
[ ] Test message → Hermes → Telegram confirmation loop works
```

---

*Hermes + Claude Code + OpenClaw Guide — v1.0.0 · 2026-06-15*
*Part of Starlight Intelligence System · starlightintelligence.org/protocol v1.1.1*

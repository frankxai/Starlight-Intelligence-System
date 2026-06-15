# Infrastructure Deployment Guide
## Starlight Intelligence System · June 2026

> Vercel + Railway + VPS + Local Machine + Phone — the complete 5-surface deployment topology.

---

## Surface Map

| Surface | Services | Auth | Cost model |
|---|---|---|---|
| **Vercel** | frankx.ai, arcanea.ai, starlightintelligence.org | GitHub auto-deploy | Usage-based (free tier covers public sites) |
| **Railway** | OpenClaw gateway, API backends, SIS MCP (optional) | Railway token | Usage-based ($5–20/mo typical) |
| **VPS** | Hermes Agent, always-on orchestrator, cron runner | SSH keys | Fixed (~€5–15/mo Hetzner) |
| **Local Machine** | Claude Code, Gemini CLI, Codex, OpenCode | Local creds | API costs only |
| **Phone** | Telegram interface | Telegram bot token | Free |

---

## Vercel Deployments

### Repos on Vercel

| Repo | Domain | Branch | Framework |
|---|---|---|---|
| `frankx.ai-vercel-website` | frankx.ai | main | Next.js |
| `arcanea-ai-app` | arcanea.ai | main | Next.js |
| SIS protocol site (in SIS repo `src/protocol-site/`) | starlightintelligence.org | main | Next.js / Astro |

### Setup (one-time per repo)

```bash
# Install Vercel CLI
npm i -g vercel

# Link repo
cd frankx.ai-vercel-website
vercel link   # links to frankxai org on Vercel

# Deploy
vercel --prod
```

### Environment variables (Vercel dashboard)

```
ANTHROPIC_API_KEY=...          # for AI features
NEXT_PUBLIC_SIS_MCP_URL=...    # if using Railway SIS MCP
NEXT_PUBLIC_SITE_URL=...
SUPABASE_URL=...               # if using Supabase
SUPABASE_ANON_KEY=...
```

### GitHub auto-deploy config

```yaml
# vercel.json (root of each Vercel repo)
{
  "github": {
    "autoAlias": true,
    "enabled": true
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

Preview deployments auto-created on every PR. Production deploys on merge to `main`.

### SIS integration on Vercel

For Vercel apps that need vault access, call the Railway-hosted SIS MCP via HTTP:

```typescript
// lib/sis.ts
const SIS_MCP_URL = process.env.SIS_MCP_URL

export async function sisSearch(query: string) {
  const res = await fetch(`${SIS_MCP_URL}/tool/sis_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SIS_MCP_TOKEN}`
    },
    body: JSON.stringify({ query, limit: 5 })
  })
  return res.json()
}
```

---

## Railway Deployments

### Services on Railway

| Service | Source | Purpose |
|---|---|---|
| OpenClaw Gateway | `arcanea-claw` | Multi-channel event router |
| SIS MCP Server | SIS repo `src/` | Shared fleet vault access |
| Arcanea API | `arcanea-ai-app/api` | Arcanea.ai backend |
| Hermes Mirror | SIS repo | Backup orchestrator (optional) |

### OpenClaw on Railway

```bash
cd arcanea-claw
railway login
railway init --name starlight-gate
railway up
```

```toml
# railway.toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "openclaw serve --config openclaw.config.yaml --data-dir /data"
  healthcheckPath = "/health"
  healthcheckTimeout = 10
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3

[[volumes]]
  mountPath = "/data"
  name = "starlight-gate-data"
```

Railway env vars:
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_OWNER_CHAT_ID=...
ANTHROPIC_API_KEY=...
HERMES_URL=https://hermes-mcp.railway.app  # if Hermes also on Railway
```

### SIS MCP Server on Railway

```dockerfile
# Dockerfile.mcp
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install @arcanea/starlight-intelligence-system
EXPOSE 3000
CMD ["node", \
  "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js", \
  "--vault-dir", "/data/vaults", \
  "--port", "3000", \
  "--transport", "http"]
```

```toml
# railway.toml for MCP service
[build]
  dockerfilePath = "Dockerfile.mcp"

[deploy]
  healthcheckPath = "/health"
  restartPolicyType = "on_failure"

[[volumes]]
  mountPath = "/data"
  name = "sis-vaults"
```

Railway env vars:
```
SIS_MCP_TOKEN=generate-a-secret-token
NODE_ENV=production
```

### Vault sync strategy (local ↔ Railway)

```bash
# Sync local vaults UP to Railway volume (after local work session)
rsync -avz ~/.starlight/vaults/ \
  root@railway-ssh-host:/data/vaults/

# Sync Railway vaults DOWN to local (at session start)
rsync -avz root@railway-ssh-host:/data/vaults/ \
  ~/.starlight/vaults/
```

Or use the Railway CLI volume mount for direct access:
```bash
railway volume sync sis-vaults ~/.starlight/vaults
```

---

## VPS Setup (Hermes + always-on runtime)

### Recommended providers (June 2026)

| Provider | Plan | RAM | Price | Best for |
|---|---|---|---|---|
| Hetzner | CX21 | 4GB | €4.15/mo | Europe (Amsterdam latency) |
| DigitalOcean | Basic | 4GB | $24/mo | Global availability |
| Vultr | Regular | 4GB | $24/mo | More regions |

### Initial VPS setup

```bash
# On fresh Ubuntu 22.04
apt update && apt upgrade -y
apt install -y git nodejs npm curl tmux

# Install Hermes
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Clone SIS
git clone https://github.com/frankxai/Starlight-Intelligence-System.git /root/SIS
cd /root/SIS && npm install

# Seed vaults
npx -p @arcanea/starlight-intelligence-system starlight init --vaults

# Configure Hermes
mkdir -p ~/.hermes
# Copy config.yaml and cron.yaml from HERMES-CLAUDE-CODE-GUIDE.md

# Start Hermes as service
cp /root/SIS/docs/guides/hermes.service /etc/systemd/system/hermes.service
systemctl daemon-reload
systemctl enable hermes
systemctl start hermes
```

### Firewall

```bash
ufw allow ssh
ufw allow 18789/tcp    # OpenClaw control UI (optional, keep private)
ufw enable
```

### Zellij cockpit (optional but recommended)

```bash
apt install -y zellij
# or: cargo install zellij

# Create SIS cockpit layout
cat > ~/.config/zellij/layouts/sis.kdl << 'EOF'
layout {
  pane_template name="vertical" {
    direction "vertical"
  }
  vertical {
    pane {
      name "Hermes"
      command "journalctl"
      args "-fu" "hermes" "--no-pager"
    }
    pane {
      name "Vault Monitor"
      command "watch"
      args "-n5" "wc -l ~/.starlight/vaults/*.jsonl"
    }
    pane {
      name "Claude Code"
      focus true
    }
  }
}
EOF

# Launch cockpit
zellij --layout sis
```

---

## Local Machine Setup

### Tool stack

```
Claude Code       Primary coding executor      npm install -g @anthropic-ai/claude-code
Gemini CLI        Secondary / research tasks   npm install -g @google/gemini-cli  
Codex CLI         OpenAI tasks                 npm install -g @openai/codex
OpenCode          Open source alternative      npm install -g opencode-ai
```

### Global CLAUDE.md

```markdown
# ~/.claude/CLAUDE.md — Global context for all Claude Code sessions

## Identity
You are operating within the Starlight Intelligence System (SIS) as the
primary code executor. Hermes is your orchestrator. Obey typed handoff
envelopes. Record significant decisions back to SIS vaults.

## SIS Protocol
- Call sis_search before any significant task
- Call sis_harvest at end of sessions >30 min
- Call sis_attest before PRs that add SIP files
- For major decisions: sis_council({archetype: "shadow"}) first

## MCP Tools Available
- starlight: SIS vaults, council, attestation (10 sis_* tools)
- hermes: orchestrator, Telegram, cron dispatch (5 tools)

## Stack
- TypeScript / Next.js (primary)
- Railway (backends), Vercel (frontend)
- SIP v1.1.1 compliance required on all new repos

## Repos in scope
Read private/yolo-scope.json for current repo routing.
```

### Git worktree pattern (agent isolation)

Claude Code subagents each get their own worktree:

```bash
# Create worktrees for parallel agent work
git worktree add ../feature-agent-1 -b feat/agent-1
git worktree add ../feature-agent-2 -b feat/agent-2

# Each subagent operates in its own worktree with no conflicts
# Parent agent merges when both complete
```

---

## Phone (Telegram)

### Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
2. Copy the bot token → set as `TELEGRAM_BOT_TOKEN` in Hermes config
3. Get your chat ID: message [@userinfobot](https://t.me/userinfobot) → set as `TELEGRAM_OWNER_CHAT_ID`
4. Message your bot → Hermes receives and confirms

### Useful Telegram commands to send Hermes

```
# Task dispatch
"Fix the bug in arcanea-ai-app where images don't load on mobile"

# Vault query
"What did I decide about the Supabase migration?"

# Council review  
"Should I add authentication to the SIS MCP server?"

# Skill invocation
"/skill weekly-harvest"

# Kanban queue (overnight)
"Queue for tonight: 1) Update README in SIS 2) Fix TypeScript in arcanea 3) Weekly harvest"

# Cost check
"How much did I spend on AI APIs this week?"
```

---

## CI/CD Patterns

### GitHub Actions — SIS harness check

```yaml
# .github/workflows/sis-harness.yml
name: SIS Harness Check
on:
  pull_request:
    paths: ['**/*.md', '**/*.json', 'agents/**', 'skills/**']

jobs:
  harness-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run agents:harness-check
      - run: npm test -- --testPathPattern="substrate"
```

### GitHub Actions — SIP attestation check

```yaml
# .github/workflows/sip-attest.yml
name: SIP Attestation Check
on:
  pull_request:

jobs:
  attestation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check SIP attestation on new SIP files
        run: |
          # Check changed SIP files have attestation blocks
          git diff --name-only origin/main... | \
            grep -E "(SKILL|AGENTS|MEMORY|STACK|SOUL)\.md$" | \
            while read f; do
              if ! grep -q "Built on SIP" "$f"; then
                echo "ERROR: $f missing SIP attestation block"
                exit 1
              fi
            done
```

### Vercel deploy hook from Hermes

```yaml
# In Hermes cron.yaml — trigger Vercel deploy after content updates
content-deploy:
  schedule: "0 20 * * *"   # 8 PM nightly after vault harvest
  task: |
    Check if any blog posts or protocol pages were updated today in SIS vaults.
    If yes, trigger Vercel deploy hook for frankx.ai.
    POST to: ${VERCEL_DEPLOY_HOOK_URL}
  model: anthropic/claude-haiku-4-5-20251001
  max_steps: 3
```

---

## Cost Management

### API cost breakdown (typical month)

| Service | Usage | Est. cost |
|---|---|---|
| Anthropic (Hermes + Claude Code) | ~2M tokens/day | €80–150/mo |
| Railway (3 services) | Always-on | €15–30/mo |
| Vercel (3 sites) | Hobby tier | €0–20/mo |
| VPS (Hetzner CX21) | Always-on | €5/mo |
| Gemini CLI | Light secondary use | €5–20/mo |
| **Total** | | **~€105–225/mo** |

### Cost optimization

1. **Route to Haiku by default** — only use Sonnet/Opus for council decisions and complex orchestration
2. **`[SILENT]` on cron jobs** — suppress Telegram delivery for routine jobs; saves context and tokens
3. **Vault search before web search** — always hit SIS vaults first; vault hits are free
4. **Prompt caching** — Claude Code caches CLAUDE.md prefix; minimize changes to system prompt files
5. **max_turns caps** — set `max_turns: 8–12` on lightweight cron jobs; `max_turns: 20–30` only for complex tasks

---

*Infrastructure Deployment Guide — v1.0.0 · 2026-06-15*
*Part of Starlight Intelligence System · starlightintelligence.org/protocol v1.1.1*

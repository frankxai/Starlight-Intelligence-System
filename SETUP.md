# SETUP — Starlight Intelligence System (operator onboarding)

Bring SIS up on a fresh machine. Covers /yolo Hive, Cost Plane (W2), Finance & Business IS (W3).

Estimated time end-to-end: **~30 min** including Infisical onboarding.

---

## 0. Prerequisites

- Node.js ≥ 18 (`node --version`)
- npm (`npm --version`)
- git (`git --version`)
- One of: PowerShell ≥ 7 (Windows / cross-platform) OR bash (Linux / Mac)
- Optional: [Zellij](https://zellij.dev/) for the multi-pane cockpit (`brew install zellij` / scoop / cargo)
- Optional: [Infisical CLI](https://infisical.com/docs/cli/overview) for centralized secrets

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
npm install
npm test       # 245+ tests should pass
```

If `npm test` fails, stop and file an issue before proceeding.

---

## 1. Create your private/ instance state

`private/` is gitignored — your real data lives here, never committed.

### 1.1 yolo-scope (cross-repo conductor scope)

```bash
mkdir -p private
cp yolo-scope.template.json private/yolo-scope.json
```

Edit `private/yolo-scope.json`:
- `phase_in.phase_in_repo` — your primary repo name (sessions 1–3 lock to this)
- `repos[]` — array of your sovereign repos with absolute paths
- `budget.session_threshold_usd` / `action_threshold_usd` — your spend thresholds

**Sovereignty hygiene:** `alliance_touched: true` excludes a repo from /yolo entirely. Default to `false` for your own repos; flip to `true` for any repo where you're a guest contributor.

### 1.2 Cost Plane config (W2)

```bash
cp cost-plane-config.template.json private/cost-plane-config.json
```

Edit `private/cost-plane-config.json`:
- `schedule.timezone` — IANA timezone (e.g. `Europe/Paris`, `America/New_York`, `UTC`)
- `thresholds.<source>.daily_usd_cap` — daily $ caps per source
- `thresholds.<source>.wow_factor` / `mom_factor` — anomaly multipliers (default 1.5 / 1.3)

### 1.3 Business registry (W3)

```bash
cp business-registry.template.json private/business-registry.json
```

Edit `private/business-registry.json`:
- Replace `<entity-display-name>` with your legal entities
- `jurisdiction` — set after your counsel-conversation (leave as `<set-post-counsel>` until then)
- `current_cash.amount` — operator-provided cash position (update weekly via `/finance-cash-tick`)

**Privacy posture:** never commit this file. It contains entity structure + cash positions.

---

## 2. Infisical secret store (optional but recommended)

The Cost Plane + Finance instrumenters need API keys (Vercel, Anthropic, Stripe, …). Two paths:

### Path A: Infisical CLI (recommended for sovereignty + rotation)

1. Sign up at https://infisical.com — create workspace `sis-prod`
2. Install CLI: https://infisical.com/docs/cli/overview
3. `infisical login`
4. Add secrets to the workspace:
   - `VERCEL_API_TOKEN`
   - `ANTHROPIC_API_KEY`, `ANTHROPIC_ORG_ID`
   - `STRIPE_API_KEY`
   - (others as Phase 1.5 sources unlock)
5. Export `INFISICAL_PROJECT_ID` env var pointing at the workspace
6. The orchestrator will shell out to `infisical secrets get` per key

**Exit strategy** (see W2 spec §3.4.1): weekly age-encrypted export to `private/secrets-export/<YYYY-MM-DD>.age` keeps the keystone reversible. ~6–8h to migrate OFF Infisical if needed.

### Path B: process.env (dev / single-machine simplicity)

Set env vars before invoking the orchestrator:

```bash
# Linux/Mac
export VERCEL_API_TOKEN="<your-token>"
export ANTHROPIC_API_KEY="<your-key>"
export ANTHROPIC_ORG_ID="<your-org>"
export STRIPE_API_KEY="<your-key>"

# Windows PowerShell
$env:VERCEL_API_TOKEN = "<your-token>"
# ...
```

The `EnvSecretsClient` reads `process.env` when `INFISICAL_PROJECT_ID` is unset.

**Trade-off:** simpler now, no rotation, no audit trail of secret access. Fine for solo operators; prefer Path A once you have alliances or multi-machine.

---

## 3. Schedule daily snapshots

### Windows (Task Scheduler)

```powershell
# Cost snapshot — daily 02:30
$action = New-ScheduledTaskAction -Execute 'pwsh' -Argument '-File "C:\path\to\SIS\scripts\cron\daily-cost-snapshot.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 02:30
Register-ScheduledTask -TaskName 'SIS-CostSnapshot' -Action $action -Trigger $trigger

# Revenue snapshot — daily 02:35
$action = New-ScheduledTaskAction -Execute 'pwsh' -Argument '-File "C:\path\to\SIS\scripts\cron\daily-revenue-snapshot.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 02:35
Register-ScheduledTask -TaskName 'SIS-RevenueSnapshot' -Action $action -Trigger $trigger
```

### Linux / Mac (crontab)

```bash
chmod +x scripts/cron/posix/*.sh
crontab -e
```

Add lines:

```
30 2 * * * /path/to/SIS/scripts/cron/posix/daily-cost-snapshot.sh
35 2 * * * /path/to/SIS/scripts/cron/posix/daily-revenue-snapshot.sh
```

---

## 4. Cockpit workspaces (Zellij)

Once Zellij is installed and you have `cockpit-zellij/scripts/zellij-aliases.ps1` loaded (Windows) or equivalent shell aliases:

```bash
arc yolo         # /yolo Hive cockpit — 4-pane workspace
arc cost-plane   # cost dashboard with MTD spend per source
arc finance      # P&L + runway per entity, color-coded
```

If `arc` isn't on your path, launch directly:

```bash
zellij --layout cockpit-zellij/layouts/yolo.kdl --session yolo
```

The layouts use relative paths (`./memory/_audit/...`), so launch from the SIS root.

---

## 5. First run (smoke test)

```bash
# Validate /yolo runtime contract without touching production state
npx tsx scripts/yolo-smoke.ts
```

You should see 15 audit events written + "Runtime contract validated" with 7 ✓ checks.

For first real `/yolo` session, type `/yolo` in Claude Code with SIS as the working directory.

---

## 6. Validation gates (board-passes-applied)

After ~7 days of clean cost-plane snapshots (no NaN, no false-positive anomalies):
- Add `cloudflare` + `langfuse` to `private/cost-plane-config.json::sources_phase_1` → W2.1.5 unlocked

After ~14 days of clean revenue snapshots:
- Add `Starlight Holding` to `private/business-registry.json::entities` (or your second entity)
- Wire bank CSV ingest path → W3.1.5 unlocked

After 3 /yolo sessions against single repo:
- Phase-In Review packet surfaces at session 4
- Frank-side decides: unlock 24-repo scope / extend phase-in / pause for spec revision

---

## 7. What's gitignored vs committed

| Path | Status | Why |
|---|---|---|
| `private/` | gitignored | Operator-private instance state |
| `memory/_audit/` | gitignored | Runtime audit logs (yolo, cost, finance) |
| `yolo-scope.json` | not committed | Real values live in `private/yolo-scope.json` |
| `yolo-scope.template.json` | committed | Schema-only template |
| `cost-plane-config.json` | not committed | Real values live in `private/cost-plane-config.json` |
| `cost-plane-config.template.json` | committed | Schema-only template |
| `business-registry.json` | not committed | Real values live in `private/business-registry.json` |
| `business-registry.template.json` | committed | Schema-only template |
| `src/`, `commands/`, `skills/`, `test/` | committed | Substrate — anyone can use |

---

## 8. Troubleshooting

**"yolo-scope.json not found"** → step 1.1 — copy template to private/.

**"private/business-registry.json not found"** → step 1.3.

**"VERCEL_API_TOKEN not in secrets store"** → step 2 — Path A or B.

**"STALE_CASH"** → run `/finance-cash-tick <entity> <amount>` to refresh. Per spec, runway refuses to compute on > 14-day-old cash data.

**npm test fails on first clone** → check Node.js version (`node --version` ≥ 18). If still failing, file an issue with the failing test name.

---

*Built on SIP — sovereign-spawned, attestation-aware.*

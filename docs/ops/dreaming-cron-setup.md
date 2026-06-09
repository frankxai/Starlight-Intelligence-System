---
date: 2026-05-07
scope: operational — memory pipeline scheduled task
files: scripts/dreaming-run.ts · scripts/dreaming-cron.ps1 · memory/CONSOLIDATION_LOG.md
---

# Dreaming cron setup (Windows scheduled task)

> Closes the gap surfaced in the 2026-05-07 end-to-end excellence audit: rich memory pipeline architecture (FTS5 + temporal half-life + DreamingAgent + Memory-Bus singleton) but **no scheduled invocation**. All 6 vaults stamped `last_consolidated: 2026-05-01` for 5 days running before this. Substrate claim "memory that compounds" was unverifiable.

## What it does

`scripts/dreaming-run.ts` runs once and:

1. Instantiates `DreamingAgent` against `$HOME/.starlight/vaults/`.
2. Calls `agent.dream(memory/voice-sessions/)` — extracts insights from session JSONs, identifies cross-vault Wisdom-promotion candidates, detects contradictions across vaults.
3. Appends a 1-line receipt to `memory/CONSOLIDATION_LOG.md` in the form:
   ```
   - 2026-05-07T07:48:07.910Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
   ```
   Or on failure:
   ```
   - 2026-05-07T07:48:07.910Z · error: vaultDir not found at ...
   ```

`scripts/dreaming-cron.ps1` is a thin wrapper that calls the runner with proper cwd handling.

## One-time scheduled-task setup

Run **once** in an admin PowerShell:

```powershell
schtasks /Create /TN "Starlight Dreaming" /SC DAILY /ST 06:00 `
  /TR 'pwsh.exe -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\dreaming-cron.ps1'
```

Adjust `/ST` (start time) to your preference. Daily cadence is sufficient — dreaming is cheap (sub-second on small vaults) but doesn't need to fire more often than once per day on this scale.

Verify task:
```powershell
schtasks /Query /TN "Starlight Dreaming"
```

## Manual / on-demand runs

Direct PowerShell:
```powershell
pwsh -NoProfile -File scripts\dreaming-cron.ps1
```

Direct Node:
```bash
node --import tsx scripts/dreaming-run.ts
```

Verify the receipt landed:
```bash
tail -5 memory/CONSOLIDATION_LOG.md
```

## Configuration (env vars)

All optional:

| Var | Default | Purpose |
|---|---|---|
| `STARLIGHT_VAULT_DIR` | `$HOME/.starlight/vaults` | Where the JSONL vaults live |
| `STARLIGHT_SESSIONS_DIR` | `<repo>/memory/voice-sessions` | Where session JSONs live for insight extraction |

## Reading the log

A healthy run shows non-zero counts when sessions or vault changes have occurred:
```
- 2026-05-07T06:00:01.230Z · insights: 4 · contradictions: 1 · promotions: 2 · processed: 3
```

A receipt with all zeros and `processed: 0` typically means there are no session JSONs to process — voice-sessions in `memory/voice-sessions/` are currently .md (Obsidian-friendly), not .json. If you want non-zero `processed`, either:
- Add session capture in JSON format to that directory, or
- Extend `DreamingAgent.extractInsights()` to also accept .md frontmatter (planned follow-up).

A receipt with `error: ...` indicates pipeline failure. Most common cause: vault dir missing (run `mkdir ~/.starlight/vaults` once or set `STARLIGHT_VAULT_DIR` to your actual vault location).

## Future structural assertion (queued)

Audit recommendation Q3: encode a substrate invariant that `CONSOLIDATION_LOG.md` cannot stay stale > 7 days. v80-style symmetry harness could read the most-recent log line, parse the timestamp, and assert age < 7 days. Pre-pass via `/starlight-board` first per the board-before-tag invariant.

## Dependencies

- Node ≥ 18 (per `package.json` engines).
- `tsx` (devDependency, already installed).
- PowerShell 7+ (`pwsh.exe` — falls back to Windows PowerShell 5.1 if missing, but pwsh-7 is the tested target).
- `~/.starlight/vaults/` exists (or set `STARLIGHT_VAULT_DIR`).

## Idempotency + safety

- `appendFileSync` to log — never rewrites prior receipts.
- `ensureLog()` only writes header on first run; subsequent runs append.
- Failures append an `error:` line, never throw out of the runner; cron exits with code 1 on agent failure, 2 on missing vault dir, 0 on success.
- No filesystem writes outside `memory/CONSOLIDATION_LOG.md` from this runner. Future Wisdom-promotion writeback will be a separate explicit step gated by Frank.

---

**Built on SIP** v1.1.1 — operational tier (memory observability scheduled task)

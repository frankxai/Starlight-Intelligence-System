---
date: 2026-05-05
tier: operational
ship: cockpit-hardening (Audit E patches #1, #3, #4, #5, #6, #8)
status: SHIPPED — working tree, awaiting SIS Queen commit
---

# Cockpit hardening — Audit E ship report

## Patches applied

| # | Patch | File | Status |
|---|---|---|---|
| 1 | `Resolve-Tool` preflight (python/node/npm + workdir + .env existence) | `private/local-command-center/scripts/start-cockpit.ps1` | OK |
| 3 | Launcher log rotation @ 5 MB | `start-cockpit.ps1` | OK |
| 4 | `Start-Transcript` (top) + `Stop-Transcript` (finally) wrap | `start-cockpit.ps1` | OK |
| 5 | Task XML: battery=false, RestartOnFailure 2 -> 5 | `\StarlightCockpit` | OK |
| 6 | `cockpit-launch.cmd` shim + task points at .cmd (drops `<Arguments>`) | new file + `\StarlightCockpit` | OK |
| 8 | `.env` precedence: `~/.starlight/.env` (base) -> project `.env` (override) | `private/voice-operator/service/config.py` | OK |

Bare `'python'` / `'node'` references in start-cockpit.ps1 (lines ~210, ~234, ~282 in pre-patch) all rewired to `$script:PYTHON` / `$script:NODE`.

## Verification gate (all 5 PASS)

1. **Python syntax** — `ast.parse(config.py)` -> `OK`.
2. **PowerShell syntax** — `[PSParser]::Tokenize(start-cockpit.ps1)` -> `OK` (no errors).
3. **`cockpit-launch.cmd` exists** — `Test-Path` returns true.
4. **Task re-run** — `schtasks /Run /TN "StarlightCockpit"` returned SUCCESS; `Last Result: 0`. All 3 ports respond:
   - `127.0.0.1:7373` -> True
   - `127.0.0.1:7777` -> True
   - `127.0.0.1:3007` -> True
   Idempotency confirmed: launcher detected existing listeners and skipped re-spawn (correct behavior).
5. **Transcript log written** — `~/.starlight/logs/cockpit-transcript.log` EXISTS (1424 bytes).

## Files modified

- `C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1` (Patches 1, 3, 4)
- `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator\service\config.py` (Patch 8)
- `C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\cockpit-launch.cmd` (Patch 6, new)
- Task `\StarlightCockpit` re-registered (Patches 5 + 6) — XML now has:
  - `<DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>`
  - `<StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>`
  - `<RestartOnFailure><Count>5</Count>...</RestartOnFailure>`
  - `<Command>...\cockpit-launch.cmd</Command>` (no `<Arguments>` — shim handles)

## BOM check

`start-cockpit.ps1` first 3 bytes: `ef bb bf` — UTF-8 BOM preserved across all edits. (Verified pre- and post-patch.)

## Implementation notes

- Preflight block placed AFTER all helper-function definitions (line 163+) so it can call `Write-LauncherLog`. Original suggestion of "right after `$ErrorActionPreference`" would have called the function before its definition.
- Patch 4 wrapped the main body in `try { ... } finally { Stop-Transcript }`. The Status-mode early `return` is inside the try block, so the finally still fires — transcript is always closed.
- Patch 3 placed once at module top (after `$LauncherLog` is set) rather than inside `Write-LauncherLog`. Single-shot rotation per launcher run is cleaner than per-append.
- Task XML edit done with namespace-aware `[xml]` cast (XPath via `XmlNamespaceManager`) rather than text-substitution to avoid encoding-edge bugs.
- The `private/` files are gitignored — Frank's Queen-tier commit will need to use `--force` or these patches stay local-only. Confirm with git-status before commit.

## Anything left for Frank

- **Commit**: Tier 0 ship — SIS Queen will fold these patches into a single commit with the other Tier 0 fixes (CLAUDE.md "9 IS" -> "10 IS", luminor-board path, LICENSE adds, etc.). Files in working tree, no commits made by this agent.
- **Note** on the `private/` gitignore: only `config.py` and `start-cockpit.ps1` and `cockpit-launch.cmd` are inside `private/` — they will not show in `git status` against the public repo. Verify whether these live in a separate private-tier git repo or are truly local-only.
- **Hidden landmine flagged in Audit E**: fnm-shimmed node is the next likely silent failure once #6 lands. `Resolve-Tool` will catch missing-on-PATH but won't catch fnm-shim-resolution-mismatch in SYSTEM context. Defer to next round.

## Risk profile

- Reversible: old XML preserved at `$env:TEMP\cockpit-task.xml` (until next run). Re-register from the original snapshot in this conversation if needed.
- Live cockpit was untouched: all 3 ports were already listening before the test, and the idempotent launcher skipped them. No service restart cost.
- Forward path: next logon-trigger fire will route through the new `.cmd` shim with PS7-then-fallback resolution. If pwsh.exe disappears, `powershell.exe` 5.1 takes over — the failure mode that broke the cockpit at logon today is now closed.

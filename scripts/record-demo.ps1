# scripts/record-demo.ps1
#
# Semi-automated driver for Friday 2026-05-15 demo recording.
# Frank clicks OBS start/stop manually (PowerShell screen-record-API is too
# fragile on multi-monitor Windows). This script handles everything else:
# pre-flight verification, narration display, post-capture hashing, sidecar
# attestation JSON, file moves into memory/recordings/.
#
# Usage:
#   pwsh -NoProfile -File scripts\record-demo.ps1                  # full flow
#   pwsh -NoProfile -File scripts\record-demo.ps1 -PreflightOnly   # T-30 check
#   pwsh -NoProfile -File scripts\record-demo.ps1 -Verify          # post-capture
#   pwsh -NoProfile -File scripts\record-demo.ps1 -DryRun          # no writes
#
# Companion doc: docs/ops/DEMO-RECORDING-PLAN-2026-05-12.md
#
# Built on SIP — operational tier (demo recording driver).

[CmdletBinding()]
param(
    [switch]$PreflightOnly,
    [switch]$Verify,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$RepoRoot      = Split-Path -Parent $PSScriptRoot
$DashboardUrl  = 'http://127.0.0.1:3007'
$RecordingDate = (Get-Date -Format 'yyyy-MM-dd')
$RecordingTag  = "$RecordingDate-friday-demo-v01"
$RecordingDir  = Join-Path $RepoRoot "memory\recordings\$RecordingTag"
$RawDir        = Join-Path $RepoRoot 'memory\recordings\_raw'
$DemoSmoke     = Join-Path $PSScriptRoot 'demo-friday-2026-05-15.ps1'
$RunbookPath   = Join-Path $RepoRoot 'docs\ops\DEMO-RUNBOOK-2026-05-15.md'

function Write-Step {
    param([string]$Tag, [string]$Msg, [ConsoleColor]$Color = 'White')
    Write-Host ("  [{0,-5}] {1}" -f $Tag, $Msg) -ForegroundColor $Color
}

function Probe-Http {
    param([string]$Url)
    try {
        $code = & curl.exe -s -o NUL -w '%{http_code}' --max-time 5 $Url 2>$null
        return [int]$code
    } catch {
        return -1
    }
}

function Compute-Sha256 {
    param([string]$Path)
    $hash = Get-FileHash -Algorithm SHA256 -Path $Path
    return $hash.Hash.ToLower()
}

# ── Pre-flight ────────────────────────────────────────────────────────

function Invoke-Preflight {
    Write-Host ""
    Write-Host "Pre-flight (T-30)" -ForegroundColor Cyan
    Write-Host "================="

    $ok = $true

    # 1. Demo smoke
    Write-Step 'smoke' "Running demo-friday-2026-05-15.ps1 ..." 'DarkGray'
    if (-not (Test-Path $DemoSmoke)) {
        Write-Step 'FAIL' "Demo smoke script missing: $DemoSmoke" 'Red'
        return $false
    }
    if ($DryRun) {
        Write-Step 'DRY' "skipping smoke run (dry-run)" 'Yellow'
    } else {
        $smoke = & pwsh -NoProfile -File $DemoSmoke 2>&1 | Out-String
        if ($smoke -match '\[demo\] READY') {
            Write-Step 'OK' "demo smoke green — all 10 steps" 'Green'
        } else {
            Write-Step 'FAIL' "demo smoke not green; abort recording" 'Red'
            $ok = $false
        }
    }

    # 2. Dashboard reachable
    $code = Probe-Http "$DashboardUrl/mission-control"
    if ($code -eq 200) {
        Write-Step 'OK' "dashboard /mission-control = 200" 'Green'
    } else {
        Write-Step 'FAIL' "dashboard returned $code (expected 200)" 'Red'
        $ok = $false
    }

    # 3. OBS process check (best-effort)
    $obs = Get-Process -Name 'obs64','obs32' -ErrorAction SilentlyContinue
    if ($obs) {
        Write-Step 'OK' "OBS Studio running (pid $($obs.Id))" 'Green'
    } else {
        Write-Step 'WARN' "OBS Studio NOT detected — launch it manually before pressing record" 'Yellow'
    }

    # 4. Recording directory ready
    if (-not $DryRun) {
        if (-not (Test-Path $RecordingDir)) {
            New-Item -ItemType Directory -Force -Path $RecordingDir | Out-Null
            Write-Step 'OK' "created $RecordingDir" 'Green'
        } else {
            Write-Step 'OK' "$RecordingDir exists" 'Green'
        }
        if (-not (Test-Path $RawDir)) {
            New-Item -ItemType Directory -Force -Path $RawDir | Out-Null
        }
    } else {
        Write-Step 'DRY' "would create $RecordingDir" 'Yellow'
    }

    # 5. Free disk space (need ≥ 2GB for raw + edits)
    $drive = (Get-Item $RepoRoot).PSDrive
    $freeGb = [math]::Round($drive.Free / 1GB, 2)
    if ($freeGb -ge 2) {
        Write-Step 'OK' "free disk: ${freeGb}GB on $($drive.Name):" 'Green'
    } else {
        Write-Step 'WARN' "free disk: only ${freeGb}GB on $($drive.Name): — may not fit raw capture" 'Yellow'
    }

    Write-Host ""
    if ($ok) {
        Write-Host "Pre-flight: READY" -ForegroundColor Green
    } else {
        Write-Host "Pre-flight: NOT READY — fix the FAILs above" -ForegroundColor Red
    }
    return $ok
}

# ── Narration display ─────────────────────────────────────────────────

function Show-Narration {
    Write-Host ""
    Write-Host "Narration cheat-sheet (10 steps)" -ForegroundColor Cyan
    Write-Host "================================"
    Write-Host ""
    Write-Host "  OPENER: 'This is the Starlight Intelligence System v0.1." -ForegroundColor White
    Write-Host "          I'm going to show you the substrate — agents, decisions," -ForegroundColor White
    Write-Host "          vault loop, council — in one continuous run." -ForegroundColor White
    Write-Host "          No edits. No reshoots.'" -ForegroundColor White
    Write-Host ""
    $narration = @(
        @(1, 'Mission Control. Every agent, every decision, every pending review — one window.'),
        @(2, 'I ask the substrate to scaffold a Council module. Watch the ledger.'),
        @(3, 'There it is — title, mission, risk level, allowed tools, forbidden actions. Audit-grade from the first keystroke.'),
        @(4, 'Append-only JSONL. The substrate doesn''t trust agents; it makes them prove every move.'),
        @(5, 'Decisions cite the work packet that produced them. The graph stitches itself.'),
        @(6, 'And here''s the graph — every decision lights up the brain.'),
        @(7, 'Seven archetypes pressure-test every non-trivial move. Elder Father. Elder Mother. Sage. Builder Elder. Shadow Witness. Divine Neutral. Future Self at ninety.'),
        @(8, 'Desire, intention, action, reflection, wisdom. Every work packet enters at Desire and earns its way up.'),
        @(9, 'Capabilities ship as packs. Install. Pin. Audit. The substrate stays slim; the surface area grows by composition.'),
        @(10, 'Claude Code, Codex, Gemini, OpenCode, Arcanea, ACOS — the substrate is the connective tissue. OpenClaw is next.')
    )
    foreach ($pair in $narration) {
        Write-Host ("  Step {0,2}: {1}" -f $pair[0], $pair[1]) -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "  CLOSER: 'Every artifact you just saw carries a SIP attestation block." -ForegroundColor White
    Write-Host "          The substrate is open. The protocol is sovereign." -ForegroundColor White
    Write-Host "          Fork it at starlightintelligence.org.'" -ForegroundColor White
    Write-Host ""
}

# ── Verify ────────────────────────────────────────────────────────────

function Invoke-Verify {
    Write-Host ""
    Write-Host "Post-capture verify" -ForegroundColor Cyan
    Write-Host "==================="

    # Find any new MP4 in _raw or RecordingDir
    $candidates = @()
    foreach ($dir in @($RawDir, $RecordingDir)) {
        if (Test-Path $dir) {
            $candidates += Get-ChildItem -Path $dir -Filter '*.mp4' -File -ErrorAction SilentlyContinue
            $candidates += Get-ChildItem -Path $dir -Filter '*.mkv' -File -ErrorAction SilentlyContinue
        }
    }
    if ($candidates.Count -eq 0) {
        Write-Step 'FAIL' "no MP4/MKV found in $RawDir or $RecordingDir" 'Red'
        Write-Step 'HINT' "drop your OBS capture into $RawDir and re-run -Verify" 'Yellow'
        return $false
    }

    # Sort newest first
    $newest = $candidates | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Write-Step 'OK' "found capture: $($newest.Name) ($([math]::Round($newest.Length / 1MB, 1)) MB)" 'Green'

    # Compute hash
    Write-Step '...' "computing SHA-256 (large files may take ~10s)" 'DarkGray'
    $sha = Compute-Sha256 $newest.FullName
    Write-Step 'OK' "sha256: $sha" 'Green'

    # Move to canonical path
    $canonicalName = "01-full-demo.mp4"
    $canonicalPath = Join-Path $RecordingDir $canonicalName
    if ($newest.FullName -ne $canonicalPath) {
        if ($DryRun) {
            Write-Step 'DRY' "would move $($newest.Name) → $canonicalPath" 'Yellow'
        } else {
            Move-Item -Force -Path $newest.FullName -Destination $canonicalPath
            Write-Step 'OK' "moved to $canonicalPath" 'Green'
        }
    }

    # Probe duration via ffprobe if available
    $duration = 0
    $ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
    if ($ffprobe) {
        $probePath = if ($DryRun) { $newest.FullName } else { $canonicalPath }
        try {
            $dur = & ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $probePath 2>$null
            if ($dur) { $duration = [int][math]::Round([double]$dur) }
            Write-Step 'OK' "duration: ${duration}s" 'Green'
        } catch {
            Write-Step 'WARN' "ffprobe failed to read duration" 'Yellow'
        }
    } else {
        Write-Step 'WARN' "ffprobe not installed — duration omitted from attestation" 'Yellow'
    }

    # Write attestation sidecar
    $attestation = [ordered]@{
        artifact     = $RecordingTag
        type         = 'demo-recording'
        files        = @(
            [ordered]@{
                name         = $canonicalName
                sha256       = $sha
                duration_sec = $duration
                size_bytes   = $newest.Length
            }
        )
        substrate    = 'starlightintelligence.org/protocol'
        sip_version  = '1.1.1'
        sis_version  = 'v0.1'
        layers_used  = @('file-contract', 'attestation', 'council', 'vault-loop', 'mcp-server')
        captured_at  = (Get-Date).ToUniversalTime().ToString('o')
        captured_by  = 'frank'
        license      = 'MIT (code surfaces shown) + CC-BY-4.0 (recording itself)'
    }
    $attestationPath = Join-Path $RecordingDir 'attestation.json'
    if ($DryRun) {
        Write-Step 'DRY' "would write $attestationPath" 'Yellow'
        ($attestation | ConvertTo-Json -Depth 6) | Write-Host
    } else {
        ($attestation | ConvertTo-Json -Depth 6) | Set-Content -Path $attestationPath -Encoding UTF8
        Write-Step 'OK' "attestation.json written" 'Green'
    }

    # Seed narration-script.md + distribution-log.md if absent
    $narrPath = Join-Path $RecordingDir 'narration-script.md'
    if (-not $DryRun -and -not (Test-Path $narrPath)) {
        @"
# Narration script — $RecordingTag

Transcribe what was actually said during the capture. One pass post-recording.

## Opener
(transcribe)

## Per-step
1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

## Closer
(transcribe)

---
Built on SIP — operational tier (demo recording transcript).
"@ | Set-Content -Path $narrPath -Encoding UTF8
        Write-Step 'OK' "narration-script.md seeded" 'Green'
    }

    $distPath = Join-Path $RecordingDir 'distribution-log.md'
    if (-not $DryRun -and -not (Test-Path $distPath)) {
        @"
# Distribution log — $RecordingTag

| Date | Surface | Cut | URL | Response |
|---|---|---|---|---|
| | | | | |

---
Built on SIP — operational tier (recording distribution ledger).
"@ | Set-Content -Path $distPath -Encoding UTF8
        Write-Step 'OK' "distribution-log.md seeded" 'Green'
    }

    Write-Host ""
    Write-Host "Verify: DONE" -ForegroundColor Green
    Write-Host "  artifact: $RecordingDir"
    Write-Host ""
    Write-Host "Next:" -ForegroundColor Cyan
    Write-Host "  1. Edit 02-three-min-cut.mp4 and 03-thirty-sec-hook.mp4 from 01-full-demo.mp4"
    Write-Host "  2. Fill in narration-script.md"
    Write-Host "  3. Push 01-full-demo.mp4 to object storage (R2/S3) and update attestation.json with public URL"
    Write-Host "  4. Re-run this script with -Verify after edits to hash the cuts"
    return $true
}

# ── Main flow ─────────────────────────────────────────────────────────

Write-Host ""
Write-Host "record-demo.ps1 — Friday $RecordingDate" -ForegroundColor Magenta
Write-Host "DryRun: $DryRun · PreflightOnly: $PreflightOnly · Verify: $Verify"

if ($PreflightOnly) {
    $ok = Invoke-Preflight
    if ($ok) { exit 0 } else { exit 1 }
}

if ($Verify) {
    $ok = Invoke-Verify
    if ($ok) { exit 0 } else { exit 1 }
}

# Default flow: pre-flight + narration display + wait + verify hint
$ok = Invoke-Preflight
if (-not $ok) {
    Write-Host ""
    Write-Host "Pre-flight failed. Recording aborted." -ForegroundColor Red
    exit 1
}

Show-Narration

Write-Host "READY TO RECORD" -ForegroundColor Green
Write-Host "==============="
Write-Host ""
Write-Host "  1. Click OBS Studio 'Start Recording' (or hotkey)."
Write-Host "  2. Wait 2 seconds. Speak the opener."
Write-Host "  3. Walk the 10-step path from $RunbookPath."
Write-Host "  4. Speak the closer. Wait 2 seconds. Click 'Stop Recording'."
Write-Host "  5. Drop the resulting MP4/MKV into:"
Write-Host "       $RawDir" -ForegroundColor Yellow
Write-Host "  6. Re-run this script with -Verify:"
Write-Host "       pwsh -NoProfile -File scripts\record-demo.ps1 -Verify" -ForegroundColor Yellow
Write-Host ""
Write-Host "If everything fails: skip the recording, do the live demo. Record solo next week."
exit 0

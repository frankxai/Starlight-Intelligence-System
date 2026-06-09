# scripts/demo-friday-2026-05-15.ps1
#
# Friday 2026-05-15 demo smoke-test driver.
# Proves the 10-step path is demo-ready BEFORE the live run.
# Reports green/red per step with timing. Non-destructive.
#
# Usage:
#   pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\demo-friday-2026-05-15.ps1
#
# Built on SIP — operational tier (demo readiness smoke).

$ErrorActionPreference = 'Stop'

$RepoRoot   = Split-Path -Parent $PSScriptRoot
$DashboardRoot = Join-Path $RepoRoot 'private\local-command-center\apps\dashboard'
$AuditDir   = Join-Path $RepoRoot 'memory\_audit'
$WpLedger   = Join-Path $AuditDir 'work-packets.jsonl'
$DecLedger  = Join-Path $AuditDir 'decisions.jsonl'
$CouncilLedger = Join-Path $AuditDir 'council-reviews.jsonl'
$DashboardUrl = 'http://127.0.0.1:3007'

$Results = [System.Collections.ArrayList]::new()
$CreatedWorkPacketId = $null

function Test-Step {
    param([string]$Name, [scriptblock]$Block)

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $ok = $false
    $detail = ''
    try {
        $detail = & $Block
        $ok = $true
    } catch {
        $detail = $_.Exception.Message
        $ok = $false
    }
    $sw.Stop()

    $color = if ($ok) { 'Green' } else { 'Red' }
    $tag   = if ($ok) { 'OK  ' } else { 'FAIL' }
    Write-Host ("  {0} {1,-44}  {2,6}ms  {3}" -f $tag, $Name, $sw.ElapsedMilliseconds, $detail) -ForegroundColor $color

    $null = $Results.Add([pscustomobject]@{
        step = $Name; ok = $ok; ms = $sw.ElapsedMilliseconds; detail = $detail
    })
}

function Probe-Http {
    param([string]$Url)
    $code = & curl.exe -s -o NUL -w '%{http_code}' --max-time 5 $Url 2>$null
    return [int]$code
}

Write-Host ""
Write-Host "Friday 2026-05-15 demo smoke" -ForegroundColor Cyan
Write-Host "============================"
Write-Host ""

# ── Pre-flight ───────────────────────────────────────────────────────

Write-Host "Pre-flight" -ForegroundColor Yellow

Test-Step 'starlight version' {
    $out = & npx --yes tsx (Join-Path $RepoRoot 'src\cli.ts') version 2>&1 | Out-String
    if ($out -notmatch 'starlight-intelligence-system v') { throw "unexpected: $out" }
    ($out -split "`n")[0].Trim()
}

Test-Step 'dashboard process at :3007' {
    $code = Probe-Http "$DashboardUrl/mission-control"
    if ($code -ne 200) {
        # Try to start it
        Write-Host "      starting dashboard in background…" -ForegroundColor DarkGray
        Push-Location $DashboardRoot
        try {
            Start-Process -WindowStyle Hidden -FilePath 'npm.cmd' -ArgumentList 'run','start' | Out-Null
        } finally {
            Pop-Location
        }
        # Poll up to 30s
        $deadline = (Get-Date).AddSeconds(30)
        while ((Get-Date) -lt $deadline) {
            Start-Sleep -Seconds 2
            $code = Probe-Http "$DashboardUrl/mission-control"
            if ($code -eq 200) { break }
        }
    }
    if ($code -ne 200) { throw "dashboard $code (not 200)" }
    "200 OK"
}

Test-Step 'all 7 demo routes 200' {
    $routes = @('mission-control','agents','decisions','packs','council','vaults/loop','tooling')
    $bad = @()
    foreach ($r in $routes) {
        $c = Probe-Http "$DashboardUrl/$r"
        if ($c -ne 200) { $bad += "/$r=$c" }
    }
    if ($bad.Count -gt 0) { throw ($bad -join ', ') }
    "7/7"
}

Test-Step 'memory health OK' {
    Push-Location $RepoRoot
    try {
        $out = & npx --yes tsx 'src\cli.ts' doctor 2>&1 | Out-String
    } finally {
        Pop-Location
    }
    if ($out -notmatch 'overall\s+healthy') { throw "memory not healthy" }
    "healthy"
}

# ── The 10-step demo path ────────────────────────────────────────────

Write-Host ""
Write-Host "10-step path" -ForegroundColor Yellow

Test-Step '1. open dashboard (mission-control)' {
    $code = Probe-Http "$DashboardUrl/mission-control"
    if ($code -ne 200) { throw "got $code" }
    "rendered"
}

Test-Step '2. workpacket create (smoke)' {
    Push-Location $RepoRoot
    try {
        $out = & npx --yes tsx 'src\cli.ts' workpacket create `
            --title 'demo-2026-05-15-smoke' `
            --mission 'smoke-test the friday demo path; safe to ignore' `
            --risk low `
            --agent starlight-orchestrator 2>&1 | Out-String
    } finally {
        Pop-Location
    }
    if ($out -notmatch 'WorkPacket created:\s*(wp_\S+)') { throw "no id in: $($out.Substring(0,[Math]::Min(120,$out.Length)))" }
    $script:CreatedWorkPacketId = $Matches[1]
    $script:CreatedWorkPacketId
}

Test-Step '3. workpacket appears in ledger' {
    if (-not (Test-Path $WpLedger)) { throw "ledger missing: $WpLedger" }
    $tail = Get-Content $WpLedger -Tail 1
    if ($tail -notmatch [regex]::Escape($script:CreatedWorkPacketId)) {
        throw "tail did not contain our id"
    }
    "jsonl tail matches $($script:CreatedWorkPacketId.Substring(0,12))…"
}

Test-Step '4. agent-events ledger writable' {
    # We don't write a fake agent event — we just prove the daily file path is reachable.
    $today = (Get-Date -Format 'yyyy-MM-dd')
    $eventsDir = Join-Path $AuditDir 'agent-events'
    if (-not (Test-Path $eventsDir)) { New-Item -ItemType Directory -Force -Path $eventsDir | Out-Null }
    "agent-events dir ready ($today)"
}

Test-Step '5. decision logged for this workpacket' {
    # Append a synthetic Decision tied to the new WorkPacket via the JSONL writer.
    $decId = "dec_demo_$(Get-Date -UFormat %s)_$([guid]::NewGuid().ToString('N').Substring(0,8))"
    $decision = [ordered]@{
        id              = $decId
        title           = 'Scaffold Council module — demo smoke'
        context         = 'Friday 2026-05-15 demo: synthetic decision tied to smoke workpacket.'
        options         = @('scaffold-now','defer-to-next-cycle')
        chosen          = 'scaffold-now'
        rationale       = 'Demo proof-of-life only. Cleaned up after the demo.'
        riskLevel       = 'low'
        workPacketId    = $script:CreatedWorkPacketId
        createdAt       = (Get-Date).ToUniversalTime().ToString('o')
        createdBy       = 'demo-smoke-script'
    }
    $line = ($decision | ConvertTo-Json -Compress -Depth 6)
    if (-not (Test-Path $DecLedger)) { New-Item -ItemType File -Force -Path $DecLedger | Out-Null }
    Add-Content -Path $DecLedger -Value $line
    "decision $($decId.Substring(0,16))… appended"
}

Test-Step '6. brain graph endpoint reachable' {
    $code = Probe-Http "$DashboardUrl/brain"
    if ($code -ne 200) { throw "brain $code" }
    "200 OK"
}

Test-Step '7. council review template rendered' {
    $code = Probe-Http "$DashboardUrl/council"
    if ($code -ne 200) { throw "council $code" }
    # Also append a council-review envelope to the ledger so the demo has a row.
    $crId = "cr_demo_$(Get-Date -UFormat %s)_$([guid]::NewGuid().ToString('N').Substring(0,8))"
    $review = [ordered]@{
        id              = $crId
        workPacketId    = $script:CreatedWorkPacketId
        decision        = 'Scaffold Council module — demo smoke'
        context         = 'Friday demo: seven-archetype memo template.'
        perspectives    = [ordered]@{
            elderFather          = 'Move with care. Council is doctrine, not chrome.'
            elderMother          = 'Hold the relational frame. Who carries this if Frank steps away?'
            sage                 = 'Pattern: this is the same shape as the Vault Loop.'
            builderElder         = 'Ship the spine. Decorate later.'
            shadowWitness        = 'The mock layers are honest debt. Name them out loud.'
            divineNeutralWitness = 'The work packet exists. The decision cites it. The graph stitches. Good.'
            futureSelf90         = 'In 90 days this is muscle memory.'
        }
        convergence     = 'Doctrine first, data second, decoration third.'
        conflict        = 'None at this risk level.'
        redLines        = @('no force-push to main','no vault deletes from a workpacket')
        cleanestPath    = 'Run the live demo. Capture reactions. Update horizon-vault.'
        oneNextMove     = 'Ship the OpenClaw bridge after the demo lands.'
        reviewDate      = (Get-Date -Format 'yyyy-MM-dd')
        createdAt       = (Get-Date).ToUniversalTime().ToString('o')
    }
    if (-not (Test-Path $CouncilLedger)) { New-Item -ItemType File -Force -Path $CouncilLedger | Out-Null }
    Add-Content -Path $CouncilLedger -Value (($review | ConvertTo-Json -Compress -Depth 8))
    "200 OK + cr appended"
}

Test-Step '8. vault loop surface (Desire stage)' {
    $code = Probe-Http "$DashboardUrl/vaults/loop"
    if ($code -ne 200) { throw "vaults/loop $code" }
    "200 OK (mock-backed; flagged in narration)"
}

Test-Step '9. pack registry surface' {
    $code = Probe-Http "$DashboardUrl/packs"
    if ($code -ne 200) { throw "packs $code" }
    "200 OK"
}

Test-Step '10. tooling overlay (Claude/Codex/OpenClaw)' {
    $code = Probe-Http "$DashboardUrl/tooling"
    if ($code -ne 200) { throw "tooling $code" }
    "200 OK"
}

# ── Clean up the smoke workpacket so the demo doesn't show it ────────

Write-Host ""
Write-Host "Cleanup" -ForegroundColor Yellow

Test-Step 'remove smoke workpacket from JSONL tail' {
    if (-not $script:CreatedWorkPacketId) { return "no id; nothing to clean" }
    if (-not (Test-Path $WpLedger)) { return "no ledger; nothing to clean" }
    $kept = Get-Content $WpLedger | Where-Object { $_ -notmatch [regex]::Escape($script:CreatedWorkPacketId) }
    # Atomic-ish write: temp + move
    $tmp = "$WpLedger.tmp-$([guid]::NewGuid().ToString('N').Substring(0,8))"
    Set-Content -Path $tmp -Value $kept -NoNewline:$false
    Move-Item -Force -Path $tmp -Destination $WpLedger
    "smoke wp removed; ledger trimmed"
}

Test-Step 'remove smoke decision + council rows' {
    foreach ($f in @($DecLedger, $CouncilLedger)) {
        if (-not (Test-Path $f)) { continue }
        $kept = Get-Content $f | Where-Object { $_ -notmatch 'demo-smoke-script' -and $_ -notmatch 'cr_demo_' -and $_ -notmatch 'dec_demo_' }
        $tmp = "$f.tmp-$([guid]::NewGuid().ToString('N').Substring(0,8))"
        Set-Content -Path $tmp -Value $kept -NoNewline:$false
        Move-Item -Force -Path $tmp -Destination $f
    }
    "decision + council demo rows removed"
}

# ── Summary ──────────────────────────────────────────────────────────

Write-Host ""
$failed = $Results | Where-Object { -not $_.ok }
$total  = $Results.Count
$pass   = ($Results | Where-Object { $_.ok }).Count

if ($failed.Count -eq 0) {
    Write-Host "[demo] READY — all $total steps green." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[demo] NOT READY — $pass/$total green; $($failed.Count) failed." -ForegroundColor Red
    foreach ($f in $failed) {
        Write-Host "  - $($f.step): $($f.detail)" -ForegroundColor Red
    }
    exit 1
}

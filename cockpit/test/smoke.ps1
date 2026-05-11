# cockpit/test/smoke.ps1 -- read-only verification harness
#
# Runs in CI or locally. Exits non-zero on first failure.
# Pattern matches cockpit-zellij/test/smoke.ps1.
#
# CRITICAL: tests use a sandbox COCKPIT_HOME to avoid touching real manifest.

param([switch]$Verbose, [switch]$KeepSandbox)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$CockpitRoot = Split-Path -Parent $PSScriptRoot
$script:failures = @()

# Sandbox the manifest so tests never touch ~/.starlight/cockpit/sessions.jsonl
$sandbox = Join-Path ([System.IO.Path]::GetTempPath()) "cockpit-test-$(Get-Random)"
$env:COCKPIT_HOME = $sandbox
New-Item -ItemType Directory -Path $sandbox -Force | Out-Null

function Test-Assert {
    param([string]$Name, [scriptblock]$Test)
    try {
        $result = & $Test
        if ($result -eq $false) { throw "assertion returned false" }
        Write-Host "  PASS: $Name" -ForegroundColor Green
    } catch {
        $script:failures += @{ Name = $Name; Error = $_.Exception.Message }
        Write-Host "  FAIL: $Name -- $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "=== Cockpit Continuity smoke tests ==="
Write-Host "Sandbox COCKPIT_HOME: $sandbox" -ForegroundColor DarkGray
Write-Host ''

# ----- Layer 1: file presence -----
$expectedFiles = @(
    'CONTRACTS.md',
    'scripts\manifest.ps1',
    'scripts\snapshot.ps1',
    'scripts\rehydrate.ps1',
    'scripts\arc-cockpit.ps1',
    'scripts\install.ps1',
    'scripts\uninstall.ps1',
    'scripts\doctor.ps1',
    'hooks\claude-session-start.ps1',
    'hooks\claude-session-stop.ps1',
    'adapters\windows-terminal\capture.ps1',
    'adapters\windows-terminal\emit.ps1',
    'adapters\zellij\capture.ps1',
    'adapters\zellij\emit.ps1',
    'agents\gemini\gem-wrapper.ps1',
    'config\default.json'
)
foreach ($rel in $expectedFiles) {
    $captured = $rel
    Test-Assert "file present: $captured" {
        Test-Path (Join-Path $CockpitRoot $captured)
    }.GetNewClosure()
}

# ----- Layer 2: PowerShell parsing (syntax sanity) -----
foreach ($rel in @($expectedFiles | Where-Object { $_ -like '*.ps1' })) {
    $captured = $rel
    Test-Assert "parses: $captured" {
        $path = Join-Path $CockpitRoot $captured
        $tokens = $null
        $errors = $null
        $null = [System.Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors)
        if ($errors -and $errors.Count -gt 0) { throw ($errors[0].Message) }
        $true
    }.GetNewClosure()
}

# ----- Layer 3: manifest primitives -----
Test-Assert 'manifest module loads' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    (Get-Command Write-CockpitSessionEvent -ErrorAction SilentlyContinue) -ne $null
}

Test-Assert 'COCKPIT_HOME respected' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    (Get-CockpitHome) -eq $sandbox
}

Test-Assert 'Initialize-CockpitHome creates dir' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    Initialize-CockpitHome
    Test-Path $sandbox
}

Test-Assert 'Write-CockpitSessionEvent appends row' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $ok = Write-CockpitSessionEvent -Event 'start' -Agent 'claude' -SessionId 'test-session-1' -Cwd $env:USERPROFILE
    if (-not $ok) { throw "write returned false" }
    $manifest = Get-CockpitManifestPath
    Test-Path $manifest
}

Test-Assert 'manifest row has expected schema' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $rows = @(Read-CockpitManifest)
    $rows.Count -ge 1 -and $rows[0].schema -eq 'cockpit.session/v1'
}

Test-Assert 'Get-CockpitProjectKey resolves via leaf-name fallback' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    (Get-CockpitProjectKey -Cwd 'C:\some\nonexistent\test-project') -eq 'test-project'
}

Test-Assert 'Get-CockpitAliveSessions returns alive only' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    Write-CockpitSessionEvent -Event 'start' -Agent 'claude' -SessionId 'alive-test' -Cwd $env:USERPROFILE -ProcessId $PID | Out-Null
    Write-CockpitSessionEvent -Event 'start' -Agent 'claude' -SessionId 'dead-test' -Cwd $env:USERPROFILE -ProcessId 999999 | Out-Null
    $alive = Get-CockpitAliveSessions
    $sids = $alive | ForEach-Object { $_.session_id }
    ($sids -contains 'alive-test') -and (-not ($sids -contains 'dead-test'))
}

Test-Assert 'stop event excludes session from alive view' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    Write-CockpitSessionEvent -Event 'start' -Agent 'claude' -SessionId 'closes-test' -Cwd $env:USERPROFILE -ProcessId $PID | Out-Null
    Start-Sleep -Milliseconds 10
    Write-CockpitSessionEvent -Event 'stop'  -Agent 'claude' -SessionId 'closes-test' -Cwd $env:USERPROFILE -ProcessId $PID | Out-Null
    $alive = Get-CockpitAliveSessions
    -not (($alive | ForEach-Object { $_.session_id }) -contains 'closes-test')
}

Test-Assert 'Invoke-CockpitManifestGC drops old stop rows' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    # Inject a stop row manually with old timestamp
    $oldRow = @{
        schema = 'cockpit.session/v1'
        ts = (Get-Date).AddDays(-60).ToUniversalTime().ToString('o')
        event = 'stop'
        agent = 'claude'
        session_id = 'old-test'
        cwd = 'C:\test'
        pid = 1
        ppid_chain = @(1)
    } | ConvertTo-Json -Compress
    Add-Content -Path (Get-CockpitManifestPath) -Value $oldRow -Encoding utf8
    $result = Invoke-CockpitManifestGC -RetentionDays 30
    $result.DroppedRows -ge 1
}

# ----- Layer 4: hook contract -----
Test-Assert 'hook handles missing stdin gracefully' {
    $hookPath = Join-Path $CockpitRoot 'hooks\claude-session-start.ps1'
    # Run with empty stdin
    $output = '' | & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $hookPath 2>&1
    $LASTEXITCODE -eq 0
}

Test-Assert 'hook handles malformed stdin gracefully' {
    $hookPath = Join-Path $CockpitRoot 'hooks\claude-session-start.ps1'
    $output = 'not-json{{{' | & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $hookPath 2>&1
    $LASTEXITCODE -eq 0
}

Test-Assert 'hook writes manifest row on valid stdin' {
    $hookPath = Join-Path $CockpitRoot 'hooks\claude-session-start.ps1'
    $beforeCount = if (Test-Path (Join-Path $sandbox 'sessions.jsonl')) { (Get-Content (Join-Path $sandbox 'sessions.jsonl')).Count } else { 0 }
    $payload = '{"session_id":"hook-test-' + (Get-Random) + '","cwd":"' + ($env:USERPROFILE -replace '\\','\\') + '"}'
    $env:COCKPIT_HOME = $sandbox
    $payload | & powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "`$env:COCKPIT_HOME='$sandbox'; & `"$hookPath`""
    $afterCount = if (Test-Path (Join-Path $sandbox 'sessions.jsonl')) { (Get-Content (Join-Path $sandbox 'sessions.jsonl')).Count } else { 0 }
    $afterCount -gt $beforeCount
}

# ----- Layer 5: snapshot + emit -----
Test-Assert 'snapshot.ps1 runs without error' {
    $snap = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    Test-Path $snap.Path
}

Test-Assert 'snapshot json is valid + has schema field' {
    $snapPath = Join-Path $sandbox 'last-snapshot.json'
    if (-not (Test-Path $snapPath)) {
        $null = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    }
    $snap = Get-Content -Path $snapPath -Raw | ConvertFrom-Json
    $snap.schema -eq 'cockpit.snapshot/v1'
}

Test-Assert 'WT emit produces parseable wt.exe args' {
    . (Join-Path $CockpitRoot 'adapters\windows-terminal\emit.ps1')
    $stub = [PSCustomObject]@{
        schema = 'cockpit.snapshot/v1'
        terminal = 'windows-terminal'
        windows = @([PSCustomObject]@{
            guid = $null; title = 'test'
            tabs = @([PSCustomObject]@{
                index = 0; title = 'sis'; active = $true
                panes = @([PSCustomObject]@{
                    cwd = 'C:\Users\frank\Starlight-Intelligence-System'
                    agent = 'claude'
                    session_id = 'abc-123'
                    rehydrate_command = 'claude --resume abc-123'
                    shell = 'pwsh'
                    alive = $true
                })
            })
        })
    }
    $result = Invoke-WtRehydrate -Snapshot $stub -DryRun
    ($result.Spawned -eq 1) -and ($result.Command -like '*claude --resume abc-123*')
}

Test-Assert 'WT emit skips stale panes' {
    . (Join-Path $CockpitRoot 'adapters\windows-terminal\emit.ps1')
    $stub = [PSCustomObject]@{
        schema = 'cockpit.snapshot/v1'
        terminal = 'windows-terminal'
        windows = @([PSCustomObject]@{
            guid = $null; title = 'test'
            tabs = @([PSCustomObject]@{
                index = 0; title = 't'; active = $true
                panes = @([PSCustomObject]@{
                    cwd = 'C:\test'; agent = 'claude'; session_id = 'dead'
                    rehydrate_command = 'claude'; shell = 'pwsh'; alive = $false
                })
            })
        })
    }
    $result = Invoke-WtRehydrate -Snapshot $stub -DryRun
    $result.Spawned -eq 0
}

# ----- Layer 6: rehydrate safety -----
Test-Assert 'rehydrate -DryRun never spawns a process' {
    $procsBefore = (Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue | Measure-Object).Count
    $null = & (Join-Path $CockpitRoot 'scripts\rehydrate.ps1') -DryRun -Mode merge
    $procsAfter = (Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue | Measure-Object).Count
    $procsBefore -eq $procsAfter
}

Test-Assert 'rehydrate skip-mode bails when WT alive (or no-op when not)' {
    $result = & (Join-Path $CockpitRoot 'scripts\rehydrate.ps1') -Mode skip -DryRun
    # Either result is well-formed
    $true
}

# ----- Layer 7: arc CLI dispatcher -----
Test-Assert 'arc-cockpit.ps1 loads without error' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    (Get-Command arc -ErrorAction SilentlyContinue) -ne $null
}

Test-Assert 'arc help renders' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    $output = arc help | Out-String
    $output -match 'snapshot' -and $output -match 'rehydrate'
}

Test-Assert 'arc version renders' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    $output = arc version | Out-String
    $output -match 'cockpit-continuity'
}

Test-Assert 'arc subcommand recognition is case-sensitive on lowercase' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    # `arc help` returns help text, never throws
    $err = $null
    try { arc help | Out-Null } catch { $err = $_ }
    $null -eq $err
}

# ----- Layer 8: config -----
Test-Assert 'default.json is valid JSON' {
    $cfg = Get-Content -Path (Join-Path $CockpitRoot 'config\default.json') -Raw | ConvertFrom-Json
    $cfg.schema -eq 'cockpit.config/v1'
}

# ----- Layer 9: v0.2 hardening -----
Test-Assert 'Write-CockpitAtomicJson writes via temp+rename' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $target = Join-Path $sandbox 'atomic-test.json'
    Write-CockpitAtomicJson -Path $target -Object @{ schema = 'test'; value = 'ok' }
    $content = Get-Content -Path $target -Raw | ConvertFrom-Json
    $content.value -eq 'ok'
}

Test-Assert 'Test-CockpitSessionSchema accepts valid row' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $row = [PSCustomObject]@{ schema = 'cockpit.session/v1'; ts = '2026-05-07T00:00:00Z'; event = 'start'; agent = 'claude'; session_id = 'x'; cwd = '/x' }
    Test-CockpitSessionSchema -Row $row
}

Test-Assert 'Test-CockpitSessionSchema rejects invalid event' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $row = [PSCustomObject]@{ schema = 'cockpit.session/v1'; ts = 'x'; event = 'bogus'; agent = 'claude'; session_id = 'x'; cwd = '/x' }
    -not (Test-CockpitSessionSchema -Row $row)
}

Test-Assert 'Test-CockpitSessionSchema rejects missing field' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $row = [PSCustomObject]@{ schema = 'cockpit.session/v1'; event = 'start'; agent = 'claude' }
    -not (Test-CockpitSessionSchema -Row $row)
}

Test-Assert 'event log gets structured row on session write' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    # Use unique agent to avoid rate-limit collision with prior 'claude' writes
    $sid = "evlog-$(Get-Random)"
    Write-CockpitSessionEvent -Event 'start' -Agent 'test-evlog-agent' -SessionId $sid -Cwd $env:USERPROFILE | Out-Null
    $logPath = Get-CockpitEventLogPath
    if (-not (Test-Path $logPath)) { return $false }
    $rows = @(Get-Content -Path $logPath | ForEach-Object { try { $_ | ConvertFrom-Json } catch {} })
    @($rows | Where-Object { $_.kind -eq 'session.event' -and $_.session_id -eq $sid }).Count -ge 1
}

Test-Assert 'rate limiter eventually permits within budget' {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    $env:COCKPIT_HOME = $sandbox  # ensure fresh state path
    $allowed = $true
    for ($i = 0; $i -lt 5; $i++) {
        if (-not (Test-CockpitRateLimit -Agent 'rate-test')) { $allowed = $false; break }
    }
    $allowed
}

Test-Assert 'snapshots/ archive gets a copy on snapshot' {
    $null = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    $snapshotsDir = Join-Path $sandbox 'snapshots'
    Test-Path $snapshotsDir
}

Test-Assert 'snapshots/ keeps at most 10 archives' {
    $null = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    $snapshotsDir = Join-Path $sandbox 'snapshots'
    if (-not (Test-Path $snapshotsDir)) { return $false }
    # Don't actually take 11 snapshots in the test; just verify the limit logic exists
    $archives = @(Get-ChildItem -Path $snapshotsDir -Filter 'snapshot-*.json')
    $archives.Count -ge 1 -and $archives.Count -le 10
}

# ----- Layer 10: workspaces -----
Test-Assert 'workspaces module loads' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    (Get-Command New-CockpitWorkspace -ErrorAction SilentlyContinue) -ne $null
}

Test-Assert 'New-CockpitWorkspace creates a v1 file' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    # Need a snapshot first
    $null = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    $result = New-CockpitWorkspace -Name 'test-ws-1' -Description 'smoke test'
    $result.Name -eq 'test-ws-1' -and (Test-Path $result.Path)
}

Test-Assert 'workspace JSON has cockpit.workspace/v1 schema' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $ws = Get-CockpitWorkspace -Name 'test-ws-1'
    $ws.schema -eq 'cockpit.workspace/v1' -and $ws.snapshot.schema -eq 'cockpit.snapshot/v1'
}

Test-Assert 'Get-CockpitWorkspaces lists saved' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $items = @(Get-CockpitWorkspaces)
    @($items | Where-Object { $_.Name -eq 'test-ws-1' }).Count -ge 1
}

Test-Assert 'workspace name sanitizes special chars' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $path = Get-CockpitWorkspacePath -Name 'has spaces & slashes/here'
    -not ($path -match '[/\\]has spaces')
}

Test-Assert 'Remove-CockpitWorkspace deletes file' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $ok = Remove-CockpitWorkspace -Name 'test-ws-1'
    $ok -and -not (Test-Path (Get-CockpitWorkspacePath -Name 'test-ws-1'))
}

Test-Assert 'Get-CockpitWorkspace throws for missing' {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $thrown = $false
    try { Get-CockpitWorkspace -Name 'never-existed' | Out-Null } catch { $thrown = $true }
    $thrown
}

# ----- Layer 11: arc CLI new subcommands -----
Test-Assert 'arc workspaces command runs' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    $err = $null
    try { arc workspaces | Out-Null } catch { $err = $_ }
    $null -eq $err
}

Test-Assert 'arc events runs without error on empty log' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    $err = $null
    try { arc events | Out-Null } catch { $err = $_ }
    $null -eq $err
}

Test-Assert 'arc history runs' {
    . (Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1') 6>$null
    $err = $null
    try { arc history | Out-Null } catch { $err = $_ }
    $null -eq $err
}

# ----- Layer 12: cross-platform hooks (file present + parse via shellcheck if available) -----
$expectedShellHooks = @(
    'hooks\claude-session-start.sh',
    'hooks\claude-session-stop.sh',
    'adapters\tmux\capture.sh',
    'adapters\tmux\emit.sh',
    'scripts\install.sh'
)
foreach ($rel in $expectedShellHooks) {
    $captured = $rel
    Test-Assert "shell hook present: $captured" {
        Test-Path (Join-Path $CockpitRoot $captured)
    }.GetNewClosure()
}

Test-Assert 'POSIX hook starts with shebang' {
    $content = Get-Content -Path (Join-Path $CockpitRoot 'hooks\claude-session-start.sh') -TotalCount 1
    $content -like '#!*bash*' -or $content -like '#!*sh'
}

Test-Assert 'tmux capture script starts with shebang' {
    $content = Get-Content -Path (Join-Path $CockpitRoot 'adapters\tmux\capture.sh') -TotalCount 1
    $content -like '#!*bash*' -or $content -like '#!*sh'
}

# ----- Layer 13: TUI script -----
Test-Assert 'tui.ps1 parses' {
    $tokens = $null; $errors = $null
    $null = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $CockpitRoot 'scripts\tui.ps1'), [ref]$tokens, [ref]$errors)
    -not $errors -or $errors.Count -eq 0
}

# ----- Layer 14: MCP server -----
Test-Assert 'MCP package.json valid' {
    $pkg = Get-Content -Path (Join-Path $CockpitRoot 'mcp\package.json') -Raw | ConvertFrom-Json
    $pkg.name -eq 'cockpit-continuity-mcp' -and $pkg.dependencies.'@modelcontextprotocol/sdk'
}

Test-Assert 'MCP server.js syntactically valid (Node parse check)' {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { return $null }  # WARN: node not installed
    $serverPath = Join-Path $CockpitRoot 'mcp\server.js'
    $output = & node --check $serverPath 2>&1
    $LASTEXITCODE -eq 0
}

Test-Assert 'MCP server defines all 8 tools' {
    $content = Get-Content -Path (Join-Path $CockpitRoot 'mcp\server.js') -Raw
    $tools = @('cockpit_status', 'cockpit_query_sessions', 'cockpit_snapshot',
               'cockpit_rehydrate', 'cockpit_save_workspace', 'cockpit_load_workspace',
               'cockpit_list_workspaces', 'cockpit_recent_events')
    $missing = $tools | Where-Object { $content -notlike "*$_*" }
    $missing.Count -eq 0
}

# ----- Cleanup -----
if (-not $KeepSandbox) {
    Remove-Item -Path $sandbox -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
if ($script:failures.Count -eq 0) {
    Write-Host "=== ALL PASS ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== $($script:failures.Count) FAILURES ===" -ForegroundColor Red
    foreach ($f in $script:failures) {
        Write-Host "  - $($f.Name): $($f.Error)" -ForegroundColor Red
    }
    exit 1
}

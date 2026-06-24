# hook-doctor.ps1
# Comprehensive doctor for hooks across harnesses (Claude, Grok, Codex, AGY, DeepAgent, Cockpit).
# Run: pwsh -File scripts/hook-doctor.ps1
# Or from any cwd: & "$HOME\starlight\repos\Starlight-Intelligence-System\scripts\hook-doctor.ps1"
#
# Checks registrations, paths, execution (via git-bash/node/pwsh), env detection, common failure modes.
# Produces report + suggested fixes. Always exits 0 for use in pipelines.
#
# Supports -ScanRepos to audit multiple production repos for .claude/.grok hook health.

param(
    [switch]$Fix,          # Attempt light auto-fixes (e.g. ensure env in profile note)
    [switch]$Verbose,
    [switch]$ScanRepos     # Audit all main production repos for hook health
)

$ErrorActionPreference = 'Continue'
$results = @()
function Add-Result($Name, $Status, $Detail) {
    $results += [pscustomobject]@{ Name=$Name; Status=$Status; Detail=$Detail }
    $color = if ($Status -eq 'PASS') { 'Green' } elseif ($Status -eq 'WARN') { 'Yellow' } else { 'Red' }
    Write-Host "[$Status] $Name : $Detail" -ForegroundColor $color
}

Write-Host "=== Starlight Hook Doctor v1 (excellence layer) ===" -ForegroundColor Cyan
Write-Host "Central source: claude-code-config/hooks + .grok excellence + cockpit" -ForegroundColor DarkGray

$hookCentral = "C:\Users\frank\starlight\repos\claude-code-config\hooks"
$grokHooks = "$HOME\.grok\hooks"
$claudeSettings = "$HOME\.claude\settings.json"
$cockpitHooks = "C:\Users\frank\Starlight-Intelligence-System\cockpit\hooks"

# 1. Central files
if (Test-Path $hookCentral) {
    $count = (Get-ChildItem $hookCentral -File -Recurse).Count
    Add-Result "Central hooks dir" "PASS" "$count files (incl lib)"
} else { Add-Result "Central hooks dir" "FAIL" "Missing $hookCentral" }

# 2. Registrations
if (Test-Path $claudeSettings) {
    try {
        $s = Get-Content $claudeSettings -Raw | ConvertFrom-Json
        $events = $s.hooks.PSObject.Properties.Name
        Add-Result "Claude registration" "PASS" "Events: $($events -join ', ')"
    } catch { Add-Result "Claude registration" "FAIL" $_.Exception.Message }
} else { Add-Result "Claude registration" "WARN" "No ~/.claude/settings.json" }

if (Test-Path $grokHooks) {
    $gcount = (Get-ChildItem $grokHooks).Count
    Add-Result "Grok hooks dir" "PASS" "$gcount files (imported + excellence)"
    $exc = Get-ChildItem $grokHooks -Filter "*excellence*.json"
    if ($exc) { Add-Result "Grok excellence gates" "PASS" "Found $($exc.Count)" } else { Add-Result "Grok excellence gates" "WARN" "No excellence json" }
} else { Add-Result "Grok hooks dir" "WARN" "No ~/.grok/hooks" }

# 3. Hook-env portability
$envLib = Join-Path $hookCentral "lib\hook-env.sh"
if (Test-Path $envLib) {
    Add-Result "hook-env.sh" "PASS" "Portable lib present"
    # Quick source test via git bash if avail
    $gb = "C:\Program Files\Git\bin\bash.exe"
    if (Test-Path $gb) {
        $test = & $gb -l -c "cd '$hookCentral'; source lib/hook-env.sh 2>&1; echo HARNESS=${HARNESS:-empty} PROJECT=${PROJECT_NAME:-empty}" 2>&1
        if ($test -match 'HARNESS=') { Add-Result "hook-env detection (gitbash)" "PASS" $test.Trim() } else { Add-Result "hook-env detection" "WARN" "No output" }
    }
} else { Add-Result "hook-env.sh" "FAIL" "Missing lib" }

# 4. Simulate critical hooks (non-destructive)
$gb = "C:\Program Files\Git\bin\bash.exe"
if ( (Test-Path $gb) -and (Test-Path $hookCentral) ) {
    $payload = '{"prompt":"use excellence review and repo-mastery to fix this","cwd":"C:\\Users\\frank\\Starlight-Intelligence-System"}'
    $tests = @('quality-gate.sh','pre-compact.sh','notification.sh')
    foreach ($t in $tests) {
        $p = Join-Path $hookCentral $t
        if (Test-Path $p) {
            $out = & $gb -l -c "cd '$hookCentral'; echo '$payload' | ./$t 2>&1 | head -c 120" 2>&1
            if ($LASTEXITCODE -eq 0) { Add-Result "Exec $t" "PASS" "Ran cleanly" } else { Add-Result "Exec $t" "FAIL" $out }
        }
    }
    # JS one
    $jsP = Join-Path $hookCentral 'skill-activation-prompt.js'
    if (Test-Path $jsP) {
        $jsOut = $payload | node $jsP 2>&1
        if ($LASTEXITCODE -eq 0 -or $jsOut -notmatch 'Error') { Add-Result "Exec skill-activation.js" "PASS" "No crash" } else { Add-Result "Exec skill-activation.js" "WARN" $jsOut }
    }
}

# 5. Cockpit PS1 hooks (PS native)
$startPs = Join-Path $cockpitHooks 'claude-session-start.ps1'
if (Test-Path $startPs) {
    $tmp = New-TemporaryFile
    '{"session_id":"doc-test","cwd":"C:\\test"}' | Set-Content $tmp
    $env:COCKPIT_HOME = "$HOME\.starlight\cockpit"
    Get-Content $tmp | & pwsh -NoProfile -File $startPs 2>&1 | Out-Null
    $code = $LASTEXITCODE
    Remove-Item $tmp -Force
    if ($code -eq 0) { Add-Result "Cockpit PS1 hooks" "PASS" "Executed (exit 0)" } else { Add-Result "Cockpit PS1 hooks" "FAIL" "Exit $code" }
} else { Add-Result "Cockpit PS1 hooks" "WARN" "Not present in this context" }

# 6. Env injection check (from agy-tools launches)
if ($env:GROK_PROJECT_DIR -or $env:CLAUDE_PROJECT_DIR -or $env:CODEX_PROJECT_DIR) {
    Add-Result "Launch env injection" "PASS" "At least one harness PROJECT_DIR set in this session"
} else {
    Add-Result "Launch env injection" "WARN" "Run via cl/gr/da to inject for hooks"
}

# 7. Suggestions
Write-Host "`n=== Recommendations (excellence) ===" -ForegroundColor Cyan
Write-Host "- Source agy-tools.ps1 (or profile) before using cl/gr/da to get env + aliases."
Write-Host "- For Grok excellence: ensure .grok/hooks/*.json are loaded by your Grok TUI (copy to ~/.grok/hooks if needed)."
Write-Host "- Re-run with -Fix to attempt light repairs (future)."
Write-Host "- Full cross-repo: central claude-code-config/hooks is source of truth; others should junction/symlink."
Write-Host "- Test in real harness: clsis or grfx then issue a prompt that should trigger skill-activation (e.g. 'use repo-mastery')."

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$pass = ($results | Where Status -eq 'PASS').Count
$warn = ($results | Where Status -eq 'WARN').Count
$fail = ($results | Where Status -eq 'FAIL').Count
Write-Host "PASS: $pass  WARN: $warn  FAIL: $fail" 
if ($fail -gt 0) { Write-Host "Some hard failures - review above." -ForegroundColor Red } else { Write-Host "Core hooks appear executable. Detection + registrations are the usual culprits." -ForegroundColor Green }

# Optional future: if $Fix, touch files or update profile note.

if ($ScanRepos -or $true) {  # always show in this version for visibility; use switch to gate in future
  Write-Host "`n=== Multi-repo scan (production mains) ===" -ForegroundColor Cyan
  $scanReposList = @('C:\Users\frank\starlight\repos\agentic-creator-os','C:\Users\frank\starlight\repos\FrankX','C:\Users\frank\starlight\repos\arcanea-ecosystem','C:\Users\frank\starlight\repos\second-brain-os','C:\Users\frank\starlight\repos\prompt-library','C:\Users\frank\Starlight-Intelligence-System','C:\Users\frank\starlight\repos\arcanea-ai-app')
  foreach ($r in $scanReposList | Where {Test-Path $_}) {
    Push-Location $r
    $n = Split-Path $r -Leaf
    $hasCH = Test-Path '.claude\hooks\lib\hook-env.sh'
    $hasSR = Test-Path '.claude\skills\skill-rules.json'
    $hasGE = Test-Path '.grok\hooks\pretooluse-excellence.json'
    $status = if ($hasCH -and $hasSR) { 'GOOD' } elseif ($hasCH -or $hasGE) { 'PARTIAL' } else { 'MISSING' }
    Write-Host ("  {0,-25} central-hooks:{1,-5} skill-rules:{2,-5} grok-excellence:{3}  [{4}]" -f $n, $hasCH, $hasSR, $hasGE, $status)
    # Custom hooks note
    $customCount = (Get-ChildItem '.claude\hooks' -Filter '*.sh' -ErrorAction SilentlyContinue | Where Name -notlike '*hook-env*' | Measure-Object).Count
    if ($customCount -gt 5 -and -not $hasCH) {
      Write-Host "    NOTE: Has $customCount custom .sh hooks (may need to source hook-env for portable HARNESS detection)"
    }
    Pop-Location
  }
}

exit 0

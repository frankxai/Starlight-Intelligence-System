# cockpit/hooks/claude-session-start.ps1
#
# Registered as a Claude Code SessionStart hook in ~/.claude/settings.json.
# Reads JSON envelope from stdin, appends a session-start row to the cockpit manifest.
#
# HARD CONTRACT (CONTRACTS.md section 7):
#   - MUST exit 0 within 5000ms regardless of internal failure
#   - MUST NOT block, prompt, or output to stdout (Claude reads stdout for hook results)
#   - All errors -> error log only

$ErrorActionPreference = 'SilentlyContinue'

try {
    $libPath = Join-Path $PSScriptRoot '..\scripts\manifest.ps1'
    . $libPath

    # Read Claude Code hook payload from stdin
    $stdinJson = [Console]::In.ReadToEnd()
    $sessionId = $null
    $cwd = $null

    if ($stdinJson -and $stdinJson.Trim().Length -gt 0) {
        try {
            $payload = $stdinJson | ConvertFrom-Json
            if ($payload.session_id) { $sessionId = [string]$payload.session_id }
            if ($payload.cwd) { $cwd = [string]$payload.cwd }
        } catch {
            Write-CockpitHookError -Source 'claude-session-start' -Message "stdin parse: $($_.Exception.Message)"
        }
    }

    # Fallbacks if hook payload missing fields
    if (-not $sessionId) { $sessionId = "unknown-$(Get-Random)" }
    if (-not $cwd) { $cwd = (Get-Location).Path }

    # Claude's actual PID is our parent (the hook runs as a child process of Claude)
    $hookPid = $PID
    $claudePid = $hookPid
    try {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$hookPid" -ErrorAction Stop
        if ($proc.ParentProcessId -gt 0) { $claudePid = [int]$proc.ParentProcessId }
    } catch {}

    Write-CockpitSessionEvent `
        -Event 'start' `
        -Agent 'claude' `
        -SessionId $sessionId `
        -Cwd $cwd `
        -ProcessId $claudePid | Out-Null

} catch {
    try { Write-CockpitHookError -Source 'claude-session-start' -Message $_.Exception.Message } catch {}
}

# ALWAYS exit 0
exit 0

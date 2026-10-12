# cockpit/hooks/claude-session-stop.ps1
#
# Registered as a Claude Code Stop hook in ~/.claude/settings.json.
# Marks a session as stopped in the cockpit manifest.

$ErrorActionPreference = 'SilentlyContinue'

try {
    $libPath = Join-Path $PSScriptRoot '..\scripts\manifest.ps1'
    . $libPath

    $stdinJson = [Console]::In.ReadToEnd()
    $sessionId = $null
    $cwd = $null

    if ($stdinJson -and $stdinJson.Trim().Length -gt 0) {
        try {
            $payload = $stdinJson | ConvertFrom-Json
            if ($payload.session_id) { $sessionId = [string]$payload.session_id }
            if ($payload.cwd) { $cwd = [string]$payload.cwd }
        } catch {
            Write-CockpitHookError -Source 'claude-session-stop' -Message "stdin parse: $($_.Exception.Message)"
        }
    }

    if (-not $sessionId) { $sessionId = "unknown-$(Get-Random)" }
    if (-not $cwd) { $cwd = (Get-Location).Path }

    # Skip WMI/CIM. Get-CimInstance regularly exceeds the 2s global hook budget on Windows.
    $claudePid = $PID

    Write-CockpitSessionEvent `
        -Event 'stop' `
        -Agent 'claude' `
        -SessionId $sessionId `
        -Cwd $cwd `
        -ProcessId $claudePid | Out-Null

} catch {
    try { Write-CockpitHookError -Source 'claude-session-stop' -Message $_.Exception.Message } catch {}
}

exit 0

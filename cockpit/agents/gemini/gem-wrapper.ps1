# cockpit/agents/gemini/gem-wrapper.ps1
#
# Gemini CLI doesn't auto-persist sessions. This wrapper:
#   1. Derives a deterministic session tag from cwd + WT pane GUID
#   2. Registers the session in cockpit manifest
#   3. Auto-resumes the prior tag on next launch
#   4. Traps Ctrl+C / shell exit to fire `/chat save <tag>` automatically
#
# Source from $PROFILE alongside arc-cockpit.ps1, then use `gem` instead of `gemini`.

. (Join-Path $PSScriptRoot '..\..\scripts\manifest.ps1')

function Get-GeminiSessionTag {
    $wtPart = if ($env:WT_SESSION) { $env:WT_SESSION.Substring(0, [Math]::Min(8, $env:WT_SESSION.Length)) } else { 'no-wt' }
    $cwdPart = (Split-Path -Leaf (Get-Location).Path).ToLower()
    return "cockpit-${cwdPart}-${wtPart}"
}

function gem {
    param(
        [Parameter(ValueFromRemainingArguments=$true)] $RemainingArgs
    )

    $tag = Get-GeminiSessionTag
    $cwd = (Get-Location).Path

    # Register session-start in manifest
    Write-CockpitSessionEvent -Event 'start' -Agent 'gemini' -SessionId $tag -Cwd $cwd | Out-Null

    # Build args. If user passed any args, just pass through. Otherwise try resume.
    $gemArgs = @()
    if ($RemainingArgs -and $RemainingArgs.Count -gt 0) {
        $gemArgs = $RemainingArgs
    }

    try {
        # Best-effort resume: gemini doesn't have a unified resume flag yet, but we surface
        # the tag in stdout so the user can /chat resume <tag> immediately on launch.
        Write-Host "[cockpit] Gemini session tag: $tag" -ForegroundColor DarkCyan
        Write-Host "[cockpit] To resume prior chat: /chat resume $tag" -ForegroundColor DarkCyan
        Write-Host "[cockpit] To save before exit:  /chat save $tag" -ForegroundColor DarkCyan
        Write-Host ''

        & gemini @gemArgs
        $exitCode = $LASTEXITCODE
    } finally {
        # Mark stop in manifest regardless of how gemini exited
        Write-CockpitSessionEvent -Event 'stop' -Agent 'gemini' -SessionId $tag -Cwd $cwd | Out-Null
    }

    return $exitCode
}

if ($env:FRANK_QUIET_PROFILE -ne '1') {
    Write-Host "Cockpit gem wrapper loaded -- use 'gem' instead of 'gemini' for auto-tag" -ForegroundColor Cyan
}

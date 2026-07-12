# Starlight Second Brain - nightly REFLECT + light curation (autonomous).
# Headless Claude writes the reflection (file edits auto-accepted); THIS wrapper does the
# git commit (robust, no in-agent git permissions). Bounded to agent-write zones, reversible.
# Pairs with the 04:00 "StarlightDreaming" task (this runs 02:30). Model: Sonnet 5 (cost).
#
# Register: pwsh -File scripts\sb-reflect-cron.ps1 -Register
# Disable : Unregister-ScheduledTask -TaskName StarlightSBReflect -Confirm:$false
# Run now : pwsh -File scripts\sb-reflect-cron.ps1
param([switch]$Register)

$ErrorActionPreference = 'Stop'
$TaskName = 'StarlightSBReflect'
$Self     = $MyInvocation.MyCommand.Path
$Vault    = 'C:\Users\frank\OneDrive\Dokumente\Vault\Second Brain'

if ($Register) {
    $pwsh = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
    if (-not $pwsh) { $pwsh = (Get-Command powershell).Source }
    $action  = New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Self`""
    $trigger = New-ScheduledTaskTrigger -Daily -At 2:30am
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
    Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | ForEach-Object { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false }
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Nightly Starlight Second Brain REFLECT + light curation (autonomous, git-committed, reversible).' | Out-Null
    Write-Host "[OK] Registered $TaskName (daily 02:30). Disable: Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
    return
}

$Log = Join-Path $Vault '_meta\reflect-cron.log'
Set-Location $Vault

$prompt = @'
You are the nightly Starlight Second Brain REFLECT run (autonomous). Follow the /starlight-sb skill and the vault CLAUDE.md contract. Use only the Read/Glob/Grep and Write/Edit tools - do NOT call git or MCP.
1) REFLECT: read the _meta distilled layer (values.md, psychometrics/big-5.md, authentic-voice-map.md) + patterns/2026-corpus-synthesis.md + the most recent patterns/*-reflection.md. Generate 3-5 genuinely SALIENT, non-duplicate questions about the corpus (deliberately diversify away from prior weeks' themes - if prior reflections clustered on shipping/toolsmith, ask about health, relationships, or the creative engine instead). For each: cite a real source note; write a LENS answer, never a verdict. VERIFY gate - citation-real + lens-framed + privacy-safe, or DROP the candidate.
2) WRITE survivors to patterns/<ISO-week>-reflection-<n>.md (use a numeric suffix if this week's reflection already exists, so you never overwrite a prior one) with a SIP attestation block + a reflection-log delta (what survived / rejected + why).
3) Light curation: add a "## Related" section with 1-2 [[wikilinks]] to AT MOST 2 orphan notes.
4) SURFACE refresh: update _meta/NOW.md — bump 'updated', refresh the autonomous-run table (did last night's runs leave receipts?), and ONLY IF tonight's reflection materially shifts the picture, adjust "Current focus" / "Open blockers" (cite the reflection). Never delete human-added blockers; NOW.md stays under ~60 lines.
Write ONLY inside _meta/, patterns/, people/, decisions/, ideas/. NEVER touch A Home/, oracle-work/, templates/, archive/, or *.canvas. Keep it small and high-signal. When done, print a one-line summary of what you wrote.
'@

"=== $(Get-Date -Format o) START ===" | Out-File -Append -Encoding utf8 $Log
& claude -p $prompt --permission-mode acceptEdits --model claude-sonnet-5 2>&1 | Out-File -Append -Encoding utf8 $Log
$code = $LASTEXITCODE
# Wrapper owns the commit (targeted paths only - never -A, never .obsidian).
& git add _meta patterns people decisions ideas 2>&1 | Out-File -Append -Encoding utf8 $Log
& git commit -m "nightly SB reflect + curate (autonomous 02:30)" 2>&1 | Out-File -Append -Encoding utf8 $Log
"=== $(Get-Date -Format o) END (claude exit $code) ===" | Out-File -Append -Encoding utf8 $Log

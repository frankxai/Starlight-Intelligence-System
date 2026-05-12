# One-shot script: patch pwsh 7 shim + WT default + zellij default_shell.
$ErrorActionPreference = 'Stop'

Write-Host '=== Patch pwsh 7 shim ===' -ForegroundColor Cyan
$pwshShim = 'C:\Users\frank\OneDrive\Dokumente\PowerShell\Microsoft.PowerShell_profile.ps1'
$starlightLine = '. "$HOME\Starlight-Intelligence-System\scripts\starlight-tools.ps1"'
if (Test-Path $pwshShim) {
    $content = Get-Content $pwshShim -Raw
    if ($content -match 'starlight-tools') {
        Write-Host '  Already present in pwsh 7 shim. Skipping.'
    } else {
        Add-Content -Path $pwshShim -Value "`r`n$starlightLine"
        Write-Host '  Added starlight-tools.ps1 source to pwsh 7 shim.' -ForegroundColor Green
    }
} else {
    Write-Warning "pwsh 7 shim not found at $pwshShim"
}

Write-Host ''
Write-Host '=== Windows Terminal: find pwsh GUID + set as default ===' -ForegroundColor Cyan
$wt = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
if (Test-Path $wt) {
    $d = Get-Content $wt -Raw | ConvertFrom-Json
    Write-Host "  Current defaultProfile = $($d.defaultProfile)"

    $pwshProfile = $d.profiles.list | Where-Object {
        $_.commandline -match 'pwsh' -or $_.name -eq 'PowerShell' -or $_.source -match 'pwsh|Microsoft\.PowerShell$'
    } | Select-Object -First 1

    if ($pwshProfile) {
        if ($d.defaultProfile -eq $pwshProfile.guid) {
            Write-Host "  Already default: $($pwshProfile.name)"
        } else {
            # Back up
            Copy-Item $wt "$wt.bak-$(Get-Date -Format yyyyMMddHHmm)"
            $d.defaultProfile = $pwshProfile.guid
            $d | ConvertTo-Json -Depth 20 | Set-Content -Path $wt -Encoding utf8
            Write-Host "  Set default to: $($pwshProfile.name) ($($pwshProfile.guid))" -ForegroundColor Green
            Write-Host '  Backup written.' -ForegroundColor DarkGreen
        }
    } else {
        Write-Warning '  No pwsh profile found in Windows Terminal — install or check profile list.'
        Write-Host '  Available profiles:'
        $d.profiles.list | ForEach-Object { Write-Host "    - $($_.name) | $($_.commandline) | $($_.source)" }
    }
} else {
    Write-Warning "Windows Terminal settings not found at $wt"
}

Write-Host ''
Write-Host '=== Zellij: default_shell intentionally NOT configured ===' -ForegroundColor Cyan
# We deliberately do NOT add `default_shell "pwsh"` to zellij config on
# Windows. Caught 2026-05-12: setting it caused every `arc` invocation to
# exit immediately ("Bye from Zellij!") — Zellij 0.43.1-win32 cannot keep
# pwsh alive in a pane via the default_shell directive (likely a shim/CMD
# vs exec mismatch in the Windows port).
#
# Correct path on Windows: rely on Windows Terminal's default profile
# being pwsh (set above). Panes spawned inside a pwsh-hosted Zellij
# inherit pwsh implicitly via the parent process. The $PROFILE then
# loads starlight-tools.ps1 in every pane.
$zellij = "$HOME\.config\zellij\config.kdl"
if (Test-Path $zellij) {
    Write-Host "  Skipped. Zellij will inherit shell from parent terminal (Windows Terminal default = pwsh)."
} else {
    Write-Warning "Zellij config not found at $zellij (default install creates on first launch)"
}

Write-Host ''
Write-Host '=== Verify UTF-8 output now (banner test) ===' -ForegroundColor Cyan
. 'C:\Users\frank\Starlight-Intelligence-System\scripts\starlight-tools.ps1'

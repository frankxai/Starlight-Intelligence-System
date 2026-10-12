#Requires -Version 7.0
<#
.SYNOPSIS
  Install headless repo-scoped CLI wrappers into ~/.local/bin (grsis, oasis, dasis, agysis, ...).
#>
[CmdletBinding()]
param(
    [string]$BinDir = (Join-Path $env:USERPROFILE '.local\bin')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

$wrappers = @{
    'grsis' = @'
Set-Location "$env:USERPROFILE\Starlight-Intelligence-System"
$grok = "$env:USERPROFILE\.grok\bin\grok.exe"
if (-not (Test-Path $grok)) { $grok = "grok" }
if ($args.Count -gt 0) {
    & $grok @args
} else {
    & $grok --always-approve
}
'@
    'oasis' = @'
Set-Location "$env:USERPROFILE\Starlight-Intelligence-System"
$oa = "$env:APPDATA\npm\opencode.ps1"
if (-not (Test-Path $oa)) { $oa = "opencode" }
& $oa @args
'@
    'dasis' = @'
Set-Location "$env:USERPROFILE\Starlight-Intelligence-System"
$dcode = "$env:USERPROFILE\.local\bin\dcode.exe"
if (-not (Test-Path $dcode)) { $dcode = "dcode" }
& $dcode @args
'@
    'agysis' = @'
Set-Location "$env:USERPROFILE\Starlight-Intelligence-System"
$agy = "$env:LOCALAPPDATA\agy\bin\agy.exe"
if (-not (Test-Path $agy)) { $agy = "agy" }
& $agy @args
'@
    'grfx' = @'
Set-Location "$env:USERPROFILE\FrankX"
$grok = "$env:USERPROFILE\.grok\bin\grok.exe"
if (-not (Test-Path $grok)) { $grok = "grok" }
if ($args.Count -gt 0) { & $grok @args } else { & $grok --always-approve }
'@
    'grarc' = @'
Set-Location "$env:USERPROFILE\arcanea-ecosystem"
$grok = "$env:USERPROFILE\.grok\bin\grok.exe"
if (-not (Test-Path $grok)) { $grok = "grok" }
if ($args.Count -gt 0) { & $grok @args } else { & $grok --always-approve }
'@
    'oafx' = @'
Set-Location "$env:USERPROFILE\FrankX"
$oa = "$env:APPDATA\npm\opencode.ps1"
if (-not (Test-Path $oa)) { $oa = "opencode" }
& $oa @args
'@
    'dafx' = @'
Set-Location "$env:USERPROFILE\FrankX"
$dcode = "$env:USERPROFILE\.local\bin\dcode.exe"
if (-not (Test-Path $dcode)) { $dcode = "dcode" }
& $dcode @args
'@
}

foreach ($name in $wrappers.Keys) {
    $ps1 = Join-Path $BinDir "$name.ps1"
    $cmd = Join-Path $BinDir "$name.cmd"
    Set-Content -Path $ps1 -Value $wrappers[$name] -Encoding UTF8
    Set-Content -Path $cmd -Value "@echo off`r`npwsh -NoProfile -File `"%~dp0$name.ps1`" %*" -Encoding ASCII
    Write-Host "  installed $name -> $ps1" -ForegroundColor Green
}

Write-Host "`nDone. Ensure $BinDir is on PATH." -ForegroundColor Cyan
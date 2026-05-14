[CmdletBinding()]
param(
    [string[]]$ActiveRoots = @(
        'C:\Users\frank\Arcanea',
        'C:\Users\frank\arcanea.ai',
        'C:\Users\frank\arcanea-vault',
        'C:\Users\frank\Arcanea-site-excellence',
        'C:\Users\frank\arcanea-flow'
    ),
    [string]$Pattern = 'voice|cockpit|jarvis|orb|brain|mcp|bridge|dashboard|apps|packages|integrations'
)

# arcanea-audit-scan.ps1 — quick inventory of Arcanea-related directories.
# Lists subdirectories matching the active-systems pattern under each root.
# Idempotent — read-only directory listing, re-run = same result.

$ErrorActionPreference = 'Stop'

foreach ($r in $ActiveRoots) {
    Write-Host "=== $r ==="
    if (Test-Path $r) {
        Get-ChildItem $r -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match $Pattern } |
            Select-Object -ExpandProperty Name
    } else {
        Write-Host "(missing)"
    }
    Write-Host ""
}

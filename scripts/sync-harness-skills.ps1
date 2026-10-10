<#
.SYNOPSIS
  Projects the global .agents/skills ecosystem into OpenCode and Kilo harnesses via NTFS junctions.

.DESCRIPTION
  Zero-copy, zero-duplication skill synchronizer for Starlight Intelligence System.
  Ensures all coding agent harnesses (OpenCode, Kilo, etc.) have instant native access
  to all skills without copying files or consuming disk space.
#>
[CmdletBinding()]
param(
    [string]$SourceDir = "$env:USERPROFILE\.agents\skills",
    [string[]]$TargetDirs = @(
        "$env:USERPROFILE\.config\opencode\skills",
        "$env:USERPROFILE\.config\kilo\skills"
    ),
    [switch]$WhatIf
)

Set-StrictMode -Version 3
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Error "Source skills directory not found: $SourceDir"
    exit 1
}

$sourceSkills = Get-ChildItem -LiteralPath $SourceDir -Directory
Write-Host "Discovered $($sourceSkills.Count) skills in $SourceDir" -ForegroundColor Cyan

foreach ($target in $TargetDirs) {
    if (-not (Test-Path -LiteralPath $target)) {
        Write-Host "Creating target directory: $target" -ForegroundColor Yellow
        if (-not $WhatIf) {
            New-Item -ItemType Directory -Path $target -Force | Out-Null
        }
    }

    $existingItems = Get-ChildItem -LiteralPath $target -Directory -ErrorAction SilentlyContinue
    $existing = if ($existingItems) { @($existingItems | ForEach-Object { $_.Name }) } else { @() }
    $linkedCount = 0
    $skippedCount = 0

    foreach ($skill in $sourceSkills) {
        $destPath = Join-Path $target $skill.Name
        if ($skill.Name -in $existing) {
            $skippedCount++
            continue
        }

        if ($WhatIf) {
            Write-Host "[WhatIf] Junction: $destPath -> $($skill.FullName)" -ForegroundColor DarkGray
        } else {
            try {
                New-Item -ItemType Junction -Path $destPath -Target $skill.FullName -Force | Out-Null
                $linkedCount++
            } catch {
                Write-Warning "Failed to link $($skill.Name): $_"
            }
        }
    }

    Write-Host "Target: $target | Linked: $linkedCount new junctions | Existing: $skippedCount | Disk used: 0 B" -ForegroundColor Green
}

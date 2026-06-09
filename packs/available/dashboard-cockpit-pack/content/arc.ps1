# arc <project> — Starlight cockpit launcher (Windows / PowerShell flavour)
#
# Resolves the project's canonical path from the cross-repo audit JSON,
# boots a Zellij session named after the project, wires the panes, and
# attaches Claude Code with --resume on the project root.
#
# Usage:
#   arc                      # default workspace
#   arc starlight            # boot the SIS cockpit
#   arc -Default             # explicit default (used by the scheduled task)

param(
  [string]$Project = "",
  [switch]$Default
)

$ErrorActionPreference = 'Stop'

$cockpitDir = Join-Path $HOME ".starlight\cockpit"
$state = Join-Path $cockpitDir "state.json"

if (-not (Test-Path $cockpitDir)) {
  Write-Error "Cockpit not installed. Run install.ps1 first."
  exit 1
}

if ($Default -or [string]::IsNullOrWhiteSpace($Project)) {
  $Project = "default"
}

# Stub — real implementation looks up canonical paths from
# ~/.starlight/audit-repo-portfolio.json and boots Zellij.
Write-Host "[arc] launching cockpit for project: $Project"
Write-Host "[arc] state file: $state"
Write-Host "[arc] (stub launcher — wire to your local Zellij + Claude Code resume here)"

# tools/lib/sis-ops.psm1 — shared PowerShell module for SIS ops tooling.
#
# Usage (import from any PS script in tools/):
#   Import-Module "$PSScriptRoot/lib/sis-ops.psm1" -Force
#   $free = Get-FreeGB
#   Write-FixLog -Level fix -Target 'task-name'
#
# Exports the discipline lattice that the early diag-* / fix-* scripts hand-rolled:
#   - Get-FreeGB / Get-DirSizeGB     -> measurement primitives (before/after)
#   - Write-FixLog                    -> [fix] / [skip] / [err] / [info] taxonomy
#   - Assert-Idempotent               -> probe-block convention for re-runnability
#   - Get-SisRoot / Get-ArcaneaRoot / -> path SoT (dot-sourced from paths.ps1)
#     Get-PpCli
#
# Idempotent. Re-import = same exports.

. "$PSScriptRoot/paths.ps1"

function Get-FreeGB {
    param([string]$Drive = 'C')
    $d = Get-PSDrive $Drive -ErrorAction Stop
    return [math]::Round($d.Free / 1GB, 2)
}

function Get-DirSizeGB {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path $Path)) { return 0 }
    try {
        $sum = (Get-ChildItem $Path -Recurse -Force -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        return [math]::Round(($sum / 1GB), 2)
    } catch {
        return 0
    }
}

function Write-FixLog {
    param(
        [Parameter(Mandatory = $true)][ValidateSet('fix', 'skip', 'err', 'info')][string]$Level,
        [Parameter(Mandatory = $true)][string]$Target,
        [string]$Message = ''
    )
    $color = switch ($Level) {
        'fix'  { 'Green' }
        'skip' { 'DarkGray' }
        'err'  { 'Red' }
        'info' { 'Cyan' }
    }
    $tag = "[$Level]".PadRight(7)
    $line = if ($Message) { "  $tag $Target -- $Message" } else { "  $tag $Target" }
    Write-Host $line -ForegroundColor $color
}

function Assert-Idempotent {
    # Returns $true if the probe says the work is already done (caller should [skip]).
    # Returns $false if the work still needs doing (caller proceeds with [fix]).
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Probe
    )
    try {
        $result = & $Probe
        return [bool]$result
    } catch {
        return $false
    }
}

Export-ModuleMember -Function `
    Get-FreeGB, `
    Get-DirSizeGB, `
    Write-FixLog, `
    Assert-Idempotent, `
    Get-SisRoot, `
    Get-ArcaneaRoot, `
    Get-PpCli

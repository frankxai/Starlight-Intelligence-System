# tools/lib/paths.ps1 — single source of truth for SIS path constants.
#
# Usage (dot-source from any PS script in tools/):
#   . "$PSScriptRoot/lib/paths.ps1"
#   $root = Get-SisRoot
#
# Resolution order: env var -> ancestor walk for SIP.md marker -> hardcoded fallback.
# Idempotent. Re-source = same result.

function Get-SisRoot {
    if ($env:SIS_ROOT -and (Test-Path $env:SIS_ROOT)) { return $env:SIS_ROOT }

    $here = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    $current = $here
    while ($current) {
        if (Test-Path (Join-Path $current 'SIP.md')) { return $current }
        $parent = Split-Path $current -Parent
        if (-not $parent -or $parent -eq $current) { break }
        $current = $parent
    }

    return 'C:\Users\frank\Starlight-Intelligence-System'
}

function Get-ArcaneaRoot {
    if ($env:ARCANEA_ROOT -and (Test-Path $env:ARCANEA_ROOT)) { return $env:ARCANEA_ROOT }

    $candidate = 'C:\Users\frank\Arcanea'
    if (Test-Path $candidate) { return $candidate }

    return $null
}

function Get-PpCli {
    if ($env:PP_CLI -and (Test-Path $env:PP_CLI)) { return $env:PP_CLI }

    $arcanea = Get-ArcaneaRoot
    if ($arcanea) {
        $dist = Join-Path $arcanea 'packages\peak-performance\dist\cli.js'
        if (Test-Path $dist) { return $dist }
    }

    return $null
}

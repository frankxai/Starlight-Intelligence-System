[CmdletBinding()]
param()

# Safe regenerable cache clean — per /pp recommendations.
# Reports before/after disk free and per-target reclaim.
# Idempotent — re-run after first pass reports zero reclaim per cleared target.

$ErrorActionPreference = 'Stop'

function Get-FreeGB {
    $d = Get-PSDrive C
    [math]::Round($d.Free / 1GB, 2)
}

function Get-DirSizeGB($path) {
    if (-not (Test-Path $path)) { return 0 }
    try {
        $sum = (Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        return [math]::Round(($sum / 1GB), 2)
    } catch { return 0 }
}

$beforeFree = Get-FreeGB
Write-Host "`n=== Free space BEFORE: $beforeFree GB ===" -ForegroundColor Cyan

# 1. npm cache
Write-Host "`n[1/5] npm cache clean --force" -ForegroundColor Yellow
$npmCache = "$env:LOCALAPPDATA\npm-cache"
$before = Get-DirSizeGB $npmCache
try {
    & npm cache clean --force 2>&1 | Out-Null
    $after = Get-DirSizeGB $npmCache
    Write-Host "  reclaimed $([math]::Round($before - $after, 2)) GB" -ForegroundColor Green
} catch {
    Write-Host "  err: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Orphan pnpm store/v3
Write-Host "`n[2/5] Remove orphan pnpm store/v3" -ForegroundColor Yellow
$orphan = "$env:LOCALAPPDATA\pnpm\store\v3"
$before = Get-DirSizeGB $orphan
if (Test-Path $orphan) {
    Remove-Item -Recurse -Force $orphan -ErrorAction SilentlyContinue
    Write-Host "  reclaimed $before GB" -ForegroundColor Green
} else {
    Write-Host "  already gone" -ForegroundColor DarkGray
}

# 3. AppData/Temp older than 3 days
Write-Host "`n[3/5] AppData\Temp files older than 3 days" -ForegroundColor Yellow
$tempDir = "$env:LOCALAPPDATA\Temp"
$cutoff = (Get-Date).AddDays(-3)
$reclaimed = 0
Get-ChildItem $tempDir -Force -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.LastWriteTime -lt $cutoff) {
        try {
            if ($_.PSIsContainer) {
                $sz = (Get-ChildItem $_.FullName -Recurse -Force -ErrorAction SilentlyContinue |
                       Measure-Object -Property Length -Sum).Sum
            } else { $sz = $_.Length }
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
            if (-not (Test-Path $_.FullName)) { $reclaimed += $sz }
        } catch {}
    }
}
Write-Host "  reclaimed $([math]::Round($reclaimed / 1GB, 2)) GB" -ForegroundColor Green

# 4. user .cache
Write-Host "`n[4/5] ~/.cache" -ForegroundColor Yellow
$userCache = "$env:USERPROFILE\.cache"
$before = Get-DirSizeGB $userCache
if (Test-Path $userCache) {
    Get-ChildItem $userCache -Force -ErrorAction SilentlyContinue |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    $after = Get-DirSizeGB $userCache
    Write-Host "  reclaimed $([math]::Round($before - $after, 2)) GB" -ForegroundColor Green
} else {
    Write-Host "  not present" -ForegroundColor DarkGray
}

# 5. pnpm download cache via prune (safer than removing)
Write-Host "`n[5/5] pnpm store prune" -ForegroundColor Yellow
try {
    & pnpm store prune 2>&1 | Out-Null
    Write-Host "  pruned" -ForegroundColor Green
} catch {
    Write-Host "  err: $($_.Exception.Message)" -ForegroundColor Red
}

$afterFree = Get-FreeGB
$reclaimedTotal = [math]::Round($afterFree - $beforeFree, 2)
Write-Host "`n=== Free space AFTER:  $afterFree GB ===" -ForegroundColor Cyan
Write-Host "=== Reclaimed:         $reclaimedTotal GB ===" -ForegroundColor Green

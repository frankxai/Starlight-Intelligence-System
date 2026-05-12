# Glass-cockpit aesthetic installer.
#
# Windows Terminal pwsh profile gets:
#   - useAcrylic: true (native Windows blur)
#   - opacity: 88 (semi-transparent — still readable)
#   - colorScheme: Arcanea (Atlantean Teal + Cosmic Blue + Gold on near-black,
#     matching the Zellij theme in ~/.config/zellij/config.kdl)
#   - font: Cascadia Code 11pt (Microsoft's terminal font, ligature-capable)
#
# Idempotent. Backup written before any edit. Restorable from backup.

$ErrorActionPreference = 'Stop'

$WT = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
if (-not (Test-Path $WT)) {
    throw "Windows Terminal settings.json not found at $WT"
}

# Backup
$bak = "$WT.bak-$(Get-Date -Format yyyyMMddHHmm)"
Copy-Item $WT $bak
Write-Host "[OK] Backup: $bak" -ForegroundColor DarkGreen

$d = Get-Content $WT -Raw | ConvertFrom-Json

# --- 1. Define the Arcanea color scheme (matches Zellij theme) ---
$arcanea = [PSCustomObject]@{
    name                = 'Arcanea'
    background          = '#09090b'
    foreground          = '#e0e0e0'
    cursorColor         = '#00bcd4'
    selectionBackground = '#0d47a1'
    black               = '#09090b'
    red                 = '#ef4444'
    green               = '#16a34a'
    yellow              = '#ffd700'
    blue                = '#0d47a1'
    purple              = '#a78bfa'
    cyan                = '#00bcd4'
    white               = '#e0e0e0'
    brightBlack         = '#3f3f46'
    brightRed           = '#fb7185'
    brightGreen         = '#22c55e'
    brightYellow        = '#fde047'
    brightBlue          = '#3b82f6'
    brightPurple        = '#c4b5fd'
    brightCyan          = '#22d3ee'
    brightWhite         = '#fafafa'
}

# Ensure schemes array exists
if (-not $d.schemes) {
    $d | Add-Member -NotePropertyName schemes -NotePropertyValue @() -Force
}

# Replace existing Arcanea scheme or add new
$existing = $d.schemes | Where-Object { $_.name -eq 'Arcanea' }
if ($existing) {
    $d.schemes = @($d.schemes | Where-Object { $_.name -ne 'Arcanea' }) + $arcanea
    Write-Host "[OK] Updated existing Arcanea scheme" -ForegroundColor Green
} else {
    $d.schemes = @($d.schemes) + $arcanea
    Write-Host "[OK] Added new Arcanea scheme" -ForegroundColor Green
}

# --- 2. Patch the default profile (pwsh) ---
$pwsh = $d.profiles.list | Where-Object { $_.guid -eq $d.defaultProfile }
if (-not $pwsh) {
    throw "Default profile not found by GUID $($d.defaultProfile)"
}

$updates = @{
    useAcrylic    = $true
    opacity       = 88
    colorScheme   = 'Arcanea'
    cursorShape   = 'filledBox'
    antialiasingMode = 'cleartype'
    padding       = '12, 12, 12, 12'
}

foreach ($k in $updates.Keys) {
    if ($pwsh.PSObject.Properties.Name -contains $k) {
        $pwsh.$k = $updates[$k]
    } else {
        $pwsh | Add-Member -NotePropertyName $k -NotePropertyValue $updates[$k] -Force
    }
}

# Font is a nested object
$fontUpdate = [PSCustomObject]@{
    face   = 'Cascadia Code'
    size   = 11
    weight = 'normal'
}
if ($pwsh.PSObject.Properties.Name -contains 'font') {
    $pwsh.font = $fontUpdate
} else {
    $pwsh | Add-Member -NotePropertyName font -NotePropertyValue $fontUpdate -Force
}

Write-Host "[OK] pwsh profile patched: useAcrylic=true, opacity=88, scheme=Arcanea, Cascadia Code 11pt" -ForegroundColor Green

# --- 3. Save with proper JSON formatting ---
$d | ConvertTo-Json -Depth 20 | Set-Content -Path $WT -Encoding utf8
Write-Host "[OK] Wrote $WT" -ForegroundColor Green

Write-Host ''
Write-Host 'Open a NEW Windows Terminal tab/window to see the glass-cockpit aesthetic.' -ForegroundColor Cyan
Write-Host 'To revert: copy backup back over settings.json:'
Write-Host "  Copy-Item '$bak' '$WT' -Force"

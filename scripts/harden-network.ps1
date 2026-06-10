# Network hardening -- run ONCE as Administrator.
#
# Approved by Frank 2026-06-09 (machine security review). Three changes:
#   1. Node/Python inbound firewall allow rules: Public -> Private profile
#      (agents' local dev servers stay reachable on home LAN, blocked on
#      public Wi-Fi; loopback is never firewall-filtered so localhost-only
#      workflows are unaffected)
#   2. OBS Stream Deck Plugin rule: Any -> Private (OBS WebSocket :4455 was
#      reachable from any network; obs MCP + Stream Deck both use localhost)
#   3. postgres listen_addresses: '*' -> 'localhost' (EDB installer default
#      bound :5432 on ALL interfaces; nothing remote uses this instance)
#
# Each step verifies and prints before/after. Idempotent.

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

Write-Host "=== 1. Firewall: Node/Python rules Public -> Private ===" -ForegroundColor Cyan
$devRules = Get-NetFirewallRule -Enabled True -Direction Inbound -Action Allow |
    Where-Object { $_.DisplayName -in 'Python', 'Node.js JavaScript Runtime', 'node.exe' }
foreach ($r in $devRules) {
    Set-NetFirewallRule -Name $r.Name -Profile Private
    Write-Host "  [OK] '$($r.DisplayName)' ($($r.Name.Substring(0,[Math]::Min(40,$r.Name.Length)))...) -> Private"
}
if (-not $devRules) { Write-Host "  (no matching rules found -- already done?)" }

Write-Host "=== 2. Firewall: OBS Stream Deck Plugin Any -> Private ===" -ForegroundColor Cyan
$obsRules = Get-NetFirewallRule -Enabled True -Direction Inbound -Action Allow |
    Where-Object { $_.DisplayName -eq 'OBS Studio Stream Deck Plugin' }
foreach ($r in $obsRules) {
    Set-NetFirewallRule -Name $r.Name -Profile Private
    Write-Host "  [OK] '$($r.DisplayName)' -> Private"
}
if (-not $obsRules) { Write-Host "  (no matching rules found -- already done?)" }

Write-Host "=== 3. postgres listen_addresses -> localhost ===" -ForegroundColor Cyan
$conf = 'C:\Program Files\PostgreSQL\18\data\postgresql.conf'
$content = Get-Content $conf -Raw
if ($content -match "(?m)^listen_addresses\s*=\s*'\*'") {
    Copy-Item $conf "$conf.bak-2026-06-09" -Force
    $content = $content -replace "(?m)^listen_addresses\s*=\s*'\*'", "listen_addresses = 'localhost'"
    Set-Content $conf $content -Encoding utf8 -NoNewline
    Write-Host "  [OK] postgresql.conf updated (backup: $conf.bak-2026-06-09)"
    Restart-Service postgresql-x64-18
    Write-Host "  [OK] postgresql-x64-18 restarted"
} else {
    Write-Host "  (listen_addresses is not '*' -- already done?)"
}

Write-Host "=== Verify ===" -ForegroundColor Cyan
Start-Sleep -Seconds 3
Get-NetTCPConnection -State Listen -LocalPort 5432 -ErrorAction SilentlyContinue |
    Select-Object LocalAddress, LocalPort | Format-Table -AutoSize
Get-NetFirewallRule | Where-Object { $_.DisplayName -in 'Python', 'Node.js JavaScript Runtime', 'node.exe', 'OBS Studio Stream Deck Plugin' } |
    Select-Object DisplayName, Profile, Enabled | Format-Table -AutoSize

Write-Host "Done. postgres should now show only 127.0.0.1 / ::1 above." -ForegroundColor Green
Read-Host "Press Enter to close"

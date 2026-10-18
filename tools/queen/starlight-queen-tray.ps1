param(
    [int]$Port = 4329,
    [string]$WorkspaceRoot = "C:\Users\frank\starlight\worktrees\sis-queen-sovereign-20261018",
    [int]$AutoExitSeconds = 0
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$starlightDir = Join-Path $WorkspaceRoot ".starlight"
if (-not (Test-Path $starlightDir)) {
    New-Item -ItemType Directory -Path $starlightDir -Force | Out-Null
}
$trayStatusPath = Join-Path $starlightDir "queen-tray-status.json"
$voidStatusPath = Join-Path $starlightDir "queen-cloudflare-void.json"

function Write-TrayStatus([string]$state, [string]$lastAction) {
    $voidUrl = $null
    if (Test-Path $voidStatusPath) {
        try {
            $voidJson = Get-Content $voidStatusPath -Raw | ConvertFrom-Json
            $voidUrl = $voidJson.publicHttpsUrl
        } catch {}
    }
    $payload = @{
        active = ($state -eq "ONLINE")
        state = $state
        pid = $PID
        port = $Port
        localCosmosUrl = "http://127.0.0.1:$Port/cosmos"
        cloudflareVoidUrl = $voidUrl
        lastAction = $lastAction
        updatedAt = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json -Depth 4
    Set-Content -Path $trayStatusPath -Value $payload -Encoding UTF8
}

# Draw custom 32x32 Starlight Queen Crown + Neural Cyan Orb Icon
$bmp = New-Object System.Drawing.Bitmap(32, 32)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 4, 7, 17))

$cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 242, 254), 2)
$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 250, 204, 21))
$cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 242, 254))

$g.DrawEllipse($cyanPen, 2, 2, 27, 27)
$crownPoints = @(
    (New-Object System.Drawing.Point(7, 22)),
    (New-Object System.Drawing.Point(7, 12)),
    (New-Object System.Drawing.Point(12, 16)),
    (New-Object System.Drawing.Point(16, 8)),
    (New-Object System.Drawing.Point(20, 16)),
    (New-Object System.Drawing.Point(25, 12)),
    (New-Object System.Drawing.Point(25, 22))
)
$g.FillPolygon($goldBrush, $crownPoints)
$g.FillEllipse($cyanBrush, 14, 5, 4, 4)
$g.Dispose()

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = $icon
$notifyIcon.Text = "Starlight Queen v3.5 — Grok-4.7 + Void Edge + Machine Commander"
$notifyIcon.Visible = $true

function Open-FramelessCosmos {
    $url = "http://127.0.0.1:$Port/cosmos"
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path $edgePath) {
        Start-Process -FilePath $edgePath -ArgumentList "--app=$url --window-size=1720,1000 --new-window"
    } else {
        Start-Process $url
    }
    Write-TrayStatus "ONLINE" "OPEN_FRAMELESS_COSMOS"
}

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$itemOpenApp = $contextMenu.Items.Add("Open Starlight Queen Cosmos (Frameless App)")
$itemOpenApp.Add_Click({ Open-FramelessCosmos })

$itemOpenVoid = $contextMenu.Items.Add("Open / Copy Cloudflare Void Edge URL")
$itemOpenVoid.Add_Click({
    if (Test-Path $voidStatusPath) {
        $voidJson = Get-Content $voidStatusPath -Raw | ConvertFrom-Json
        if ($voidJson.publicHttpsUrl) {
            [System.Windows.Forms.Clipboard]::SetText("$($voidJson.publicHttpsUrl)/cosmos")
            Start-Process "$($voidJson.publicHttpsUrl)/cosmos"
            $notifyIcon.ShowBalloonTip(3000, "Cloudflare Void Edge Copied", "$($voidJson.publicHttpsUrl)/cosmos", [System.Windows.Forms.ToolTipIcon]::Info)
        }
    }
    Write-TrayStatus "ONLINE" "OPEN_VOID_EDGE_URL"
})

$itemSpawnGrok = $contextMenu.Items.Add("Dispatch Grok-4.7 CLI Task (xhigh Reasoning)")
$itemSpawnGrok.Add_Click({
    try {
        $body = @{
            harness = "grok"
            model = "grok-4.7"
            reasoningEffort = "xhigh"
            prompt = "Audit active Starlight PR slices and report verification status."
            dryRun = $false
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/queen/machine/spawn-agent" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
        $notifyIcon.ShowBalloonTip(3000, "Grok-4.7 CLI Dispatched", "Spawned background Grok-4.7 (xhigh) agent task.", [System.Windows.Forms.ToolTipIcon]::Info)
    } catch {}
    Write-TrayStatus "ONLINE" "SPAWN_GROK_4_7"
})

$itemSelfHeal = $contextMenu.Items.Add("Self-Heal Memory & Free RAM (>1,024 MB Floor)")
$itemSelfHeal.Add_Click({
    try {
        $body = @{ applyFixes = $true } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/queen/self-heal" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
        $notifyIcon.ShowBalloonTip(3000, "Queen Self-Heal Complete", "Memory vaults synced & RAM floor verified.", [System.Windows.Forms.ToolTipIcon]::Info)
    } catch {}
    Write-TrayStatus "ONLINE" "SELF_HEAL_MEMORY_RAM"
})

$contextMenu.Items.Add("-") | Out-Null

$itemExit = $contextMenu.Items.Add("Exit Starlight Queen Tray")
$itemExit.Add_Click({
    Write-TrayStatus "STOPPED" "USER_EXIT"
    $notifyIcon.Visible = $false
    [System.Windows.Forms.Application]::Exit()
})

$notifyIcon.ContextMenuStrip = $contextMenu
$notifyIcon.Add_DoubleClick({ Open-FramelessCosmos })

Write-TrayStatus "ONLINE" "TRAY_BOOTED"
$notifyIcon.ShowBalloonTip(
    4000,
    "Starlight Queen v3.5 Active in Tray",
    "Grok-4.7 (grok.com OAuth) + Cloudflare Void Edge + Browser :9223 + Machine Commander Ready.",
    [System.Windows.Forms.ToolTipIcon]::Info
)

if ($AutoExitSeconds -gt 0) {
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = $AutoExitSeconds * 1000
    $timer.Add_Tick({
        $timer.Stop()
        Write-TrayStatus "STOPPED" "AUTO_EXIT_TIMER"
        $notifyIcon.Visible = $false
        [System.Windows.Forms.Application]::Exit()
    })
    $timer.Start()
}

[System.Windows.Forms.Application]::Run()

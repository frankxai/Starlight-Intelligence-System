# Starlight Intelligence System (SIS) — One-Line Installer for Windows PowerShell
# Usage: iwr -useb https://starlightintelligence.org/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "✨ Initializing Starlight Intelligence System (SIS)..." -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js (v18+) is required. Please install Node.js first."
    exit 1
}

$nodeVersion = node -v
Write-Host "✓ Found Node.js $nodeVersion" -ForegroundColor Green

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Git is required. Please install Git first."
    exit 1
}

$installDir = "$env:USERPROFILE\.starlight\system"

if (Test-Path $installDir) {
    Write-Host "🔄 Updating existing Starlight installation at $installDir..." -ForegroundColor Yellow
    Set-Location $installDir
    git pull --quiet
} else {
    Write-Host "📦 Cloning Starlight Intelligence System..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.starlight" | Out-Null
    git clone --quiet https://github.com/frankxai/Starlight-Intelligence-System.git $installDir
    Set-Location $installDir
}

Write-Host "⚙️ Building Starlight Core & Memory Substrate..." -ForegroundColor Yellow
npm install --quiet
try { npm run build --quiet } catch {}

Write-Host "`n🚀 Starlight Intelligence System initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start Commands:" -ForegroundColor White
Write-Host "  npx starlight init         # Initialize .starlight in current project" -ForegroundColor Gray
Write-Host "  npx starlight status       # Inspect memory vaults and daemon posture" -ForegroundColor Gray
Write-Host "  npx starlight guidance     # Generate agent session context guidance" -ForegroundColor Gray
Write-Host ""
Write-Host "Built on SIP v1.1.1 — Starlight Sovereign Substrate." -ForegroundColor DarkGray

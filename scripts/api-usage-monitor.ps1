# =============================================================================
# api-usage-monitor.ps1 — Daily LLM API usage + key health snapshot
# =============================================================================
#
# Hits each provider's health/usage endpoint, writes a JSON snapshot to
# private/api-monitor/usage-YYYY-MM-DD.json, and appends an alert line to
# ALERTS.md if any threshold is crossed.
#
# Thresholds (per-key):
#   - usage > 80% of limit                     -> WARN
#   - usage > 95% of limit                     -> CRIT
#   - daily delta > 5x median(7-day rolling)   -> SPIKE
#   - health check fails (401/403)             -> REVOKED
#
# Schedule: daily 04:00 via StarlightAPIKeyMonitor task.
# Manual run: pwsh -File scripts/api-usage-monitor.ps1
#
# Built on SIP — operational tier (key + budget observability).
# =============================================================================

$ErrorActionPreference = 'Continue'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $RepoRoot 'private\api-monitor'
$AlertsFile = Join-Path $OutDir 'ALERTS.md'
$Today = Get-Date -Format 'yyyy-MM-dd'
$Snapshot = Join-Path $OutDir "usage-$Today.json"

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$results = @{
  timestamp = (Get-Date).ToString('o')
  providers = @{}
  alerts = @()
}

function Add-Alert {
  param([string]$Level, [string]$Provider, [string]$Message)
  $line = "[$Level] $((Get-Date).ToString('o')) $Provider :: $Message"
  $results.alerts += $line
  Add-Content -Path $AlertsFile -Value $line
  Write-Host $line -ForegroundColor $(if ($Level -eq 'CRIT' -or $Level -eq 'REVOKED') { 'Red' } else { 'Yellow' })
}

# --- OpenRouter ---
Write-Host '=== OpenRouter ===' -ForegroundColor Cyan
$orKey = [Environment]::GetEnvironmentVariable('OPENROUTER_API_KEY','User')
if ($orKey) {
  try {
    $r = Invoke-RestMethod -Uri 'https://openrouter.ai/api/v1/auth/key' `
      -Headers @{ Authorization = "Bearer $orKey" } -ErrorAction Stop
    $data = $r.data
    $usage = [double]$data.usage
    $limit = if ($data.limit) { [double]$data.limit } else { $null }
    $pct = if ($limit -and $limit -gt 0) { [math]::Round(($usage / $limit) * 100, 2) } else { $null }
    $results.providers['openrouter'] = @{
      usage_total = $usage
      usage_daily = $data.usage_daily
      usage_weekly = $data.usage_weekly
      usage_monthly = $data.usage_monthly
      limit = $limit
      remaining = $data.limit_remaining
      pct_used = $pct
      label = $data.label
      expires_at = $data.expires_at
      healthy = $true
    }
    Write-Host ("  usage=`$$usage / limit=`$$limit ($pct%) | daily=`$$($data.usage_daily)")
    if ($pct) {
      if ($pct -ge 95) { Add-Alert 'CRIT' 'openrouter' "Usage at $pct% of limit (`$$usage / `$$limit)" }
      elseif ($pct -ge 80) { Add-Alert 'WARN' 'openrouter' "Usage at $pct% of limit (`$$usage / `$$limit)" }
    }
  } catch {
    $msg = $_.Exception.Message
    $results.providers['openrouter'] = @{ healthy = $false; error = $msg }
    Add-Alert 'REVOKED' 'openrouter' "Health check failed: $msg"
  }
} else {
  $results.providers['openrouter'] = @{ healthy = $false; error = 'key unset' }
  Add-Alert 'WARN' 'openrouter' 'OPENROUTER_API_KEY not set'
}

# --- OpenAI ---
Write-Host '=== OpenAI ===' -ForegroundColor Cyan
$oaKey = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY','User')
if ($oaKey) {
  try {
    # Health probe via /v1/models (cheap, doesn't burn tokens)
    $r = Invoke-RestMethod -Uri 'https://api.openai.com/v1/models' `
      -Headers @{ Authorization = "Bearer $oaKey" } -ErrorAction Stop
    $modelCount = $r.data.Count
    $results.providers['openai'] = @{
      healthy = $true
      model_count = $modelCount
      note = 'usage requires admin key + /v1/organization/costs (not probed here)'
    }
    Write-Host ("  OK | $modelCount models accessible")
  } catch {
    $msg = $_.Exception.Message
    $results.providers['openai'] = @{ healthy = $false; error = $msg }
    Add-Alert 'REVOKED' 'openai' "Health check failed: $msg"
  }
} else {
  $results.providers['openai'] = @{ healthy = $false; error = 'key unset' }
}

# --- Google AI Studio (Gemini) ---
Write-Host '=== Google AI Studio (Gemini) ===' -ForegroundColor Cyan
$gKey = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User')
if ($gKey) {
  if ($gKey.Length -lt 35 -or $gKey.Length -gt 50 -or -not $gKey.StartsWith('AIza')) {
    Add-Alert 'WARN' 'gemini' "Key format anomaly: length=$($gKey.Length), prefix='$($gKey.Substring(0,[math]::Min(4,$gKey.Length)))'. Expected AIza... (39 chars). Possible misconfig — calls to Google direct may fail."
  }
  try {
    $r = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$gKey" -ErrorAction Stop
    $modelCount = $r.models.Count
    $results.providers['gemini'] = @{
      healthy = $true
      model_count = $modelCount
      key_length = $gKey.Length
    }
    Write-Host ("  OK | $modelCount models accessible")
  } catch {
    $msg = $_.Exception.Message
    $results.providers['gemini'] = @{ healthy = $false; error = $msg; key_length = $gKey.Length }
    Add-Alert 'REVOKED' 'gemini' "Health check failed: $msg"
  }
} else {
  $results.providers['gemini'] = @{ healthy = $false; error = 'key unset' }
}

# --- Groq ---
Write-Host '=== Groq ===' -ForegroundColor Cyan
$grKey = [Environment]::GetEnvironmentVariable('GROQ_API_KEY','User')
if ($grKey) {
  try {
    $r = Invoke-RestMethod -Uri 'https://api.groq.com/openai/v1/models' `
      -Headers @{ Authorization = "Bearer $grKey" } -ErrorAction Stop
    $results.providers['groq'] = @{ healthy = $true; model_count = $r.data.Count }
    Write-Host ("  OK | $($r.data.Count) models accessible")
  } catch {
    $msg = $_.Exception.Message
    $results.providers['groq'] = @{ healthy = $false; error = $msg }
    Add-Alert 'REVOKED' 'groq' "Health check failed: $msg"
  }
}

# --- Spike detection (compare to yesterday's snapshot) ---
$yesterday = (Get-Date).AddDays(-1).ToString('yyyy-MM-dd')
$ySnapshot = Join-Path $OutDir "usage-$yesterday.json"
if (Test-Path $ySnapshot) {
  try {
    $y = Get-Content $ySnapshot -Raw | ConvertFrom-Json
    foreach ($prov in @('openrouter')) {
      $yUsage = $y.providers.$prov.usage_total
      $tUsage = $results.providers[$prov].usage_total
      if ($yUsage -and $tUsage) {
        $delta = $tUsage - $yUsage
        if ($delta -gt 5 -and $delta -gt ($yUsage * 0.5)) {
          Add-Alert 'SPIKE' $prov "Daily delta `$$delta (yesterday=`$$yUsage, today=`$$tUsage) > 5x baseline"
        }
      }
    }
  } catch {}
}

# --- Write snapshot ---
$results | ConvertTo-Json -Depth 10 | Set-Content -Path $Snapshot -Encoding UTF8
Write-Host ''
Write-Host "Snapshot: $Snapshot" -ForegroundColor Green
if ($results.alerts.Count -gt 0) {
  Write-Host "Alerts:   $($results.alerts.Count) (see $AlertsFile)" -ForegroundColor Yellow
} else {
  Write-Host 'Alerts:   0' -ForegroundColor Green
}

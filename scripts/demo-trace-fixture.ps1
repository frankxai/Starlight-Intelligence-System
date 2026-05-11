# scripts/demo-trace-fixture.ps1 -- Stretch Track F demo driver.
#
# Writes a sequenced 3-step WorkPacket trace to today's agent-events ledger
# (memory/_audit/agent-events/YYYY-MM-DD.jsonl), one event every 1.5 seconds,
# so the /trace page in the dashboard renders the orchestration unfold live.
#
# Path:
#   1. WorkPacket "Build a council module scaffold" enqueued
#   2. Orchestrator: analyzing
#   3. Orchestrator: delegating to architect
#   4. Architect: scaffolding
#   5. Architect: complete (emits artifact)
#   6. Decision logged
#   7. CouncilReview generated
#
# Each event is written as a single JSONL line. We use the dashboard wire
# shape (snake_case) since that's the shape the SSE bridge emits anyway --
# the bridge parser accepts both dialects, but using the wire shape here
# keeps the fixture readable.
#
# Flags:
#   -Cleanup   Remove every event with run_id matching the synthetic ids
#              from today's ledger. Useful when re-running the demo without
#              accumulating fixture events in the live ledger.
#   -Quiet     Suppress per-event Write-Host output.
#   -DelayMs   Override the default 1500ms pacing.
#
# Built on SIP -- operational tier.

[CmdletBinding()]
param(
  [switch]$Cleanup,
  [switch]$Quiet,
  [int]$DelayMs = 1500
)

$ErrorActionPreference = 'Stop'

# Resolve repo root from the script location (scripts/ -> repo root).
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$today    = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
$ledgerDir = Join-Path $repoRoot 'memory\_audit\agent-events'
$ledgerFile = Join-Path $ledgerDir "$today.jsonl"

if (-not (Test-Path $ledgerDir)) {
  New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null
}

# Stable run / packet ids so -Cleanup can find them.
$packetId = 'wp_demo_fixture_council'
$runIdOrchestrator = 'run_demo_fixture_orchestrator'
$runIdArchitect    = 'run_demo_fixture_architect'

$syntheticRunIds = @($runIdOrchestrator, $runIdArchitect)

if ($Cleanup) {
  if (-not (Test-Path $ledgerFile)) {
    Write-Host "[fixture] nothing to clean -- $ledgerFile not found"
    return
  }
  $kept = @()
  $dropped = 0
  foreach ($line in (Get-Content -LiteralPath $ledgerFile)) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
      $obj = $line | ConvertFrom-Json -ErrorAction Stop
    } catch {
      $kept += $line
      continue
    }
    $runId = $null
    if ($obj.PSObject.Properties.Match('run_id').Count -gt 0) { $runId = $obj.run_id }
    elseif ($obj.PSObject.Properties.Match('runId').Count -gt 0) { $runId = $obj.runId }
    if ($runId -and $syntheticRunIds -contains $runId) {
      $dropped++
      continue
    }
    $kept += $line
  }
  # Use parameter form (not pipe) so an empty $kept actually empties the file.
  # `$kept | Set-Content` is a no-op when $kept is @() -- PowerShell quirk.
  if ($kept.Count -eq 0) {
    Set-Content -LiteralPath $ledgerFile -Value '' -Encoding UTF8 -NoNewline
  } else {
    Set-Content -LiteralPath $ledgerFile -Value $kept -Encoding UTF8
  }
  Write-Host "[fixture] cleanup complete - dropped $dropped event(s) from $ledgerFile"
  return
}

function Write-Event {
  param([hashtable]$Event)
  $json = $Event | ConvertTo-Json -Compress -Depth 6
  Add-Content -LiteralPath $ledgerFile -Value $json -Encoding UTF8
  if (-not $Quiet) {
    Write-Host ("[fixture] " + $Event.agent_id + " | " + $Event.event_type + " -- " + $Event.summary)
  }
}

function New-Event {
  param(
    [string]$AgentId,
    [string]$RunId,
    [string]$EventType,
    [string]$Summary,
    [string[]]$Tools = @(),
    [string[]]$OutputRefs = @(),
    [string[]]$DecisionsCreated = @(),
    [string[]]$ArtifactsCreated = @(),
    [string]$Risk = 'low'
  )
  return @{
    id                = "evt_demo_$([guid]::NewGuid().ToString('N').Substring(0,12))"
    run_id            = $RunId
    agent_id          = $AgentId
    event_type        = $EventType
    summary           = $Summary
    tools_used        = $Tools
    input_refs        = @("workpacket:$packetId")
    output_refs       = $OutputRefs
    decisions_created = $DecisionsCreated
    artifacts_created = $ArtifactsCreated
    risk_level        = $Risk
    cost_estimate     = 0
    timestamp         = (Get-Date).ToUniversalTime().ToString('o')
    work_packet_id    = $packetId
  }
}

if (-not $Quiet) {
  Write-Host ""
  Write-Host "Demo Trace Fixture -- Stretch Track F"
  Write-Host "==========================================="
  Write-Host "  ledger : $ledgerFile"
  Write-Host "  packet : $packetId"
  Write-Host "  delay  : ${DelayMs}ms between events"
  Write-Host "  view   : http://localhost:3007/trace?wp=$packetId"
  Write-Host "  cleanup: re-run with -Cleanup to remove synthetic events"
  Write-Host ""
}

$steps = @(
  (New-Event -AgentId 'starlight-orchestrator' -RunId $runIdOrchestrator -EventType 'workpacket.enqueued' `
    -Summary 'Build a council module scaffold' `
    -Tools @('sis.workpacket.create')),
  (New-Event -AgentId 'starlight-orchestrator' -RunId $runIdOrchestrator -EventType 'analyzing' `
    -Summary 'Routing mission. Risk gate evaluates as medium.' `
    -Tools @('sis.memory.search') -Risk 'medium'),
  (New-Event -AgentId 'starlight-orchestrator' -RunId $runIdOrchestrator -EventType 'delegating' `
    -Summary 'Handing scaffold work to starlight-architect.' `
    -Tools @('sis.agent.spawn') -OutputRefs @('agent:starlight-architect') -Risk 'medium'),
  (New-Event -AgentId 'starlight-architect' -RunId $runIdArchitect -EventType 'scaffolding' `
    -Summary 'Drafting app/council/page.tsx + components/CouncilMemo.tsx.' `
    -Tools @('Read','Edit','Write')),
  (New-Event -AgentId 'starlight-architect' -RunId $runIdArchitect -EventType 'artifact.created' `
    -Summary 'Council module scaffold checked in.' `
    -Tools @('Write') -ArtifactsCreated @('art_demo_council_scaffold')),
  (New-Event -AgentId 'starlight-architect' -RunId $runIdArchitect -EventType 'decision.logged' `
    -Summary 'Decision dec_demo_council_shape captured. Council uses 7-perspective memo.' `
    -Tools @('sis.decision.log') -DecisionsCreated @('dec_demo_council_shape') -Risk 'medium'),
  (New-Event -AgentId 'starlight-prime' -RunId $runIdOrchestrator -EventType 'council.review.generated' `
    -Summary 'CouncilReview cr_demo_council_shape ready for approval gate.' `
    -Tools @('sis.council.review') -Risk 'high')
)

foreach ($evt in $steps) {
  Write-Event -Event $evt
  if ($DelayMs -gt 0) { Start-Sleep -Milliseconds $DelayMs }
}

if (-not $Quiet) {
  Write-Host ""
  Write-Host "[fixture] done -- 7 events appended"
  Write-Host "[fixture] re-run with -Cleanup to remove from ledger"
}

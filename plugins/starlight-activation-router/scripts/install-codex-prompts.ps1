param(
  [string]$CodexHome = (Join-Path $env:USERPROFILE ".codex"),
  [string]$PromptSource = (Join-Path (Split-Path -Parent $PSScriptRoot) "prompts")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $PromptSource)) {
  throw "Prompt source not found: $PromptSource"
}

$PromptTarget = Join-Path $CodexHome "prompts"
New-Item -ItemType Directory -Force -Path $PromptTarget | Out-Null

$promptNames = @("si.md", "so.md", "acos.md")
$installed = @()

foreach ($name in $promptNames) {
  $source = Join-Path $PromptSource $name
  $target = Join-Path $PromptTarget $name
  if (-not (Test-Path -Path $source)) {
    throw "Missing prompt template: $source"
  }
  Copy-Item -Force -Path $source -Destination $target
  $installed += $target
}

[ordered]@{
  codexHome = $CodexHome
  promptTarget = $PromptTarget
  installed = $installed
  nextStep = "Restart Codex or start a new thread, then type /si, /so, or /acos."
} | ConvertTo-Json -Depth 4

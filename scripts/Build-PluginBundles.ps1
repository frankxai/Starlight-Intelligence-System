param(
  [string]$DateTag = "2026-06-19",
  [string]$PluginRoot = "C:\Users\frank\plugins",
  [string]$DistRoot = "C:\Users\frank\starlight\repos\Starlight-Intelligence-System\dist\plugins"
)

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Content
  )

  [System.IO.File]::WriteAllText($Path, $Content + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

function Write-JsonNoBom {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)]$Object
  )

  $json = $Object | ConvertTo-Json -Depth 30
  Write-Utf8NoBom -Path $Path -Content $json
}

function Assert-UnderPath {
  param(
    [Parameter(Mandatory = $true)][string]$Child,
    [Parameter(Mandatory = $true)][string]$Parent
  )

  $resolvedParent = [System.IO.Path]::GetFullPath($Parent)
  $resolvedChild = [System.IO.Path]::GetFullPath($Child)
  if (-not $resolvedChild.StartsWith($resolvedParent, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing path outside expected parent. Child=$resolvedChild Parent=$resolvedParent"
  }
}

function New-MarketplaceEntry {
  param([Parameter(Mandatory = $true)][string]$PluginName)

  $manifestPath = Join-Path $PluginRoot "$PluginName\.codex-plugin\plugin.json"
  $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  $category = "Productivity"
  if ($manifest.interface -and $manifest.interface.category) {
    $category = [string]$manifest.interface.category
  }

  [pscustomobject]@{
    name = $PluginName
    source = [pscustomobject]@{
      source = "local"
      path = "./plugins/$PluginName"
    }
    policy = [pscustomobject]@{
      installation = "AVAILABLE"
      authentication = "ON_INSTALL"
    }
    category = $category
  }
}

function New-Readme {
  param(
    [Parameter(Mandatory = $true)]$Bundle,
    [Parameter(Mandatory = $true)][string]$ZipName
  )

  $installLines = @(
    "unzip $ZipName",
    "codex plugin marketplace add <path-to-extracted-bundle>",
    ($Bundle.plugins | ForEach-Object { "codex plugin add $_@$($Bundle.marketplaceName)" })
  )

  @"
# $($Bundle.displayName)

Version: $($Bundle.version)
Status: $($Bundle.publicStatus)
Audience: $($Bundle.audience)
Canonical site: $($Bundle.sitePlacement)

$($Bundle.description)

## Install

````bash
$($installLines -join "`n")
````

## First Workflow

$($Bundle.firstWorkflow)

## Includes

$($Bundle.plugins | ForEach-Object { "- ``$_``" } | Out-String)
## Publication Boundary

$($Bundle.publicationBoundary)

## Support And Upgrade Path

Use the public download page for technical installation, GitHub Releases for versioned assets, and FrankX AI for business implementation or advisory paths when relevant.
"@
}

function New-ReleaseNotes {
  param(
    [Parameter(Mandatory = $true)]$Bundle,
    [Parameter(Mandatory = $true)][string]$ZipName
  )

  @"
# Release Notes: $($Bundle.displayName)

Date: $DateTag
Artifact: $ZipName
Status: $($Bundle.publicStatus)

## What Shipped

$($Bundle.description)

## Modules

$($Bundle.plugins | ForEach-Object { "- ``$_``" } | Out-String)
## Validation Expected

- Plugin manifests validate with the Codex plugin validator.
- Skill frontmatter validates with the Codex skill validator.
- Bundle has a local marketplace file.
- Bundle has SHA-256 checksum.
- Public bundles contain only public wrapper modules and no private operating suite source.

## Site Placement

$($Bundle.sitePlacement)
"@
}

function Build-Bundle {
  param([Parameter(Mandatory = $true)]$Bundle)

  $stageRoot = Join-Path $DistRoot "_bundle-stage"
  $stage = Join-Path $stageRoot $Bundle.artifactBase
  Assert-UnderPath -Child $stageRoot -Parent $DistRoot
  if (Test-Path -LiteralPath $stage) {
    Assert-UnderPath -Child $stage -Parent $stageRoot
    Remove-Item -LiteralPath $stage -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path (Join-Path $stage "plugins") | Out-Null

  foreach ($plugin in $Bundle.plugins) {
    $source = Join-Path $PluginRoot $plugin
    $manifest = Join-Path $source ".codex-plugin\plugin.json"
    if (-not (Test-Path -LiteralPath $manifest)) {
      throw "Missing plugin manifest for $plugin at $manifest"
    }
    Copy-Item -LiteralPath $source -Destination (Join-Path $stage "plugins") -Recurse -Force
  }

  $marketplace = [pscustomobject]@{
    name = $Bundle.marketplaceName
    interface = [pscustomobject]@{
      displayName = $Bundle.displayName
    }
    plugins = @($Bundle.plugins | ForEach-Object { New-MarketplaceEntry -PluginName $_ })
  }
  Write-JsonNoBom -Path (Join-Path $stage "marketplace.json") -Object $marketplace

  $bundleManifest = [pscustomobject]@{
    name = $Bundle.artifactBase
    displayName = $Bundle.displayName
    version = $Bundle.version
    date = $DateTag
    type = $Bundle.type
    publicStatus = $Bundle.publicStatus
    audience = $Bundle.audience
    marketplaceName = $Bundle.marketplaceName
    sitePlacement = $Bundle.sitePlacement
    firstWorkflow = $Bundle.firstWorkflow
    publicationBoundary = $Bundle.publicationBoundary
    plugins = $Bundle.plugins
    install = @(
      "unzip $($Bundle.artifactBase).zip",
      "codex plugin marketplace add <path-to-extracted-bundle>"
    ) + @($Bundle.plugins | ForEach-Object { "codex plugin add $_@$($Bundle.marketplaceName)" })
  }
  Write-JsonNoBom -Path (Join-Path $stage "bundle.json") -Object $bundleManifest
  Write-Utf8NoBom -Path (Join-Path $stage "README.md") -Content (New-Readme -Bundle $Bundle -ZipName "$($Bundle.artifactBase).zip")
  Write-Utf8NoBom -Path (Join-Path $stage "RELEASE_NOTES.md") -Content (New-ReleaseNotes -Bundle $Bundle -ZipName "$($Bundle.artifactBase).zip")

  $zipPath = Join-Path $DistRoot "$($Bundle.artifactBase).zip"
  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $zipPath)

  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zipPath).Hash
  $shaPath = "$zipPath.sha256"
  Write-Utf8NoBom -Path $shaPath -Content "$hash  $([System.IO.Path]::GetFileName($zipPath))"

  [pscustomobject]@{
    name = $Bundle.artifactBase
    displayName = $Bundle.displayName
    path = $zipPath
    sha256 = $hash
    checksumPath = $shaPath
    publicStatus = $Bundle.publicStatus
    marketplaceName = $Bundle.marketplaceName
    pluginCount = $Bundle.plugins.Count
    plugins = $Bundle.plugins
  }
}

$publicWrappers = @(
  "founder-command-kit",
  "revenue-engine-kit",
  "starlight-system-module",
  "arcanea-world-engine",
  "enterprise-ai-kit",
  "creator-product-kit"
)

$productBundles = @(
  [pscustomobject]@{
    artifactBase = "starlight-founder-command-kit-$DateTag"
    displayName = "Founder Command Kit"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "starlight-founder-command"
    plugins = @("founder-command-kit")
    publicStatus = "public-ready-wrapper"
    audience = "Founders, operators, solo CEOs"
    description = "A focused founder command module for priorities, decisions, execution waves, and business operating snapshots."
    firstWorkflow = "Ask: Build my founder command brief. Provide products, current goals, constraints, and the next decision you need to make."
    sitePlacement = "frankx.ai/downloads as the business router, starlightintelligence.org/download as the technical install page."
    publicationBoundary = "Public wrapper only. Does not include private estate registries, local repo paths, customer records, or sensitive FrankX operating strategy."
  },
  [pscustomobject]@{
    artifactBase = "starlight-revenue-engine-kit-$DateTag"
    displayName = "Revenue Engine Kit"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "starlight-revenue-engine"
    plugins = @("revenue-engine-kit")
    publicStatus = "public-ready-wrapper"
    audience = "Founders, creators, SaaS teams, consultants"
    description = "A revenue module for offer architecture, price ladders, checkout paths, growth loops, and customer success."
    firstWorkflow = "Ask: Design my revenue engine. Provide the product, buyer, price range, proof, and current checkout path."
    sitePlacement = "frankx.ai/downloads for founder conversion, starlightintelligence.org/download for install."
    publicationBoundary = "Public wrapper only. Avoids private financials, customer data, and unsupported income claims."
  },
  [pscustomobject]@{
    artifactBase = "starlight-system-module-$DateTag"
    displayName = "Starlight System Module"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "starlight-system"
    plugins = @("starlight-system-module")
    publicStatus = "public-ready-wrapper"
    audience = "Builders, technical operators, AI teams"
    description = "A system module for memory, evals, release artifacts, proof, public/private gates, and validated AI distribution."
    firstWorkflow = "Ask: Package this as a Starlight system module. Provide the capability, intended users, and release target."
    sitePlacement = "starlightintelligence.org/download and GitHub Releases."
    publicationBoundary = "Public wrapper only. Does not expose private memory, internal eval traces, or full private-suite source."
  },
  [pscustomobject]@{
    artifactBase = "arcanea-world-engine-kit-$DateTag"
    displayName = "Arcanea World Engine"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "arcanea-world"
    plugins = @("arcanea-world-engine")
    publicStatus = "public-ready-wrapper-after-ip-review"
    audience = "Worldbuilders, creators, studios"
    description = "A creative worldbuilding module for genesis flows, canon maps, character systems, visual canon, and creator packs."
    firstWorkflow = "Ask: Create an Arcanea world engine. Provide a premise, audience, emotional promise, and intended format."
    sitePlacement = "Arcanea public surfaces for creative context, starlightintelligence.org/download for technical install."
    publicationBoundary = "Public wrapper only. Does not include private Arcanea canon, unreleased lore, premium IP, or media assets."
  },
  [pscustomobject]@{
    artifactBase = "starlight-enterprise-ai-kit-$DateTag"
    displayName = "Enterprise AI Kit"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "starlight-enterprise-ai"
    plugins = @("enterprise-ai-kit")
    publicStatus = "public-ready-wrapper"
    audience = "Consultants, internal AI leads, enterprise teams"
    description = "An enterprise AI module for readiness, CoE design, governance, migration planning, executive workshops, and proof packets."
    firstWorkflow = "Ask: Build my enterprise AI plan. Provide industry, stakeholders, systems, data constraints, and buyer goal."
    sitePlacement = "frankx.ai/downloads for advisory routing, starlightintelligence.org/download for install."
    publicationBoundary = "Public wrapper only. Avoids customer records, security-sensitive architecture, and unsupported ROI guarantees."
  },
  [pscustomobject]@{
    artifactBase = "starlight-creator-product-kit-$DateTag"
    displayName = "Creator Product Kit"
    version = "0.1.0"
    type = "codex-plugin-product-kit"
    marketplaceName = "starlight-creator-product"
    plugins = @("creator-product-kit")
    publicStatus = "public-ready-wrapper"
    audience = "Creators, coaches, media operators"
    description = "A creator product module for templates, prompt packs, media kits, digital downloads, launch assets, and audience monetization."
    firstWorkflow = "Ask: Package my creator product. Provide the asset, audience, transformation, format, and launch channel."
    sitePlacement = "frankx.ai/downloads for business routing, starlightintelligence.org/download for install."
    publicationBoundary = "Public wrapper only. Avoids private prompts, client assets, unreleased IP, and unsupported results claims."
  }
)

$publicSuite = [pscustomobject]@{
  artifactBase = "starlight-intelligence-modules-public-suite-$DateTag"
  displayName = "Starlight Intelligence Modules Public Suite"
  version = "0.1.0"
  type = "codex-plugin-public-suite"
  marketplaceName = "starlight-public-modules"
  plugins = $publicWrappers
  publicStatus = "public-ready-wrapper-suite"
  audience = "Founders, builders, creators, consultants, and AI operators"
  description = "The public-facing Starlight Intelligence Modules suite with six clean wrapper plugins for founder command, revenue, system packaging, Arcanea worldbuilding, enterprise AI, and creator products."
  firstWorkflow = "Install the suite, then ask for the module matching your mission: founder command, revenue engine, Starlight system, Arcanea world, enterprise AI, or creator product."
  sitePlacement = "starlightintelligence.org/download as the canonical technical page, GitHub Releases as the source of truth, frankx.ai/downloads as the business router."
  publicationBoundary = "Public wrapper suite only. Does not include the private 51-plugin operating suite, private registries, local paths, customer records, unreleased creative canon, or sensitive strategy."
}

$allPersonalPlugins = Get-ChildItem -LiteralPath $PluginRoot -Directory |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName ".codex-plugin\plugin.json") } |
  Sort-Object Name |
  Select-Object -ExpandProperty Name

$privateSuite = [pscustomobject]@{
  artifactBase = "starlight-private-plugin-suite-$DateTag-$($allPersonalPlugins.Count)"
  displayName = "Starlight Private Plugin Suite"
  version = "0.1.0"
  type = "codex-plugin-private-suite"
  marketplaceName = "starlight-private-suite"
  plugins = @($allPersonalPlugins)
  publicStatus = "private-only"
  audience = "Internal FrankX AI and Starlight operators"
  description = "The full private plugin estate for internal operation, including public wrappers and private business, creative, repo, memory, release, and Arcanea modules."
  firstWorkflow = "Internal only: install after private publication review, then run the relevant operating module for the current execution wave."
  sitePlacement = "Private storage only. Do not publish to public download pages."
  publicationBoundary = "Private only. May include local source attribution, private operating context, internal strategy, unreleased IP, and sensitive workflow assumptions."
}

New-Item -ItemType Directory -Force -Path $DistRoot | Out-Null
$results = @()
foreach ($bundle in $productBundles + @($publicSuite, $privateSuite)) {
  $results += Build-Bundle -Bundle $bundle
}

$registry = [pscustomobject]@{
  registryVersion = $DateTag
  generatedAt = (Get-Date).ToString("o")
  pluginRoot = $PluginRoot
  distRoot = $DistRoot
  publicWrapperPlugins = $publicWrappers
  publicSuite = $results | Where-Object { $_.name -eq $publicSuite.artifactBase } | Select-Object -First 1
  privateSuite = $results | Where-Object { $_.name -eq $privateSuite.artifactBase } | Select-Object -First 1
  productBundles = @($results | Where-Object { $_.name -notin @($publicSuite.artifactBase, $privateSuite.artifactBase) })
  distributionSites = [pscustomobject]@{
    technicalDownload = "https://starlightintelligence.org/download"
    businessRouter = "https://frankx.ai/downloads"
    releaseHost = "https://github.com/frankxai/Starlight-Intelligence-System/releases"
    arcaneaCreativeSurface = "Arcanea public surfaces after IP review"
  }
}

$registryPath = Join-Path $DistRoot "starlight-plugin-bundles-$DateTag.registry.json"
Write-JsonNoBom -Path $registryPath -Object $registry

$cleanupStageRoot = Join-Path $DistRoot "_bundle-stage"
if (Test-Path -LiteralPath $cleanupStageRoot) {
  Assert-UnderPath -Child $cleanupStageRoot -Parent $DistRoot
  Remove-Item -LiteralPath $cleanupStageRoot -Recurse -Force
}

$results | Format-Table name, publicStatus, pluginCount, sha256
Write-Host "Registry: $registryPath"

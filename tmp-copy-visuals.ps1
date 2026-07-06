$imgDir = 'C:\Users\frank\.grok\sessions\C%3A%5CUsers%5Cfrank%5Cstarlight%5Crepos%5CStarlight-Intelligence-System\019ef232-fce1-7e01-aa0c-f3e7ffb96dce\images'
$dest = 'docs\visuals'
New-Item -ItemType Directory -Force $dest | Out-Null

$copies = @(
  @{f='1.jpg'; t='08-readme-hero.jpg'},
  @{f='2.jpg'; t='09-six-vaults.jpg'},
  @{f='3.jpg'; t='10-council.jpg'},
  @{f='4.jpg'; t='11-mcp-tools.jpg'},
  @{f='5.jpg'; t='12-sip-layers.jpg'},
  @{f='6.jpg'; t='13-estate-factory.jpg'},
  @{f='7.jpg'; t='14-recall-screenshot.jpg'},
  @{f='8.jpg'; t='15-queen-loop.jpg'},
  @{f='9.jpg'; t='16-architecture-flow.jpg'},
  @{f='10.jpg'; t='17-attestation-everywhere.jpg'}
)

foreach ($c in $copies) {
  $src = Join-Path $imgDir $c.f
  $tgt = Join-Path $dest $c.t
  if (Test-Path $src) {
    Copy-Item $src $tgt -Force
    Write-Host "COPIED $($c.t)"
  } else {
    Write-Host "MISSING $src"
  }
}

Get-ChildItem $dest -Filter '*.jpg' | Where-Object { $_.Name -match '^(08|09|10|11|12|13|14|15|16|17)-' } | Sort-Object Name | Select-Object Name, Length
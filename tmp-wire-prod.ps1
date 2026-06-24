$srcDir = 'docs/visuals'
$destDir = 'site/public/assets/visuals'
New-Item -ItemType Directory -Force $destDir | Out-Null

Get-ChildItem $srcDir -Filter '*.jpg' | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $destDir $_.Name) -Force
  Write-Host "Wired $($_.Name)"
}

$count = (Get-ChildItem $destDir -Filter '*.jpg').Count
Write-Host "Total visuals in prod assets: $count"

# Also ensure site/images has key ones for the old queen-vision.html if it uses relative
$siteImg = 'site/images'
New-Item -ItemType Directory -Force $siteImg | Out-Null
# copy a few popular previous ones to site/images to help standalone htmls
Copy-Item (Join-Path $srcDir '06-self-advancing-sis-constellation.jpg') (Join-Path $siteImg '6.jpg') -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $srcDir '03-advanced-3d-memory-palace-v2.jpg') (Join-Path $siteImg '7.jpg') -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $srcDir '08-readme-hero.jpg') (Join-Path $siteImg 'hero.jpg') -Force -ErrorAction SilentlyContinue
Write-Host 'Also synced a few to site/images for legacy html references'
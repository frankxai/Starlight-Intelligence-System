# Daily restic backup of the SIS substrate.
#
# Repo target: $env:STARLIGHT_RESTIC_REPO (default: C:\Users\frank\.starlight\restic-repo)
# Password:    $env:STARLIGHT_RESTIC_PASSWORD_FILE (default: ~\.starlight\restic-password.txt)
#
# To switch to Backblaze B2:
#   $env:STARLIGHT_RESTIC_REPO = 'b2:bucket-name:/path'
#   $env:B2_ACCOUNT_ID = 'xxx'
#   $env:B2_ACCOUNT_KEY = 'yyy'
#
# Idempotent. Run as often as needed; restic dedupes.

$ErrorActionPreference = 'Stop'

$Repo         = if ($env:STARLIGHT_RESTIC_REPO) { $env:STARLIGHT_RESTIC_REPO } else { Join-Path $HOME '.starlight\restic-repo' }
$PasswordFile = if ($env:STARLIGHT_RESTIC_PASSWORD_FILE) { $env:STARLIGHT_RESTIC_PASSWORD_FILE } else { Join-Path $HOME '.starlight\restic-password.txt' }
$SisRoot      = 'C:\Users\frank\starlight\repos\Starlight-Intelligence-System'

# Ensure parent dirs exist for local repo + password file
foreach ($p in @((Split-Path $PasswordFile), $Repo)) {
    if ($p -and -not $p.StartsWith('b2:') -and -not $p.StartsWith('s3:')) {
        $null = New-Item -ItemType Directory -Force -Path $p -ErrorAction SilentlyContinue
    }
}

# Generate password if missing (one-time setup)
if (-not (Test-Path $PasswordFile)) {
    Write-Host "[restic] Generating password file at $PasswordFile" -ForegroundColor Cyan
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $password = [Convert]::ToBase64String($bytes)
    $password | Out-File -FilePath $PasswordFile -Encoding ascii -NoNewline
    Write-Host "[restic] *** SAVE THIS PASSWORD SOMEWHERE SAFE — without it the backup is unrecoverable ***" -ForegroundColor Yellow
    Write-Host "[restic] Password file: $PasswordFile" -ForegroundColor Yellow
}

# Init repo if missing (first run)
$env:RESTIC_REPOSITORY = $Repo
$env:RESTIC_PASSWORD_FILE = $PasswordFile

$repoExists = $false
try {
    & restic cat config 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $repoExists = $true }
} catch { }

if (-not $repoExists) {
    Write-Host "[restic] Initializing new repo at $Repo" -ForegroundColor Cyan
    & restic init
    if ($LASTEXITCODE -ne 0) { throw "restic init failed" }
}

# Backup targets — substrate, vaults, instance state
$targets = @(
    (Join-Path $SisRoot 'memory'),
    (Join-Path $HOME '.starlight'),
    (Join-Path $SisRoot 'private\voice-operator\config'),
    (Join-Path $SisRoot 'private\voice-operator\models'),
    (Join-Path $SisRoot 'private\voice-operator\logs'),
    (Join-Path $SisRoot 'private\memory-bus')
) | Where-Object { Test-Path $_ }

$excludes = @(
    '--exclude', '*__pycache__*',
    '--exclude', '*.pytest_cache*',
    '--exclude', '*.ruff_cache*',
    '--exclude', '*node_modules*',
    '--exclude', '*.next*',
    '--exclude', $PasswordFile  # never backup the password itself
)

Write-Host "[restic] Backing up $($targets.Count) paths..." -ForegroundColor Cyan
$tag = "daily-$(Get-Date -Format 'yyyy-MM-dd')"
& restic backup --tag $tag @excludes $targets
if ($LASTEXITCODE -ne 0) { throw "restic backup failed" }

# Prune old snapshots: keep 14 daily, 8 weekly, 6 monthly
Write-Host "[restic] Applying retention policy..." -ForegroundColor Cyan
& restic forget --tag daily --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune
if ($LASTEXITCODE -ne 0) { Write-Warning "restic forget failed (non-fatal)" }

Write-Host "[restic] Backup complete." -ForegroundColor Green

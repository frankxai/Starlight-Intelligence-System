# Daily restic backup of the SIS substrate.
[CmdletBinding()]
param(
    [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'

$Repo = if ($env:STARLIGHT_RESTIC_REPO) { $env:STARLIGHT_RESTIC_REPO } else { Join-Path $HOME '.starlight\restic-repo' }
$PasswordFile = if ($env:STARLIGHT_RESTIC_PASSWORD_FILE) { $env:STARLIGHT_RESTIC_PASSWORD_FILE } else { Join-Path $HOME '.starlight\restic-password.txt' }
$SisRoot = Join-Path $HOME 'Starlight-Intelligence-System'
$StarlightRoot = Join-Path $HOME '.starlight'
$isRemoteRepo = ($Repo -match '^[a-z][a-z0-9+.-]+:') -and ($Repo -notmatch '^[A-Za-z]:[\\/]')

$targets = @(
    (Join-Path $SisRoot 'memory'),
    $StarlightRoot,
    (Join-Path $SisRoot 'private\voice-operator\config'),
    (Join-Path $SisRoot 'private\voice-operator\models'),
    (Join-Path $SisRoot 'private\voice-operator\logs'),
    (Join-Path $SisRoot 'private\memory-bus')
) | Where-Object { Test-Path -LiteralPath $_ }

if (-not (Test-Path -LiteralPath $SisRoot -PathType Container)) {
    Write-Error "SIS root missing: $SisRoot"
    exit 2
}
if ($targets.Count -eq 0) {
    Write-Error 'Backup has zero existing source paths. Refusing false-green success.'
    exit 2
}
if (-not (Get-Command restic -ErrorAction SilentlyContinue)) {
    Write-Error 'restic CLI not found in PATH'
    exit 2
}

if ($ValidateOnly) {
    [pscustomobject]@{
        valid = $true
        sisRoot = $SisRoot
        repository = $Repo
        repositoryIsRemote = $isRemoteRepo
        sourceCount = $targets.Count
        sources = $targets
        selfRepositoryExcluded = (-not $isRemoteRepo)
        passwordExists = (Test-Path -LiteralPath $PasswordFile -PathType Leaf)
    } | ConvertTo-Json -Depth 4
    exit 0
}

if (-not $isRemoteRepo) {
    New-Item -ItemType Directory -Path $Repo -Force | Out-Null
}
New-Item -ItemType Directory -Path (Split-Path $PasswordFile) -Force | Out-Null

if (-not (Test-Path -LiteralPath $PasswordFile -PathType Leaf)) {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    [Convert]::ToBase64String($bytes) | Out-File -FilePath $PasswordFile -Encoding ascii -NoNewline
    Write-Warning "Generated a new restic password file at $PasswordFile. Back it up separately."
}

$env:RESTIC_REPOSITORY = $Repo
$env:RESTIC_PASSWORD_FILE = $PasswordFile

& restic cat config 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    & restic init
    if ($LASTEXITCODE -ne 0) { throw 'restic init failed' }
}

# The local repository lives under ~/.starlight, which is also a source. Exclude
# both the repository and password explicitly to prevent recursive self-backup.
$excludes = @('--exclude', $Repo, '--exclude', $PasswordFile, '--exclude', '*__pycache__*', '--exclude', '*.pytest_cache*', '--exclude', '*.ruff_cache*', '--exclude', '*node_modules*', '--exclude', '*.next*', '--exclude', '*.turbo*')
$tag = "daily-$(Get-Date -Format 'yyyy-MM-dd')"
Write-Host "[restic] Backing up $($targets.Count) validated paths..."
& restic backup --tag daily --tag $tag @excludes $targets
if ($LASTEXITCODE -ne 0) { throw 'restic backup failed' }

# Verify the repository has a readable latest snapshot before retention.
& restic snapshots --latest 1
if ($LASTEXITCODE -ne 0) { throw 'restic latest-snapshot verification failed' }

& restic forget --tag daily --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune
if ($LASTEXITCODE -ne 0) { throw 'restic retention/prune failed' }

Write-Host '[restic] Backup and snapshot verification complete.' -ForegroundColor Green

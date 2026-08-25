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
    '--exclude', $PasswordFile,  # never backup the password itself
    # CRITICAL: the default repo lives at ~/.starlight/restic-repo, which is INSIDE the
    # ~/.starlight backup target. Without this exclude the repository backs itself up, and
    # each run ingests the previous run's packs — a compounding feedback loop.
    # Observed 2026-08-03: snapshot sizes went 99.4 GiB (07-29) -> 161.6 GiB (01:04)
    # -> 260.8 GiB (02:15) against only a few GB of real source data, tracking the repo's
    # own growth. It drove C: from 149 GB free to 1.0 GB in a single night.
    # Keep this exclude ahead of any repo-location change; if $Repo moves, this must follow.
    '--exclude', $Repo
)

Write-Host "[restic] Backing up $($targets.Count) paths..." -ForegroundColor Cyan
$tag = "daily-$(Get-Date -Format 'yyyy-MM-dd')"
# Bounded lock wait: if another generation is mid-prune, fail fast and loudly rather than
# blocking forever. A hung generation used to stall every later run — the backup silently
# produced no snapshot for 5 days (2026-07-29 .. 2026-08-03) while the scheduled task
# reported success, because the launcher wrapper detached and never propagated exit codes.
& restic backup --tag $tag --retry-lock 10m @excludes $targets
if ($LASTEXITCODE -ne 0) { throw "restic backup failed" }

# Assert the snapshot actually landed. Exit code alone proved insufficient — this is the
# check that would have caught the 5-day gap on day one.
$today = Get-Date -Format 'yyyy-MM-dd'
$landed = $false
try {
    $snaps = & restic snapshots --tag $tag --json 2>$null | ConvertFrom-Json
    # ConvertFrom-Json coerces the ISO timestamp into [DateTime], whose default string form
    # is MM/dd/yyyy — so a `-like "yyyy-MM-dd*"` match here silently never fires and this
    # assertion fails on a snapshot that actually saved. Normalise before comparing.
    $landed = @($snaps | Where-Object {
        try { ([datetime]$_.time).ToString('yyyy-MM-dd') -eq $today } catch { "$($_.time)" -like "$today*" }
    }).Count -gt 0
} catch { }
if (-not $landed) { throw "restic backup reported success but no snapshot tagged $tag exists for $today" }
Write-Host "[restic] Snapshot verified for $today." -ForegroundColor Green

# Retention. Deliberately LAST and deliberately non-blocking: prune takes an EXCLUSIVE lock,
# so an overrunning prune must never be able to starve tomorrow's backup. --retry-lock bounds
# the wait; a skipped prune is a warning, never a failure.
#
# WARNING: never SIGKILL restic during prune. It writes repacked packs before deleting the
# originals, so a mid-prune kill leaves both copies. That cost ~70GB on 2026-08-03 and drove
# C: under 5% free. Recovery: restic unlock; restic prune --max-repack-size 0
Write-Host "[restic] Applying retention policy..." -ForegroundColor Cyan
& restic forget --tag daily --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune --retry-lock 15m
if ($LASTEXITCODE -ne 0) {
    Write-Warning "restic forget/prune did not complete (non-fatal). Retention has NOT been applied this run; repo will keep growing until a prune succeeds."
}

Write-Host "[restic] Backup complete." -ForegroundColor Green

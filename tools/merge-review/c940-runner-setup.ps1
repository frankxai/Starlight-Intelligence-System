#Requires -Version 7.2
<#
.SYNOPSIS
  Sets up the ephemeral `starlight-checker` self-hosted runner on the C940 (Windows, no WSL).

.DESCRIPTION
  OFF by default. The workflow job only runs when the repository variable
  C940_CHECKER_ENABLED is 'true'. Do not set it until runner administration has an owner
  independent of the agents' shared login (docs/merge-review-runner.md). The job never
  receives the checker App key: it signs its review with a key on this machine and a
  GitHub-hosted job verifies the signature before anything is recorded.

  Two accounts keep the registration credential away from job code:
    * SYSTEM runs the registrar loop (scheduled task StarlightCheckerRegistrar). Before
      every registration it re-verifies the runner archive against the release SHA-256
      and every extracted file against the manifest taken at install, then registers one
      --ephemeral runner, starts the job task and waits for it to finish.
    * A low-privilege local user (default starlight-runner, never an administrator)
      runs the job task StarlightCheckerJob, which cleans its own work folder and
      starts run.cmd. That user can read and execute the runner bundle but cannot change
      it, and cannot read the PAT, so SYSTEM never executes code the job could write.
  Registration refuses to proceed while free disk on the work drive is below -MinFreeGB.

  Modes:
    Install    (elevated, interactive) user, folders, ACLs, runner download with SHA-256
               check, bundle manifest, signing key, PAT storage, batch-logon right, tasks.
    Registrar  (SYSTEM, from the scheduled task) the verify/register/run/repeat loop.
    Job        (runner user, from the job task) clean work folders, then run.cmd.
    Status     read-only health report.
    Uninstall  (elevated) removes both tasks; leaves the user and folders for review.

  Unverified: written without access to the C940. Run Status after Install and watch the
  first job before relying on it. See docs/merge-review-runner.md.

.EXAMPLE
  pwsh -File c940-runner-setup.ps1 -Mode Install -RunnerVersion <x.y.z> -RunnerSha256 <hash>
#>
[CmdletBinding()]
param(
    [ValidateSet('Install', 'Registrar', 'Job', 'Status', 'Uninstall')]
    [string]$Mode = 'Status',
    [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
    [string]$Repository = 'frankxai/Starlight-Intelligence-System',
    [ValidatePattern('^[a-z][a-z0-9-]{2,19}$')]
    [string]$RunnerUser = 'starlight-runner',
    [string]$Root = 'C:\starlight-checker',
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$RunnerVersion,
    [ValidatePattern('^[0-9a-fA-F]{64}$')]
    [string]$RunnerSha256,
    [ValidateRange(5, 500)]
    [int]$MinFreeGB = 15,
    [string]$Label = 'starlight-checker',
    [string]$RunnerName = 'c940-checker',
    # Runner groups exist only for organisations. A user-owned repository has none; set
    # this only after the repository moves to an org with a group restricted to it.
    [string]$RunnerGroup = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RegistrarTask = 'StarlightCheckerRegistrar'
$JobTask = 'StarlightCheckerJob'
$Paths = @{
    Runner  = Join-Path $Root 'runner'
    Work    = Join-Path $Root 'work'
    Logs    = Join-Path $Root 'logs'
    Secret  = Join-Path $Root 'secret'
    Bin     = Join-Path $Root 'bin'
    Signing = Join-Path $Root 'signing'
}
$Diag = Join-Path $Paths.Runner '_diag'
$PatFile = Join-Path $Paths.Secret 'registration-pat.bin'
$ReleaseFile = Join-Path $Paths.Secret 'runner-release.json'
$ManifestFile = Join-Path $Paths.Secret 'runner-bundle-manifest.json'
$ArchiveFile = Join-Path $Paths.Secret 'runner.zip'
# Files config.cmd writes per registration; everything else in the bundle is pinned.
$StateFiles = @('.runner', '.credentials', '.credentials_rsaparams', '.env', '.path', '.service')
$Entropy = [Text.Encoding]::UTF8.GetBytes("starlight-checker:$Repository")

function Write-Log([string]$Message) {
    $line = '{0:u} {1}' -f (Get-Date), $Message
    # SYSTEM logs go to the SYSTEM-only folder: registrar errors may quote API responses,
    # and SYSTEM never writes into a folder the job user can change.
    $folder = if ($Mode -eq 'Registrar') { $Paths.Secret } else { $Paths.Logs }
    if (Test-Path $folder) {
        $log = Join-Path $folder "$($Mode.ToLowerInvariant()).log"
        if ((Test-Path $log) -and (Get-Item $log).Length -gt 5MB) { Move-Item $log "$log.1" -Force }
        Add-Content -Path $log -Value $line
    }
    Write-Host $line
}

function Assert-Admin {
    $principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Mode $Mode needs an elevated PowerShell 7 session."
    }
}

function Get-FreeGB {
    $drive = (Split-Path -Qualifier $Root).TrimEnd(':')
    [math]::Round((Get-PSDrive -Name $drive).Free / 1GB, 1)
}

function Test-DiskFloor([switch]$Throw) {
    $free = Get-FreeGB
    if ($free -ge $MinFreeGB) { return $true }
    $message = "Free disk ${free} GB is below the ${MinFreeGB} GB floor; not registering a runner."
    if ($Throw) { throw $message }
    Write-Log $message
    return $false
}

function Set-StrictAcl([string]$Path, [hashtable]$Grants) {
    $acl = [Security.AccessControl.DirectorySecurity]::new()
    $acl.SetAccessRuleProtection($true, $false)
    $inherit = 'ContainerInherit,ObjectInherit'
    foreach ($identity in $Grants.Keys) {
        $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new(
            $identity, $Grants[$identity], $inherit, 'None', 'Allow'))
    }
    Set-Acl -Path $Path -AclObject $acl
}

function Get-OwnerGrants { @{ 'BUILTIN\Administrators' = 'FullControl'; 'NT AUTHORITY\SYSTEM' = 'FullControl' } }

function Grant-BatchLogon([string]$User) {
    $sid = (New-Object Security.Principal.NTAccount($User)).Translate([Security.Principal.SecurityIdentifier]).Value
    $temp = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "secedit-$([guid]::NewGuid())")
    try {
        $cfg = Join-Path $temp 'rights.inf'
        secedit /export /cfg $cfg /areas USER_RIGHTS | Out-Null
        $lines = Get-Content $cfg
        $current = $lines | Where-Object { $_ -match '^SeBatchLogonRight' }
        if ($current -and $current -match [regex]::Escape("*$sid")) { return }
        $value = if ($current) { "$current,*$sid" } else { "SeBatchLogonRight = *$sid" }
        $body = @('[Unicode]', 'Unicode=yes', '[Version]', 'signature="$CHICAGO$"', 'Revision=1',
                  '[Privilege Rights]', $value)
        Set-Content -Path $cfg -Value $body -Encoding Unicode
        secedit /configure /db (Join-Path $temp 'rights.sdb') /cfg $cfg /areas USER_RIGHTS | Out-Null
    } finally {
        Remove-Item $temp -Recurse -Force
    }
}

function Add-ProtectedData {
    if (-not ('System.Security.Cryptography.ProtectedData' -as [type])) {
        Add-Type -AssemblyName System.Security.Cryptography.ProtectedData
    }
}

function Protect-Pat([Security.SecureString]$Secure) {
    Add-ProtectedData
    $plain = [Net.NetworkCredential]::new('', $Secure).Password
    if ($plain -notmatch '^github_pat_[A-Za-z0-9_]{20,}$') { throw 'Expected a fine-grained PAT (github_pat_...).' }
    $bytes = [Security.Cryptography.ProtectedData]::Protect(
        [Text.Encoding]::UTF8.GetBytes($plain), $Entropy, 'LocalMachine')
    [IO.File]::WriteAllBytes($PatFile, $bytes)
}

function Get-RegistrationToken {
    Add-ProtectedData
    $pat = [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect(
        [IO.File]::ReadAllBytes($PatFile), $Entropy, 'LocalMachine'))
    $response = Invoke-RestMethod -Method Post `
        -Uri "https://api.github.com/repos/$Repository/actions/runners/registration-token" `
        -Headers @{ Authorization = "Bearer $pat"; Accept = 'application/vnd.github+json';
                    'X-GitHub-Api-Version' = '2022-11-28' }
    return $response.token
}

function Get-BundleManifest {
    $prefix = $Paths.Runner.TrimEnd('\') + '\'
    $manifest = [ordered]@{}
    Get-BundleItems -File | Where-Object { $_.Name -notin $StateFiles } |
        Sort-Object FullName | ForEach-Object {
            $manifest[$_.FullName.Substring($prefix.Length)] = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        }
    return $manifest
}

function Get-BundleItems([switch]$File) {
    # Everything under the runner folder except the job-writable _diag folders, which
    # SYSTEM only ever renames.
    Get-ChildItem $Paths.Runner -Force | Where-Object { $_.Name -notlike '_diag*' } | ForEach-Object {
        if ($File -and -not $_.PSIsContainer) { $_ }
        if (-not $File) { $_ }
        if ($_.PSIsContainer) { Get-ChildItem $_.FullName -Recurse -Force -File:$File -ErrorAction Stop }
    }
}

function Assert-NoReparsePoints {
    $links = @(Get-Item $Paths.Runner -Force) + @(Get-BundleItems) |
        Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
    if ($links) { throw "Reparse point in the runner bundle; refusing to act on it as SYSTEM." }
}

function Assert-RunnerBundle {
    # 1. The kept archive still matches the release checksum recorded at install.
    $release = Get-Content $ReleaseFile -Raw | ConvertFrom-Json
    $hash = (Get-FileHash $ArchiveFile -Algorithm SHA256).Hash
    if ($hash -ne $release.sha256) { throw "Runner archive no longer matches release SHA-256 $($release.sha256)." }
    # 2. Every extracted file still matches the manifest taken from that archive.
    $expected = Get-Content $ManifestFile -Raw | ConvertFrom-Json -AsHashtable
    $actual = Get-BundleManifest
    $changed = @($expected.Keys | Where-Object { $actual[$_] -ne $expected[$_] }) +
               @($actual.Keys | Where-Object { -not $expected.ContainsKey($_) })
    if ($changed) { throw "Runner bundle changed since install: $($changed | Select-Object -First 5)." }
    # 3. The job user still cannot write the bundle.
    $rules = (Get-Acl $Paths.Runner).Access | Where-Object {
        $_.IdentityReference -match "\\$RunnerUser$" -and
        ($_.FileSystemRights -band [Security.AccessControl.FileSystemRights]::Write) }
    if ($rules) { throw "$RunnerUser has write access to the runner bundle." }
    Assert-NoReparsePoints
}

function Install-Checker {
    Assert-Admin
    if (-not $RunnerVersion -or -not $RunnerSha256) {
        throw 'Install needs -RunnerVersion and -RunnerSha256 from the actions/runner release page.'
    }
    Test-DiskFloor -Throw | Out-Null

    if (-not (Get-LocalUser -Name $RunnerUser -ErrorAction SilentlyContinue)) {
        $password = [Security.SecureString]::new()
        $bytes = [byte[]]::new(48)
        [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        foreach ($c in [Convert]::ToBase64String($bytes).ToCharArray()) { $password.AppendChar($c) }
        New-LocalUser -Name $RunnerUser -Password $password -PasswordNeverExpires `
            -UserMayNotChangePassword -AccountNeverExpires `
            -Description 'Starlight independent checker runner (low privilege)' | Out-Null
        $script:RunnerPassword = $password
    } else {
        $script:RunnerPassword = Read-Host "Password for existing local user $RunnerUser" -AsSecureString
    }
    $admins = Get-LocalGroupMember -SID 'S-1-5-32-544' | Where-Object { $_.Name -match "\\$RunnerUser$" }
    if ($admins) { throw "$RunnerUser is an administrator; remove it from Administrators first." }

    foreach ($path in $Paths.Values) { New-Item -ItemType Directory -Force -Path $path | Out-Null }
    $owner = Get-OwnerGrants
    Set-StrictAcl $Paths.Secret $owner
    # Read and execute only: the job user can never change code that SYSTEM later runs.
    foreach ($key in 'Bin', 'Runner', 'Signing') { Set-StrictAcl $Paths[$key] ($owner + @{ $RunnerUser = 'ReadAndExecute' }) }
    foreach ($key in 'Work', 'Logs') { Set-StrictAcl $Paths[$key] ($owner + @{ $RunnerUser = 'Modify' }) }

    $url = "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip"
    Invoke-WebRequest -Uri $url -OutFile $ArchiveFile
    $hash = (Get-FileHash $ArchiveFile -Algorithm SHA256).Hash
    if ($hash -ne $RunnerSha256.ToUpperInvariant()) {
        Remove-Item $ArchiveFile -Force
        throw "Runner archive SHA-256 mismatch ($hash)."
    }
    Get-ChildItem $Paths.Runner -Force | Remove-Item -Recurse -Force
    Expand-Archive -Path $ArchiveFile -DestinationPath $Paths.Runner -Force
    @{ version = $RunnerVersion; sha256 = $hash } | ConvertTo-Json | Set-Content $ReleaseFile
    Get-BundleManifest | ConvertTo-Json | Set-Content $ManifestFile

    if (-not (Test-Path (Join-Path $Paths.Signing 'c940-checker'))) {
        ssh-keygen -q -t ed25519 -N '' -C c940-checker -f (Join-Path $Paths.Signing 'c940-checker')
        if ($LASTEXITCODE -ne 0) { throw 'ssh-keygen failed to create the signing key.' }
    }
    $public = (Get-Content (Join-Path $Paths.Signing 'c940-checker.pub') -Raw).Trim()
    Write-Host 'Pin this line as c940.allowedSigners in tools/merge-review/checker-trust.json (reviewed PR):'
    Write-Host "c940-checker namespaces=`"starlight-checker-c940`" $public"

    Write-Host 'Paste a fine-grained PAT limited to this one repository with only'
    Write-Host '"Administration: Read and write" (needed to mint runner registration tokens).'
    Protect-Pat (Read-Host 'Registration PAT' -AsSecureString)

    Copy-Item -Path $PSCommandPath -Destination (Join-Path $Paths.Bin 'c940-runner-setup.ps1') -Force
    Grant-BatchLogon $RunnerUser
    Register-Tasks
    Write-Host "Installed. Next: sign in once as $RunnerUser and log in each reviewer CLI (see doc)."
}

function Register-Tasks {
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries `
        -AllowStartIfOnBatteries -MultipleInstances IgnoreNew -RestartCount 999 `
        -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
    $script = Join-Path $Paths.Bin 'c940-runner-setup.ps1'
    $pwsh = (Get-Command pwsh).Source
    $common = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$script`" " +
        "-Repository $Repository -RunnerUser $RunnerUser -Root `"$Root`" -MinFreeGB $MinFreeGB " +
        "-Label $Label -RunnerName $RunnerName"
    if ($RunnerGroup) { $common += " -RunnerGroup `"$RunnerGroup`"" }
    Register-ScheduledTask -TaskName $RegistrarTask -Force -Settings $settings `
        -Trigger (New-ScheduledTaskTrigger -AtStartup) `
        -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "$common -Mode Registrar") `
        -Principal (New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest) | Out-Null

    $jobSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 12)
    $plain = [Net.NetworkCredential]::new('', $script:RunnerPassword).Password
    Register-ScheduledTask -TaskName $JobTask -Force -Settings $jobSettings `
        -Action (New-ScheduledTaskAction -Execute $pwsh -Argument "$common -Mode Job" -WorkingDirectory $Paths.Work) `
        -User "$env:COMPUTERNAME\$RunnerUser" -Password $plain -RunLevel Limited | Out-Null
    $plain = $null
    Start-ScheduledTask -TaskName $RegistrarTask
}

function Reset-Diag {
    # The job user may have planted links in the old _diag. Rename it (moves a link, never
    # follows it) for the job user to delete, and give config.cmd a fresh SYSTEM-only one.
    if (Test-Path $Diag) { Rename-Item $Diag ('_diag-old-{0:yyyyMMddHHmmss}' -f (Get-Date)) }
    New-Item -ItemType Directory -Path $Diag | Out-Null
    Set-StrictAcl $Diag (Get-OwnerGrants)
}

function Stop-JobUserProcesses {
    # A job could leave a process behind to watch for the next registration. Nothing the
    # job user runs may outlive its job, so stop it before SYSTEM handles any credential.
    $leftovers = Get-Process -IncludeUserName -ErrorAction SilentlyContinue |
        Where-Object { $_.UserName -match "\$RunnerUser$" }
    foreach ($process in $leftovers) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    if (Get-Process -IncludeUserName -ErrorAction SilentlyContinue | Where-Object { $_.UserName -match "\$RunnerUser$" }) {
        throw "Processes of $RunnerUser are still running; not registering."
    }
}

function Protect-ConfigDiag {
    # config.cmd logged as SYSTEM into the fresh _diag. Move those logs to the SYSTEM-only
    # folder before the job user gets a writable _diag, so no registration output, masked
    # or not, is ever readable by job code.
    $archive = Join-Path $Paths.Secret ('config-diag-{0:yyyyMMddHHmmss}' -f (Get-Date))
    Move-Item $Diag $archive
    Get-ChildItem $Paths.Secret -Directory -Filter 'config-diag-*' | Sort-Object Name -Descending |
        Select-Object -Skip 5 | Remove-Item -Recurse -Force
    New-Item -ItemType Directory -Path $Diag | Out-Null
    Set-StrictAcl $Diag ((Get-OwnerGrants) + @{ $RunnerUser = 'Modify' })
}

function Invoke-Registrar {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $identity.IsSystem) { throw 'Registrar mode runs only as SYSTEM from its scheduled task.' }
    while ($true) {
        if (-not (Test-DiskFloor)) { Start-Sleep -Seconds 600; continue }
        try {
            foreach ($stale in $StateFiles) {
                Remove-Item (Join-Path $Paths.Runner $stale) -Force -ErrorAction SilentlyContinue
            }
            Stop-JobUserProcesses
            Reset-Diag
            Assert-RunnerBundle
            $token = Get-RegistrationToken
            $name = '{0}-{1:yyyyMMddHHmmss}' -f $RunnerName, (Get-Date)
            $configArgs = @('--unattended', '--url', "https://github.com/$Repository", '--token', $token,
                            '--name', $name, '--labels', $Label, '--work', $Paths.Work, '--ephemeral',
                            '--replace', '--disableupdate')
            if ($RunnerGroup) { $configArgs += @('--runnergroup', $RunnerGroup) }
            # config.cmd is a verified, job-read-only bundle file; nothing it loads is job-writable.
            # The one-hour registration token reaches config.cmd as an argument of a SYSTEM
            # process. A standard user cannot read another account's process memory or
            # command line, and no job-user process is running at this point.
            & (Join-Path $Paths.Runner 'config.cmd') @configArgs | Out-Null
            $token = $null
            if ($LASTEXITCODE -ne 0) { throw "config.cmd exited $LASTEXITCODE" }
            # The listener running as the job user writes its own logs to a fresh _diag.
            Protect-ConfigDiag
            Write-Log "Registered ephemeral runner $name; starting job task."
            Start-ScheduledTask -TaskName $JobTask
            Start-Sleep -Seconds 15
            while ((Get-ScheduledTask -TaskName $JobTask).State -eq 'Running') { Start-Sleep -Seconds 30 }
            Write-Log "Runner $name finished (task result $((Get-ScheduledTaskInfo -TaskName $JobTask).LastTaskResult))."
        } catch {
            Write-Log "Registrar error: $($_.Exception.Message)"
            Start-Sleep -Seconds 120
        }
    }
}

function Invoke-Job {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]$identity
    if ($identity.IsSystem -or $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Job mode runs only as the low-privilege runner user.'
    }
    # Cleanup runs as the job user, so a link planted by a job can only reach what that
    # user could already delete.
    Get-ChildItem $Paths.Work -Force | Remove-Item -Recurse -Force
    Get-ChildItem $Paths.Runner -Directory -Filter '_diag-old-*' -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    & (Join-Path $Paths.Runner 'run.cmd')
    exit $LASTEXITCODE
}

function Show-Status {
    $free = Get-FreeGB
    [pscustomobject]@{
        FreeGB          = $free
        DiskFloorOk     = $free -ge $MinFreeGB
        RunnerUser      = [bool](Get-LocalUser -Name $RunnerUser -ErrorAction SilentlyContinue)
        RegistrarTask   = (Get-ScheduledTask -TaskName $RegistrarTask -ErrorAction SilentlyContinue)?.State
        JobTask         = (Get-ScheduledTask -TaskName $JobTask -ErrorAction SilentlyContinue)?.State
        PatStored       = Test-Path $PatFile
        BundlePinned    = (Test-Path $ManifestFile) -and (Test-Path $ArchiveFile)
        SigningKey      = Test-Path (Join-Path $Paths.Signing 'c940-checker.pub')
        RunnerInstalled = Test-Path (Join-Path $Paths.Runner 'run.cmd')
        Registered      = Test-Path (Join-Path $Paths.Runner '.runner')
    } | Format-List
}

function Uninstall-Checker {
    Assert-Admin
    foreach ($task in $RegistrarTask, $JobTask) {
        Stop-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
    }
    Write-Host "Tasks removed. Remove the runner in repo Settings > Actions > Runners if it is still listed;"
    Write-Host "delete $Root, $PatFile and user $RunnerUser by hand after review, revoke the PAT and"
    Write-Host "remove c940.allowedSigners from checker-trust.json."
}

switch ($Mode) {
    'Install' { Install-Checker }
    'Registrar' { Invoke-Registrar }
    'Job' { Invoke-Job }
    'Status' { Show-Status }
    'Uninstall' { Uninstall-Checker }
}

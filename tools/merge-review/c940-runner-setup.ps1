#Requires -Version 7.0
<#
.SYNOPSIS
  Sets up the ephemeral `starlight-checker` self-hosted runner on the C940 (Windows, no WSL).

.DESCRIPTION
  Two accounts keep the registration credential away from job code:
    * SYSTEM runs the registrar loop (scheduled task StarlightCheckerRegistrar). It reads
      the DPAPI-protected registration PAT, registers one --ephemeral runner, starts the
      job task and waits for it to finish, then registers again.
    * A low-privilege local user (default starlight-runner, never an administrator)
      runs run.cmd through the on-demand task StarlightCheckerJob. That user cannot read
      the PAT file, so a prompt-injected reviewer CLI cannot reach it.
  Registration refuses to proceed while free disk on the work drive is below -MinFreeGB.

  Modes:
    Install    (elevated, interactive) user, folders, ACLs, runner download with SHA-256
               check, PAT storage, batch-logon right, both scheduled tasks.
    Registrar  (SYSTEM, from the scheduled task) the register/run/repeat loop.
    Status     read-only health report.
    Uninstall  (elevated) removes both tasks; leaves the user and folders for review.

  Unverified: written without access to the C940. Run Status after Install and watch the
  first job before relying on it. See docs/merge-review-runner.md.

.EXAMPLE
  pwsh -File c940-runner-setup.ps1 -Mode Install -RunnerVersion <x.y.z> -RunnerSha256 <hash>
#>
[CmdletBinding()]
param(
    [ValidateSet('Install', 'Registrar', 'Status', 'Uninstall')]
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
    Runner = Join-Path $Root 'runner'
    Work   = Join-Path $Root 'work'
    Logs   = Join-Path $Root 'logs'
    Secret = Join-Path $Root 'secret'
    Bin    = Join-Path $Root 'bin'
}
$PatFile = Join-Path $Paths.Secret 'registration-pat.bin'
$Entropy = [Text.Encoding]::UTF8.GetBytes("starlight-checker:$Repository")

function Write-Log([string]$Message) {
    $line = '{0:u} {1}' -f (Get-Date), $Message
    if (Test-Path $Paths.Logs) {
        $log = Join-Path $Paths.Logs 'registrar.log'
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
    $owner = @{ 'BUILTIN\Administrators' = 'FullControl'; 'NT AUTHORITY\SYSTEM' = 'FullControl' }
    Set-StrictAcl $Paths.Secret $owner
    Set-StrictAcl $Paths.Bin ($owner + @{ $RunnerUser = 'ReadAndExecute' })
    foreach ($key in 'Runner', 'Work', 'Logs') { Set-StrictAcl $Paths[$key] ($owner + @{ $RunnerUser = 'Modify' }) }

    $zip = Join-Path $env:TEMP "actions-runner-$RunnerVersion.zip"
    $url = "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip"
    Invoke-WebRequest -Uri $url -OutFile $zip
    $hash = (Get-FileHash $zip -Algorithm SHA256).Hash
    if ($hash -ne $RunnerSha256.ToUpperInvariant()) {
        Remove-Item $zip -Force
        throw "Runner archive SHA-256 mismatch ($hash)."
    }
    Expand-Archive -Path $zip -DestinationPath $Paths.Runner -Force
    Remove-Item $zip -Force

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
    $registrarArgs = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$script`" -Mode Registrar " +
        "-Repository $Repository -RunnerUser $RunnerUser -Root `"$Root`" -MinFreeGB $MinFreeGB " +
        "-Label $Label -RunnerName $RunnerName"
    if ($RunnerGroup) { $registrarArgs += " -RunnerGroup `"$RunnerGroup`"" }
    Register-ScheduledTask -TaskName $RegistrarTask -Force -Settings $settings `
        -Trigger (New-ScheduledTaskTrigger -AtStartup) `
        -Action (New-ScheduledTaskAction -Execute (Get-Command pwsh).Source -Argument $registrarArgs) `
        -Principal (New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest) | Out-Null

    $jobSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 12)
    $plain = [Net.NetworkCredential]::new('', $script:RunnerPassword).Password
    Register-ScheduledTask -TaskName $JobTask -Force -Settings $jobSettings `
        -Action (New-ScheduledTaskAction -Execute (Join-Path $Paths.Runner 'run.cmd') -WorkingDirectory $Paths.Runner) `
        -User "$env:COMPUTERNAME\$RunnerUser" -Password $plain -RunLevel Limited | Out-Null
    $plain = $null
    Start-ScheduledTask -TaskName $RegistrarTask
}

function Invoke-Registrar {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $identity.IsSystem) { throw 'Registrar mode runs only as SYSTEM from its scheduled task.' }
    while ($true) {
        if (-not (Test-DiskFloor)) { Start-Sleep -Seconds 600; continue }
        try {
            Get-ChildItem $Paths.Work -Force | Remove-Item -Recurse -Force
            foreach ($stale in '.runner', '.credentials', '.credentials_rsaparams') {
                Remove-Item (Join-Path $Paths.Runner $stale) -Force -ErrorAction SilentlyContinue
            }
            $token = Get-RegistrationToken
            $name = '{0}-{1:yyyyMMddHHmmss}' -f $RunnerName, (Get-Date)
            $configArgs = @('--unattended', '--url', "https://github.com/$Repository", '--token', $token,
                            '--name', $name, '--labels', $Label, '--work', $Paths.Work, '--ephemeral', '--replace')
            if ($RunnerGroup) { $configArgs += @('--runnergroup', $RunnerGroup) }
            & (Join-Path $Paths.Runner 'config.cmd') @configArgs | Out-Null
            $token = $null
            if ($LASTEXITCODE -ne 0) { throw "config.cmd exited $LASTEXITCODE" }
            # config ran as SYSTEM; hand the per-runner files to the job user.
            Set-StrictAcl $Paths.Runner @{ 'BUILTIN\Administrators' = 'FullControl';
                'NT AUTHORITY\SYSTEM' = 'FullControl'; $RunnerUser = 'Modify' }
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

function Show-Status {
    $free = Get-FreeGB
    [pscustomobject]@{
        FreeGB          = $free
        DiskFloorOk     = $free -ge $MinFreeGB
        RunnerUser      = [bool](Get-LocalUser -Name $RunnerUser -ErrorAction SilentlyContinue)
        RegistrarTask   = (Get-ScheduledTask -TaskName $RegistrarTask -ErrorAction SilentlyContinue)?.State
        JobTask         = (Get-ScheduledTask -TaskName $JobTask -ErrorAction SilentlyContinue)?.State
        PatStored       = Test-Path $PatFile
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
    Write-Host "delete $Root, $PatFile and user $RunnerUser by hand after review, and revoke the PAT."
}

switch ($Mode) {
    'Install' { Install-Checker }
    'Registrar' { Invoke-Registrar }
    'Status' { Show-Status }
    'Uninstall' { Uninstall-Checker }
}

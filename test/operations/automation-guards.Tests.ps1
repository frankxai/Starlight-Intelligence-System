$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..").Path
$Scripts = Join-Path $RepoRoot 'scripts'

Describe 'Starlight automation safety contracts' {
    It 'secret scan supports validation-only and fails closed on zero inputs' {
        $path = Join-Path $Scripts 'api-secret-scan.ps1'
        $content = Get-Content $path -Raw
        $content | Should Match '\[switch\]\$ValidateOnly'
        $expectedSisPath = [regex]::Escape("Join-Path `$HOME 'Starlight-Intelligence-System'")
        $content | Should Match $expectedSisPath
        $content | Should Match '\$existingRepos\.Count -eq 0'
        $content | Should Not Match 'Findings are reported via ALERTS\.md, not the exit code'
    }

    It 'backup validates the real SIS root and excludes its own repository' {
        $path = Join-Path $Scripts 'run-restic-backup.ps1'
        $content = Get-Content $path -Raw
        $content | Should Match '\[switch\]\$ValidateOnly'
        $content | Should Match '\$HOME ''Starlight-Intelligence-System'''
        $content | Should Match '--exclude.*\$Repo'
        $content | Should Match 'restic snapshots --latest 1'
    }

    It 'watchdog supports dry-run and detects leaked argumentless shells' {
        $path = Join-Path $Scripts 'agent-watchdog.ps1'
        $content = Get-Content $path -Raw
        $content | Should Match '\[switch\]\$DryRun'
        $content | Should Match 'ArgumentList\.Count -eq 0'
        $content | Should Match 'conhost'
        $content | Should Match 'Get-CimInstance Win32_OperatingSystem'
    }
}

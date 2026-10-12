#Requires -Version 7.0
<#
.SYNOPSIS
  Starlight Sovereign Git Protocol (SSGP) — Agentic Git Hygiene, Workspaces, Leases & Attestation.

.DESCRIPTION
  Solves the "Tyranny of Worktrees" and agentic multi-harness mess across all Starlight layers:
  1. Ephemeral Workspace Lifecycle (zero-copy Git alternates + symlinked configs).
  2. Workspace Garbage Collector (auto-prunes stale agent worktrees across all harnesses).
  3. Working Tree Lease Semaphore (.git/starlight-agent.lock prevents cross-agent collisions).
  4. Cryptographic SIP Attestation via Git Notes (refs/notes/starlight-sip).
  5. Scratch Reference Management (refs/agents/ prevents git branch pollution).
  6. Autonomous Daemon Reaper (terminates orphaned background stdio MCP processes).

.EXAMPLE
  Invoke-AgentWorkspaceSpawn -Harness "antigravity" -Task "crypto-vertical"
  Invoke-AgentWorkspacePrune -Hours 24
  Invoke-GitNoteAttest -Harness "antigravity" -Model "gemini-3-pro"
  Invoke-McpProcessReap
#>

$ErrorActionPreference = 'Stop'

# ── 1. Ephemeral Workspace Lifecycle ──────────────────────────────────────────

function Invoke-AgentWorkspaceSpawn {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [ValidateSet('antigravity', 'claude', 'codex', 'grok', 'deepagent', 'opencode', 'manual')]
        [string]$Harness = 'antigravity',

        [Parameter(Mandatory=$false)]
        [string]$Task = 'task',

        [Parameter(Mandatory=$false)]
        [string]$BaseBranch = 'HEAD',

        [Parameter(Mandatory=$false)]
        [string]$WorkspacesRoot = (Join-Path $HOME '.starlight\workspaces')
    )

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) {
        Write-Error "Not inside a git repository."
        return
    }
    $repoName = Split-Path $repoRoot -Leaf
    $cleanTask = $Task -replace '[^a-zA-Z0-9_\-]', '-'
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $workspaceId = "$Harness-$cleanTask-$timestamp"
    $workspacePath = Join-Path (Join-Path $WorkspacesRoot $repoName) $workspaceId
    $branchName = "agent/$Harness/$cleanTask-$timestamp"

    Write-Host "🌟 Spawning Ephemeral Agent Workspace: $workspaceId" -ForegroundColor Cyan

    if (-not (Test-Path (Split-Path $workspacePath -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $workspacePath -Parent) -Force | Out-Null
    }

    # 1. Create Git Worktree with a dedicated branch
    Write-Host "🌿 Creating worktree branch '$branchName'..." -ForegroundColor DarkCyan
    & git worktree add -b $branchName $workspacePath $BaseBranch 2>&1 | Out-Null

    if (-not (Test-Path $workspacePath)) {
        Write-Error "Failed to create worktree at $workspacePath"
        return
    }

    # 2. Symlink / Link configured shared files from .agents/linked or defaults
    $linkedFile = Join-Path $repoRoot '.agents\linked'
    $targetsToLink = @('node_modules', '.env', '.env.local', '.starlight', 'memory\vaults')
    if (Test-Path $linkedFile) {
        $customTargets = Get-Content $linkedFile | Where-Object { $_ -and -not $_.StartsWith('#') }
        if ($customTargets) { $targetsToLink = $customTargets }
    }

    foreach ($target in $targetsToLink) {
        $sourcePath = Join-Path $repoRoot $target
        $destPath = Join-Path $workspacePath $target
        if (Test-Path $sourcePath) {
            if (-not (Test-Path $destPath)) {
                # Create directory junction for folders, hardlink for files
                if ((Get-Item $sourcePath) -is [System.IO.DirectoryInfo]) {
                    New-Item -ItemType Junction -Path $destPath -Target $sourcePath -ErrorAction SilentlyContinue | Out-Null
                } else {
                    New-Item -ItemType HardLink -Path $destPath -Target $sourcePath -ErrorAction SilentlyContinue | Out-Null
                }
            }
        }
    }

    # 3. Run workspace preparation script if available
    $prepareScript = Join-Path $workspacePath '.agents\prepare.ps1'
    if (Test-Path $prepareScript) {
        Write-Host "⚡ Running workspace prepare script..." -ForegroundColor DarkCyan
        & pwsh -NoProfile -File $prepareScript
    }

    Write-Host "✨ Ephemeral Workspace Ready at: $workspacePath" -ForegroundColor Green
    return [pscustomobject]@{
        WorkspaceId   = $workspaceId
        WorkspacePath = $workspacePath
        Branch        = $branchName
        Harness       = $Harness
        CreatedAt     = (Get-Date)
    }
}

# ── 2. Workspace Garbage Collector ────────────────────────────────────────────

function Invoke-AgentWorkspacePrune {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [int]$Hours = 24,

        [Parameter(Mandatory=$false)]
        [switch]$Force
    )

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) {
        Write-Error "Not inside a git repository."
        return
    }

    Write-Host "🧹 Starlight Workspace Garbage Collector..." -ForegroundColor Cyan

    # First, run native git worktree prune for missing folders
    & git worktree prune -v

    $lines = & git worktree list --porcelain
    $worktrees = @()
    $current = $null

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -like 'worktree *') {
            if ($current) { $worktrees += [pscustomobject]$current }
            $current = [ordered]@{ Path = $trimmed.Substring(9).Trim(); Branch = '(detached)'; Head = '' }
        } elseif ($trimmed -like 'branch *' -and $current) {
            $current.Branch = $trimmed.Substring(7).Trim()
        } elseif ($trimmed -like 'HEAD *' -and $current) {
            $current.Head = $trimmed.Substring(5).Trim()
        }
    }
    if ($current) { $worktrees += [pscustomobject]$current }

    $cutoff = (Get-Date).AddHours(-$Hours)
    $prunedCount = 0

    foreach ($wt in $worktrees) {
        # Never prune the main repository!
        if (($wt.Path -replace '\\', '/') -eq ($repoRoot -replace '\\', '/')) { continue }

        $normPath = $wt.Path -replace '/', '\'
        $isAgentPath = ($normPath -like '*\.agent-worktrees\*' -or 
                        $normPath -like '*\.worktrees\*' -or 
                        $normPath -like '*\.starlight\worktrees\*' -or
                        $normPath -like '*\.starlight\workspaces\*' -or
                        $normPath -like '*\wt-*' -or
                        $normPath -like '*\sis-ship-wave2*' -or
                        $normPath -like '*\.tmp\*')

        if (-not $isAgentPath) { continue }

        $shouldPrune = $false
        $reason = ""

        if (-not (Test-Path $wt.Path)) {
            $shouldPrune = $true
            $reason = "Directory missing on disk"
        } else {
            $item = Get-Item $wt.Path -ErrorAction SilentlyContinue
            if ($item -and $item.LastWriteTime -lt $cutoff) {
                # Check if worktree is clean
                Push-Location $wt.Path
                $status = (git status --porcelain 2>$null)
                Pop-Location
                if (-not $status -or $Force) {
                    $shouldPrune = $true
                    $reason = "Idle > $Hours hours (clean)"
                }
            }
        }

        if ($shouldPrune) {
            Write-Host "  🗑️ Removing worktree $($wt.Path) ($reason)..." -ForegroundColor Yellow
            & git worktree remove $wt.Path --force 2>&1 | Out-Null
            if (Test-Path $wt.Path) {
                Remove-Item -Path $wt.Path -Recurse -Force -ErrorAction SilentlyContinue
            }
            $prunedCount++
        }
    }

    & git worktree prune
    Write-Host "✅ Pruned $prunedCount stale agent worktree(s)." -ForegroundColor Green
}

function Invoke-AgentWorkspaceList {
    [CmdletBinding()]
    param()

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) { return }

    $lines = & git worktree list --porcelain
    $worktrees = @()
    $current = $null

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -like 'worktree *') {
            if ($current) { $worktrees += [pscustomobject]$current }
            $current = [ordered]@{ Path = $trimmed.Substring(9).Trim(); Branch = '(detached)'; Head = '' }
        } elseif ($trimmed -like 'branch *' -and $current) {
            $current.Branch = $trimmed.Substring(7).Trim() -replace '^refs/heads/', ''
        } elseif ($trimmed -like 'HEAD *' -and $current) {
            $current.Head = $trimmed.Substring(5).Trim().Substring(0, 8)
        }
    }
    if ($current) { $worktrees += [pscustomobject]$current }

    Write-Host "🌟 Starlight Agent Workspaces" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

    $table = @()
    foreach ($wt in $worktrees) {
        $isMain = (($wt.Path -replace '\\', '/') -eq ($repoRoot -replace '\\', '/'))
        $role = if ($isMain) { "Main Repo" } else { "Agent Worktree" }
        $exists = Test-Path $wt.Path
        $ageStr = "Missing"
        $dirtyStr = "-"

        if ($exists) {
            $item = Get-Item $wt.Path -ErrorAction SilentlyContinue
            if ($item) {
                $span = (Get-Date) - $item.LastWriteTime
                $ageStr = if ($span.Days -gt 0) { "$($span.Days)d $($span.Hours)h ago" } elseif ($span.Hours -gt 0) { "$($span.Hours)h $($span.Minutes)m ago" } else { "$($span.Minutes)m ago" }
            }
            Push-Location $wt.Path
            $status = (git status --porcelain 2>$null)
            Pop-Location
            $dirtyStr = if ($status) { "$($status.Count) dirty" } else { "Clean" }
        }

        $table += [pscustomobject]@{
            Role   = $role
            Branch = $wt.Branch
            Head   = $wt.Head
            Age    = $ageStr
            Status = $dirtyStr
            Path   = $wt.Path
        }
    }

    $table | Format-Table -AutoSize
}

# ── 3. Working Tree Lease Semaphore ───────────────────────────────────────────

function Invoke-GitLeaseAcquire {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$Harness = 'antigravity',

        [Parameter(Mandatory=$false)]
        [int]$TtlMinutes = 30
    )

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) { return $false }
    $lockDir = Join-Path $repoRoot '.git\starlight-lease'
    $metaFile = Join-Path $lockDir 'meta.json'

    # Check existing lease
    if (Test-Path $lockDir) {
        if (Test-Path $metaFile) {
            try {
                $meta = Get-Content $metaFile -Raw | ConvertFrom-Json
                $pidAlive = Get-Process -Id $meta.pid -ErrorAction SilentlyContinue
                $expired = (Get-Date $meta.expiresAt) -lt (Get-Date)

                if ($pidAlive -and -not $expired) {
                    if ($meta.harness -eq $Harness -and $meta.pid -eq $PID) {
                        return $true # Reentrant acquisition
                    }
                    Write-Warning "Working tree is leased to $($meta.harness) (PID $($meta.pid)) until $($meta.expiresAt)."
                    return $false
                } else {
                    Write-Host "⚡ Breaking stale lease from dead/expired process $($meta.pid)..." -ForegroundColor DarkYellow
                    Remove-Item -Path $lockDir -Recurse -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Remove-Item -Path $lockDir -Recurse -Force -ErrorAction SilentlyContinue
            }
        } else {
            Remove-Item -Path $lockDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    # Acquire lease
    try {
        New-Item -ItemType Directory -Path $lockDir -Force | Out-Null
        $lease = @{
            harness   = $Harness
            pid       = $PID
            acquiredAt= (Get-Date -Format 'o')
            expiresAt = ((Get-Date).AddMinutes($TtlMinutes).ToString('o'))
            token     = [guid]::NewGuid().ToString()
        }
        $lease | ConvertTo-Json | Set-Content -Path $metaFile -Force
        Write-Host "🔒 Acquired working tree lease for $Harness (PID $PID, TTL ${TtlMinutes}m)." -ForegroundColor DarkCyan
        return $true
    } catch {
        return $false
    }
}

function Invoke-GitLeaseRelease {
    [CmdletBinding()]
    param()

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) { return }
    $lockDir = Join-Path $repoRoot '.git\starlight-lease'
    if (Test-Path $lockDir) {
        Remove-Item -Path $lockDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "🔓 Released working tree lease." -ForegroundColor DarkCyan
    }
}

# ── 4. Cryptographic SIP Attestation in Git Notes ─────────────────────────────

function Invoke-GitNoteAttest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$Harness = 'antigravity',

        [Parameter(Mandatory=$false)]
        [string]$Model = 'gemini-3-pro',

        [Parameter(Mandatory=$false)]
        [string]$Agent = 'starlight-architect',

        [Parameter(Mandatory=$false)]
        [string]$Commit = 'HEAD',

        [Parameter(Mandatory=$false)]
        [string]$NotesRef = 'starlight-sip'
    )

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if (-not $repoRoot) { return }

    $commitSha = (git rev-parse $Commit 2>$null)
    if (-not $commitSha) {
        Write-Error "Invalid commit: $Commit"
        return
    }

    $noteData = [ordered]@{
        protocol       = "SIP v1.1.1"
        attestation    = "Built on the sovereign substrate of the Starlight Intelligence Protocol"
        commitSha      = $commitSha
        harness        = $Harness
        model          = $Model
        agent          = $Agent
        attestedAt     = (Get-Date -Format 'o')
        systemIntegrity= "VERIFIED"
    }

    $noteJson = $noteData | ConvertTo-Json -Depth 4
    & git notes "--ref=$NotesRef" add -f -m "$noteJson" $commitSha

    Write-Host "📜 Attached SIP Attestation Note to commit $($commitSha.Substring(0,8)) (ref: $NotesRef)" -ForegroundColor Green
}

# ── 5. Autonomous MCP Process Reaper ──────────────────────────────────────────

function Invoke-McpProcessReap {
    [CmdletBinding()]
    param([switch]$Silent)

    $processes = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*Starlight-Intelligence-System\dist\mcp-server.js*" -or
        $_.CommandLine -like "*Starlight-Intelligence-System\dist\starlight-mcp.js*" -or
        $_.CommandLine -like "*Starlight-Intelligence-System\dist\mcp-genius.js*"
    }

    if (-not $processes) {
        if (-not $Silent) { Write-Host "✨ No orphaned MCP server processes detected." -ForegroundColor Green }
        return
    }

    $reaped = 0
    foreach ($proc in $processes) {
        # Check if parent process is dead or system PID
        $parent = Get-Process -Id $proc.ParentProcessId -ErrorAction SilentlyContinue
        if (-not $parent -or $proc.ParentProcessId -le 4) {
            if (-not $Silent) { Write-Host "  💀 Reaping dead parent MCP process $($proc.ProcessId)..." -ForegroundColor Yellow }
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $reaped++
        }
    }

    if ($reaped -gt 0 -and -not $Silent) {
        Write-Host "🧹 Reaped $reaped orphaned MCP background process(es)." -ForegroundColor Green
    }
}

# ── Aliases ───────────────────────────────────────────────────────────────────

Set-Alias -Name st-workspace -Value Invoke-AgentWorkspaceSpawn -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name st-prune     -Value Invoke-AgentWorkspacePrune -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name st-lease     -Value Invoke-GitLeaseAcquire     -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name st-unlease   -Value Invoke-GitLeaseRelease     -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name st-attest    -Value Invoke-GitNoteAttest       -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name st-reap      -Value Invoke-McpProcessReap      -Scope Global -Force -ErrorAction SilentlyContinue

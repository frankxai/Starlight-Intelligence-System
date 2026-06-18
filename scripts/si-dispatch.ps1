#Requires -Version 7.0
<#
.SYNOPSIS
  Starlight /si + /so fanout dispatcher — route one task to multiple local coding-agent CLIs.

.DESCRIPTION
  Operational dispatch layer for the agent grid. No MCP required.
  Lanes: grok, codex, claude, opencode, deepagent, antigravity, arco, cursor (manual).

  Each lane receipt includes provenance: cli, binary, version, model, modelSource, sessionId.

.EXAMPLE
  ./scripts/si-dispatch.ps1 -Lanes grok,codex,antigravity -Repo sis -Task "SIS status ping" -Json

.EXAMPLE
  ./scripts/si-dispatch.ps1 -Lanes all -Parallel -Ledger
#>
[CmdletBinding()]
param(
    [Parameter()]
    [string]$Task,

    [Parameter()]
    [string]$TaskFile,

    [Parameter()]
    [Alias('Lane')]
    [string[]]$Lanes = @('grok', 'codex'),

    [Parameter()]
    [ValidateSet('sis', 'fx', 'arc', 'app', 'acos', 'g', 'vc', 'ani', 'dpi', 'brain', 'prompts', 'studio', '.')]
    [string]$Repo = 'sis',

    [Parameter()]
    [string]$RepoPath,

    [Parameter()]
    [switch]$Json,

    [Parameter()]
    [switch]$Parallel,

    [Parameter()]
    [int]$TimeoutSec = 180,

    [Parameter()]
    [switch]$UseArco,

    [Parameter()]
    [string]$ReceiptPath,

    [Parameter()]
    [switch]$Ledger,

    [Parameter()]
    [string]$LedgerPath = (Join-Path (Split-Path $PSScriptRoot -Parent) 'agent-tools/dispatch-ledger.jsonl')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoots = [ordered]@{
    sis     = 'Starlight-Intelligence-System'
    fx      = 'FrankX'
    arc     = 'arcanea-ecosystem'
    app     = 'arcanea-ai-app'
    acos    = 'agentic-creator-os'
    g       = 'gencreator.ai'
    vc      = 'vibeclubs.ai'
    ani     = 'AnimeLegends'
    dpi     = 'dpi'
    brain   = 'second-brain-os'
    prompts = 'prompt-library'
    studio  = 'arcanea-studio'
}

$LaneDefaults = [ordered]@{
    grok         = @{ cli = 'grok'; model = 'grok-composer-2.5-fast'; modelFlag = '-m' }
    codex        = @{ cli = 'codex'; model = 'gpt-5.5'; modelFlag = '-m' }
    claude       = @{ cli = 'claude'; model = 'claude-haiku-4-5'; modelFlag = '--model' }
    opencode     = @{ cli = 'opencode'; model = 'zen-free'; modelFlag = $null }
    deepagent    = @{ cli = 'dcode'; model = 'claude-haiku-4-5'; modelFlag = '-M' }
    antigravity  = @{ cli = 'agy'; model = 'gemini-3.5-flash-medium'; modelFlag = '--model' }
    arco         = @{ cli = 'arco'; model = 'grok-4'; modelFlag = '-m' }
    cursor       = @{ cli = 'cursor'; model = $null; modelFlag = $null }
}

function Resolve-RepoPath {
    if ($RepoPath) { return (Resolve-Path $RepoPath).Path }
    if ($Repo -eq '.') { return (Get-Location).Path }
    $dir = $RepoRoots[$Repo]
    if (-not $dir) { throw "Unknown repo key '$Repo'." }
    $path = Join-Path $env:USERPROFILE $dir
    if (-not (Test-Path $path)) { throw "Repo path not found: $path" }
    return $path
}

function Resolve-Binary {
    param([string]$Name, [string]$Fallback)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    if ($Fallback -and (Test-Path $Fallback)) { return $Fallback }
    return $null
}

function Get-CliVersion {
    param([string]$Lane, [string]$Binary)
    try {
        switch ($Lane) {
            'grok' {
                $out = & $Binary --version 2>&1 | Out-String
                if ($out -match '([\d.]+)') { return $Matches[1].Trim() }
            }
            'codex' {
                $out = & $Binary --version 2>&1 | Out-String
                if ($out -match 'codex(?:-cli)?\s+v?([\d.]+)') { return $Matches[1].Trim() }
                if ($out -match '([\d.]+)') { return $Matches[1].Trim() }
            }
            'claude' {
                $out = & $Binary --version 2>&1 | Out-String
                if ($out -match '([\d.]+(?:-[\w.]+)?)') { return $Matches[1].Trim() }
            }
            'opencode' {
                $out = & $Binary --version 2>&1 | Out-String
                if ($out -match '([\d.]+)') { return $Matches[1].Trim() }
            }
            'deepagent' {
                $out = & $Binary --version 2>&1 | Out-String
                if ($out -match '([\d.]+)') { return $Matches[1].Trim() }
            }
            'antigravity' {
                $out = & $Binary changelog 2>&1 | Out-String
                if ($out -match '^([\d.]+)') { return $Matches[1].Trim() }
            }
            'arco' {
                $out = & arco --version 2>&1 | Out-String
                if ($out -match '([\d.]+)') { return $Matches[1].Trim() }
            }
        }
    } catch {}
    return $null
}

function Parse-DispatchMetadata {
    param([string]$Lane, [string]$CombinedOutput)

    $meta = [ordered]@{
        model       = $LaneDefaults[$Lane].model
        modelSource = 'default'
        sessionId   = $null
    }

    if (-not $CombinedOutput) { return [pscustomobject]$meta }

    switch ($Lane) {
        'codex' {
            if ($CombinedOutput -match '(?m)^model:\s*(.+)$') {
                $meta.model = $Matches[1].Trim()
                $meta.modelSource = 'codex-header'
            }
            if ($CombinedOutput -match 'session id:\s*([0-9a-f-]+)') {
                $meta.sessionId = $Matches[1]
            }
        }
        'grok' {
            if ($CombinedOutput -match 'model[=:]\s*([^\s,]+)') {
                $meta.model = $Matches[1].Trim()
                $meta.modelSource = 'grok-output'
            }
        }
        'claude' {
            if ($CombinedOutput -match 'model[=:]\s*([^\s,]+)') {
                $meta.model = $Matches[1].Trim()
                $meta.modelSource = 'claude-output'
            }
        }
        'arco' {
            if ($CombinedOutput -match '\[arcanea\].*?→\s*([^\s]+)\s+via') {
                $meta.model = $Matches[1].Trim()
                $meta.modelSource = 'arco-router'
            }
        }
        'antigravity' {
            if ($CombinedOutput -match 'Gemini [^\r\n\x00]+') {
                $meta.model = $Matches[0].Trim()
                $meta.modelSource = 'agy-conversation-db'
            }
        }
    }

    return [pscustomobject]$meta
}

function Get-AgyPayloadStrings {
    param([byte[]]$Bytes)
    $text = [Text.Encoding]::UTF8.GetString($Bytes)
    return [regex]::Matches($text, '[\x20-\x7E]{2,}') | ForEach-Object { $_.Value.Trim() }
}

function Test-LongAgyPrompt {
    param([string]$UserPrompt)
    return ($UserPrompt.Length -ge 200) -or ($UserPrompt -match '(?m)^\s*(\d+\.|#{1,3}\s|\*\*)')
}

function Get-AgyMinRecoveryBytes {
    param([string]$UserPrompt)
    if (Test-LongAgyPrompt -UserPrompt $UserPrompt) { return 80 }
    if ($UserPrompt -match 'exactly:\s*(.+)') { return 2 }
    return 20
}

function Select-AgyResponseCandidate {
    param(
        [string[]]$Candidates,
        [string]$UserPrompt
    )

    $noise = 'sessionID|MODEL_PLACEHOLDER|SKILL\.md|file://|C:\\Users|mcp\(|command\(|execute_url|read_url|communication_style|github-style markdown|Confirmation Of|\(bot-'
    $longPrompt = Test-LongAgyPrompt -UserPrompt $UserPrompt
    $minBytes = Get-AgyMinRecoveryBytes -UserPrompt $UserPrompt

    $filtered = $Candidates | ForEach-Object {
        if ($_ -match '^(.+?)(\(bot-[0-9a-f-]+)') { $Matches[1].Trim() } else { $_.Trim() }
    } | Where-Object {
        $_ -and
        $_ -notmatch $noise -and
        $_ -ne $UserPrompt.Trim() -and
        $_.Length -le 8000
    } | Select-Object -Unique

    if ($UserPrompt -match 'exactly:\s*(.+)') {
        $expected = $Matches[1].Trim().Trim('"')
        $exact = $filtered | Where-Object { $_ -eq $expected } | Select-Object -First 1
        if ($exact) { return $exact }
        $near = $filtered | Where-Object { $_ -like "$expected*" } |
            Sort-Object { $_.Length } |
            Select-Object -First 1
        if ($near) {
            if ($near.StartsWith($expected)) { return $expected }
            return $near
        }
    }

    if ($longPrompt) {
        $structured = $filtered | Where-Object {
            $_.Length -ge $minBytes -and
            ($_ -match '(?m)^(\*\*|##|\d+\.\s)' -or ($_ -match '[.!?]\s' -and $_.Length -ge 120))
        } | Sort-Object Length -Descending | Select-Object -First 1
        if ($structured) { return $structured }

        $longest = $filtered | Where-Object { $_.Length -ge $minBytes } |
            Sort-Object Length -Descending |
            Select-Object -First 1
        if ($longest) { return $longest }

        return $null
    }

    $short = $filtered | Where-Object { $_.Length -ge 2 -and $_.Length -le 120 } |
        Sort-Object Length |
        Select-Object -First 1
    if ($short) { return $short }

    return $filtered |
        Where-Object { $_.Length -ge $minBytes } |
        Sort-Object Length -Descending |
        Select-Object -First 1
}

function Get-AgyConversationResponse {
    param(
        [string]$WorkDir,
        [string]$UserPrompt,
        [string]$LogFile
    )

    $longPrompt = Test-LongAgyPrompt -UserPrompt $UserPrompt
    $minBytes = Get-AgyMinRecoveryBytes -UserPrompt $UserPrompt
    $pollDeadline = (Get-Date).AddSeconds($(if ($longPrompt) { 90 } else { 5 }))

    $convId = $null
    if ($LogFile -and (Test-Path $LogFile)) {
        $log = Get-Content $LogFile -Raw -ErrorAction SilentlyContinue
        foreach ($pattern in @('Created conversation ([0-9a-f-]{36})', 'Print mode: conversation=([0-9a-f-]{36})', 'Streaming conversation ([0-9a-f-]{36})')) {
            $hits = [regex]::Matches($log, $pattern)
            if ($hits.Count -gt 0) {
                $convId = $hits[$hits.Count - 1].Groups[1].Value
                break
            }
        }
    }

    if (-not $convId) {
        $convMapPath = Join-Path $env:USERPROFILE '.gemini/antigravity-cli/cache/last_conversations.json'
        if (Test-Path $convMapPath) {
            try {
                $map = Get-Content $convMapPath -Raw | ConvertFrom-Json
                $normPath = (Resolve-Path $WorkDir).Path
                $prop = $map.PSObject.Properties | Where-Object { $_.Name -eq $normPath } | Select-Object -First 1
                if ($prop) { $convId = [string]$prop.Value }
            } catch {}
        }
    }

    if (-not $convId) { return $null }

    $dbPath = Join-Path $env:USERPROFILE ".gemini/antigravity-cli/conversations/$convId.db"
    if (-not (Test-Path $dbPath)) { return $null }

    $model = 'gemini-3.5-flash-medium'
    $best = $null

    do {
        Start-Sleep -Milliseconds $(if ($longPrompt) { 2000 } else { 800 })

        $candidates = [System.Collections.Generic.List[string]]::new()

        if (Get-Command sqlite3 -ErrorAction SilentlyContinue) {
            $rowLines = @(sqlite3 $dbPath "SELECT idx, step_type, hex(step_payload) FROM steps ORDER BY idx;" 2>$null)
            $parsedSteps = foreach ($row in $rowLines) {
                if (-not $row) { continue }
                $parts = $row -split '\|', 3
                if ($parts.Count -lt 3) { continue }
                $bytes = for ($i = 0; $i -lt $parts[2].Length; $i += 2) { [Convert]::ToByte($parts[2].Substring($i, 2), 16) }
                $strings = Get-AgyPayloadStrings -Bytes $bytes
                [pscustomobject]@{
                    idx       = [int]$parts[0]
                    stepType  = [int]$parts[1]
                    strings   = $strings
                    rawText   = [Text.Encoding]::UTF8.GetString($bytes)
                }
            }

            $promptTrim = $UserPrompt.Trim()
            $promptHead = if ($promptTrim.Length -gt 240) { $promptTrim.Substring(0, 240) } else { $promptTrim }
            $userStepIdx = ($parsedSteps | Where-Object {
                $_.stepType -eq 14 -and (
                    $_.strings -contains $promptTrim -or
                    $_.rawText.Contains($promptTrim) -or
                    $_.rawText.Contains($promptHead)
                )
            } | Select-Object -Last 1).idx

            $responseSteps = if ($null -ne $userStepIdx) {
                $after = @($parsedSteps | Where-Object { $_.idx -gt $userStepIdx -and $_.stepType -in 15, 23 })
                if ($after.Count -gt 0) { $after } else {
                    @($parsedSteps | Where-Object { $_.stepType -in 15, 23 } | Select-Object -Last 1)
                }
            } else {
                @($parsedSteps | Where-Object { $_.stepType -in 15, 23 } | Select-Object -Last 3)
            }

            foreach ($step in $responseSteps) {
                $candidates.AddRange([string[]]$step.strings)
                if ($step.rawText -match '(Gemini [^\x00\r\n]{3,80})') { $model = $Matches[1].Trim() }
            }
        } else {
            $bytes = [IO.File]::ReadAllBytes($dbPath)
            $candidates.AddRange([string[]](Get-AgyPayloadStrings -Bytes $bytes))
            $blobText = [Text.Encoding]::UTF8.GetString($bytes)
            if ($blobText -match '(Gemini [^\x00\r\n]{3,80})') { $model = $Matches[1].Trim() }
        }

        $response = Select-AgyResponseCandidate -Candidates $candidates -UserPrompt $UserPrompt
        if ($response) {
            $best = [pscustomobject]@{
                conversationId = $convId
                model          = $model
                output         = $response.Trim()
                recoveryBytes  = [Text.Encoding]::UTF8.GetByteCount($response.Trim())
            }
            if (-not $longPrompt -or $best.recoveryBytes -ge $minBytes) { break }
        }
    } while ((Get-Date) -lt $pollDeadline)

    if (-not $best) { return $null }
    return $best
}

function New-DispatchPromptFile {
    param([string]$Prompt)
    $path = Join-Path $env:TEMP "si-dispatch-prompt-$([guid]::NewGuid().ToString('n')).txt"
    [System.IO.File]::WriteAllText($path, $Prompt, [System.Text.UTF8Encoding]::new($false))
    return $path
}

function Invoke-ProcessCapture {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkDir,
        [int]$TimeoutSec
    )

    $outFile = Join-Path $env:TEMP "si-dispatch-out-$([guid]::NewGuid().ToString('n')).txt"
    $errFile = Join-Path $env:TEMP "si-dispatch-err-$([guid]::NewGuid().ToString('n')).txt"

    $proc = Start-Process -FilePath $FilePath -WorkingDirectory $WorkDir -NoNewWindow -PassThru `
        -RedirectStandardOutput $outFile -RedirectStandardError $errFile -ArgumentList $ArgumentList

    $completed = $proc.WaitForExit($TimeoutSec * 1000)
    if (-not $completed) {
        try { $proc.Kill($true) } catch {}
        throw "Process timed out after ${TimeoutSec}s"
    }

    $stdout = Get-Content $outFile -Raw -ErrorAction SilentlyContinue
    $stderr = Get-Content $errFile -Raw -ErrorAction SilentlyContinue
    Remove-Item $outFile, $errFile -Force -ErrorAction SilentlyContinue

    return [pscustomobject]@{
        ExitCode = $proc.ExitCode
        Stdout   = $stdout
        Stderr   = $stderr
    }
}

function Invoke-AgentLane {
    param(
        [string]$Lane,
        [string]$WorkDir,
        [string]$Prompt,
        [int]$TimeoutSec,
        [switch]$UseArco
    )

    $defaults = $LaneDefaults[$Lane]
    $result = [ordered]@{
        lane         = $Lane
        cli          = $defaults.cli
        binary       = $null
        version      = $null
        model        = $defaults.model
        modelSource  = 'default'
        sessionId    = $null
        ok           = $false
        exitCode     = -1
        command      = ''
        commandArgv  = @()
        stdoutBytes  = 0
        stderrBytes  = 0
        output       = ''
        error        = ''
        captureNote  = $null
        elapsed      = 0
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        switch ($Lane) {
            'grok' {
                $bin = Resolve-Binary 'grok' "$env:USERPROFILE\.grok\bin\grok.exe"
                if (-not $bin) { throw 'grok not installed' }
                $result.binary = $bin
                $result.version = Get-CliVersion -Lane 'grok' -Binary $bin
                $model = $LaneDefaults.grok.model
                $promptFile = New-DispatchPromptFile -Prompt $Prompt
                $result.command = "pwsh: Get-Content prompt | grok -p -m $model"
                $result.commandArgv = @(
                    '-NoProfile', '-Command',
                    "`$grokPrompt = Get-Content -Raw '$promptFile'; & '$bin' -p `$grokPrompt --cwd '$WorkDir' -m '$model' --disable-web-search --max-turns 8 --output-format plain"
                )
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList $result.commandArgv -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'codex' {
                if ($UseArco -and (Get-Command arco -ErrorAction SilentlyContinue)) {
                    $result.cli = 'arco→codex'
                    $result.binary = (Get-Command arco).Source
                    $result.commandArgv = @('run', '--task', 'research.quick', '--surface', 'codex-arcanea', '-m', 'gpt-5', '--no-history', $Prompt)
                    $result.command = "arco $($result.commandArgv -join ' ')"
                    $arcoArgs = ($result.commandArgv | ForEach-Object { if ($_ -match '\s') { "'$_'" } else { $_ } }) -join ' '
                    $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList @('-NoProfile', '-Command', "arco $arcoArgs") -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                } else {
                    $bin = Resolve-Binary 'codex' "$env:APPDATA\npm\codex.ps1"
                    if (-not $bin) { throw 'codex not installed' }
                    $result.binary = $bin
                    $result.version = Get-CliVersion -Lane 'codex' -Binary $bin
                    $model = $LaneDefaults.codex.model
                    $promptFile = New-DispatchPromptFile -Prompt $Prompt
                    $result.command = "pwsh: Get-Content prompt | codex exec -m $model --sandbox workspace-write"
                    $result.commandArgv = @(
                        '-NoProfile', '-Command',
                        "`$codexPrompt = Get-Content -Raw '$promptFile'; & '$bin' exec -m '$model' --sandbox workspace-write -- `$codexPrompt"
                    )
                    $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList $result.commandArgv -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                    Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
                }
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'claude' {
                $bin = Resolve-Binary 'claude' "$env:USERPROFILE\.local\bin\claude.exe"
                if (-not $bin) { throw 'claude not installed' }
                $result.binary = $bin
                $result.version = Get-CliVersion -Lane 'claude' -Binary $bin
                $model = $LaneDefaults.claude.model
                $promptFile = New-DispatchPromptFile -Prompt $Prompt
                $result.command = "pwsh: Get-Content prompt | claude -p --model $model"
                $result.commandArgv = @(
                    '-NoProfile', '-Command',
                    "`$claudePrompt = Get-Content -Raw '$promptFile'; & '$bin' -p `$claudePrompt --model '$model'"
                )
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList $result.commandArgv -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'opencode' {
                $bin = Resolve-Binary 'opencode' "$env:APPDATA\npm\opencode.ps1"
                if (-not $bin) { throw 'opencode not installed' }
                $result.binary = $bin
                $result.version = Get-CliVersion -Lane 'opencode' -Binary $bin
                $result.commandArgv = @('run', $Prompt)
                $result.command = "opencode run <prompt>"
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList @('-NoProfile', '-Command', "& '$bin' run -- $($Prompt | ConvertTo-Json)") -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'deepagent' {
                $bin = Resolve-Binary 'dcode' "$env:USERPROFILE\.local\bin\dcode.exe"
                if (-not $bin) { throw 'dcode not installed' }
                if (-not $env:ANTHROPIC_API_KEY) { throw 'ANTHROPIC_API_KEY not set — deepagent lane skipped' }
                $result.binary = $bin
                $result.version = Get-CliVersion -Lane 'deepagent' -Binary $bin
                $model = $LaneDefaults.deepagent.model
                $promptFile = Join-Path $env:TEMP "si-dispatch-da-$([guid]::NewGuid().ToString('n')).txt"
                [System.IO.File]::WriteAllText($promptFile, $Prompt, [System.Text.UTF8Encoding]::new($false))
                $result.commandArgv = @('--stdin', '-y', '-M', $model)
                $result.command = "Get-Content prompt | dcode --stdin -y -M $model"
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -WorkDir $WorkDir -TimeoutSec $TimeoutSec `
                    -ArgumentList @('-NoProfile', '-Command', "Get-Content -Raw '$promptFile' | & '$bin' --stdin -y -M '$model'")
                Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'antigravity' {
                $bin = Resolve-Binary 'agy' "$env:LOCALAPPDATA\agy\bin\agy.exe"
                if (-not $bin) { throw 'agy not installed' }
                $result.binary = $bin
                $result.version = Get-CliVersion -Lane 'antigravity' -Binary $bin
                $logFile = Join-Path $env:TEMP "si-dispatch-agy-$([guid]::NewGuid().ToString('n')).log"
                $promptFile = Join-Path $env:TEMP "si-dispatch-agy-prompt-$([guid]::NewGuid().ToString('n')).txt"
                [System.IO.File]::WriteAllText($promptFile, $Prompt, [System.Text.UTF8Encoding]::new($false))
                $timeoutLabel = if ($TimeoutSec -ge 120) { '3m' } else { '2m' }
                $result.command = "pwsh: Get-Content prompt | agy -p --dangerously-skip-permissions --print-timeout $timeoutLabel"
                $result.commandArgv = @(
                    '-NoProfile', '-Command',
                    "`$agyPrompt = Get-Content -Raw '$promptFile'; & '$bin' -p `$agyPrompt --dangerously-skip-permissions --print-timeout $timeoutLabel --log-file '$logFile' --add-dir '$WorkDir'"
                )
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList $result.commandArgv -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
                $result.exitCode = $cap.ExitCode
                $stdout = ($cap.Stdout ?? '').Trim()
                $stderr = ($cap.Stderr ?? '').Trim()
                $result.output = ($stdout + $(if ($stderr) { "`n$stderr" } else { '' })).Trim()

                if (-not $result.output) {
                    $agyMin = Get-AgyMinRecoveryBytes -UserPrompt $Prompt
                    $agy = Get-AgyConversationResponse -WorkDir $WorkDir -UserPrompt $Prompt -LogFile $logFile
                    if ($agy) {
                        $result.output = $agy.output
                        $result.model = $agy.model
                        $result.modelSource = 'agy-conversation-db'
                        $result.sessionId = $agy.conversationId
                        $recBytes = if ($agy.recoveryBytes) { $agy.recoveryBytes } else { $result.stdoutBytes }
                        $result.captureNote = "agy print mode returns empty stdout on Windows; recovered from conversation DB (${recBytes}b)"
                        if ($agy.conversationId) {
                            $result.captureNote += "; conv=$($agy.conversationId)"
                        }
                        if ($recBytes -lt $agyMin) {
                            $result.captureNote += "; recovery-below-min($agyMin)"
                            $result.exitCode = 2
                            $result.error = "agy DB recovery too short (${recBytes}b < ${agyMin}b)"
                        } elseif ($result.exitCode -ne 0) {
                            $result.exitCode = 0
                        }
                    } else {
                        $result.captureNote = 'agy stdout empty and conversation DB recovery failed'
                    }
                }
                if ($result.output) {
                    Remove-Item $logFile -Force -ErrorAction SilentlyContinue
                }
            }
            'arco' {
                if (-not (Get-Command arco -ErrorAction SilentlyContinue)) { throw 'arco not installed' }
                $result.binary = (Get-Command arco).Source
                $result.version = Get-CliVersion -Lane 'arco' -Binary 'arco'
                $model = $LaneDefaults.arco.model
                $result.commandArgv = @('run', '--task', 'research.quick', '--surface', 'grok-sis', '-m', $model, '--no-history', $Prompt)
                $result.command = "arco $($result.commandArgv -join ' ')"
                $cap = Invoke-ProcessCapture -FilePath 'pwsh' -ArgumentList @('-NoProfile', '-Command', "arco run --task research.quick --surface grok-sis -m '$model' --no-history -- $($Prompt | ConvertTo-Json)") -WorkDir $WorkDir -TimeoutSec $TimeoutSec
                $result.exitCode = $cap.ExitCode
                $result.output = (($cap.Stdout ?? '') + "`n" + ($cap.Stderr ?? '')).Trim()
            }
            'cursor' {
                $result.command = '(manual) Open Cursor in repo — IDE lane has no headless exec'
                $result.output = 'Cursor is an IDE lane. Dispatch skipped; use the editor agent surface directly.'
                $result.exitCode = 0
                $result.ok = $true
                $result.captureNote = 'manual-lane'
                return [pscustomobject]$result
            }
            default { throw "Unknown lane '$Lane'" }
        }

        $parsed = Parse-DispatchMetadata -Lane $Lane -CombinedOutput $result.output
        if ($parsed.model -and $result.modelSource -eq 'default') {
            $result.model = $parsed.model
            $result.modelSource = $parsed.modelSource
        }
        if ($parsed.sessionId) { $result.sessionId = $parsed.sessionId }

        $result.stdoutBytes = [Text.Encoding]::UTF8.GetByteCount(($result.output ?? ''))
        $result.ok = ($result.exitCode -eq 0) -and ([string]::IsNullOrWhiteSpace($result.output) -eq $false -or $Lane -eq 'cursor')
    }
    catch {
        $result.error = $_.Exception.Message
        $result.ok = $false
    }
    finally {
        $sw.Stop()
        $result.elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
    }

    return [pscustomobject]$result
}

function Write-DispatchLedger {
    param($Summary, [string]$Path)
    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $line = ($Summary | ConvertTo-Json -Depth 8 -Compress)
    Add-Content -Path $Path -Value $line -Encoding utf8
}

if ($TaskFile) {
    if (-not (Test-Path $TaskFile)) { throw "TaskFile not found: $TaskFile" }
    $Task = Get-Content -Raw $TaskFile
}

if (-not $Task) {
    $Task = @'
SIS STATUS CHECK (read-only, no edits):
1. git branch and dirty file count
2. package version from package.json if present
3. agent count headline from agents/AGENT_REGISTRY.md
4. skill rules count from skills/skill-rules.json
Reply in under 15 lines with concrete numbers.
'@
}

if ($Lanes.Count -eq 1 -and $Lanes[0] -match ',') {
    $Lanes = $Lanes[0] -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$allLanes = @('grok', 'codex', 'claude', 'opencode', 'deepagent', 'antigravity', 'arco', 'cursor')
if ($Lanes -contains 'all') { $Lanes = $allLanes }

$workDir = Resolve-RepoPath
$started = Get-Date -Format 'o'
$results = @()
$dispatchScript = $MyInvocation.MyCommand.Path

if ($Parallel -and $Lanes.Count -gt 1) {
    $parallelTaskFile = Join-Path $env:TEMP "si-dispatch-task-$PID-$([guid]::NewGuid().ToString('n')).txt"
    [System.IO.File]::WriteAllText($parallelTaskFile, $Task, [System.Text.UTF8Encoding]::new($false))
    $jobs = @()
    foreach ($lane in $Lanes) {
        $receiptFile = Join-Path $env:TEMP "si-dispatch-$lane-$PID-$([guid]::NewGuid().ToString('n')).json"
        $argList = @(
            '-NoProfile', '-File', $dispatchScript,
            '-Lanes', $lane,
            '-Repo', $Repo,
            '-RepoPath', $workDir,
            '-TaskFile', $parallelTaskFile,
            '-TimeoutSec', $TimeoutSec,
            '-ReceiptPath', $receiptFile
        )
        if ($UseArco) { $argList += '-UseArco' }
        $proc = Start-Process -FilePath 'pwsh' -PassThru -NoNewWindow -ArgumentList $argList
        $jobs += [pscustomobject]@{ Lane = $lane; Proc = $proc; Receipt = $receiptFile }
    }
    foreach ($job in $jobs) {
        $job.Proc | Wait-Process
        if (Test-Path $job.Receipt) {
            $payload = Get-Content $job.Receipt -Raw | ConvertFrom-Json
            if ($payload.lanes) { $results += $payload.lanes }
            Remove-Item $job.Receipt -Force -ErrorAction SilentlyContinue
        } else {
            $results += [pscustomobject]@{
                lane = $job.Lane; ok = $false; error = 'parallel receipt missing'
                cli = $null; model = $null; modelSource = 'n/a'; captureNote = $null
            }
        }
    }
    Remove-Item $parallelTaskFile -Force -ErrorAction SilentlyContinue
} else {
    foreach ($lane in $Lanes) {
        $results += Invoke-AgentLane -Lane $lane -WorkDir $workDir -Prompt $Task -TimeoutSec $TimeoutSec -UseArco:$UseArco
    }
}

$summary = [ordered]@{
    dispatchId = [guid]::NewGuid().ToString()
    task       = $Task
    repo       = $Repo
    repoPath   = $workDir
    started    = $started
    completed  = (Get-Date -Format 'o')
    parallel   = [bool]$Parallel
    lanes      = $results
    passed     = @($results | Where-Object { $_.ok }).Count
    failed     = @($results | Where-Object { -not $_.ok }).Count
    activated  = @($results | Where-Object { $_.ok -and $_.captureNote -ne 'manual-lane' } | ForEach-Object { "$($_.lane):$($_.model)" })
    skipped    = @($results | Where-Object { -not $_.ok -or $_.captureNote -eq 'manual-lane' } | ForEach-Object {
        if ($_.captureNote -eq 'manual-lane') { "$($_.lane):manual" } else { "$($_.lane):$($_.error)" }
    })
}

if ($Ledger) { Write-DispatchLedger -Summary $summary -Path $LedgerPath }
if ($ReceiptPath) {
    $summary | ConvertTo-Json -Depth 8 | Set-Content -Path $ReceiptPath -Encoding utf8
}

if ($Json -or $ReceiptPath) {
    if (-not $ReceiptPath) { $summary | ConvertTo-Json -Depth 8 }
} else {
    Write-Host "`n=== /si fanout — $($summary.passed)/$($Lanes.Count) lanes OK ===" -ForegroundColor Cyan
    Write-Host "Dispatch: $($summary.dispatchId)" -ForegroundColor DarkGray
    Write-Host "Repo: $workDir`n"
    foreach ($r in $results) {
        $color = if ($r.ok) { 'Green' } else { 'Red' }
        Write-Host "[$($r.lane)] $($r.elapsed)s exit=$($r.exitCode) model=$($r.model)" -ForegroundColor $color
        if ($r.cli) { Write-Host "  cli=$($r.cli) v=$($r.version) source=$($r.modelSource)" -ForegroundColor DarkGray }
        if ($r.command) { Write-Host "  cmd: $($r.command)" -ForegroundColor DarkGray }
        if ($r.captureNote) { Write-Host "  note: $($r.captureNote)" -ForegroundColor DarkYellow }
        if ($r.error) { Write-Host "  err: $($r.error)" -ForegroundColor Yellow }
        if ($r.output) {
            $tail = ($r.output -split "`n" | Select-Object -Last 12) -join "`n"
            Write-Host $tail
        }
        Write-Host ''
    }
    Write-Host "Activated: $($summary.activated -join ', ')" -ForegroundColor Cyan
    if ($summary.skipped.Count -gt 0) {
        Write-Host "Skipped/failed: $($summary.skipped -join '; ')" -ForegroundColor Yellow
    }
}

if ($summary.failed -gt 0) { exit 1 }
exit 0
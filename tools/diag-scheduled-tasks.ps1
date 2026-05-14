[CmdletBinding()]
param()

# Diagnose what's popping a terminal every minute.
# Lists Starlight/Cockpit/SIS tasks + anything that ran in the last 10 minutes.
# Idempotent — read-only diagnostic, re-run = same result.

$ErrorActionPreference = 'Stop'

Write-Host "`n=== Starlight-pattern tasks ===" -ForegroundColor Cyan
Get-ScheduledTask |
    Where-Object { $_.TaskName -match 'Starlight|Cockpit|SIS|Jarvis|arcanea|Memory|Brain|Vault|cron|dream' } |
    Select-Object TaskName, TaskPath, State |
    Format-Table -AutoSize

Write-Host "`n=== Tasks that ran in last 10 minutes ===" -ForegroundColor Cyan
Get-ScheduledTask | ForEach-Object {
    $info = Get-ScheduledTaskInfo -TaskName $_.TaskName -TaskPath $_.TaskPath -ErrorAction SilentlyContinue
    if ($info -and $info.LastRunTime -gt (Get-Date).AddMinutes(-10)) {
        [PSCustomObject]@{
            Task    = $_.TaskName
            Path    = $_.TaskPath
            LastRun = $info.LastRunTime
            NextRun = $info.NextRunTime
            Result  = $info.LastTaskResult
        }
    }
} | Sort-Object LastRun -Descending | Format-Table -AutoSize

Write-Host "`n=== Tasks with sub-5-minute repetition interval ===" -ForegroundColor Cyan
Get-ScheduledTask | ForEach-Object {
    $task = $_
    foreach ($trigger in $task.Triggers) {
        if ($trigger.Repetition -and $trigger.Repetition.Interval) {
            $iv = $trigger.Repetition.Interval
            # Match PT1M, PT2M, PT5M, etc.
            if ($iv -match '^PT([1-5])M$') {
                [PSCustomObject]@{
                    Task     = $task.TaskName
                    Path     = $task.TaskPath
                    Interval = $iv
                    Action   = ($task.Actions | Select-Object -First 1).Execute
                    Args     = ($task.Actions | Select-Object -First 1).Arguments
                }
            }
        }
    }
} | Format-Table -AutoSize -Wrap

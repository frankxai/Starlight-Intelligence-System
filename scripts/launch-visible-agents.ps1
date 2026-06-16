# C:\Users\frank\Starlight-Intelligence-System\scripts\launch-visible-agents.ps1
#
# Win32 Interactive Desktop Launcher
# Explicitly setslpDesktop = "WinSta0\Default" and creation flags to CREATE_NEW_CONSOLE (0x10)
# to force background service agents to display console windows on the logged-on user's screen.

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$ConfigFile = Join-Path $RepoRoot "memory\agent-sessions.json"
$StatusJsFile = Join-Path $RepoRoot "cockpit\agent-status-data.js"
$Hostname  = $env:COMPUTERNAME

# Load config
if (-not (Test-Path $ConfigFile)) {
    Write-Error "Config file not found at $ConfigFile"
    exit 1
}
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
$machineConfig = $null
if ($config.machines.PSObject.Properties[$Hostname]) {
    $machineConfig = $config.machines.$Hostname
} else {
    $machineConfig = $config.machines.DEFAULT_SECONDARY
}

# 1. Compile C# Win32 CreateProcess wrapper
$csharpCode = @"
using System;
using System.Runtime.InteropServices;

public class InteractiveProcess {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct STARTUPINFO {
        public Int32 cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public Int32 dwX;
        public Int32 dwY;
        public Int32 dwXSize;
        public Int32 dwYSize;
        public Int32 dwXCountChars;
        public Int32 dwYCountChars;
        public Int32 dwFillAttribute;
        public Int32 dwFlags;
        public Int16 wShowWindow;
        public Int16 cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_INFORMATION {
        public IntPtr hProcess;
        public IntPtr hThread;
        public Int32 dwProcessId;
        public Int32 dwThreadId;
    }

    [DllImport("kernel32.dll", EntryPoint = "CreateProcessW", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CreateProcess(
        string lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation
    );
    
    public static int Start(string path, string args, string cwd) {
        STARTUPINFO si = new STARTUPINFO();
        si.cb = Marshal.SizeOf(si);
        si.lpDesktop = "WinSta0\\Default"; // Target physical screen
        si.dwFlags = 0;
        
        PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
        string cmdLine = "\"" + path + "\" " + args;
        
        // CREATE_NEW_CONSOLE = 0x00000010
        bool success = CreateProcess(
            null,
            cmdLine,
            IntPtr.Zero,
            IntPtr.Zero,
            false,
            0x00000010, 
            IntPtr.Zero,
            cwd,
            ref si,
            out pi
        );
        
        if (success) {
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            return pi.dwProcessId;
        } else {
            return -Marshal.GetLastWin32Error();
        }
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);
}
"@

# Avoid recompilation error in same pwsh session
if (-not ([System.Management.Automation.PSTypeName]'InteractiveProcess').Type) {
    Add-Type -TypeDefinition $csharpCode
}

# Resolve pwsh path
$pwshPath = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell.exe).Source
}

Write-Host "Using shell binary: $pwshPath" -ForegroundColor Gray

# 2. Kill existing sessions first
Write-Host "Terminating existing agent sessions..." -ForegroundColor Yellow
pwsh.exe -File "$RepoRoot\scripts\restart-all-agents.ps1" -Action Kill

# 3. Start agents using lpDesktop WinSta0\Default
$statusList = @()
foreach ($repo in $machineConfig.auto_start_repos) {
    Write-Host "Spawning visible shell for $($repo.name) in session desktop..." -ForegroundColor Cyan
    
    $args = "-NoExit -Command `"$($repo.command)`""
    $newPid = [InteractiveProcess]::Start($pwshPath, $args, $repo.path)
    
    if ($newPid -gt 0) {
        Write-Host "  Successfully spawned PID $newPid" -ForegroundColor Green
        $statusList += [ordered]@{
            name = $repo.name
            path = $repo.path
            agent = $repo.agent
            command = $repo.command
            role = $repo.role
            running = $true
            pid = $newPid
            details = "Spawned directly on WinSta0\Default (PID $newPid)"
        }
    } else {
        $err = -$newPid
        Write-Error "  Failed to spawn process for $($repo.name). Win32 Error Code: $err"
        $statusList += [ordered]@{
            name = $repo.name
            path = $repo.path
            agent = $repo.agent
            command = $repo.command
            role = $repo.role
            running = $false
            pid = $null
            details = "Spawn failed with Win32 Error: $err"
        }
    }
}

# 4. Save status JS
$statusData = [ordered]@{
    last_updated = (Get-Date).ToUniversalTime().ToString('o')
    hostname = $Hostname
    machine_role = $machineConfig.role
    machine_description = $machineConfig.description
    agents = $statusList
}
$jsonStr = $statusData | ConvertTo-Json -Depth 6
$jsContent = "window.STARLIGHT_AGENT_STATUS = $jsonStr;"
$jsContent | Set-Content -Path $StatusJsFile -Encoding utf8

Write-Host "Status written to cockpit. Visible launch completed." -ForegroundColor Green

/**
 * Starlight Queen — Process Tree & Safety Shield Manager
 *
 * Discovers running agent processes, constructs parent-child process trees,
 * deterministically shields shared MCP/tool-plane services and terminal shells,
 * and executes targeted, audited stop operations.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { execSync, spawnSync } from 'node:child_process';
import { platform } from 'node:os';
import type { ProcessNode, StopOptions, StopPlan, StopResult } from './types.js';

export interface ProcessQueryOptions {
  toolPlanePorts?: number[];
  filterNames?: string[];
}

export class ProcessTreeManager {
  private static readonly DEFAULT_TOOL_PLANE_PORTS = [7317];

  /**
   * Discovers all relevant agent, tool-plane, and runner processes on the host.
   */
  public static queryProcessTree(options: ProcessQueryOptions = {}): {
    processes: Map<number, ProcessNode>;
    protectedPids: Set<number>;
    toolPlanePids: Set<number>;
  } {
    const isWin = platform() === 'win32';
    const processes = new Map<number, ProcessNode>();
    const protectedPids = new Set<number>();
    const toolPlanePids = new Set<number>();

    // Current process and parent are always protected
    protectedPids.add(process.pid);
    if (process.ppid) protectedPids.add(process.ppid);

    // 1. Detect tool plane listening PIDs (e.g. port 7317)
    const ports = options.toolPlanePorts ?? ProcessTreeManager.DEFAULT_TOOL_PLANE_PORTS;
    for (const port of ports) {
      const portPids = ProcessTreeManager.getPidsForPort(port);
      for (const p of portPids) {
        toolPlanePids.add(p);
        protectedPids.add(p);
      }
    }

    // 2. Query OS processes
    if (isWin) {
      ProcessTreeManager.queryWindowsProcesses(processes);
    } else {
      ProcessTreeManager.queryUnixProcesses(processes);
    }

    // 3. Mark protected processes and their children
    for (const [pid, proc] of processes.entries()) {
      // Mark tool-plane port owners
      if (toolPlanePids.has(pid)) {
        proc.isProtected = true;
        proc.protectionReason = 'Active Starlight tool-plane listener (port 7317)';
        protectedPids.add(pid);
      }

      // Mark MCP servers and skill foundry runtimes
      const cmd = proc.commandLine.toLowerCase();
      if (
        cmd.includes('starlight-memory') ||
        cmd.includes('skill-foundry') ||
        cmd.includes('starlight-department-lab') ||
        cmd.includes('mcp-server') ||
        cmd.includes('agent-orchestrator\\resources\\daemon\\ao.exe') ||
        cmd.includes('claude.exe daemon run')
      ) {
        proc.isProtected = true;
        proc.protectionReason = `Shielded service/daemon: ${proc.name}`;
        protectedPids.add(pid);
      }
    }

    // Cascade protection to all direct children of tool-plane PIDs
    for (const [pid, proc] of processes.entries()) {
      if (protectedPids.has(proc.ppid)) {
        proc.isProtected = true;
        proc.protectionReason = `Child of protected process PID ${proc.ppid}`;
        protectedPids.add(pid);
      }
    }

    // 4. Attach children hierarchies
    for (const proc of processes.values()) {
      if (proc.ppid && processes.has(proc.ppid)) {
        const parent = processes.get(proc.ppid)!;
        if (!parent.children) parent.children = [];
        parent.children.push(proc);
      }
    }

    return { processes, protectedPids, toolPlanePids };
  }

  /**
   * Queries listening TCP ports on Windows/Unix to identify tool plane owners.
   */
  public static getPidsForPort(port: number): number[] {
    const isWin = platform() === 'win32';
    const pids = new Set<number>();

    try {
      if (isWin) {
        // Use PowerShell Get-NetTCPConnection
        const script = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`;
        const out = execSync(`powershell -NoProfile -Command "${script}"`, {
          encoding: 'utf8',
          timeout: 4000,
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        for (const line of out.split(/\r?\n/)) {
          const val = parseInt(line.trim(), 10);
          if (!isNaN(val) && val > 0) pids.add(val);
        }
      } else {
        // Use lsof or netstat
        const out = execSync(`lsof -ti :${port} 2>/dev/null || true`, {
          encoding: 'utf8',
          timeout: 3000,
        });
        for (const line of out.split(/\r?\n/)) {
          const val = parseInt(line.trim(), 10);
          if (!isNaN(val) && val > 0) pids.add(val);
        }
      }
    } catch {
      // Fallback if port inspection is restricted
    }

    return Array.from(pids);
  }

  private static queryWindowsProcesses(processes: Map<number, ProcessNode>): void {
    try {
      // Query Win32_Process via PowerShell JSON output
      const script = `
        Get-CimInstance Win32_Process | 
        Where-Object { 
          $_.Name -match 'codex|claude|opencode|grok|hermes|node|ao|pwsh|powershell|cmd' 
        } | 
        Select-Object ProcessId, ParentProcessId, Name, CommandLine, CreationDate | 
        ConvertTo-Json -Compress -Depth 2
      `;

      const out = execSync(`powershell -NoProfile -Command "${script}"`, {
        encoding: 'utf8',
        timeout: 6000,
        maxBuffer: 10 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (!out) return;

      const raw = JSON.parse(out);
      const items = Array.isArray(raw) ? raw : [raw];

      for (const item of items) {
        const pid = Number(item.ProcessId);
        const ppid = Number(item.ParentProcessId);
        const name = String(item.Name || '');
        const commandLine = String(item.CommandLine || '');
        const creationDate = item.CreationDate ? String(item.CreationDate) : undefined;

        if (pid > 0) {
          processes.set(pid, {
            pid,
            ppid,
            name,
            commandLine,
            creationDate,
            isProtected: false,
          });
        }
      }
    } catch (err) {
      // Fallback: minimal process query if CIM is blocked
    }
  }

  private static queryUnixProcesses(processes: Map<number, ProcessNode>): void {
    try {
      const out = execSync(`ps -eo pid,ppid,comm,args`, {
        encoding: 'utf8',
        timeout: 4000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      const lines = out.split('\n').slice(1);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const pid = parseInt(parts[0], 10);
          const ppid = parseInt(parts[1], 10);
          const name = parts[2];
          const commandLine = parts.slice(3).join(' ');

          if (!isNaN(pid)) {
            processes.set(pid, {
              pid,
              ppid,
              name,
              commandLine,
              isProtected: false,
            });
          }
        }
      }
    } catch {}
  }

  /**
   * Returns all descendants (children, grandchildren, etc.) of a given PID.
   */
  public static getDescendants(rootPid: number, processes: Map<number, ProcessNode>): number[] {
    const result: number[] = [];
    const queue = [rootPid];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = processes.get(current);
      if (node && node.children) {
        for (const child of node.children) {
          result.push(child.pid);
          queue.push(child.pid);
        }
      }
    }

    return result;
  }

  /**
   * Builds an explicit, audited StopPlan for a given session PID.
   */
  public static createStopPlan(
    sessionId: string,
    provider: any,
    targetPid: number,
    processes: Map<number, ProcessNode>,
    protectedPids: Set<number>,
    options: StopOptions = {}
  ): StopPlan {
    const targetNode = processes.get(targetPid);
    if (!targetNode) {
      throw new Error(`Target PID ${targetPid} for session ${sessionId} not found in active process table.`);
    }

    // Check if target PID itself is shielded
    if (protectedPids.has(targetPid) || targetNode.isProtected) {
      throw new Error(
        `SAFETY REFUSAL: Target PID ${targetPid} is protected (${targetNode.protectionReason || 'Shielded tool-plane or daemon'}). Refusing stop plan.`
      );
    }

    // Collect target and all descendants
    const descendants = ProcessTreeManager.getDescendants(targetPid, processes);
    const candidatePids = [targetPid, ...descendants];

    const targetPids: number[] = [];
    const protectedPidsShielded: number[] = [];
    const commandLines: string[] = [];

    for (const pid of candidatePids) {
      const node = processes.get(pid);
      if (node) {
        if (protectedPids.has(pid) || node.isProtected) {
          protectedPidsShielded.push(pid);
        } else {
          targetPids.push(pid);
          commandLines.push(`PID ${pid} [${node.name}]: ${node.commandLine.slice(0, 100)}`);
        }
      }
    }

    // Find ancestors (parent terminal / shell) to explicitly preserve
    const ancestorPidsPreserved: number[] = [];
    let curPpid = targetNode.ppid;
    while (curPpid && processes.has(curPpid)) {
      ancestorPidsPreserved.push(curPpid);
      const parent = processes.get(curPpid);
      curPpid = parent?.ppid || 0;
    }

    return {
      targetSessionId: sessionId,
      provider,
      targetPids,
      protectedPidsShielded,
      ancestorPidsPreserved,
      commandLines,
      gracefulMethod: platform() === 'win32' ? 'wm_close' : 'sigint',
      forceRequired: options.force === true,
      isDryRun: options.dryRun === true,
      authorized: true,
      rationale: `Targeted session ${sessionId} on PID ${targetPid} with ${targetPids.length} process tree member(s). Ancestors and shielded tool plane preserved.`,
    };
  }

  /**
   * Executes a StopPlan safely with graceful timeout and verification.
   */
  public static executeStop(plan: StopPlan, timeoutMs: number = 3000): StopResult {
    const startTime = Date.now();
    const stoppedPids: number[] = [];
    const remainingPids: number[] = [];

    if (plan.isDryRun) {
      return {
        success: true,
        targetSessionId: plan.targetSessionId,
        stoppedPids: [],
        remainingPids: plan.targetPids,
        methodUsed: 'dry_run_preview',
        durationMs: Date.now() - startTime,
      };
    }

    const isWin = platform() === 'win32';

    // 1. Send graceful termination to targeted PIDs (bottom-up: children first, then root)
    const reversedPids = [...plan.targetPids].reverse();

    for (const pid of reversedPids) {
      try {
        if (isWin) {
          // Graceful taskkill (without /f sends WM_CLOSE / WM_QUIT)
          spawnSync('taskkill', ['/pid', String(pid)], { timeout: 2000, stdio: 'ignore' });
        } else {
          process.kill(pid, 'SIGTERM');
        }
      } catch {
        // Process may already have terminated
      }
    }

    // 2. Poll up to timeoutMs for graceful exit
    const pollInterval = 250;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      let anyAlive = false;
      for (const pid of plan.targetPids) {
        if (ProcessTreeManager.isProcessAlive(pid)) {
          anyAlive = true;
          break;
        }
      }
      if (!anyAlive) break;
      ProcessTreeManager.sleepMs(pollInterval);
    }

    // 3. Verify which processes exited and which remain
    for (const pid of plan.targetPids) {
      if (ProcessTreeManager.isProcessAlive(pid)) {
        remainingPids.push(pid);
      } else {
        stoppedPids.push(pid);
      }
    }

    // 4. If force is requested and some remain alive, terminate forcefully
    let methodUsed = 'graceful_wm_close';
    if (remainingPids.length > 0 && plan.forceRequired) {
      methodUsed = 'force_taskkill';
      const toForce = [...remainingPids];
      for (const pid of toForce) {
        try {
          if (isWin) {
            spawnSync('taskkill', ['/f', '/pid', String(pid)], { timeout: 2000, stdio: 'ignore' });
          } else {
            process.kill(pid, 'SIGKILL');
          }
          ProcessTreeManager.sleepMs(100);
          if (!ProcessTreeManager.isProcessAlive(pid)) {
            stoppedPids.push(pid);
            const idx = remainingPids.indexOf(pid);
            if (idx >= 0) remainingPids.splice(idx, 1);
          }
        } catch {}
      }
    }

    return {
      success: remainingPids.length === 0,
      targetSessionId: plan.targetSessionId,
      stoppedPids,
      remainingPids,
      methodUsed,
      durationMs: Date.now() - startTime,
    };
  }

  public static isProcessAlive(pid: number): boolean {
    try {
      // In Node.js, process.kill(pid, 0) checks existence without sending a signal
      return process.kill(pid, 0);
    } catch (e: any) {
      return e.code === 'EPERM'; // EPERM means process exists but we lack permission to signal
    }
  }

  private static sleepMs(ms: number): void {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
  }
}

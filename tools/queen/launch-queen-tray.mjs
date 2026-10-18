#!/usr/bin/env node
/**
 * Starlight Queen v3.5 — System Tray + Cloudflare Void Edge + Frameless App Launcher
 * Provenance: 2026-10-19__[Antigravity-Gemini3.1Pro]__Queen-Tray-Void-Launcher
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { CloudflareVoidGateway } from '../../src/queen/cloudflare-void-gateway.ts';

const WORKSPACE_ROOT = process.cwd();
const PORT = Number(process.env.QUEEN_PORT || 4329);
const STARLIGHT_DIR = path.join(WORKSPACE_ROOT, '.starlight');

async function ensureQueenServerRunning(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/queen/machine/overview`, {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      return { startedNew: false, url: `http://127.0.0.1:${port}` };
    }
  } catch {
    // Either server isn't running or doesn't have the new /api/queen/machine/overview route yet
  }

  // Check if an older server is listening on port 4329 and replace it cleanly
  try {
    const netstat = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      windowsHide: true,
    });
    const lines = netstat.split(/\r?\n/).filter((l) => l.includes('LISTENING'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (pid && pid !== process.pid) {
        try {
          process.kill(pid);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // No existing listener
  }

  const child = spawn(
    process.execPath,
    ['--import', 'tsx', 'src/queen/server.ts', `--port=${port}`],
    {
      cwd: WORKSPACE_ROOT,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }
  );
  child.unref();

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/queen/machine/overview`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return { startedNew: true, pid: child.pid, url: `http://127.0.0.1:${port}` };
      }
    } catch {
      // retry
    }
  }

  return { startedNew: true, pid: child.pid, url: `http://127.0.0.1:${port}` };
}

function launchWindowsTrayCompanion(port) {
  const psScript = path.join(WORKSPACE_ROOT, 'tools', 'queen', 'starlight-queen-tray.ps1');
  const trayStatusPath = path.join(STARLIGHT_DIR, 'queen-tray-status.json');

  if (fs.existsSync(trayStatusPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(trayStatusPath, 'utf8'));
      if (existing.pid) {
        try {
          process.kill(existing.pid, 0);
          return { alreadyRunning: true, pid: existing.pid, statusPath: trayStatusPath };
        } catch {
          // stale pid
        }
      }
    } catch {
      // ignore
    }
  }

  const child = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-WindowStyle',
      'Hidden',
      '-File',
      psScript,
      '-Port',
      String(port),
      '-WorkspaceRoot',
      WORKSPACE_ROOT,
    ],
    {
      cwd: WORKSPACE_ROOT,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }
  );
  child.unref();

  return { alreadyRunning: false, pid: child.pid, statusPath: trayStatusPath };
}

async function main() {
  fs.mkdirSync(STARLIGHT_DIR, { recursive: true });

  console.log('[1/4] Ensuring Starlight Queen Server (:4329) is online with Machine Commander...');
  const serverInfo = await ensureQueenServerRunning(PORT);
  console.log(`      -> Server active at ${serverInfo.url} (startedNew=${serverInfo.startedNew})`);

  console.log('[2/4] Starting Cloudflare Void Edge Tunnel (https://*.trycloudflare.com)...');
  const voidGateway = new CloudflareVoidGateway(WORKSPACE_ROOT, PORT);
  let voidStatus;
  try {
    const voidRes = await fetch(`http://127.0.0.1:${PORT}/api/queen/void-tunnel/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(12000),
    });
    const voidData = await voidRes.json();
    voidStatus = voidData.tunnelStatus || voidGateway.getTunnelStatus(PORT);
  } catch {
    voidStatus = await voidGateway.startQuickTunnel(PORT);
  }
  console.log(`      -> Void Edge URL: ${voidStatus.publicHttpsUrl || voidStatus.edgeHttpsUrl || 'LOCAL_ONLY'} (PID=${voidStatus.tunnelPid || voidStatus.pid})`);

  console.log('[3/4] Launching Native Windows System Tray Companion (NotifyIcon)...');
  const trayInfo = launchWindowsTrayCompanion(PORT);
  await new Promise((r) => setTimeout(r, 1200));
  console.log(`      -> Windows System Tray active (PID=${trayInfo.pid})`);

  const openFrameless = !process.argv.includes('--no-window');
  let appLaunch = null;
  if (openFrameless) {
    console.log('[4/4] Opening Frameless Native OS App Window (--app=)...');
    appLaunch = voidGateway.launchFramelessDesktopApp(
      `http://127.0.0.1:${PORT}/cosmos`,
      'Starlight Queen — Embodied Sovereign OS'
    );
    console.log(`      -> Frameless App launched via ${appLaunch.browserBinary} (PID=${appLaunch.pid})`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        server: serverInfo,
        cloudflareVoid: voidStatus,
        windowsTray: trayInfo,
        framelessApp: appLaunch,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('[launch-queen-tray] Error:', err);
  process.exit(1);
});

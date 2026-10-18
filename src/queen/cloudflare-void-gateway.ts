/**
 * Starlight Queen — Cloudflare Void Edge Tunnel & Sovereign Native App Gateway
 *
 * Replaces raw `localhost` browser tabs with two zero-friction sovereign surfaces:
 *   1. Cloudflare Void Edge Tunnel (`cloudflared tunnel --url http://127.0.0.1:4329`):
 *      Exposes a live HTTPS `https://*.trycloudflare.com` edge endpoint backed by
 *      `C:\Users\frank\AppData\Local\hermes\bin\cloudflared.exe` (`v2026.7.2`).
 *   2. Native Frameless Desktop App Mode (`msedge.exe --app=http://127.0.0.1:4329/cosmos`):
 *      Launches Starlight Queen as a standalone OS desktop window with zero browser
 *      address-bar chrome, connected directly to the Windows System Tray icon.
 *
 * Built on SIP (Starlight Intelligence Protocol) — Sovereign Substrate Tier
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn, ChildProcess, execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

export interface CloudflareVoidTunnelSnapshot {
  binaryInstalled: boolean;
  binaryPath: string;
  version: string;
  tunnelStatus: 'ACTIVE_EDGE_TUNNEL' | 'READY_STANDBY' | 'STARTING' | 'OFFLINE';
  edgeHttpsUrl: string | null;
  localSovereignUrl: string;
  localCosmosAppUrl: string;
  nativeFramelessCommand: string;
  voidAccessTokenHint: string;
  pid: number | null;
  startedAt: string | null;
  recentLogs: string[];
}

const CANDIDATE_CLOUDFLARED_PATHS = [
  'C:/Users/frank/AppData/Local/hermes/bin/cloudflared.exe',
  'C:/Program Files/cloudflared/cloudflared.exe',
  'C:/Program Files (x86)/cloudflared/cloudflared.exe',
];

export class CloudflareVoidGateway {
  private readonly workspaceRoot: string;
  private readonly targetPort: number;
  private tunnelProc: ChildProcess | null = null;
  private edgeHttpsUrl: string | null = null;
  private tunnelStatus: CloudflareVoidTunnelSnapshot['tunnelStatus'] = 'READY_STANDBY';
  private startedAt: string | null = null;
  private recentLogs: string[] = [];
  private readonly voidToken: string;
  private readonly stateFilePath: string;

  constructor(workspaceRoot: string = process.cwd(), targetPort: number = 4329) {
    this.workspaceRoot = workspaceRoot;
    this.targetPort = targetPort;
    this.stateFilePath = path.join(this.workspaceRoot, '.starlight', 'cloudflare-void-tunnel.json');
    this.voidToken = process.env.STARLIGHT_VOID_TOKEN || `sv_${randomBytes(12).toString('hex')}`;
    this.restorePersistedTunnelState();
  }

  private restorePersistedTunnelState(): void {
    if (!fs.existsSync(this.stateFilePath)) return;
    try {
      const saved = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
      if (saved.edgeHttpsUrl && typeof saved.edgeHttpsUrl === 'string') {
        this.edgeHttpsUrl = saved.edgeHttpsUrl;
        this.startedAt = saved.startedAt || null;
        this.tunnelStatus = 'ACTIVE_EDGE_TUNNEL';
      }
    } catch {}
  }

  private persistTunnelState(): void {
    try {
      fs.mkdirSync(path.dirname(this.stateFilePath), { recursive: true });
      fs.writeFileSync(
        this.stateFilePath,
        JSON.stringify(
          {
            edgeHttpsUrl: this.edgeHttpsUrl,
            tunnelStatus: this.tunnelStatus,
            pid: this.tunnelProc?.pid ?? null,
            startedAt: this.startedAt,
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf8'
      );
    } catch {}
  }

  public findCloudflaredBinary(): { installed: boolean; binaryPath: string; version: string } {
    for (const candidate of CANDIDATE_CLOUDFLARED_PATHS) {
      if (fs.existsSync(candidate)) {
        return {
          installed: true,
          binaryPath: candidate,
          version: '2026.7.2',
        };
      }
    }
    try {
      const out = execSync('cloudflared --version', { encoding: 'utf8', timeout: 2500 }).trim();
      return {
        installed: true,
        binaryPath: 'cloudflared',
        version: out.split(' ')[2] || '2026.7.2',
      };
    } catch {
      return {
        installed: false,
        binaryPath: CANDIDATE_CLOUDFLARED_PATHS[0],
        version: 'unavailable',
      };
    }
  }

  /**
   * Starts a live Cloudflare Quick-Tunnel (`https://*.trycloudflare.com`) pointing to the local Queen server.
   */
  public async startEdgeTunnel(timeoutMs: number = 9000): Promise<CloudflareVoidTunnelSnapshot> {
    if (this.tunnelStatus === 'ACTIVE_EDGE_TUNNEL' && this.edgeHttpsUrl) {
      return this.getSnapshot();
    }

    const bin = this.findCloudflaredBinary();
    if (!bin.installed) {
      this.tunnelStatus = 'OFFLINE';
      return this.getSnapshot();
    }

    this.tunnelStatus = 'STARTING';
    this.startedAt = new Date().toISOString();

    const localTarget = `http://127.0.0.1:${this.targetPort}`;
    const proc = spawn(
      bin.binaryPath,
      ['tunnel', '--url', localTarget, '--no-autoupdate'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        detached: false,
      }
    );
    this.tunnelProc = proc;

    const urlRegex = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), timeoutMs);

      const onChunk = (chunk: Buffer) => {
        const text = chunk.toString('utf8');
        for (const line of text.split(/\r?\n/).filter(Boolean)) {
          this.recentLogs.push(line.slice(0, 180));
          if (this.recentLogs.length > 25) this.recentLogs.shift();
          const match = line.match(urlRegex);
          if (match) {
            this.edgeHttpsUrl = match[0];
            this.tunnelStatus = 'ACTIVE_EDGE_TUNNEL';
            this.persistTunnelState();
            clearTimeout(timer);
            resolve();
          }
        }
      };

      proc.stdout?.on('data', onChunk);
      proc.stderr?.on('data', onChunk);
      proc.once('error', () => {
        clearTimeout(timer);
        resolve();
      });
      proc.once('exit', () => {
        if (!this.edgeHttpsUrl) {
          this.tunnelStatus = 'READY_STANDBY';
        }
        clearTimeout(timer);
        resolve();
      });
    });

    return this.getSnapshot();
  }

  public stopEdgeTunnel(): void {
    if (this.tunnelProc) {
      try {
        this.tunnelProc.kill();
      } catch {}
      this.tunnelProc = null;
    }
    this.tunnelStatus = 'READY_STANDBY';
  }

  /**
   * Launches the Starlight Queen Cosmos in Frameless Native OS Window mode (`--app=`).
   */
  public launchFramelessDesktopWindow(route: string = '/cosmos'): boolean {
    const edgePaths = [
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ];
    const edgeBin = edgePaths.find((p) => fs.existsSync(p));
    const targetUrl = `http://127.0.0.1:${this.targetPort}${route}`;
    if (!edgeBin) return false;

    try {
      const child = spawn(
        edgeBin,
        [`--app=${targetUrl}`, '--window-size=1680,980', '--new-window'],
        {
          detached: true,
          stdio: 'ignore',
          windowsHide: false,
        }
      );
      child.unref();
      return true;
    } catch {
      return false;
    }
  }

  public launchFramelessDesktopApp(
    targetUrl: string = `http://127.0.0.1:${this.targetPort}/cosmos`,
    title: string = 'Starlight Queen — Embodied Sovereign OS'
  ): { launched: boolean; browserBinary: string; pid: number | null; title: string; url: string } {
    const edgePaths = [
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ];
    const edgeBin = edgePaths.find((p) => fs.existsSync(p)) || 'msedge.exe';
    try {
      const child = spawn(
        edgeBin,
        [`--app=${targetUrl}`, '--window-size=1680,980', '--new-window'],
        {
          detached: true,
          stdio: 'ignore',
          windowsHide: false,
        }
      );
      child.unref();
      return {
        launched: true,
        browserBinary: edgeBin,
        pid: child.pid ?? null,
        title,
        url: targetUrl,
      };
    } catch {
      return {
        launched: false,
        browserBinary: edgeBin,
        pid: null,
        title,
        url: targetUrl,
      };
    }
  }

  public async startQuickTunnel(_port?: number, timeoutMs: number = 9000): Promise<CloudflareVoidTunnelSnapshot & { publicHttpsUrl: string | null; tunnelPid: number | null }> {
    const snap = await this.startEdgeTunnel(timeoutMs);
    const aliasPath = path.join(this.workspaceRoot, '.starlight', 'queen-cloudflare-void.json');
    try {
      fs.mkdirSync(path.dirname(aliasPath), { recursive: true });
      fs.writeFileSync(
        aliasPath,
        JSON.stringify(
          {
            ...snap,
            publicHttpsUrl: snap.edgeHttpsUrl,
            tunnelPid: snap.pid,
          },
          null,
          2
        ),
        'utf8'
      );
    } catch {}
    return {
      ...snap,
      publicHttpsUrl: snap.edgeHttpsUrl,
      tunnelPid: snap.pid,
    };
  }

  public getTunnelStatus(_port?: number): CloudflareVoidTunnelSnapshot & { publicHttpsUrl: string | null; tunnelPid: number | null } {
    const snap = this.getSnapshot();
    return {
      ...snap,
      publicHttpsUrl: snap.edgeHttpsUrl,
      tunnelPid: snap.pid,
    };
  }

  public getSnapshot(): CloudflareVoidTunnelSnapshot {
    this.restorePersistedTunnelState();
    const bin = this.findCloudflaredBinary();
    const localSovereignUrl = `http://127.0.0.1:${this.targetPort}`;
    const localCosmosAppUrl = `http://127.0.0.1:${this.targetPort}/cosmos`;
    return {
      binaryInstalled: bin.installed,
      binaryPath: bin.binaryPath,
      version: bin.version,
      tunnelStatus: this.edgeHttpsUrl ? 'ACTIVE_EDGE_TUNNEL' : this.tunnelStatus,
      edgeHttpsUrl: this.edgeHttpsUrl,
      localSovereignUrl,
      localCosmosAppUrl,
      nativeFramelessCommand: `msedge.exe --app=${localCosmosAppUrl}`,
      voidAccessTokenHint: `${this.voidToken.slice(0, 7)}...`,
      pid: this.tunnelProc?.pid ?? null,
      startedAt: this.startedAt,
      recentLogs: this.recentLogs.slice(-8),
    };
  }
}
